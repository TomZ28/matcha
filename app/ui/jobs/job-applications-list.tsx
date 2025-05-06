'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { EnvelopeIcon, CalendarIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useDebouncedCallback } from 'use-debounce';
import { useInView } from 'react-intersection-observer';
import { fetchPaginatedApplicationsByJobId } from '@/app/lib/data';
import { formatDateTime } from '@/app/lib/utils';
import UserAvatar from '@/app/ui/user-avatar';

interface Applicant {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string | null;
}

interface JobApplication {
  id: string;
  jobid: string;
  userid: string;
  application_status: string;
  application_date: string;
  match_percent?: number;
  applicant?: Applicant;
  job?: {
    id: string;
    title: string;
    location: string;
    description: string;
  };
  company?: {
    id: string;
    company_name: string;
    logo_url: string | null;
  };
}

interface JobApplicationsListProps {
  jobId: string;
  initialApplications: JobApplication[];
  defaultSort?: string;
}

export default function JobApplicationsList({ 
  jobId, 
  initialApplications = [],
  defaultSort = 'date'
}: JobApplicationsListProps) {
  // Ensure we have a valid array even if initialApplications is null or undefined
  const safeInitialApplications = Array.isArray(initialApplications) ? initialApplications : [];
  
  const [applications, setApplications] = useState<JobApplication[]>(safeInitialApplications);
  const [page, setPage] = useState(1); // Start at page 1 since we're loading everything client-side
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(safeInitialApplications.length === 0);
  const [initialLoading, setInitialLoading] = useState(safeInitialApplications.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [shouldRefresh, setShouldRefresh] = useState(false);
  
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const { ref, inView } = useInView();
  
  const query = searchParams.get('query') || '';
  const sort = searchParams.get('sort') || defaultSort;
  
  const sortBy = sort === 'match' ? 'match_percent' : 'application_date';
  const sortOrder = sort === 'oldest' ? 'asc' : 'desc';
  
  // Search functionality
  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }
    
    replace(`${pathname}?${params.toString()}`);
  }, 300);
  
  // Sort functionality
  const handleSort = (newSort: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', newSort);
    replace(`${pathname}?${params.toString()}`);
  };
  
  // Load applications data
  async function loadMoreApplications() {
    if (loading || !hasMore || initialLoading) return;
    
    setLoading(true);
    setError(null);
    try {
      const fetchedApplications = await fetchPaginatedApplicationsByJobId(
        jobId, 
        page, 
        6, 
        sortBy as 'application_date' | 'match_percent',
        sortOrder as 'asc' | 'desc',
        query
      );
      
      // Ensure we got an array back
      const safeApplications = Array.isArray(fetchedApplications) ? fetchedApplications : [];
      
      if (safeApplications.length === 0) {
        setHasMore(false);
      } else {
        setApplications(prev => [...prev, ...safeApplications]);
        
        if (safeApplications.length < 6) {
          setHasMore(false);
        } else {
          setPage(prevPage => prevPage + 1);
        }
      }
    } catch (err) {
      console.error('Error loading applications:', err);
      setError('Failed to load applications. Please try again.');
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }
  
  // Reset when query or sort changes
  useEffect(() => {
    // Reset everything when params change
    if (sort !== defaultSort || query !== '') {
      setApplications([]);
      setPage(1);
      setHasMore(true);
      setLoading(true);
      setInitialLoading(true);
      setError(null);
    }
  }, [query, sort, defaultSort]);

  // Load initial data when component mounts
  useEffect(() => {
    const loadInitialApplications = async () => {
      if (!initialLoading) return;
      
      setLoading(true);
      setError(null);
      try {
        const fetchedApplications = await fetchPaginatedApplicationsByJobId(
          jobId, 
          1, // First page
          6, 
          sortBy as 'application_date' | 'match_percent',
          sortOrder as 'asc' | 'desc',
          query
        );
        
        // Ensure we got an array back
        const safeApplications = Array.isArray(fetchedApplications) ? fetchedApplications : [];
        
        setApplications(safeApplications);
        setHasMore(safeApplications.length >= 6);
        setPage(2); // Next load will be page 2
        setInitialLoading(false);
      } catch (err) {
        console.error('Error loading initial applications:', err);
        setError('Failed to load applications. Please try again.');
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };

    loadInitialApplications();
  }, [query, sort, jobId, sortBy, sortOrder, initialLoading]);
  
  // Load more when reaching the end of the page
  useEffect(() => {
    if (inView) {
      if (hasMore && !loading && !initialLoading) {
        loadMoreApplications();
      }
    }
  }, [inView, hasMore, loading, initialLoading]);
  
  return (
    <div>
      {/* Search and Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
        <div className="relative w-full sm:max-w-xs">
          <label htmlFor="search" className="sr-only">
            Search applications
          </label>
          <input
            type="text"
            id="search"
            className="block w-full rounded-lg border border-gray-300 py-2.5 pl-10 text-sm focus:border-[#44624a] focus:ring-1 focus:ring-[#44624a]"
            placeholder="Search applicants..."
            onChange={(e) => handleSearch(e.target.value)}
            defaultValue={query}
          />
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label htmlFor="sort" className="text-sm font-medium text-gray-700">
            Sort by:
          </label>
          <select
            id="sort"
            className="rounded-lg border border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-[#44624a] focus:ring-1 focus:ring-[#44624a]"
            value={sort}
            onChange={(e) => handleSort(e.target.value)}
          >
            <option value="date">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="match">Match Percentage</option>
          </select>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {/* Initial loading indicator */}
      {initialLoading && (
        <div className="flex justify-center items-center py-20">
          <div className="w-12 h-12 border-t-2 border-[#8ba888] rounded-full animate-spin"></div>
          <p className="ml-4 text-gray-600">Loading applications...</p>
        </div>
      )}
      
      {/* Applications Grid */}
      {!initialLoading && applications.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-700 mb-2">No applications yet</h3>
          <p className="text-gray-500">
            There are no applications for this job posting yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications.map((application) => (
            <Link 
              key={application.id} 
              href={`/dashboard/applications/${application.id}`}
              className="group"
            >
              <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 transition-all hover:shadow-lg hover:border-[#8ba888] group-hover:translate-y-[-2px]">
                <div className="p-6">
                  {/* Header with avatar and match */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-shrink-0 relative w-16 h-16 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                      <UserAvatar
                        firstName={application.applicant?.first_name}
                        lastName={application.applicant?.last_name}
                        avatarUrl={application.applicant?.avatar_url}
                        size="md"
                        className="w-full h-full"
                      />
                    </div>
                    
                    <div className="px-3 py-1 bg-[#f0f5f1] rounded-full">
                      <div className="text-[#44624a] font-medium text-sm">
                        {application.match_percent || 75}% Match
                      </div>
                    </div>
                  </div>
                  
                  {/* Applicant details */}
                  <h3 className="text-lg font-medium text-gray-800 mb-1 group-hover:text-[#44624a]">
                    {application.applicant?.first_name || 'Unknown'} {application.applicant?.last_name || ''}
                  </h3>
                  
                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="truncate">{application.applicant?.email || 'No email provided'}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <span>Applied {application.application_date ? formatDateTime(application.application_date) : 'Unknown date'}</span>
                  </div>
                  
                  {/* Status badge */}
                  <div className="mt-4">
                    <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                      application.application_status === 'applied' ? 'bg-amber-100 text-amber-800' : 
                      application.application_status === 'interview' ? 'bg-blue-100 text-blue-800' :
                      application.application_status === 'not selected' || application.application_status === 'withdrawn' ? 'bg-red-100 text-red-800' :
                      application.application_status === 'offer' ? 'bg-green-100 text-green-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {application.application_status ? 
                        application.application_status.charAt(0).toUpperCase() + application.application_status.slice(1) : 
                        'Applied'}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      
      {/* Loading indicator and infinite scroll trigger */}
      {hasMore && !initialLoading && (
        <div ref={ref} className="flex justify-center mt-8">
          {loading ? (
            <div className="w-8 h-8 border-t-2 border-[#8ba888] rounded-full animate-spin"></div>
          ) : (
            <div className="animate-pulse flex space-x-2 items-center">
              <div className="h-2 w-2 bg-[#44624a] rounded-full"></div>
              <div className="h-2 w-2 bg-[#44624a] rounded-full"></div>
              <div className="h-2 w-2 bg-[#44624a] rounded-full"></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 
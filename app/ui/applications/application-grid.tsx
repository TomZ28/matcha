'use client';

import { fetchPaginatedApplicationsByUser } from '@/app/lib/data';
import { inter } from '@/app/ui/fonts';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import StatusProgressBar from './status-progress-bar';
import { useDebouncedCallback } from 'use-debounce';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import CompanyLogo from '@/app/ui/company-logo';

interface ApplicationGridProps {
  initialApplications: any[];
  userId: string;
  defaultSort?: string;
}

export default function ApplicationGrid({ 
  initialApplications, 
  userId,
  defaultSort = 'date' 
}: ApplicationGridProps) {
  const [applications, setApplications] = useState(initialApplications);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(initialApplications.length === 0);
  const [error, setError] = useState<string | null>(null);

  const { ref, inView } = useInView({
    rootMargin: '100px',
  });

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  
  const query = searchParams.get('query') || '';
  const sort = searchParams.get('sort') || defaultSort;
  
  // Determine sort parameters based on sort value
  const sortBy = sort === 'match' ? 'match_percent' : 'application_date';
  const sortOrder = sort === 'oldest' ? 'asc' : 'desc';

  // Search functionality
  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    
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

  // Load initial data when component mounts
  useEffect(() => {
    const loadInitialApplications = async () => {
      if (!initialLoading) return;
      
      setLoading(true);
      setError(null);
      try {
        // Use the updated function with all parameters
        const fetchedApplications = await fetchPaginatedApplicationsByUser(
          userId, 
          query, 
          1, // First page
          12, // Load 2 pages worth initially
          sortBy,
          sortOrder
        );
        
        setApplications(fetchedApplications);
        setHasMore(fetchedApplications.length >= 12);
        setPage(3); // Next load will be page 3
        setInitialLoading(false);
      } catch (error) {
        console.error('Error fetching initial applications:', error);
        setError('Failed to load applications. Please try again.');
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };

    loadInitialApplications();
  }, [query, userId, sortBy, sortOrder, initialLoading]);

  // Reset states when query or sort changes
  useEffect(() => {
    setApplications([]);
    setPage(1);
    setHasMore(true);
    setLoading(true);
    setInitialLoading(true);
    setError(null);
  }, [query, sort]);

  // Load more applications when user scrolls to bottom
  const loadMoreApplications = async () => {
    if (loading || !hasMore || initialLoading) return;
    
    setLoading(true);
    try {
      // Use the updated function with all parameters
      const newApplications = await fetchPaginatedApplicationsByUser(
        userId, 
        query, 
        page,
        6,
        sortBy,
        sortOrder
      );
      
      if (newApplications.length === 0) {
        setHasMore(false);
      } else {
        setApplications(prev => [...prev, ...newApplications]);
        
        if (newApplications.length < 6) {
          setHasMore(false);
        } else {
          setPage(prevPage => prevPage + 1);
        }
      }
    } catch (error) {
      console.error('Error fetching more applications:', error);
      setError('Failed to load more applications. Please try again.');
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  // Load more when reaching the end of the page
  useEffect(() => {
    if (inView && hasMore && !loading && !initialLoading) {
      loadMoreApplications();
    }
  }, [inView, hasMore, loading, initialLoading]);

  return (
    <div className="w-full">
      <h1 className={`${inter.className} font-semibold mb-8 text-xl md:text-2xl text-[#44624a]`}>
        My Applications
      </h1>
      
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
            placeholder="Search by job title or company..."
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
      {initialLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-12 h-12 border-t-2 border-[#8ba888] rounded-full animate-spin"></div>
          <p className="ml-4 text-gray-600">Loading applications...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No applications found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {applications.map((application) => (
            <Link 
              key={application.id} 
              href={`/dashboard/applications/${application.id}`}
              className="block transition-transform hover:scale-105"
            >
              <div className="bg-white shadow-md rounded-lg overflow-hidden border border-[#c0cfb2] h-full flex flex-col hover:shadow-lg">
                <div className="p-4 bg-[#44624a]">
                  <div className="flex justify-between items-center">
                    <h2 className="text-white font-semibold text-lg truncate mr-3">
                      {application.job?.title || 'Job Title'}
                    </h2>
                    {application.match_percent && (
                      <div className="px-3 py-1 rounded-full text-sm font-medium bg-[#c0cfb2] text-[#44624a]">
                        {application.match_percent}% Match
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-4 flex-grow">
                  <div className="flex items-center gap-3 mb-1">
                    <CompanyLogo
                      logoUrl={application.company?.logo_url}
                      companyName={application.company?.company_name}
                      size="sm"
                      className="bg-white p-1 border border-gray-200"
                    />
                    <div>
                      <h3 className="font-medium text-[#44624a]">
                        {application.company?.company_name || 'Company Name'}
                      </h3>
                    </div>
                  </div>
                  
                  {/* Status Progress Bar */}
                  <StatusProgressBar 
                    status={application.application_status} 
                    date={application.application_date} 
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      
      {hasMore && (
        <div ref={ref} className="flex justify-center mt-8 mb-6">
          {loading && !initialLoading ? (
            <div className="w-8 h-8 border-t-2 border-[#8ba888] rounded-full animate-spin"></div>
          ) : (
            <div className="h-10"></div> 
          )}
        </div>
      )}
    </div>
  );
} 
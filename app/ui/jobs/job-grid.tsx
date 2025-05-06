'use client';

import { FormattedJobsTable } from '@/app/lib/definitions';
import { fetchPaginatedJobs, fetchPaginatedJobsByCompany } from '@/app/lib/data';
import { inter } from '@/app/ui/fonts';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { MagnifyingGlassIcon, MapPinIcon, BriefcaseIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { useDebouncedCallback } from 'use-debounce';

interface JobGridProps {
  initialJobs: FormattedJobsTable[];
  companyId?: string;
  companyName?: string;
  defaultSort?: string;
}

export default function JobGrid({ 
  initialJobs, 
  companyId, 
  companyName,
  defaultSort = 'newest' 
}: JobGridProps) {
  const [jobs, setJobs] = useState<FormattedJobsTable[]>(initialJobs);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(initialJobs.length === 0);
  const [error, setError] = useState<string | null>(null);
  
  const { ref, inView } = useInView({
    rootMargin: '100px',
  });
  
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  
  const query = searchParams.get('query') || '';
  const sort = searchParams.get('sort') || defaultSort;
  
  const sortBy = sort === 'match' ? 'match_percent' : 'posted_date';
  const sortOrder = sort === 'oldest' ? 'asc' : 'desc';

  const titleText = companyName ? `Jobs at ${companyName}` : 'Job Openings';
  const searchPlaceholder = companyName 
    ? `Search ${companyName} jobs...` 
    : 'Search jobs by title or description...';

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

  // Load initial data effect
  useEffect(() => {
    const loadInitialJobs = async () => {
      if (!initialLoading) return;
      
      setLoading(true);
      setError(null);
      try {
        // Use company-specific function if companyId is provided
        const fetchedJobs = companyId 
          ? await fetchPaginatedJobsByCompany(
              companyId, 
              query, 
              1, // First page
              12, // Load 2 pages worth initially
              sortBy as 'posted_date' | 'match_percent', 
              sortOrder as 'asc' | 'desc'
            )
          : await fetchPaginatedJobs(
              query, 
              1, // First page
              12, // Load 2 pages worth initially
              sortBy as 'posted_date' | 'match_percent', 
              sortOrder as 'asc' | 'desc'
            );
        
        // Deduplicate jobs by ID to ensure we don't have duplicates in the initial load
        const uniqueJobs = Array.from(
          new Map(fetchedJobs.map((job: FormattedJobsTable) => [job.id, job])).values()
        ) as FormattedJobsTable[];
        
        setJobs(uniqueJobs);
        setHasMore(fetchedJobs.length >= 12);
        setPage(3); // Next load will be page 3
        setInitialLoading(false);
      } catch (error) {
        console.error('Error fetching initial jobs:', error);
        setError('Failed to load jobs. Please try again.');
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };

    loadInitialJobs();
  }, [query, sort, companyId, sortBy, sortOrder, initialLoading]);

  // Reset when query or sort changes
  useEffect(() => {
    setJobs([]);
    setPage(1);
    setHasMore(true);
    setLoading(true);
    setInitialLoading(true);
    setError(null);
  }, [query, sort]);

  // Load more jobs effect
  useEffect(() => {
    const loadMoreJobs = async () => {
      if (loading || !hasMore || initialLoading) return;
      
      setLoading(true);
      setError(null);
      try {
        // Use company-specific function if companyId is provided
        const newJobs = companyId 
          ? await fetchPaginatedJobsByCompany(
              companyId, 
              query, 
              page, 
              6, 
              sortBy as 'posted_date' | 'match_percent', 
              sortOrder as 'asc' | 'desc'
            )
          : await fetchPaginatedJobs(
              query, 
              page, 
              6, 
              sortBy as 'posted_date' | 'match_percent', 
              sortOrder as 'asc' | 'desc'
            );
        
        if (newJobs.length === 0) {
          setHasMore(false);
        } else {
          // Deduplicate jobs by ID before adding them to the state
          setJobs(prevJobs => {
            // Create a set of existing job IDs for quick lookup
            const existingIds = new Set(prevJobs.map((job: FormattedJobsTable) => job.id));
            
            // Filter out any jobs that already exist in the current state
            const uniqueNewJobs = newJobs.filter((job: FormattedJobsTable) => !existingIds.has(job.id));
            
            // If all new jobs were duplicates, we've reached the end
            if (uniqueNewJobs.length === 0) {
              setHasMore(false);
              return prevJobs;
            }
            
            return [...prevJobs, ...uniqueNewJobs];
          });
          
          if (newJobs.length < 6) {
            setHasMore(false);
          } else {
            setPage(prevPage => prevPage + 1);
          }
        }
      } catch (error) {
        console.error('Error fetching more jobs:', error);
        setError('Failed to load jobs. Please try again.');
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };

    if (inView && hasMore && !loading && !initialLoading) {
      loadMoreJobs();
    }
  }, [inView, query, sort, page, loading, hasMore, initialLoading, companyId, sortBy, sortOrder]);

  // Function to determine the match badge color based on percentage
  const getMatchBadgeColor = (matchPercent: number) => {
    if (matchPercent >= 90) return 'bg-[#44624a] text-white';
    if (matchPercent >= 75) return 'bg-[#8ba888] text-white';
    return 'bg-[#c0cfb2] text-[#44624a]';
  };

  // Function to get the job type badge color
  const getJobTypeBadgeColor = (jobType: string) => {
    switch (jobType) {
      case 'Full-time': return 'bg-blue-100 text-blue-800';
      case 'Part-time': return 'bg-purple-100 text-purple-800';
      case 'Contract': return 'bg-orange-100 text-orange-800';
      case 'Temporary': return 'bg-amber-100 text-amber-800';
      case 'Internship': return 'bg-teal-100 text-teal-800';
      case 'Remote': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full">
      <h1 className={`${inter.className} font-semibold mb-8 text-xl md:text-2xl text-[#44624a]`}>
        {titleText}
      </h1>
      
      {/* Search and Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
        <div className="relative w-full sm:max-w-xs">
          <label htmlFor="search" className="sr-only">
            Search jobs
          </label>
          <input
            type="text"
            id="search"
            className="block w-full rounded-lg border border-gray-300 py-2.5 pl-10 text-sm focus:border-[#44624a] focus:ring-1 focus:ring-[#44624a]"
            placeholder={searchPlaceholder}
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
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
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
          <p className="ml-4 text-gray-600">Loading jobs...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No job postings found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <Link 
              key={job.id} 
              href={`/dashboard/jobs/${job.id}`}
              className="block transition-transform hover:scale-105"
            >
              <div className="bg-white shadow-md rounded-lg overflow-hidden border border-[#c0cfb2] h-full flex flex-col hover:shadow-lg">
                <div className="p-4 bg-[#44624a]">
                  <div className="flex justify-between items-center">
                    <h2 className="text-white font-semibold text-lg truncate mr-3">{job.title}</h2>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getMatchBadgeColor(job.match_percent)}`}>
                      {job.match_percent}% Match
                    </div>
                  </div>
                </div>
                <div className="p-4 flex-grow">
                  {!companyId && (
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-white rounded-full p-1 w-10 h-10 flex items-center justify-center border border-gray-200">
                        <Image
                          src={job.company?.logo_url || '/placeholder-company.svg'}
                          alt={`${job.company?.company_name}'s logo`}
                          width={28}
                          height={28}
                          className="rounded-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium text-[#44624a]">{job.company?.company_name}</h3>
                        <div className="flex items-center text-gray-600 text-sm">
                          <MapPinIcon className="h-3.5 w-3.5 text-gray-500 mr-1" />
                          <span>{job.location || 'Remote'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {companyId && (
                    <p className="flex items-center text-gray-600 text-sm mb-3">
                      <MapPinIcon className="h-4 w-4 text-gray-500 mr-1" />
                      <span>{job.location || 'Remote'}</span>
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {job.job_type && (
                      <span className={`flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getJobTypeBadgeColor(job.job_type)}`}>
                        <BriefcaseIcon className="h-3 w-3 mr-1" />
                        {job.job_type}
                      </span>
                    )}
                    {job.salary_range && (
                      <span className="flex items-center bg-green-50 text-green-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
                        <CurrencyDollarIcon className="h-3 w-3 mr-1" />
                        {job.salary_range}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 text-sm line-clamp-2 mt-2">
                    {job.description || 'No description available'}
                  </p>
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
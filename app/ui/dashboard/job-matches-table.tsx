'use client';

import { useEffect, useState } from 'react';
import { fetchPaginatedJobs } from '@/app/lib/data';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { inter } from '@/app/ui/fonts';
import CompanyLogo from '../company-logo';

function Button({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { className?: string }) {
  return (
    <button
      {...props}
      className={`flex h-10 items-center rounded-lg px-4 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${className || 'bg-[#44624a] text-white hover:bg-[#3a5440]'}`}
    >
      {children}
    </button>
  );
}

interface Job {
  id: string;
  title: string;
  location: string;
  posted_date: string;
  match_percent: number;
  company: {
    id: string;
    company_name: string;
    logo_url: string;
  };
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    }
  } catch (e) {
    console.log(e);
    return 'Invalid date';
  }
}

// Function to determine the match badge color based on percentage
const getMatchBadgeColor = (matchPercent: number) => {
  if (matchPercent >= 90) return 'bg-[#44624a] text-white';
  if (matchPercent >= 75) return 'bg-[#8ba888] text-white';
  return 'bg-[#c0cfb2] text-[#44624a]';
};

export default function JobMatchesTable() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        // Fetch first page of jobs, sorted by match_percent in descending order
        const jobData = await fetchPaginatedJobs('', 1, 5, 'match_percent', 'desc');
        setJobs(jobData);
      } catch (error) {
        console.error('Error fetching job matches:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  if (loading) return <p>Loading job matches...</p>;

  return (
    <div className="w-full overflow-hidden rounded-lg bg-white shadow-md">
      <div className="px-6 py-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className={`${inter.className} text-lg font-medium text-gray-900`}>Best Matches For You</h3>
        </div>
        
        {jobs.length === 0 ? (
          <div className="rounded-lg bg-gray-50 p-6 text-center">
            <p className="text-sm text-gray-500">No matching jobs found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {jobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between py-4">
                <div className="flex items-start">
                  <div className="h-12 w-12 relative flex-shrink-0 mr-4">
                    {job.company.logo_url ? (
                      <CompanyLogo
                        logoUrl={job.company.logo_url}
                        companyName={job.company.company_name}
                        size="md"
                        className="bg-white p-1"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-md bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-sm font-bold">
                          {job.company.company_name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{job.title}</h3>
                    <div className="mt-1 flex flex-col sm:flex-row sm:gap-2">
                      <p className="text-sm text-gray-500">{job.company.company_name}</p>
                      <p className="text-sm text-gray-500 hidden sm:block">•</p>
                      <p className="text-sm text-gray-500">{job.location}</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Posted {formatDate(job.posted_date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className={`hidden sm:block text-sm font-medium rounded-full px-2.5 py-1 ${getMatchBadgeColor(job.match_percent)}`}>
                    {job.match_percent}% Match
                  </div>
                  <Link href={`/dashboard/jobs/${job.id}`} passHref>
                    <Button className="rounded-md inline-flex bg-[#44624a] hover:bg-[#3a5440] text-white">
                      View
                      <ArrowRightIcon className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="border-t border-gray-100 bg-gray-50 px-6 py-4 flex justify-center">
        <Link href="/dashboard/jobs" passHref>
          <Button className="bg-[#44624a] text-white hover:bg-[#3a5440] px-6">
            View All Jobs
          </Button>
        </Link>
      </div>
    </div>
  );
} 
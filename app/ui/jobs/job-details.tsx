'use client';

import { fetchJobPostingById, userIsCompanyEmployee } from '@/app/lib/data';
import { notFound } from 'next/navigation';
import { 
  MapPinIcon, 
  BriefcaseIcon, 
  BuildingOffice2Icon,
  CalendarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ArrowLeftIcon,
  UserGroupIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';
import Link from 'next/link';
import { applyToJob, navigateToEditJob } from '@/app/lib/job-actions';
import { useEffect, useState } from 'react';
import SuggestedTalents from './suggested-talents';
import CompanyLogo from '@/app/ui/company-logo';

export default function JobDetails({ id }: { id: string }) {
  const [job, setJob] = useState<any>(null);
  const [isEmployee, setIsEmployee] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadJobData() {
      try {
        const jobData = await fetchJobPostingById(id);
        if (!jobData) {
          notFound();
          return;
        }
        setJob(jobData);
        
        const employeeStatus = await userIsCompanyEmployee(jobData.company.id);
        setIsEmployee(employeeStatus);
      } catch (err) {
        console.error('Error loading job data:', err);
        setError('Failed to load job details. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadJobData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-12 h-12 border-t-2 border-[#8ba888] rounded-full animate-spin"></div>
        <p className="ml-4 text-gray-600">Loading job details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
        {error}
      </div>
    );
  }

  if (!job) {
    return null; // This shouldn't happen, but just in case
  }

  return (
    <>
      <div className="mb-6">
        <Link 
          href="/dashboard/jobs" 
          className="inline-flex items-center text-sm font-medium text-[#44624a] hover:text-[#3a553f]"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Jobs
        </Link>
      </div>
      
      {/* Job Details Card */}
      <div className="mt-6 rounded-lg bg-white shadow-md overflow-hidden">
        {/* Job Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-grow">
              <h1 className="text-2xl font-bold text-gray-800 mb-3">{job.title}</h1>
              
              {/* Company Info with Logo */}
              <Link href={`/dashboard/companies/${job.company.id}`} className="flex items-center gap-3 mb-4 hover:text-[#44624a] transition-colors">
                <CompanyLogo
                  logoUrl={job.company.logo_url}
                  companyName={job.company.company_name}
                  size="sm"
                />
                <div className="text-gray-700 font-medium">{job.company.company_name}</div>
              </Link>
              
              {/* Job Meta Information */}
              <div className="flex flex-wrap gap-4 text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPinIcon className="h-5 w-5 text-gray-400" />
                  <span>{job.location}</span>
                </div>
                
                {job.job_type && (
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-5 w-5 text-gray-400" />
                    <span>{job.job_type}</span>
                  </div>
                )}
                
                {job.salary_range && (
                  <div className="flex items-center gap-2">
                    <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                    <span>{job.salary_range}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex flex-col gap-3">
              <form
                action={() => applyToJob(id, job.company.id)}
              >
                <Button 
                  type="submit"
                  className="w-full bg-[#44624a] hover:bg-[#3a553f] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors justify-center"
                >
                  Apply Now
                </Button>
              </form>
              
              {isEmployee && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex flex-col gap-3">
                    <Link href={`/dashboard/jobs/${id}/applications`}>
                      <Button 
                        className="w-full bg-[#44624a] hover:bg-[#3a553f] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors justify-center"
                      >
                        View Applications
                      </Button>
                    </Link>
                    <form
                      action={() => navigateToEditJob(id)}
                    >
                      <Button 
                        type="submit"
                        className="w-full bg-[#44624a] hover:bg-[#3a553f] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors justify-center"
                      >
                        Edit Job
                      </Button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Job Description */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BriefcaseIcon className="h-5 w-5 text-[#44624a]" />
            Job Description
          </h2>
          <div className="prose text-gray-600 max-w-none">
            <p className="whitespace-pre-line">{job.description}</p>
          </div>
        </div>
        
        {/* Additional Job Details */}
        {(job.requirements || job.benefits) && (
          <div className="p-6 bg-gray-50 border-t border-gray-100">
            {job.requirements && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Requirements</h2>
                <p className="text-gray-600 whitespace-pre-line">{job.requirements}</p>
              </div>
            )}
            
            {job.benefits && (
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Benefits</h2>
                <p className="text-gray-600 whitespace-pre-line">{job.benefits}</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Suggested Talents Section (only visible for company employees) */}
      {isEmployee && (
        <div className="mt-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[#44624a] flex items-center">
              <UserGroupIcon className="h-6 w-6 mr-2" />
              Suggested Talents
            </h2>
            <Link 
              href={`/dashboard/jobs/${id}/suggested`}
              className="inline-flex items-center text-sm font-medium text-[#44624a] hover:text-[#3a553f]"
            >
              View all suggested talents
              <ArrowRightIcon className="h-4 w-4 ml-1" />
            </Link>
          </div>
          
          {/* Suggested Talents Component */}
          <SuggestedTalents jobId={id} initialLimit={4} />
        </div>
      )}
    </>
  );
} 
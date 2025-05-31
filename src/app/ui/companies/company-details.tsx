'use client';

import { fetchCompanyById, userIsCompanyEmployee, fetchPaginatedJobsByCompany } from '@/app/lib/data';
import { notFound } from 'next/navigation';
import { MapPinIcon, BuildingOffice2Icon, BriefcaseIcon, ArrowRightIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';
import Link from 'next/link';
import { navigateToEditCompany } from '@/app/lib/company-actions';
import { useEffect, useState } from 'react';
import CompanyLogo from '@/app/ui/company-logo';

// Define the job posting type
interface JobPosting {
  id: string;
  title: string;
  location: string;
  job_type: string;
  description: string;
  companyid: string;
  company: {
    id: string;
    company_name: string;
    logo_url: string;
  };
  match_percent?: number;
}

export default function CompanyDetails({ id }: { id: string }) {
  const [company, setCompany] = useState<any>(null);
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [isEmployee, setIsEmployee] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCompanyData() {
      try {
        const companyData = await fetchCompanyById(id);
        if (!companyData) {
          notFound();
          return;
        }
        setCompany(companyData);
        
        // Fetch recent job postings for this company
        const jobsData = await fetchPaginatedJobsByCompany(id, '', 1, 4);
        setJobPostings(jobsData || []);
        
        const employeeStatus = await userIsCompanyEmployee(id);
        setIsEmployee(employeeStatus);
      } catch (err) {
        console.error('Error loading company data:', err);
        setError('Failed to load company details. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadCompanyData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-12 h-12 border-t-2 border-[#8ba888] rounded-full animate-spin"></div>
        <p className="ml-4 text-gray-600">Loading company details...</p>
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

  if (!company) {
    return null; // This shouldn't happen, but just in case
  }

  return (
    <>
      {/* Company Profile Card */}
      <div className="mt-6 rounded-lg bg-white shadow-md overflow-hidden">
        {/* Company Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex-shrink-0">
              <CompanyLogo
                logoUrl={company.logo_url}
                companyName={company.company_name}
                size="lg"
              />
            </div>
            <div className="flex-grow">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">{company.company_name}</h1>
              <p className="text-gray-600 flex items-center">
                <MapPinIcon className="h-5 w-5 mr-2 text-[#8ba888]" />
                {company.location}
              </p>
            </div>
            {isEmployee && (
              <div className="mt-4 md:mt-0 flex space-x-3">
                <form
                  action={() => navigateToEditCompany(id)}
                >
                  <Button type="submit" className="bg-[#44624a] hover:bg-[#3a553f] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Edit Company
                  </Button>
                </form>
                
                <Link href={`/dashboard/companies/${id}/jobs/create`}>
                  <Button className="bg-[#44624a] hover:bg-[#3a553f] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    <BriefcaseIcon className="h-4 w-4 mr-1.5" />
                    Create Job
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Company Description */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <BuildingOffice2Icon className="h-5 w-5 mr-2 text-[#44624a]" />
            About
          </h2>
          <p className="text-gray-600">{company.description}</p>
        </div>
      </div>

      {/* Job Postings Section */}
      <div className="mt-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <BriefcaseIcon className="h-5 w-5 mr-2 text-[#44624a]" />
            Job Postings
          </h2>
          <Link 
            href={`/dashboard/companies/${id}/jobs`}
            className="flex items-center text-[#44624a] hover:text-[#3a553f] transition-colors font-medium text-sm"
          >
            View all jobs
            <ArrowRightIcon className="ml-1 h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobPostings && jobPostings.length > 0 ? (
            jobPostings.map((job) => (
              <div key={job.id} className="bg-white rounded-lg shadow-md p-5 border border-gray-100 hover:shadow-lg hover:border-[#c0cfb2] transition-all">
                <h3 className="font-semibold text-gray-800 mb-2">{job.title}</h3>
                <div className="flex items-center text-gray-500 mb-3 text-sm">
                  <MapPinIcon className="h-4 w-4 mr-1 text-[#8ba888]" />
                  <span>{job.location}</span>
                  {job.job_type && (
                    <>
                      <span className="mx-2">•</span>
                      <span>{job.job_type}</span>
                    </>
                  )}
                  {job.match_percent && (
                    <>
                      <span className="mx-2">•</span>
                      <span className="text-[#44624a] font-medium">{job.match_percent}% Match</span>
                    </>
                  )}
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{job.description}</p>
                <Link 
                  href={`/dashboard/jobs/${job.id}`}
                  className="text-[#44624a] font-medium text-sm hover:text-[#3a553f] transition-colors"
                >
                  View Details
                </Link>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-[#f0f5f1] rounded-lg p-6 text-center">
              <BriefcaseIcon className="h-12 w-12 mx-auto text-[#8ba888] mb-3" />
              <h3 className="text-gray-700 font-medium mb-1">No job postings</h3>
              <p className="text-gray-500 text-sm">This company hasn't posted any jobs yet.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 
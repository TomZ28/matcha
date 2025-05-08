'use client';

import { fetchApplicationById, getMatchPercentOfUserToJob, userIsCompanyEmployee, userIsUser } from '@/app/lib/data';
import { notFound } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import CompanyLogo from '@/app/ui/company-logo';
import WithdrawForm from './withdraw-form';
import StatusChangeForm from './status-change-form';
import UserAvatar from '../user-avatar';
import StatusProgressBar from './status-progress-bar';
import { formatDateTime } from '@/app/lib/utils';

export default function ApplicationDetails({ id }: { id: string }) {
  const [application, setApplication] = useState<any>(null);
  const [matchPercent, setMatchPercent] = useState<number | null>(null);
  const [isApplicant, setIsApplicant] = useState(false);
  const [isEmployee, setIsEmployee] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadApplicationData() {
      try {
        const applicationData = await fetchApplicationById(id);
        if (!applicationData) {
          notFound();
          return;
        }
        setApplication(applicationData);

        const userIsApplicant = await userIsUser(applicationData.userid);
        setIsApplicant(userIsApplicant);

        const employeeStatus = await userIsCompanyEmployee(applicationData.company.id);
        setIsEmployee(employeeStatus);

        const matchPercentData = await getMatchPercentOfUserToJob(applicationData.job.id);
        setMatchPercent(matchPercentData);
      } catch (err) {
        console.error('Error loading application data:', err);
        setError('Failed to load application details. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadApplicationData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-12 h-12 border-t-2 border-[#8ba888] rounded-full animate-spin"></div>
        <p className="ml-4 text-gray-600">Loading application details...</p>
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

  if (!application) {
    return null; // This shouldn't happen, but just in case
  }

  return (
    <>
      <div className="mb-6">
        <Link 
          href="/dashboard/applications" 
          className="inline-flex items-center text-sm font-medium text-[#44624a] hover:text-[#3a553f]"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Applications
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        {/* Header with company info */}
        <div className="flex items-center p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center">
            <Link href={`/dashboard/companies/${application.company.id}`} className="mr-4 hover:opacity-90">
              <CompanyLogo
                logoUrl={application.company.logo_url}
                companyName={application.company.company_name}
                size="lg"
              />
            </Link>
            <div>
              <Link href={`/dashboard/jobs/${application.job.id}`} className="hover:text-[#44624a] transition-colors">
                <h1 className="text-2xl font-semibold text-gray-900">{application.job.title}</h1>
              </Link>
              <div className="flex items-center text-gray-600">
                <Link href={`/dashboard/companies/${application.company.id}`} className="hover:underline hover:text-[#44624a]">
                  {application.company.company_name}
                </Link>
                <span className="mx-2">•</span>
                <span>{application.job.location}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Applicant info */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-medium mb-4">Applicant Information</h2>
          <Link href={`/dashboard/users/${application.applicant.id}`} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex-shrink-0">
              <UserAvatar
                firstName={application.applicant.first_name}
                lastName={application.applicant.last_name}
                avatarUrl={application.applicant.avatar_url}
                size="lg"
              />
            </div>
            <div className="flex-grow">
              <h3 className="text-xl font-semibold text-gray-900">
                {application.applicant.first_name} {application.applicant.last_name}
              </h3>
              <p className="text-gray-600">{application.applicant.email}</p>
            </div>
            <div className="flex-shrink-0 text-center">
              <div className="text-lg font-bold text-[#44624a]">
                {matchPercent ? `${matchPercent}%` : 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Match</div>
            </div>
          </Link>
        </div>
        
        {/* Application details */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="col-span-2">
              <h2 className="text-xl font-medium mb-4">Job Description</h2>
              <div className="prose max-w-none text-gray-700">
                <p>{application.job.description}</p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-xl font-medium mb-4">Application Status</h2>
              <StatusProgressBar 
                status={application.application_status} 
                date={application.application_date} 
                size="large" 
              />
              
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Application Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Applied on:</span>
                    <span className="font-medium">
                      {formatDateTime(application.application_date, { includeTime: true })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Status:</span>
                    <span className="font-medium capitalize">
                      {application.application_status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Status management forms */}
          {isEmployee && (
            <StatusChangeForm 
              applicationId={application.id} 
              currentStatus={application.application_status} 
            />
          )}
          
          {isApplicant && (
            <WithdrawForm 
              applicationId={application.id} 
              currentStatus={application.application_status} 
            />
          )}
        </div>
      </div>
    </>
  );
} 
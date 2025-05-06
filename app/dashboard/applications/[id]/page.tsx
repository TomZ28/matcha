import { fetchApplicationByIdServer, userIsUserServer, userIsCompanyEmployeeServer } from '@/app/lib/server-data';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import StatusProgressBar from '@/app/ui/applications/status-progress-bar';
import StatusChangeForm from '@/app/ui/applications/status-change-form';
import WithdrawForm from '@/app/ui/applications/withdraw-form';
import { formatDateTime } from '@/app/lib/utils';
import UserAvatar from '@/app/ui/user-avatar';
import CompanyLogo from '@/app/ui/company-logo';

export const metadata: Metadata = {
  title: 'Application Details',
};

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = await params;
  const application = await fetchApplicationByIdServer(id);
  
  if (!application) {
    notFound();
  }

  // Check permissions
  const isApplicant = await userIsUserServer(application.userid);
  const isEmployee = await userIsCompanyEmployeeServer(application.company.id);
  
  // If user is neither applicant nor employee, they shouldn't view this
  if (!isApplicant && !isEmployee) {
    notFound();
  }

  return (
    <main className="p-4 md:p-6">
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
                {application.match_percent ? `${application.match_percent}%` : 'N/A'}
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
    </main>
  );
}

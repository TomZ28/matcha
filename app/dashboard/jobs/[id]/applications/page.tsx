import { fetchJobPostingByIdServer, userIsCompanyEmployeeServer } from '@/app/lib/server-data';
import { notFound, redirect } from 'next/navigation';
import { Metadata, ResolvingMetadata } from 'next';
import JobApplicationsList from '@/app/ui/jobs/job-applications-list';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  const job = await fetchJobPostingByIdServer(id);

  return {
    title: job ? `Applications for ${job.title}` : 'Applications',
  }
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{
    query?: string;
    sort?: string;
  }>;
}) {
  const { id } = await params;
  const loadedSearchParams = await searchParams;
  const sort = loadedSearchParams?.sort || 'date';
  
  // Fetch the job to show details
  const job = await fetchJobPostingByIdServer(id);

  if (!job) {
    notFound();
  }
  
  // Check if user is authorized to view applications
  const isEmployee = await userIsCompanyEmployeeServer(job.company.id);

  if (!isEmployee) {
    redirect('/dashboard/jobs');
  }

  return (
    <>
      <Link 
        href={`/dashboard/jobs/${id}`}
        className="inline-flex items-center text-sm font-medium text-[#44624a] hover:text-[#3a553f]"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-1" />
        Back to {job.title}
      </Link>
      <main>
        <div className="mt-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Applications for {job.title}</h1>
          <p className="text-gray-600 mb-6">
            Review applications from candidates for this position at {job.company.company_name}.
          </p>
          
          <JobApplicationsList 
            jobId={id} 
            initialApplications={[]} 
            defaultSort={sort} 
          />
        </div>
      </main>
    </>
  );
}

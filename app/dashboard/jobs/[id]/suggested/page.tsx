import { fetchJobPostingByIdServer, userIsCompanyEmployeeServer } from '@/app/lib/server-data';
import { notFound, redirect } from 'next/navigation';
import { Metadata, ResolvingMetadata } from 'next';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import SuggestedTalents from '@/app/ui/jobs/suggested-talents';
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
    title: job ? `Suggested Talents for ${job.title}` : 'Suggested Talents',
  }
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  
  // Fetch the job to show details
  const job = await fetchJobPostingByIdServer(id);

  if (!job) {
    notFound();
  }
  
  // Check if user is authorized to view suggested talents
  const isEmployee = await userIsCompanyEmployeeServer(job.company.id);

  if (!isEmployee) {
    redirect('/dashboard/jobs');
  }

  return (
    <main>
      <div className="mb-6">
        <Link 
          href={`/dashboard/jobs/${id}`} 
          className="inline-flex items-center text-sm font-medium text-[#44624a] hover:text-[#3a553f]"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Job Details
        </Link>
      </div>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#44624a] mb-2">
          Suggested Talents for {job.title}
        </h1>
        <p className="text-gray-600">
          Candidates that match this job&apos;s requirements
        </p>
      </div>

      {/* Full page suggested talents with pagination */}
      <SuggestedTalents jobId={id} isFullPage={true} initialLimit={10} />
    </main>
  );
}

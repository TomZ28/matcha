import { fetchJobPostingByIdServer } from '@/app/lib/server-data';
import { notFound } from 'next/navigation';
import { Metadata, ResolvingMetadata } from 'next';
import JobDetails from '@/app/ui/jobs/job-details';

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

  if (!job) {
    notFound();
  }

  return {
    title: job ? `${job.title} @ ${job.company.company_name}` : 'Job Details',
  }
}

export default async function Page({ params }: Props) {
  const loadedParams = await params;
  return (
    <main> {/*  className="max-w-6xl mx-auto p-4 md:p-8" */}
      <JobDetails id={loadedParams.id} />
    </main>
  );
}

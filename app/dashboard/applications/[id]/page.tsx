import { notFound } from 'next/navigation';
import { Metadata, ResolvingMetadata } from 'next';
import ApplicationDetails from '@/app/ui/applications/application-details';
import { fetchApplicationByIdServer } from '@/app/lib/server-data';

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  const application = await fetchApplicationByIdServer(id);

  if (!application) {
    notFound();
  }

  return {
    title: application ? `Application for ${application.job.title}` : 'Application Details',
  }
}

export default async function Page({ params, searchParams }: Props) {
  const { id } = await params;
  const { jobId } = await searchParams;

  return (
    <main> {/*  className="max-w-6xl mx-auto p-4 md:p-8" */}
      <ApplicationDetails id={id} jobId={jobId} />
    </main>
  );
}

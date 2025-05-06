import Form from '@/app/ui/jobs/edit-form';
import { fetchJobPostingByIdServer, userIsCompanyEmployeeServer } from '@/app/lib/server-data';
import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Edit Job',
};

export default async function Page(props: { params: { id: string } }) {
  const { id } = await props.params;
  const job = await fetchJobPostingByIdServer(id);

  if (!job) {
    notFound();
  }

  // Check if user is authorized to edit this job
  const isEmployee = await userIsCompanyEmployeeServer(job.company.id);

  if (!isEmployee) {
    redirect('/dashboard/jobs');
  }

  return (
    <main>
      <Link 
        href={`/dashboard/jobs/${id}`}
        className="inline-flex items-center text-sm font-medium text-[#44624a] hover:text-[#3a553f]"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-1" />
        Back to {job.title}
      </Link>
      <Form job={job}/>
    </main>
  );
}

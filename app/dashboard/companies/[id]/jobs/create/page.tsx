import { fetchCompanyByIdServer, userIsCompanyEmployeeServer } from '@/app/lib/server-data';
import { notFound, redirect } from 'next/navigation';
import Form from '@/app/ui/jobs/create-form';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Create Job',
};

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = await params;
  const company = await fetchCompanyByIdServer(id);

  if (!company) {
    notFound();
  }

  // Check if user is authorized to create jobs for this company
  const isEmployee = await userIsCompanyEmployeeServer(id);

  if (!isEmployee) {
    redirect('/dashboard/companies');
  }

  return (
    <main>
      <div className="mb-6">
        <Link 
          href={`/dashboard/companies/${company.id}`} 
          className="inline-flex items-center text-sm font-medium text-[#44624a] hover:text-[#3a553f]"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to {company.company_name}
        </Link>
      </div>
      <Form companyId={id} companyName={company.company_name} />
    </main>
  );
}

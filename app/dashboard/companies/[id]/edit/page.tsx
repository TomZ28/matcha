import Form from '@/app/ui/companies/edit-form';
import { fetchCompanyByIdServer, userIsCompanyEmployeeServer } from '@/app/lib/server-data';
import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Edit Company',
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const company = await fetchCompanyByIdServer(id);

  if (!company) {
    notFound();
  }
  
  // Check if user is authorized to edit the company
  const isEmployee = await userIsCompanyEmployeeServer(id);

  if (!isEmployee) {
    redirect('/dashboard/companies');
  }

  return (
    <main>
      <div className="mb-6">
        <Link 
          href={`/dashboard/companies/${id}`}
          className="inline-flex items-center text-sm font-medium text-[#44624a] hover:text-[#3a553f]"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to {company.company_name}
        </Link>
      </div>
      <Form company={company}/>
    </main>
  );
}

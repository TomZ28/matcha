import Form from '@/app/ui/companies/create-form';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Create Company',
};

export default async function Page() {
  return (
    <main>
      <div className="mb-6">
        <Link 
          href="/dashboard/companies" 
          className="inline-flex items-center text-sm font-medium text-[#44624a] hover:text-[#3a553f]"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Companies
        </Link>
      </div>
      <Form />
    </main>
  );
}

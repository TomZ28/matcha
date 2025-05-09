import { fetchCompanyByIdServer } from '@/app/lib/server-data';
import { Metadata, ResolvingMetadata } from 'next';
import CompanyDetails from '@/app/ui/companies/company-details';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  const company = await fetchCompanyByIdServer(id);

  return {
    title: company?.company_name || 'Company Profile',
  }
}

export default async function Page({ params }: Props) {
  const loadedParams = await params;
  return (
    <>
      <div className="mb-6">
        <Link 
          href="/dashboard/companies" 
          className="inline-flex items-center text-sm font-medium text-[#44624a] hover:text-[#3a553f]"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Companies
        </Link>
      </div>
      <main className="max-w-6xl mx-auto p-4 md:p-8">
        <CompanyDetails id={loadedParams.id} />
      </main>
    </>
  );
}

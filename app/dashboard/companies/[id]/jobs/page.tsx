import { fetchCompanyByIdServer } from '@/app/lib/server-data';
import JobGrid from '@/app/ui/jobs/job-grid';
import { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

type Props = {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
};

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  const company = await fetchCompanyByIdServer(id);

  return {
    title: company ? `Jobs at ${company.company_name}` : 'Company Jobs',
  }
}

export default async function Page({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: {
    query?: string;
    page?: string;
    sort?: string;
  };
}) {
  const { id: companyId } = await params;
  const loadedSearchParams = await searchParams;
  const sort = loadedSearchParams?.sort || 'newest';

  // Fetch company details only - let JobGrid handle job fetching client-side
  const company = await fetchCompanyByIdServer(companyId);
  
  if (!company) {
    notFound();
  }

  return (
    <main>
      <div className="mb-6">
        <Link 
          href={`/dashboard/companies/${companyId}`}
          className="inline-flex items-center text-sm font-medium text-[#44624a] hover:text-[#3a553f]"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to {company.company_name}
        </Link>
      </div>
      <div className="mt-8">
        <JobGrid 
          initialJobs={[]}
          companyId={companyId} 
          companyName={company.company_name}
          defaultSort={sort}
        />
      </div>
    </main>
  );
}

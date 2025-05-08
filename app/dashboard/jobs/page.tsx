import JobGrid from '@/app/ui/jobs/job-grid';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Jobs',
};

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    sort?: string;
  }>;
}) {
  // Pass searchParams directly to JobGrid
  // and let it handle all data fetching on the client side
  const loadedSearchParams = await searchParams;
  return (
    <main>
      <JobGrid 
        initialJobs={[]} 
        defaultSort={loadedSearchParams?.sort || 'newest'} 
      />
    </main>
  );
}

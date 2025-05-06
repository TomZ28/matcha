import { Suspense } from 'react';
import { Metadata } from 'next';
import { inter } from '@/app/ui/fonts';
import UserStatCards from '@/app/ui/dashboard/user-stat-cards';
import JobMatchesTable from '@/app/ui/dashboard/job-matches-table';
import ProfileCompletionCard from '@/app/ui/dashboard/profile-completion';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export default async function Page() {
  return (
    <main>
      <h1 className={`${inter.className} font-semibold mb-4 text-xl md:text-2xl`}>
        Your Dashboard
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Suspense fallback={<div>Loading...</div>}>
          <UserStatCards />
        </Suspense>
        <Suspense fallback={<div>Loading...</div>}>
          <ProfileCompletionCard />
        </Suspense>
      </div>
      <div className="mt-6">
        <h2 className={`${inter.className} font-semibold mb-4 text-lg`}>
          Job Matches For You
        </h2>
        <Suspense fallback={<div>Loading...</div>}>
          <JobMatchesTable />
        </Suspense>
      </div>
    </main>
  );
}

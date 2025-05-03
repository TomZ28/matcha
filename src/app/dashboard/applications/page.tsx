import { fetchUserServer } from '@/app/lib/server-data';
import ApplicationGrid from '@/app/ui/applications/application-grid';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'My Applications',
};

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
    sort?: string;
  };
}) {
  // Get current user - this needs to be done server-side for authentication
  const user = await fetchUserServer();
  
  // Redirect to login if no user is found
  if (!user) {
    redirect('/login');
  }

  // Pass query params to the ApplicationGrid component
  const params = await searchParams;
  const query = params?.query || '';
  const sort = params?.sort || 'date';

  return (
    <main>
      <ApplicationGrid 
        initialApplications={[]} 
        userId={user.id} 
        defaultSort={sort}
      />
    </main>
  );
}

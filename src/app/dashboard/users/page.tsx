import UserGrid from '@/app/ui/users/user-grid';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Users',
};

export default async function Page() {
  return (
    <main>
      <UserGrid initialUsers={[]} />
    </main>
  );
}

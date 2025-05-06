import { fetchUserByIdServer } from '@/app/lib/server-data';
import { Metadata, ResolvingMetadata } from 'next';
import UserDetails from '@/app/ui/users/user-details';
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
  const user = await fetchUserByIdServer(id);

  return {
    title: user ? `${user.first_name} ${user.last_name}` : 'User Profile',
  }
}

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = await params;
  return (
    <>
    <div className="mb-6">
      <Link 
        href="/dashboard/users" 
        className="inline-flex items-center text-sm font-medium text-[#44624a] hover:text-[#3a553f]"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-1" />
        Back to Talent Network
      </Link>
    </div>
    <main className="max-w-6xl mx-auto p-4 md:p-8">
      <UserDetails id={id} />
    </main>
    </>
  );
}

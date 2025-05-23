import Navbar from '@/app/ui/dashboard/navbar';
import { Suspense } from 'react';
import Loading from './loading';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-64">
        <Navbar />
      </div>
      <div className="grow p-6 md:overflow-y-auto md:p-12">
        <Suspense fallback={<Loading />}>
          {children}
        </Suspense>
      </div>
    </div>
  );
}

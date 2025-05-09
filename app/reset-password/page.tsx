import MatchaLogo from '@/app/ui/matcha-logo';
import ResetPasswordForm from '@/app/ui/reset-password/reset-password-form';
import { Suspense } from 'react';
import { lusitana } from '@/app/ui/fonts';
import { redirect } from 'next/navigation';
import { createClient } from '@/app/utils/supabase/server';

export const metadata = {
  title: 'Matcha - Reset Password',
  description: 'Reset your Matcha account password',
};

export default async function ResetPasswordPage() {
  // Check if user is authenticated (after clicking the reset password link)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser()
  
  // If not authenticated, redirect to login
  if (!user) {
    redirect('/login');
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-[#f0f5f1]">
      <div className="relative mx-auto flex w-full max-w-[450px] flex-col space-y-2.5 p-4 md:-mt-20">
        <div className="flex h-16 w-full items-center justify-center rounded-lg bg-[#44624a] p-3 md:h-20">
          <MatchaLogo size="lg" theme="dark" linkToHome={false} />
        </div>
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h1 className={`${lusitana.className} mb-3 text-2xl font-bold text-gray-900`}>
            Reset Your Password
          </h1>
          <p className="mb-6 text-sm text-gray-600">
            Enter your new password below.
          </p>
          <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}

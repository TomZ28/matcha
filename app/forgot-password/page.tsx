import MatchaLogo from '@/app/ui/matcha-logo';
import ForgotPasswordForm from '@/app/ui/forgot-password/forgot-password-form';
import { Suspense } from 'react';
import { lusitana } from '@/app/ui/fonts';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/app/utils/supabase/server';

export const metadata = {
  title: 'Matcha - Forgot Password',
  description: 'Reset your Matcha account password',
};

export default async function ForgotPasswordPage() {
  // Check if user is already authenticated
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  // If already logged in, redirect to dashboard
  if (session) {
    redirect('/dashboard');
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-[#f0f5f1]">
      <div className="relative mx-auto flex w-full max-w-[450px] flex-col space-y-2.5 p-4 md:-mt-20">
        <div className="flex h-16 w-full items-center justify-center rounded-lg bg-[#44624a] p-3 md:h-20">
          <MatchaLogo size="lg" theme="dark" linkToHome={false} />
        </div>
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h1 className={`${lusitana.className} mb-3 text-2xl font-bold text-gray-900`}>
            Forgot Your Password?
          </h1>
          <p className="mb-6 text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your password.
          </p>
          <Suspense fallback={<div>Loading...</div>}>
            <ForgotPasswordForm />
          </Suspense>
          <div className="mt-6 text-center text-sm text-gray-600">
            Remember your password?{' '}
            <Link href="/login" className="text-[#44624a] hover:text-[#3a553f] font-medium">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

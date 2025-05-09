import MatchaLogo from '@/app/ui/matcha-logo';
import LoginForm from '@/app/ui/login/login-form';
import { Suspense } from 'react';
import { lusitana } from '@/app/ui/fonts';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/app/utils/supabase/server';

export const metadata = {
  title: 'Matcha - Sign In',
  description: 'Sign in to your Matcha account to connect with opportunities',
};

export default async function LoginPage() {
  // Check if user is already authenticated
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser()
  
  // If already logged in, check if user has profile
  if (user) {
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', user.id)
      .single();
    
      if (!existingProfile || !existingProfile.first_name || !existingProfile.last_name) {
        redirect('/dashboard/profile')
      } else {
        redirect('/dashboard');
      }
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-[#f0f5f1]">
      <div className="relative mx-auto flex w-full max-w-[450px] flex-col space-y-2.5 p-4 md:-mt-20">
        <div className="flex h-16 w-full items-center justify-center rounded-lg bg-[#44624a] p-3 md:h-20">
          <MatchaLogo size="lg" theme="dark" linkToHome={false} />
        </div>
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h1 className={`${lusitana.className} mb-3 text-2xl font-bold text-gray-900`}>
            Sign in to your account
          </h1>
          <p className="mb-6 text-sm text-gray-600">
            Welcome back! Sign in to continue your journey with Matcha.
          </p>
          <Suspense fallback={<div>Loading...</div>}>
            <LoginForm />
          </Suspense>
          <div className="mt-6 text-center text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-[#44624a] hover:text-[#3a553f] font-medium">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

'use client';

import { lusitana } from '@/app/ui/fonts';
import {
  AtSymbolIcon,
  KeyIcon,
  ExclamationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from '@/app/ui/button';
import { useSearchParams } from 'next/navigation';
import { signupAction } from '@/app/lib/actions';
import { useFormStatus } from 'react-dom';
import { useActionState } from 'react';
import { useState, useEffect } from 'react';

type State = {
  message?: string | null;
  success: boolean;
};

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  
  return (
    <Button 
      className="mt-4 w-full bg-[#44624a] hover:bg-[#3a553f]"
      type="submit"
      aria-disabled={pending || disabled}
      disabled={pending || disabled}
    >
      {pending ? 'Creating account...' : 'Create Account'}
      <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
    </Button>
  );
}

export default function SignupForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  
  const initialState: State = { message: null, success: false };
  const [state, formAction] = useActionState(signupAction, initialState);
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);

  useEffect(() => {
    if (password && confirmPassword) {
      setPasswordsMatch(password === confirmPassword);
    } else if (!confirmPassword) {
      setPasswordsMatch(true);
    }
  }, [password, confirmPassword]);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setPasswordTouched(true);
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    setConfirmTouched(true);
  };

  if (state.success) {
    return (
      <div className="rounded-lg bg-green-50 p-6 border border-green-100">
        <div className="flex items-center space-x-2 mb-4">
          <CheckCircleIcon className="h-6 w-6 text-green-600" />
          <h2 className={`${lusitana.className} text-lg font-medium text-green-800`}>
            Account created successfully!
          </h2>
        </div>
        <p className="text-sm text-green-700 mb-2">
          A verification email has been sent to your email address.
        </p>
        <p className="text-sm text-green-700 mb-4">
          Please check your inbox (and spam folder) to verify your account before signing in.
        </p>
        <Button 
          className="w-full bg-green-600 hover:bg-green-700"
          onClick={() => window.location.href = '/login'}
        >
          Go to Login
        </Button>
      </div>
    );
  }

  // Check if form submission should be disabled
  const formDisabled = !passwordsMatch || (passwordTouched && !password) || (confirmTouched && !confirmPassword);

  // Determine if we should show the password match error
  const showPasswordMatchError = !passwordsMatch && confirmTouched;

  return (
    <form action={formAction} className="space-y-3">
      <div className="w-full">
        <div>
          <label
            className="mb-2 block text-xs font-medium text-gray-900"
            htmlFor="email"
          >
            Email
          </label>
          <div className="relative">
            <input
              className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email address"
              required
            />
            <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
          </div>
        </div>
        <div className="mt-4">
          <label
            className="mb-2 block text-xs font-medium text-gray-900"
            htmlFor="password"
          >
            Password
          </label>
          <div className="relative">
            <input
              className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
              id="password"
              type="password"
              name="password"
              placeholder="Create a password (min. 6 characters)"
              required
              minLength={6}
              value={password}
              onChange={handlePasswordChange}
              onBlur={() => setPasswordTouched(true)}
            />
            <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
          </div>
        </div>
        <div className="mt-4">
          <label
            className="mb-2 block text-xs font-medium text-gray-900"
            htmlFor="confirm-password"
          >
            Confirm Password
          </label>
          <div className="relative">
            <input
              className={`peer block w-full rounded-md border ${!passwordsMatch ? 'border-red-500' : 'border-gray-200'} py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500`}
              id="confirm-password"
              type="password"
              placeholder="Confirm your password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              onBlur={() => setConfirmTouched(true)}
            />
            <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
          </div>
          {showPasswordMatchError && (
            <p className="mt-1 text-sm text-red-500">Passwords do not match</p>
          )}
        </div>
      </div>
      <input type="hidden" name="redirectTo" value={callbackUrl} />
      <input type="hidden" name="password" value={password} />
      <SubmitButton disabled={formDisabled} />
      <div
        className="flex h-8 items-end space-x-1"
        aria-live="polite"
        aria-atomic="true"
      >
        {state.message && (
          <>
            <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
            <p className="text-sm text-red-500">{state.message}</p>
          </>
        )}
      </div>
    </form>
  );
} 
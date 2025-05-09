'use client';

import {
  KeyIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from '@/app/ui/button';
import { useActionState } from 'react';
import { resetPasswordAction } from '@/app/lib/actions';
import { useFormStatus } from 'react-dom';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  
  return (
    <Button 
      className="mt-4 w-full bg-[#44624a] hover:bg-[#3a553f]"
      type="submit"
      aria-disabled={pending || disabled}
      disabled={pending || disabled}
    >
      {pending ? 'Resetting...' : 'Reset Password'}
      <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
    </Button>
  );
}

export default function ResetPasswordForm() {
  const router = useRouter();
  const [state, formAction] = useActionState(resetPasswordAction, { 
    success: false,
    message: null
  });
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Password validation states
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);

  // Check if passwords match whenever either changes
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

  // Show success message if the form was successfully submitted
  if (state.success && !showSuccess) {
    setShowSuccess(true);
    // Redirect to login after 3 seconds
    setTimeout(() => {
      router.push('/login');
    }, 3000);
  }

  if (showSuccess) {
    return (
      <div className="rounded-md bg-green-50 p-4 my-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">Password reset successful</h3>
            <div className="mt-2 text-sm text-green-700">
              <p>Your password has been reset. Redirecting to login page...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Update the form disabled check to require both fields
  const formDisabled = !passwordsMatch || !password || !confirmPassword;

  // Determine if we should show the password match error
  const showPasswordMatchError = !passwordsMatch && confirmTouched;

  return (
    <form action={formAction} className="space-y-3">
      <div className="w-full">
        <div>
          <label
            className="mb-2 block text-xs font-medium text-gray-900"
            htmlFor="password"
          >
            New Password
          </label>
          <div className="relative">
            <input
              className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
              id="password"
              type="password"
              name="password"
              placeholder="Enter your new password"
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
            htmlFor="confirm_password"
          >
            Confirm Password
          </label>
          <div className="relative">
            <input
              className={`peer block w-full rounded-md border ${!passwordsMatch ? 'border-red-500' : 'border-gray-200'} py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500`}
              id="confirm_password"
              type="password"
              name="confirm_password"
              placeholder="Confirm your new password"
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
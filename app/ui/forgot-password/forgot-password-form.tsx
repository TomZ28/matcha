'use client';

import {
  AtSymbolIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from '@/app/ui/button';
import { useActionState } from 'react';
import { forgotPasswordAction } from '@/app/lib/actions';
import { useFormStatus } from 'react-dom';
import { useState } from 'react';

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button 
      className="mt-4 w-full bg-[#44624a] hover:bg-[#3a553f]"
      type="submit"
      aria-disabled={pending}
      disabled={pending}
    >
      {pending ? 'Sending...' : 'Send Reset Link'}
      <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
    </Button>
  );
}

export default function ForgotPasswordForm() {
  const [state, formAction] = useActionState(forgotPasswordAction, { 
    success: false,
    message: null
  });
  const [showSuccess, setShowSuccess] = useState(false);

  // Show success message if the form was successfully submitted
  if (state.success && !showSuccess) {
    setShowSuccess(true);
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
            <h3 className="text-sm font-medium text-green-800">Email sent</h3>
            <div className="mt-2 text-sm text-green-700">
              <p>Please check your email for instructions to reset your password.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
      </div>
      <SubmitButton />
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
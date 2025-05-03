'use client';

import { useState } from 'react';
import { Button } from '@/app/ui/button';
import { updateApplicationStatus } from '@/app/lib/actions';
import { useRouter } from 'next/navigation';

interface WithdrawFormProps {
  applicationId: string;
  currentStatus: string;
}

export default function WithdrawForm({ applicationId, currentStatus }: WithdrawFormProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleWithdraw = async () => {
    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      await updateApplicationStatus(applicationId, 'withdrawn');
      router.refresh();
      setIsOpen(false);
    } catch (error) {
      setErrorMessage('Failed to withdraw application. Please try again.');
      console.error('Error withdrawing application:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't show withdraw option if application is already in a final state
  if (currentStatus === 'withdrawn' || currentStatus === 'not selected' || currentStatus === 'offer') {
    return null;
  }

  return (
    <div className="mt-6">
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-[#8ba888] text-white hover:bg-[#7a9877]"
          type="button"
        >
          Withdraw Application
        </Button>
      ) : (
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Withdraw Application</h3>
          <p className="text-gray-600 text-sm mb-4">
            Are you sure you want to withdraw your application? This action cannot be undone.
          </p>
          
          {errorMessage && (
            <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
          )}
          
          <div className="flex gap-3 justify-end">
            <Button 
              onClick={() => setIsOpen(false)}
              className="bg-[#8ba888] text-white hover:bg-[#7a9877]"
              type="button"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleWithdraw}
              className="bg-red-500 hover:bg-red-600 text-white"
              disabled={isSubmitting}
              type="button"
            >
              {isSubmitting ? 'Withdrawing...' : 'Confirm Withdraw'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 
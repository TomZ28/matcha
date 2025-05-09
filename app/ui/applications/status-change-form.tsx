'use client';

import { useState } from 'react';
import { Button } from '@/app/ui/button';
import { updateApplicationStatus } from '@/app/lib/actions';

type ApplicationStatus = 'applied' | 'interview' | 'offer' | 'not selected';

interface StatusChangeFormProps {
  applicationId: string;
  currentStatus: string;
}

export default function StatusChangeForm({ applicationId, currentStatus }: StatusChangeFormProps) {
  const [status, setStatus] = useState<ApplicationStatus>(currentStatus as ApplicationStatus);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Only show status options that make sense based on the current status
  const getAvailableStatuses = (): ApplicationStatus[] => {
    const allStatuses: ApplicationStatus[] = ['applied', 'interview', 'offer', 'not selected'];
    
    // If already rejected or hired, don't allow changing
    if (currentStatus === 'withdrawn') {
      return ['not selected'];
    }
    
    return allStatuses;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      await updateApplicationStatus(applicationId, status);
      window.location.reload();
    } catch (error) {
      setErrorMessage('Failed to update application status. Please try again.');
      console.error('Error updating status:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Update Application Status</h3>
      
      <div className="mb-4">
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
          Application Status
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#8ba888] focus:outline-none focus:ring-1 focus:ring-[#44624a]"
          disabled={isSubmitting || currentStatus === 'withdrawn'}
        >
          {getAvailableStatuses().map((statusOption) => (
            <option key={statusOption} value={statusOption}>
              {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
            </option>
          ))}
        </select>
      </div>
      
      {errorMessage && (
        <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
      )}
      
      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={isSubmitting || status === currentStatus || currentStatus === 'withdrawn'}
          className="bg-[#44624a] hover:bg-[#3a553f] text-white"
        >
          {isSubmitting ? 'Updating...' : 'Update Status'}
        </Button>
      </div>
    </form>
  );
} 
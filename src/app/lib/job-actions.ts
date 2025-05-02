'use server';

import { createJobApplication } from '@/app/lib/actions';
import { redirect } from 'next/navigation';

export async function applyToJob(jobId: string, companyId: string) {
  const result = await createJobApplication(jobId, companyId);
  if (result.success) {
    redirect(`/dashboard/applications/${result.data.id}`);
  } else {
    // In a real application, you'd handle error display
    console.error(result.message);
    redirect('/dashboard/applications');
  }
}

export async function navigateToEditJob(jobId: string) {
  redirect(`/dashboard/jobs/${jobId}/edit`);
} 
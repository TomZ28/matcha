'use server';

import { redirect } from 'next/navigation';
 
export async function navigateToEditCompany(companyId: string) {
  redirect(`/dashboard/companies/${companyId}/edit`);
} 
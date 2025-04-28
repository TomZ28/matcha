'use server';

import { redirect } from 'next/navigation';

export async function navigateToEditProfile() {
  redirect(`/dashboard/profile`);
} 
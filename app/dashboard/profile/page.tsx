import { fetchUserServer, fetchUserEducationServer, fetchUserExperienceServer } from '@/app/lib/server-data';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import ProfileTabs from '@/app/ui/profile/profile-tabs';

export const metadata: Metadata = {
  title: 'Profile',
};

export default async function Page() {
  const user = await fetchUserServer();

  if (!user) {
    notFound();
  }

  // Fetch user education data
  const education = await fetchUserEducationServer(user.id);
  
  // Fetch user experience data
  const experience = await fetchUserExperienceServer(user.id);

  return (
    <main className="p-0">
      <ProfileTabs user={user} education={education} experience={experience} />
    </main>
  );
}

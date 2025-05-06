'use client';

import { UserIcon, BriefcaseIcon, BellIcon } from '@heroicons/react/24/outline';
import { fetchUser, fetchJobApplicationsByUserId } from '@/app/lib/data';
import { useEffect, useState } from 'react';
import { inter } from '@/app/ui/fonts';

function Card({
  title,
  value,
  icon,
  description,
  className,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  description?: string;
  className?: string;
}) {
  return (
    <div className={`rounded-xl bg-white p-2 shadow-md h-full flex flex-col ${className}`}>
      <div className="flex p-4 items-center">
        {icon}
        <h3 className="ml-2 text-sm font-medium">{title}</h3>
      </div>
      <div className="rounded-xl bg-gray-50 flex-1 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-3xl font-semibold text-gray-800">
            {value}
          </p>
          {description && (
            <p className="text-sm text-gray-500 mt-1.5">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function UserStatCards() {
  const [activeApplications, setActiveApplications] = useState<number>(0);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await fetchUser();
        if (user) {
          setUserId(user.id);
          const applications = await fetchJobApplicationsByUserId(user.id);
          
          // Count applications that are either in review or applied status
          const activeApps = applications.filter(
            app => app.application_status === 'applied' || 
                  app.application_status === 'reviewing'
          ).length;
          
          setActiveApplications(activeApps);
        }
      } catch (error) {
        console.error('Error fetching user stats:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <Card
        title="Active Applications"
        value={activeApplications}
        description={activeApplications === 1 ? "Application currently being reviewed" : "Applications currently being reviewed"}
        icon={<BriefcaseIcon className="h-5 w-5 text-[#44624a]" />}
        className="sm:col-span-1 bg-gradient-to-br from-[#f0f5f1] to-white"
      />
      <Card
        title="Job Alerts"
        value="Active"
        description="Receiving daily job notifications"
        icon={<BellIcon className="h-5 w-5 text-[#8ba888]" />}
        className="sm:col-span-1 bg-gradient-to-br from-[#f0f5f1] to-white"
      />
    </>
  );
} 
'use client';

import { ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';
import { fetchUser, fetchUserEducation, fetchUserExperience } from '@/app/lib/data';
import { useEffect, useState } from 'react';
import { inter } from '@/app/ui/fonts';
import ProfileCompletion, { ProfileData, calculateProfileCompletion } from '@/app/ui/profile-completion';
import UserAvatar from '@/app/ui/user-avatar';

export default function ProfileCompletionCard() {
  const [user, setUser] = useState<ProfileData | null>(null);
  const [education, setEducation] = useState<any[]>([]);
  const [experience, setExperience] = useState<any[]>([]);
  const [completionPercentage, setCompletionPercentage] = useState<number>(0);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await fetchUser();
        if (userData) {
          setUser(userData);
          const educationData = await fetchUserEducation(userData.id);
          const experienceData = await fetchUserExperience(userData.id);
          
          setEducation(educationData);
          setExperience(experienceData);
          
          // Calculate the percentage
          const percentage = calculateProfileCompletion(userData, educationData, experienceData);
          setCompletionPercentage(percentage);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };

    fetchData();
  }, []);

  if (!user) return null;

  return (
    <div className="rounded-xl bg-white p-2 shadow-md sm:col-span-2 lg:col-span-1 bg-gradient-to-br from-purple-50 to-white">
      <div className="flex p-4">
        <ClipboardDocumentCheckIcon className="h-5 w-5 text-purple-600" />
        <h3 className="ml-2 text-sm font-medium">Profile Completion</h3>
      </div>
      <div className="flex flex-col items-center justify-center px-4 py-5">
        <UserAvatar 
          firstName={user.first_name}
          lastName={user.last_name}
          avatarUrl={user.avatar_url}
          size="lg"
          className="mb-3"
        />
        
        <h3 className={`${inter.className} text-lg font-semibold`}>
          {user.first_name} {user.last_name}
        </h3>
        
        <p className="text-sm text-gray-500 mb-4">{user.location || 'Location not specified'}</p>
        
        <div className="w-full">
          <ProfileCompletion 
            user={user} 
            education={education} 
            experience={experience} 
            showTitle={false}
            showPercentageLabel={false}
            className="w-full mb-2"
          />
          
          <p className="text-sm font-medium text-gray-700 text-center">
            {completionPercentage}% Complete
          </p>
        </div>
      </div>
    </div>
  );
} 
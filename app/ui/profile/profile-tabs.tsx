'use client';

import { useState, useEffect } from 'react';
import { UserIcon, AcademicCapIcon, BriefcaseIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Form from '@/app/ui/profile/edit-form';
import EducationForm from '@/app/ui/profile/education-form';
import ExperienceForm from '@/app/ui/profile/experience-form';
import { UserForm, Education, Experience } from '@/app/lib/definitions';

export default function ProfileTabs({ 
  user, 
  education,
  experience 
}: { 
  user: UserForm; 
  education: Education[];
  experience: Experience[];
}) {
  const [activeTab, setActiveTab] = useState('profile');
  const [currentUser, setCurrentUser] = useState<UserForm>(user);
  const [isNewProfile, setIsNewProfile] = useState(!user.first_name || !user.last_name);

  // Function to update user data when profile is saved
  const handleProfileUpdate = (updatedUser: Partial<UserForm>) => {
    setCurrentUser(prev => ({ ...prev, ...updatedUser }));
    
    // Check if first name and last name are now provided
    if (updatedUser.first_name && updatedUser.last_name) {
      setIsNewProfile(false);
      
      // Trigger a refresh of the navigation by sending a message to the NavLinks component
      window.dispatchEvent(new CustomEvent('profile-updated', { 
        detail: { hasCompleteProfile: true } 
      }));
    }
  };

  return (
    <div className="mt-0">
      {isNewProfile && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Welcome to Matcha!</strong> Please add your first and last name to access all features. 
                Once completed, you'll be able to browse jobs, apply to positions, connect with companies, 
                or post job listings and hire talent.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex justify-center border-b border-gray-200 mb-6">
        <button
          className={`flex items-center px-6 py-3 text-sm font-medium ${
            activeTab === 'profile'
              ? 'text-[#44624a] border-b-2 border-[#44624a]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('profile')}
        >
          <UserIcon className="h-5 w-5 mr-2" />
          Profile Information
        </button>
        <button
          className={`flex items-center px-6 py-3 text-sm font-medium ${
            activeTab === 'education'
              ? 'text-[#44624a] border-b-2 border-[#44624a]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('education')}
        >
          <AcademicCapIcon className="h-5 w-5 mr-2" />
          Education
        </button>
        <button
          className={`flex items-center px-6 py-3 text-sm font-medium ${
            activeTab === 'experience'
              ? 'text-[#44624a] border-b-2 border-[#44624a]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('experience')}
        >
          <BriefcaseIcon className="h-5 w-5 mr-2" />
          Experience
        </button>
      </div>

      {activeTab === 'profile' && <Form user={currentUser} onProfileUpdate={handleProfileUpdate} />}
      {activeTab === 'education' && <EducationForm userId={user.id} education={education} />}
      {activeTab === 'experience' && <ExperienceForm userId={user.id} experience={experience} />}
    </div>
  );
} 
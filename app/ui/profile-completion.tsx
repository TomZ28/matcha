'use client';

import { ChartBarIcon } from '@heroicons/react/24/outline';
import { ReactNode } from 'react';
import { inter } from '@/app/ui/fonts';

// Type for user data - accommodates both formats from different components
export interface ProfileData {
  id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  location?: string;
  avatar_url?: string | null;
  summary?: string;
  skills?: string[];
  [key: string]: any; // Allow for additional fields
}

interface ProfileCompletionProps {
  user: ProfileData;
  education?: any[];
  experience?: any[];
  className?: string;
  showTitle?: boolean;
  showDescription?: boolean;
  showPercentageLabel?: boolean;
  children?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function calculateProfileCompletion(
  user: ProfileData,
  education: any[] = [],
  experience: any[] = []
): number {
  if (!user) return 0;
  
  let totalFields = 0;
  let completedFields = 0;
  
  // Basic profile fields to check
  const profileFields = [
    'first_name', 'last_name', 'email', 'location', 
    'summary', 'avatar_url'
  ];
  
  totalFields += profileFields.length;
  profileFields.forEach(field => {
    if (user[field] && 
        typeof user[field] === 'string' && 
        user[field].toString().trim() !== '') {
      completedFields++;
    } else if (user[field] !== undefined && user[field] !== null) {
      completedFields++;
    }
  });
  
  // Check skills
  const hasSkills = user.skills && 
                   Array.isArray(user.skills) && 
                   user.skills.length > 0;
  
  if (hasSkills) {
    completedFields += 2;
  }
  totalFields += 2;
  
  // Add education and experience as factors
  if (education && education.length > 0) {
    completedFields += 2; // Bonus for having education
  }
  totalFields += 2;
  
  if (experience && experience.length > 0) {
    completedFields += 2; // Bonus for having experience
  }
  totalFields += 2;
  
  return Math.round((completedFields / totalFields) * 100);
}

export default function ProfileCompletion({
  user,
  education = [],
  experience = [],
  className = '',
  showTitle = true,
  showDescription = true,
  showPercentageLabel = true,
  children,
  size = 'md'
}: ProfileCompletionProps) {
  const completionPercentage = calculateProfileCompletion(user, education, experience);
  
  // Size classes
  const getBarSizeClass = () => {
    switch (size) {
      case 'sm': return 'h-1.5';
      case 'lg': return 'h-3.5';
      default: return 'h-2.5';
    }
  };

  return (
    <div className={`${className}`}>
      {showTitle && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <ChartBarIcon className="h-5 w-5 text-[#44624a] mr-2" />
            <h2 className={`${inter.className} text-lg font-medium text-gray-800`}>Profile Completion</h2>
          </div>
          {showPercentageLabel && (
            <span className="text-sm font-semibold text-[#44624a]">{completionPercentage}%</span>
          )}
        </div>
      )}
      
      <div className={`w-full bg-gray-200 rounded-full ${getBarSizeClass()}`}>
        <div 
          className={`bg-gradient-to-r from-[#44624a] to-[#8ba888] ${getBarSizeClass()} rounded-full transition-all duration-500 ease-in-out`}
          style={{ width: `${completionPercentage}%` }}
        ></div>
      </div>
      
      {showDescription && completionPercentage < 100 && (
        <p className="mt-2 text-sm text-gray-600">
          Complete your profile to increase your visibility to employers.
        </p>
      )}
      
      {children}
    </div>
  );
} 
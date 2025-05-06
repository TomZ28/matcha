'use client';

import { fetchUserById, fetchUserEducation, fetchUserExperience, userIsUser } from '@/app/lib/data';
import { notFound } from 'next/navigation';
import { MapPinIcon, EnvelopeIcon, UserCircleIcon, AcademicCapIcon, BriefcaseIcon, IdentificationIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';
import { useEffect, useState } from 'react';
import { navigateToEditProfile } from '@/app/lib/user-actions';
import UserAvatar from '@/app/ui/user-avatar';

export default function UserDetails({ id }: { id: string }) {
  const [user, setUser] = useState<any>(null);
  const [education, setEducation] = useState<any[]>([]);
  const [experience, setExperience] = useState<any[]>([]);
  const [isUser, setIsUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displaySkills, setDisplaySkills] = useState<string[]>([]);

  useEffect(() => {
    async function loadUserData() {
      try {
        // Fetch user data
        const userData = await fetchUserById(id);
        if (!userData) {
          notFound();
          return;
        }
        setUser(userData);
        
        // Fetch education and experience
        const educationData = await fetchUserEducation(id);
        const experienceData = await fetchUserExperience(id);
        setEducation(educationData || []);
        setExperience(experienceData || []);
        
        // Check if current user is viewing their own profile
        const userStatus = await userIsUser(id);
        setIsUser(userStatus);
        
        // Skills
        setDisplaySkills(userData.skills || []);
      } catch (err) {
        console.error('Error loading user data:', err);
        setError('Failed to load user details. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-12 h-12 border-t-2 border-[#8ba888] rounded-full animate-spin"></div>
        <p className="ml-4 text-gray-600">Loading user profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
        {error}
      </div>
    );
  }

  if (!user) {
    return null; // This shouldn't happen, but just in case
  }

  return (
    <>
      {/* User Profile Card */}
      <div className="mt-6 rounded-lg bg-white shadow-md overflow-hidden">
        {/* User Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex-shrink-0">
              <UserAvatar
                firstName={user.first_name}
                lastName={user.last_name}
                avatarUrl={user.avatar_url}
                size="lg"
                className="border border-gray-200"
              />
            </div>
            <div className="flex-grow">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                {user.first_name} {user.last_name}
              </h1>
              {user.location && (
                <p className="text-gray-600 flex items-center">
                  <MapPinIcon className="h-5 w-5 mr-2 text-[#8ba888]" />
                  {user.location}
                </p>
              )}
            </div>
            {isUser && (
              <div className="mt-4 md:mt-0">
                <form
                  action={navigateToEditProfile}
                >
                  <Button type="submit" className="bg-[#44624a] hover:bg-[#3a553f] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Edit Profile
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
        
        {/* Contact Information */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <IdentificationIcon className="h-5 w-5 mr-2 text-[#44624a]" />
            Contact Information
          </h2>
          <div className="flex items-center text-gray-600 mb-2">
            <EnvelopeIcon className="h-5 w-5 mr-2 text-[#8ba888]" />
            <a href={`mailto:${user.email}`} className="hover:text-[#44624a] transition-colors">
              {user.email}
            </a>
          </div>
        </div>
        
        {/* Professional Summary */}
        {user.summary && (
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <UserCircleIcon className="h-5 w-5 mr-2 text-[#44624a]" />
              Professional Summary
            </h2>
            <p className="text-gray-600">{user.summary}</p>
          </div>
        )}
        
        {/* Skills */}
        {displaySkills.length > 0 && (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <AcademicCapIcon className="h-5 w-5 mr-2 text-[#44624a]" />
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {displaySkills.map((skill: string, index: number) => (
                <span 
                  key={index} 
                  className="bg-[#f0f5f1] text-[#44624a] px-3 py-1 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Experience Section */}
      {experience && experience.length > 0 && (
        <div className="mt-8 rounded-lg bg-white shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <BriefcaseIcon className="h-5 w-5 mr-2 text-[#44624a]" />
              Work Experience
            </h2>
            <div className="space-y-4">
              {experience.map((exp: any) => (
                <div key={exp.id} className="border-l-2 border-[#c0cfb2] pl-4 pb-2">
                  <h3 className="font-medium text-gray-800">{exp.company}</h3>
                  {exp.location && <p className="text-sm text-[#44624a]">{exp.location}</p>}
                  <p className="text-sm text-gray-500">
                    {exp.start_date && formatDate(exp.start_date)} - {exp.end_date ? formatDate(exp.end_date) : 'Present'}
                  </p>
                  {exp.description && (
                    <p className="text-sm text-gray-600 mt-2">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Education Section */}
      {education && education.length > 0 && (
        <div className="mt-8 rounded-lg bg-white shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <AcademicCapIcon className="h-5 w-5 mr-2 text-[#44624a]" />
              Education
            </h2>
            <div className="space-y-4">
              {education.map((edu: any) => (
                <div key={edu.id} className="border-l-2 border-[#c0cfb2] pl-4 pb-2">
                  <h3 className="font-medium text-gray-800">{edu.school}</h3>
                  {edu.degree && <p className="text-sm text-[#44624a]">{edu.degree}</p>}
                  {edu.location && <p className="text-sm text-[#44624a]">{edu.location}</p>}
                  {edu.gpa && <p className="text-sm text-[#44624a]">GPA: {edu.gpa}</p>}
                  <p className="text-sm text-gray-500">
                    {edu.start_date && formatDate(edu.start_date)} - {edu.end_date ? formatDate(edu.end_date) : 'Present'}
                  </p>
                  {edu.description && (
                    <p className="text-sm text-gray-600 mt-2">{edu.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Helper function to format dates
function formatDate(dateString: string) {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  } catch (error) {
    return dateString;
  }
} 
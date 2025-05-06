'use client';

import { UserForm } from '@/app/lib/definitions';
import {
  EnvelopeIcon,
  MapPinIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';
import { UserState, updateUser } from '@/app/lib/actions';
import { useActionState, useState, useEffect } from 'react';
import Avatar from './avatar';
import ProfileCompletion, { ProfileData } from '@/app/ui/profile-completion';

export default function Form({
  user,
  onProfileUpdate,
}: {
  user: UserForm;
  onProfileUpdate?: (updatedUser: Partial<UserForm>) => void;
}) {
  /* Skills */
  const [skills, setSkills] = useState<string[]>(user.skills || []);
  const [input, setInput] = useState<string>("");
  const [errMessage, setErrMessage] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user.avatar_url || null);
  
  // Create a user object that includes the current skills state for the completion component
  const userData: ProfileData = {
    ...user,
    skills,
    avatar_url: avatarUrl
  };

  const addSkill = () => {
    if (input.trim() !== "") {
      setSkills((pre) => [...pre, input.trim()]);
      setInput("");
      setErrMessage("");
    } else {
      setErrMessage("Enter Skill");
    }
  };

  const deleteSkill = (indexToDelete: number) => {
    setSkills(skills.filter((_, index) => index !== indexToDelete));
  };
  
  const initialState: UserState = { message: null, errors: {} };
  const updateUserWithSkills = updateUser.bind(null, skills);
  const [state, formAction] = useActionState(updateUserWithSkills, initialState);

  // Check for successful form submission and notify parent
  useEffect(() => {
    if (state?.message && !state.message.includes('Error') && onProfileUpdate) {
      // Form was successfully submitted
      const updatedProfile: Partial<UserForm> = {
        first_name: user.first_name,
        last_name: user.last_name,
        location: user.location,
        summary: user.summary,
        skills: skills
      };
      
      // Only include avatar_url if it's not null
      if (avatarUrl) {
        updatedProfile.avatar_url = avatarUrl;
      }
      
      // Notify parent component about the update
      onProfileUpdate(updatedProfile);
    }
  }, [state, onProfileUpdate, user.first_name, user.last_name, user.location, user.summary, avatarUrl, skills]);

  return (
    <form action={formAction} className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="rounded-lg bg-white shadow-md p-6 md:p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200">Edit Profile</h1>
        
        {/* Profile Completion Bar */}
        <div className="mb-8">
          <ProfileCompletion
            user={userData}
            showDescription={true}
          />
        </div>
        
        {/* Avatar Section */}
        <div className="mb-8 flex flex-col items-center sm:flex-row sm:items-start gap-6">
          <Avatar
            uid={user.id}
            url={avatarUrl}
            size={100}
            onUpload={(url) => {
              setAvatarUrl(url);
            }}
          />
          <div className="flex-1">
            <h2 className="text-lg font-medium text-gray-800 mb-1">Profile Picture</h2>
            <p className="text-gray-600 text-sm mb-3">Upload a profile picture to personalize your account.</p>
            <p className="text-[#8ba888] text-xs">Recommended: Square image, at least 300x300 pixels</p>
          </div>
        </div>

        {/* Hidden input to store avatar URL */}
        <input 
          type="hidden" 
          name="avatar-url" 
          value={avatarUrl || ''}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email */}
          <div className="col-span-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="relative">
                <input
                  type="text"
                  disabled={true}
                  defaultValue={user.email}
                  className="block w-full rounded-lg border-gray-300 bg-gray-50 py-2.5 pl-10 text-sm text-gray-500 focus:border-[#44624a] focus:ring-1 focus:ring-[#44624a]"
                />
                <EnvelopeIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>

          {/* First Name */}
          <div>
            <label htmlFor="first-name" className="block text-sm font-medium text-gray-700 mb-2">
              First Name <span className="text-red-500">*</span>
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="relative">
                <input
                  id="first-name"
                  name="first-name"
                  type="text"
                  defaultValue={user.first_name}
                  placeholder="Enter your first name"
                  className="block w-full rounded-lg border-gray-300 py-2.5 px-3 text-sm focus:border-[#44624a] focus:ring-1 focus:ring-[#44624a]"
                  aria-describedby="first-name-error"
                  required
                />
              </div>
            </div>

            <div id="first-name-error" aria-live="polite" aria-atomic="true">
              {state.errors?.first_name &&
                state.errors.first_name.map((error: string) => (
                  <p className="mt-2 text-sm text-red-500" key={error}>
                    {error}
                  </p>
                ))}
            </div>
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="last-name" className="block text-sm font-medium text-gray-700 mb-2">
              Last Name <span className="text-red-500">*</span>
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="relative">
                <input
                  id="last-name"
                  name="last-name"
                  type="text"
                  defaultValue={user.last_name}
                  placeholder="Enter your last name"
                  className="block w-full rounded-lg border-gray-300 py-2.5 px-3 text-sm focus:border-[#44624a] focus:ring-1 focus:ring-[#44624a]"
                  aria-describedby="last-name-error"
                  required
                />
              </div>
            </div>

            <div id="last-name-error" aria-live="polite" aria-atomic="true">
              {state.errors?.last_name &&
                state.errors.last_name.map((error: string) => (
                  <p className="mt-2 text-sm text-red-500" key={error}>
                    {error}
                  </p>
                ))}
            </div>
          </div>

          {/* Location */}
          <div className="col-span-full">
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="relative">
                <input
                  id="location"
                  name="location"
                  type="text"
                  defaultValue={user.location}
                  placeholder="Enter a location"
                  className="block w-full rounded-lg border-gray-300 py-2.5 pl-10 text-sm focus:border-[#44624a] focus:ring-1 focus:ring-[#44624a]"
                  aria-describedby="location-error"
                />
                <MapPinIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8ba888]" />
              </div>
            </div>
            
            <div id="location-error" aria-live="polite" aria-atomic="true">
              {state.errors?.location &&
                state.errors.location.map((error: string) => (
                  <p className="mt-2 text-sm text-red-500" key={error}>
                    {error}
                  </p>
                ))}
            </div>
          </div>

          {/* Summary */}
          <div className="col-span-full">
            <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-2">
              Summary
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="relative">
                <textarea
                  id="summary"
                  name="summary"
                  defaultValue={user.summary}
                  placeholder="Enter a summary"
                  rows={4}
                  className="block w-full rounded-lg border-gray-300 py-2.5 px-3 text-sm focus:border-[#44624a] focus:ring-1 focus:ring-[#44624a]"
                  aria-describedby="summary-error"
                />
              </div>
            </div>
            
            <div id="summary-error" aria-live="polite" aria-atomic="true">
              {state.errors?.summary &&
                state.errors.summary.map((error: string) => (
                  <p className="mt-2 text-sm text-red-500" key={error}>
                    {error}
                  </p>
                ))}
            </div>
          </div>

          {/* Skills */}
          <div className="col-span-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skills
            </label>
            <div className="flex space-x-2 mb-3">
              <div className="flex-grow">
                <input
                  type="text"
                  placeholder="Enter a skill"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                  className="block w-full rounded-lg border-gray-300 py-2.5 px-3 text-sm focus:border-[#44624a] focus:ring-1 focus:ring-[#44624a]"
                />
              </div>
              <Button type="button" onClick={addSkill} className="bg-[#44624a] hover:bg-[#3a553f] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Add Skill</Button>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              {skills.map((skill, index) => (
                <div key={index} className="flex items-center bg-[#f0f5f1] text-[#44624a] px-3 py-1 rounded-full text-sm">
                  <span>{skill}</span>
                  <XMarkIcon
                    className="cursor-pointer h-4 w-4 ml-2 text-[#8ba888] hover:text-[#44624a]"
                    onClick={() => deleteSkill(index)}
                  />
                </div>
              ))}
            </div>
            
            {errMessage && (
              <p className="mt-2 text-sm text-red-500">{errMessage}</p>
            )}
          </div>
        </div>
        
        {/* Show the success/error message only if we have one */}
        {state.message && (
          <div
            className={`mt-4 p-3 ${
              state.message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            } rounded-md`}
          >
            {state.message}
          </div>
        )}
        
        <div className="mt-6 flex justify-end gap-4">
          <Button type="submit" className="bg-[#44624a] hover:bg-[#3a553f] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Save Changes
          </Button>
        </div>
      </div>
    </form>
  );
}

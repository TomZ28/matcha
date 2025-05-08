'use client';

import { Experience } from '@/app/lib/definitions';
import {
  BriefcaseIcon,
  PlusCircleIcon,
  PencilIcon,
  TrashIcon,
  MapPinIcon,
  CalendarIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';
import { updateUserExperience } from '@/app/lib/actions';
import { useActionState, useState, useEffect } from 'react';

export default function ExperienceForm({
  userId,
  experience,
}: {
  userId: string;
  experience: Experience[];
}) {
  const [experiences, setExperiences] = useState<Experience[]>(experience || []);
  const [editMode, setEditMode] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Omit<Experience, 'id' | 'userid'>>({
    company: '',
    location: '',
    description: '',
    start_date: '',
    end_date: '',
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Force type compatibility with type assertion
  const initialState = { message: null };
  type ActionType = (state: typeof initialState, formData: FormData) => Promise<typeof initialState>;
  
  const updateExperienceWrapper = ((state: any, formData: FormData) => {
    return updateUserExperience(userId, experiences, { message: null, errors: {} }, formData);
  }) as ActionType;
  
  const [state, formAction] = useActionState(updateExperienceWrapper, initialState);

  const handleFormAction = async (formData: FormData) => {
    formAction(formData);
    setSuccessMessage("Changes saved successfully!");
  };

  const handleAddExperience = () => {
    setShowForm(true);
    setEditMode(null);
    setFormData({
      company: '',
      location: '',
      description: '',
      start_date: '',
      end_date: '',
    });
  };

  const handleEditExperience = (index: number) => {
    const exp = experiences[index];
    setShowForm(true);
    setEditMode(index);
    setFormData({
      company: exp.company || '',
      location: exp.location || '',
      description: exp.description || '',
      start_date: exp.start_date ? formatDateForInput(exp.start_date) : '',
      end_date: exp.end_date ? formatDateForInput(exp.end_date) : '',
    });
  };

  const handleDeleteExperience = (index: number) => {
    const newExperiences = [...experiences];
    newExperiences.splice(index, 1);
    setExperiences(newExperiences);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editMode !== null) {
      // Update existing experience
      const newExperiences = [...experiences];
      newExperiences[editMode] = {
        ...newExperiences[editMode],
        ...formData,
      };
      setExperiences(newExperiences);
    } else {
      // Add new experience
      setExperiences([...experiences, { ...formData, id: Date.now(), userid: userId }]);
    }
    
    setShowForm(false);
    setEditMode(null);
  };

  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };
  
  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <form action={handleFormAction} className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="rounded-lg bg-white shadow-md p-6 md:p-8">
        <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">Work Experience</h1>
          <Button 
            type="button" 
            onClick={handleAddExperience}
            className="bg-[#44624a] hover:bg-[#3a553f] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
          >
            <PlusCircleIcon className="h-5 w-5 mr-1.5" /> Add Experience
          </Button>
        </div>

        {/* Experience List */}
        {experiences.length === 0 ? (
          <div className="text-center py-8">
            <BriefcaseIcon className="h-12 w-12 mx-auto text-gray-400" />
            <p className="mt-2 text-gray-500">No work experience added yet</p>
            <p className="text-sm text-gray-400">Add your professional experience to showcase your career history</p>
          </div>
        ) : (
          <div className="space-y-6">
            {experiences.map((exp, index) => (
              <div key={exp.id || index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800">{exp.company}</h3>
                    <div className="mt-1 text-sm text-gray-600 flex items-center">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      {exp.location || 'No location specified'}
                    </div>
                    <div className="mt-1 text-sm text-gray-600 flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      {formatDateForDisplay(exp.start_date)} - {exp.end_date ? formatDateForDisplay(exp.end_date) : 'Present'}
                    </div>
                    {exp.description && (
                      <div className="mt-2 text-sm text-gray-600">
                        {exp.description}
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => handleEditExperience(index)}
                      className="text-[#44624a] hover:text-[#3a553f] p-1"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteExperience(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Experience Form */}
        {showForm && (
          <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              {editMode !== null ? 'Edit Experience' : 'Add Experience'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-full">
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                  Company/Organization <span className="text-red-500">*</span>
                </label>
                <input
                  id="company"
                  name="company"
                  type="text"
                  value={formData.company}
                  onChange={handleChange}
                  className="block w-full rounded-lg border-gray-300 py-2 px-3 text-sm focus:border-[#44624a] focus:ring-1 focus:ring-[#44624a]"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  value={formData.location || ''}
                  onChange={handleChange}
                  className="block w-full rounded-lg border-gray-300 py-2 px-3 text-sm focus:border-[#44624a] focus:ring-1 focus:ring-[#44624a]"
                />
              </div>
              
              <div>
                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  id="start_date"
                  name="start_date"
                  type="date"
                  value={formData.start_date || ''}
                  onChange={handleChange}
                  className="block w-full rounded-lg border-gray-300 py-2 px-3 text-sm focus:border-[#44624a] focus:ring-1 focus:ring-[#44624a]"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  id="end_date"
                  name="end_date"
                  type="date"
                  value={formData.end_date || ''}
                  onChange={handleChange}
                  className="block w-full rounded-lg border-gray-300 py-2 px-3 text-sm focus:border-[#44624a] focus:ring-1 focus:ring-[#44624a]"
                />
              </div>
              
              <div className="col-span-full">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description || ''}
                  onChange={handleChange}
                  className="block w-full rounded-lg border-gray-300 py-2 px-3 text-sm focus:border-[#44624a] focus:ring-1 focus:ring-[#44624a]"
                />
              </div>
            </div>
            
            <div className="mt-4 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <Button
                type="button"
                onClick={handleSubmit}
                className="bg-[#44624a] hover:bg-[#3a553f] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {editMode !== null ? 'Update' : 'Add'}
              </Button>
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mt-4 bg-green-50 border border-green-200 text-green-800 rounded-md p-3 flex items-center">
            <CheckIcon className="h-5 w-5 mr-2" />
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        <div className="mt-4" aria-live="polite" aria-atomic="true">
          {state.message ? (
            <p className="text-sm text-red-500">{state.message}</p>
          ) : null}
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <Button 
            type="submit" 
            className="bg-[#44624a] hover:bg-[#3a553f] text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </form>
  );
} 
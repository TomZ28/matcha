'use client';

import { Education } from '@/app/lib/definitions';
import {
  AcademicCapIcon,
  PlusCircleIcon,
  PencilIcon,
  TrashIcon,
  MapPinIcon,
  CalendarIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';
import { EducationState, updateUserEducation } from '@/app/lib/actions';
import { useActionState, useState, useEffect } from 'react';

export default function EducationForm({
  userId,
  education,
}: {
  userId: string;
  education: Education[];
}) {
  const [educations, setEducations] = useState<Education[]>(education || []);
  const [editMode, setEditMode] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Omit<Education, 'id' | 'userid'>>({
    school: '',
    degree: '',
    location: '',
    gpa: '',
    description: '',
    start_date: '',
    end_date: '',
  });

  // Force type compatibility with type assertion
  const initialState = { message: null };
  type ActionType = (state: typeof initialState, formData: FormData) => Promise<typeof initialState>;
  
  const updateEducationWrapper = ((state: any, formData: FormData) => {
    return updateUserEducation(userId, educations, { message: null, errors: {} }, formData);
  }) as ActionType;
  
  const [state, formAction] = useActionState(updateEducationWrapper, initialState);
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

  const handleFormAction = async (formData: FormData) => {
    formAction(formData);
    setSuccessMessage("Changes saved successfully!");
  };

  const handleAddEducation = () => {
    setShowForm(true);
    setEditMode(null);
    setFormData({
      school: '',
      degree: '',
      location: '',
      gpa: '',
      description: '',
      start_date: '',
      end_date: '',
    });
  };

  const handleEditEducation = (index: number) => {
    const edu = educations[index];
    setShowForm(true);
    setEditMode(index);
    setFormData({
      school: edu.school || '',
      degree: edu.degree || '',
      location: edu.location || '',
      gpa: edu.gpa || '',
      description: edu.description || '',
      start_date: edu.start_date ? formatDateForInput(edu.start_date) : '',
      end_date: edu.end_date ? formatDateForInput(edu.end_date) : '',
    });
  };

  const handleDeleteEducation = (index: number) => {
    const newEducations = [...educations];
    newEducations.splice(index, 1);
    setEducations(newEducations);
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
      // Update existing education
      const newEducations = [...educations];
      newEducations[editMode] = {
        ...newEducations[editMode],
        ...formData,
      };
      setEducations(newEducations);
    } else {
      // Add new education
      setEducations([...educations, { ...formData, id: Date.now(), userid: userId }]);
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
          <h1 className="text-2xl font-bold text-gray-800">Education</h1>
          <Button 
            type="button" 
            onClick={handleAddEducation}
            className="bg-[#44624a] hover:bg-[#3a553f] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
          >
            <PlusCircleIcon className="h-5 w-5 mr-1.5" /> Add Education
          </Button>
        </div>

        {/* Education List */}
        {educations.length === 0 ? (
          <div className="text-center py-8">
            <AcademicCapIcon className="h-12 w-12 mx-auto text-gray-400" />
            <p className="mt-2 text-gray-500">No education added yet</p>
            <p className="text-sm text-gray-400">Add your educational background to complete your profile</p>
          </div>
        ) : (
          <div className="space-y-6">
            {educations.map((edu, index) => (
              <div key={edu.id || index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800">{edu.school}</h3>
                    {edu.degree && (
                      <div className="text-sm text-[#44624a] font-medium">
                        {edu.degree}
                      </div>
                    )}
                    <div className="mt-1 text-sm text-gray-600 flex items-center">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      {edu.location || 'No location specified'}
                    </div>
                    <div className="mt-1 text-sm text-gray-600 flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      {formatDateForDisplay(edu.start_date)} - {edu.end_date ? formatDateForDisplay(edu.end_date) : 'Present'}
                    </div>
                    {edu.gpa && (
                      <div className="mt-1 text-sm font-medium text-gray-700">
                        GPA: {edu.gpa}
                      </div>
                    )}
                    {edu.description && (
                      <div className="mt-2 text-sm text-gray-600">
                        {edu.description}
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => handleEditEducation(index)}
                      className="text-[#44624a] hover:text-[#3a553f] p-1"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteEducation(index)}
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

        {/* Add/Edit Education Form */}
        {showForm && (
          <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              {editMode !== null ? 'Edit Education' : 'Add Education'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-full">
                <label htmlFor="school" className="block text-sm font-medium text-gray-700 mb-1">
                  School/University <span className="text-red-500">*</span>
                </label>
                <input
                  id="school"
                  name="school"
                  type="text"
                  value={formData.school}
                  onChange={handleChange}
                  className="block w-full rounded-lg border-gray-300 py-2 px-3 text-sm focus:border-[#44624a] focus:ring-1 focus:ring-[#44624a]"
                  required
                />
              </div>
              
              <div className="col-span-full">
                <label htmlFor="degree" className="block text-sm font-medium text-gray-700 mb-1">
                  Degree
                </label>
                <input
                  id="degree"
                  name="degree"
                  type="text"
                  value={formData.degree || ''}
                  onChange={handleChange}
                  className="block w-full rounded-lg border-gray-300 py-2 px-3 text-sm focus:border-[#44624a] focus:ring-1 focus:ring-[#44624a]"
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
                <label htmlFor="gpa" className="block text-sm font-medium text-gray-700 mb-1">
                  GPA
                </label>
                <input
                  id="gpa"
                  name="gpa"
                  type="text"
                  value={formData.gpa || ''}
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
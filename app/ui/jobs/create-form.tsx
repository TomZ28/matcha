'use client';

import Link from 'next/link';
import {
  BriefcaseIcon,
  MapPinIcon,
  ClockIcon,
  BuildingOffice2Icon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';
import { JobState, createJob } from '@/app/lib/actions';
import { useActionState, useState } from 'react';
import { JobType } from '@/app/lib/definitions';

export default function Form({ companyId, companyName }: { companyId: string, companyName: string }) {
  const initialState: JobState = { message: null, errors: {} };
  const [state, formAction] = useActionState(createJob.bind(null, companyId), initialState);
  const [jobType, setJobType] = useState<JobType>('Full-time');

  const jobTypes: JobType[] = [
    'Full-time',
    'Part-time',
    'Contract',
    'Temporary',
    'Internship',
    'Remote'
  ];

  return (
    <form action={formAction} className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="rounded-lg bg-white shadow-md p-6 md:p-8">
        <div className="flex items-center mb-6 pb-2 border-b border-gray-200">
          <BuildingOffice2Icon className="h-6 w-6 text-[#44624a] mr-3" />
          <h1 className="text-2xl font-bold text-gray-800">Create Job Posting for {companyName}</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Job Title */}
          <div className="col-span-full">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Job Title <span className="text-red-500">*</span>
          </label>
            <div className="relative rounded-md shadow-sm">
            <div className="relative">
              <input
                  id="title"
                  name="title"
                type="text"
                  placeholder="Enter job title"
                  className="block w-full rounded-lg border-gray-300 py-2.5 pl-10 text-sm focus:border-[#44624a] focus:ring-1 focus:ring-[#44624a]"
                  aria-describedby="title-error"
                  required
              />
                <BriefcaseIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8ba888]" />
            </div>
          </div>

            <div id="title-error" aria-live="polite" aria-atomic="true">
              {state.errors?.title &&
                state.errors.title.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Location <span className="text-red-500">*</span>
          </label>
            <div className="relative rounded-md shadow-sm">
            <div className="relative">
              <input
                id="location"
                name="location"
                type="text"
                  placeholder="Enter job location"
                  className="block w-full rounded-lg border-gray-300 py-2.5 pl-10 text-sm focus:border-[#44624a] focus:ring-1 focus:ring-[#44624a]"
                aria-describedby="location-error"
                  required
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

          {/* Job Type */}
          <div>
            <label htmlFor="job_type" className="block text-sm font-medium text-gray-700 mb-2">
              Job Type <span className="text-red-500">*</span>
          </label>
            <div className="relative rounded-md shadow-sm">
            <div className="relative">
                <select
                  id="job_type"
                  name="job_type"
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value as JobType)}
                  className="block w-full rounded-lg border-gray-300 py-2.5 pl-10 text-sm focus:border-[#44624a] focus:ring-1 focus:ring-[#44624a]"
                  required
                >
                  {jobTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <ClockIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8ba888]" />
              </div>
            </div>
            
            <div id="job_type-error" aria-live="polite" aria-atomic="true">
              {state.errors?.job_type &&
                state.errors.job_type.map((error: string) => (
                  <p className="mt-2 text-sm text-red-500" key={error}>
                    {error}
                  </p>
                ))}
            </div>
          </div>

          {/* Salary Range (Optional) */}
          <div>
            <label htmlFor="salary_range" className="block text-sm font-medium text-gray-700 mb-2">
              Salary Range (Optional)
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="relative">
                <input
                  id="salary_range"
                  name="salary_range"
                  type="text"
                  placeholder="e.g. $50,000 - $70,000"
                  className="block w-full rounded-lg border-gray-300 py-2.5 pl-10 text-sm focus:border-[#44624a] focus:ring-1 focus:ring-[#44624a]"
                />
                <CurrencyDollarIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8ba888]" />
              </div>
            </div>
            
            <div id="salary_range-error" aria-live="polite" aria-atomic="true">
              {state.errors?.salary_range &&
                state.errors.salary_range.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Description */}
          <div className="col-span-full">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Job Description <span className="text-red-500">*</span>
          </label>
            <div className="relative rounded-md shadow-sm">
            <div className="relative">
              <textarea
                id="description"
                name="description"
                  rows={8}
                  placeholder="Enter job description, responsibilities, requirements, etc."
                  className="block w-full rounded-lg border-gray-300 py-2.5 px-3 text-sm focus:border-[#44624a] focus:ring-1 focus:ring-[#44624a]"
                aria-describedby="description-error"
                  required
              />
            </div>
          </div>

          <div id="description-error" aria-live="polite" aria-atomic="true">
            {state.errors?.description &&
              state.errors.description.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

          <div className="col-span-full" aria-live="polite" aria-atomic="true">
          {state.message ? (
              <p className="text-sm text-red-500 mt-2">{state.message}</p>
          ) : null}
          </div>
        </div>
      </div>
      <div className="mt-8 flex justify-end gap-4">
        <Link
          href={`/dashboard/companies/${companyId}`}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          Cancel
        </Link>
        <Button type="submit" className="bg-[#44624a] hover:bg-[#3a553f] text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
          Create Job
        </Button>
      </div>
    </form>
  );
}

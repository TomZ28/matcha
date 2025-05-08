'use client';

import { CompanyForm } from '@/app/lib/definitions';
import {
  MapPinIcon,
  BuildingOffice2Icon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Button } from '@/app/ui/button';
import { CompanyState, updateCompany } from '@/app/lib/actions';
import { useActionState, useState } from 'react';
import LogoUpload from './logo-upload';

export default function Form({
  company,
}: {
  company: CompanyForm;
}) {
  const [logoUrl, setLogoUrl] = useState<string | null>(company.logo_url || null);
  const initialState: CompanyState = { message: null, errors: {} };
  const updateCompanyWithId = updateCompany.bind(null, company.id);
  const [state, formAction] = useActionState(updateCompanyWithId, initialState);

  return (
    <form action={formAction} className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="rounded-lg bg-white shadow-md p-6 md:p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200">Edit Company</h1>
        
        {/* Logo Section */}
        <div className="mb-8 flex flex-col items-center sm:flex-row sm:items-start gap-6">
          <LogoUpload
            companyId={company.id}
            url={logoUrl}
            size={100}
            onUpload={(url) => {
              setLogoUrl(url);
            }}
          />
          <div className="flex-1">
            <h2 className="text-lg font-medium text-gray-800 mb-1">Company Logo</h2>
            <p className="text-gray-600 text-sm mb-3">Upload a logo to represent your company.</p>
            <p className="text-[#8ba888] text-xs">Recommended: Square image, at least 300x300 pixels</p>
          </div>
        </div>

        {/* Hidden input to store logo URL */}
        <input 
          type="hidden" 
          name="logo-url" 
          value={logoUrl || ''}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Company Name */}
          <div className="col-span-full">
            <label htmlFor="company-name" className="block text-sm font-medium text-gray-700 mb-2">
              Company Name <span className="text-red-500">*</span>
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="relative">
                <input
                  id="company-name"
                  name="company-name"
                  type="text"
                  defaultValue={company.company_name}
                  placeholder="Enter company name"
                  className="block w-full rounded-lg border-gray-300 py-2.5 pl-10 text-sm focus:border-[#44624a] focus:ring-1 focus:ring-[#44624a]"
                  aria-describedby="name-error"
                  required
                />
                <BuildingOffice2Icon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8ba888]" />
              </div>
            </div>

            <div id="name-error" aria-live="polite" aria-atomic="true">
              {state.errors?.company_name &&
                state.errors.company_name.map((error: string) => (
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
                  defaultValue={company.location}
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

          {/* Description */}
          <div className="col-span-full">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="relative">
                <textarea
                  id="description"
                  name="description"
                  defaultValue={company.description}
                  placeholder="Enter a description"
                  rows={4}
                  className="block w-full rounded-lg border-gray-300 py-2.5 px-3 text-sm focus:border-[#44624a] focus:ring-1 focus:ring-[#44624a]"
                  aria-describedby="description-error"
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
        <div className="mt-8 flex justify-end">
          <Link
            href={`/dashboard/companies/${company.id}`}
            className="mr-4 flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
          >
            Cancel
          </Link>
          <Button type="submit" className="bg-[#44624a] hover:bg-[#3a553f] text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">Save Changes</Button>
        </div>
      </div>
    </form>
  );
}
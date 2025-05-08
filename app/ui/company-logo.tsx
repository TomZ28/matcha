'use client';

import Image from 'next/image';
import { BuildingOffice2Icon } from '@heroicons/react/24/outline';
import { createClient } from '../utils/supabase/client';
import { useEffect, useState } from 'react';

interface CompanyLogoProps {
  logoUrl?: string | null;
  companyName?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function CompanyLogo({
  logoUrl,
  companyName = 'Company',
  size = 'md',
  className = '',
}: CompanyLogoProps) {
  const supabase = createClient()
  const [companyLogoUrl, setCompanyLogoUrl] = useState<string | null>(null)

  useEffect(() => {
    async function downloadImage(path: string) {
      const isAbsoluteUrl = (url: string): boolean => {
        return /^https?:\/\//i.test(url);
      };

      if (isAbsoluteUrl(path)) {
        setCompanyLogoUrl(path)
        return;
      }
      
      try {
        const { data } = await supabase.storage.from('logos').getPublicUrl(path)

        if (data?.publicUrl) {
          setCompanyLogoUrl(data.publicUrl)
        }
      } catch (error) {
        console.log('Error downloading image: ', error)
      }
    }

    if (logoUrl) downloadImage(logoUrl)
  }, [logoUrl, supabase])
  
  // Determine dimensions based on size
  const dimensions = {
    sm: { container: 'w-10 h-10', icon: 'w-6 h-6' },
    md: { container: 'w-14 h-14', icon: 'w-8 h-8' },
    lg: { container: 'w-20 h-20', icon: 'w-10 h-10' },
  };

  // Get pixel values for Image component
  const pixelSize = {
    sm: 40,
    md: 56,
    lg: 80,
  };

  if (companyLogoUrl) {
    return (
      <div className={`${dimensions[size].container} overflow-hidden rounded-md border border-gray-200 ${className}`}>
        <Image
          src={companyLogoUrl}
          alt={`${companyName} logo`}
          width={pixelSize[size]}
          height={pixelSize[size]}
          className="object-cover w-full h-full"
        />
      </div>
    );
  }

  return (
    <div className={`${dimensions[size].container} bg-[#e2eae0] rounded-md flex items-center justify-center ${className}`}>
      <BuildingOffice2Icon className={`${dimensions[size].icon} text-[#44624a]`} aria-hidden="true" />
    </div>
  );
} 
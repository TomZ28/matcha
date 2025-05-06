'use client';

import Image from 'next/image';
import { BuildingOffice2Icon } from '@heroicons/react/24/outline';

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

  if (logoUrl) {
    return (
      <div className={`${dimensions[size].container} overflow-hidden rounded-md border border-gray-200 ${className}`}>
        <Image
          src={logoUrl}
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
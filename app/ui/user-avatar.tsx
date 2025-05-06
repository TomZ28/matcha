'use client';

import Image from 'next/image';
import { inter } from '@/app/ui/fonts';

interface UserAvatarProps {
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function UserAvatar({
  firstName = '',
  lastName = '',
  avatarUrl,
  size = 'md',
  className = '',
}: UserAvatarProps) {
  // Determine dimensions based on size
  const dimensions = {
    sm: { container: 'w-10 h-10', font: 'text-lg' },
    md: { container: 'w-14 h-14', font: 'text-xl' },
    lg: { container: 'w-20 h-20', font: 'text-2xl' },
  };

  // Get first initials, handling null or undefined cases
  const firstInitial = firstName?.[0] || '';
  const lastInitial = lastName?.[0] || '';
  const initials = (firstInitial + lastInitial).toUpperCase();

  if (avatarUrl) {
    return (
      <div className={`${dimensions[size].container} ${className}`}>
        <Image
          src={avatarUrl}
          alt={`${firstName} ${lastName}`}
          width={size === 'lg' ? 80 : size === 'md' ? 56 : 40}
          height={size === 'lg' ? 80 : size === 'md' ? 56 : 40}
          className="rounded-full object-cover w-full h-full"
        />
      </div>
    );
  }

  return (
    <div className={`${dimensions[size].container} rounded-full bg-gray-200 flex items-center justify-center ${className}`}>
      <span className={`${inter.className} font-semibold ${dimensions[size].font} text-gray-500`}>
        {initials}
      </span>
    </div>
  );
} 
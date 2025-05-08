'use client';

import Image from 'next/image';
import { inter } from '@/app/ui/fonts';
import { createClient } from '../utils/supabase/client';
import { useEffect, useState } from 'react';

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
  const supabase = createClient()
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    async function downloadImage(path: string) {
      const isAbsoluteUrl = (url: string): boolean => {
        return /^https?:\/\//i.test(url);
      };

      if (isAbsoluteUrl(path)) {
        setUserAvatarUrl(path)
        return;
      }
      
      try {
        const { data } = await supabase.storage.from('avatars').getPublicUrl(path)

        if (data?.publicUrl) {
          setUserAvatarUrl(data.publicUrl)
        }
      } catch (error) {
        console.log('Error downloading image: ', error)
      }
    }

    if (avatarUrl) downloadImage(avatarUrl)
  }, [avatarUrl, supabase])

  // Determine dimensions based on size
  const dimensions = {
    sm: { container: 'w-10 h-10', font: 'text-lg' },
    md: { container: 'w-14 h-14', font: 'text-xl' },
    lg: { container: 'w-20 h-20', font: 'text-2xl' },
  };

  if (userAvatarUrl) {
    return (
      <div className={`${dimensions[size].container} ${className}`}>
        <Image
          src={userAvatarUrl}
          alt={`${firstName} ${lastName}`}
          width={size === 'lg' ? 80 : size === 'md' ? 56 : 40}
          height={size === 'lg' ? 80 : size === 'md' ? 56 : 40}
          className="rounded-full object-cover w-full h-full"
        />
      </div>
    );
  }

  // Get first initials, handling null or undefined cases
  const firstInitial = firstName?.[0] || '';
  const lastInitial = lastName?.[0] || '';
  const initials = (firstInitial + lastInitial).toUpperCase();

  return (
    <div className={`${dimensions[size].container} rounded-full bg-gray-200 flex items-center justify-center ${className}`}>
      <span className={`${inter.className} font-semibold ${dimensions[size].font} text-gray-500`}>
        {initials}
      </span>
    </div>
  );
} 
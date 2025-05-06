'use client';

import { UserIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';
import Link from 'next/link';

interface MatchaLogoProps {
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  theme?: 'light' | 'dark';
  className?: string;
  linkToHome?: boolean;
}

export default function MatchaLogo({
  showText = true,
  size = 'md',
  theme = 'light',
  className = '',
  linkToHome = true,
}: MatchaLogoProps) {
  // Size configurations
  const sizes = {
    sm: {
      container: 'w-7 h-7',
      icon: 'h-4 w-4',
      text: 'text-sm',
      padding: 'p-0.5',
    },
    md: {
      container: 'w-8 h-8',
      icon: 'h-5 w-5',
      text: 'text-lg',
      padding: 'p-1',
    },
    lg: {
      container: 'w-10 h-10',
      icon: 'h-6 w-6',
      text: 'text-xl',
      padding: 'p-1',
    },
  };

  // Theme configurations
  const themes = {
    light: {
      background: 'bg-[#e2eae0]',
      iconBackground: 'bg-[#44624a]',
      iconColor: 'text-white',
      textColor: 'text-[#44624a]',
    },
    dark: {
      background: 'bg-[#44624a]',
      iconBackground: 'bg-[#e2eae0]',
      iconColor: 'text-[#44624a]',
      textColor: 'text-white',
    },
  };

  const logoContent = (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${themes[theme].iconBackground} rounded-full ${sizes[size].padding} ${sizes[size].container} flex items-center justify-center ${showText ? 'mr-2' : ''}`}>
        <UserIcon className={`${sizes[size].icon} ${themes[theme].iconColor}`} />
      </div>
      {showText && (
        <span className={`${lusitana.className} ${sizes[size].text} font-bold ${themes[theme].textColor}`}>
          Matcha
        </span>
      )}
    </div>
  );

  // If linkToHome is true, wrap the logo with a Link component
  if (linkToHome) {
    return (
      <Link href="/" className="flex items-center">
        {logoContent}
      </Link>
    );
  }

  // Otherwise, just return the logo
  return logoContent;
} 
'use client';

import {
  UserGroupIcon,
  HomeIcon,
  UserCircleIcon,
  MagnifyingGlassIcon,
  ClipboardDocumentCheckIcon,
  BuildingOffice2Icon,
  BriefcaseIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import clsx from 'clsx';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.
const links = [
  { name: 'Home', href: '/dashboard', icon: HomeIcon },
  { name: 'Jobs', href: '/dashboard/jobs', icon: MagnifyingGlassIcon },
  { name: 'Applications', href: '/dashboard/applications', icon: ClipboardDocumentCheckIcon },
  { name: 'Talent Network', href: '/dashboard/users', icon: UserGroupIcon },
  { name: 'Companies', href: '/dashboard/companies', icon: BuildingOffice2Icon },
  { name: 'Hire', href: '/dashboard/hire', icon: BriefcaseIcon },
  { name: 'Profile', href: '/dashboard/profile', icon: UserCircleIcon },
];

// Storage key for profile completion state
const PROFILE_COMPLETE_KEY = 'matcha_profile_complete';

export default function NavLinks() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [hasCompleteProfile, setHasCompleteProfile] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to check user profile - checks database and caches result
  const checkUserProfile = async (forceRefresh = false) => {
    setIsLoading(true);
    try {
      // Check localStorage first if not forcing refresh
      if (!forceRefresh && typeof window !== 'undefined') {
        const cachedStatus = localStorage.getItem(PROFILE_COMPLETE_KEY);
        if (cachedStatus) {
          setHasCompleteProfile(cachedStatus === 'true');
          setIsLoading(false);
          return;
        }
      }

      // If no cached value or forced refresh, check from database
      const supabase = createClient();
      
      const {
        data: { user },
      } = await supabase.auth.getUser();
      
      if (!user) {
        setHasCompleteProfile(false);
        if (typeof window !== 'undefined') {
          localStorage.setItem(PROFILE_COMPLETE_KEY, 'false');
        }
        return;
      }

      const { data: profile, error } = await supabase
        .from('userprofiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();

      // Check if profile exists and has first and last name
      const isComplete = !!profile && !!profile.first_name && !!profile.last_name;
      setHasCompleteProfile(isComplete);
      
      // Cache the result
      if (typeof window !== 'undefined') {
        localStorage.setItem(PROFILE_COMPLETE_KEY, isComplete ? 'true' : 'false');
      }
    } catch (err) {
      console.error('Error checking profile:', err);
      setHasCompleteProfile(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Check for profile_completed parameter - this is set by the server when profile is completed
  useEffect(() => {
    const profileCompleted = searchParams.get('profile_completed');
    if (profileCompleted === '1') {
      // Update local state immediately without querying the database
      setHasCompleteProfile(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem(PROFILE_COMPLETE_KEY, 'true');
      }
      
      // Clean up the URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('profile_completed');
      newUrl.searchParams.delete('t');
      window.history.replaceState({}, '', newUrl.toString());
    } else {
      // Normal case - check on initial load
      checkUserProfile(false);
    }
  }, [searchParams]);

  // Listen for profile update events
  useEffect(() => {
    const handleProfileUpdate = (event: CustomEvent) => {
      if (event.detail?.hasCompleteProfile) {
        setHasCompleteProfile(true);
        // Update localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem(PROFILE_COMPLETE_KEY, 'true');
        }
      } else {
        // Recheck the profile status
        checkUserProfile(true); // Force refresh
      }
    };

    // Add event listener for profile updates
    window.addEventListener('profile-updated', handleProfileUpdate as EventListener);

    // Special case: clear cache when visiting profile page
    if (pathname === '/dashboard/profile') {
      localStorage.removeItem(PROFILE_COMPLETE_KEY);
    }

    // Cleanup
    return () => {
      window.removeEventListener('profile-updated', handleProfileUpdate as EventListener);
    };
  }, [pathname]);

  // While loading on first render, only show Profile
  // Otherwise use cached value to avoid flicker
  const filteredLinks = isLoading && hasCompleteProfile === null
    ? links.filter(link => link.name === 'Profile')
    : hasCompleteProfile === false
      ? links.filter(link => link.name === 'Profile')
      : links;

  return (
    <div className="flex flex-row sm:flex-col sm:space-y-1 overflow-x-auto sm:overflow-visible gap-2 sm:gap-0">
      {filteredLinks.map((link) => {
        const LinkIcon = link.icon;
        const isActive = pathname === link.href;
        
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              'flex items-center justify-center sm:justify-start gap-3 rounded-lg px-2 sm:px-3 py-2 sm:py-2.5 text-sm font-medium transition-colors whitespace-nowrap',
              {
                'bg-gradient-to-r from-[#44624a] to-[#507a5a] text-white shadow-sm': isActive,
                'text-gray-600 hover:bg-[#c0cfb2] hover:text-[#44624a]': !isActive,
              },
            )}
          >
            <LinkIcon className={clsx('h-5 w-5', {
              'text-white': isActive,
              'text-[#8ba888]': !isActive,
            })} />
            <span className="hidden sm:inline">{link.name}</span>
          </Link>
        );
      })}
    </div>
  );
}

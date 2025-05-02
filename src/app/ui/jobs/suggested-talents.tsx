'use client';

import { fetchPaginatedSuggestedUsersByJobId } from '@/app/lib/data';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';
import UserAvatar from '@/app/ui/user-avatar';

interface SuggestedTalentsProps {
  jobId: string;
  initialLimit?: number;
  isFullPage?: boolean;
}

export default function SuggestedTalents({ 
  jobId, 
  initialLimit = 6,
  isFullPage = false 
}: SuggestedTalentsProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { ref, inView } = useInView({
    rootMargin: '100px',
  });

  // Load initial data
  useEffect(() => {
    const loadInitialUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedUsers = await fetchPaginatedSuggestedUsersByJobId(jobId, 1, initialLimit);
        setUsers(fetchedUsers);
        setHasMore(fetchedUsers.length >= initialLimit);
        setPage(2); // Next load will be page 2
      } catch (error) {
        console.error('Error fetching suggested talents:', error);
        setError('Failed to load suggested talents. Please try again.');
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };

    loadInitialUsers();
  }, [jobId, initialLimit]);

  // Load more users when scrolling (for full page view)
  const loadMoreUsers = async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const newUsers = await fetchPaginatedSuggestedUsersByJobId(jobId, page, initialLimit);
      
      if (newUsers.length === 0) {
        setHasMore(false);
      } else {
        setUsers(prev => [...prev, ...newUsers]);
        
        if (newUsers.length < initialLimit) {
          setHasMore(false);
        } else {
          setPage(prevPage => prevPage + 1);
        }
      }
    } catch (error) {
      console.error('Error fetching more talents:', error);
      setError('Failed to load more talents. Please try again.');
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  // Load more when reaching the end of the page (only on full page view)
  useEffect(() => {
    if (inView && hasMore && !loading && isFullPage) {
      loadMoreUsers();
    }
  }, [inView, hasMore, loading, isFullPage]);

  // Helper function for display name with fallback
  const getDisplayName = (user: any) => {
    const firstName = user.first_name || 'Matcha';
    const lastName = user.last_name || 'User';
    return `${firstName} ${lastName}`;
  };

  // Helper function to capitalize first letter
  const capitalizeFirstLetter = (text: string): string => {
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  return (
    <div className="w-full">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {loading && users.length === 0 ? (
        <div className="flex justify-center items-center py-16">
          <div className="w-12 h-12 border-t-2 border-[#8ba888] rounded-full animate-spin"></div>
          <p className="ml-4 text-gray-600">Loading suggested talents...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No suggested talents found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {users.map((user) => {
            // Set fallback values for first and last name
            const firstName = user.first_name || 'Matcha';
            const lastName = user.last_name || 'User';

            return (
              <Link 
                key={user.id} 
                href={`/dashboard/users/${user.id}`}
                className="block transition-transform hover:scale-105"
              >
                <div className="bg-white shadow-md rounded-lg overflow-hidden border border-[#c0cfb2] h-full flex flex-col hover:shadow-lg">
                  <div className="p-4 flex items-start gap-4">
                    <UserAvatar 
                      firstName={firstName}
                      lastName={lastName}
                      avatarUrl={user.avatar_url}
                      size="lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-[#44624a] text-lg">
                        {firstName} {lastName}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">{user.email}</p>
                      
                      <div className="flex items-center gap-3 mt-2">
                        {user.match_percent && (
                          <div className="px-3 py-1 rounded-full text-sm font-medium bg-[#c0cfb2] text-[#44624a]">
                            {user.match_percent}% Match
                          </div>
                        )}
                        
                        {user.application?.applicationid ? (
                          <div className="px-3 py-1 rounded-full text-sm font-medium bg-[#44624a] text-white">
                            {capitalizeFirstLetter(user.application.application_status || 'applied')}
                          </div>
                        ) : (
                          <div className="px-3 py-1 rounded-full text-sm font-medium bg-[#e2eae0] text-[#44624a]">
                            Not Applied
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {user.summary && (
                    <div className="px-4 pb-4 pt-0">
                      <p className="text-gray-600 text-sm line-clamp-2">{user.summary}</p>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
      
      {hasMore && isFullPage && (
        <div ref={ref} className="flex justify-center mt-8 mb-6">
          {loading ? (
            <div className="w-8 h-8 border-t-2 border-[#8ba888] rounded-full animate-spin"></div>
          ) : (
            <div className="h-10"></div> 
          )}
        </div>
      )}
    </div>
  );
} 
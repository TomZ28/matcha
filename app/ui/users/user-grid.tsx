'use client';

import { UserForm } from '@/app/lib/definitions';
import { fetchPaginatedUsers } from '@/app/lib/data';
import { inter } from '@/app/ui/fonts';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useSearchParams } from 'next/navigation';
import UserSearch from './user-search';
import { MapPinIcon } from '@heroicons/react/24/outline';
import UserAvatar from '@/app/ui/user-avatar';

export default function UserGrid({ initialUsers }: { initialUsers: UserForm[] }) {
  const [users, setUsers] = useState<UserForm[]>(initialUsers);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(initialUsers.length === 0);
  const { ref, inView } = useInView({
    rootMargin: '100px',
  });
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';

  // Load initial data effect
  useEffect(() => {
    const loadInitialUsers = async () => {
      if (!initialLoading) return;
      
      try {
        const loadedUsers = await fetchPaginatedUsers(query, 1, 12);
        setUsers(loadedUsers);
        setHasMore(loadedUsers.length >= 12);
        setPage(3); // Next load will be page 3
      } catch (error) {
        console.error('Error loading initial users:', error);
        setHasMore(false);
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    };

    loadInitialUsers();
  }, [query, initialLoading]);

  // Reset when query changes
  useEffect(() => {
    setUsers([]);
    setPage(1);
    setHasMore(true);
    setLoading(true);
    setInitialLoading(true);
  }, [query]);

  // Load more users effect
  useEffect(() => {
    const loadMoreUsers = async () => {
      // Skip loading if already loading, no more users, or still loading initial data
      if (loading || !hasMore || initialLoading) return;
      
      setLoading(true);
      try {
        const newUsers = await fetchPaginatedUsers(query, page);
        
        if (newUsers.length === 0) {
          setHasMore(false);
        } else {
          setUsers(prevUsers => [...prevUsers, ...newUsers]);
          
          // If we got fewer than 6 items, there are no more users to load
          if (newUsers.length < 6) {
            setHasMore(false);
          } else {
            setPage(prevPage => prevPage + 1);
          }
        }
      } catch (error) {
        console.error('Error fetching more users:', error);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };

    if (inView && hasMore && !loading && !initialLoading) {
      loadMoreUsers();
    }
  }, [inView, query, page, loading, hasMore, initialLoading]);

  // Helper function to get first two skills
  const getDisplaySkills = (skills: string[] | null | undefined) => {
    if (!skills || !skills.length) return [];
    // Filter out "None" and empty skills and limit to 2
    return skills.slice(0, 2);
  };

  return (
    <div className="w-full">
      <h1 className={`${inter.className} font-semibold mb-8 text-xl md:text-2xl text-[#44624a]`}>
        Talent Network
      </h1>
      <UserSearch placeholder="Search users by name, location, or skills..." />
      
      {initialLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-12 h-12 border-t-2 border-[#8ba888] rounded-full animate-spin"></div>
          <p className="ml-4 text-gray-600">Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No users found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <Link 
              key={user.id} 
              href={`/dashboard/users/${user.id}`}
              className="block transition-transform hover:scale-105"
            >
              <div className="bg-white shadow-md rounded-lg overflow-hidden border border-[#c0cfb2] h-full flex flex-col hover:shadow-lg">
                <div className="p-4 bg-[#44624a]">
                  <div className="flex items-center gap-4">
                    <div className="bg-white rounded-full p-1 flex items-center justify-center">
                      <UserAvatar
                        firstName={user.first_name}
                        lastName={user.last_name}
                        avatarUrl={user.avatar_url}
                        size="md"
                      />
                    </div>
                    <h2 className="text-white font-semibold text-lg">
                      {user.first_name} {user.last_name}
                    </h2>
                  </div>
                </div>
                <div className="p-4 flex-grow">
                  {user.location && (
                    <p className="text-gray-700 text-sm mb-2 flex items-center">
                      <MapPinIcon className="h-4 w-4 text-[#44624a] mr-1 flex-shrink-0" />
                      <span>{user.location}</span>
                    </p>
                  )}
                  
                  {/* Skills */}
                  {getDisplaySkills(user.skills).length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-[#44624a] mb-1">Skills:</p>
                      <div className="flex flex-wrap gap-2">
                        {getDisplaySkills(user.skills).map((skill, index) => (
                          <span 
                            key={index} 
                            className="bg-[#f0f5f1] text-[#44624a] px-2 py-1 rounded-full text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Summary */}
                  {user.summary && (
                    <div>
                      <p className="text-sm font-medium text-[#44624a] mb-1">Summary:</p>
                      <p className="text-gray-600 text-sm line-clamp-3">
                        {user.summary}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      
      {hasMore && (
        <div ref={ref} className="flex justify-center mt-8 mb-6">
          {loading && !initialLoading ? (
            <div className="w-8 h-8 border-t-2 border-[#8ba888] rounded-full animate-spin"></div>
          ) : (
            <div className="h-10"></div> 
          )}
        </div>
      )}
    </div>
  );
} 
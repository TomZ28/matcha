'use client';

import { FormattedCompaniesTable } from '@/app/lib/definitions';
import { fetchPaginatedCompanies } from '@/app/lib/data';
import { inter } from '@/app/ui/fonts';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useSearchParams } from 'next/navigation';
import CompanySearch from './company-search';
import { MapPinIcon } from '@heroicons/react/24/outline';
import CompanyLogo from '@/app/ui/company-logo';

export default function CompanyGrid({ initialCompanies }: { initialCompanies: FormattedCompaniesTable[] }) {
  const [companies, setCompanies] = useState<FormattedCompaniesTable[]>(initialCompanies);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(initialCompanies.length === 0);
  const { ref, inView } = useInView({
    rootMargin: '100px',
  });
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';

  // Load initial data effect
  useEffect(() => {
    const loadInitialCompanies = async () => {
      if (!initialLoading) return;
      
      try {
        const loadedCompanies = await fetchPaginatedCompanies(query, 1, 12);
        setCompanies(loadedCompanies);
        setHasMore(loadedCompanies.length >= 12);
        setPage(3); // Next load will be page 3
      } catch (error) {
        console.error('Error loading initial companies:', error);
        setHasMore(false);
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    };

    loadInitialCompanies();
  }, [query, initialLoading]);

  // Reset when query changes
  useEffect(() => {
    setCompanies([]);
    setPage(1);
    setHasMore(true);
    setLoading(true);
    setInitialLoading(true);
  }, [query]);

  // Load more companies effect
  useEffect(() => {
    const loadMoreCompanies = async () => {
      if (loading || !hasMore || initialLoading) return;
      
      setLoading(true);
      try {
        const newCompanies = await fetchPaginatedCompanies(query, page);
        
        if (newCompanies.length === 0) {
          setHasMore(false);
        } else {
          setCompanies(prevCompanies => [...prevCompanies, ...newCompanies]);
          
          if (newCompanies.length < 6) {
            setHasMore(false);
          } else {
            setPage(prevPage => prevPage + 1);
          }
        }
      } catch (error) {
        console.error('Error fetching more companies:', error);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };

    if (inView && hasMore && !loading && !initialLoading) {
      loadMoreCompanies();
    }
  }, [inView, query, page, loading, hasMore, initialLoading]);

  return (
    <div className="w-full">
      <h1 className={`${inter.className} font-semibold mb-8 text-xl md:text-2xl text-[#44624a]`}>
        Companies
      </h1>
      <CompanySearch placeholder="Search companies..." />
      
      {initialLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-12 h-12 border-t-2 border-[#8ba888] rounded-full animate-spin"></div>
          <p className="ml-4 text-gray-600">Loading companies...</p>
        </div>
      ) : companies.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No companies found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <Link 
              key={company.id} 
              href={`/dashboard/companies/${company.id}`}
              className="block transition-transform hover:scale-105"
            >
              <div className="bg-white shadow-md rounded-lg overflow-hidden border border-[#c0cfb2] h-full flex flex-col hover:shadow-lg">
                <div className="p-4 bg-[#44624a]">
                  <div className="flex items-center gap-4">
                    <CompanyLogo
                      logoUrl={company.logo_url}
                      companyName={company.company_name}
                      size="md"
                      className="bg-white p-1"
                    />
                    <h2 className="text-white font-semibold text-lg truncate">{company.company_name}</h2>
                  </div>
                </div>
                <div className="p-4 flex-grow">
                  <p className="text-gray-700 text-sm mb-2 flex items-center">
                    <MapPinIcon className="h-4 w-4 text-[#44624a] mr-1 flex-shrink-0" />
                    <span>{company.location || 'N/A'}</span>
                  </p>
                  <p className="text-gray-600 text-sm line-clamp-3">
                    {company.description || 'No description available'}
                  </p>
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
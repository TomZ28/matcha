import { ArrowRightIcon, UserIcon, BriefcaseIcon, BuildingOffice2Icon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { lusitana } from '@/app/ui/fonts';
import Image from 'next/image';
import MatchaLogo from '@/app/ui/matcha-logo';

export default function Page() {
  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <MatchaLogo size="md" theme="light" />
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/login" 
                className="text-[#44624a] hover:text-[#3a553f] px-3 py-2 text-sm font-medium"
              >
                Sign In
              </Link>
              <Link 
                href="/signup" 
                className="bg-[#44624a] hover:bg-[#3a553f] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
      </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#f0f5f1] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className={`${lusitana.className} text-4xl md:text-5xl font-bold text-gray-900 mb-6`}>
                Connect with top talent and opportunities
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Matcha helps companies find the perfect candidates and job seekers land their dream roles.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 bg-[#44624a] hover:bg-[#3a553f] text-white px-6 py-3 rounded-lg font-medium transition-colors text-center"
                >
                  <span>Get Started</span> 
                  <ArrowRightIcon className="w-5 h-5" />
                </Link>
                <Link
                  href="/dashboard/jobs"
                  className="flex items-center justify-center gap-2 border-2 border-[#44624a] text-[#44624a] hover:bg-[#f0f5f1] px-6 py-3 rounded-lg font-medium transition-colors text-center"
                >
                  <span>Browse Jobs</span>
                </Link>
              </div>
            </div>
            <div className="relative h-64 md:h-auto">
              <Image
                src="/placeholder-company.svg"
                alt="Professional workplace with people collaborating"
                width={600}
                height={500}
                className="rounded-lg shadow-lg object-contain bg-white p-6"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className={`${lusitana.className} text-3xl font-bold text-center text-gray-900 mb-12`}>
            Why Choose Matcha?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#f0f5f1] rounded-lg p-6 transition-transform hover:scale-105">
              <div className="bg-[#44624a] rounded-full h-12 w-12 flex items-center justify-center mb-4">
                <UserIcon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">For Job Seekers</h3>
              <p className="text-gray-600">
                Create a professional profile, showcase your skills, and connect with companies looking for talent like you.
              </p>
            </div>
            
            <div className="bg-[#f0f5f1] rounded-lg p-6 transition-transform hover:scale-105">
              <div className="bg-[#44624a] rounded-full h-12 w-12 flex items-center justify-center mb-4">
                <BriefcaseIcon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">For Employers</h3>
              <p className="text-gray-600">
                Post job opportunities, review applications, and find the perfect candidate for your company's needs.
              </p>
            </div>
            
            <div className="bg-[#f0f5f1] rounded-lg p-6 transition-transform hover:scale-105">
              <div className="bg-[#44624a] rounded-full h-12 w-12 flex items-center justify-center mb-4">
                <BuildingOffice2Icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Matching</h3>
              <p className="text-gray-600">
                Our intelligent algorithm matches candidates with jobs based on skills, experience, and preferences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#44624a] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className={`${lusitana.className} text-3xl font-bold text-white mb-6`}>
            Ready to find your perfect match?
          </h2>
          <p className="text-[#c0cfb2] text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of professionals and companies already using Matcha to connect and grow.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 bg-white text-[#44624a] hover:bg-[#f0f5f1] px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <span>Sign In</span>
            <ArrowRightIcon className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <MatchaLogo size="sm" theme="light" />
          </div>
          <div className="mt-4 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Matcha. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}

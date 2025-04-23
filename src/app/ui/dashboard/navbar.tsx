import NavLinks from '@/app/ui/dashboard/navbar-links';
import { PowerIcon } from '@heroicons/react/24/outline';
import { signout } from '@/auth/auth';
import MatchaLogo from '@/app/ui/matcha-logo';

export default function Navbar() {
  return (
    <div className="flex h-full flex-col bg-white shadow-sm">
      {/* Logo - hidden on mobile, visible on larger screens */}
      <div className="hidden sm:block p-3">
        <div className="flex items-center justify-center rounded-lg bg-[#e2eae0] py-2 px-3">
          <MatchaLogo size="md" theme="light" />
        </div>
      </div>
      
      <div className="flex flex-1 flex-col justify-between sm:px-3 sm:py-2 md:px-4">
        {/* Mobile: horizontal navigation at top */}
        <nav className="flex-1 flex sm:block py-2 sm:py-0 px-1 sm:px-0 items-center justify-center sm:justify-start overflow-x-auto">
          <NavLinks />
          
          {/* Sign out button - ONLY on mobile it's part of the horizontal nav */}
          <div className="sm:hidden ml-1">
            <form
              action={async () => {
                'use server';
                await signout();
              }}
            >
              <button className="flex items-center justify-center gap-3 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-[#c0cfb2] hover:text-[#44624a] transition-colors w-full">
                <PowerIcon className="h-5 w-5 text-[#8ba888]" />
              </button>
            </form>
          </div>
        </nav>
        
        {/* Sign out button - ONLY for non-mobile view, positioned at bottom */}
        <div className="hidden sm:block mt-auto">
          <form
            action={async () => {
              'use server';
              await signout();
            }}
          >
            <button className="w-full flex items-center justify-start gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-[#c0cfb2] hover:text-[#44624a] transition-colors">
              <PowerIcon className="h-5 w-5 text-[#8ba888]" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

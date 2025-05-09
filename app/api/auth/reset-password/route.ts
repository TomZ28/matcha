import { createClient } from '@/app/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET handler for password reset confirmation
 * 
 * This route verifies the OTP token_hash from the reset password email
 * and redirects to the reset-password page if successful.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token_hash = searchParams.get('token_hash');
  
  // Redirect to login if no token_hash is provided
  if (!token_hash) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const supabase = await createClient();
    
    // Verify the OTP token for password reset
    const { error } = await supabase.auth.verifyOtp({
      type: 'recovery',
      token_hash
    });

    if (error) {
      console.error('Token verification error:', error);
      // Redirect to login with error
      return NextResponse.redirect(
        new URL('/login?error=Invalid+or+expired+reset+link', request.url)
      );
    }

    // Successfully verified, redirect to reset-password page
    return NextResponse.redirect(new URL('/reset-password', request.url));
  } catch (error) {
    console.error('Error during password reset confirmation:', error);
    return NextResponse.redirect(
      new URL('/error', request.url)
    );
  }
}

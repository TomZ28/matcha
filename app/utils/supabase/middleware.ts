import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // refreshing the auth token
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // No user - redirect to login
    if (
        !user &&
        !request.nextUrl.pathname.startsWith('/login') &&
        !request.nextUrl.pathname.startsWith('/auth') &&
        !request.nextUrl.pathname.startsWith('/signup') &&
        request.nextUrl.pathname !== '/'
    ) {
        // no user, potentially respond by redirecting the user to the login page
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // User exists but check if they have completed their profile
    if (
        user &&
        !request.nextUrl.pathname.startsWith('/dashboard/profile') &&
        !request.nextUrl.pathname.startsWith('/auth') &&
        request.nextUrl.pathname !== '/' &&
        request.nextUrl.pathname !== '/login' &&
        request.nextUrl.pathname !== '/signup'
    ) {
        // Check if user has first_name and last_name in userprofiles table
        const { data: profile, error } = await supabase
            .from('userprofiles')
            .select('first_name, last_name')
            .eq('id', user.id)
            .single();

        // If profile doesn't exist or is missing first/last name, redirect to profile page
        if (error || !profile || !profile.first_name || !profile.last_name) {
            const url = request.nextUrl.clone()
            url.pathname = '/dashboard/profile'
            const response = NextResponse.redirect(url)
            
            // Add cache control headers to prevent caching
            response.headers.set('Cache-Control', 'no-store, max-age=0')
            return response
        }
    }

    // Add cache control headers to prevent middleware results from being cached
    supabaseResponse.headers.set('Cache-Control', 'no-store, max-age=0')
    return supabaseResponse
}
'use server'

import { createServerClient } from '@supabase/ssr'

export async function createAdminClient() {

    // Create a server's supabase client with newly configured cookie,
    // which could be used to maintain user's session
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SECRET_KEY!,
        {
            cookies: {
                getAll() {
                    return [];
                },
            },
        }
    )
}
import { createClient } from '@/app/utils/supabase/server'
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const getURL = () => {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
    'http://localhost:3000/'
  // Make sure to include `https://` when not localhost.
  url = url.startsWith('http') ? url : `https://${url}`
  // Make sure to include a trailing `/`.
  url = url.endsWith('/') ? url : `${url}/`
  return url
}

export async function login(formData: FormData) {
  try {
    const supabase = await createClient()

    const rawFormData = {
      email: formData.get('email'),
      password: formData.get('password'),
      redirectTo: formData.get('redirectTo')
    }

    const parsedFormData = z
      .object({
        email: z.string().email(),
        password: z.string(),
        redirectTo: z.string()
      })
      .safeParse(rawFormData);
    
    if (!parsedFormData.success) {
      throw new Error('Invalid credentials.');
    }
    
    const data = parsedFormData.data;
  
    const { error } = await supabase.auth.signInWithPassword(data);
  
    if (error) {
      throw error;
    }
  } catch (error) {
    console.log(error)
    redirect('/error')
  }
}

export async function signup(formData: FormData) {
  try {
    const supabase = await createClient()

    const rawFormData = {
      email: formData.get('email'),
      password: formData.get('password'),
      redirectTo: formData.get('redirectTo')
    }

    const parsedFormData = z
      .object({
        email: z.string().email(),
        password: z.string(),
        redirectTo: z.string()
      })
      .safeParse(rawFormData);
    
    if (!parsedFormData.success) {
      throw new Error('Invalid credentials.');
    }
    
    const data = parsedFormData.data;
  
    const { error } = await supabase.auth.signUp({
      ...data,
      options: {
        emailRedirectTo: getURL() + 'login'
      }
    });
  
    if (error) {
      throw error;
    }
  } catch (error) {
    console.log(error)
    redirect('/error')
  }
}

export async function signout() {
  const supabase = await createClient()

  // Check if a user's logged in
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    await supabase.auth.signOut()
  }

  revalidatePath('/', 'layout')
  redirect('/login')
}


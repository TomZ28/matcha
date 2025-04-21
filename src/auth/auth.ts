import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

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
  
    const { error } = await supabase.auth.signUp(data);
  
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


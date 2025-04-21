import { z } from 'zod';
import { signup } from '@/auth/auth';

type SignupState = {
    message?: string | null;
    success: boolean;
  };
  
  export async function signupAction(prevState: SignupState, formData: FormData): Promise<SignupState> {
    try {
      const validatedFields = z.object({
        email: z.string().email(),
        password: z.string().min(6),
        redirectTo: z.string()
      }).safeParse({
        email: formData.get('email'),
        password: formData.get('password'),
        redirectTo: formData.get('redirectTo')
      });
  
      if (!validatedFields.success) {
        return { 
          message: 'Invalid email or password. Password must be at least 6 characters.',
          success: false 
        };
      }
  
      await signup(formData);
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return { 
        message: 'An error occurred during signup. Please try again.', 
        success: false 
      };
    }
  }
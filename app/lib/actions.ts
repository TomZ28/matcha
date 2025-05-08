'use server';

import { z } from 'zod';
import { signup, login, forgotPassword, resetPassword } from '@/app/auth/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/app/utils/supabase/server';
import { getEmbedding } from '@/app/utils/gemini/embeddings';
import { createAdminClient } from '@/app/utils/supabase/admin';

const CompanyFormSchema = z.object({
  company_name: z.string(),
  location: z.string(),
  description: z.string(),
  logo_url: z.string().optional().nullable(),
});

const JobFormSchema = z.object({
  title: z.string(),
  location: z.string(),
  description: z.string(),
  job_type: z.enum(['Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship', 'Remote']),
  salary_range: z.string().optional(),
});

const UserFormSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
  summary: z.string().optional().nullable(),
  skills: z.array(z.string()).optional().nullable(),
  location: z.string().optional().nullable(),
  avatar_url: z.string().optional().nullable(),
});

export type CompanyState = {
  errors?: {
    company_name?: string[];
    location?: string[];
    description?: string[];
    logo_url?: string[];
  };
  message?: string | null;
};

export type JobState = {
  errors?: {
    title?: string[];
    location?: string[];
    description?: string[];
    job_type?: string[];
    salary_range?: string[];
  };
  message?: string | null;
};

export type UserState = {
  errors?: {
    first_name?: string[];
    last_name?: string[];
    summary?: string[];
    skills?: string[];
    location?: string[];
    avatar_url?: string[];
  };
  message?: string | null;
};

export type EducationState = {
  errors?: {
    school?: string[];
    degree?: string[];
    location?: string[];
    gpa?: string[];
    description?: string[];
    start_date?: string[];
    end_date?: string[];
  };
  message?: string | null;
};

export type ExperienceState = {
  errors?: {
    company?: string[];
    location?: string[];
    description?: string[];
    start_date?: string[];
    end_date?: string[];
  };
  message?: string | null;
};

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

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await login(formData);
    redirect('/dashboard')
  } catch (error) {
    if (error) {
      return 'Invalid credentials.';
    }
    throw error;
  }
}

export async function createCompany(prevState: CompanyState, formData: FormData) {
  const rawFormData = {
    company_name: formData.get('company-name'),
    location: formData.get('location'),
    description: formData.get('description'),
    logo_url: formData.get('logo-url'),
  }

  const parsedFormData = CompanyFormSchema.safeParse(rawFormData);

  if (!parsedFormData.success) {
    console.log(rawFormData)
    return {
      errors: parsedFormData.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to create company.',
    };
  }

  const {
    company_name,
    location,
    description,
    logo_url
  } = parsedFormData.data;

  let redirectPath = '/dashboard/companies'
  // Insert data into the database
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('companyprofiles')
      .insert({
        company_name,
        location,
        description,
        logo_url
      })
      .select()
      .single();

    if (error) {
      console.log(data)
      throw error;
    }

    if (data) {
      redirectPath = `/dashboard/companies/${data.id}`;
    }
  } catch (error) {
    console.log(error)
    return {
      message: 'Database Error: Failed to create company.',
    };
  } finally {
    revalidatePath('/dashboard/companies');
    redirect(redirectPath);
  }
}

export async function updateCompany(
  id: string,
  prevState: CompanyState,
  formData: FormData,
) {
  const rawFormData = {
    company_name: formData.get('company-name'),
    location: formData.get('location'),
    description: formData.get('description'),
  }

  const parsedFormData = CompanyFormSchema.safeParse(rawFormData);

  if (!parsedFormData.success) {
    console.log(rawFormData)
    return {
      errors: parsedFormData.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to update company.',
    };
  }

  const { company_name, location, description } = parsedFormData.data;

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('companyprofiles')
      .update({
        company_name,
        location,
        description
      })
      .eq('id', id);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.log(error)
    return {
      message: 'Database Error: Failed to update company.',
    };
  } finally {
    revalidatePath(`/dashboard/companies/${id}`);
    redirect(`/dashboard/companies/${id}`);
  }
}

export async function createJob(
  companyid: string,
  prevState: JobState,
  formData: FormData,
) {
  const rawFormData = {
    title: formData.get('title'),
    location: formData.get('location'),
    description: formData.get('description'),
    job_type: formData.get('job_type'),
    salary_range: formData.get('salary_range'),
  }

  const parsedFormData = JobFormSchema.safeParse(rawFormData);

  if (!parsedFormData.success) {
    console.log(rawFormData)
    return {
      errors: parsedFormData.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to create job.',
    };
  }

  const { title, location, description } = parsedFormData.data;
  const job_type = rawFormData.job_type as string;
  const salary_range = rawFormData.salary_range as string;

  let redirectPath = '/dashboard/jobs'
  // Insert data into the database
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('jobpostings')
      .insert({
        title,
        location,
        description,
        job_type,
        salary_range,
        posted_date: (new Date()).toISOString().substring(0, 10),
        companyid
      })
      .select()
      .single();

    if (error) {
      console.log(data)
      throw error;
    }

    if (data) {
      redirectPath = `/dashboard/jobs/${data.id}`;
    }

    const embedding = await getEmbedding(`
      Title: ${String(title)}
      Description: ${String(description)}
    `);

    const supabaseAdmin = await createAdminClient();

    const { error: embeddingUpsertError } = await supabaseAdmin
      .from('jobpostingembeddings')
      .upsert({
        id: data.id,
        embedding_gemini_te004: embedding
      });

    if (embeddingUpsertError) {
      throw embeddingUpsertError;
    }
  } catch (error) {
    console.log(error)
    return {
      message: 'Database Error: Failed to create job.',
    };
  } finally {
    revalidatePath('/dashboard/jobs');
    redirect(redirectPath);
  }
}

export async function updateJob(
  id: string,
  prevState: JobState,
  formData: FormData,
) {
  const rawFormData = {
    title: formData.get('title'),
    location: formData.get('location'),
    description: formData.get('description'),
    job_type: formData.get('job_type'),
    salary_range: formData.get('salary_range'),
  }

  const parsedFormData = JobFormSchema.safeParse(rawFormData);

  if (!parsedFormData.success) {
    console.log(rawFormData)
    return {
      errors: parsedFormData.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to update job.',
    };
  }

  const { title, location, description, job_type } = parsedFormData.data;
  const salary_range = rawFormData.salary_range as string;

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('jobpostings')
      .update({
        title,
        location,
        description,
        job_type,
        salary_range
      })
      .eq('id', id);

    if (error) {
      throw error;
    }

    const embedding = await getEmbedding(`
      Title: ${String(title)}
      Description: ${String(description)}
    `);

    const supabaseAdmin = await createAdminClient();

    const { error: embeddingUpsertError } = await supabaseAdmin
      .from('jobpostingembeddings')
      .upsert({
        id,
        embedding_gemini_te004: embedding
      });

    if (embeddingUpsertError) {
      throw embeddingUpsertError;
    }
  } catch (error) {
    console.log(error)
    return {
      message: 'Database Error: Failed to update job.',
    };
  } finally {
    revalidatePath(`/dashboard/jobs/${id}`);
    redirect(`/dashboard/jobs/${id}`);
  }
}

async function updateUserEmbedding(data: any) {
  // Prepare embedding to upload to database
  const {
    education,
    experience
  } = data;

  const educationString = String(education.map((entry: { school: any; degree: any; gpa: any; description: any; }) => {
    const { school, degree, gpa, description } = entry;
    return `Went to ${school} with degree in ${degree} and a gpa of ${gpa}. ${description}.`;
  }));

  const experienceString = String(experience.map((entry: { company: any; description: any; }) => {
    const { company, description } = entry;
    return `Worked at ${company}. ${description}.`;
  }));

  const embedding = await getEmbedding(`
    Description: ${String(data.summary)}
    Skills: ${String(data.skills)}
    Education: ${educationString}
    Experience: ${experienceString}
  `);

  try {
    const supabaseAdmin = await createAdminClient();

    const { error } = await supabaseAdmin
      .from('userprofileembeddings')
      .upsert({
        id: data.id,
        embedding_gemini_te004: embedding
      });
  
    if (error) {
      return error.message;
    }
    return null;
  } catch (error) {
    return error;
  }
}

export async function updateUser(
  userSkills: string[],
  prevState: UserState,
  formData: FormData,
) {
  const rawFormData = {
    first_name: formData.get('first-name'),
    last_name: formData.get('last-name'),
    summary: formData.get('summary'),
    location: formData.get('location'),
    avatar_url: formData.get('avatar-url'),
    skills: userSkills,
  }

  const parsedFormData = UserFormSchema.safeParse(rawFormData);

  if (!parsedFormData.success) {
    return {
      errors: parsedFormData.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to update user.',
    };
  }

  const {
    first_name,
    last_name,
    summary,
    skills,
    location,
    avatar_url
  } = parsedFormData.data;

  // Flag to track if this is a new user completing their profile
  let isFirstTimeCompletion = false;
  
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Error getting user");

    // Check if user already has a profile with first/last name
    const { data: existingProfile } = await supabase
      .from('userprofiles')
      .select('first_name, last_name')
      .eq('id', user.id)
      .single();
    
    // Set flag if user is adding first and last name for the first time
    isFirstTimeCompletion = !!first_name && !!last_name && 
      (!existingProfile || !existingProfile.first_name || !existingProfile.last_name);

    const { data, error } = await supabase
      .from('userprofiles')
      .upsert({
        id: user.id,
        first_name,
        last_name,
        summary,
        skills,
        location,
        avatar_url
      })
      .select(`
        *,
        education:usereducations!id (
          *
        ),
        experience:userexperiences!id (
          *
        )
      `)
      .single();

    if (error) {
      throw error;
    }

    const embeddingUpsertError = await updateUserEmbedding(data);

    if (embeddingUpsertError) {
      throw embeddingUpsertError;
    }
  } catch (error) {
    console.log(error)
    return {
      message: 'Database Error: Failed to update user.',
    };
  }

  // Revalidate paths and redirect after the try/catch block
  if (isFirstTimeCompletion) {
    revalidatePath('/dashboard');
    // Add a timestamp parameter to the URL to help the client recognize this is a post-profile-completion redirect
    redirect(`/dashboard?profile_completed=1&t=${Date.now()}`);
  } else {
    revalidatePath('/dashboard/profile');
    redirect('/dashboard/profile');
  }
}

export async function updateApplicationStatus(applicationId: string, newStatus: 'applied' | 'withdrawn' | 'not selected' | 'interview' | 'offer') {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('jobapplications')
      .update({ application_status: newStatus })
      .eq('id', applicationId)
      .select()
      .single();
    
    if (error) throw new Error(error.message);

    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to update application status: ${error}`);
  }
}

export async function updateUserEducation(
  userId: string,
  educations: any[],
  prevState: EducationState,
  formData: FormData,
) {
  try {
    const supabase = await createClient();
    
    // Delete all existing education entries for the user
    const { error: deleteError } = await supabase
      .from('usereducations')
      .delete()
      .eq('userid', userId);
    
    if (deleteError) throw new Error(deleteError.message);
    
    // If there are education entries to add
    if (educations && educations.length > 0) {
      // Prepare education entries with the user ID and fix date format
      const educationEntries = educations.map(edu => ({
        ...edu,
        userid: userId,
        start_date: edu.start_date || null,
        end_date: edu.end_date || null
      }));
      
      // Insert all education entries
      const { error: insertError } = await supabase
        .from('usereducations')
        .insert(educationEntries);
      
      if (insertError) throw new Error(insertError.message);

      const { data, error } = await supabase
        .from('userprofiles')
        .select(`
          *,
          education:usereducations!id (
            *
          ),
          experience:userexperiences!id (
            *
          )
        `)
        .eq('id', userId)
        .single();
      
      if (error) throw new Error(error.message); 

      const embeddingUpsertError = await updateUserEmbedding(data);

      if (embeddingUpsertError) {
        throw embeddingUpsertError;
      }
    }
    
    revalidatePath('/dashboard/profile');
    return { message: null, errors: {} };
  } catch (error) {
    console.error('Database Error:', error);
    return { 
      message: 'Database Error: Failed to update education.',
    };
  }
}

export async function updateUserExperience(
  userId: string,
  experiences: any[],
  prevState: ExperienceState,
  formData: FormData,
) {
  try {
    const supabase = await createClient();
    
    // Delete all existing experience entries for the user
    const { error: deleteError } = await supabase
      .from('userexperiences')
      .delete()
      .eq('userid', userId);
    
    if (deleteError) throw new Error(deleteError.message);
    
    // If there are experience entries to add
    if (experiences && experiences.length > 0) {
      // Prepare experience entries with the user ID and fix date format
      const experienceEntries = experiences.map(exp => ({
        ...exp,
        userid: userId,
        start_date: exp.start_date || null,
        end_date: exp.end_date || null
      }));
      
      // Insert all experience entries
      const { error: insertError } = await supabase
        .from('userexperiences')
        .insert(experienceEntries);
      
      if (insertError) throw new Error(insertError.message);

      const { data, error } = await supabase
        .from('userprofiles')
        .select(`
          *,
          education:usereducations!id (
            *
          ),
          experience:userexperiences!id (
            *
          )
        `)
        .eq('id', userId)
        .single();
      
      if (error) throw new Error(error.message); 

      const embeddingUpsertError = await updateUserEmbedding(data);

      if (embeddingUpsertError) {
        throw embeddingUpsertError;
      }
    }
    
    revalidatePath('/dashboard/profile');
    return { message: null, errors: {} };
  } catch (error) {
    console.error('Database Error:', error);
    return { 
      message: 'Database Error: Failed to update experience.',
    };
  }
}

export async function createJobApplication(jobId: string, companyId: string) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");
    
    // Check if user has already applied
    const { data: existingApplication, error: checkError } = await supabase
      .from('jobapplications')
      .select('id')
      .eq('jobid', jobId)
      .eq('userid', user.id)
      .maybeSingle();
    
    if (checkError) throw new Error(checkError.message);
    
    // If user has already applied, don't create duplicate
    if (existingApplication) {
      return { success: false, message: 'You have already applied for this job' };
    }
    
    // Create new application
    const { data, error } = await supabase
      .from('jobapplications')
      .insert({
        jobid: jobId,
        companyid: companyId,
        userid: user.id,
        application_date: new Date().toISOString()
      })
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    
    return { success: true, data };
  } catch (error) {
    console.error('Error creating job application:', error);
    return { success: false, message: 'Failed to apply for this job' };
  }
}

export type ForgotPasswordState = {
  message?: string | null;
  success: boolean;
};

export async function forgotPasswordAction(
  prevState: ForgotPasswordState, 
  formData: FormData
): Promise<ForgotPasswordState> {
  try {
    const validatedFields = z.object({
      email: z.string().email(),
    }).safeParse({
      email: formData.get('email'),
    });

    if (!validatedFields.success) {
      return { 
        message: 'Please enter a valid email address.',
        success: false 
      };
    }

    await forgotPassword(formData);
    return { success: true };
  } catch (error) {
    console.error('Forgot password error:', error);
    return { 
      message: 'An error occurred. Please try again.',
      success: false 
    };
  }
}

export type ResetPasswordState = {
  message?: string | null;
  success: boolean;
};

export async function resetPasswordAction(
  prevState: ResetPasswordState, 
  formData: FormData
): Promise<ResetPasswordState> {
  try {
    const validatedFields = z.object({
      password: z.string().min(6),
      confirm_password: z.string().min(6),
    }).safeParse({
      password: formData.get('password'),
      confirm_password: formData.get('confirm_password'),
    });

    if (!validatedFields.success) {
      return { 
        message: 'Password must be at least 6 characters.',
        success: false 
      };
    }

    const { password, confirm_password } = validatedFields.data;

    if (password !== confirm_password) {
      return {
        message: 'Passwords do not match.',
        success: false
      };
    }

    await resetPassword(formData);
    return { success: true };
  } catch (error) {
    console.error('Reset password error:', error);
    return { 
      message: 'An error occurred. Please try again.',
      success: false 
    };
  }
}
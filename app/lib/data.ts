'use client'

import { createClient } from '@/app/utils/supabase/client'
import { processMatchPercent } from './utils';

/*----------------------- Users -----------------------*/
export async function fetchUsers() {
    const supabase = await createClient()
  
    try {
      const { data, error } = await supabase
        .from("userprofiles")
        .select("*");
  
      if (error) throw new Error(error.message);
  
      return data;
    } catch (e) {
      console.log(e);
      return [];
    }
}

export async function fetchFilteredUsers(query: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('companyprofiles')
      .select('*')
      .or(`first_name.ilike.%${query}%, last_name.ilike.%${query}%, summary.ilike.%${query}%, location.ilike.%${query}%`);
    
    if (error) throw new Error(error.message);

    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch company table.');
  }
}

export async function fetchPaginatedUsers(query: string, page: number, limit: number = 6) {
  try {
    const supabase = await createClient();
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error } = await supabase
      .from('userprofiles')
      .select('*')
      .or(`first_name.ilike.%${query}%, last_name.ilike.%${query}%, summary.ilike.%${query}%, location.ilike.%${query}%`)
      .order('first_name', { ascending: true })
      .range(from, to);
    
    if (error) throw new Error(error.message);

    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch paginated users.');
  }
}

export async function fetchPaginatedSuggestedUsersByJobId(jobId: string, page: number, limit: number = 6) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc('fetch_paginated_users4job', {
      job_id: jobId,
      page_start: (page - 1) * limit,
      page_limit: limit,
    });
    
    if (error) throw new Error(error.message);

    return (data || []).map((row: any) => {
      return {
        id: row.id,
        email: row.email,
        first_name: row.first_name,
        last_name: row.last_name,
        location: row.location,
        summary: row.summary,
        skills: row.skills,
        avatar_url: row.avatar_url,
        match_percent: processMatchPercent(row.match_percent),
        application: {
          applicationid: row.applicationid,
          application_status: row.application_status
        }
      };
    });
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to fetch paginated job applications for job ${jobId}.`);
  }
}

export async function fetchUser() {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Error getting user");

    const { data, error } = await supabase
      .from("userprofiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) throw new Error(error.message);

    return data;
  } catch (e) {
    console.log(e);
    return null;
  }
}

export async function fetchUserById(userId: string) {
    const supabase = await createClient()
  
    try {
      const { data, error } = await supabase
        .from("userprofiles")
        .select("*")
        .eq("id", userId)
        .single();
  
      if (error) throw new Error(error.message);
  
      return data;
    } catch (e) {
      console.log(e);
      return null;
    }
}

export async function fetchUserEducation(userId: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from("usereducations")
      .select("*")
      .eq("userid", userId);

    if (error) throw new Error(error.message);

    return data;
  } catch (e) {
    console.log(e);
    return [];
  }
}

export async function fetchUserExperience(userId: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from("userexperiences")
      .select("*")
      .eq("userid", userId);

    if (error) throw new Error(error.message);

    return data;
  } catch (e) {
    console.log(e);
    return [];
  }
}

export async function userIsUser(userId: string) {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Error getting user");

    return user.id === userId;
  } catch (e) {
    console.log(e);
    return false;
  }
}


  /*----------------------- Job Applications -----------------------*/
  export async function fetchJobApplicationsByUserId(userId: string) {
    const supabase = await createClient()
  
    try {
      const { data, error } = await supabase
        .from("jobapplications")
        .select("*")
        .eq("userid", userId);
  
      if (error) throw new Error(error.message);
  
      return data;
    } catch (e) {
      console.log(e);
      return [];
    }
  }

  export async function fetchJobApplicationsByJobId(jobId: string) {
    const supabase = await createClient()
  
    try {
      const { data, error } = await supabase
        .from("jobapplications")
        .select(
          `
            *,
            applicant:userprofiles!userid (
              id,
              first_name,
              last_name,
              email,
              avatar_url
            )
          `
        )
        .eq("jobid", jobId);
  
      if (error) throw new Error(error.message);
  
      // Process and normalize data to ensure consistent formatting
      const processedData = (data || []).map(app => {
        // Ensure the application_date is a valid ISO string
        let application_date = app.application_date;
        
        // If it's not a string or is invalid, use a default value
        if (typeof application_date !== 'string' || !application_date) {
          application_date = new Date().toISOString();
        }
        
        return {
          ...app,
          application_date,
          match_percent: app.match_percent || 75
        };
      });

      // Ensure the result is serializable by converting to plain JSON
      return JSON.parse(JSON.stringify(processedData));
    } catch (e) {
      console.log(e);
      return [];
    }
  }

  export async function fetchPaginatedApplicationsByUser(userId: string, query: string = '', page: number, limit: number = 6, sortby: string = 'application_date', sortorder: string = 'desc') {
    try {
      const supabase = await createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();
  
      if (!user) throw new Error("Error getting user");

      const { data, error } = await supabase.rpc('fetch_paginated_apps4user', {
        user_id: user.id,
        query,
        sortby,
        sortorder,
        page_start: (page - 1) * limit,
        page_limit: limit
      });
      
      if (error) throw new Error(error.message);

      return (data || []).map((row: any) => {
        return {
          id: row.id,
          application_status: row.application_status,
          application_date: row.application_date,
          match_percent: processMatchPercent(row.match_percent),
          job: {
            id: row.jobid,
            title: row.title,
            location: row.location,
            description: row.description
          },
          company: {
            id: row.companyid,
            company_name: row.company_name,
            logo_url: row.logo_url
          }
        };
      });
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error(`Failed to fetch paginated job applications for user ${userId}.`);
    }
  }

  /*----------------------- Job Postings -----------------------*/
  export async function fetchJobPostings() {
    const supabase = await createClient()
  
    try {
      const { data, error } = await supabase
        .from("jobpostings")
        .select("*");
  
      if (error) throw new Error(error.message);
  
      return data;
    } catch (e) {
      console.log(e);
      return [];
    }
  }

  export async function fetchFilteredJobs(query: string) {
    try {
      const supabase = await createClient();
  
      const { data, error } = await supabase
        .from('jobpostings')
        .select(
          `
            *,
            company:companyprofiles!companyid (
              id,
              company_name,
              logo_url
            )
          `
        )
        .or(`title.ilike.%${query}%, description.ilike.%${query}%`);
      
      if (error) throw new Error(error.message);

      return data;
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Failed to fetch jobs table.');
    }
  }

  export async function fetchPaginatedJobs(
    query: string, 
    page: number = 0, 
    limit: number = 6,
    sortBy: 'posted_date' | 'match_percent' = 'posted_date',
    sortOrder: 'asc' | 'desc' = 'desc'
  ) {
    try {
      const supabase = await createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();
  
      if (!user) throw new Error("Error getting user");

      const { data, error } = await supabase.rpc('fetch_paginated_jobs4user', {
        user_id: user.id,
        query,
        sortby: sortBy,
        sortorder: sortOrder,
        page_start: (page - 1) * limit,
        page_limit: limit
      });
      
      if (error) throw new Error(error.message);

      return (data || []).map((row: any) => {
        return {
          id: row.id,
          title: row.title,
          location: row.location,
          description: row.description,
          posted_date: row.posted_date,
          job_type: row.job_type,
          salary_range: row.salary_range,
          match_percent: processMatchPercent(row.match_percent),
          company: {
            id: row.companyid,
            company_name: row.company_name,
            logo_url: row.logo_url
          }
        };
      });
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Failed to fetch paginated jobs.');
    }
  }

  export async function fetchPaginatedJobsByCompany(
    companyId: string, 
    query: string, 
    page: number, 
    limit: number = 6,
    sortBy: 'posted_date' | 'match_percent' = 'posted_date',
    sortOrder: 'asc' | 'desc' = 'desc'
  ) {
    try {
      const supabase = await createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();
  
      if (!user) throw new Error("Error getting user");

      const { data, error } = await supabase.rpc('fetch_paginated_jobs4user', {
        user_id: user.id,
        query,
        sortby: sortBy,
        sortorder: sortOrder,
        companyid_opt: companyId,
        page_start: (page - 1) * limit,
        page_limit: limit
      });
      
      if (error) throw new Error(error.message);

      return (data || []).map((row: any) => {
        return {
          id: row.id,
          title: row.title,
          location: row.location,
          description: row.description,
          posted_date: row.posted_date,
          job_type: row.job_type,
          salary_range: row.salary_range,
          match_percent: processMatchPercent(row.match_percent),
          company: {
            id: row.companyid,
            company_name: row.company_name,
            logo_url: row.logo_url
          }
        };
      });
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error(`Failed to fetch paginated jobs for company ${companyId}.`);
    }
  }

export async function getMatchPercentOfUserToJob(job_id: string) {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Error getting user");

    const { data, error } = await supabase.rpc('get_match_percent', {
      user_id: user.id,
      job_id,
    });

    if (error) throw new Error(error.message);
    
    return data;
  } catch (e) {
    console.log(e);
    return null;
  }
}

  export async function fetchJobPostingById(jobId: string) {
    const supabase = await createClient();
  
    try {
      const { data, error } = await supabase
        .from("jobpostings")
        .select(
          `
            *,
            company:companyprofiles!companyid (
              id,
              company_name,
              logo_url
            )
          `
        )
        .eq("id", jobId)
        .single();
  
      if (error) throw new Error(error.message);
  
      return data;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  export async function fetchPaginatedApplicationsByJobId(jobId: string, page: number, limit: number = 6, sortBy: 'application_date' | 'match_percent' = 'application_date', sortOrder: 'asc' | 'desc' = 'desc', query: string = '') {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase.rpc('fetch_paginated_apps4job', {
        job_id: jobId,
        query,
        sortby: sortBy,
        sortorder: sortOrder,
        page_start: (page - 1) * limit,
        page_limit: limit,
      });
      
      if (error) throw new Error(error.message);

      return (data || []).map((row: any) => {
        return {
          id: row.id,
          application_status: row.application_status,
          application_date: row.application_date,
          match_percent: processMatchPercent(row.match_percent),
          applicant: {
            id: row.userid,
            email: row.email,
            first_name: row.first_name,
            last_name: row.last_name,
            location: row.location,
            summary: row.summary,
            skills: row.skills,
            avatar_url: row.avatar_url
          }
        };
      });
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error(`Failed to fetch paginated job applications for job ${jobId}.`);
    }
  }

/*----------------------- Companies -----------------------*/
export async function fetchCompanies() {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from("companyprofiles")
      .select("*");

    if (error) throw new Error(error.message);

    return data;
  } catch (e) {
    console.log(e);
    return [];
  }
}

export async function fetchFilteredCompanies(query: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('companyprofiles')
      .select('*')
      .or(`company_name.ilike.%${query}%, description.ilike.%${query}%`);
    
    if (error) throw new Error(error.message);

    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch company table.');
  }
}

export async function fetchPaginatedCompanies(query: string, page: number, limit: number = 6) {
  try {
    const supabase = await createClient();
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error } = await supabase
      .from('companyprofiles')
      .select('*')
      .or(`company_name.ilike.%${query}%, description.ilike.%${query}%`)
      .order('company_name', { ascending: true })
      .range(from, to);
    
    if (error) throw new Error(error.message);

    return data;
  } catch (error) {
    console.error('Database Error:', error);
    console.log(error);
    throw new Error('Failed to fetch paginated companies.');
  }
}

export async function fetchCompanyById(companyId: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from("companyprofiles")
      .select("*")
      .eq("id", companyId)
      .single();

    if (error) throw new Error(error.message);

    return data;
  } catch (e) {
    console.log(e);
    return null;
  }
}

export async function fetchEmployeesByCompanyId(companyId: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from("companyemployees")
      .select("*")
      .eq("companyid", companyId);

    if (error) throw new Error(error.message);

    return data;
  } catch (e) {
    console.log(e);
    return [];
  }
}

export async function userIsCompanyEmployee(companyId: string) {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Error getting user");

    const { data, error } = await supabase.rpc('is_company_employee', {
      uid: user.id,
      cid: companyId,
    });

    if (error) throw new Error(error.message);
    
    return data;
  } catch (e) {
    console.log(e);
    return false;
  }
}

export async function fetchApplicationById(applicationId: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('jobapplications')
      .select(`
        *,
        job:jobpostings!jobid (
          id,
          title,
          location,
          description,
          companyid
        ),
        company:companyprofiles!companyid (
          id,
          company_name,
          logo_url,
          description
        ),
        applicant:userprofiles!userid (
          id,
          first_name,
          last_name,
          email,
          avatar_url
        )
      `)
      .eq('id', applicationId)
      .single();
    
    if (error) throw new Error(error.message);

    return data;
  } catch (error) {
    console.error('Database Error:', error);
    return null;
  }
}

export async function fetchCompaniesWhereUserIsEmployee(query: string = '', page: number = 1, limit: number = 6) {
  try {
    const supabase = await createClient();
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    // First get all company IDs where the user is an employee
    const { data: employeeData, error: employeeError } = await supabase
      .from("companyemployees")
      .select("companyid")
      .eq("userid", user.id);

    if (employeeError) throw new Error(employeeError.message);
    
    // If user isn't an employee anywhere, return empty array
    if (!employeeData || employeeData.length === 0) {
      return [];
    }

    // Extract company IDs
    const companyIds = employeeData.map(item => item.companyid);

    // Now fetch those companies with pagination
    const { data, error } = await supabase
      .from('companyprofiles')
      .select('*')
      .in('id', companyIds)
      .or(`company_name.ilike.%${query}%, description.ilike.%${query}%`)
      .order('company_name', { ascending: true })
      .range(from, to);
    
    if (error) throw new Error(error.message);

    return data;
  } catch (error) {
    console.error('Database Error:', error);
    return [];
  }
}



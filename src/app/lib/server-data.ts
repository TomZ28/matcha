import { createClient } from '@/utils/supabase/server';

/**
 * Server-side data fetching functions
 * These functions use the server Supabase client and are intended 
 * for use in server components like for metadata generation
 */

export async function fetchUserServer() {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

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

export async function fetchUserByIdServer(userId: string) {
  const supabase = await createClient();

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

export async function fetchJobPostingByIdServer(jobId: string) {
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

export async function fetchCompanyByIdServer(companyId: string) {
  const supabase = await createClient();

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

export async function fetchApplicationByIdServer(applicationId: string) {
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

export async function fetchCompaniesWhereUserIsEmployeeServer(query: string = '', page: number = 1, limit: number = 6) {
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

export async function fetchUserEducationServer(userId: string) {
  const supabase = await createClient();

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

export async function fetchUserExperienceServer(userId: string) {
  const supabase = await createClient();

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

export async function userIsUserServer(userId: string) {
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

export async function userIsCompanyEmployeeServer(companyId: string) {
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

export async function fetchPaginatedCompaniesServer(query: string, page: number, limit: number = 6) {
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

export async function fetchPaginatedUsersServer(query: string, page: number, limit: number = 6) {
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

export async function fetchPaginatedApplicationsByUserServer(userId: string, query: string = '', page: number, limit: number = 6) {
  try {
    const supabase = await createClient();
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let queryBuilder = supabase
      .from('jobapplications')
      .select(`
        *,
        job:jobpostings!jobid (
          id,
          title,
          location,
          description
        ),
        company:companyprofiles!companyid (
          id,
          company_name,
          logo_url
        )
      `)
      .eq('userid', userId)
      .order('application_date', { ascending: false })
      .range(from, to);
    
    // Only apply filter if query is not empty
    if (query) {
      // Get job IDs that match the query
      const { data: matchingJobs } = await supabase
        .from('jobpostings')
        .select('id')
        .ilike('title', `%${query}%`);
      
      // Get company IDs that match the query
      const { data: matchingCompanies } = await supabase
        .from('companyprofiles')
        .select('id')
        .ilike('company_name', `%${query}%`);
      
      // Get job IDs and company IDs
      const jobIds = matchingJobs?.map(job => job.id) || [];
      const companyIds = matchingCompanies?.map(company => company.id) || [];
      
      // Filter applications by matching job IDs or company IDs
      if (jobIds.length > 0 || companyIds.length > 0) {
        queryBuilder = queryBuilder.or(
          `${jobIds.length > 0 ? `jobid.in.(${jobIds.join(',')})` : ''},` +
          `${companyIds.length > 0 ? `companyid.in.(${companyIds.join(',')})` : ''}`
        );
      }
    }
    
    const { data, error } = await queryBuilder;
    
    if (error) throw new Error(error.message);

    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to fetch paginated job applications for user ${userId}.`);
  }
}

export async function fetchPaginatedApplicationsByJobIdServer(jobId: string, page: number, limit: number = 6, sortBy: 'application_date' | 'match_percent' = 'application_date', sortOrder: 'asc' | 'desc' = 'desc', query: string = '') {
  try {
    const supabase = await createClient();
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Query builder for applications with expanded related data
    let queryBuilder = supabase
      .from('jobapplications')
      .select(`
        *,
        job:jobpostings!jobid (
          id,
          title,
          location,
          description
        ),
        company:companyprofiles!companyid (
          id,
          company_name,
          logo_url
        ),
        applicant:userprofiles!userid (
          id,
          first_name,
          last_name,
          email,
          avatar_url
        )
      `)
      .eq('jobid', jobId);
    
    // Add filter for search term if provided
    if (query) {
      // Get user IDs that match the query
      const { data: matchingUsers } = await supabase
        .from('userprofiles')
        .select('id')
        .or(`first_name.ilike.%${query}%, last_name.ilike.%${query}%, email.ilike.%${query}%`);
      
      // Get user IDs
      const userIds = matchingUsers?.map(user => user.id) || [];
      
      // Filter applications by matching user IDs
      if (userIds.length > 0) {
        queryBuilder = queryBuilder.in('userid', userIds);
      } else if (query.trim() !== '') {
        // No matches for the query, return empty result
        return [];
      }
    }
    
    // Add sorting and pagination
    const { data, error } = await queryBuilder
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(from, to);
    
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
        status: app.application_status || 'applied',
        match_percent: app.match_percent || Math.floor(Math.random() * 41) + 60 // Random 60-100
      };
    });

    // JSON stringify and parse to ensure all values are serializable
    return JSON.parse(JSON.stringify(processedData));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to fetch paginated job applications for job ${jobId}.`);
  }
}

export async function fetchPaginatedJobsByCompanyServer(
  companyId: string, 
  query: string, 
  page: number, 
  limit: number = 6,
  sortBy: 'posted_date' | 'match_percent' = 'posted_date',
  sortOrder: 'asc' | 'desc' = 'desc'
) {
  try {
    const supabase = await createClient();
    const from = (page - 1) * limit;
    const to = from + limit - 1;

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
      .eq('companyid', companyId)
      .or(`title.ilike.%${query}%, description.ilike.%${query}%`)
      .order(sortBy === 'posted_date' ? 'posted_date' : 'id', { ascending: sortOrder === 'asc' })
      .range(from, to);
    
    if (error) throw new Error(error.message);

    // Add a match percentage to each job
    const jobsWithMatch = data.map(job => ({
      ...job,
      match_percent: Math.floor(Math.random() * 41) + 60 // Random number between 60-100
    }));

    // If sorting by match percentage, sort the results in memory
    if (sortBy === 'match_percent') {
      jobsWithMatch.sort((a, b) => {
        const aVal = a.match_percent || 0;
        const bVal = b.match_percent || 0;
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      });
    }

    return jobsWithMatch;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to fetch paginated jobs for company ${companyId}.`);
  }
} 
export type User = {
    id: string;
    name: string;
    email: string;
    password: string;
  };
  
  export type UserForm = {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    summary: string;
    skills: string[];
    location: string;
    avatar_url: string;
  };
  
  export type CompanyForm = {
    id: string;
    company_name: string;
    location: string;
    description: string;
    logo_url: string;
  };
  
  export type FormattedCompaniesTable = {
    id: string;
    company_name: string;
    location: string;
    description: string;
    logo_url: string;
  };
  
  export type JobType = 'Full-time' | 'Part-time' | 'Contract' | 'Temporary' | 'Internship' | 'Remote';
  
  export type FormattedJobsTable = {
    id: string;
    title: string;
    location: string;
    description: string;
    posted_date: string;
    companyid: string;
    job_type: JobType;
    salary_range?: string;
    match_percent: number;
    company: {
      id: string,
      logo_url: string,
      company_name: string
    }
  };
  
  export type JobForm = {
    id: string;
    title: string;
    location: string;
    description: string;
    job_type: JobType;
    salary_range?: string;
    company?: {
      id: string;
      company_name: string;
      logo_url?: string;
    };
  };
  
  export type Education = {
    id: number | string;
    userid: string;
    school: string;
    degree?: string | null;
    location?: string | null;
    gpa?: string | null;
    description?: string | null;
    start_date: string;
    end_date?: string | null;
  };
  
  export type Experience = {
    id: number | string;
    userid: string;
    company: string;
    location?: string | null;
    description?: string | null;
    start_date: string;
    end_date?: string | null;
  };
  
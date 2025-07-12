export interface Database {
  public: {
    Tables: {
      jobs: {
        Row: {
          id: string
          title: string
          company: string
          description: string
          location: string
          job_type: 'Full-Time' | 'Part-Time' | 'Contract'
          user_id: string
          created_at: string
          updated_at: string
          // Enhanced fields
          company_id?: string
          salary_min?: number
          salary_max?: number
          salary_currency?: string
          experience_level?: 'Entry' | 'Mid' | 'Senior' | 'Lead' | 'Executive'
          remote_type?: 'Remote' | 'Hybrid' | 'On-site'
          requirements?: string[]
          benefits?: string[]
          skills?: string[]
          employment_type?: 'Full-Time' | 'Part-Time' | 'Contract' | 'Internship'
          application_deadline?: string
          is_active?: boolean
          view_count?: number
          application_count?: number
        }
        Insert: {
          id?: string
          title: string
          company: string
          description: string
          location: string
          job_type: 'Full-Time' | 'Part-Time' | 'Contract'
          user_id: string
          created_at?: string
          updated_at?: string
          company_id?: string
          salary_min?: number
          salary_max?: number
          salary_currency?: string
          experience_level?: 'Entry' | 'Mid' | 'Senior' | 'Lead' | 'Executive'
          remote_type?: 'Remote' | 'Hybrid' | 'On-site'
          requirements?: string[]
          benefits?: string[]
          skills?: string[]
          employment_type?: 'Full-Time' | 'Part-Time' | 'Contract' | 'Internship'
          application_deadline?: string
          is_active?: boolean
          view_count?: number
          application_count?: number
        }
        Update: {
          id?: string
          title?: string
          company?: string
          description?: string
          location?: string
          job_type?: 'Full-Time' | 'Part-Time' | 'Contract'
          user_id?: string
          created_at?: string
          updated_at?: string
          company_id?: string
          salary_min?: number
          salary_max?: number
          salary_currency?: string
          experience_level?: 'Entry' | 'Mid' | 'Senior' | 'Lead' | 'Executive'
          remote_type?: 'Remote' | 'Hybrid' | 'On-site'
          requirements?: string[]
          benefits?: string[]
          skills?: string[]
          employment_type?: 'Full-Time' | 'Part-Time' | 'Contract' | 'Internship'
          application_deadline?: string
          is_active?: boolean
          view_count?: number
          application_count?: number
        }
      }
      companies: {
        Row: {
          id: string
          name: string
          description?: string
          website?: string
          logo_url?: string
          size_range?: '1-10' | '11-50' | '51-200' | '201-1000' | '1000+'
          industry?: string
          founded_year?: number
          headquarters?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string
          website?: string
          logo_url?: string
          size_range?: '1-10' | '11-50' | '51-200' | '201-1000' | '1000+'
          industry?: string
          founded_year?: number
          headquarters?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          website?: string
          logo_url?: string
          size_range?: '1-10' | '11-50' | '51-200' | '201-1000' | '1000+'
          industry?: string
          founded_year?: number
          headquarters?: string
          created_at?: string
          updated_at?: string
        }
      }
      job_applications: {
        Row: {
          id: string
          job_id: string
          applicant_id: string
          status: 'pending' | 'reviewed' | 'accepted' | 'rejected'
          cover_letter?: string
          resume_url?: string
          applied_at: string
        }
        Insert: {
          id?: string
          job_id: string
          applicant_id: string
          status?: 'pending' | 'reviewed' | 'accepted' | 'rejected'
          cover_letter?: string
          resume_url?: string
          applied_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          applicant_id?: string
          status?: 'pending' | 'reviewed' | 'accepted' | 'rejected'
          cover_letter?: string
          resume_url?: string
          applied_at?: string
        }
      }
      saved_jobs: {
        Row: {
          id: string
          job_id: string
          user_id: string
          saved_at: string
        }
        Insert: {
          id?: string
          job_id: string
          user_id: string
          saved_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          user_id?: string
          saved_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          full_name?: string
          avatar_url?: string
          bio?: string
          location?: string
          website?: string
          linkedin_url?: string
          github_url?: string
          skills?: string[]
          experience_years?: number
          current_title?: string
          is_employer?: boolean
          is_job_seeker?: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name?: string
          avatar_url?: string
          bio?: string
          location?: string
          website?: string
          linkedin_url?: string
          github_url?: string
          skills?: string[]
          experience_years?: number
          current_title?: string
          is_employer?: boolean
          is_job_seeker?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          avatar_url?: string
          bio?: string
          location?: string
          website?: string
          linkedin_url?: string
          github_url?: string
          skills?: string[]
          experience_years?: number
          current_title?: string
          is_employer?: boolean
          is_job_seeker?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Enhanced types with relationships
export type Job = Database['public']['Tables']['jobs']['Row']
export type JobInsert = Database['public']['Tables']['jobs']['Insert']
export type JobUpdate = Database['public']['Tables']['jobs']['Update']

export type Company = Database['public']['Tables']['companies']['Row']
export type CompanyInsert = Database['public']['Tables']['companies']['Insert']
export type CompanyUpdate = Database['public']['Tables']['companies']['Update']

export type JobApplication = Database['public']['Tables']['job_applications']['Row']
export type JobApplicationInsert = Database['public']['Tables']['job_applications']['Insert']
export type JobApplicationUpdate = Database['public']['Tables']['job_applications']['Update']

export type SavedJob = Database['public']['Tables']['saved_jobs']['Row']
export type SavedJobInsert = Database['public']['Tables']['saved_jobs']['Insert']
export type SavedJobUpdate = Database['public']['Tables']['saved_jobs']['Update']

export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert']
export type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update']

// Extended types with joins
export interface JobWithCompany extends Job {
  companies?: Company
}

export interface JobWithStats extends Job {
  companies?: Company
  is_saved?: boolean
  has_applied?: boolean
}
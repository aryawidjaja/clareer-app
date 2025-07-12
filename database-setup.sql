-- Clareer Job Board - Complete Database Setup
-- Copy and paste this entire file into your Supabase SQL Editor and run it

-- Create function to update updated_at timestamp (needed for triggers)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Companies table for proper company management
CREATE TABLE IF NOT EXISTS companies (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  website text,
  logo_url text,
  size_range text CHECK (size_range IN ('1-10', '11-50', '51-200', '201-1000', '1000+')),
  industry text,
  founded_year integer,
  headquarters text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enhanced jobs table with all features
CREATE TABLE IF NOT EXISTS jobs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  company text NOT NULL,
  description text NOT NULL,
  location text NOT NULL,
  job_type text NOT NULL CHECK (job_type IN ('Full-Time', 'Part-Time', 'Contract')),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  -- Enhanced fields
  company_id uuid REFERENCES companies(id),
  salary_min integer,
  salary_max integer,
  salary_currency text DEFAULT 'USD',
  experience_level text CHECK (experience_level IN ('Entry', 'Mid', 'Senior', 'Lead', 'Executive')),
  remote_type text CHECK (remote_type IN ('Remote', 'Hybrid', 'On-site')),
  requirements text[],
  benefits text[],
  skills text[],
  employment_type text CHECK (employment_type IN ('Full-Time', 'Part-Time', 'Contract', 'Internship')),
  application_deadline timestamp with time zone,
  is_active boolean DEFAULT true,
  view_count integer DEFAULT 0,
  application_count integer DEFAULT 0
);

-- Job applications table
CREATE TABLE IF NOT EXISTS job_applications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  applicant_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
  cover_letter text,
  resume_url text,
  applied_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(job_id, applicant_id)
);

-- Saved jobs table for job seekers
CREATE TABLE IF NOT EXISTS saved_jobs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  saved_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(job_id, user_id)
);

-- Job views tracking for analytics
CREATE TABLE IF NOT EXISTS job_views (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address inet,
  user_agent text,
  viewed_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- User profiles for additional user information
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  bio text,
  location text,
  website text,
  linkedin_url text,
  github_url text,
  skills text[],
  experience_years integer,
  current_title text,
  is_employer boolean DEFAULT false,
  is_job_seeker boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs USING gin(to_tsvector('english', location));
CREATE INDEX IF NOT EXISTS idx_jobs_title ON jobs USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_jobs_skills ON jobs USING gin(skills);
CREATE INDEX IF NOT EXISTS idx_jobs_remote_type ON jobs(remote_type);
CREATE INDEX IF NOT EXISTS idx_jobs_employment_type ON jobs(employment_type);
CREATE INDEX IF NOT EXISTS idx_jobs_experience_level ON jobs(experience_level);
CREATE INDEX IF NOT EXISTS idx_jobs_is_active ON jobs(is_active);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_applicant_id ON job_applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_id ON saved_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_job_views_job_id ON job_views(job_id);
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies USING gin(to_tsvector('english', name));

-- Enable RLS for all tables
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for jobs table
DROP POLICY IF EXISTS "Anyone can view jobs" ON jobs;
CREATE POLICY "Anyone can view jobs" ON jobs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only employers can insert jobs" ON jobs;
CREATE POLICY "Only employers can insert jobs" ON jobs FOR INSERT WITH CHECK (
  auth.uid() = user_id AND 
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() AND is_employer = true
  )
);

DROP POLICY IF EXISTS "Users can update their own jobs" ON jobs;
CREATE POLICY "Users can update their own jobs" ON jobs FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own jobs" ON jobs;
CREATE POLICY "Users can delete their own jobs" ON jobs FOR DELETE USING (auth.uid() = user_id);

-- Policies for companies
DROP POLICY IF EXISTS "Anyone can view companies" ON companies;
CREATE POLICY "Anyone can view companies" ON companies FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only employers can insert companies" ON companies;
CREATE POLICY "Only employers can insert companies" ON companies FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() AND is_employer = true
  )
);

DROP POLICY IF EXISTS "Only employers can update companies" ON companies;
CREATE POLICY "Only employers can update companies" ON companies FOR UPDATE USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() AND is_employer = true
  )
);

-- Policies for job_applications
DROP POLICY IF EXISTS "Users can view their own applications" ON job_applications;
CREATE POLICY "Users can view their own applications" ON job_applications FOR SELECT USING (auth.uid() = applicant_id);

DROP POLICY IF EXISTS "Job owners can view applications to their jobs" ON job_applications;
CREATE POLICY "Job owners can view applications to their jobs" ON job_applications FOR SELECT USING (
  EXISTS (SELECT 1 FROM jobs WHERE jobs.id = job_applications.job_id AND jobs.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Authenticated users can apply for jobs" ON job_applications;
CREATE POLICY "Authenticated users can apply for jobs" ON job_applications FOR INSERT WITH CHECK (auth.uid() = applicant_id);

DROP POLICY IF EXISTS "Users can update their own applications" ON job_applications;
CREATE POLICY "Users can update their own applications" ON job_applications FOR UPDATE USING (auth.uid() = applicant_id);

-- Policies for saved_jobs
DROP POLICY IF EXISTS "Users can manage their saved jobs" ON saved_jobs;
CREATE POLICY "Users can manage their saved jobs" ON saved_jobs FOR ALL USING (auth.uid() = user_id);

-- Policies for job_views
DROP POLICY IF EXISTS "Anyone can insert job views" ON job_views;
CREATE POLICY "Anyone can insert job views" ON job_views FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their own job views" ON job_views;
CREATE POLICY "Users can view their own job views" ON job_views FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- Policies for user_profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON user_profiles;
CREATE POLICY "Users can view all profiles" ON user_profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage their own profile" ON user_profiles;
CREATE POLICY "Users can manage their own profile" ON user_profiles FOR ALL USING (auth.uid() = user_id);

-- Functions for updating counters
CREATE OR REPLACE FUNCTION increment_job_view_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE jobs SET view_count = view_count + 1 WHERE id = NEW.job_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION increment_application_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE jobs SET application_count = application_count + 1 WHERE id = NEW.job_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION decrement_application_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE jobs SET application_count = application_count - 1 WHERE id = OLD.job_id;
  RETURN OLD;
END;
$$ language 'plpgsql';

-- Triggers for automatic counter updates
DROP TRIGGER IF EXISTS trigger_increment_job_view_count ON job_views;
CREATE TRIGGER trigger_increment_job_view_count
  AFTER INSERT ON job_views
  FOR EACH ROW EXECUTE FUNCTION increment_job_view_count();

DROP TRIGGER IF EXISTS trigger_increment_application_count ON job_applications;
CREATE TRIGGER trigger_increment_application_count
  AFTER INSERT ON job_applications
  FOR EACH ROW EXECUTE FUNCTION increment_application_count();

DROP TRIGGER IF EXISTS trigger_decrement_application_count ON job_applications;
CREATE TRIGGER trigger_decrement_application_count
  AFTER DELETE ON job_applications
  FOR EACH ROW EXECUTE FUNCTION decrement_application_count();

-- Triggers for updated_at columns
DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample companies (simplified to avoid constraint issues)
-- Temporarily disable RLS for inserting sample data
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;

INSERT INTO companies (name, description, industry, headquarters) VALUES
('TechCorp Solutions', 'Leading software development company specializing in enterprise solutions and cloud infrastructure.', 'Technology', 'San Francisco, CA'),
('InnovateLab', 'Cutting-edge AI and machine learning research company developing next-generation solutions.', 'Artificial Intelligence', 'Seattle, WA'),
('DataStream Analytics', 'Big data and analytics platform helping businesses make data-driven decisions.', 'Data Analytics', 'Austin, TX'),
('CloudNine Systems', 'Cloud infrastructure and DevOps solutions provider for modern enterprises.', 'Cloud Computing', 'Denver, CO'),
('FinTech Innovations', 'Revolutionary financial technology company building the future of digital payments.', 'Financial Technology', 'New York, NY'),
('GreenTech Solutions', 'Sustainable technology company focused on renewable energy and environmental solutions.', 'Clean Technology', 'Portland, OR'),
('CyberSecure Pro', 'Cybersecurity firm providing advanced threat protection and security consulting services.', 'Cybersecurity', 'Washington, DC'),
('MobileFirst Studios', 'Mobile app development studio creating innovative iOS and Android applications.', 'Mobile Development', 'Los Angeles, CA'),
('HealthTech Pioneers', 'Healthcare technology company revolutionizing patient care through digital health solutions.', 'Healthcare Technology', 'Boston, MA'),
('EduLearn Platform', 'EdTech company building interactive learning platforms for students and professionals.', 'Education Technology', 'Chicago, IL'),
('StartupAccelerator', 'Venture capital and startup incubator helping early-stage companies grow and scale.', 'Venture Capital', 'Miami, FL'),
('RetailTech Hub', 'E-commerce and retail technology solutions provider for online and brick-and-mortar stores.', 'Retail Technology', 'Atlanta, GA')
ON CONFLICT (name) DO NOTHING;

-- Re-enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
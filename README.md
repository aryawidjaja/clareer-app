# Clareer - Modern Job Board Platform

A full-featured job board application built with Next.js, TypeScript, Supabase, and Tailwind CSS. Features role-based access control, company management, job applications, and a beautiful glass-morphism UI.

## Quick Start

### Prerequisites
- Node.js 18+ 
- Supabase account
- Git

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mini-job-board
   npm install
   ```

2. **Environment Setup**
   Create `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Database Setup**
   
   **Copy and paste the entire `database-setup.sql` file into your Supabase SQL Editor and run it.**
   
   This single file will:
   - Create all necessary tables (jobs, companies, applications, etc.)
   - Set up security policies
   - Add performance indexes
   - Insert 12 sample companies
   - Configure triggers and functions

4. **Run the Application**
   ```bash
   npm run dev
   ```

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **UI Library**: Lucide React icons
- **Styling**: Custom glass-morphism components

### Key Features

#### **Role-Based Access Control**
- **Job Seekers**: Browse jobs, save favorites, apply to positions
- **Employers**: Post jobs, manage companies, view applications
- **Mixed Roles**: Users can be both employer and job seeker
- **Database-level enforcement**: RLS policies prevent unauthorized access

#### **Company Management**
- Company directory with search and filtering
- Rich company profiles with logos, descriptions, and details
- Employers can create/manage companies
- Integration with job postings

#### **Job Management**
- Advanced job posting with salary ranges, skills, benefits
- Real-time search with debouncing for smooth UX
- Job application system with cover letters and resumes
- View tracking and analytics

#### **User Profiles**
- Comprehensive profile management
- Skills tracking and experience levels
- Role selection (employer/job seeker)
- Professional information and social links

### Component Architecture

```
src/
├── app/                    # Next.js app router pages
│   ├── auth/              # Authentication pages
│   ├── companies/         # Company directory
│   ├── jobs/              # Job listings and details
│   ├── post-job/          # Job posting (employer-only)
│   ├── profile/           # User profile management
│   ├── saved-jobs/        # Saved jobs (job seekers)
│   └── dashboard/         # User dashboard
├── components/            # Reusable components
│   └── Navbar.tsx         # Role-aware navigation
├── hooks/                 # Custom React hooks
│   ├── useJobs.ts         # Job fetching with filters
│   ├── useJob.ts          # Individual job management
│   └── useUserRole.ts     # Role checking utility
├── lib/                   # Utilities
│   └── supabase.ts        # Supabase client
└── types/                 # TypeScript definitions
    └── database.ts        # Database types
```

### Security Model

#### Row Level Security (RLS)
- **Jobs**: Anyone can view, only employers can create
- **Companies**: Anyone can view, only employers can create/edit
- **Applications**: Users can manage their own applications
- **Saved Jobs**: Users can manage their own saved jobs
- **Profiles**: Users can manage their own profiles

#### Authentication Flow
1. User signs up → Redirected to profile setup
2. User selects role (employer/job seeker) → Role stored in `user_profiles`
3. Role-based navigation and feature access
4. Database policies enforce role restrictions

## UI/UX Design

### Design System
- **Glass-morphism**: Translucent cards with backdrop blur
- **Gradient Accents**: Vibrant gradients for CTAs and highlights
- **Smooth Animations**: Hover effects and transitions
- **Responsive Design**: Mobile-first approach
- **Accessibility**: Semantic HTML and keyboard navigation

### Custom Components
- `floating-card`: Glass-morphism card component
- `btn-3d`: 3D-style primary buttons
- `btn-glass`: Glass-style secondary buttons
- `glass-input`: Translucent form inputs
- `text-gradient-animated`: Animated gradient text

## Configuration

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Policies
The application uses Supabase Row Level Security (RLS) for data protection:
- Employers can only post jobs if `is_employer = true` in their profile
- Users can only modify their own data
- Public data (jobs, companies) is readable by everyone

### Sample Data
The `sample-companies.sql` file includes 12 professional sample companies with:
- Diverse industries (Technology, Healthcare, FinTech, etc.)
- Professional placeholder logos via DiceBear API
- Realistic company data and descriptions

## User Flows

### Job Seeker Journey
1. **Sign Up** → Complete profile as job seeker
2. **Browse Jobs** → Search, filter by location/type
3. **View Companies** → Research potential employers
4. **Save Jobs** → Bookmark interesting positions
5. **Apply** → Submit applications with cover letters

### Employer Journey
1. **Sign Up** → Complete profile as employer
2. **Add Company** → Create company profile with details
3. **Post Jobs** → Create detailed job listings
4. **Manage Applications** → Review and respond to candidates

### Mixed Role Journey
- Users can toggle between employer and job seeker modes
- Navigation adapts to show relevant features
- Can both post jobs and apply to other positions

### Database Setup
For a fresh installation, just run the single `database-setup.sql` file in your Supabase SQL Editor. It includes everything you need.

## What Would You Improve If Given More Time?

Here are the most practical improvements I'd focus on:

### **High Priority**
- **Email Notifications** - Send confirmation emails when users apply to jobs
- **File Upload** - Let users upload resumes instead of just URLs
- **Application Management** - Better dashboard for employers to review applications
- **Job Alerts** - Email users when new jobs match their preferences

### **Nice to Have**
- **Advanced Search** - Filter by salary range and experience level
- **Company Profiles** - More detailed company pages with multiple job listings
- **Application Status** - Track application progress (pending, reviewed, etc.)
- **Social Login** - Sign in with Google/LinkedIn for easier onboarding
- **Dark Mode** - Because everyone expects it these days

### **Future Ideas**
- **Mobile App** - React Native version for job seekers on the go
- **AI Matching** - Suggest relevant jobs based on user profiles
- **Video Interviews** - Built-in video calling for remote interviews

The current version already handles the core job board functionality well. These improvements would mainly enhance user experience and add convenience features that users expect from modern job platforms.

## License

MIT License - See LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

Built with ❤️ using Next.js, Supabase, and modern web technologies.
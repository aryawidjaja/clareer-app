'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useJob } from '@/hooks/useJob'
import { 
  ArrowLeft, 
  MapPin, 
  Building, 
  Calendar, 
  Clock, 
  DollarSign, 
  Users, 
  Heart,
  Share2,
  ExternalLink,
  CheckCircle,
  Briefcase,
  Star,
  Globe,
  Eye
} from 'lucide-react'
import { useState } from 'react'

export default function JobDetailPage() {
  const [user, setUser] = useState<any>(null)
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [applicationData, setApplicationData] = useState({
    cover_letter: '',
    resume_url: ''
  })
  const [submittingApplication, setSubmittingApplication] = useState(false)
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  
  const { 
    job, 
    loading, 
    error, 
    isJobSaved, 
    hasApplied, 
    toggleSaved, 
    trackView 
  } = useJob(params.id as string, user?.id)

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
    }
    getUser()
  }, [supabase])

  useEffect(() => {
    if (job && !loading) {
      trackView()
    }
  }, [job, loading, trackView])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatSalary = (min?: number, max?: number, currency = 'USD') => {
    if (!min && !max) return null
    
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })

    if (min && max) {
      return `${formatter.format(min)} - ${formatter.format(max)}`
    }
    
    return formatter.format(min || max || 0)
  }

  const getJobTypeColor = (jobType: string) => {
    switch (jobType) {
      case 'Full-Time':
        return 'bg-gradient-success text-white'
      case 'Part-Time':
        return 'bg-gradient-accent text-white'
      case 'Contract':
        return 'bg-gradient-secondary text-white'
      case 'Internship':
        return 'bg-gradient-warning text-white'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: job?.title || 'Job Opportunity',
          text: `Check out this job opportunity: ${job?.title} at ${job?.company}`,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  const handleApply = async () => {
    if (!user || !job) {
      router.push('/auth/login')
      return
    }

    setSubmittingApplication(true)
    try {
      const { error } = await supabase
        .from('job_applications')
        .insert({
          job_id: job.id,
          applicant_id: user.id,
          cover_letter: applicationData.cover_letter || null,
          resume_url: applicationData.resume_url || null
        })

      if (error) throw error

      setShowApplicationForm(false)
      setApplicationData({ cover_letter: '', resume_url: '' })
      window.location.reload() // Refresh to show updated application status
    } catch (error: any) {
      alert(`Error submitting application: ${error.message}`)
    } finally {
      setSubmittingApplication(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="floating-card p-12">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-blue-600 mx-auto mb-6"></div>
            <p className="text-slate-600 text-lg">Loading job details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="floating-card p-12">
            <Briefcase className="h-16 w-16 text-slate-300 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Job Not Found</h1>
            <p className="text-slate-600 mb-8">{error || "The job you're looking for doesn't exist or has been removed."}</p>
            <Link
              href="/jobs"
              className="btn-3d text-white px-8 py-3 text-lg font-semibold inline-flex items-center space-x-2"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Jobs</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const company = job.companies

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Back Button */}
      <div className="mb-8">
        <Link
          href="/jobs"
          className="btn-glass px-6 py-3 text-lg font-semibold inline-flex items-center space-x-2 hover:scale-105 transition-transform"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Jobs</span>
        </Link>
      </div>

      {/* Job Header */}
      <div className="floating-card p-10 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
          <div className="flex-1">
            <div className="flex items-start gap-6 mb-6">
              <div className="w-24 h-24 bg-gradient-primary rounded-3xl flex items-center justify-center shadow-2xl">
                {company?.logo_url ? (
                  <img 
                    src={company.logo_url} 
                    alt={company.name || job.company}
                    className="w-16 h-16 rounded-2xl object-cover"
                  />
                ) : (
                  <Building className="h-12 w-12 text-white" />
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                  {job.title}
                </h1>
                <div className="flex flex-wrap items-center gap-6 text-slate-600 mb-6">
                  <div className="flex items-center gap-2 bg-white/50 px-4 py-2 rounded-lg">
                    <Building className="h-5 w-5" />
                    <span className="font-semibold text-lg">
                      {company?.name || job.company}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/50 px-4 py-2 rounded-lg">
                    <MapPin className="h-5 w-5" />
                    <span className="text-lg">{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/50 px-4 py-2 rounded-lg">
                    <Calendar className="h-5 w-5" />
                    <span className="text-lg">Posted {formatDate(job.created_at)}</span>
                  </div>
                  {job.view_count && (
                    <div className="flex items-center gap-2 bg-white/50 px-4 py-2 rounded-lg">
                      <Eye className="h-5 w-5" />
                      <span className="text-lg">{job.view_count} views</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  <span className={`px-6 py-3 rounded-xl text-lg font-semibold ${getJobTypeColor(job.employment_type || job.job_type)} shadow-lg`}>
                    {job.employment_type || job.job_type}
                  </span>
                  {job.remote_type && (
                    <span className="px-6 py-3 rounded-xl text-lg font-semibold bg-gradient-accent text-white shadow-lg">
                      {job.remote_type}
                    </span>
                  )}
                  {job.experience_level && (
                    <span className="px-6 py-3 rounded-xl text-lg font-semibold bg-gradient-primary text-white shadow-lg">
                      {job.experience_level} Level
                    </span>
                  )}
                  {(job.salary_min || job.salary_max) && (
                    <div className="flex items-center gap-2 bg-gradient-success text-white px-6 py-3 rounded-xl shadow-lg">
                      <DollarSign className="h-5 w-5" />
                      <span className="font-semibold">
                        {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-4 lg:min-w-[200px]">
            {user && (
              <button
                onClick={toggleSaved}
                className={`btn-glass px-6 py-3 text-lg font-semibold flex items-center justify-center space-x-2 ${
                  isJobSaved ? 'bg-gradient-secondary text-white' : ''
                }`}
              >
                <Heart className={`h-5 w-5 ${isJobSaved ? 'fill-current' : ''}`} />
                <span>{isJobSaved ? 'Saved' : 'Save Job'}</span>
              </button>
            )}
            <button
              onClick={handleShare}
              className="btn-glass px-6 py-3 text-lg font-semibold flex items-center justify-center space-x-2"
            >
              <Share2 className="h-5 w-5" />
              <span>Share</span>
            </button>
            {!user && (
              <div className="text-center p-4 bg-slate-50 rounded-xl">
                <p className="text-slate-600 text-sm mb-3">Sign in to save jobs and apply</p>
                <button
                  onClick={() => router.push('/auth/login')}
                  className="btn-3d text-white px-4 py-2 text-sm font-semibold"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Job Description */}
          <div className="floating-card p-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <Briefcase className="h-8 w-8 text-gradient" />
              Job Description
            </h2>
            <div className="prose prose-lg max-w-none text-slate-700 leading-relaxed">
              {job.description.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <div className="floating-card p-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-gradient-success" />
                Requirements
              </h2>
              <div className="space-y-3">
                {job.requirements.map((requirement, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-slate-700 text-lg">{requirement}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {job.skills && job.skills.length > 0 && (
            <div className="floating-card p-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Required Skills</h2>
              <div className="flex flex-wrap gap-3">
                {job.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-gradient-primary text-white rounded-lg font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Benefits */}
          {job.benefits && job.benefits.length > 0 && (
            <div className="floating-card p-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Benefits & Perks</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {job.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span className="text-slate-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Apply Button */}
          <div className="floating-card p-8 text-center">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Ready to Apply?</h3>
            <p className="text-slate-600 text-lg mb-6">
              Don't miss out on this amazing opportunity. Apply now and take the next step in your career!
            </p>
            {hasApplied ? (
              <div className="flex items-center justify-center gap-3 text-green-600">
                <CheckCircle className="h-6 w-6" />
                <span className="text-xl font-semibold">Application Submitted</span>
              </div>
            ) : (
              <div className="space-y-4">
                {!showApplicationForm ? (
                  <button 
                    onClick={() => setShowApplicationForm(true)}
                    className="btn-3d text-white px-12 py-4 text-xl font-semibold flex items-center justify-center space-x-3 mx-auto group"
                  >
                    <ExternalLink className="h-6 w-6 group-hover:scale-110 transition-transform" />
                    <span>Apply Now</span>
                  </button>
                ) : (
                  <div className="max-w-2xl mx-auto space-y-6">
                    <h4 className="text-xl font-bold text-slate-900 text-center">Submit Your Application</h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Cover Letter
                      </label>
                      <textarea
                        rows={6}
                        className="glass-input w-full px-4 py-3 rounded-xl text-slate-800 placeholder:text-slate-500 focus:outline-none transition-all duration-200"
                        placeholder="Tell us why you're interested in this position and what makes you a great fit..."
                        value={applicationData.cover_letter}
                        onChange={(e) => setApplicationData(prev => ({ ...prev, cover_letter: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Resume URL (optional)
                      </label>
                      <input
                        type="url"
                        className="glass-input w-full px-4 py-3 rounded-xl text-slate-800 placeholder:text-slate-500 focus:outline-none transition-all duration-200"
                        placeholder="https://drive.google.com/file/d/your-resume"
                        value={applicationData.resume_url}
                        onChange={(e) => setApplicationData(prev => ({ ...prev, resume_url: e.target.value }))}
                      />
                    </div>
                    
                    <div className="flex gap-4">
                      <button
                        onClick={() => setShowApplicationForm(false)}
                        className="flex-1 btn-glass px-6 py-3 text-lg font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleApply}
                        disabled={submittingApplication}
                        className="flex-1 btn-3d text-white px-6 py-3 text-lg font-semibold disabled:opacity-50"
                      >
                        {submittingApplication ? 'Submitting...' : 'Submit Application'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <div className="floating-card p-6">
            <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Star className="h-6 w-6 text-gradient" />
              Quick Info
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Job Type</span>
                <span className="font-semibold text-slate-900">{job.employment_type || job.job_type}</span>
              </div>
              {job.experience_level && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Experience</span>
                  <span className="font-semibold text-slate-900">{job.experience_level}</span>
                </div>
              )}
              {job.remote_type && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Work Style</span>
                  <span className="font-semibold text-slate-900">{job.remote_type}</span>
                </div>
              )}
              {job.application_deadline && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Apply by</span>
                  <span className="font-semibold text-slate-900">
                    {formatDate(job.application_deadline)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Company Info */}
          {company && (
            <div className="floating-card p-6">
              <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Building className="h-6 w-6 text-gradient" />
                About {company.name || job.company}
              </h3>
              <div className="space-y-4">
                {company.description && (
                  <p className="text-slate-700 leading-relaxed">{company.description}</p>
                )}
                {company.size_range && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Users className="h-5 w-5" />
                    <span>{company.size_range} employees</span>
                  </div>
                )}
                {company.headquarters && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="h-5 w-5" />
                    <span>{company.headquarters}</span>
                  </div>
                )}
                {company.founded_year && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="h-5 w-5" />
                    <span>Founded {company.founded_year}</span>
                  </div>
                )}
                {company.website && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Globe className="h-5 w-5" />
                    <a 
                      href={company.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Company Website
                    </a>
                  </div>
                )}
                {company.industry && (
                  <div className="bg-gradient-primary/10 px-4 py-2 rounded-lg">
                    <span className="text-slate-700 font-medium">{company.industry}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
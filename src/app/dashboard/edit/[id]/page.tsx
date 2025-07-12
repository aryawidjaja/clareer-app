'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { Job } from '@/types/database'
import { User } from '@supabase/supabase-js'
import { 
  Briefcase, 
  Building, 
  MapPin, 
  FileText, 
  Clock, 
  ArrowLeft, 
  Save,
  Eye,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'

export default function EditJobPage() {
  const [user, setUser] = useState<User | null>(null)
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    location: '',
    job_type: 'Full-Time' as 'Full-Time' | 'Part-Time' | 'Contract'
  })
  
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth/login')
        return
      }
      setUser(session.user)
      fetchJob(session.user.id)
    }

    getUser()
  }, [supabase.auth, router, params.id])

  const fetchJob = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', params.id)
        .eq('user_id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          setError('Job not found or you don\'t have permission to edit it')
        } else {
          throw error
        }
      } else {
        setJob(data)
        setFormData({
          title: data.title,
          company: data.company,
          description: data.description,
          location: data.location,
          job_type: data.job_type
        })
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !job) return

    setSubmitting(true)
    setError('')
    setSuccess(false)

    try {
      const { error } = await supabase
        .from('jobs')
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', job.id)
        .eq('user_id', user.id)

      if (error) throw error

      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setSubmitting(false)
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
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Access Denied</h1>
            <p className="text-slate-600 mb-8">{error || 'You don\'t have permission to edit this job or it doesn\'t exist.'}</p>
            <Link
              href="/dashboard"
              className="btn-3d text-white px-8 py-3 text-lg font-semibold inline-flex items-center space-x-2"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="btn-glass px-6 py-3 text-lg font-semibold inline-flex items-center space-x-2 hover:scale-105 transition-transform"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Page Header */}
      <div className="floating-card p-8 mb-8">
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-2xl">
            <Briefcase className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-slate-900 mb-3">
              Edit Job <span className="text-gradient">Posting</span>
            </h1>
            <p className="text-slate-600 text-lg">Update your job posting details and attract the right candidates.</p>
          </div>
          <Link
            href={`/jobs/${job.id}`}
            className="btn-glass px-6 py-3 text-lg font-semibold flex items-center space-x-2"
          >
            <Eye className="h-5 w-5" />
            <span>Preview</span>
          </Link>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="floating-card p-6 mb-8 bg-green-50 border-green-200">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-900">Job Updated Successfully!</h3>
              <p className="text-green-700">Redirecting to dashboard...</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="floating-card p-6 mb-8 bg-red-50 border-red-200">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-900">Update Failed</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="floating-card p-10">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Job Title */}
          <div>
            <label htmlFor="title" className="block text-lg font-semibold text-slate-900 mb-3">
              Job Title *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Briefcase className="h-6 w-6 text-slate-400" />
              </div>
              <input
                type="text"
                id="title"
                name="title"
                required
                className="glass-input form-glow block w-full pl-14 pr-4 py-4 rounded-xl text-slate-800 placeholder:text-slate-500 focus:outline-none transition-all duration-200 text-lg"
                placeholder="e.g. Senior Frontend Developer"
                value={formData.title}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Company Name */}
          <div>
            <label htmlFor="company" className="block text-lg font-semibold text-slate-900 mb-3">
              Company Name *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Building className="h-6 w-6 text-slate-400" />
              </div>
              <input
                type="text"
                id="company"
                name="company"
                required
                className="glass-input form-glow block w-full pl-14 pr-4 py-4 rounded-xl text-slate-800 placeholder:text-slate-500 focus:outline-none transition-all duration-200 text-lg"
                placeholder="e.g. Acme Inc."
                value={formData.company}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-lg font-semibold text-slate-900 mb-3">
                Location *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MapPin className="h-6 w-6 text-slate-400" />
                </div>
                <input
                  type="text"
                  id="location"
                  name="location"
                  required
                  className="glass-input form-glow block w-full pl-14 pr-4 py-4 rounded-xl text-slate-800 placeholder:text-slate-500 focus:outline-none transition-all duration-200 text-lg"
                  placeholder="e.g. San Francisco, CA or Remote"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Job Type */}
            <div>
              <label htmlFor="job_type" className="block text-lg font-semibold text-slate-900 mb-3">
                Job Type *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Clock className="h-6 w-6 text-slate-400" />
                </div>
                <select
                  id="job_type"
                  name="job_type"
                  required
                  className="glass-input form-glow block w-full pl-14 pr-4 py-4 rounded-xl text-slate-800 focus:outline-none transition-all duration-200 text-lg appearance-none cursor-pointer"
                  value={formData.job_type}
                  onChange={handleInputChange}
                >
                  <option value="Full-Time" className="bg-white text-slate-800">Full-Time</option>
                  <option value="Part-Time" className="bg-white text-slate-800">Part-Time</option>
                  <option value="Contract" className="bg-white text-slate-800">Contract</option>
                </select>
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div>
            <label htmlFor="description" className="block text-lg font-semibold text-slate-900 mb-3">
              Job Description *
            </label>
            <div className="relative">
              <div className="absolute top-4 left-4 pointer-events-none">
                <FileText className="h-6 w-6 text-slate-400" />
              </div>
              <textarea
                id="description"
                name="description"
                required
                rows={10}
                className="glass-input form-glow block w-full pl-14 pr-4 py-4 rounded-xl text-slate-800 placeholder:text-slate-500 focus:outline-none transition-all duration-200 text-lg resize-none"
                placeholder="Describe the role, responsibilities, requirements, and what you're looking for in a candidate. Be specific about skills, experience level, and company culture..."
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
            <p className="mt-2 text-slate-500 text-sm">
              {formData.description.length} characters • Minimum 100 characters recommended
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="btn-glass px-8 py-4 text-lg font-semibold flex items-center justify-center space-x-2 flex-1"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Cancel</span>
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-3d text-white px-8 py-4 text-lg font-semibold flex items-center justify-center space-x-2 flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>Update Job</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Preview Card */}
      <div className="mt-8">
        <div className="floating-card p-8">
          <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <Eye className="h-6 w-6 text-gradient" />
            Live Preview
          </h3>
          <div className="job-card p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Building className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-bold text-slate-900 mb-2">
                  {formData.title || 'Job Title'}
                </h4>
                <div className="flex flex-wrap items-center gap-4 text-slate-600 mb-3">
                  <span className="font-medium">{formData.company || 'Company Name'}</span>
                  <span>•</span>
                  <span>{formData.location || 'Location'}</span>
                  <span>•</span>
                  <span className="px-3 py-1 bg-gradient-primary text-white rounded-lg text-sm">
                    {formData.job_type}
                  </span>
                </div>
                <p className="text-slate-700 line-clamp-2">
                  {formData.description.substring(0, 200) || 'Job description will appear here...'}
                  {formData.description.length > 200 && '...'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
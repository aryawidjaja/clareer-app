'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { JobWithCompany } from '@/types/database'
import { Heart, Building, MapPin, Calendar, ArrowRight, Trash2, ExternalLink } from 'lucide-react'

export default function SavedJobsPage() {
  const [user, setUser] = useState<any>(null)
  const [savedJobs, setSavedJobs] = useState<JobWithCompany[]>([])
  const [loading, setLoading] = useState(true)
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
      await loadSavedJobs(session.user.id)
      setLoading(false)
    }

    getUser()
  }, [router])

  const loadSavedJobs = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('saved_jobs')
        .select(`
          saved_at,
          jobs (
            *,
            companies (
              id,
              name,
              logo_url
            )
          )
        `)
        .eq('user_id', userId)
        .order('saved_at', { ascending: false })

      if (error) throw error

      const jobsData = data?.map(item => ({
        ...item.jobs,
        saved_at: item.saved_at
      })).filter(job => job && job.id) as JobWithCompany[]

      setSavedJobs(jobsData)
    } catch (error) {
      console.error('Error loading saved jobs:', error)
    }
  }

  const removeSavedJob = async (jobId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('saved_jobs')
        .delete()
        .eq('job_id', jobId)
        .eq('user_id', user.id)

      if (error) throw error

      setSavedJobs(prev => prev.filter(job => job.id !== jobId))
    } catch (error) {
      console.error('Error removing saved job:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="floating-card p-12">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-blue-600 mx-auto mb-6"></div>
            <p className="text-slate-600 text-lg">Loading your saved jobs...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
          Your Saved <span className="text-gradient-animated">Jobs</span>
        </h1>
        <p className="text-xl text-slate-600">
          {savedJobs.length} {savedJobs.length === 1 ? 'job' : 'jobs'} saved for later
        </p>
      </div>

      {savedJobs.length === 0 ? (
        <div className="floating-card text-center py-20">
          <Heart className="h-24 w-24 text-slate-300 mx-auto mb-8" />
          <h3 className="text-3xl font-bold text-slate-900 mb-4">No saved jobs yet</h3>
          <p className="text-slate-600 text-lg mb-8">
            Start browsing jobs and save the ones you're interested in for easy access later.
          </p>
          <Link
            href="/jobs"
            className="btn-3d text-white px-8 py-3 text-lg font-semibold inline-flex items-center space-x-2"
          >
            <ArrowRight className="h-5 w-5" />
            <span>Browse Jobs</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {savedJobs.map((job) => {
            const company = job.companies
            return (
              <div key={job.id} className="floating-card p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg">
                        {company?.logo_url ? (
                          <img 
                            src={company.logo_url} 
                            alt={company.name || job.company}
                            className="w-8 h-8 rounded-lg object-cover"
                          />
                        ) : (
                          <Building className="h-6 w-6 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <Link
                          href={`/jobs/${job.id}`}
                          className="text-xl font-bold text-slate-900 hover:text-gradient transition-colors"
                        >
                          {job.title}
                        </Link>
                        <div className="flex flex-wrap items-center gap-4 text-slate-600 mt-2 mb-3">
                          <div className="flex items-center gap-1">
                            <Building className="h-4 w-4" />
                            <span>{company?.name || job.company}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>Saved {formatDate(job.saved_at)}</span>
                          </div>
                        </div>
                        <p className="text-slate-700 line-clamp-2">
                          {job.description.length > 150 
                            ? `${job.description.substring(0, 150)}...` 
                            : job.description}
                        </p>
                        
                        {/* Skills Preview */}
                        {job.skills && job.skills.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {job.skills.slice(0, 3).map((skill, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-gradient-primary/10 text-slate-700 rounded text-sm"
                              >
                                {skill}
                              </span>
                            ))}
                            {job.skills.length > 3 && (
                              <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-sm">
                                +{job.skills.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:min-w-[200px]">
                    <Link
                      href={`/jobs/${job.id}`}
                      className="btn-3d text-white px-6 py-3 font-semibold flex items-center justify-center space-x-2"
                    >
                      <ExternalLink className="h-5 w-5" />
                      <span>View Job</span>
                    </Link>
                    <button
                      onClick={() => removeSavedJob(job.id)}
                      className="btn-glass px-6 py-3 font-semibold flex items-center justify-center space-x-2 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-5 w-5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
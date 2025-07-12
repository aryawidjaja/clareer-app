'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { Job } from '@/types/database'
import { User } from '@supabase/supabase-js'
import { Plus, Edit, Trash2, Eye, Building, MapPin, Calendar, Briefcase } from 'lucide-react'

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingJob, setDeletingJob] = useState<string | null>(null)
  
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
      fetchUserJobs(session.user.id)
    }

    getUser()
  }, [supabase.auth, router])

  const fetchUserJobs = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      setJobs(data || [])
    } catch (error) {
      console.error('Error fetching user jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return
    }

    setDeletingJob(jobId)

    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId)

      if (error) throw error

      setJobs(jobs.filter(job => job.id !== jobId))
    } catch (error) {
      console.error('Error deleting job:', error)
      alert('Failed to delete job. Please try again.')
    } finally {
      setDeletingJob(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getJobTypeColor = (jobType: string) => {
    switch (jobType) {
      case 'Full-Time':
        return 'bg-green-100 text-green-800'
      case 'Part-Time':
        return 'bg-blue-100 text-blue-800'
      case 'Contract':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="floating-card p-8 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              Your <span className="text-gradient">Dashboard</span>
            </h1>
            <p className="text-slate-600 text-lg">Manage your job postings and track performance</p>
          </div>
          <Link
            href="/post-job"
            className="mt-4 sm:mt-0 btn-3d text-white px-8 py-3 text-lg font-semibold flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Post New Job</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="floating-card p-8 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-medium text-slate-600 mb-2">Total Jobs Posted</p>
              <p className="text-4xl font-bold text-gradient">{jobs.length}</p>
            </div>
            <div className="w-20 h-20 bg-gradient-primary rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
              <Briefcase className="h-10 w-10 text-white" />
            </div>
          </div>
        </div>

        <div className="floating-card p-8 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-medium text-slate-600 mb-2">Active Postings</p>
              <p className="text-4xl font-bold text-gradient-accent">{jobs.length}</p>
            </div>
            <div className="w-20 h-20 bg-gradient-accent rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
              <Eye className="h-10 w-10 text-white" />
            </div>
          </div>
        </div>

        <div className="floating-card p-8 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-medium text-slate-600 mb-2">Account</p>
              <p className="text-lg font-medium text-slate-900 truncate">{user?.email}</p>
            </div>
            <div className="w-20 h-20 bg-gradient-secondary rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
              <Building className="h-10 w-10 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="floating-card overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-200/50">
          <h2 className="text-2xl font-bold text-slate-900">Your Job Postings</h2>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs posted yet</h3>
            <p className="text-gray-500 mb-6">Get started by posting your first job opening.</p>
            <Link
              href="/post-job"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Post Your First Job</span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {jobs.map((job) => (
              <div key={job.id} className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{job.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        <span>{job.company}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Posted {formatDate(job.created_at)}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 line-clamp-2">
                      {job.description.length > 150 
                        ? `${job.description.substring(0, 150)}...` 
                        : job.description}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 lg:items-end">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getJobTypeColor(job.job_type)}`}>
                      {job.job_type}
                    </span>
                    
                    <div className="flex gap-2">
                      <Link
                        href={`/jobs/${job.id}`}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View job"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/dashboard/edit/${job.id}`}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit job"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        disabled={deletingJob === job.id}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete job"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { JobWithStats } from '@/types/database'

interface UseJobReturn {
  job: JobWithStats | null
  loading: boolean
  error: string | null
  isJobSaved: boolean
  hasApplied: boolean
  toggleSaved: () => Promise<void>
  trackView: () => Promise<void>
}

export function useJob(jobId: string, userId?: string): UseJobReturn {
  const [job, setJob] = useState<JobWithStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isJobSaved, setIsJobSaved] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)
  const [viewTracked, setViewTracked] = useState(false)

  const supabase = createClient()

  const fetchJob = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch job with company information
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select(`
          *,
          companies (
            id,
            name,
            description,
            website,
            logo_url,
            size_range,
            industry,
            founded_year,
            headquarters
          )
        `)
        .eq('id', jobId)
        .single()

      if (jobError) throw jobError

      if (!jobData) {
        throw new Error('Job not found')
      }

      setJob(jobData)

      // Check if user has saved this job
      if (userId) {
        const { data: savedData } = await supabase
          .from('saved_jobs')
          .select('id')
          .eq('job_id', jobId)
          .eq('user_id', userId)
          .single()

        setIsJobSaved(!!savedData)

        // Check if user has applied for this job
        const { data: applicationData } = await supabase
          .from('job_applications')
          .select('id')
          .eq('job_id', jobId)
          .eq('applicant_id', userId)
          .single()

        setHasApplied(!!applicationData)
      }
    } catch (err) {
      console.error('Error fetching job:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch job')
    } finally {
      setLoading(false)
    }
  }, [jobId, userId, supabase])

  const trackView = useCallback(async () => {
    if (viewTracked || !job) return

    try {
      // Insert view record (triggers view counter increment)
      await supabase.from('job_views').insert({
        job_id: jobId,
        user_id: userId || null,
        ip_address: null, // Could be obtained from request headers in a real app
        user_agent: navigator.userAgent
      })

      setViewTracked(true)
    } catch (err) {
      console.error('Error tracking view:', err)
      // Don't set error state for view tracking failures
    }
  }, [jobId, userId, viewTracked, job, supabase])

  const toggleSaved = useCallback(async () => {
    if (!userId || !job) return

    try {
      if (isJobSaved) {
        // Remove from saved jobs
        await supabase
          .from('saved_jobs')
          .delete()
          .eq('job_id', jobId)
          .eq('user_id', userId)

        setIsJobSaved(false)
      } else {
        // Add to saved jobs
        await supabase
          .from('saved_jobs')
          .insert({
            job_id: jobId,
            user_id: userId
          })

        setIsJobSaved(true)
      }
    } catch (err) {
      console.error('Error toggling saved job:', err)
      // Revert optimistic update on error
      setIsJobSaved(!isJobSaved)
    }
  }, [jobId, userId, isJobSaved, job, supabase])

  useEffect(() => {
    if (jobId) {
      fetchJob()
    }
  }, [fetchJob])

  return {
    job,
    loading,
    error,
    isJobSaved,
    hasApplied,
    toggleSaved,
    trackView
  }
}
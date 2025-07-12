import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase'
import { JobWithStats } from '@/types/database'

// Custom hook for debouncing values
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

interface UseJobsOptions {
  searchTerm?: string
  locationFilter?: string
  jobTypeFilter?: string
  limit?: number
  includeInactive?: boolean
}

interface UseJobsReturn {
  jobs: JobWithStats[]
  loading: boolean
  error: string | null
  totalCount: number
  refetch: () => Promise<void>
}

export function useJobs(options: UseJobsOptions = {}): UseJobsReturn {
  const [jobs, setJobs] = useState<JobWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)

  const {
    searchTerm = '',
    locationFilter = '',
    jobTypeFilter = '',
    limit = 50,
    includeInactive = false
  } = options

  // Debounce search terms to prevent excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const debouncedLocationFilter = useDebounce(locationFilter, 300)

  const supabase = createClient()

  // Memoize the query to avoid unnecessary re-renders
  const query = useMemo(() => {
    let query = supabase
      .from('jobs')
      .select(`
        *,
        companies (
          id,
          name,
          description,
          logo_url,
          size_range,
          industry
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })

    if (!includeInactive) {
      query = query.eq('is_active', true)
    }

    if (debouncedSearchTerm) {
      query = query.or(`title.ilike.%${debouncedSearchTerm}%,company.ilike.%${debouncedSearchTerm}%,description.ilike.%${debouncedSearchTerm}%`)
    }

    if (debouncedLocationFilter) {
      query = query.ilike('location', `%${debouncedLocationFilter}%`)
    }

    if (jobTypeFilter) {
      query = query.eq('job_type', jobTypeFilter)
    }

    return query.limit(limit)
  }, [supabase, debouncedSearchTerm, debouncedLocationFilter, jobTypeFilter, limit, includeInactive])

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error, count } = await query

      if (error) throw error

      setJobs(data || [])
      setTotalCount(count || 0)
    } catch (err) {
      console.error('Error fetching jobs:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch jobs')
    } finally {
      setLoading(false)
    }
  }, [query])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  return {
    jobs,
    loading,
    error,
    totalCount,
    refetch: fetchJobs
  }
}
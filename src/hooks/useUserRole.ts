import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { UserProfile } from '@/types/database'

interface UseUserRoleReturn {
  userProfile: UserProfile | null
  loading: boolean
  error: string | null
  isEmployer: boolean
  isJobSeeker: boolean
  hasProfile: boolean
  refreshProfile: () => Promise<void>
}

export function useUserRole(userId?: string): UseUserRoleReturn {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const fetchUserProfile = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      setUserProfile(data || null)
    } catch (err) {
      console.error('Error fetching user profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch user profile')
    } finally {
      setLoading(false)
    }
  }, [userId, supabase])

  useEffect(() => {
    fetchUserProfile()
  }, [fetchUserProfile])

  const refreshProfile = useCallback(async () => {
    await fetchUserProfile()
  }, [fetchUserProfile])

  return {
    userProfile,
    loading,
    error,
    isEmployer: userProfile?.is_employer || false,
    isJobSeeker: userProfile?.is_job_seeker !== false, // Default to true if null
    hasProfile: !!userProfile,
    refreshProfile
  }
}
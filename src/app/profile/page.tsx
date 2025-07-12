'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { UserProfile } from '@/types/database'
import { User, Mail, MapPin, Globe, Linkedin, Github, Briefcase, Tag, Plus, Save, AlertCircle } from 'lucide-react'

function ProfileContent() {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  
  // Check URL parameters for role setup or redirect
  const isSetup = searchParams.get('setup') === 'employer'
  const roleParam = searchParams.get('role')
  const redirectParam = searchParams.get('redirect')
  const [profileData, setProfileData] = useState({
    full_name: '',
    bio: '',
    location: '',
    website: '',
    linkedin_url: '',
    github_url: '',
    current_title: '',
    experience_years: '',
    is_employer: false,
    is_job_seeker: true,
    skills: [] as string[]
  })
  const [newSkill, setNewSkill] = useState('')


  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth/login')
        return
      }
      setUser({ id: session.user.id, email: session.user.email || '' })
      await loadProfile(session.user.id)
      setLoading(false)
    }

    getUser()
  }, [router])

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      if (data) {
        setProfile(data)
        setProfileData({
          full_name: data.full_name || '',
          bio: data.bio || '',
          location: data.location || '',
          website: data.website || '',
          linkedin_url: data.linkedin_url || '',
          github_url: data.github_url || '',
          current_title: data.current_title || '',
          experience_years: data.experience_years?.toString() || '',
          is_employer: data.is_employer || false,
          is_job_seeker: data.is_job_seeker !== false,
          skills: data.skills || []
        })
      } else if (isSetup || roleParam === 'employer') {
        // Pre-set as employer if coming from job posting
        setProfileData(prev => ({
          ...prev,
          is_employer: true
        }))
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setProfileData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const addSkill = () => {
    if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
      setProfileData(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }))
      setNewSkill('')
    }
  }

  const removeSkill = (index: number) => {
    setProfileData(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== index) }))
  }

  const saveProfile = async () => {
    if (!user) return

    setSaving(true)
    setError('')

    try {
      const profileUpdateData = {
        user_id: user.id,
        full_name: profileData.full_name || null,
        bio: profileData.bio || null,
        location: profileData.location || null,
        website: profileData.website || null,
        linkedin_url: profileData.linkedin_url || null,
        github_url: profileData.github_url || null,
        current_title: profileData.current_title || null,
        experience_years: profileData.experience_years ? parseInt(profileData.experience_years) : null,
        is_employer: profileData.is_employer,
        is_job_seeker: profileData.is_job_seeker,
        skills: profileData.skills.length > 0 ? profileData.skills : null
      }

      if (profile) {
        // Update existing profile
        const { error } = await supabase
          .from('user_profiles')
          .update(profileUpdateData)
          .eq('user_id', user.id)

        if (error) throw error
      } else {
        // Create new profile
        const { data, error } = await supabase
          .from('user_profiles')
          .insert([profileUpdateData])
          .select()
          .single()

        if (error) throw error
        setProfile(data)
      }

      setSuccess('Profile saved successfully!')
      
      // Redirect if there was a redirect parameter
      if (redirectParam) {
        setTimeout(() => {
          router.push(redirectParam)
        }, 1500)
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="floating-card p-12">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-blue-600 mx-auto mb-6"></div>
            <p className="text-slate-600 text-lg">Loading your profile...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="floating-card p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4 text-gradient-animated">
            {isSetup ? 'Complete Your Profile' : 'Your Profile'}
          </h1>
          <p className="text-slate-600 text-lg">
            {isSetup 
              ? 'Set up your employer profile to start posting jobs.' 
              : roleParam === 'employer'
              ? 'Enable employer access to post job listings.'
              : 'Manage your professional information and preferences.'}
          </p>
          {(isSetup || roleParam === 'employer') && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-blue-800 text-sm font-medium">
                  You need employer access to post jobs.
                </p>
                <p className="text-blue-700 text-sm">
                  Please check the &quot;I&apos;m a hiring manager or recruiter&quot; option below and save your profile.
                </p>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl mb-6">
            {success}
            {redirectParam && (
              <p className="text-sm mt-1">Redirecting you to continue...</p>
            )}
          </div>
        )}

        <div className="space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    name="full_name"
                    className="glass-input form-glow block w-full pl-12 pr-4 py-4 rounded-xl text-slate-800 placeholder:text-slate-500 focus:outline-none transition-all duration-200"
                    placeholder="Your full name"
                    value={profileData.full_name}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email (from account)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    className="glass-input block w-full pl-12 pr-4 py-4 rounded-xl text-slate-500 bg-slate-50"
                    value={user?.email || ''}
                    disabled
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                rows={4}
                className="glass-input form-glow block w-full px-4 py-4 rounded-xl text-slate-800 placeholder:text-slate-500 focus:outline-none transition-all duration-200"
                placeholder="Tell us about yourself, your experience, and what you're looking for..."
                value={profileData.bio}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Current Title
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Briefcase className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    name="current_title"
                    className="glass-input form-glow block w-full pl-12 pr-4 py-4 rounded-xl text-slate-800 placeholder:text-slate-500 focus:outline-none transition-all duration-200"
                    placeholder="e.g. Senior Frontend Developer"
                    value={profileData.current_title}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Years of Experience
                </label>
                <input
                  type="number"
                  name="experience_years"
                  className="glass-input form-glow block w-full px-4 py-4 rounded-xl text-slate-800 placeholder:text-slate-500 focus:outline-none transition-all duration-200"
                  placeholder="5"
                  min="0"
                  value={profileData.experience_years}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">Contact & Links</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Location
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    name="location"
                    className="glass-input form-glow block w-full pl-12 pr-4 py-4 rounded-xl text-slate-800 placeholder:text-slate-500 focus:outline-none transition-all duration-200"
                    placeholder="e.g. San Francisco, CA"
                    value={profileData.location}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Website
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Globe className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="url"
                    name="website"
                    className="glass-input form-glow block w-full pl-12 pr-4 py-4 rounded-xl text-slate-800 placeholder:text-slate-500 focus:outline-none transition-all duration-200"
                    placeholder="https://yourwebsite.com"
                    value={profileData.website}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  LinkedIn URL
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Linkedin className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="url"
                    name="linkedin_url"
                    className="glass-input form-glow block w-full pl-12 pr-4 py-4 rounded-xl text-slate-800 placeholder:text-slate-500 focus:outline-none transition-all duration-200"
                    placeholder="https://linkedin.com/in/yourprofile"
                    value={profileData.linkedin_url}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  GitHub URL
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Github className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="url"
                    name="github_url"
                    className="glass-input form-glow block w-full pl-12 pr-4 py-4 rounded-xl text-slate-800 placeholder:text-slate-500 focus:outline-none transition-all duration-200"
                    placeholder="https://github.com/yourusername"
                    value={profileData.github_url}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">Skills</h2>
            
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Tag className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Add a skill"
                    className="glass-input block w-full pl-12 pr-4 py-3 rounded-xl text-slate-800 placeholder:text-slate-500 focus:outline-none transition-all duration-200"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  />
                </div>
                <button
                  type="button"
                  onClick={addSkill}
                  className="btn-3d text-white px-4 py-3 font-medium"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              {profileData.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {profileData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gradient-primary text-white rounded-lg text-sm font-medium flex items-center space-x-2"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => removeSkill(index)}
                        className="text-white hover:text-red-200"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">Preferences</h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_job_seeker"
                  name="is_job_seeker"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={profileData.is_job_seeker}
                  onChange={handleInputChange}
                />
                <label htmlFor="is_job_seeker" className="ml-3 text-sm font-medium text-slate-700">
                  I&apos;m looking for job opportunities
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_employer"
                  name="is_employer"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={profileData.is_employer}
                  onChange={handleInputChange}
                />
                <label htmlFor="is_employer" className="ml-3 text-sm font-medium text-slate-700">
                  I&apos;m a hiring manager or recruiter
                </label>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-6">
            <button
              onClick={saveProfile}
              disabled={saving}
              className="btn-3d text-white px-8 py-4 text-lg font-semibold flex items-center space-x-2 disabled:opacity-50"
            >
              <Save className="h-5 w-5" />
              <span>{saving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="floating-card p-12">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-blue-600 mx-auto mb-6"></div>
            <p className="text-slate-600 text-lg">Loading your profile...</p>
          </div>
        </div>
      </div>
    }>
      <ProfileContent />
    </Suspense>
  )
}
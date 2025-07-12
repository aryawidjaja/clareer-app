'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { Company } from '@/types/database'
import { useUserRole } from '@/hooks/useUserRole'
import { Briefcase, Building, MapPin, FileText, Clock, DollarSign, Users, Plus, Tag, CheckCircle, Star, AlertCircle, UserPlus } from 'lucide-react'

export default function PostJobPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const { userProfile, isEmployer, hasProfile, loading: profileLoading } = useUserRole(user?.id)
  const [companies, setCompanies] = useState<Company[]>([])
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    company_id: '',
    description: '',
    location: '',
    job_type: 'Full-Time' as 'Full-Time' | 'Part-Time' | 'Contract',
    employment_type: 'Full-Time' as 'Full-Time' | 'Part-Time' | 'Contract' | 'Internship',
    remote_type: '' as 'Remote' | 'Hybrid' | 'On-site' | '',
    experience_level: '' as 'Entry' | 'Mid' | 'Senior' | 'Lead' | 'Executive' | '',
    salary_min: '',
    salary_max: '',
    salary_currency: 'USD',
    skills: [] as string[],
    requirements: [] as string[],
    benefits: [] as string[],
    application_deadline: ''
  })
  const [newSkill, setNewSkill] = useState('')
  const [newRequirement, setNewRequirement] = useState('')
  const [newBenefit, setNewBenefit] = useState('')
  const [showNewCompanyForm, setShowNewCompanyForm] = useState(false)
  const [newCompany, setNewCompany] = useState({
    name: '',
    description: '',
    website: '',
    logo_url: '',
    size_range: '' as '1-10' | '11-50' | '51-200' | '201-1000' | '1000+' | '',
    industry: '',
    headquarters: ''
  })
  
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
      await loadCompanies()
      setLoading(false)
    }

    getUser()
  }, [supabase.auth, router])

  // Redirect if not employer after profile loads
  useEffect(() => {
    if (!loading && !profileLoading && user) {
      if (!hasProfile) {
        router.push('/profile?setup=employer&redirect=/post-job')
        return
      }
      if (!isEmployer) {
        router.push('/profile?role=employer&redirect=/post-job')
        return
      }
    }
  }, [loading, profileLoading, user, hasProfile, isEmployer, router])

  const loadCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name')
      
      if (error) throw error
      setCompanies(data || [])
    } catch (error) {
      console.error('Error loading companies:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }))
      setNewSkill('')
    }
  }

  const removeSkill = (index: number) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== index) }))
  }

  const addRequirement = () => {
    if (newRequirement.trim() && !formData.requirements.includes(newRequirement.trim())) {
      setFormData(prev => ({ ...prev, requirements: [...prev.requirements, newRequirement.trim()] }))
      setNewRequirement('')
    }
  }

  const removeRequirement = (index: number) => {
    setFormData(prev => ({ ...prev, requirements: prev.requirements.filter((_, i) => i !== index) }))
  }

  const addBenefit = () => {
    if (newBenefit.trim() && !formData.benefits.includes(newBenefit.trim())) {
      setFormData(prev => ({ ...prev, benefits: [...prev.benefits, newBenefit.trim()] }))
      setNewBenefit('')
    }
  }

  const removeBenefit = (index: number) => {
    setFormData(prev => ({ ...prev, benefits: prev.benefits.filter((_, i) => i !== index) }))
  }

  const createCompany = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .insert([newCompany])
        .select()
        .single()
      
      if (error) throw error
      
      setCompanies(prev => [...prev, data])
      setFormData(prev => ({ ...prev, company_id: data.id, company: data.name }))
      setNewCompany({ name: '', description: '', website: '', logo_url: '', size_range: '', industry: '', headquarters: '' })
      setShowNewCompanyForm(false)
    } catch (error: any) {
      setError(error.message)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSubmitting(true)
    setError('')

    try {
      const jobData = {
        title: formData.title,
        company: formData.company,
        company_id: formData.company_id || null,
        description: formData.description,
        location: formData.location,
        job_type: formData.job_type,
        employment_type: formData.employment_type,
        remote_type: formData.remote_type || null,
        experience_level: formData.experience_level || null,
        salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
        salary_currency: formData.salary_currency,
        skills: formData.skills.length > 0 ? formData.skills : null,
        requirements: formData.requirements.length > 0 ? formData.requirements : null,
        benefits: formData.benefits.length > 0 ? formData.benefits : null,
        application_deadline: formData.application_deadline || null,
        user_id: user.id
      }

      const { error } = await supabase
        .from('jobs')
        .insert([jobData])

      if (error) throw error

      router.push('/dashboard')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="floating-card p-12">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-blue-600 mx-auto mb-6"></div>
            <p className="text-slate-600 text-lg">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show access denied if not employer
  if (!loading && !profileLoading && user && hasProfile && !isEmployer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="floating-card p-12 max-w-md">
            <AlertCircle className="h-16 w-16 text-orange-500 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Employer Access Required</h1>
            <p className="text-slate-600 mb-8">
              Only employers can post job listings. Please update your profile to continue.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => router.push('/profile?role=employer')}
                className="btn-3d text-white px-6 py-3 text-lg font-semibold flex items-center justify-center space-x-2"
              >
                <UserPlus className="h-5 w-5" />
                <span>Become an Employer</span>
              </button>
              <button
                onClick={() => router.push('/jobs')}
                className="btn-glass px-6 py-3 text-lg font-semibold"
              >
                Browse Jobs Instead
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show setup profile if no profile exists
  if (!loading && !profileLoading && user && !hasProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="floating-card p-12 max-w-md">
            <UserPlus className="h-16 w-16 text-blue-500 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Complete Your Profile</h1>
            <p className="text-slate-600 mb-8">
              Please set up your profile to start posting jobs.
            </p>
            <button
              onClick={() => router.push('/profile?setup=employer&redirect=/post-job')}
              className="btn-3d text-white px-8 py-3 text-lg font-semibold flex items-center justify-center space-x-2 mx-auto"
            >
              <UserPlus className="h-5 w-5" />
              <span>Set Up Profile</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="floating-card p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4 text-gradient-animated">Post a New Job</h1>
          <p className="text-slate-600 text-lg">
            Welcome back{userProfile?.full_name ? `, ${userProfile.full_name}` : ''}! Create an amazing job posting to attract top talent.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">Basic Information</h2>
            
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
                Job Title *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Briefcase className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  className="glass-input form-glow block w-full pl-12 pr-4 py-4 rounded-xl text-slate-800 placeholder:text-slate-500 focus:outline-none transition-all duration-200"
                  placeholder="e.g. Senior Frontend Developer"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Company Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Company *
              </label>
              <div className="space-y-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-slate-400" />
                  </div>
                  <select
                    name="company_id"
                    className="glass-input form-glow block w-full pl-12 pr-4 py-4 rounded-xl text-slate-800 focus:outline-none transition-all duration-200 appearance-none cursor-pointer"
                    value={formData.company_id}
                    onChange={(e) => {
                      const selectedCompany = companies.find(c => c.id === e.target.value)
                      setFormData(prev => ({
                        ...prev,
                        company_id: e.target.value,
                        company: selectedCompany?.name || ''
                      }))
                    }}
                  >
                    <option value="">Select existing company or create new</option>
                    {companies.map(company => (
                      <option key={company.id} value={company.id}>{company.name}</option>
                    ))}
                  </select>
                </div>
                
                {!formData.company_id && (
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowNewCompanyForm(!showNewCompanyForm)}
                      className="btn-glass px-4 py-2 text-sm font-medium flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Create New Company</span>
                    </button>
                    
                    {showNewCompanyForm && (
                      <div className="mt-4 p-4 bg-slate-50 rounded-xl space-y-4">
                        <input
                          type="text"
                          placeholder="Company Name *"
                          className="glass-input w-full px-4 py-3 rounded-lg"
                          value={newCompany.name}
                          onChange={(e) => setNewCompany(prev => ({ ...prev, name: e.target.value }))}
                        />
                        <textarea
                          placeholder="Company Description"
                          className="glass-input w-full px-4 py-3 rounded-lg"
                          rows={3}
                          value={newCompany.description}
                          onChange={(e) => setNewCompany(prev => ({ ...prev, description: e.target.value }))}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            type="url"
                            placeholder="Website"
                            className="glass-input px-4 py-3 rounded-lg"
                            value={newCompany.website}
                            onChange={(e) => setNewCompany(prev => ({ ...prev, website: e.target.value }))}
                          />
                          <input
                            type="url"
                            placeholder="Logo URL"
                            className="glass-input px-4 py-3 rounded-lg"
                            value={newCompany.logo_url}
                            onChange={(e) => setNewCompany(prev => ({ ...prev, logo_url: e.target.value }))}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <select
                            className="glass-input px-4 py-3 rounded-lg"
                            value={newCompany.size_range}
                            onChange={(e) => setNewCompany(prev => ({ ...prev, size_range: e.target.value as any }))}
                          >
                            <option value="">Company Size</option>
                            <option value="1-10">1-10 employees</option>
                            <option value="11-50">11-50 employees</option>
                            <option value="51-200">51-200 employees</option>
                            <option value="201-1000">201-1000 employees</option>
                            <option value="1000+">1000+ employees</option>
                          </select>
                          <input
                            type="text"
                            placeholder="Industry"
                            className="glass-input px-4 py-3 rounded-lg"
                            value={newCompany.industry}
                            onChange={(e) => setNewCompany(prev => ({ ...prev, industry: e.target.value }))}
                          />
                        </div>
                        <input
                          type="text"
                          placeholder="Headquarters"
                          className="glass-input w-full px-4 py-3 rounded-lg"
                          value={newCompany.headquarters}
                          onChange={(e) => setNewCompany(prev => ({ ...prev, headquarters: e.target.value }))}
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={createCompany}
                            disabled={!newCompany.name}
                            className="btn-3d text-white px-4 py-2 text-sm font-medium disabled:opacity-50"
                          >
                            Create Company
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowNewCompanyForm(false)}
                            className="btn-glass px-4 py-2 text-sm font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {!formData.company_id && (
                  <input
                    type="text"
                    name="company"
                    placeholder="Or enter company name manually"
                    className="glass-input form-glow block w-full px-4 py-4 rounded-xl text-slate-800 placeholder:text-slate-500 focus:outline-none transition-all duration-200"
                    value={formData.company}
                    onChange={handleInputChange}
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-slate-700 mb-2">
                  Location *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    required
                    className="glass-input form-glow block w-full pl-12 pr-4 py-4 rounded-xl text-slate-800 placeholder:text-slate-500 focus:outline-none transition-all duration-200"
                    placeholder="e.g. San Francisco, CA"
                    value={formData.location}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="remote_type" className="block text-sm font-medium text-slate-700 mb-2">
                  Work Style
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Users className="h-5 w-5 text-slate-400" />
                  </div>
                  <select
                    id="remote_type"
                    name="remote_type"
                    className="glass-input form-glow block w-full pl-12 pr-4 py-4 rounded-xl text-slate-800 focus:outline-none transition-all duration-200 appearance-none cursor-pointer"
                    value={formData.remote_type}
                    onChange={handleInputChange}
                  >
                    <option value="">Select work style</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="employment_type" className="block text-sm font-medium text-slate-700 mb-2">
                  Employment Type *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Clock className="h-5 w-5 text-slate-400" />
                  </div>
                  <select
                    id="employment_type"
                    name="employment_type"
                    required
                    className="glass-input form-glow block w-full pl-12 pr-4 py-4 rounded-xl text-slate-800 focus:outline-none transition-all duration-200 appearance-none cursor-pointer"
                    value={formData.employment_type}
                    onChange={handleInputChange}
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="experience_level" className="block text-sm font-medium text-slate-700 mb-2">
                  Experience Level
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Users className="h-5 w-5 text-slate-400" />
                  </div>
                  <select
                    id="experience_level"
                    name="experience_level"
                    className="glass-input form-glow block w-full pl-12 pr-4 py-4 rounded-xl text-slate-800 focus:outline-none transition-all duration-200 appearance-none cursor-pointer"
                    value={formData.experience_level}
                    onChange={handleInputChange}
                  >
                    <option value="">Select level</option>
                    <option value="Entry">Entry Level</option>
                    <option value="Mid">Mid Level</option>
                    <option value="Senior">Senior Level</option>
                    <option value="Lead">Lead Level</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="application_deadline" className="block text-sm font-medium text-slate-700 mb-2">
                  Application Deadline
                </label>
                <input
                  type="date"
                  id="application_deadline"
                  name="application_deadline"
                  className="glass-input form-glow block w-full px-4 py-4 rounded-xl text-slate-800 focus:outline-none transition-all duration-200"
                  value={formData.application_deadline}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
          
          {/* Salary Information */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">Compensation</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="salary_min" className="block text-sm font-medium text-slate-700 mb-2">
                  Minimum Salary
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="number"
                    id="salary_min"
                    name="salary_min"
                    className="glass-input form-glow block w-full pl-12 pr-4 py-4 rounded-xl text-slate-800 placeholder:text-slate-500 focus:outline-none transition-all duration-200"
                    placeholder="50000"
                    value={formData.salary_min}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="salary_max" className="block text-sm font-medium text-slate-700 mb-2">
                  Maximum Salary
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="number"
                    id="salary_max"
                    name="salary_max"
                    className="glass-input form-glow block w-full pl-12 pr-4 py-4 rounded-xl text-slate-800 placeholder:text-slate-500 focus:outline-none transition-all duration-200"
                    placeholder="80000"
                    value={formData.salary_max}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="salary_currency" className="block text-sm font-medium text-slate-700 mb-2">
                  Currency
                </label>
                <select
                  id="salary_currency"
                  name="salary_currency"
                  className="glass-input form-glow block w-full px-4 py-4 rounded-xl text-slate-800 focus:outline-none transition-all duration-200 appearance-none cursor-pointer"
                  value={formData.salary_currency}
                  onChange={handleInputChange}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD (C$)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Job Details */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">Job Details</h2>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
                Job Description *
              </label>
              <div className="relative">
                <div className="absolute top-4 left-4 pointer-events-none">
                  <FileText className="h-5 w-5 text-slate-400" />
                </div>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={6}
                  className="glass-input form-glow block w-full pl-12 pr-4 py-4 rounded-xl text-slate-800 placeholder:text-slate-500 focus:outline-none transition-all duration-200"
                  placeholder="Describe the role, responsibilities, and what you're looking for in a candidate..."
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Required Skills
              </label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Tag className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Add a skill (e.g. React, Python, etc.)"
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
                    Add
                  </button>
                </div>
                {formData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, index) => (
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
            
            {/* Requirements */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Requirements
              </label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <CheckCircle className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Add a requirement"
                      className="glass-input block w-full pl-12 pr-4 py-3 rounded-xl text-slate-800 placeholder:text-slate-500 focus:outline-none transition-all duration-200"
                      value={newRequirement}
                      onChange={(e) => setNewRequirement(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addRequirement}
                    className="btn-3d text-white px-4 py-3 font-medium"
                  >
                    Add
                  </button>
                </div>
                {formData.requirements.length > 0 && (
                  <div className="space-y-2">
                    {formData.requirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="flex-1 text-slate-700">{req}</span>
                        <button
                          type="button"
                          onClick={() => removeRequirement(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Benefits */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Benefits & Perks
              </label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Star className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Add a benefit (e.g. Health insurance, Remote work, etc.)"
                      className="glass-input block w-full pl-12 pr-4 py-3 rounded-xl text-slate-800 placeholder:text-slate-500 focus:outline-none transition-all duration-200"
                      value={newBenefit}
                      onChange={(e) => setNewBenefit(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addBenefit}
                    className="btn-3d text-white px-4 py-3 font-medium"
                  >
                    Add
                  </button>
                </div>
                {formData.benefits.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {formData.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <Star className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                        <span className="flex-1 text-slate-700">{benefit}</span>
                        <button
                          type="button"
                          onClick={() => removeBenefit(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="flex-1 btn-glass px-8 py-4 text-lg font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 btn-3d text-white px-8 py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Posting Job...' : 'Post Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useJobs } from '@/hooks/useJobs'
import { Search, MapPin, Building, Clock, Calendar, ArrowRight, Filter, Briefcase } from 'lucide-react'

function JobsContent() {
  const [searchTerm, setSearchTerm] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [jobTypeFilter, setJobTypeFilter] = useState('')
  
  const searchParams = useSearchParams()
  
  useEffect(() => {
    const company = searchParams.get('company')
    if (company) {
      setSearchTerm(company)
    }
  }, [searchParams])
  
  const { jobs, loading, error, totalCount } = useJobs({
    searchTerm,
    locationFilter,
    jobTypeFilter,
    limit: 50
  })

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="floating-card p-12">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-blue-600 mx-auto mb-6"></div>
            <p className="text-slate-600 text-lg">Loading amazing opportunities...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="floating-card p-12">
            <Briefcase className="h-16 w-16 text-red-400 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Error Loading Jobs</h1>
            <p className="text-slate-600 mb-8">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="btn-3d text-white px-8 py-3 text-lg font-semibold"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-16 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
          Discover Your Next <span className="text-gradient-animated">Opportunity</span>
        </h1>
        <p className="text-xl text-slate-600 mb-4">
          Find your perfect match from {totalCount} available positions
        </p>
        <div className="w-24 h-1 bg-gradient-primary mx-auto rounded-full"></div>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-12">
        <div className="floating-card p-8">
          <div className="flex items-center gap-3 mb-6">
            <Filter className="h-6 w-6 text-gradient" />
            <h2 className="text-2xl font-bold text-slate-900">Filter & Search</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search jobs, companies..."
                className="glass-input form-glow block w-full pl-12 pr-4 py-4 rounded-xl text-slate-800 placeholder:text-slate-500 focus:outline-none transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Filter by location..."
                className="glass-input form-glow block w-full pl-12 pr-4 py-4 rounded-xl text-slate-800 placeholder:text-slate-500 focus:outline-none transition-all duration-200"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Clock className="h-5 w-5 text-slate-400" />
              </div>
              <select
                className="glass-input form-glow block w-full pl-12 pr-4 py-4 rounded-xl text-slate-800 focus:outline-none transition-all duration-200 appearance-none cursor-pointer"
                value={jobTypeFilter}
                onChange={(e) => setJobTypeFilter(e.target.value)}
              >
                <option value="" className="bg-white text-slate-800">All job types</option>
                <option value="Full-Time" className="bg-white text-slate-800">Full-Time</option>
                <option value="Part-Time" className="bg-white text-slate-800">Part-Time</option>
                <option value="Contract" className="bg-white text-slate-800">Contract</option>
                <option value="Internship" className="bg-white text-slate-800">Internship</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-8">
        {jobs.length === 0 ? (
          <div className="floating-card text-center py-20">
            <Briefcase className="h-24 w-24 text-slate-300 mx-auto mb-8" />
            <h3 className="text-3xl font-bold text-slate-900 mb-4">No jobs found</h3>
            <p className="text-slate-600 text-lg mb-8">
              Try adjusting your search criteria or check back later for new opportunities.
            </p>
            <Link
              href="/"
              className="btn-3d text-white px-8 py-3 text-lg font-semibold inline-flex items-center space-x-2"
            >
              <ArrowRight className="h-5 w-5" />
              <span>Explore All Jobs</span>
            </Link>
          </div>
        ) : (
          jobs.map((job) => {
            const company = job.companies
            return (
              <Link key={job.id} href={`/jobs/${job.id}`}>
                <div className="job-card p-8 cursor-pointer group">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
                    <div className="flex-1">
                      <div className="flex items-start gap-6">
                        <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                          {company?.logo_url ? (
                            <img 
                              src={company.logo_url} 
                              alt={company.name || job.company}
                              className="w-12 h-12 rounded-xl object-cover"
                            />
                          ) : (
                            <Building className="h-8 w-8 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-gradient transition-all duration-300">
                            {job.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-6 text-slate-600 mb-6">
                            <div className="flex items-center gap-2 bg-white/50 px-3 py-1 rounded-lg">
                              <Building className="h-4 w-4" />
                              <span className="font-medium">{company?.name || job.company}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/50 px-3 py-1 rounded-lg">
                              <MapPin className="h-4 w-4" />
                              <span>{job.location}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/50 px-3 py-1 rounded-lg">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(job.created_at)}</span>
                            </div>
                            {job.remote_type && (
                              <div className="flex items-center gap-2 bg-white/50 px-3 py-1 rounded-lg">
                                <Clock className="h-4 w-4" />
                                <span>{job.remote_type}</span>
                              </div>
                            )}
                          </div>
                          <p className="text-slate-700 line-clamp-2 leading-relaxed text-lg">
                            {job.description.length > 200 
                              ? `${job.description.substring(0, 200)}...` 
                              : job.description}
                          </p>
                          
                          {/* Skills Preview */}
                          {job.skills && job.skills.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4">
                              {job.skills.slice(0, 4).map((skill, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 bg-gradient-primary/10 text-slate-700 rounded-lg text-sm font-medium"
                                >
                                  {skill}
                                </span>
                              ))}
                              {job.skills.length > 4 && (
                                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm">
                                  +{job.skills.length - 4} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-4">
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-6 py-3 rounded-xl text-sm font-semibold ${getJobTypeColor(job.employment_type || job.job_type)} shadow-lg`}>
                          {job.employment_type || job.job_type}
                        </span>
                        {job.experience_level && (
                          <span className="px-4 py-2 bg-gradient-accent/10 text-slate-700 rounded-lg text-sm font-medium">
                            {job.experience_level} Level
                          </span>
                        )}
                        {(job.salary_min || job.salary_max) && (
                          <span className="px-4 py-2 bg-gradient-success/10 text-green-700 rounded-lg text-sm font-medium">
                            {job.salary_min && job.salary_max 
                              ? `$${job.salary_min/1000}k - $${job.salary_max/1000}k`
                              : `$${(job.salary_min || job.salary_max)!/1000}k+`}
                          </span>
                        )}
                      </div>
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-gradient-primary group-hover:text-white transition-all duration-300">
                        <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })
        )}
      </div>

      {/* Pagination placeholder */}
      {jobs.length > 0 && (
        <div className="mt-16 text-center">
          <div className="floating-card p-6 inline-block">
            <p className="text-slate-600">
              Showing <span className="font-bold text-gradient">{jobs.length}</span> of{' '}
              <span className="font-bold text-gradient">{totalCount}</span> jobs
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function JobsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="floating-card p-12">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-blue-600 mx-auto mb-6"></div>
            <p className="text-slate-600 text-lg">Loading amazing opportunities...</p>
          </div>
        </div>
      </div>
    }>
      <JobsContent />
    </Suspense>
  )
}
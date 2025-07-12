'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useUserRole } from '@/hooks/useUserRole'
import { Company } from '@/types/database'
import { Building, MapPin, Globe, Users, Calendar, Plus, Search, AlertCircle } from 'lucide-react'

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

export default function CompaniesPage() {
  const [user, setUser] = useState<any>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()
  const supabase = createClient()
  const { isEmployer, loading: roleLoading } = useUserRole(user?.id)

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
      await loadCompanies()
      setLoading(false)
    }

    getUser()
  }, [])

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

  // Debounce search term to improve performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  
  const filteredCompanies = useMemo(() => {
    if (!debouncedSearchTerm) return companies
    
    return companies.filter(company =>
      company.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      (company.industry && company.industry.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
    )
  }, [companies, debouncedSearchTerm])

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="floating-card p-12">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-blue-600 mx-auto mb-6"></div>
            <p className="text-slate-600 text-lg">Loading companies...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Company <span className="text-gradient-animated">Directory</span>
            </h1>
            <p className="text-xl text-slate-600">
              Discover {companies.length} amazing companies hiring on Clareer
            </p>
          </div>
          
          {isEmployer && (
            <Link
              href="/profile" // Could be a dedicated company creation page
              className="btn-3d text-white px-6 py-3 text-lg font-semibold flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Add Company</span>
            </Link>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="floating-card p-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search companies by name or industry..."
              className="glass-input form-glow block w-full pl-12 pr-4 py-4 rounded-xl text-slate-800 placeholder:text-slate-500 focus:outline-none transition-all duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Companies Grid */}
      {filteredCompanies.length === 0 ? (
        <div className="floating-card text-center py-20">
          {companies.length === 0 ? (
            <>
              <Building className="h-24 w-24 text-slate-300 mx-auto mb-8" />
              <h3 className="text-3xl font-bold text-slate-900 mb-4">No Companies Yet</h3>
              <p className="text-slate-600 text-lg mb-8">
                Be the first to add your company to the directory.
              </p>
              {isEmployer && (
                <Link
                  href="/profile"
                  className="btn-3d text-white px-8 py-3 text-lg font-semibold inline-flex items-center space-x-2"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add Your Company</span>
                </Link>
              )}
              {!user && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl max-w-md mx-auto">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-blue-800 text-sm font-medium">
                        Want to add your company?
                      </p>
                      <p className="text-blue-700 text-sm">
                        <Link href="/auth/signup" className="underline">Sign up</Link> as an employer to get started.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <Search className="h-24 w-24 text-slate-300 mx-auto mb-8" />
              <h3 className="text-3xl font-bold text-slate-900 mb-4">No Results Found</h3>
              <p className="text-slate-600 text-lg">
                Try adjusting your search terms to find companies.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company) => (
            <div key={company.id} className="floating-card p-6 hover:scale-105 transition-transform duration-300">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-xl mx-auto mb-4">
                  {company.logo_url ? (
                    <img 
                      src={company.logo_url} 
                      alt={company.name}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                  ) : (
                    <Building className="h-8 w-8 text-white" />
                  )}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{company.name}</h3>
                {company.industry && (
                  <span className="px-3 py-1 bg-gradient-primary/10 text-slate-700 rounded-lg text-sm font-medium">
                    {company.industry}
                  </span>
                )}
              </div>

              {company.description && (
                <p className="text-slate-600 text-sm line-clamp-3 mb-4">
                  {company.description}
                </p>
              )}

              <div className="space-y-2 mb-6">
                {company.size_range && (
                  <div className="flex items-center gap-2 text-slate-600 text-sm">
                    <Users className="h-4 w-4" />
                    <span>{company.size_range} employees</span>
                  </div>
                )}
                {company.headquarters && (
                  <div className="flex items-center gap-2 text-slate-600 text-sm">
                    <MapPin className="h-4 w-4" />
                    <span>{company.headquarters}</span>
                  </div>
                )}
                {company.founded_year && (
                  <div className="flex items-center gap-2 text-slate-600 text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>Founded {company.founded_year}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Link
                  href={`/jobs?company=${encodeURIComponent(company.name)}`}
                  className="flex-1 btn-3d text-white px-4 py-2 text-sm font-semibold text-center"
                >
                  View Jobs
                </Link>
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-glass px-4 py-2 text-sm font-semibold flex items-center justify-center"
                  >
                    <Globe className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add company hint for non-employers */}
      {!isEmployer && user && companies.length > 0 && (
        <div className="mt-12 text-center">
          <div className="floating-card p-8 max-w-md mx-auto">
            <Building className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Is your company missing?</h3>
            <p className="text-slate-600 mb-4">
              Switch to an employer account to add your company to the directory.
            </p>
            <Link
              href="/profile?role=employer"
              className="btn-3d text-white px-6 py-2 text-sm font-semibold"
            >
              Become an Employer
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
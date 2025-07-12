'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { useUserRole } from '@/hooks/useUserRole'
import { LogOut, Plus, User as UserIcon, Briefcase, Heart, Settings } from 'lucide-react'

export function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAccountMenu, setShowAccountMenu] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { isEmployer, isJobSeeker } = useUserRole(user?.id)

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav className="nav-glass sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <img 
                src="/images/clareer-icon.svg" 
                alt="Clareer" 
                className="h-8 w-8" 
              />
              <span className="text-xl font-bold text-gradient">Clareer</span>
            </Link>
          </div>

          <div className="flex items-center space-x-6">
            <Link
              href="/jobs"
              className="text-slate-700 hover:text-slate-900 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-slate-100/50"
            >
              Browse Jobs
            </Link>
            <Link
              href="/companies"
              className="text-slate-700 hover:text-slate-900 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-slate-100/50"
            >
              Companies
            </Link>

            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center space-x-4">
                    {/* Show saved jobs for job seekers */}
                    {isJobSeeker && (
                      <Link
                        href="/saved-jobs"
                        className="text-slate-700 hover:text-slate-900 px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-all duration-200 hover:bg-slate-100/50"
                      >
                        <Heart className="h-4 w-4" />
                        <span>Saved</span>
                      </Link>
                    )}
                    
                    {/* Show post job only for employers */}
                    {isEmployer ? (
                      <Link
                        href="/post-job"
                        className="btn-3d text-white px-6 py-2 text-sm font-medium flex items-center space-x-2"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Post Job</span>
                      </Link>
                    ) : (
                      <Link
                        href="/profile?role=employer"
                        className="text-slate-700 hover:text-slate-900 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-slate-100/50"
                      >
                        Become Employer
                      </Link>
                    )}
                    
                    {/* Account dropdown with click functionality */}
                    <div className="relative">
                      <button 
                        onClick={() => setShowAccountMenu(!showAccountMenu)}
                        className="text-slate-700 hover:text-slate-900 px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-all duration-200 hover:bg-slate-100/50"
                      >
                        <UserIcon className="h-4 w-4 flex-shrink-0" />
                        <span className="whitespace-nowrap">Account</span>
                      </button>
                      
                      {/* Click-based dropdown menu */}
                      {showAccountMenu && (
                        <>
                          {/* Overlay to close dropdown when clicking outside */}
                          <div 
                            className="fixed inset-0 z-40" 
                            onClick={() => setShowAccountMenu(false)}
                          />
                          
                          {/* Dropdown menu */}
                          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 z-50">
                            <div className="py-2">
                              <Link
                                href="/dashboard"
                                className="block px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-150"
                                onClick={() => setShowAccountMenu(false)}
                              >
                                <div className="flex items-center space-x-3">
                                  <Briefcase className="h-4 w-4 flex-shrink-0" />
                                  <span>Dashboard</span>
                                </div>
                              </Link>
                              <Link
                                href="/profile"
                                className="block px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-150"
                                onClick={() => setShowAccountMenu(false)}
                              >
                                <div className="flex items-center space-x-3">
                                  <Settings className="h-4 w-4 flex-shrink-0" />
                                  <span>Profile Settings</span>
                                </div>
                              </Link>
                              <hr className="my-1 border-slate-200" />
                              <button
                                onClick={() => {
                                  setShowAccountMenu(false)
                                  handleSignOut()
                                }}
                                className="w-full text-left block px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-150"
                              >
                                <div className="flex items-center space-x-3">
                                  <LogOut className="h-4 w-4 flex-shrink-0" />
                                  <span>Sign Out</span>
                                </div>
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <Link
                      href="/auth/login"
                      className="btn-liquid text-slate-700 hover:text-slate-900 px-4 py-2 text-sm font-medium"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="btn-3d text-white px-6 py-2 text-sm font-medium"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
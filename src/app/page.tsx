'use client'

import Link from 'next/link'
import { ArrowRight, Briefcase, Users, Search, Sparkles, Zap, Target } from 'lucide-react'

export default function Home() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-24">
        <div className="text-center mb-20">
          <div className="relative">
            <h1 className="text-6xl md:text-8xl font-bold text-slate-900 mb-8 leading-tight">
              Find Your Next
              <br />
              <span className="text-gradient-animated">Dream Career</span>
            </h1>
            {/* Floating orbs - optimized */}
            <div className="absolute -top-8 -left-8 w-24 h-24 bg-gradient-primary rounded-full blur-xl opacity-10"></div>
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-gradient-accent rounded-full blur-xl opacity-10"></div>
          </div>
          
          <p className="text-xl text-slate-700 mb-12 max-w-3xl mx-auto leading-relaxed">
            Connect with innovative companies and discover opportunities that match your skills and aspirations.
            Start your career journey in the modern digital landscape.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              href="/jobs"
              className="btn-3d text-white px-12 py-5 text-lg font-semibold flex items-center justify-center space-x-3 min-w-[220px] group"
            >
              <Search className="h-6 w-6 group-hover:scale-110 transition-transform" />
              <span>Browse Jobs</span>
              <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/auth/signup"
              className="btn-secondary text-white px-12 py-5 text-lg font-semibold flex items-center justify-center space-x-3 min-w-[220px] group"
            >
              <Users className="h-6 w-6 group-hover:scale-110 transition-transform" />
              <span>Post a Job</span>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mt-32">
          <div className="floating-card p-10 text-center group">
            <div className="relative mb-8">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-primary flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform duration-300">
                <Briefcase className="h-12 w-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-accent rounded-full opacity-40 animate-gentle-pulse"></div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Easy Job Posting</h3>
            <p className="text-slate-600 leading-relaxed text-lg">
              Post your job openings quickly with our intuitive interface and reach qualified candidates in minutes.
            </p>
          </div>

          <div className="floating-card p-10 text-center group">
            <div className="relative mb-8">
              <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-accent flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all duration-500">
                <Zap className="h-12 w-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-secondary rounded-full opacity-40 animate-gentle-pulse"></div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Smart Matching</h3>
            <p className="text-slate-600 leading-relaxed text-lg">
              Find exactly what you&apos;re looking for with our AI-powered matching algorithms and intelligent filtering.
            </p>
          </div>

          <div className="floating-card p-10 text-center group">
            <div className="relative mb-8">
              <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-secondary flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all duration-500">
                <Target className="h-12 w-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-primary rounded-full opacity-40 animate-gentle-pulse"></div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Quality Connections</h3>
            <p className="text-slate-600 leading-relaxed text-lg">
              Connect with the right opportunities and candidates through our curated professional network.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-32">
          <div className="floating-card p-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Trusted by <span className="text-gradient">Thousands</span>
              </h2>
              <p className="text-slate-600 text-lg">Join the growing community of professionals and companies</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
              <div className="group">
                <div className="text-4xl font-bold text-gradient mb-3 group-hover:scale-110 transition-transform">1000+</div>
                <div className="text-slate-600 font-medium">Active Jobs</div>
              </div>
              <div className="group">
                <div className="text-4xl font-bold text-gradient-accent mb-3 group-hover:scale-110 transition-transform">500+</div>
                <div className="text-slate-600 font-medium">Companies</div>
              </div>
              <div className="group">
                <div className="text-4xl font-bold text-gradient-secondary mb-3 group-hover:scale-110 transition-transform">10k+</div>
                <div className="text-slate-600 font-medium">Job Seekers</div>
              </div>
              <div className="group">
                <div className="text-4xl font-bold text-gradient-success mb-3 group-hover:scale-110 transition-transform">95%</div>
                <div className="text-slate-600 font-medium">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
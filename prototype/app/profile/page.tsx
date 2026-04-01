'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { User, ArrowLeft, LogOut } from 'lucide-react'
import { getUserProfile } from '@/lib/user-profile'
import { useAuth } from '@/lib/hooks/useAuth'
import ProductivityTracker from '@/components/ProductivityTracker'
import NextBestActionSticky from '@/components/NextBestActionSticky'
import { useExperiment } from '@/lib/hooks/useExperiment'

export default function ProfilePage() {
  const [profile, setProfile] = useState<ReturnType<typeof getUserProfile> | null>(null)
  const { user, isAuthenticated, signOut } = useAuth()
  const roadmapExperiment = useExperiment('roadmap_today_view_v2')

  useEffect(() => {
    if (roadmapExperiment.isReady) {
      roadmapExperiment.track('profile_viewed', { page: 'profile' })
    }
  }, [roadmapExperiment.isReady, roadmapExperiment.variant])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setProfile(getUserProfile())
    }
  }, [])

  return (
    <div className="min-h-screen bg-[rgb(var(--sky-light))] text-[rgb(var(--text-dark))]">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-[rgb(var(--navy))] transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
          {isAuthenticated && (
            <button
              onClick={() => signOut()}
              className="inline-flex items-center gap-2 text-slate-600 hover:text-rose-600 transition-colors text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              Log out
            </button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {roadmapExperiment.isTreatment && (
          <NextBestActionSticky
            title="Resume your current roadmap phase"
            description="Pick up where you left off in Today View and complete one task."
            ctaLabel="Open roadmap"
            ctaHref="/customized-journey?view=today"
            secondaryLabel="Open inbox"
            secondaryHref="/inbox"
          />
        )}
        <div className="flex items-center gap-3">
          <User className="w-10 h-10 text-[rgb(var(--navy))]" />
          <h1 className="text-2xl font-bold text-[rgb(var(--navy))]">Profile & Progress</h1>
        </div>

        {isAuthenticated && user && (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 space-y-3">
            <h2 className="text-lg font-semibold text-[rgb(var(--navy))]">Account</h2>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Name</span>
              <span className="font-medium text-slate-800">
                {user.firstName || user.lastName
                  ? [user.firstName, user.lastName].filter(Boolean).join(' ')
                  : user.username}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Email</span>
              <span className="font-medium text-slate-800">{user.email}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Username</span>
              <span className="font-medium text-slate-800">{user.username}</span>
            </div>
          </div>
        )}

        <section>
          <h2 className="text-lg font-semibold mb-3 text-[rgb(var(--navy))]">Productivity Tracker</h2>
          <ProductivityTracker />
        </section>

        {profile ? (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-semibold text-[rgb(var(--navy))]">Journey profile</h2>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Buyer type</span>
              <span className="font-medium text-slate-800">{profile.buyerType}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Confidence score</span>
              <span className="font-medium text-slate-800">{profile.confidenceScore} / 100</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Risk tolerance</span>
              <span className="font-medium text-slate-800">{profile.riskTolerance}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Time horizon</span>
              <span className="font-medium text-slate-800">{profile.timeHorizon}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Detail preference</span>
              <span className="font-medium text-slate-800">{profile.detailPreference}</span>
            </div>
          </div>
        ) : (
          <p className="text-slate-500">Loading journey profile...</p>
        )}

        <Link
          href="/customized-journey"
          className="inline-flex items-center gap-2 text-[rgb(var(--coral))] hover:underline text-sm font-semibold"
        >
          View your journey →
        </Link>
      </main>
    </div>
  )
}

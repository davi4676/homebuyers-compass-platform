'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Bell, BookOpen } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import UserJourneyTracker from '@/components/analytics/UserJourneyTracker'
import { useExperiment } from '@/lib/hooks/useExperiment'
import NQGuidedRoadmap from '@/components/NQGuidedRoadmap'

export default function CustomizedJourneyPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const roadmapExperiment = useExperiment('roadmap_today_view_v2')
  const [showReturnBanner, setShowReturnBanner] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const key = 'last_journey_visit'
    const lastStr = localStorage.getItem(key)
    const sixHours = 6 * 60 * 60 * 1000
    if (lastStr) {
      const last = parseInt(lastStr, 10)
      if (Date.now() - last > sixHours) setShowReturnBanner(true)
    }
    localStorage.setItem(key, String(Date.now()))
  }, [])

  useEffect(() => {
    if (!roadmapExperiment.isReady) return
    roadmapExperiment.track('journey_viewed', { page: 'customized-journey' })
    if (typeof window === 'undefined') return
    const requestedView = searchParams.get('view')
    if (requestedView === 'today') {
      localStorage.setItem('journeyMode', 'today')
      return
    }
    if (!localStorage.getItem('journeyMode') && roadmapExperiment.isTreatment) {
      localStorage.setItem('journeyMode', 'today')
    }
  }, [roadmapExperiment.isReady, roadmapExperiment.isTreatment, roadmapExperiment.variant, searchParams])

  const goToDownPaymentEstimate = () => {
    if (typeof window === 'undefined') {
      router.push('/results')
      return
    }
    const hasQuizData = Boolean(localStorage.getItem('quizData'))
    router.push(hasQuizData ? '/results' : '/quiz')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e8eef9] via-[#f2f6fc] to-[#f8fafc] font-sans text-base antialiased leading-relaxed text-slate-800 md:text-lg">
      <UserJourneyTracker />

      <div className="mx-auto max-w-6xl px-4 pt-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
          <div className="relative h-28 overflow-hidden sm:h-32">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage:
                  'linear-gradient(135deg, rgba(30,58,95,0.92) 0%, rgba(30,64,175,0.85) 50%, rgba(59,130,246,0.75) 100%), url(https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1400&q=80)',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-center gap-2 px-6 sm:px-10">
              <p className="text-2xl font-bold text-white drop-shadow-sm sm:text-3xl">
                {user?.firstName ? `${user.firstName}'s Homebuying Roadmap` : 'Your Homebuying Roadmap'}
              </p>
              <p className="text-base font-medium text-white/90">
                Seven calm tabs — overview, your phase, sketch, learn, library, inbox, and upgrades.
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
        <div className="min-w-0 flex-1">
          {showReturnBanner ? (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-sky-200/60 bg-sky-50/80 px-4 py-3"
            >
              <p className="text-sm font-medium text-slate-700 md:text-base">
                Welcome back — pick up where you left off.
              </p>
              <button
                type="button"
                onClick={() => setShowReturnBanner(false)}
                className="shrink-0 text-sm font-medium text-sky-600 hover:text-sky-700 md:text-base"
                aria-label="Dismiss"
              >
                Dismiss
              </button>
            </motion.div>
          ) : null}

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-10 text-center md:mb-14"
          >
            <h1 className="mb-3 text-3xl font-bold tracking-tight text-[rgb(var(--navy))] sm:text-4xl md:text-[2.75rem] md:leading-tight">
              Your customized NestQuest journey
            </h1>
            <p className="mx-auto max-w-2xl text-sm text-slate-600 md:text-lg">
              Use the tabs above to move between your snapshot, phase work, budget sketch, learning, library, inbox, and
              upgrade options — keyboard-friendly and saved between visits.
            </p>
          </motion.div>

          <Suspense
            fallback={
              <div
                className="min-h-[20rem] rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-50 to-white"
                aria-hidden
              />
            }
          >
            <NQGuidedRoadmap userFirstName={user?.firstName} onGoToResults={goToDownPaymentEstimate} />
          </Suspense>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="relative mt-14 overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white via-slate-50/80 to-sky-50/40 p-6 shadow-lg shadow-slate-200/40 ring-1 ring-white sm:mt-16 sm:p-8"
          >
            <div
              className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-sky-200/20 blur-2xl"
              aria-hidden
            />
            <p className="relative mb-4 text-center text-sm font-medium text-slate-600 md:text-base">
              Prefer the full site pages? They&apos;re still here — tabs above are the new home base.
            </p>
            <div className="relative flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <Link
                href="/customized-journey?tab=library"
                className="group inline-flex items-center gap-2.5 rounded-xl border-2 border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-400 hover:bg-sky-50 hover:shadow-md md:text-base"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-100 text-sky-700 transition-colors group-hover:bg-sky-200">
                  <BookOpen className="h-4 w-4" strokeWidth={2} />
                </span>
                Library tab
              </Link>
              <Link
                href="/customized-journey?tab=inbox"
                className="group inline-flex items-center gap-2.5 rounded-xl border-2 border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-md md:text-base"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 transition-colors group-hover:bg-indigo-200">
                  <Bell className="h-4 w-4" strokeWidth={2} />
                </span>
                Inbox tab
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

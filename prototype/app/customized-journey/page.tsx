'use client'

import { useState, useEffect, Suspense, useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Bell, BookOpen } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import UserJourneyTracker from '@/components/analytics/UserJourneyTracker'
import { useExperiment } from '@/lib/hooks/useExperiment'
import NQGuidedRoadmap from '@/components/NQGuidedRoadmap'
import PlainEnglishText from '@/components/PlainEnglishText'
import { PLAIN_ENGLISH_LS_KEY, usePlainEnglish } from '@/lib/hooks/usePlainEnglish'
import { parseJourneyTabParam, type JourneyTab } from '@/lib/journey-nav-tabs'

export default function CustomizedJourneyPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const plainEnglish = usePlainEnglish()
  const { user } = useAuth()
  const roadmapExperiment = useExperiment('roadmap_today_view_v2')
  const [showReturnBanner, setShowReturnBanner] = useState(false)
  /** Same source as TopNav tab highlight — keeps roadmap panels in sync with `?tab=` (avoids nested useSearchParams drift). */
  const journeySearchKey = searchParams.toString()
  const activeJourneyTab: JourneyTab = useMemo(
    () => parseJourneyTabParam(new URLSearchParams(journeySearchKey).get('tab')),
    [journeySearchKey]
  )

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
    <div className="app-page-shell text-base leading-relaxed md:text-lg">
      <UserJourneyTracker />

      <div className="mx-auto max-w-6xl px-4 pt-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-millennial-border bg-white shadow-xl">
          <div className="relative flex min-h-[8.5rem] items-center overflow-hidden sm:min-h-[9.5rem]">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage:
                  'linear-gradient(to top, rgba(250,250,245,0.96) 0%, rgba(250,250,245,0.4) 50%, transparent 100%), url(https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80)',
              }}
            />
            <div className="relative z-10 flex w-full flex-col justify-center gap-1.5 px-6 py-5 sm:gap-2 sm:px-10">
              <PlainEnglishText
                as="p"
                className="font-display text-2xl font-extrabold text-millennial-text sm:text-3xl"
                text={user?.firstName ? `${user.firstName}'s home buying Roadmap` : 'Your home buying Roadmap'}
              />
              <PlainEnglishText
                as="p"
                className="text-base font-medium text-millennial-text-muted sm:text-lg"
                text="Seven calm tabs — overview, your phase, sketch, learn, library, inbox, and upgrades."
              />
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
        <div className="min-w-0 flex-1">
          <div className="mb-6 flex flex-wrap items-center justify-end gap-3 rounded-xl border border-millennial-border bg-white/95 px-4 py-3 shadow-sm">
            <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-millennial-text">
              <span>Plain English mode</span>
              <input
                type="checkbox"
                className="h-5 w-5 accent-[#0d9488]"
                checked={plainEnglish}
                onChange={(e) => {
                  const on = e.target.checked
                  try {
                    localStorage.setItem(PLAIN_ENGLISH_LS_KEY, on ? '1' : '0')
                    window.dispatchEvent(new Event('nq-plain-english-changed'))
                  } catch {
                    /* ignore */
                  }
                }}
                aria-label="Toggle plain English mode"
              />
            </label>
          </div>

          {showReturnBanner ? (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-millennial-primary-light bg-millennial-primary-light/30 px-4 py-3"
            >
              <p className="text-sm font-medium text-millennial-text md:text-base">
                Welcome back — pick up where you left off.
              </p>
              <button
                type="button"
                onClick={() => setShowReturnBanner(false)}
                className="shrink-0 text-sm font-semibold text-millennial-cta-primary hover:text-millennial-cta-hover md:text-base"
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
            <PlainEnglishText
              as="h1"
              className="mb-3 font-display text-3xl font-extrabold tracking-tight text-millennial-text sm:text-4xl md:text-[2.75rem] md:leading-tight"
              text="Your customized NestQuest journey"
            />
            <PlainEnglishText
              as="p"
              className="mx-auto max-w-2xl text-sm text-millennial-text-muted md:text-lg"
              text="Use the tabs above to move between your snapshot, phase work, budget sketch, learning, library, inbox, and upgrade options — keyboard-friendly and saved between visits."
            />
          </motion.div>

          <Suspense
            fallback={
              <div
                className="min-h-[24rem] space-y-4 rounded-3xl border border-millennial-border/80 bg-gradient-to-br from-millennial-primary-light/20 to-white p-6 md:p-8"
                aria-busy
                aria-label="Loading roadmap"
              >
                <div className="mb-2 h-10 max-w-md animate-pulse rounded-xl bg-brand-mist dark:bg-gray-800" />
                <div className="h-6 w-2/3 max-w-lg animate-pulse rounded-lg bg-brand-mist dark:bg-gray-800" />
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="h-40 animate-pulse rounded-xl bg-brand-mist dark:bg-gray-800" />
                  <div className="h-40 animate-pulse rounded-xl bg-brand-mist dark:bg-gray-800" />
                </div>
                <div className="h-32 animate-pulse rounded-xl bg-brand-mist/80 dark:bg-gray-800" />
              </div>
            }
          >
            <NQGuidedRoadmap
              activeTab={activeJourneyTab}
              userFirstName={user?.firstName}
              onGoToResults={goToDownPaymentEstimate}
            />
          </Suspense>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="relative mt-14 overflow-hidden rounded-2xl border border-millennial-border bg-gradient-to-br from-white via-millennial-primary-light/15 to-white p-6 shadow-lg shadow-teal-900/5 ring-1 ring-white sm:mt-16 sm:p-8"
          >
            <div
              className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-millennial-primary-light/40 blur-2xl"
              aria-hidden
            />
            <p className="relative mb-4 text-center text-sm font-medium text-millennial-text-muted md:text-base">
              Prefer the full site pages? They&apos;re still here — tabs above are the new home base.
            </p>
            <div className="relative flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <Link
                href="/customized-journey?tab=library"
                className="group inline-flex items-center gap-2.5 rounded-xl border-2 border-millennial-border bg-white px-5 py-3 text-sm font-semibold text-millennial-text shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-millennial-cta-primary hover:bg-millennial-primary-light/25 hover:shadow-md md:text-base"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-millennial-primary-light/70 text-millennial-cta-primary transition-colors group-hover:bg-millennial-primary-light">
                  <BookOpen className="h-4 w-4" strokeWidth={2} />
                </span>
                Library tab
              </Link>
              <Link
                href="/customized-journey?tab=inbox"
                className="group inline-flex items-center gap-2.5 rounded-xl border-2 border-millennial-border bg-white px-5 py-3 text-sm font-semibold text-millennial-text shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-millennial-cta-secondary hover:bg-brand-mist/80 hover:shadow-md md:text-base"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-mist text-brand-forest transition-colors group-hover:bg-brand-mist">
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

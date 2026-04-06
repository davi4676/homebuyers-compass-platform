'use client'

import { useState, useEffect, Suspense, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Bell, BookOpen, X } from 'lucide-react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import UserJourneyTracker from '@/components/analytics/UserJourneyTracker'
import { useExperiment } from '@/lib/hooks/useExperiment'
import NQGuidedRoadmap from '@/components/NQGuidedRoadmap'
import PlainEnglishText from '@/components/PlainEnglishText'
import {
  PLAIN_ENGLISH_LS_KEY,
  PLAIN_ENGLISH_JOURNEY_CALLOUT_DISMISSED_KEY,
  usePlainEnglish,
} from '@/lib/hooks/usePlainEnglish'
import {
  parseJourneyTabParam,
  type JourneyTab,
  journeyTabHrefPreservingSearch,
  JOURNEY_PAGE_PATH,
} from '@/lib/journey-nav-tabs'
import { getStoredQuizTransactionMeta } from '@/lib/user-snapshot'
import {
  getActiveOnboardingNotification,
  dismissOnboardingNotification,
  type OnboardingNotificationDef,
} from '@/lib/onboarding-notifications'
import { REFERRED_BY_LS_KEY, getOrCreateReferralCode } from '@/lib/referral-program'
import { referralSlugFromUser } from '@/lib/referral-slug'
import { getTrialEndingSoonBanner } from '@/lib/user-tracking'
import JourneyTodayHero from '@/components/journey/JourneyTodayHero'
import SessionWinsBanner from '@/components/journey/SessionWinsBanner'
import { track } from '@/lib/analytics'

const CERT_PURCHASE_TRACKED_SS = 'nq_certificate_purchased_tracked_session'
const JOURNEY_ENTERED_TRACKED_SS = 'nq_journey_entered_posthog'

export default function CustomizedJourneyPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const plainEnglish = usePlainEnglish()
  const { user } = useAuth()
  const roadmapExperiment = useExperiment('roadmap_today_view_v2')
  const [showReturnBanner, setShowReturnBanner] = useState(false)
  const [showPlainEnglishCallout, setShowPlainEnglishCallout] = useState(false)
  const [trialEndingBanner, setTrialEndingBanner] = useState<{ days: number } | null>(null)
  const [onboardingNotify, setOnboardingNotify] = useState<OnboardingNotificationDef | null>(null)
  const [referralModalKick, setReferralModalKick] = useState(0)
  const [showRefLandingBanner, setShowRefLandingBanner] = useState(false)

  const plainEnglishTooltip =
    'Plain English Mode replaces financial jargon with simple explanations. Perfect if this is your first time buying a home.'

  const dismissPlainEnglishCallout = useCallback(() => {
    try {
      localStorage.setItem(PLAIN_ENGLISH_JOURNEY_CALLOUT_DISMISSED_KEY, '1')
    } catch {
      /* ignore */
    }
    setShowPlainEnglishCallout(false)
  }, [])

  const turnOnPlainEnglish = useCallback(() => {
    try {
      localStorage.setItem(PLAIN_ENGLISH_LS_KEY, '1')
      window.dispatchEvent(new Event('nq-plain-english-changed'))
      localStorage.setItem(PLAIN_ENGLISH_JOURNEY_CALLOUT_DISMISSED_KEY, '1')
    } catch {
      /* ignore */
    }
    setShowPlainEnglishCallout(false)
  }, [])
  /** Same source as TopNav tab highlight — keeps roadmap panels in sync with `?tab=` (avoids nested useSearchParams drift). */
  const journeySearchKey = searchParams.toString()
  const activeJourneyTab: JourneyTab = useMemo(
    () => parseJourneyTabParam(new URLSearchParams(journeySearchKey).get('tab')),
    [journeySearchKey]
  )
  const overviewMobileCompact = activeJourneyTab === 'overview'

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      if (sessionStorage.getItem(JOURNEY_ENTERED_TRACKED_SS) === '1') return
      sessionStorage.setItem(JOURNEY_ENTERED_TRACKED_SS, '1')
    } catch {
      /* ignore */
    }
    const meta = getStoredQuizTransactionMeta()
    track.journeyEntered(meta.icpType ?? meta.transactionType ?? 'first-time')
  }, [])

  useEffect(() => {
    if (searchParams.get('nq_certificate') !== 'success') return
    if (typeof window === 'undefined') return
    if (sessionStorage.getItem(CERT_PURCHASE_TRACKED_SS) === '1') return
    sessionStorage.setItem(CERT_PURCHASE_TRACKED_SS, '1')
    track.certificatePurchased()
    const params = new URLSearchParams(journeySearchKey)
    params.delete('nq_certificate')
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }, [searchParams, journeySearchKey, pathname, router])

  useEffect(() => {
    if (activeJourneyTab !== 'firstgen') return
    if (typeof window === 'undefined') return
    if (getStoredQuizTransactionMeta().icpType === 'first-gen') return
    const base =
      pathname === JOURNEY_PAGE_PATH || (pathname?.startsWith(`${JOURNEY_PAGE_PATH}/`) ?? false)
        ? JOURNEY_PAGE_PATH
        : pathname || JOURNEY_PAGE_PATH
    router.replace(journeyTabHrefPreservingSearch(base, journeySearchKey, 'overview'))
  }, [activeJourneyTab, journeySearchKey, pathname, router])

  const referralFromAccount = useMemo(
    () => referralSlugFromUser(user ?? null),
    [user]
  )
  const [referralSlug, setReferralSlug] = useState(referralFromAccount)
  useEffect(() => {
    setReferralSlug(referralFromAccount)
  }, [referralFromAccount])
  useEffect(() => {
    if (referralFromAccount && referralFromAccount !== 'yourname') return
    setReferralSlug(getOrCreateReferralCode(user?.email ?? null))
  }, [referralFromAccount, user?.email])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const refCode = searchParams.get('ref')?.trim()
    if (refCode) {
      try {
        localStorage.setItem(REFERRED_BY_LS_KEY, refCode.slice(0, 64))
      } catch {
        /* ignore */
      }
      setShowRefLandingBanner(true)
    }
  }, [searchParams])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const tick = () => setOnboardingNotify(getActiveOnboardingNotification())
    tick()
    const id = window.setInterval(tick, 60_000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const refreshOnboarding = () => setOnboardingNotify(getActiveOnboardingNotification())
    window.addEventListener('storage', refreshOnboarding)
    return () => window.removeEventListener('storage', refreshOnboarding)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      if (localStorage.getItem(PLAIN_ENGLISH_JOURNEY_CALLOUT_DISMISSED_KEY) === '1') return
      if (localStorage.getItem(PLAIN_ENGLISH_LS_KEY) === '1') return
      setShowPlainEnglishCallout(true)
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const refreshTrialBanner = () => setTrialEndingBanner(getTrialEndingSoonBanner())
    refreshTrialBanner()
    window.addEventListener('tierChanged', refreshTrialBanner)
    window.addEventListener('storage', refreshTrialBanner)
    const interval = window.setInterval(refreshTrialBanner, 60_000)
    return () => {
      window.removeEventListener('tierChanged', refreshTrialBanner)
      window.removeEventListener('storage', refreshTrialBanner)
      window.clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (!plainEnglish) return
    setShowPlainEnglishCallout((visible) => {
      if (!visible) return visible
      try {
        localStorage.setItem(PLAIN_ENGLISH_JOURNEY_CALLOUT_DISMISSED_KEY, '1')
      } catch {
        /* ignore */
      }
      return false
    })
  }, [plainEnglish])

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
    <div className="app-page-shell ml-0 pb-20 text-base leading-relaxed sm:ml-52 sm:pb-0 md:text-lg">
      {/* Bottom (mobile) + left sidebar (desktop) nav: <JourneyNav /> in TopNav */}
      <UserJourneyTracker />

      <div
        className={`mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 ${overviewMobileCompact ? 'pt-2 max-md:pt-2 md:pt-4' : 'pt-4'}`}
      >
        <div
          className={`relative overflow-hidden rounded-2xl border border-millennial-border bg-white shadow-xl ${
            overviewMobileCompact ? 'max-md:shadow-md' : ''
          }`}
        >
          <div
            className={`relative flex items-center overflow-hidden ${
              overviewMobileCompact
                ? 'min-h-0 max-md:min-h-[4.25rem] sm:min-h-[9.5rem]'
                : 'min-h-[8.5rem] sm:min-h-[9.5rem]'
            }`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage:
                  'linear-gradient(to top, rgba(250,250,245,0.96) 0%, rgba(250,250,245,0.4) 50%, transparent 100%), url(https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80)',
              }}
            />
            <div
              className={`relative z-10 flex w-full flex-col justify-center sm:gap-2 sm:px-10 ${
                overviewMobileCompact ? 'gap-0 px-4 py-3 sm:py-5' : 'gap-1.5 px-6 py-5'
              }`}
            >
              <PlainEnglishText
                as="p"
                className={`font-display font-extrabold text-millennial-text sm:text-3xl ${
                  overviewMobileCompact ? 'text-xl sm:text-3xl' : 'text-2xl'
                }`}
                text={user?.firstName ? `${user.firstName}'s home buying Roadmap` : 'Your home buying Roadmap'}
              />
              <PlainEnglishText
                as="p"
                className={`text-base font-medium text-millennial-text-muted sm:text-lg ${
                  overviewMobileCompact ? 'max-md:hidden' : ''
                }`}
                text="Start with Today below — then use the other tabs anytime for learn, library, programs, inbox, and upgrades."
              />
            </div>
          </div>
        </div>

        {trialEndingBanner ? (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex flex-col gap-3 rounded-xl border border-amber-300/90 bg-amber-50 px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            role="status"
          >
            <p className="text-sm font-medium text-amber-950 sm:text-base">
              <span aria-hidden>⏰</span> Your free trial ends in {trialEndingBanner.days}{' '}
              day{trialEndingBanner.days === 1 ? '' : 's'}. Upgrade to keep your progress and access.
            </p>
            <Link
              href="/payment?tier=momentum&cycle=monthly"
              className="inline-flex shrink-0 items-center justify-center rounded-lg bg-teal-700 px-4 py-2 text-sm font-bold text-white hover:bg-teal-800"
            >
              Keep My Plan →
            </Link>
          </motion.div>
        ) : null}

        {showRefLandingBanner ? (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-950 shadow-sm"
            role="status"
          >
            You were referred by a friend — sign up today and get $50 off your first plan.
            <button
              type="button"
              onClick={() => setShowRefLandingBanner(false)}
              className="ml-2 font-semibold text-teal-800 underline"
            >
              Dismiss
            </button>
          </motion.div>
        ) : null}

        {onboardingNotify ? (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-md"
            role="region"
            aria-label="Journey notification"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-bold text-slate-900">{onboardingNotify.title}</p>
                <p className="mt-1 text-sm text-slate-600">{onboardingNotify.body}</p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const cta = onboardingNotify.cta
                    if ('action' in cta && cta.action === 'referral') {
                      setReferralModalKick((k) => k + 1)
                    } else if ('href' in cta) {
                      router.push(cta.href)
                    } else {
                      router.push(
                        journeyTabHrefPreservingSearch(JOURNEY_PAGE_PATH, journeySearchKey, cta.tab)
                      )
                    }
                  }}
                  className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
                >
                  {onboardingNotify.cta.label}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    dismissOnboardingNotification(onboardingNotify.id)
                    setOnboardingNotify(getActiveOnboardingNotification())
                  }}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </div>

      <main
        className={`mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 ${
          overviewMobileCompact ? 'py-4 max-md:py-3 md:py-14' : 'py-10 md:py-14'
        }`}
      >
        <div className="min-w-0 flex-1">
          <div className={overviewMobileCompact ? 'max-md:hidden' : undefined}>
            <SessionWinsBanner />
            <JourneyTodayHero searchKey={journeySearchKey} />
          </div>
          <div className="mb-6 space-y-3">
            {showPlainEnglishCallout ? (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-3 rounded-xl border border-amber-200/90 bg-gradient-to-r from-amber-50 to-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                role="region"
                aria-label="Plain English suggestion"
              >
                <p className="min-w-0 flex-1 text-sm font-medium text-slate-800 sm:text-base">
                  <span aria-hidden>💡</span> New to homebuying? Turn on Plain English Mode for jargon-free guidance.
                </p>
                <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={turnOnPlainEnglish}
                    className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
                  >
                    Turn On
                  </button>
                  <button
                    type="button"
                    onClick={dismissPlainEnglishCallout}
                    className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                    aria-label="Dismiss Plain English suggestion"
                  >
                    <X className="h-5 w-5" aria-hidden />
                  </button>
                </div>
              </motion.div>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-teal-200/80 bg-gradient-to-br from-white via-teal-50/40 to-white px-4 py-3.5 shadow-md sm:px-5 sm:py-4">
              <label
                className="flex cursor-pointer flex-wrap items-center gap-3 text-base font-semibold text-millennial-text"
                title={plainEnglishTooltip}
              >
                <span>Plain English mode</span>
                {getStoredQuizTransactionMeta().icpType === 'first-gen' ? (
                  <span
                    className="max-w-[min(100%,14rem)] rounded-full bg-teal-100 px-2 py-1 text-center text-[11px] font-semibold leading-snug text-teal-900 sm:max-w-none sm:text-xs"
                    title={
                      plainEnglish
                        ? 'Plain English is on — recommended for first-time buyers'
                        : 'Turn on Plain English for jargon-free guidance'
                    }
                  >
                    {plainEnglish
                      ? 'On — recommended for first-time buyers'
                      : 'Turn on for jargon-free guidance'}
                  </span>
                ) : null}
                <span id="plain-english-mode-tip" className="sr-only">
                  {plainEnglishTooltip}
                </span>
                <input
                  type="checkbox"
                  className="h-6 w-6 shrink-0 accent-[#0d9488]"
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
                  aria-describedby="plain-english-mode-tip"
                />
              </label>
            </div>
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
              referralSlug={referralSlug}
              requestReferralModalOpen={referralModalKick}
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

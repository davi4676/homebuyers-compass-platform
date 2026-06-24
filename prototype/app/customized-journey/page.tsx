'use client'

import { useState, useEffect, Suspense, useMemo, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Bell, BookOpen, X } from '@phosphor-icons/react'
import { useRouter, usePathname } from 'next/navigation'
import { useSafeSearchParams } from '@/lib/use-safe-search-params'
import { useAuth } from '@/lib/hooks/useAuth'
import UserJourneyTracker from '@/components/analytics/UserJourneyTracker'
import JourneyValuePillars from '@/components/journey/JourneyValuePillars'
import JourneyHubHero from '@/components/journey/JourneyHubHero'
import NqMarqueeTicker from '@/components/landing/NqMarqueeTicker'
import { useExperiment } from '@/lib/hooks/useExperiment'
import NQGuidedRoadmap from '@/components/NQGuidedRoadmap'
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
import JourneyTabReveal from '@/components/journey/JourneyTabReveal'
import SessionWinsBanner from '@/components/journey/SessionWinsBanner'
import JourneyReengagementBanner from '@/components/journey/JourneyReengagementBanner'
import { buildUserSnapshot, loadQuizDataFromLocalStorage } from '@/lib/user-snapshot'
import type { UserSnapshot } from '@/lib/user-snapshot'
import { useJourneyPhaseRingProgress } from '@/hooks/use-journey-phase-ring'
import { useMomentumFactors } from '@/hooks/use-momentum-factors'
import { track } from '@/lib/analytics'
import { useCompass } from '@/lib/ai/useCompass'
import { buildCompassUserFromJourney } from '@/lib/ai/build-compass-user'
import { CompassWidget } from '@/components/CompassWidget'

const CompassPanel = dynamic(
  () => import('@/components/CompassPanel').then((mod) => ({ default: mod.CompassPanel })),
  { ssr: false, loading: () => null }
)

const CERT_PURCHASE_TRACKED_SS = 'nq_certificate_purchased_tracked_session'
const JOURNEY_ENTERED_TRACKED_SS = 'nq_journey_entered_posthog'
const ONBOARDING_LS = 'nq_customized_onboarding_v1'

export default function CustomizedJourneyPage() {
  const searchParams = useSafeSearchParams()
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
  const [identitySnapshot, setIdentitySnapshot] = useState<UserSnapshot | null>(null)
  const [compassLsTick, setCompassLsTick] = useState(0)
  const [onboardingDone, setOnboardingDone] = useState(true)

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
  const rawJourneyTabParam = useMemo(() => {
    try {
      const v = new URLSearchParams(journeySearchKey).get('tab')
      return v?.trim() && v.trim() !== '' ? v.trim() : null
    } catch {
      return null
    }
  }, [journeySearchKey])
  const activeJourneyTab: JourneyTab = useMemo(
    () => parseJourneyTabParam(new URLSearchParams(journeySearchKey).get('tab')),
    [journeySearchKey]
  )
  const isTodayTab = activeJourneyTab === 'today'
  const momentumFactors = useMomentumFactors()
  const heroPhaseProgress = useJourneyPhaseRingProgress()

  useEffect(() => {
    const q = loadQuizDataFromLocalStorage()
    setIdentitySnapshot(q ? buildUserSnapshot(q, { firstName: user?.firstName }) : null)
  }, [user?.firstName])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const onStorage = (e: StorageEvent) => {
      if (e.key !== 'quizData') return
      const q = loadQuizDataFromLocalStorage()
      setIdentitySnapshot(q ? buildUserSnapshot(q, { firstName: user?.firstName }) : null)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [user?.firstName])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const read = () => {
      try {
        setOnboardingDone(localStorage.getItem(ONBOARDING_LS) === '1')
      } catch {
        setOnboardingDone(false)
      }
    }
    read()
    window.addEventListener('storage', read)
    window.addEventListener('nq-onboarding-complete', read)
    return () => {
      window.removeEventListener('storage', read)
      window.removeEventListener('nq-onboarding-complete', read)
    }
  }, [])

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
    void activeJourneyTab
  }, [activeJourneyTab, journeySearchKey, pathname, router])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const bump = () => setCompassLsTick((n) => n + 1)
    window.addEventListener('nq-journey-progress', bump)
    window.addEventListener('storage', bump)
    return () => {
      window.removeEventListener('nq-journey-progress', bump)
      window.removeEventListener('storage', bump)
    }
  }, [])

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

  const compassUser = useMemo(
    () =>
      buildCompassUserFromJourney({
        authUser: user,
        snapshot: identitySnapshot,
        completionPercent: heroPhaseProgress.pct,
        budgetSketchComplete: momentumFactors.budgetSketchCompleted,
      }),
    [
      user,
      identitySnapshot,
      heroPhaseProgress.pct,
      momentumFactors.budgetSketchCompleted,
      compassLsTick,
    ]
  )

  const compass = useCompass(compassUser)

  const goToDownPaymentEstimate = () => {
    if (typeof window === 'undefined') {
      router.push('/results')
      return
    }
    const hasQuizData = Boolean(localStorage.getItem('quizData'))
    router.push(hasQuizData ? '/results' : '/quiz')
  }

  return (
    <div className="nq-ed-surface nq-journey-ds app-page-shell nq-ed-page-wash ml-0 pb-20 text-base leading-relaxed sm:ml-[300px] sm:pb-0 md:text-lg">
      <JourneyTabReveal />
      <UserJourneyTracker />

      <NqMarqueeTicker />
      <JourneyHubHero
        phaseCompleted={heroPhaseProgress.completed}
        phaseTotal={heroPhaseProgress.total}
        phasePct={heroPhaseProgress.pct}
        searchKey={journeySearchKey}
        activeTab={activeJourneyTab}
      />

      <main className="mx-auto max-w-6xl px-4 py-3 sm:px-6 sm:py-4 lg:px-8 md:py-5">
        {trialEndingBanner ? (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="nq-card mt-4 flex flex-col gap-3 rounded-xl border border-amber-300/90 bg-amber-50 px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            role="status"
          >
            <p className="text-sm font-medium text-amber-950 sm:text-base">
              <span aria-hidden>⏰</span> Your free trial ends in {trialEndingBanner.days}{' '}
              day{trialEndingBanner.days === 1 ? '' : 's'}. Upgrade to keep your progress and access.
            </p>
            <Link
              href="/payment?tier=momentum&cycle=monthly"
              className="btn-primary inline-flex shrink-0 items-center justify-center text-sm"
            >
              Keep My Plan →
            </Link>
          </motion.div>
        ) : null}

        {showRefLandingBanner ? (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="nq-ed-soft-card mt-4 rounded-xl border border-[var(--nq-ed-line)] bg-[var(--nq-ed-accent-soft)] px-4 py-3 text-sm text-[var(--nq-ed-text)] shadow-sm"
            role="status"
          >
            You were referred by a friend — sign up today and get $50 off your first plan.
            <button
              type="button"
              onClick={() => setShowRefLandingBanner(false)}
              className="ml-2 font-semibold text-[var(--nq-ed-accent)] underline"
            >
              Dismiss
            </button>
          </motion.div>
        ) : null}

        {onboardingNotify ? (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="nq-ed-soft-card mt-4 rounded-xl border border-[var(--nq-ed-line)] px-4 py-4 shadow-sm"
            role="region"
            aria-label="Journey notification"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-bold text-[var(--nq-ed-text)]">{onboardingNotify.title}</p>
                <p className="mt-1 text-sm text-[var(--nq-ed-muted)]">{onboardingNotify.body}</p>
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
                    } else if ('tab' in cta) {
                      router.push(
                        journeyTabHrefPreservingSearch(JOURNEY_PAGE_PATH, journeySearchKey, cta.tab)
                      )
                    }
                  }}
                  className="rounded-2xl bg-[var(--nq-ed-accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0f6058]"
                >
                  {onboardingNotify.cta.label}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    dismissOnboardingNotification(onboardingNotify.id)
                    setOnboardingNotify(getActiveOnboardingNotification())
                  }}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--nq-ed-muted)] hover:bg-[var(--nq-ed-accent-soft)]"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}

        <div className="nq-journey-main min-w-0 flex-1">
          {isTodayTab && onboardingDone ? (
            <>
              <JourneyReengagementBanner />
              <JourneyValuePillars />
            </>
          ) : isTodayTab ? (
            <JourneyReengagementBanner />
          ) : null}

          {showReturnBanner ? (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="nq-hub-panel flex items-center justify-between gap-3 px-4 py-3"
            >
              <p className="text-sm font-medium text-[var(--nq-ed-text)] md:text-base">
                Welcome back — pick up where you left off.
              </p>
              <button
                type="button"
                onClick={() => setShowReturnBanner(false)}
                className="shrink-0 text-sm font-semibold text-[var(--nq-ed-accent)] hover:underline md:text-base"
                aria-label="Dismiss"
              >
                Dismiss
              </button>
            </motion.div>
          ) : null}

          <Suspense
            fallback={
              <div
                className="nq-hub-panel min-h-[24rem] animate-pulse space-y-4 p-6 md:p-8"
                aria-busy
                aria-label="Loading roadmap"
              >
                <div className="h-10 max-w-md rounded-xl bg-[var(--nq-ed-line-soft)]" />
                <div className="h-6 w-2/3 max-w-lg rounded-lg bg-[var(--nq-ed-line-soft)]" />
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="h-40 rounded-xl bg-[var(--nq-ed-line-soft)]" />
                  <div className="h-40 rounded-xl bg-[var(--nq-ed-line-soft)]" />
                </div>
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

          {isTodayTab ? <SessionWinsBanner /> : null}

          <div className="nq-hub-panel nq-journey-footer-panel space-y-3">
            {showPlainEnglishCallout ? (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-3 rounded-xl border border-[var(--nq-ed-line)] bg-[var(--nq-ed-accent-soft)]/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                role="region"
                aria-label="Plain English suggestion"
              >
                <p className="min-w-0 flex-1 text-sm font-medium text-[var(--nq-ed-text)]">
                  <span aria-hidden>💡</span> New to homebuying? Turn on Plain English for simpler wording.
                </p>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={turnOnPlainEnglish}
                    className="rounded-2xl bg-[var(--nq-ed-accent)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f6058]"
                  >
                    Turn On
                  </button>
                  <button
                    type="button"
                    onClick={dismissPlainEnglishCallout}
                    className="rounded-lg p-2 text-[var(--nq-ed-muted)] transition hover:bg-white/80"
                    aria-label="Dismiss Plain English suggestion"
                  >
                    <X weight="duotone" size={20} aria-hidden />
                  </button>
                </div>
              </motion.div>
            ) : null}

            <label
              className="flex cursor-pointer flex-wrap items-center justify-center gap-3 text-sm font-medium text-[var(--nq-ed-muted)]"
              title={plainEnglishTooltip}
            >
              <span>Plain English mode</span>
              {getStoredQuizTransactionMeta().icpType === 'first-gen' ? (
                <span className="rounded-full bg-[var(--nq-ed-accent-soft)] px-2 py-0.5 text-[11px] font-semibold text-[var(--nq-ed-accent)]">
                  {plainEnglish ? 'On — recommended' : 'Recommended for first-gen'}
                </span>
              ) : null}
              <span id="plain-english-mode-tip" className="sr-only">
                {plainEnglishTooltip}
              </span>
              <input
                type="checkbox"
                className="h-4 w-4 shrink-0 accent-[var(--nq-ed-accent)]"
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

            <p className="text-center text-sm font-medium text-[var(--nq-ed-muted)]">
              More in your journey index — library scripts and inbox reminders.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={journeyTabHrefPreservingSearch(JOURNEY_PAGE_PATH, journeySearchKey, 'library')}
                scroll={false}
                className="nq-ed-btn-outline inline-flex items-center gap-2 !rounded-xl !px-4 !py-2.5 text-sm"
              >
                <BookOpen weight="duotone" size={18} aria-hidden />
                Library
              </Link>
              <Link
                href={journeyTabHrefPreservingSearch(JOURNEY_PAGE_PATH, journeySearchKey, 'inbox')}
                scroll={false}
                className="nq-ed-btn-outline inline-flex items-center gap-2 !rounded-xl !px-4 !py-2.5 text-sm"
              >
                <Bell weight="duotone" size={18} aria-hidden />
                Inbox
              </Link>
            </div>
          </div>
        </div>
      </main>

      {user ? <CompassWidget compass={compass} /> : null}
      {user && compass.isOpen ? (
        <CompassPanel
          compass={compass}
          currentPhase={compassUser.currentPhase ?? 'Getting started'}
          rawJourneyTab={rawJourneyTabParam}
        />
      ) : null}
    </div>
  )
}

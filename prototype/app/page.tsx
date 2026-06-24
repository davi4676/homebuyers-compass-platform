'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { ArrowRight, Check, DollarSign, Lock, Sparkles } from 'lucide-react'
import CountUpNumber from '@/components/CountUpNumber'
import NqLandingBody from '@/components/landing/NqLandingBody'
import NqMarqueeTicker from '@/components/landing/NqMarqueeTicker'
import NqHeroImageRotator from '@/components/landing/NqHeroImageRotator'
import UserJourneyTracker from '@/components/analytics/UserJourneyTracker'
import { LANDING_BUILDER_HERO_IMAGES } from '@/lib/landing-builder-images'
import { trackActivity } from '@/lib/track-activity'
import { useExperiment } from '@/lib/hooks/useExperiment'
import { SIGNUP_DISABLED } from '@/lib/auth-flags'
import { REFERRED_BY_LS_KEY } from '@/lib/referral-program'
import { estimateLandingSavings, parseHomePriceInput } from '@/lib/landing-savings-estimate'
import EmailPrivacyNotice from '@/components/trust/EmailPrivacyNotice'

export default function LandingPage() {
  const [leadEmail, setLeadEmail] = useState('')
  const [leadSubmitted, setLeadSubmitted] = useState(false)
  const [leadSubmitting, setLeadSubmitting] = useState(false)
  const [leadError, setLeadError] = useState<string | null>(null)
  const [homePrice, setHomePrice] = useState('')
  const [showMoreIcp, setShowMoreIcp] = useState(false)
  const [refFriendBanner, setRefFriendBanner] = useState(false)
  const [stickyVisible, setStickyVisible] = useState(false)
  const heroRef = useRef<HTMLElement>(null)
  const heroInView = useInView(heroRef, { amount: 0.3 })
  const authGateExperiment = useExperiment('auth_gate_v2')

  useEffect(() => {
    setStickyVisible(!heroInView)
  }, [heroInView])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const ref = new URLSearchParams(window.location.search).get('ref')?.trim()
    if (!ref) return
    try {
      localStorage.setItem(REFERRED_BY_LS_KEY, ref.slice(0, 64))
    } catch {
      /* ignore */
    }
    setRefFriendBanner(true)
  }, [])

  useEffect(() => {
    if (authGateExperiment.isReady) {
      authGateExperiment.track('landing_viewed')
    }
  }, [authGateExperiment.isReady, authGateExperiment.variant])

  const authSignupThenPath = (path: string) =>
    SIGNUP_DISABLED ? path : `/auth?mode=signup&redirect=${encodeURIComponent(path)}`

  const ctaHref = (transactionType: string) =>
    authSignupThenPath(`/quiz?transactionType=${encodeURIComponent(transactionType)}`)

  const quizByIcp = (icp: string) => authSignupThenPath(`/quiz?type=${encodeURIComponent(icp)}`)

  const handlePrimaryCtaClick = (source: string, transactionType: string) => {
    trackActivity('tool_used', { tool: source, transactionType })
    authGateExperiment.track('landing_cta_clicked', { source, transactionType })
  }

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!leadEmail.trim()) return
    setLeadSubmitting(true)
    setLeadError(null)
    trackActivity('tool_used', { tool: 'landing_lead_magnet', email_length: leadEmail.length })
    try {
      const res = await fetch('/api/leads/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: leadEmail.trim(),
          template: 'closing-cost-checklist',
          source: 'landing',
        }),
      })
      if (!res.ok) {
        setLeadError('Something went wrong. Please try again.')
        return
      }
      setLeadSubmitted(true)
    } catch {
      setLeadError('Something went wrong. Please try again.')
    } finally {
      setLeadSubmitting(false)
    }
  }

  const priceHref = homePrice.trim()
    ? authSignupThenPath(`/quiz?type=first-time&homePrice=${encodeURIComponent(homePrice.replace(/[^0-9]/g, ''))}`)
    : ctaHref('first-time')

  const parsedHomePrice = useMemo(() => parseHomePriceInput(homePrice), [homePrice])
  const estimatedSavings = useMemo(() => estimateLandingSavings(parsedHomePrice), [parsedHomePrice])

  return (
    <div className="min-h-screen nq-ed-page-wash nq-landing-home font-sans antialiased">
      <UserJourneyTracker />

      <NqMarqueeTicker />

      <AnimatePresence>
        {refFriendBanner && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-emerald-200 bg-emerald-50"
          >
            <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-4 py-3 text-sm font-medium text-emerald-900">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              You were referred by a friend — sign up today and get $50 off your first plan.
              <button type="button" onClick={() => setRefFriendBanner(false)} className="ml-2 font-bold underline">
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section
        ref={heroRef}
        className="nq-modern-hero nq-landing-hero relative isolate overflow-hidden px-4 sm:px-6"
      >
        <div className="relative z-[1] mx-auto max-w-7xl">
          <div className="nq-modern-hero-grid">
            <div className="text-center lg:text-left">
              <p className="nq-sl-brand-line">NestQuest, inc.</p>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.55 }}
                className="mx-auto mt-3 max-w-3xl font-display text-[2rem] font-bold leading-[1.1] tracking-tight lg:mx-0 sm:text-[2.75rem] md:text-[3.25rem]"
              >
                Buy your first home{' '}
                <span className="bg-gradient-to-r from-[var(--nq-ed-accent)] to-[var(--nq-ed-trust-blue)] bg-clip-text text-transparent">
                  with someone in your corner.
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28, duration: 0.45 }}
                className="mx-auto mt-3 max-w-md text-base leading-relaxed text-[var(--nq-ed-muted)] lg:mx-0 sm:text-lg"
              >
                Grants, fee clarity, and negotiation scripts — built for buyers, not lenders.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="nq-modern-hero-visual nq-modern-hero-visual--compact"
            >
              <NqHeroImageRotator images={LANDING_BUILDER_HERO_IMAGES} />
              <div className="nq-glass nq-savings-glass nq-savings-glass--hero z-[2]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4 md:gap-6">
                  <div className="shrink-0 sm:min-w-[7.5rem]">
                    <p className="nq-savings-glass-label">Potential savings</p>
                    <p className="nq-savings-glass-amount" aria-live="polite">
                      <CountUpNumber
                        key={estimatedSavings}
                        end={estimatedSavings}
                        prefix="$"
                        duration={900}
                        className="tabular-nums"
                      />
                    </p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <label className="mb-1.5 block text-left text-xs font-medium text-[var(--nq-ed-muted)]">
                      Target home price
                    </label>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                      <div className="relative min-w-0 flex-1">
                        <DollarSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--nq-ed-faint)]" />
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="350,000"
                          value={homePrice}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/[^0-9]/g, '')
                            setHomePrice(raw ? Number(raw).toLocaleString('en-US') : '')
                          }}
                          className="h-10 w-full cursor-text rounded-lg border border-[var(--nq-ed-line)] bg-white/90 pl-9 pr-3 text-sm font-semibold text-[var(--nq-ed-text)] shadow-sm placeholder:text-[var(--nq-ed-faint)] transition focus:border-[var(--nq-ed-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--nq-ed-accent-soft)]"
                        />
                      </div>
                      <Link
                        href={priceHref}
                        onClick={() => handlePrimaryCtaClick('landing_hero_price_input', 'first-time')}
                        className="flex h-10 shrink-0 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-[var(--nq-ed-accent)] px-4 text-sm font-bold text-white shadow-md transition hover:bg-[var(--nq-ed-accent-hover)] sm:px-5"
                      >
                        Check savings
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                    <p className="mt-2 flex items-center gap-1 text-[11px] text-[var(--nq-ed-muted)]">
                      <Lock className="h-3 w-3 shrink-0" />
                      Free · No credit check · ~90 sec
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
            className="nq-landing-social-proof flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-[var(--nq-ed-muted)] sm:gap-x-6"
          >
            <span>
              Typical savings opportunities:{' '}
              <strong className="font-semibold text-[var(--nq-ed-text)]">$8k–$15k</strong>
            </span>
            <span className="hidden h-4 w-px bg-[var(--nq-ed-line)] sm:block" aria-hidden />
            <Link
              href="/resources#phase-methodology"
              className="font-medium text-[var(--nq-ed-accent)] underline-offset-2 hover:underline"
            >
              How we calculate savings
            </Link>
          </motion.div>
        </div>
      </section>

      <main>
        <NqLandingBody
          ctaHref={ctaHref}
          quizByIcp={quizByIcp}
          onCtaClick={handlePrimaryCtaClick}
          showMoreIcp={showMoreIcp}
          setShowMoreIcp={setShowMoreIcp}
        />
      </main>

      <footer className="nq-landing-footer border-t border-slate-800 bg-[rgb(var(--navy))] text-white/80">
        <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
          <div className="border-b border-white/10 pb-8">
            <p className="text-sm font-semibold text-white">Not quite ready?</p>
            <p className="mt-2 text-sm text-white/70">Get a free closing-cost checklist emailed to you</p>
            {leadSubmitted ? (
              <p className="mt-4 font-medium text-emerald-300">Thanks! Check your inbox for the free checklist.</p>
            ) : (
              <form
                onSubmit={handleLeadSubmit}
                className="mx-auto mt-4 flex max-w-md flex-col gap-2 sm:flex-row sm:items-stretch"
              >
                <input
                  type="email"
                  placeholder="Your email"
                  value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                  required
                  className="flex-1 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
                />
                <button
                  type="submit"
                  disabled={leadSubmitting}
                  className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-[rgb(var(--navy))] transition hover:bg-white/90 disabled:opacity-60"
                >
                  {leadSubmitting ? 'Sending…' : 'Send checklist'}
                </button>
              </form>
            )}
            {leadError ? <p className="mt-2 text-sm text-red-300">{leadError}</p> : null}
            {!leadSubmitted ? <EmailPrivacyNotice className="mx-auto mt-3 max-w-md text-white/50" /> : null}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm text-white/60">
            {['HUD-Approved Resources', 'CFPB-Aligned Guidance', 'No affiliate kickbacks'].map((label) => (
              <span
                key={label}
                className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1"
              >
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                {label}
              </span>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm">
            <Link href={ctaHref('first-time')} className="text-white hover:underline">
              See if you qualify
            </Link>
            <Link href="/customized-journey" className="text-white/70 hover:underline">
              Your Journey
            </Link>
            <Link href="/how-it-works" className="text-white/70 hover:underline">
              How It Works
            </Link>
            <Link href="/privacy" className="text-white/70 hover:underline">
              Privacy
            </Link>
            <Link href="/terms" className="text-white/70 hover:underline">
              Terms
            </Link>
            <Link href="/glossary" className="text-white/70 hover:underline">
              Glossary
            </Link>
          </div>

          <p className="mt-6 text-xs leading-relaxed text-white/40">
            NestQuest provides educational guidance only — we are not a lender, real estate broker, or title company.
            Savings figures are illustrative ranges, not guarantees.{' '}
            <Link href="/resources#phase-methodology" className="underline hover:text-white/60">
              Methodology
            </Link>
          </p>
          <p className="mt-4 text-sm text-white/40">
            &copy; {new Date().getFullYear()} NestQuest. Your Homebuying Advocate.
          </p>
        </div>
      </footer>

      <AnimatePresence>
        {stickyVisible && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="nq-glass-sticky-bar fixed bottom-0 left-0 right-0 z-50 border-t px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 md:hidden"
          >
            <Link
              href={priceHref}
              onClick={() => handlePrimaryCtaClick('landing_sticky_mobile', 'first-time')}
              className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--nq-ed-accent)] text-base font-bold text-white shadow-lg shadow-teal-900/15 transition hover:bg-[var(--nq-ed-accent-hover)]"
            >
              <span className="truncate">
                {parsedHomePrice > 0
                  ? `~$${estimatedSavings.toLocaleString('en-US')} savings · Qualify`
                  : 'See if you qualify — 90 sec'}
              </span>
              <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

'use client'

import { useState, useEffect, Fragment } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  ArrowUpCircle,
  Award,
  BadgeCheck,
  Building2,
  Check,
  Database,
  Key,
  ListChecks,
  MessageSquare,
  Shield,
  SlidersHorizontal,
  Star,
  X,
  EyeOff,
  Home,
  User,
  Users,
  DollarSign,
  FileText,
  ChevronDown,
  ChevronUp,
  Calculator,
  RefreshCw,
} from 'lucide-react'
import CountUpNumber from '@/components/CountUpNumber'
import ScrollRevealSection from '@/components/ScrollRevealSection'
import TrustSignals from '@/components/trust/TrustSignals'
import UserJourneyTracker from '@/components/analytics/UserJourneyTracker'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import HomebuyingRelayRaceSection from '@/components/HomebuyingRelayRaceSection'
import { trackActivity } from '@/lib/track-activity'
import { useExperiment } from '@/lib/hooks/useExperiment'
import { SIGNUP_DISABLED } from '@/lib/auth-flags'
import { REFERRED_BY_LS_KEY } from '@/lib/referral-program'

export default function LandingPage() {
  const [heroForm, setHeroForm] = useState({ type: 'first-time', preparedness: 'learning', when: '6-months' })
  const [promoDismissed, setPromoDismissed] = useState(true)
  const [leadEmail, setLeadEmail] = useState('')
  const [leadSubmitted, setLeadSubmitted] = useState(false)
  const [relayExpanded, setRelayExpanded] = useState(false)
  const [equityHomeValue, setEquityHomeValue] = useState(420000)
  const [equityMortgage, setEquityMortgage] = useState(265000)
  const [equityYears, setEquityYears] = useState(6)
  const [showMoveUpTools, setShowMoveUpTools] = useState(false)
  const [refFriendBanner, setRefFriendBanner] = useState(false)
  const authGateExperiment = useExperiment('auth_gate_v2')

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

  const quizAffordabilityHref = authSignupThenPath('/quiz?type=affordability')
  const quizGuidedHref = authSignupThenPath('/quiz?type=guided')

  const estimatedEquity = Math.max(0, equityHomeValue - equityMortgage)
  const sellingCostsPct = 0.07
  const netProceeds = Math.max(0, equityHomeValue * (1 - sellingCostsPct) - equityMortgage)

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!leadEmail.trim()) return
    trackActivity('tool_used', { tool: 'landing_lead_magnet', email_length: leadEmail.length })
    setLeadSubmitted(true)
  }

  const handlePrimaryCtaClick = (source: string, transactionType: string) => {
    trackActivity('tool_used', { tool: source, transactionType })
    authGateExperiment.track('landing_cta_clicked', { source, transactionType })
  }

  /** Icons chosen for broad lucide-react@0.30x compatibility (avoid newer/missing names). */
  const guidedPathSteps = [
    { label: 'Credit & Documents', Icon: Check, active: true },
    { label: 'Pre-Approval', Icon: Building2, active: true },
    { label: 'Find Your Home', Icon: Home, active: false },
    { label: 'Offer & Inspection', Icon: FileText, active: false },
    { label: 'Close & Move In', Icon: Key, active: false },
  ] as const

  return (
    <div className="min-h-screen bg-gradient-to-b from-millennial-bg via-millennial-bg to-[#f0f4f0] text-millennial-text font-sans antialiased">
      <UserJourneyTracker />

      {/* Sliding $15k call-to-action banner — dismissible */}
      <AnimatePresence>
        {!promoDismissed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden bg-[rgb(var(--navy))] text-white"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-base font-medium tracking-tight">
                Avoid overpaying up to <strong className="text-white">$15,000</strong> at closing. Get your free assessment.
              </span>
              <div className="flex items-center gap-3 shrink-0">
                <Link
                  href={ctaHref('first-time')}
                  onClick={() => handlePrimaryCtaClick('landing_top_banner_cta', 'first-time')}
                  className="text-sm font-bold text-white bg-[rgb(var(--coral))] hover:bg-[rgb(var(--coral-hover))] px-4 py-1.5 rounded-lg transition-colors"
                >
                  Get your assessment
                </Link>
                <button onClick={() => setPromoDismissed(true)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors" aria-label="Dismiss">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {refFriendBanner ? (
        <div className="border-b border-teal-200 bg-teal-50 px-4 py-3 text-center text-sm font-medium text-teal-950">
          You were referred by a friend — sign up today and get $50 off your first plan.
          <button
            type="button"
            onClick={() => setRefFriendBanner(false)}
            className="ml-2 font-semibold text-teal-800 underline"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      <section id="landing-hero" className="relative w-full overflow-hidden">
        <div className="border-b border-slate-200/80 bg-millennial-bg/95 px-4 py-8 text-center sm:py-10 md:py-12">
          <div className="mx-auto max-w-3xl">
            <h1 className="font-display text-[1.65rem] font-extrabold leading-tight tracking-tight text-millennial-text sm:text-[2.1rem] md:text-4xl">
              Save $10,000–$15,000 on Your Home Purchase — Without Guessing
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg font-medium leading-relaxed text-slate-700 sm:text-xl md:mt-5 md:text-[1.35rem] md:leading-snug">
              We find the money everyone else is hiding from you — grants, programs, and negotiation tactics that
              save first-time buyers $10,000–$15,000.
            </p>
          </div>
        </div>
        <div className="grid md:grid-cols-2">
          {/* LEFT — Stretched Millennial / affordability track */}
          <div
            className="relative px-5 py-10 sm:px-8 sm:py-12 md:px-10 md:py-14 lg:px-12"
            style={{
              backgroundColor: '#FAF8F5',
              backgroundImage: `
                linear-gradient(to right, rgba(27, 67, 50, 0.06) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(27, 67, 50, 0.06) 1px, transparent 1px)
              `,
              backgroundSize: '24px 24px',
            }}
          >
            <div
              className="pointer-events-none absolute inset-y-8 right-0 z-[1] hidden w-px bg-gradient-to-b from-transparent via-slate-400/35 to-transparent md:block"
              aria-hidden
            />
            <span className="pointer-events-none absolute right-0 top-1/2 z-[2] hidden -translate-y-1/2 translate-x-1/2 md:flex md:items-center md:justify-center">
              <span className="rounded-full border border-slate-200/90 bg-[#FAF8F5] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500 shadow-sm">
                or
              </span>
            </span>
            <div className="relative z-0 mx-auto max-w-lg">
              <h2 className="font-display text-[28px] font-bold leading-tight tracking-tight text-slate-800">
                Find out if you can actually afford it — and what it&apos;ll really cost.
              </h2>
              <p className="mt-3 text-base font-medium leading-relaxed text-slate-600">
                Real numbers. Every fee. No surprises at closing.
              </p>

              <div className="mt-8 rounded-2xl border border-slate-200/90 bg-white/90 p-4 shadow-sm backdrop-blur-sm sm:p-5">
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                  <p className="text-sm font-semibold text-slate-800">Monthly Payment Breakdown</p>
                  <button
                    type="button"
                    className="shrink-0 text-xs font-semibold text-brand-forest/90 underline-offset-2 hover:underline"
                  >
                    Edit →
                  </button>
                </div>
                <table className="mt-3 w-full text-sm">
                  <tbody className="divide-y divide-slate-100">
                    {(
                      [
                        ['Principal & Interest', '$1,847'],
                        ['Property Taxes', '$312'],
                        ['Homeowners Insurance', '$95'],
                        ['PMI', '$142'],
                        ['HOA', '$0'],
                      ] as const
                    ).map(([label, value]) => (
                      <tr key={label}>
                        <th scope="row" className="py-2.5 pr-4 text-left font-medium text-slate-600">
                          {label}
                        </th>
                        <td className="py-2.5 text-right tabular-nums font-medium text-slate-800">{value}</td>
                      </tr>
                    ))}
                    <tr className="bg-brand-forest/10">
                      <th scope="row" className="rounded-l-lg py-3 pl-3 pr-4 text-left text-sm font-bold text-brand-forest">
                        Total
                      </th>
                      <td className="rounded-r-lg py-3 pr-3 text-right text-base font-bold tabular-nums text-brand-forest">
                        $2,396/mo
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <Link
                href={quizAffordabilityHref}
                onClick={() => handlePrimaryCtaClick('landing_hero_affordability', 'affordability')}
                className="mt-8 flex h-12 w-full items-center justify-center rounded-xl bg-brand-forest px-6 text-base font-semibold text-white shadow-md transition-colors hover:bg-brand-forest/90"
              >
                Run My Affordability Check →
              </Link>
              <p className="mt-3 text-center text-sm text-slate-600">Free · No credit check · Takes 90 seconds</p>
            </div>
          </div>

          {/* Mobile only: stack between columns (hidden ≥ md so grid is exactly two cells) */}
          <div className="flex items-center justify-center bg-[#FAF8F5] py-3 text-sm font-medium text-slate-500 md:hidden">
            <span aria-hidden className="text-slate-400">
              — or —
            </span>
          </div>

          {/* RIGHT — First-gen / guided track */}
          <div
            className="px-5 py-10 sm:px-8 sm:py-12 md:px-10 md:py-14 lg:px-12"
            style={{
              backgroundColor: '#FDF6EC',
              backgroundImage: 'radial-gradient(circle, rgba(27, 67, 50, 0.07) 1px, transparent 1px)',
              backgroundSize: '18px 18px',
            }}
          >
            <div className="relative z-0 mx-auto max-w-lg">
              <h2 className="font-display text-[28px] font-bold leading-tight tracking-tight text-slate-800">
                No one in your family has done this. We&apos;ll walk you through every step.
              </h2>
              <p className="mt-3 text-base font-medium leading-relaxed text-slate-600">
                Plain language. No jargon. No judgment.
              </p>

              {/* Desktop: horizontal 5-step path, dotted connectors (segments 1–2 active) */}
              <div
                className="mt-10 hidden w-full flex-row items-start md:flex"
                role="img"
                aria-label="Five steps: Credit and documents, pre-approval, find your home, offer and inspection, close and move in. First two steps highlighted."
              >
                {guidedPathSteps.map((step, i) => {
                  const Icon = step.Icon
                  return (
                    <Fragment key={step.label}>
                      <div className="flex w-[4.75rem] shrink-0 flex-col items-center text-center sm:w-[5.25rem]">
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                            step.active ? 'bg-brand-forest text-white shadow-sm' : 'bg-slate-200/80 text-slate-500'
                          }`}
                        >
                          <Icon className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                        </span>
                        <span
                          className={`mt-2.5 text-xs font-semibold leading-snug ${
                            step.active ? 'text-brand-forest' : 'text-slate-400'
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                      {i < guidedPathSteps.length - 1 && (
                        <div
                          className={`mt-[18px] h-0 min-w-[8px] flex-1 border-t-2 border-dotted ${
                            i < 2 ? 'border-brand-forest/45' : 'border-slate-300'
                          }`}
                          aria-hidden
                        />
                      )}
                    </Fragment>
                  )
                })}
              </div>

              {/* Mobile: vertical path with SVG dotted connectors */}
              <ol
                className="relative mt-8 flex list-none flex-col gap-0 md:hidden"
                aria-label="Buying journey steps"
              >
                {guidedPathSteps.map((step, i) => {
                  const Icon = step.Icon
                  return (
                    <li key={step.label} className="relative flex gap-3">
                      <div className="flex flex-col items-center">
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                            step.active ? 'bg-brand-forest text-white shadow-sm' : 'bg-slate-200/80 text-slate-500'
                          }`}
                        >
                          <Icon className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                        </span>
                        {i < guidedPathSteps.length - 1 && (
                          <svg
                            className="my-1 h-8 w-[2px] shrink-0 overflow-visible"
                            aria-hidden
                            viewBox="0 0 2 32"
                            preserveAspectRatio="none"
                          >
                            <line
                              x1="1"
                              y1="0"
                              x2="1"
                              y2="32"
                              strokeWidth={2}
                              strokeDasharray="4 5"
                              stroke={i < 2 ? 'rgb(27 67 50 / 0.45)' : 'rgb(148 163 184 / 0.9)'}
                              vectorEffect="non-scaling-stroke"
                            />
                          </svg>
                        )}
                      </div>
                      <span
                        className={`pt-2 text-sm font-semibold leading-snug ${
                          step.active ? 'text-brand-forest' : 'text-slate-400'
                        }`}
                      >
                        {step.label}
                      </span>
                    </li>
                  )
                })}
              </ol>

              <Link
                href={quizGuidedHref}
                onClick={() => handlePrimaryCtaClick('landing_hero_guided', 'guided')}
                className="mt-10 flex h-12 w-full items-center justify-center rounded-xl bg-[#D97706] px-6 text-base font-semibold text-white shadow-md transition-colors hover:bg-[#b45309]"
              >
                Start My Guided Journey →
              </Link>
              <p className="mt-3 text-center text-sm text-slate-600">Free · No account required · Your pace</p>
            </div>
          </div>
        </div>
      </section>

      {/* ICP overlaps hero for continuity */}
      <div id="icp-selector" className="relative z-20 mx-auto -mt-14 -mb-14 w-full max-w-5xl scroll-mt-24 px-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl md:p-8">
          <p className="text-center text-sm font-semibold uppercase tracking-wide text-brand-sage">Start here</p>
          <h2 className="font-display mt-1 text-center text-xl font-bold text-brand-forest md:text-2xl">
            Which best describes you?
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(
              [
                { type: 'first-time' as const, IcpIcon: Home, title: 'First-Time Buyer', desc: "I've never owned a home before" },
                { type: 'first-gen' as const, IcpIcon: Users, title: 'First in My Family', desc: 'No one in my family has done this before' },
                { type: 'solo' as const, IcpIcon: User, title: 'Buying Solo', desc: "I'm purchasing on my own" },
                { type: 'move-up' as const, IcpIcon: ArrowUpCircle, title: 'I Own & Want to Upgrade', desc: 'I want to sell and buy simultaneously' },
                { type: 'refinance' as const, IcpIcon: RefreshCw, title: 'Refinancing', desc: 'Lower my rate, cash out, or change loan terms' },
              ] as const
            ).map((row) => {
              const I = row.IcpIcon
              return (
                <Link
                  key={row.type}
                  href={quizByIcp(row.type)}
                  onClick={() => {
                    handlePrimaryCtaClick('landing_icp_grid', row.type)
                    if (row.type === 'move-up') setShowMoveUpTools(true)
                  }}
                  className="group flex flex-col rounded-xl border-2 border-slate-200 bg-white p-5 transition-all duration-200 hover:border-millennial-primary hover:shadow-md hover:scale-[1.02] active:bg-millennial-primary-light/40 active:border-millennial-primary"
                >
                  <I className="h-8 w-8 shrink-0 text-millennial-cta-secondary" aria-hidden />
                  <span className="mt-3 font-display text-lg font-semibold text-millennial-text">{row.title}</span>
                  <span className="mt-1 text-sm text-millennial-text-muted">{row.desc}</span>
                  <span className="mt-4 ml-auto text-sm font-semibold text-millennial-cta-secondary transition-transform duration-200 group-hover:translate-x-0.5">
                    Start →
                  </span>
                </Link>
              )
            })}
          </div>
          <p className="mt-4 text-center text-xs text-slate-500">About 90 seconds · No credit pull</p>
        </div>
      </div>

      <main>
        <ScrollRevealSection>
        <section className="border-b border-slate-200 bg-brand-mist/50 py-12 md:py-14">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 md:grid-cols-2 md:px-6 lg:px-8">
            <div className="rounded-2xl border border-brand-sage/25 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-brand-sage">Budget preview</p>
              <p className="mt-2 text-2xl font-bold text-brand-forest">Your estimated monthly payment: ~$2,450</p>
              <p className="mt-2 text-sm text-slate-600">
                Example for a typical loan — your journey page breaks down mortgage, taxes, insurance, and more.
              </p>
              <p className="mt-2 text-[11px] leading-snug text-slate-500">
                Figure is a rounded illustration for UX, not a quote or pre-approval. Your lender sets the actual
                payment.
              </p>
              <Link
                href="/customized-journey?tab=budget"
                className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-brand-terracotta hover:underline"
              >
                See full breakdown →
              </Link>
            </div>
            <div className="rounded-2xl border-2 border-brand-gold bg-brand-gold/10 p-6 shadow-sm">
              <DollarSign className="h-9 w-9 text-brand-gold" strokeWidth={2} />
              <h3 className="mt-3 text-lg font-bold text-brand-forest md:text-xl">
                Uncover Grants &amp; Assistance You Don&apos;t Know Exist
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                The average buyer qualifies for $8,200 in down payment assistance programs. We scan 2,000+ federal, state, and local programs to find yours in minutes.
              </p>
              <p className="mt-2 text-[11px] leading-snug text-slate-500">
                &quot;Average&quot; and program counts reflect NestQuest prototype modeling for demos—not audited market statistics.
              </p>
              <Link
                href="/down-payment-optimizer"
                className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-brand-terracotta hover:underline"
              >
                Find My Hidden Funds →
              </Link>
            </div>
          </div>
        </section>
        </ScrollRevealSection>

        <ScrollRevealSection>
        <section className="border-b border-slate-200 bg-white py-12">
          <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8">
            <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-brand-sage">Move-up buyers</p>
                <h2 className="font-display text-2xl font-bold text-brand-forest">Estimate equity before you list</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Rough net proceeds after ~6% agent + 1% closing (illustrative).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowMoveUpTools((v) => !v)}
                className="text-sm font-semibold text-brand-terracotta hover:underline"
              >
                {showMoveUpTools ? 'Hide calculator' : 'Show equity calculator'}
              </button>
            </div>
            {showMoveUpTools ? (
              <div className="grid gap-6 rounded-2xl border border-slate-200 bg-brand-mist/40 p-6 md:grid-cols-2">
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-slate-700">
                    Current home value
                    <input
                      type="range"
                      min={150000}
                      max={1200000}
                      step={5000}
                      value={equityHomeValue}
                      onChange={(e) => setEquityHomeValue(Number(e.target.value))}
                      className="mt-2 w-full accent-brand-forest"
                    />
                    <span className="mt-1 block text-lg font-bold text-brand-forest">
                      ${equityHomeValue.toLocaleString()}
                    </span>
                  </label>
                  <label className="block text-sm font-medium text-slate-700">
                    Remaining mortgage
                    <input
                      type="number"
                      value={equityMortgage}
                      onChange={(e) => setEquityMortgage(Number(e.target.value))}
                      className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
                    />
                  </label>
                  <label className="block text-sm font-medium text-slate-700">
                    Years owned
                    <input
                      type="number"
                      min={0}
                      max={40}
                      value={equityYears}
                      onChange={(e) => setEquityYears(Number(e.target.value))}
                      className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
                    />
                  </label>
                </div>
                <div className="flex flex-col justify-center rounded-xl bg-white p-6 shadow-inner">
                  <div className="flex items-center gap-2 text-brand-forest">
                    <Calculator className="h-6 w-6" />
                    <span className="font-bold">Estimated equity</span>
                  </div>
                  <p className="mt-3 text-4xl font-black text-brand-gold">${estimatedEquity.toLocaleString()}</p>
                  <p className="mt-4 text-sm text-slate-600">
                    Est. net proceeds after selling costs:{' '}
                    <strong className="text-brand-forest">${Math.round(netProceeds).toLocaleString()}</strong>
                  </p>
                  <Link
                    href="/customized-journey?tab=budget"
                    className="mt-6 inline-flex items-center justify-center rounded-xl bg-brand-forest px-4 py-3 text-center text-sm font-bold text-white hover:bg-brand-sage"
                  >
                    Use my equity as a down payment →
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </section>
        </ScrollRevealSection>

        {/* PROBLEM SECTION: The Uncomfortable Truth */}
        <ScrollRevealSection>
        <section className="relative pt-16 pb-12 md:pt-20 md:pb-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-[#1e293b] mb-3 text-center">
              Let&apos;s Face It: The home buying Process Is Very Complicated
            </h2>
            <h3 className="text-xl md:text-2xl font-semibold text-[#475569] mb-12 text-center">
              Everyone&apos;s Making Money Off You
            </h3>
            <div className="grid md:grid-cols-3 gap-8 md:gap-10">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-gradient-to-br from-amber-50/80 to-[#f8fafc] rounded-2xl p-6 border border-amber-200/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-amber-700" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1e293b]">Real Estate Agents</h3>
                </div>
                <div className="text-2xl font-bold text-amber-700 mb-2">$7,500–$12,000</div>
                <p className="text-sm text-slate-600 mb-3">2.5–3% on median home — incentivized to close fast</p>
                <div className="flex items-start gap-2 text-sm">
                  <EyeOff className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden />
                  <span><strong className="text-[#1e293b]">Hidden:</strong> Bonuses from preferred lenders</span>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-gradient-to-br from-rose-50/80 to-[#f8fafc] rounded-2xl p-6 border border-rose-200/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-rose-700" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1e293b]">Mortgage Lenders</h3>
                </div>
                <div className="text-2xl font-bold text-rose-700 mb-2">$1,500–$3,000+</div>
                <p className="text-sm text-slate-600 mb-3">Origination fees, inflated closing costs</p>
                <div className="flex items-start gap-2 text-sm">
                  <EyeOff className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden />
                  <span><strong className="text-[#1e293b]">Hidden:</strong> Yield spread premiums</span>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-gradient-to-br from-teal-50/80 to-[#f8fafc] rounded-2xl p-6 border border-teal-200/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-teal-700" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1e293b]">Title & Others</h3>
                </div>
                <div className="text-2xl font-bold text-teal-700 mb-2">$1,000–$2,000+</div>
                <p className="text-sm text-slate-600 mb-3">Title insurance, junk fees — you can shop, most don&apos;t</p>
                <div className="flex items-start gap-2 text-sm">
                  <EyeOff className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden />
                  <span><strong className="text-[#1e293b]">Hidden:</strong> Kickbacks between providers</span>
                </div>
              </motion.div>
            </div>
            <p className="text-center text-lg mt-10 font-black tracking-wide uppercase">
              <span className="bg-gradient-to-r from-rose-600 via-amber-500 to-rose-600 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(244,63,94,0.25)]">
                And no one tells you any of this until closing day.
              </span>
            </p>
            <p className="text-center mt-3 text-base sm:text-lg font-semibold text-[#1e293b]">
              It&apos;s time for someone to be on your side.
            </p>
          </div>
        </section>
        </ScrollRevealSection>

        {/* SOLUTION SECTION: Our Promise */}
        <ScrollRevealSection>
        <section className="py-16 md:py-24 bg-[#f8f9fa]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-[#1e293b] mb-6 text-center">
              We&apos;re Different. We&apos;re On Your Side.
            </h2>
            <p className="text-lg text-[#475569] mb-10 text-center max-w-2xl mx-auto">
              Feel confident at the closing table. Know exactly what you can negotiate. Your home, your numbers.
            </p>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {(
                [
                  {
                    Icon: Shield,
                    title: 'Zero Conflicts of Interest',
                    desc: 'We never take commissions or referral fees from lenders, agents, or title companies.',
                  },
                  {
                    Icon: Award,
                    title: 'Government-Backed Guidance',
                    desc: 'Our resources are aligned with HUD and CFPB standards for homebuyer education.',
                  },
                  {
                    Icon: SlidersHorizontal,
                    title: 'Built Around You, Not a Template',
                    desc: 'Your journey, budget, and goals shape every recommendation we make.',
                  },
                  {
                    Icon: Database,
                    title: 'The Largest DPA Database',
                    desc: "We scan over 2,000 federal, state, and local programs to find money you didn't know existed.",
                  },
                  {
                    Icon: ListChecks,
                    title: 'A Clear Path, Every Step',
                    desc: 'From pre-approval to closing, you always know exactly what to do next.',
                  },
                  {
                    Icon: MessageSquare,
                    title: 'Words That Save You Money',
                    desc: 'Know exactly what to say to agents, lenders, and sellers to protect your interests.',
                  },
                ] as const
              ).map(({ Icon, title, desc }) => (
                <div
                  key={title}
                  className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
                >
                  <Icon className="h-8 w-8 text-brand-forest" aria-hidden />
                  <h3 className="mt-4 font-semibold text-base text-[#1e293b]">{title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        </ScrollRevealSection>

        {/* HOW IT WORKS */}
        <ScrollRevealSection>
        <section id="how-it-works" className="py-16 md:py-24 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-sm font-medium text-slate-600 mb-2 text-center">Most people discover hidden costs too late. Get ahead.</p>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-[#1e293b] mb-6 text-center">
              Take our 90-second assessment and we&apos;ll show you:
            </h2>
            <ol className="space-y-4 list-decimal list-inside text-[#475569] text-lg">
              <li className="pl-2"><strong className="text-[#1e293b]">Your real affordability</strong> — not what lenders approve you for (that&apos;s too much)</li>
              <li className="pl-2"><strong className="text-[#1e293b]">A detailed cost breakdown</strong> — every single fee, clearly explained</li>
              <li className="pl-2"><strong className="text-[#1e293b]">Your personalized savings opportunities</strong> — where you&apos;re likely to overpay</li>
              <li className="pl-2"><strong className="text-[#1e293b]">Smart negotiation strategies</strong> — backed by data from 50,000+ purchases</li>
            </ol>
          </div>
        </section>
        </ScrollRevealSection>

        {/* CTA SECTION — cream panel + animated savings stat */}
        <ScrollRevealSection>
        <section className="border-y border-[#E8DFD0] bg-[#F5F0E8] py-16 md:py-24">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm font-medium text-amber-600 mb-2">Rates change weekly — get ahead before your next pre-approval</p>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-[#1e293b] mb-8">
              Ready to Stop Overpaying?
            </h2>
            <div className="mb-8">
              <CountUpNumber
                end={5593}
                prefix="$"
                duration={1800}
                className="text-5xl font-extrabold text-brand-forest font-display"
              />
              <p className="mt-2 text-base font-medium text-gray-600">average saved per buyer</p>
              <p className="mt-2 text-sm font-medium text-gray-500">
                Join{' '}
                <CountUpNumber
                  end={6303}
                  duration={1800}
                  className="tabular-nums font-semibold text-gray-600"
                />{' '}
                home buyers who&apos;ve already used NestQuest
              </p>
            </div>
            <Link
              href={ctaHref('first-time')}
              onClick={() => handlePrimaryCtaClick('landing_mid_page_cta', 'first-time')}
              className="inline-flex items-center justify-center gap-2 bg-millennial-cta-primary px-10 py-4 text-lg font-bold text-white rounded-xl transition-colors hover:bg-millennial-cta-hover"
            >
              Find My Savings →
            </Link>
            <p className="mt-4 text-center text-sm text-gray-500 max-w-md mx-auto">
              100% free. No credit card. No spam. Cancel anytime.
            </p>
          </div>
        </section>
        </ScrollRevealSection>

        {/* SOCIAL PROOF - Testimonials */}
        <ScrollRevealSection>
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-display mb-10 text-center text-2xl font-bold text-brand-forest">
              What buyers just like you are saying
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="rounded-2xl border border-slate-200 bg-brand-mist/40 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-600 text-lg font-semibold text-white">
                  JP
                </div>
                <div className="mt-3 flex gap-0.5" aria-label="5 out of 5 stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
                  ))}
                </div>
                <p className="mt-4 text-[#475569] text-base">
                  &quot;I thought I needed 20% down. The Compass found $11,400 in programs I qualified for in my county. We closed in 8 weeks.&quot;
                </p>
                <p className="mt-4 font-bold text-[#1e293b]">James &amp; Priya T., Austin TX</p>
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-green-700">
                  <BadgeCheck className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  Verified Buyer
                </span>
                <span className="mt-3 inline-block w-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                  Saved $11,400
                </span>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-brand-mist/40 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-600 text-lg font-semibold text-white">
                  MC
                </div>
                <div className="mt-3 flex gap-0.5" aria-label="5 out of 5 stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
                  ))}
                </div>
                <p className="mt-4 text-[#475569] text-base">
                  &quot;I was the first in my family to buy. I had no idea where to start. This platform walked me through every single step and found $9,200 in grants.&quot;
                </p>
                <p className="mt-4 font-bold text-[#1e293b]">Maria C., Phoenix AZ</p>
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-green-700">
                  <BadgeCheck className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  Verified Buyer
                </span>
                <span className="mt-3 inline-block w-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                  Saved $9,200
                </span>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-brand-mist/40 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-600 text-lg font-semibold text-white">
                  DR
                </div>
                <div className="mt-3 flex gap-0.5" aria-label="5 out of 5 stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
                  ))}
                </div>
                <p className="mt-4 text-[#475569] text-base">
                  &quot;Buying alone felt overwhelming. The Compass gave me a clear action plan and negotiation scripts. I saved $13,100 and never felt lost.&quot;
                </p>
                <p className="mt-4 font-bold text-[#1e293b]">Danielle R., Atlanta GA</p>
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-green-700">
                  <BadgeCheck className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  Verified Buyer
                </span>
                <span className="mt-3 inline-block w-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                  Saved $13,100
                </span>
              </div>
            </div>
          </div>
        </section>
        </ScrollRevealSection>

        {/* Relay race — collapsible for easier scanning */}
        <ScrollRevealSection>
        <section className="py-8 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setRelayExpanded(!relayExpanded)}
              className="w-full flex items-center justify-between gap-4 py-4 text-left"
            >
              <div>
                <h2 className="font-display text-xl font-bold text-[rgb(var(--navy))]">The home buying Relay Race</h2>
                <p className="text-sm text-slate-600 mt-1">6–7 companies must coordinate — we show you where the money goes</p>
              </div>
              {relayExpanded ? <ChevronUp className="w-5 h-5 text-slate-500 shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" />}
            </button>
            <AnimatePresence>
              {relayExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <HomebuyingRelayRaceSection />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
        </ScrollRevealSection>

        {/* Trust signals */}
        <ScrollRevealSection>
        <section className="bg-millennial-primary-light/25 py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ErrorBoundary fallback={null}>
              <TrustSignals />
            </ErrorBoundary>
          </div>
        </section>
        </ScrollRevealSection>

        {/* Final CTA */}
        <ScrollRevealSection>
        <section className="py-16 md:py-24 bg-[rgb(var(--navy))]">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-white/80 text-sm mb-4">Feel confident at the closing table</p>
            <Link
              href={ctaHref('first-time')}
              onClick={() => handlePrimaryCtaClick('landing_final_cta', 'first-time')}
              className="inline-flex items-center justify-center gap-2 bg-[rgb(var(--coral))] hover:bg-[rgb(var(--coral-hover))] text-white px-10 py-4 rounded-xl font-bold text-lg transition-colors"
            >
              Start Your Free Cost Analysis <ArrowRight size={20} />
            </Link>
            <p className="mt-6 text-white/90 text-lg">
              No one else will tell you this stuff. We will.
            </p>
          </div>
        </section>
        </ScrollRevealSection>
      </main>

      <footer className="bg-[rgb(var(--navy))] text-white/80 py-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-base">
          <p>© {new Date().getFullYear()} NestQuest. Your Home Buying Advocate.</p>

          <div className="mt-10 border-t border-white/10 pt-10">
            <p className="text-sm font-semibold text-white">Not quite ready?</p>
            <p className="mt-3 text-sm text-white/90">Get a free closing-cost checklist emailed to you</p>
            {leadSubmitted ? (
              <p className="mt-4 text-emerald-300 font-medium">Thanks! Check your inbox for the free checklist.</p>
            ) : (
              <form
                onSubmit={handleLeadSubmit}
                className="mt-4 mx-auto flex max-w-md flex-col gap-2 sm:flex-row sm:items-stretch sm:justify-center"
              >
                <input
                  type="email"
                  placeholder="Your email"
                  value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                  className="flex-1 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
                  required
                />
                <button
                  type="submit"
                  className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[rgb(var(--navy))] transition hover:bg-white/90"
                >
                  Send checklist
                </button>
              </form>
            )}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-sm text-white/85">
            {['HUD-Approved Resources', 'CFPB-Aligned Guidance', 'No affiliate kickbacks'].map((label) => (
              <span
                key={label}
                className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1"
              >
                <Check className="h-3.5 w-3.5 shrink-0 text-emerald-300" aria-hidden />
                {label}
              </span>
            ))}
          </div>

          <div className="mt-6 flex justify-center gap-6 flex-wrap">
            <Link href={ctaHref('first-time')} className="text-white hover:underline">
              Find My Savings →
            </Link>
            <Link href="/customized-journey" className="text-white hover:underline">
              Your journey
            </Link>
            <Link href="/profile" className="text-white hover:underline">
              Profile
            </Link>
            <Link href="/privacy" className="text-white/70 hover:underline">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

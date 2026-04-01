'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Check, X, EyeOff, Users, DollarSign, FileText, ChevronDown, ChevronUp, Calculator } from 'lucide-react'
import TrustSignals from '@/components/trust/TrustSignals'
import UserJourneyTracker from '@/components/analytics/UserJourneyTracker'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import HomebuyingRelayRaceSection from '@/components/HomebuyingRelayRaceSection'
import { trackActivity } from '@/lib/track-activity'
import { useExperiment } from '@/lib/hooks/useExperiment'

// Animated counter for social proof
function AnimatedCounter({ end, suffix = '', duration = 1500 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    if (!ref.current || started) return
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setStarted(true)
    }, { threshold: 0.3 })
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [started])

  useEffect(() => {
    if (!started) return
    const step = end / (duration / 16)
    let current = 0
    const timer = setInterval(() => {
      current += step
      if (current >= end) {
        setCount(end)
        clearInterval(timer)
      } else setCount(Math.floor(current))
    }, 16)
    return () => clearInterval(timer)
  }, [started, end, duration])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

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
  const authGateExperiment = useExperiment('auth_gate_v2')

  useEffect(() => {
    if (authGateExperiment.isReady) {
      authGateExperiment.track('landing_viewed')
    }
  }, [authGateExperiment.isReady, authGateExperiment.variant])

  const ctaHref = (transactionType: string) =>
    `/quiz?transactionType=${encodeURIComponent(transactionType)}`

  const quizByIcp = (icp: string) => `/quiz?type=${encodeURIComponent(icp)}`

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e8eef9] via-[#f2f6fc] to-[#f8fafc] text-[rgb(var(--text-dark))] font-sans antialiased">
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

      {/* Hero: taller background, stronger hierarchy */}
      <section className="relative flex flex-col">
        {/* Background image - 35% of viewport */}
        <div
          className="absolute top-0 left-0 right-0 h-[35vh] bg-cover bg-center z-0"
          style={{
            backgroundImage: [
              'linear-gradient(to bottom, rgba(8, 18, 43, 0.36) 0%, rgba(17, 34, 72, 0.30) 28%, rgba(17, 34, 72, 0.28) 55%, rgba(17, 34, 72, 0.40) 100%)',
              'radial-gradient(circle at 78% 12%, rgba(255, 214, 153, 0.18) 0%, rgba(255, 214, 153, 0) 36%)',
              'radial-gradient(circle at 12% 8%, rgba(245, 103, 154, 0.14) 0%, rgba(245, 103, 154, 0) 34%)',
              'radial-gradient(circle at 88% 24%, rgba(130, 170, 255, 0.12) 0%, rgba(130, 170, 255, 0) 38%)',
              'linear-gradient(160deg, rgba(20, 44, 95, 0.56) 0%, rgba(33, 67, 135, 0.46) 52%, rgba(89, 120, 190, 0.36) 100%)',
              'url(https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=2200&q=80)',
            ].join(', '),
            backgroundPosition: 'center',
            backgroundSize: 'cover',
          }}
        />
        {/* Hero title */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-6 sm:pt-10 pb-6">
          <div className="max-w-3xl">
            <h1
              className="text-[1.65rem] sm:text-[2.1rem] md:text-[2.65rem] lg:text-[3.1rem] font-bold text-white mb-3 tracking-tight leading-[1.15]"
              style={{ textShadow: '0 2px 6px rgba(0,0,0,0.45)' }}
            >
              Save $10,000–$15,000 on Your Home Purchase — Without Guessing
            </h1>
            <p className="text-[1.05rem] md:text-[1.2rem] text-slate-100/95 max-w-2xl mx-auto" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.45)' }}>
              A personalized buying guide that finds hidden funds, simplifies every step, and holds your hand from search to close.
            </p>
          </div>
        </div>

        {/* Trust badges — below hero */}
        <div className="relative z-10 px-4 pb-4">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-2">
            {[
              'HUD-Approved Resources',
              'CFPB-Aligned Guidance',
              'No Affiliate Kickbacks — Ever',
              '2,400+ Buyers Helped',
              'State Housing Authority Partner',
            ].map((label) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border border-brand-sage/30 bg-brand-mist px-3 py-1.5 text-xs font-medium text-brand-forest shadow-sm"
              >
                <Check className="h-3.5 w-3.5 shrink-0 text-brand-sage" aria-hidden />
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Primary CTA — ICP card grid */}
        <div className="relative z-20 w-full max-w-5xl mx-auto px-4 -mb-14">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl md:p-8">
            <p className="text-center text-sm font-semibold uppercase tracking-wide text-brand-sage">Start here</p>
            <h2 className="mt-1 text-center text-xl font-bold text-brand-forest md:text-2xl">Which best describes you?</h2>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {(
                [
                  { type: 'first-time' as const, icon: '🏠', title: 'First-Time Buyer', desc: "I've never owned a home before" },
                  { type: 'first-gen' as const, icon: '🌱', title: 'First in My Family', desc: 'No one in my family has done this before' },
                  { type: 'solo' as const, icon: '👩', title: 'Buying Solo', desc: "I'm purchasing on my own" },
                  { type: 'move-up' as const, icon: '🔄', title: 'I Own & Want to Upgrade', desc: 'I want to sell and buy simultaneously' },
                ] as const
              ).map((row) => (
                <Link
                  key={row.type}
                  href={quizByIcp(row.type)}
                  onClick={() => {
                    handlePrimaryCtaClick('landing_icp_grid', row.type)
                    if (row.type === 'move-up') setShowMoveUpTools(true)
                  }}
                  className="group flex flex-col rounded-xl border-2 border-slate-200 p-4 transition hover:border-brand-forest hover:bg-brand-mist/60"
                >
                  <span className="text-2xl">{row.icon}</span>
                  <span className="mt-2 text-lg font-bold text-brand-forest">{row.title}</span>
                  <span className="text-sm text-slate-600">{row.desc}</span>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-terracotta">
                    Start free assessment <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ))}
            </div>
            <p className="mt-4 text-center text-xs text-slate-500">About 90 seconds · No credit pull</p>
          </div>
        </div>
      </section>

      <main>
        <section className="border-b border-slate-200 bg-brand-mist/50 py-12 md:py-14">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 md:grid-cols-2 md:px-6 lg:px-8">
            <div className="rounded-2xl border border-brand-sage/25 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-brand-sage">Budget preview</p>
              <p className="mt-2 text-2xl font-bold text-brand-forest">Your estimated monthly payment: ~$2,450</p>
              <p className="mt-2 text-sm text-slate-600">
                Example for a typical loan — your journey page breaks down mortgage, taxes, insurance, and more.
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
              <Link
                href="/down-payment-optimizer"
                className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-brand-terracotta hover:underline"
              >
                Find My Hidden Funds →
              </Link>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-white py-12">
          <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8">
            <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-brand-sage">Move-up buyers</p>
                <h2 className="text-2xl font-bold text-brand-forest">Estimate equity before you list</h2>
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

        {/* PROBLEM SECTION: The Uncomfortable Truth */}
        <section className="relative pt-16 pb-12 md:pt-20 md:pb-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1e293b] mb-3 text-center">
              Let&apos;s Face It: The Homebuying Process Is Very Complicated
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
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-gradient-to-br from-sky-50/80 to-[#f8fafc] rounded-2xl p-6 border border-sky-200/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-sky-500/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-sky-700" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1e293b]">Title & Others</h3>
                </div>
                <div className="text-2xl font-bold text-sky-700 mb-2">$1,000–$2,000+</div>
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

        {/* SOLUTION SECTION: Our Promise */}
        <section className="py-16 md:py-24 bg-[#f8f9fa]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1e293b] mb-6 text-center">
              We&apos;re Different. We&apos;re On Your Side.
            </h2>
            <p className="text-lg text-[#475569] mb-6 text-center max-w-2xl mx-auto">
              Feel confident at the closing table. Know exactly what you can negotiate. Your home, your numbers.
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3 text-[#1e293b] font-medium text-lg">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" aria-hidden />
                Show you the REAL cost breakdown before you shop
              </li>
              <li className="flex items-start gap-3 text-[#1e293b] font-medium text-lg">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" aria-hidden />
                Expose every fee, hidden cost, and markup
              </li>
              <li className="flex items-start gap-3 text-[#1e293b] font-medium text-lg">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" aria-hidden />
                Tell you exactly what&apos;s negotiable (hint: most of it)
              </li>
              <li className="flex items-start gap-3 text-[#1e293b] font-medium text-lg">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" aria-hidden />
                Calculate how much you can save with our strategies
              </li>
              <li className="flex items-start gap-3 text-[#1e293b] font-medium text-lg">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" aria-hidden />
                Give you scripts to negotiate with confidence
              </li>
              <li className="flex items-start gap-3 text-[#1e293b] font-medium text-lg">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" aria-hidden />
                Walk through every step of the process with you
              </li>
              <li className="flex items-start gap-3 text-[#1e293b] font-medium text-lg">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" aria-hidden />
                Help you make even small decisions
              </li>
            </ul>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="py-16 md:py-24 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-sm font-medium text-slate-600 mb-2 text-center">Most people discover hidden costs too late. Get ahead.</p>
            <h2 className="text-2xl md:text-3xl font-bold text-[#1e293b] mb-6 text-center">
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

        {/* CTA SECTION — with outcome-based upgrade prompts & email capture */}
        <section className="py-16 md:py-24 bg-[#f8f9fa]">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm font-medium text-amber-600 mb-2">Rates change weekly — get ahead before your next pre-approval</p>
            <h2 className="text-2xl md:text-3xl font-bold text-[#1e293b] mb-6">
              Ready to Stop Overpaying?
            </h2>
            <Link
              href={ctaHref('first-time')}
              onClick={() => handlePrimaryCtaClick('landing_mid_page_cta', 'first-time')}
              className="inline-flex items-center justify-center gap-2 bg-[rgb(var(--coral))] hover:bg-[rgb(var(--coral-hover))] text-white px-10 py-4 rounded-xl font-bold text-lg transition-colors"
            >
              Start Free Assessment <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="mt-6 text-[#1e293b] font-semibold text-lg">
              Join <AnimatedCounter end={12847} /> buyers who&apos;ve saved an average of $<AnimatedCounter end={11400} />
            </p>
            <p className="mt-4 text-[#64748b] text-sm max-w-md mx-auto">
              100% free. No credit card. We make money from optional premium features, never from commissions or kickbacks.
            </p>

            {/* Lead magnet — email capture for not-ready visitors */}
            <div className="mt-10 pt-10 border-t border-slate-200">
              <p className="text-sm text-slate-600 mb-3">Not ready for the full assessment?</p>
              {leadSubmitted ? (
                <p className="text-emerald-600 font-medium">Thanks! Check your inbox for the free checklist.</p>
              ) : (
                <form onSubmit={handleLeadSubmit} className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto justify-center">
                  <input
                    type="email"
                    placeholder="Email for free closing-cost checklist"
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[rgb(var(--navy))]/20 focus:border-[rgb(var(--navy))] outline-none"
                    required
                  />
                  <button type="submit" className="px-5 py-3 rounded-xl bg-slate-800 text-white text-sm font-semibold hover:bg-slate-700 transition-colors">
                    Get checklist
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* SOCIAL PROOF - Testimonials */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="mb-10 text-center text-2xl font-bold text-brand-forest">Real buyers. Real savings.</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="rounded-2xl border border-slate-200 bg-brand-mist/40 p-6">
                <p className="text-[#475569] text-base mb-4">
                  &quot;I thought I needed 20% down. The Compass found $11,400 in programs I qualified for in my county. We closed in 8 weeks.&quot;
                </p>
                <p className="font-bold text-[#1e293b]">James &amp; Priya T., Austin TX</p>
                <span className="mt-2 inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                  Saved $11,400
                </span>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-brand-mist/40 p-6">
                <p className="text-[#475569] text-base mb-4">
                  &quot;I was the first in my family to buy. I had no idea where to start. This platform walked me through every single step and found $9,200 in grants.&quot;
                </p>
                <p className="font-bold text-[#1e293b]">Maria C., Phoenix AZ</p>
                <span className="mt-2 inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                  Saved $9,200
                </span>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-brand-mist/40 p-6">
                <p className="text-[#475569] text-base mb-4">
                  &quot;Buying alone felt overwhelming. The Compass gave me a clear action plan and negotiation scripts. I saved $13,100 and never felt lost.&quot;
                </p>
                <p className="font-bold text-[#1e293b]">Danielle R., Atlanta GA</p>
                <span className="mt-2 inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                  Saved $13,100
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Relay race — collapsible for easier scanning */}
        <section className="py-8 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setRelayExpanded(!relayExpanded)}
              className="w-full flex items-center justify-between gap-4 py-4 text-left"
            >
              <div>
                <h2 className="text-xl font-bold text-[rgb(var(--navy))]">The Homebuying Relay Race</h2>
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

        {/* Trust signals */}
        <section className="py-16 md:py-24 bg-[rgb(var(--sky-light))]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ErrorBoundary fallback={null}>
              <TrustSignals />
            </ErrorBoundary>
          </div>
        </section>

        {/* Final CTA */}
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
      </main>

      <footer className="bg-[rgb(var(--navy))] text-white/80 py-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-base">
          <p>© {new Date().getFullYear()} NestQuest. Your guide to homeownership.</p>
          <div className="mt-4 flex justify-center gap-6 flex-wrap">
            <Link href="/quiz?transactionType=first-time" className="text-white hover:underline">Get started</Link>
            <Link href="/customized-journey" className="text-white hover:underline">Your journey</Link>
            <Link href="/profile" className="text-white hover:underline">Profile</Link>
            <Link href="/privacy" className="text-white/70 hover:underline">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

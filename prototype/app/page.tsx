'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Check, X, EyeOff, Zap, Shield, Crown, Users, DollarSign, FileText, ChevronDown, ChevronUp } from 'lucide-react'
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
  const authGateExperiment = useExperiment('auth_gate_v2')

  useEffect(() => {
    if (authGateExperiment.isReady) {
      authGateExperiment.track('landing_viewed')
    }
  }, [authGateExperiment.isReady, authGateExperiment.variant])

  const ctaHref = (transactionType: string) =>
    `/quiz?transactionType=${encodeURIComponent(transactionType)}`

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
                <Link href="/upgrade" className="hidden sm:inline text-sm font-medium text-white/90 hover:text-white underline underline-offset-2">See plans</Link>
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
        {/* Trust strip — visible early */}
        <div className="relative z-10 pt-4 px-4 flex justify-center">
          <p
            className="text-xs sm:text-sm text-white font-medium flex flex-wrap items-center justify-center gap-x-4 gap-y-1 px-3 py-1.5 rounded-full bg-slate-900/35 border border-white/15 backdrop-blur-sm"
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.45)' }}
          >
            <span>✓ No commissions</span>
            <span>✓ No kickbacks</span>
            <span>✓ 100% free to start</span>
          </p>
        </div>
        {/* Hero title + hierarchy: number first, then subhead */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-4 sm:pt-8 pb-4">
          <div className="max-w-3xl">
            <p className="text-lg sm:text-xl font-semibold text-white/95 mb-2" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
              How much could you <span className="inline-block text-3xl sm:text-4xl font-extrabold text-rose-300 leading-none">overpay</span> at closing?
            </p>
            <h1 className="text-[1.75rem] sm:text-[2.25rem] md:text-[2.75rem] lg:text-[3.25rem] font-bold text-white mb-2 tracking-tight leading-[1.15]" style={{ textShadow: '0 2px 6px rgba(0,0,0,0.45)' }}>
              First-time buyers overpay <span className="text-[rgb(var(--coral))]">$15,000</span> on average
            </h1>
            <p className="text-[1.1rem] md:text-[1.25rem] text-slate-100/95 max-w-xl mx-auto" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.45)' }}>
              Not because they&apos;re dumb. Because no one shows them the hidden costs.
            </p>
          </div>
        </div>

        {/* Overlay card */}
        <div className="relative z-20 w-full max-w-4xl mx-auto px-4 -mb-14">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8 text-base md:text-lg">
            <div className="mb-5 text-center">
              <h2 className="text-xl sm:text-2xl font-black text-[#1e293b] tracking-tight">
                Find out what most buyers discover <span className="text-[rgb(var(--coral))]">only after it&apos;s too late</span>
              </h2>
              <p className="mt-1 text-sm text-slate-500">90 seconds. No credit pull. No commitment.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-3 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">I&apos;m a</label>
                <select
                  value={heroForm.type}
                  onChange={(e) => setHeroForm((p) => ({ ...p, type: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="first-time">First-time buyer</option>
                  <option value="repeat-buyer">Repeat buyer</option>
                  <option value="refinance">Refinancing</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">How prepared are you?</label>
                <select
                  value={heroForm.preparedness}
                  onChange={(e) => setHeroForm((p) => ({ ...p, preparedness: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="learning">Just starting to learn</option>
                  <option value="basics">Know the basics</option>
                  <option value="confident">Pretty confident</option>
                  <option value="ready">Ready to move</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">When do you want to buy?</label>
                <select
                  value={heroForm.when}
                  onChange={(e) => setHeroForm((p) => ({ ...p, when: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="3-months">Within 3 months</option>
                  <option value="6-months">Within 6 months</option>
                  <option value="1-year">Within 1 year</option>
                  <option value="exploring">Just exploring</option>
                </select>
              </div>
              <div>
                <Link
                  href={`${ctaHref(heroForm.type)}&preparedness=${encodeURIComponent(heroForm.preparedness)}&timeline=${encodeURIComponent(heroForm.when)}`}
                  onClick={() => handlePrimaryCtaClick('landing_hero_form_cta', heroForm.type)}
                  className="flex items-center justify-center gap-2 w-full bg-[rgb(var(--coral))] hover:bg-[rgb(var(--coral-hover))] text-white text-center font-bold py-3.5 px-6 rounded-xl transition-colors"
                >
                  See How Much You Can Save <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-500 text-center">~90 seconds to your personalized report</p>
          </div>

          {/* Tier value strip — surface upgrade path */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/quiz"
              className="block bg-white/95 rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow text-center"
            >
              <span className="text-sm font-semibold text-[#1e293b]">Starter (Free)</span>
              <p className="text-xs text-slate-600 mt-1">See your numbers & cost breakdown</p>
            </Link>
            <Link
              href="/upgrade?tier=momentum"
              onClick={() => trackActivity('tool_used', { tool: 'landing_tier_strip', tier: 'momentum' })}
              className="block bg-white/95 rounded-xl p-4 border-2 border-[rgb(var(--coral))]/30 shadow-sm hover:shadow-md transition-all text-center"
            >
              <div className="flex items-center justify-center gap-1">
                <Zap className="w-4 h-4 text-[#06b6d4]" />
                <span className="text-sm font-semibold text-[#1e293b]">Guided $29</span>
              </div>
              <p className="text-xs text-slate-600 mt-1">Avoid costly mistakes with action plan</p>
            </Link>
            <Link
              href="/upgrade?tier=navigator"
              onClick={() => trackActivity('tool_used', { tool: 'landing_tier_strip', tier: 'navigator' })}
              className="block bg-white/95 rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow text-center"
            >
              <div className="flex items-center justify-center gap-1">
                <Shield className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-semibold text-[#1e293b]">Concierge $149</span>
              </div>
              <p className="text-xs text-slate-600 mt-1">Maximize savings with expert tools</p>
            </Link>
          </div>
        </div>
      </section>

      <main>
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

            {/* Outcome-based upgrade prompts */}
            <div className="mt-10 grid sm:grid-cols-3 gap-4 text-left">
              <Link href="/upgrade?tier=momentum" className="block p-4 rounded-xl bg-white border border-slate-200 hover:border-[rgb(var(--coral))]/40 hover:shadow-md transition-all" onClick={() => trackActivity('tool_used', { tool: 'landing_upgrade_prompt', tier: 'momentum', prompt: 'action_plan' })}>
                <span className="text-xs font-semibold text-slate-500 uppercase">Unlock for $29</span>
                <p className="mt-1 font-semibold text-[#1e293b]">Your step-by-step action plan</p>
              </Link>
              <Link href="/upgrade?tier=momentum" className="block p-4 rounded-xl bg-white border border-slate-200 hover:border-[rgb(var(--coral))]/40 hover:shadow-md transition-all" onClick={() => trackActivity('tool_used', { tool: 'landing_upgrade_prompt', tier: 'momentum', prompt: 'negotiation' })}>
                <span className="text-xs font-semibold text-slate-500 uppercase">Unlock for $29</span>
                <p className="mt-1 font-semibold text-[#1e293b]">See exactly what to negotiate at closing</p>
              </Link>
              <Link href="/upgrade?tier=navigator" className="block p-4 rounded-xl bg-white border border-slate-200 hover:border-amber-400/50 hover:shadow-md transition-all" onClick={() => trackActivity('tool_used', { tool: 'landing_upgrade_prompt', tier: 'navigator', prompt: 'expert' })}>
                <span className="text-xs font-semibold text-slate-500 uppercase">Unlock for $149</span>
                <p className="mt-1 font-semibold text-[#1e293b]">1:1 expert help to avoid overpaying</p>
              </Link>
            </div>

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
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-[#f8fafc] rounded-2xl p-6 border border-slate-100">
                <p className="text-[#475569] text-base mb-4">&quot;This tool showed me I could negotiate $2,800 in closing costs. My agent never mentioned it!&quot;</p>
                <p className="text-[#1e293b] font-bold">Sarah M.</p>
                <p className="text-emerald-600 font-semibold">Saved $2,800</p>
              </div>
              <div className="bg-[#f8fafc] rounded-2xl p-6 border border-slate-100">
                <p className="text-[#475569] text-base mb-4">&quot;I almost used my agent&apos;s &apos;preferred lender&apos; until I saw the rate comparison. Saved $18K over the loan.&quot;</p>
                <p className="text-[#1e293b] font-bold">Marcus T.</p>
                <p className="text-emerald-600 font-semibold">Saved $18,000</p>
              </div>
              <div className="bg-[#f8fafc] rounded-2xl p-6 border border-slate-100">
                <p className="text-[#475569] text-base mb-4">&quot;The hidden cost breakdown was shocking. Changed my entire budget.&quot;</p>
                <p className="text-[#1e293b] font-bold">Jennifer K.</p>
                <p className="text-emerald-600 font-semibold">Avoided disaster</p>
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
            <Link href="/upgrade" className="mt-4 inline-block text-white/70 hover:text-white text-sm underline underline-offset-2" onClick={() => trackActivity('tool_used', { tool: 'landing_final_upgrade_link' })}>
              See premium plans from $29 →
            </Link>
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

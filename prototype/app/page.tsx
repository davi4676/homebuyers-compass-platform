'use client'

import { useState, useEffect, useRef, Fragment } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useInView } from 'framer-motion'
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
  Sparkles,
  Lock,
  MapPin,
  TrendingUp,
  Zap,
  Heart,
  Target,
  Clock,
} from 'lucide-react'
import CountUpNumber from '@/components/CountUpNumber'
import ScrollRevealSection from '@/components/ScrollRevealSection'
import TrustSignals from '@/components/trust/TrustSignals'
import UserJourneyTracker from '@/components/analytics/UserJourneyTracker'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { trackActivity } from '@/lib/track-activity'
import { useExperiment } from '@/lib/hooks/useExperiment'
import { SIGNUP_DISABLED } from '@/lib/auth-flags'
import { REFERRED_BY_LS_KEY } from '@/lib/referral-program'

const FADE_UP = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }
const STAGGER = { visible: { transition: { staggerChildren: 0.1 } } }

export default function LandingPage() {
  const [promoDismissed, setPromoDismissed] = useState(true)
  const [leadEmail, setLeadEmail] = useState('')
  const [leadSubmitted, setLeadSubmitted] = useState(false)
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
    } catch { /* ignore */ }
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

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!leadEmail.trim()) return
    trackActivity('tool_used', { tool: 'landing_lead_magnet', email_length: leadEmail.length })
    setLeadSubmitted(true)
  }

  const priceHref = homePrice.trim()
    ? authSignupThenPath(`/quiz?type=first-time&homePrice=${encodeURIComponent(homePrice.replace(/[^0-9]/g, ''))}`)
    : ctaHref('first-time')

  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      <UserJourneyTracker />

      {/* ── Referral banner ── */}
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

      {/* ════════════════════════════════════════════
          HERO — Full-width, emotion-first, one CTA
         ════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative isolate overflow-hidden bg-gradient-to-b from-[#f8faf9] via-white to-white"
      >
        {/* Subtle grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          aria-hidden
          style={{
            backgroundImage: `
              linear-gradient(to right, #1B4332 1px, transparent 1px),
              linear-gradient(to bottom, #1B4332 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
          }}
        />
        {/* Radial glow */}
        <div
          className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 opacity-30"
          aria-hidden
          style={{
            width: '900px',
            height: '500px',
            background: 'radial-gradient(ellipse at center, rgba(45,106,79,0.12) 0%, transparent 70%)',
          }}
        />

        <div className="relative mx-auto max-w-4xl px-5 pb-16 pt-12 text-center sm:pb-20 sm:pt-16 md:pb-24 md:pt-20">
          {/* Trust chip */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50/80 px-4 py-1.5 text-sm font-semibold text-emerald-800 backdrop-blur-sm"
          >
            <Shield className="h-3.5 w-3.5" />
            Trusted by 6,300+ first-time buyers
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mx-auto max-w-3xl font-display text-[2rem] font-extrabold leading-[1.15] tracking-tight text-slate-900 sm:text-[2.75rem] md:text-[3.25rem] lg:text-[3.5rem]"
          >
            Stop overpaying for{' '}
            <span className="bg-gradient-to-r from-brand-forest to-emerald-600 bg-clip-text text-transparent">
              your first home
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl md:mt-6 md:text-[1.35rem]"
          >
            We find the grants, programs, and negotiation tactics that save first-time buyers{' '}
            <strong className="font-bold text-slate-800">$10,000–$15,000</strong>. Everyone else profits off your
            confusion — we&apos;re on your side.
          </motion.p>

          {/* ── Inline price input — creates investment ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mx-auto mt-10 max-w-md"
          >
            <label className="mb-2 block text-sm font-medium text-slate-500">
              What&apos;s your target home price?
            </label>
            <div className="flex items-stretch gap-3">
              <div className="relative flex-1">
                <DollarSign className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="350,000"
                  value={homePrice}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, '')
                    setHomePrice(raw ? Number(raw).toLocaleString('en-US') : '')
                  }}
                  className="h-14 w-full rounded-xl border-2 border-slate-200 bg-white pl-10 pr-4 text-lg font-semibold text-slate-800 shadow-sm transition-all placeholder:text-slate-300 focus:border-brand-forest focus:outline-none focus:ring-4 focus:ring-brand-forest/10"
                />
              </div>
              <Link
                href={priceHref}
                onClick={() => handlePrimaryCtaClick('landing_hero_price_input', 'first-time')}
                className="flex h-14 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-brand-forest px-6 text-base font-bold text-white shadow-lg shadow-brand-forest/20 transition-all hover:bg-brand-forest/90 hover:shadow-xl hover:shadow-brand-forest/25 sm:px-8"
              >
                See my savings
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-sm text-slate-500">
              <Lock className="h-3.5 w-3.5" />
              Free · No credit check · 90 seconds
            </p>
          </motion.div>

          {/* ── Social proof row ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mx-auto mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-500"
          >
            <span className="flex items-center gap-1.5">
              <span className="flex -space-x-2">
                {['bg-brand-forest', 'bg-amber-600', 'bg-rose-500', 'bg-teal-600'].map((bg, i) => (
                  <span
                    key={i}
                    className={`flex h-7 w-7 items-center justify-center rounded-full ${bg} text-xs font-bold text-white ring-2 ring-white`}
                  >
                    {['JP', 'MC', 'DR', 'AK'][i]}
                  </span>
                ))}
              </span>
              <strong className="ml-1 font-semibold text-slate-700">6,303</strong> buyers saved
            </span>
            <span className="hidden h-4 w-px bg-slate-300 sm:block" />
            <span className="flex items-center gap-1.5">
              <DollarSign className="h-4 w-4 text-emerald-500" />
              Avg. <strong className="font-semibold text-slate-700">$5,593</strong> saved per buyer
            </span>
            <span className="hidden h-4 w-px bg-slate-300 sm:block" />
            <span className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              ))}
              <span className="ml-0.5 font-semibold text-slate-700">4.9</span>
            </span>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          LOGOS / AUTHORITY BAR
         ════════════════════════════════════════════ */}
      <div className="border-y border-slate-100 bg-slate-50/60 py-5">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 text-sm font-medium text-slate-400">
          {['HUD-Approved Resources', 'CFPB-Aligned', '2,000+ Grant Programs', 'Zero Conflicts of Interest'].map(
            (label) => (
              <span key={label} className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                {label}
              </span>
            )
          )}
        </div>
      </div>

      <main>
        {/* ════════════════════════════════════════════
            SECTION 1 — What We Find For You (value)
           ════════════════════════════════════════════ */}
        <ScrollRevealSection>
          <section className="bg-white py-20 md:py-28">
            <div className="mx-auto max-w-6xl px-5 sm:px-8">
              <div className="mb-14 text-center">
                <p className="text-sm font-bold uppercase tracking-widest text-brand-sage">How it works</p>
                <h2 className="mx-auto mt-2 max-w-2xl font-display text-[1.75rem] font-bold leading-tight tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
                  Take a 90-second assessment. We&apos;ll show you the money.
                </h2>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {([
                  {
                    step: '01',
                    Icon: Target,
                    title: 'Your real affordability',
                    desc: 'Not what banks approve you for (they approve too much). What you can actually comfortably pay — every fee included.',
                    accent: 'from-emerald-500/10 to-teal-500/10',
                    iconBg: 'bg-emerald-100 text-emerald-700',
                  },
                  {
                    step: '02',
                    Icon: DollarSign,
                    title: 'Hidden savings & grants',
                    desc: 'We scan 2,000+ federal, state, and local programs. The average buyer qualifies for $8,200 in grants they never knew about.',
                    accent: 'from-amber-500/10 to-orange-500/10',
                    iconBg: 'bg-amber-100 text-amber-700',
                  },
                  {
                    step: '03',
                    Icon: MessageSquare,
                    title: 'Negotiation playbooks',
                    desc: 'Know exactly what to say to agents, lenders, and sellers. Scripts and strategies backed by data from 50,000+ purchases.',
                    accent: 'from-rose-500/10 to-pink-500/10',
                    iconBg: 'bg-rose-100 text-rose-700',
                  },
                ] as const).map((card) => {
                  const I = card.Icon
                  return (
                    <div
                      key={card.step}
                      className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-7 shadow-sm transition-all duration-300 hover:border-slate-300 hover:shadow-md sm:p-8"
                    >
                      <div
                        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${card.accent} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                      />
                      <div className="relative">
                        <span className="text-xs font-bold tracking-widest text-slate-300">{card.step}</span>
                        <div className={`mt-4 flex h-12 w-12 items-center justify-center rounded-xl ${card.iconBg}`}>
                          <I className="h-6 w-6" />
                        </div>
                        <h3 className="mt-5 text-lg font-bold text-slate-900">{card.title}</h3>
                        <p className="mt-2.5 text-[15px] leading-relaxed text-slate-600">{card.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-10 text-center">
                <p className="text-[11px] leading-snug text-slate-400">
                  &quot;Average&quot; and program counts reflect NestQuest prototype modeling — not audited market statistics.
                </p>
              </div>
            </div>
          </section>
        </ScrollRevealSection>

        {/* ════════════════════════════════════════════
            SECTION 2 — The Problem (emotional punch)
           ════════════════════════════════════════════ */}
        <ScrollRevealSection>
          <section className="bg-slate-50 py-20 md:py-28">
            <div className="mx-auto max-w-5xl px-5 sm:px-8">
              <div className="mb-14 text-center">
                <p className="text-sm font-bold uppercase tracking-widest text-rose-400">The uncomfortable truth</p>
                <h2 className="mx-auto mt-2 max-w-2xl font-display text-[1.75rem] font-bold leading-tight tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
                  Everyone makes money off your home purchase. Except you.
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-base text-slate-600">
                  6–7 companies must coordinate on your deal. Each one takes a cut — and no one tells you until closing day.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                {([
                  {
                    who: 'Real Estate Agents',
                    amount: '$7,500–$12,000',
                    note: '2.5–3% commission on your purchase',
                    hidden: 'Bonuses from preferred lenders',
                    color: 'border-l-amber-400',
                  },
                  {
                    who: 'Mortgage Lenders',
                    amount: '$1,500–$3,000+',
                    note: 'Origination fees, inflated closing costs',
                    hidden: 'Yield spread premiums',
                    color: 'border-l-rose-400',
                  },
                  {
                    who: 'Title & Others',
                    amount: '$1,000–$2,000+',
                    note: 'Title insurance, junk fees you can shop',
                    hidden: 'Kickbacks between providers',
                    color: 'border-l-purple-400',
                  },
                ] as const).map((row) => (
                  <div
                    key={row.who}
                    className={`rounded-xl border border-slate-200 border-l-4 ${row.color} bg-white p-6 shadow-sm`}
                  >
                    <p className="text-sm font-bold uppercase tracking-wide text-slate-400">{row.who}</p>
                    <p className="mt-2 text-2xl font-extrabold text-slate-900">{row.amount}</p>
                    <p className="mt-1.5 text-sm text-slate-600">{row.note}</p>
                    <div className="mt-4 flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm">
                      <EyeOff className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <span className="text-slate-600">
                        <strong className="text-slate-800">Hidden:</strong> {row.hidden}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-10 text-center text-lg font-black uppercase tracking-wide text-rose-500">
                And no one tells you any of this until closing day.
              </p>
              <p className="mt-2 text-center text-base font-semibold text-slate-800">
                It&apos;s time for someone to be on your side.
              </p>
            </div>
          </section>
        </ScrollRevealSection>

        {/* ════════════════════════════════════════════
            SECTION 3 — Social Proof (testimonials)
           ════════════════════════════════════════════ */}
        <ScrollRevealSection>
          <section className="bg-white py-20 md:py-28">
            <div className="mx-auto max-w-6xl px-5 sm:px-8">
              <div className="mb-14 text-center">
                <h2 className="font-display text-[1.75rem] font-bold tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
                  Real buyers. Real savings.
                </h2>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {([
                  {
                    initials: 'JP',
                    bg: 'bg-brand-forest',
                    name: 'James & Priya T.',
                    loc: 'Austin, TX',
                    saved: '$11,400',
                    quote:
                      'I thought I needed 20% down. The Compass found $11,400 in programs I qualified for in my county. We closed in 8 weeks.',
                  },
                  {
                    initials: 'MC',
                    bg: 'bg-amber-600',
                    name: 'Maria C.',
                    loc: 'Phoenix, AZ',
                    saved: '$9,200',
                    quote:
                      'I was the first in my family to buy. I had no idea where to start. This platform walked me through every single step and found $9,200 in grants.',
                  },
                  {
                    initials: 'DR',
                    bg: 'bg-rose-500',
                    name: 'Danielle R.',
                    loc: 'Atlanta, GA',
                    saved: '$13,100',
                    quote:
                      'Buying alone felt overwhelming. The Compass gave me a clear action plan and negotiation scripts. I saved $13,100 and never felt lost.',
                  },
                ] as const).map((t) => (
                  <div
                    key={t.initials}
                    className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-7"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${t.bg} text-sm font-bold text-white`}
                      >
                        {t.initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900">{t.name}</p>
                        <p className="text-xs text-slate-500">{t.loc}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-0.5" aria-label="5 out of 5 stars">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="mt-4 flex-1 text-[15px] leading-relaxed text-slate-600">
                      &quot;{t.quote}&quot;
                    </p>
                    <div className="mt-5 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                        <BadgeCheck className="h-3.5 w-3.5" /> Verified Buyer
                      </span>
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                        Saved {t.saved}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </ScrollRevealSection>

        {/* ════════════════════════════════════════════
            SECTION 4 — Choose Your Path (ICP selector)
           ════════════════════════════════════════════ */}
        <ScrollRevealSection>
          <section className="bg-gradient-to-b from-slate-50 to-white py-20 md:py-28">
            <div className="mx-auto max-w-5xl px-5 sm:px-8">
              <div className="mb-12 text-center">
                <p className="text-sm font-bold uppercase tracking-widest text-brand-sage">Start your journey</p>
                <h2 className="mt-2 font-display text-[1.75rem] font-bold tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
                  Which sounds like you?
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {([
                  {
                    type: 'first-time' as const,
                    Icon: Home,
                    title: "It's my first time",
                    desc: "I've never owned a home before — guide me from zero.",
                    featured: true,
                  },
                  {
                    type: 'first-gen' as const,
                    Icon: Users,
                    title: 'First in my family',
                    desc: 'No one in my family has done this. Walk me through every step.',
                    featured: false,
                  },
                  {
                    type: 'solo' as const,
                    Icon: User,
                    title: "I'm buying solo",
                    desc: "Doing this alone and want someone in my corner.",
                    featured: false,
                  },
                ] as const).map((row) => {
                  const I = row.Icon
                  return (
                    <Link
                      key={row.type}
                      href={quizByIcp(row.type)}
                      onClick={() => handlePrimaryCtaClick('landing_icp_grid', row.type)}
                      className={`group relative flex flex-col overflow-hidden rounded-2xl border-2 p-6 transition-all duration-200 hover:shadow-lg sm:p-7 ${
                        row.featured
                          ? 'border-brand-forest bg-brand-forest/[0.03] shadow-md hover:border-brand-forest'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      {row.featured && (
                        <span className="absolute right-4 top-4 rounded-full bg-brand-forest px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                          Most popular
                        </span>
                      )}
                      <I
                        className={`h-8 w-8 ${row.featured ? 'text-brand-forest' : 'text-slate-400'}`}
                        strokeWidth={1.5}
                      />
                      <h3 className="mt-4 text-lg font-bold text-slate-900">{row.title}</h3>
                      <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-500">{row.desc}</p>
                      <span className="mt-5 flex items-center gap-1 text-sm font-bold text-brand-forest transition-transform duration-200 group-hover:translate-x-1">
                        Start my assessment <ArrowRight className="h-4 w-4" />
                      </span>
                    </Link>
                  )
                })}
              </div>

              <AnimatePresence>
                {showMoreIcp && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      {([
                        {
                          type: 'move-up' as const,
                          Icon: ArrowUpCircle,
                          title: 'I own & want to upgrade',
                          desc: 'Sell and buy simultaneously. Maximize your equity for the next step.',
                        },
                        {
                          type: 'refinance' as const,
                          Icon: RefreshCw,
                          title: 'Refinancing',
                          desc: 'Lower your rate, cash out, or change loan terms.',
                        },
                      ] as const).map((row) => {
                        const I = row.Icon
                        return (
                          <Link
                            key={row.type}
                            href={quizByIcp(row.type)}
                            onClick={() => handlePrimaryCtaClick('landing_icp_grid', row.type)}
                            className="group flex flex-col rounded-2xl border-2 border-slate-200 bg-white p-6 transition-all duration-200 hover:border-slate-300 hover:shadow-lg sm:p-7"
                          >
                            <I className="h-8 w-8 text-slate-400" strokeWidth={1.5} />
                            <h3 className="mt-4 text-lg font-bold text-slate-900">{row.title}</h3>
                            <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-500">{row.desc}</p>
                            <span className="mt-5 flex items-center gap-1 text-sm font-bold text-brand-forest transition-transform duration-200 group-hover:translate-x-1">
                              Start my assessment <ArrowRight className="h-4 w-4" />
                            </span>
                          </Link>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setShowMoreIcp((v) => !v)}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-700"
                >
                  {showMoreIcp ? (
                    <>
                      Show less <ChevronUp className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Already own a home? <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </button>
                <p className="mt-3 text-xs text-slate-400">About 90 seconds · No credit pull</p>
              </div>
            </div>
          </section>
        </ScrollRevealSection>

        {/* ════════════════════════════════════════════
            SECTION 5 — Why NestQuest (differentiators)
           ════════════════════════════════════════════ */}
        <ScrollRevealSection>
          <section className="bg-white py-20 md:py-28">
            <div className="mx-auto max-w-6xl px-5 sm:px-8">
              <div className="mb-14 text-center">
                <h2 className="font-display text-[1.75rem] font-bold tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
                  We&apos;re different. We&apos;re on your side.
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-base text-slate-600">
                  Feel confident at the closing table. Know exactly what you can negotiate.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {([
                  {
                    Icon: Shield,
                    title: 'Zero Conflicts of Interest',
                    desc: 'We never take commissions or referral fees from lenders, agents, or title companies.',
                  },
                  {
                    Icon: Award,
                    title: 'Government-Backed Guidance',
                    desc: 'Resources aligned with HUD and CFPB standards for homebuyer education.',
                  },
                  {
                    Icon: SlidersHorizontal,
                    title: 'Built Around You',
                    desc: 'Your journey, budget, and goals shape every recommendation we make.',
                  },
                  {
                    Icon: Database,
                    title: 'The Largest DPA Database',
                    desc: '2,000+ federal, state, and local programs to find money you didn\u2019t know existed.',
                  },
                  {
                    Icon: ListChecks,
                    title: 'A Clear Path, Every Step',
                    desc: 'From pre-approval to closing, you always know exactly what to do next.',
                  },
                  {
                    Icon: MessageSquare,
                    title: 'Words That Save You Money',
                    desc: 'Negotiation scripts to protect your interests with agents, lenders, and sellers.',
                  },
                ] as const).map(({ Icon, title, desc }) => (
                  <div key={title} className="flex gap-4 rounded-xl border border-slate-100 bg-white p-5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-brand-forest">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-[15px] font-bold text-slate-900">{title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-slate-500">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </ScrollRevealSection>

        {/* ════════════════════════════════════════════
            SECTION 6 — Final CTA (savings counter)
           ════════════════════════════════════════════ */}
        <section className="relative isolate overflow-hidden bg-brand-forest py-20 md:py-28">
          <div
            className="pointer-events-none absolute inset-0 opacity-10"
            aria-hidden
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
          <div className="relative mx-auto max-w-2xl px-5 text-center sm:px-8">
            <h2 className="font-display text-[1.75rem] font-bold leading-tight text-white sm:text-3xl md:text-4xl">
              Ready to stop overpaying?
            </h2>
            <div className="mt-8">
              <CountUpNumber
                end={5593}
                prefix="$"
                duration={1800}
                startOnMount={false}
                className="text-5xl font-extrabold text-white/95 font-display md:text-6xl"
              />
              <p className="mt-2 text-base font-medium text-white/70">average saved per buyer</p>
            </div>
            <Link
              href={ctaHref('first-time')}
              onClick={() => handlePrimaryCtaClick('landing_final_cta', 'first-time')}
              className="mt-10 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-10 py-4 text-lg font-bold text-brand-forest shadow-xl transition-all hover:bg-white/95 hover:shadow-2xl"
            >
              Find My Savings <ArrowRight className="h-5 w-5" />
            </Link>
            <p className="mt-5 text-sm text-white/60">100% free. No credit card. No spam.</p>
          </div>
        </section>

        {/* ── Trust signals ── */}
        <ScrollRevealSection>
          <section className="bg-slate-50 py-16 md:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <ErrorBoundary fallback={null}>
                <TrustSignals />
              </ErrorBoundary>
            </div>
          </section>
        </ScrollRevealSection>
      </main>

      {/* ════════════════════════════════════════════
          FOOTER
         ════════════════════════════════════════════ */}
      <footer className="border-t border-slate-800 bg-[rgb(var(--navy))] py-12 text-white/80">
        <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
          <div className="border-b border-white/10 pb-10">
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
                  className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-[rgb(var(--navy))] transition hover:bg-white/90"
                >
                  Send checklist
                </button>
              </form>
            )}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-sm text-white/60">
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
              Find My Savings
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
          </div>

          <p className="mt-8 text-sm text-white/40">
            &copy; {new Date().getFullYear()} NestQuest. Your Homebuying Advocate.
          </p>
        </div>
      </footer>

      {/* ════════════════════════════════════════════
          STICKY MOBILE CTA
         ════════════════════════════════════════════ */}
      <AnimatePresence>
        {stickyVisible && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/80 bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-lg md:hidden"
          >
            <Link
              href={ctaHref('first-time')}
              onClick={() => handlePrimaryCtaClick('landing_sticky_mobile', 'first-time')}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-forest text-base font-bold text-white shadow-lg shadow-brand-forest/25"
            >
              Find My Savings — Free, 90 sec
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

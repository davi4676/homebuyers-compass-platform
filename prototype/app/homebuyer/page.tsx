'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Home, TrendingUp, RefreshCw, ArrowRight, CheckCircle, DollarSign, Calculator, BookOpen } from 'lucide-react'
import ScrollRevealSection from '@/components/ScrollRevealSection'
import { getCopy, COPY_PERSONALIZATION_ENABLED } from '@/lib/copy-variants'
import { getUserProfile } from '@/lib/user-profile'
import BackToMyJourneyLink from '@/components/BackToMyJourneyLink'
import { SIGNUP_DISABLED } from '@/lib/auth-flags'

const HOMEBUYER_HERO_HELPER_FALLBACK =
  'Simple step-by-step guides that anyone can understand. No confusing jargon.'

function authSignupThenPath(path: string) {
  return SIGNUP_DISABLED ? path : `/auth?mode=signup&redirect=${encodeURIComponent(path)}`
}

const NEXT_BEST_ACTION_BY_TYPE: Record<
  string,
  { title: string; description: string; href: string; secondaryHref: string; secondaryLabel: string }
> = {
  'first-time': {
    title: 'Start your first-time buyer assessment',
    description: 'Get your personalized numbers first, then follow your guided steps.',
    href: authSignupThenPath('/quiz?transactionType=first-time'),
    secondaryHref: '/homebuyer/buy-sell-journey',
    secondaryLabel: 'See a sample journey',
  },
  'repeat-buyer': {
    title: 'Plan your buy + sell timeline',
    description: 'Map sale proceeds, bridge risk, and the right purchase scenario.',
    href: '/homebuyer/buy-sell-journey',
    secondaryHref: authSignupThenPath('/quiz?transactionType=repeat-buyer'),
    secondaryLabel: 'Start with quiz',
  },
  refinance: {
    title: 'Open your Refinance Optimizer',
    description: 'Rate radar, break-even math, and cash-out scenarios — then use the roadmap for documents and timeline.',
    href: '/refinance-optimizer',
    secondaryHref: '/homebuyer/refinance-journey',
    secondaryLabel: 'Checklist & timeline wizard',
  },
}

const HOMEBUYER_PHASES = [
  {
    id: 1,
    title: 'Preparation & Credit',
    subtitle: 'Credit, budget, and documents—before you shop.',
  },
  {
    id: 2,
    title: 'Get Pre-Approved',
    subtitle: 'Verified numbers and lender shopping—done right.',
  },
  {
    id: 3,
    title: 'Find Your Home',
    subtitle: 'Must-haves, agent, and your wider team.',
  },
  {
    id: 4,
    title: 'Negotiation & Inspection',
    subtitle: 'Contingencies, inspection, coverage, and title.',
  },
  {
    id: 5,
    title: 'Underwriting & Final Approval',
    subtitle: 'Fast answers, steady job, no surprise debt.',
  },
  {
    id: 6,
    title: 'Closing & Move-In',
    subtitle: 'Disclosure, walk-through, wires, keys.',
  },
  {
    id: 7,
    title: 'Post-Closing & Beyond',
    subtitle: 'Maintain, renew coverage, avoid scams—act early if money gets tight.',
  },
]

export default function HomebuyerPage() {
  const [heroHelperText, setHeroHelperText] = useState(HOMEBUYER_HERO_HELPER_FALLBACK)
  const [isPersonalized, setIsPersonalized] = useState(false)
  const [nextActionType, setNextActionType] = useState<'first-time' | 'repeat-buyer' | 'refinance'>('first-time')
  const [roadmapPhaseId, setRoadmapPhaseId] = useState(2)

  const quizFirstTime = authSignupThenPath('/quiz?transactionType=first-time')
  const quizRepeat = authSignupThenPath('/quiz?transactionType=repeat-buyer')
  const quizRefi = authSignupThenPath('/quiz?transactionType=refinance')
  const quizDefault = authSignupThenPath('/quiz')

  useEffect(() => {
    if (COPY_PERSONALIZATION_ENABLED && typeof window !== 'undefined') {
      const profile = getUserProfile()
      const text = getCopy('homebuyer-hero-helper', profile.buyerType, HOMEBUYER_HERO_HELPER_FALLBACK)
      setHeroHelperText(text)
      setIsPersonalized(text !== HOMEBUYER_HERO_HELPER_FALLBACK)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem('quizData')
      if (!raw) return
      const parsed = JSON.parse(raw) as { transactionType?: string }
      if (
        parsed?.transactionType === 'first-time' ||
        parsed?.transactionType === 'repeat-buyer' ||
        parsed?.transactionType === 'refinance'
      ) {
        setNextActionType(parsed.transactionType)
      }
    } catch {
      // Ignore invalid local data.
    }
  }, [])

  const nextBestAction = NEXT_BEST_ACTION_BY_TYPE[nextActionType] || NEXT_BEST_ACTION_BY_TYPE['first-time']

  return (
    <div className="min-h-screen bg-gradient-to-b from-millennial-bg via-millennial-bg to-[#f0f4f0] font-sans text-millennial-text antialiased">
      <header className="sticky top-0 z-50 border-b border-millennial-border bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="font-display text-xl font-bold text-[rgb(var(--navy))]">
            NestQuest
          </Link>
          <Link
            href={quizDefault}
            className="rounded-xl bg-millennial-cta-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-millennial-cta-hover"
          >
            Find My Savings →
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6">
          <BackToMyJourneyLink className="font-semibold text-millennial-cta-secondary hover:text-millennial-primary" />
        </div>

        <section
          id="homebuyer-hero"
          className="relative mb-10 flex min-h-[340px] flex-col justify-center overflow-hidden rounded-2xl md:min-h-[400px]"
        >
          <div
            className="absolute inset-0 z-0 bg-cover bg-center"
            style={{
              backgroundImage:
                'linear-gradient(to top, rgba(250,250,245,0.96) 0%, rgba(250,250,245,0.35) 55%, transparent 100%), url(https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80)',
              backgroundPosition: 'center',
              backgroundSize: 'cover',
            }}
          />
          <div className="relative z-10 px-4 py-10 text-center md:py-12">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-3xl font-extrabold text-millennial-text md:text-4xl lg:text-5xl"
            >
              Buying a Home? We&apos;ll Explain Everything
            </motion.h1>
            <div className="mt-4 flex flex-col items-center gap-2">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="max-w-2xl text-lg text-millennial-text-muted md:text-xl"
              >
                {heroHelperText}
              </motion.p>
              {isPersonalized ? (
                <span className="rounded-full bg-millennial-primary-light/80 px-3 py-0.5 text-xs font-semibold text-teal-900">
                  Personalized
                </span>
              ) : null}
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8"
            >
              <Link
                href={quizDefault}
                className="inline-flex items-center gap-2 rounded-xl bg-millennial-cta-primary px-8 py-4 text-lg font-semibold text-white shadow-md transition-colors hover:bg-millennial-cta-hover"
              >
                Get Your Free Guide
                <ArrowRight size={20} aria-hidden />
              </Link>
              <p className="mt-2 text-sm text-millennial-text-subtle">Free · No credit check · About 2 minutes</p>
            </motion.div>
          </div>
        </section>

        <ScrollRevealSection>
          <section className="mb-6">
            <div className="rounded-2xl border border-millennial-border bg-white p-5 shadow-sm">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-millennial-primary">Today view</p>
              <h2 className="text-lg font-bold text-millennial-text">{nextBestAction.title}</h2>
              <p className="mt-1 text-sm text-millennial-text-muted">{nextBestAction.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={nextBestAction.href}
                  className="inline-flex items-center gap-2 rounded-xl bg-millennial-cta-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-millennial-cta-hover"
                >
                  Start now
                  <ArrowRight size={16} aria-hidden />
                </Link>
                <Link
                  href={nextBestAction.secondaryHref}
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-millennial-border bg-white px-4 py-2.5 text-sm font-semibold text-millennial-cta-secondary transition-colors hover:border-millennial-primary hover:bg-millennial-primary-light/30"
                >
                  {nextBestAction.secondaryLabel}
                </Link>
              </div>
            </div>
          </section>
        </ScrollRevealSection>

        <ScrollRevealSection>
          <section className="mb-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-sage">7-Phase Roadmap</p>
                <p className="mt-1 text-sm text-millennial-text-muted">
                  Tap a phase to jump ahead when it&apos;s unlocked for your tier.
                </p>
              </div>

              <div className="flex flex-col items-center gap-4">
                <div
                  className="flex w-full max-w-3xl flex-nowrap items-center justify-center gap-0 overflow-x-auto px-2 py-1 [scrollbar-width:thin]"
                  role="list"
                  aria-label="Home buying phases"
                >
                  {HOMEBUYER_PHASES.map((phase, idx) => {
                    const selected = roadmapPhaseId === phase.id
                    return (
                      <div key={phase.id} className="flex shrink-0 items-center" role="listitem">
                        {idx > 0 ? (
                          <span
                            className="mx-0.5 h-1 w-4 shrink-0 rounded-full bg-teal-200 sm:mx-1 sm:w-6"
                            aria-hidden
                          />
                        ) : null}
                        <button
                          type="button"
                          onClick={() => setRoadmapPhaseId(phase.id)}
                          title={`${phase.title} — ${phase.subtitle}`}
                          className={[
                            'relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-bold text-white shadow-md outline-none transition sm:h-14 sm:w-14 sm:text-lg',
                            'bg-gradient-to-b from-teal-400 to-millennial-cta-primary ring-2 ring-teal-800/10 hover:from-teal-300 hover:to-teal-600',
                            'focus-visible:ring-2 focus-visible:ring-millennial-primary focus-visible:ring-offset-2',
                            selected
                              ? 'ring-4 ring-millennial-primary-light shadow-lg shadow-teal-600/25'
                              : 'opacity-90 hover:opacity-100',
                          ].join(' ')}
                          aria-pressed={selected}
                          aria-label={`Phase ${phase.id}: ${phase.title}`}
                        >
                          <span className="drop-shadow-sm">{phase.id}</span>
                        </button>
                      </div>
                    )
                  })}
                </div>
                {(() => {
                  const active = HOMEBUYER_PHASES.find((p) => p.id === roadmapPhaseId) ?? HOMEBUYER_PHASES[0]
                  return (
                    <div className="w-full max-w-xl rounded-xl border border-teal-100 bg-millennial-primary-light/40 px-4 py-3 text-center">
                      <p className="text-sm font-bold text-teal-950">
                        Phase {active.id}: {active.title}
                      </p>
                      <p className="mt-1 text-sm text-teal-900/90">{active.subtitle}</p>
                    </div>
                  )
                })()}
              </div>
            </div>
          </section>
        </ScrollRevealSection>

        <ScrollRevealSection>
          <section className="mb-10">
            <h2 className="mb-8 text-center font-display text-3xl font-bold text-millennial-text">
              What Do You Want to Do?
            </h2>
            <div className="grid gap-5 md:grid-cols-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-lg transition hover:border-millennial-primary"
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-millennial-primary-light/60">
                  <Home className="text-millennial-cta-primary" size={32} aria-hidden />
                </div>
                <h3 className="mb-3 text-2xl font-bold text-millennial-text">First-Time Buyer</h3>
                <p className="mb-4 text-millennial-text-muted">
                  Never bought a home before? We&apos;ll walk you through every single step from saving money to
                  moving in.
                </p>
                <ul className="mb-6 space-y-2 text-sm text-millennial-text-muted">
                  {[
                    'How much money you really need',
                    'What credit score you need',
                    'All the hidden costs explained',
                    'Step-by-step checklist',
                  ].map((line) => (
                    <li key={line} className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 shrink-0 text-millennial-primary" size={16} aria-hidden />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={quizFirstTime}
                  className="block w-full rounded-xl bg-millennial-cta-primary py-3 text-center font-semibold text-white transition-colors hover:bg-millennial-cta-hover"
                >
                  Get Your Guide
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl border-2 border-brand-mist bg-white p-6 shadow-lg transition hover:border-brand-forest"
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-mist">
                  <TrendingUp className="text-brand-forest" size={32} aria-hidden />
                </div>
                <h3 className="mb-3 text-2xl font-bold text-millennial-text">Moving to a New Home</h3>
                <p className="mb-4 text-millennial-text-muted">
                  Already own a home? We&apos;ll help you sell your current home and buy your next one without stress.
                </p>
                <ul className="mb-6 space-y-2 text-sm text-millennial-text-muted">
                  {[
                    'How much your home is worth',
                    "What you'll get after selling",
                    'Timing your sale and purchase',
                    'Using your equity wisely',
                  ].map((line) => (
                    <li key={line} className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 shrink-0 text-brand-forest" size={16} aria-hidden />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col gap-2">
                  <Link
                    href="/homebuyer/buy-sell-journey"
                    className="block w-full rounded-xl bg-brand-forest py-3 text-center font-semibold text-white transition-colors hover:bg-brand-sage"
                  >
                    Start Buy & Sell Journey
                  </Link>
                  <Link
                    href={quizRepeat}
                    className="block w-full rounded-xl border-2 border-brand-forest py-2 text-center text-sm font-medium text-brand-forest transition-colors hover:bg-brand-mist"
                  >
                    Get Quiz Guide
                  </Link>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-lg transition hover:border-[rgb(var(--navy))]/30"
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                  <RefreshCw className="text-[rgb(var(--navy))]" size={32} aria-hidden />
                </div>
                <h3 className="mb-3 text-2xl font-bold text-millennial-text">Refinance Your Loan</h3>
                <p className="mb-4 text-millennial-text-muted">
                  Want a lower payment or better rate? We&apos;ll show you if refinancing makes sense for you.
                </p>
                <ul className="mb-6 space-y-2 text-sm text-millennial-text-muted">
                  {[
                    "If you'll actually save money",
                    "When it's the right time",
                    'How much it will cost',
                    'Step-by-step process',
                  ].map((line) => (
                    <li key={line} className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 shrink-0 text-[rgb(var(--navy))]" size={16} aria-hidden />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col gap-2">
                  <Link
                    href="/refinance-optimizer"
                    className="block w-full rounded-xl bg-[rgb(var(--navy))] py-3 text-center font-semibold text-white transition-opacity hover:opacity-95"
                  >
                    Open Refinance Optimizer
                  </Link>
                  <Link
                    href="/homebuyer/refinance-journey"
                    className="block w-full rounded-xl border-2 border-[rgb(var(--navy))]/40 py-2 text-center text-sm font-medium text-[rgb(var(--navy))] transition-colors hover:bg-slate-50"
                  >
                    Checklist &amp; timeline wizard
                  </Link>
                  <Link
                    href={quizRefi}
                    className="block w-full rounded-xl border border-slate-200 py-2 text-center text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
                  >
                    Start with refinance quiz
                  </Link>
                </div>
              </motion.div>
            </div>
          </section>
        </ScrollRevealSection>

        <ScrollRevealSection>
          <section className="mb-10 rounded-2xl border border-millennial-border bg-millennial-primary-light/25 p-6 md:p-8">
            <h2 className="mb-8 text-center font-display text-3xl font-bold text-millennial-text">How It Works</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {(
                [
                  {
                    n: '1',
                    t: 'Answer Simple Questions',
                    d: "We'll ask you about your income, savings, and goals. Takes about 2 minutes.",
                  },
                  {
                    n: '2',
                    t: 'Get Your Personal Guide',
                    d: "We'll create a step-by-step guide just for you, with everything explained in simple terms.",
                  },
                  {
                    n: '3',
                    t: 'Follow Your Steps',
                    d: "Check off each step as you complete it. We'll tell you exactly what to do next.",
                  },
                ] as const
              ).map((step) => (
                <div key={step.n} className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-millennial-cta-primary text-xl font-bold text-white">
                    {step.n}
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-millennial-text">{step.t}</h3>
                  <p className="text-millennial-text-muted">{step.d}</p>
                </div>
              ))}
            </div>
          </section>
        </ScrollRevealSection>

        <ScrollRevealSection>
          <section className="mb-10">
            <h2 className="mb-8 text-center font-display text-3xl font-bold text-millennial-text">
              Why Our Guide is Different
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {(
                [
                  {
                    Icon: Calculator,
                    t: 'No Confusing Words',
                    d: "We explain everything like you're talking to a friend. No mortgage jargon or complicated terms.",
                  },
                  {
                    Icon: BookOpen,
                    t: 'Step-by-Step Checklist',
                    d: 'We give you a clear list of what to do, in order. Check off each step as you go.',
                  },
                  {
                    Icon: DollarSign,
                    t: 'See All Your Costs',
                    d: 'We show you every single cost, even the hidden ones. No surprises at closing.',
                  },
                  {
                    Icon: CheckCircle,
                    t: '100% Free',
                    d: 'No credit card needed. No hidden fees. Just free, helpful information.',
                  },
                ] as const
              ).map(({ Icon, t, d }) => (
                <div key={t} className="rounded-2xl border border-millennial-border bg-white p-6 shadow-sm">
                  <Icon className="mb-3 text-millennial-cta-primary" size={32} aria-hidden />
                  <h3 className="mb-2 text-xl font-bold text-millennial-text">{t}</h3>
                  <p className="text-millennial-text-muted">{d}</p>
                </div>
              ))}
            </div>
          </section>
        </ScrollRevealSection>

        <ScrollRevealSection>
          <section className="rounded-2xl bg-gradient-to-br from-[rgb(var(--navy))] via-slate-800 to-slate-900 p-8 text-center text-white md:p-10">
            <h2 className="mb-4 font-display text-3xl font-bold md:text-4xl">Ready to find your savings?</h2>
            <p className="mb-6 text-xl text-white/85">Get your free, personalized guide in just 2 minutes.</p>
            <Link
              href={quizDefault}
              className="inline-flex items-center gap-2 rounded-xl bg-millennial-cta-primary px-8 py-4 text-lg font-semibold text-white shadow-lg transition-colors hover:bg-millennial-cta-hover"
            >
              Find My Savings →
              <ArrowRight size={20} aria-hidden />
            </Link>
          </section>
        </ScrollRevealSection>
      </main>

      <footer className="mt-10 border-t border-white/10 bg-[rgb(var(--navy))] py-8 text-white/80">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm">
          <p>© {new Date().getFullYear()} NestQuest. Your Home Buying Advocate.</p>
        </div>
      </footer>
    </div>
  )
}

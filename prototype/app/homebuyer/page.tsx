'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Home, TrendingUp, RefreshCw, ArrowRight, CheckCircle, DollarSign, Calculator, BookOpen } from 'lucide-react'
import { getCopy, COPY_PERSONALIZATION_ENABLED } from '@/lib/copy-variants'
import { getUserProfile } from '@/lib/user-profile'

const HOMEBUYER_HERO_HELPER_FALLBACK =
  "Simple step-by-step guides that anyone can understand. No confusing jargon."

const NEXT_BEST_ACTION_BY_TYPE: Record<string, { title: string; description: string; href: string; secondaryHref: string; secondaryLabel: string }> = {
  'first-time': {
    title: 'Start your first-time buyer assessment',
    description: 'Get your personalized numbers first, then follow your guided steps.',
    href: '/quiz?transactionType=first-time',
    secondaryHref: '/homebuyer/buy-sell-journey',
    secondaryLabel: 'See a sample journey',
  },
  'repeat-buyer': {
    title: 'Plan your buy + sell timeline',
    description: 'Map sale proceeds, bridge risk, and the right purchase scenario.',
    href: '/homebuyer/buy-sell-journey',
    secondaryHref: '/quiz?transactionType=repeat-buyer',
    secondaryLabel: 'Start with quiz',
  },
  refinance: {
    title: 'Run your refinance break-even',
    description: 'Compare rate scenarios and see if refinancing saves real money.',
    href: '/homebuyer/refinance-journey',
    secondaryHref: '/quiz?transactionType=refinance',
    secondaryLabel: 'Start with quiz',
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

  useEffect(() => {
    if (COPY_PERSONALIZATION_ENABLED && typeof window !== 'undefined') {
      const profile = getUserProfile()
      const text = getCopy(
        'homebuyer-hero-helper',
        profile.buyerType,
        HOMEBUYER_HERO_HELPER_FALLBACK
      )
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-blue-600">🏠 NestQuest</h1>
            <Link
              href="/quiz"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Start Free Guide
            </Link>
            </div>
          </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            Buying a Home? We'll Explain Everything
          </motion.h1>
          <div className="flex flex-col items-center gap-1 mb-6">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-600"
            >
              {heroHelperText}
            </motion.p>
            {isPersonalized && (
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                Personalized
              </span>
            )}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link
              href="/quiz"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition shadow-lg"
            >
              Get Your Free Guide
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        </section>

        <section className="mb-6">
          <div className="rounded-xl border border-blue-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 mb-1">Today view</p>
            <h2 className="text-lg font-bold text-gray-900">{nextBestAction.title}</h2>
            <p className="text-sm text-gray-600 mb-3">{nextBestAction.description}</p>
            <div className="flex flex-wrap gap-2">
              <Link
                href={nextBestAction.href}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
              >
                Start now
                <ArrowRight size={16} />
              </Link>
              <Link
                href={nextBestAction.secondaryHref}
                className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 transition"
              >
                {nextBestAction.secondaryLabel}
              </Link>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">7-Phase Roadmap</p>
              <p className="mt-1 text-sm text-gray-600">
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
                      {idx > 0 && (
                        <span
                          className="mx-0.5 h-1 w-4 shrink-0 rounded-full bg-green-300 sm:mx-1 sm:w-6"
                          aria-hidden
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => setRoadmapPhaseId(phase.id)}
                        title={`${phase.title} — ${phase.subtitle}`}
                        className={[
                          'relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-bold text-white shadow-md outline-none transition sm:h-14 sm:w-14 sm:text-lg',
                          'bg-gradient-to-b from-green-400 to-green-700 ring-2 ring-green-800/15 hover:from-green-300 hover:to-green-600',
                          'focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2',
                          selected
                            ? 'ring-4 ring-green-300 shadow-lg shadow-green-600/30'
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
                  <div className="w-full max-w-xl rounded-lg border border-green-100 bg-green-50/80 px-4 py-3 text-center">
                    <p className="text-sm font-bold text-green-900">
                      Phase {active.id}: {active.title}
                    </p>
                    <p className="mt-1 text-sm text-green-800/90">{active.subtitle}</p>
                  </div>
                )
              })()}
            </div>
          </div>
        </section>

        {/* What We Help With */}
        <section className="mb-10">
          <h2 className="text-3xl font-bold text-center mb-8">What Do You Want to Do?</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {/* First-Time Buyer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-xl shadow-lg border-2 border-blue-100 hover:border-blue-400 transition"
            >
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <Home className="text-blue-600" size={32} />
        </div>
              <h3 className="text-2xl font-bold mb-3">First-Time Buyer</h3>
              <p className="text-gray-600 mb-4">
                Never bought a home before? We'll walk you through every single step from saving money to moving in.
              </p>
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                <li className="flex items-start gap-2">
                  <CheckCircle className="text-green-500 mt-0.5" size={16} />
                  <span>How much money you really need</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="text-green-500 mt-0.5" size={16} />
                  <span>What credit score you need</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="text-green-500 mt-0.5" size={16} />
                  <span>All the hidden costs explained</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="text-green-500 mt-0.5" size={16} />
                  <span>Step-by-step checklist</span>
                </li>
              </ul>
              <Link
                href="/quiz?transactionType=first-time"
                className="block w-full text-center bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Get Your Guide
              </Link>
            </motion.div>

            {/* Repeat Buyer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white p-6 rounded-xl shadow-lg border-2 border-green-100 hover:border-green-400 transition"
            >
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="text-green-600" size={32} />
        </div>
              <h3 className="text-2xl font-bold mb-3">Moving to a New Home</h3>
              <p className="text-gray-600 mb-4">
                Already own a home? We'll help you sell your current home and buy your next one without stress.
              </p>
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                <li className="flex items-start gap-2">
                  <CheckCircle className="text-green-500 mt-0.5" size={16} />
                  <span>How much your home is worth</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="text-green-500 mt-0.5" size={16} />
                  <span>What you'll get after selling</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="text-green-500 mt-0.5" size={16} />
                  <span>Timing your sale and purchase</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="text-green-500 mt-0.5" size={16} />
                  <span>Using your equity wisely</span>
                </li>
              </ul>
              <div className="flex flex-col gap-2">
                <Link
                  href="/quiz?transactionType=repeat-buyer"
                  className="block w-full text-center bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  Start Buy & Sell Journey
                </Link>
                <Link
                  href="/quiz?transactionType=repeat-buyer"
                  className="block w-full text-center border border-green-600 text-green-600 py-2 rounded-lg font-medium hover:bg-green-50 transition text-sm"
                >
                  Get Quiz Guide
                </Link>
              </div>
            </motion.div>

            {/* Refinance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-xl shadow-lg border-2 border-purple-100 hover:border-purple-400 transition"
            >
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <RefreshCw className="text-purple-600" size={32} />
                </div>
              <h3 className="text-2xl font-bold mb-3">Refinance Your Loan</h3>
              <p className="text-gray-600 mb-4">
                Want a lower payment or better rate? We'll show you if refinancing makes sense for you.
              </p>
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                <li className="flex items-start gap-2">
                  <CheckCircle className="text-green-500 mt-0.5" size={16} />
                  <span>If you'll actually save money</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="text-green-500 mt-0.5" size={16} />
                  <span>When it's the right time</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="text-green-500 mt-0.5" size={16} />
                  <span>How much it will cost</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="text-green-500 mt-0.5" size={16} />
                  <span>Step-by-step process</span>
                </li>
              </ul>
              <div className="flex flex-col gap-2">
                <Link
                  href="/quiz?transactionType=refinance"
                  className="block w-full text-center bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
                >
                  Start Refinance Journey
                </Link>
                <Link
                  href="/quiz?transactionType=refinance"
                  className="block w-full text-center border border-purple-600 text-purple-600 py-2 rounded-lg font-medium hover:bg-purple-50 transition text-sm"
                >
                  Get Quiz Guide
                </Link>
              </div>
            </motion.div>
              </div>
        </section>

        {/* How It Works */}
        <section className="bg-blue-50 rounded-2xl p-6 md:p-8 mb-10">
          <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
            </div>
              <h3 className="text-xl font-bold mb-2">Answer Simple Questions</h3>
              <p className="text-gray-600">
                We'll ask you about your income, savings, and goals. Takes about 2 minutes.
              </p>
                </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
                </div>
              <h3 className="text-xl font-bold mb-2">Get Your Personal Guide</h3>
              <p className="text-gray-600">
                We'll create a step-by-step guide just for you, with everything explained in simple terms.
              </p>
                </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-bold mb-2">Follow Your Steps</h3>
              <p className="text-gray-600">
                Check off each step as you complete it. We'll tell you exactly what to do next.
              </p>
            </div>
          </div>
        </section>

        {/* Why We're Different */}
        <section className="mb-10">
          <h2 className="text-3xl font-bold text-center mb-8">Why Our Guide is Different</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
              <Calculator className="text-blue-600 mb-3" size={32} />
              <h3 className="text-xl font-bold mb-2">No Confusing Words</h3>
              <p className="text-gray-600">
                We explain everything like you're talking to a friend. No mortgage jargon or complicated terms.
              </p>
                </div>
            <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
              <BookOpen className="text-blue-600 mb-3" size={32} />
              <h3 className="text-xl font-bold mb-2">Step-by-Step Checklist</h3>
              <p className="text-gray-600">
                We give you a clear list of what to do, in order. Check off each step as you go.
              </p>
              </div>
            <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
              <DollarSign className="text-blue-600 mb-3" size={32} />
              <h3 className="text-xl font-bold mb-2">See All Your Costs</h3>
              <p className="text-gray-600">
                We show you every single cost, even the hidden ones. No surprises at closing.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
              <CheckCircle className="text-blue-600 mb-3" size={32} />
              <h3 className="text-xl font-bold mb-2">100% Free</h3>
              <p className="text-gray-600">
                No credit card needed. No hidden fees. Just free, helpful information.
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="text-center bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 md:p-10 text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-6 text-blue-100">
            Get your free, personalized guide in just 2 minutes.
          </p>
          <Link
            href="/quiz"
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition shadow-lg"
          >
            Start Your Free Guide
            <ArrowRight size={20} />
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-6 mt-10">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>© 2024 NestQuest. Made to help you understand homebuying.</p>
            </div>
      </footer>
    </div>
  )
}

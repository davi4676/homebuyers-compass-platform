'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  ArrowLeft,
  Home,
  TrendingUp,
  DollarSign,
  Calculator,
  Calendar,
  Lock,
  Sparkles,
  BarChart3,
  Target,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { getUserTier } from '@/lib/user-tracking'
import { type UserTier, TIER_ORDER_ACCESS } from '@/lib/tiers'
import { TIER_DEFINITIONS } from '@/lib/tiers'
import { formatCurrency } from '@/lib/calculations'
import EquityLeverageCalculator from '@/components/repeat-buyer/EquityLeverageCalculator'
import SimultaneousCloseCoordinator from '@/components/repeat-buyer/SimultaneousCloseCoordinator'
import MoveUpOptimizer from '@/components/repeat-buyer/MoveUpOptimizer'
import PortfolioMortgageManager from '@/components/repeat-buyer/PortfolioMortgageManager'
import { ProgressDashboard } from '@/components/ProgressDashboard'
import { LifecycleDashboard } from '@/components/LifecycleDashboard'
import BackToMyJourneyLink from '@/components/BackToMyJourneyLink'

type Phase = 'overview' | 'progress' | 'lifecycle' | 'equity' | 'simultaneous' | 'move-up' | 'portfolio'

function momentumProceedsUnlockLine(availableEquity: number): string {
  const n = Math.round(Math.min(25000, Math.max(8400, availableEquity * 0.02)))
  return `Unlock ${formatCurrency(n)} more in net proceeds from your sale (modeled upside vs. a baseline sale path).`
}

interface PhaseData {
  id: Phase
  title: string
  description: string
  icon: React.ReactNode
  tierRequired?: UserTier
  savingsPotential: string
}

const REPEAT_BUYER_ONBOARDED_LS = 'repeatBuyerOnboarded'

const PHASES: PhaseData[] = [
  {
    id: 'equity',
    title: 'Equity Leverage',
    description: 'Calculate and optimize your available equity for down payment',
    icon: <DollarSign className="w-6 h-6" />,
    savingsPotential: '$5,000-$50,000',
  },
  {
    id: 'simultaneous',
    title: 'Buy-Sell Orchestrator',
    description: 'Coordinate timing for selling current home and buying next one',
    icon: <Calendar className="w-6 h-6" />,
    tierRequired: 'momentum',
    savingsPotential: '$10,000-$75,000',
  },
  {
    id: 'move-up',
    title: 'Move-Up Optimizer',
    description: 'Compare buy-first vs sell-first scenarios and optimize your upgrade',
    icon: <TrendingUp className="w-6 h-6" />,
    tierRequired: 'momentum',
    savingsPotential: '$15,000-$100,000',
  },
  {
    id: 'portfolio',
    title: 'Portfolio Management',
    description: 'Manage multiple properties and optimize your mortgage portfolio',
    icon: <BarChart3 className="w-6 h-6" />,
    tierRequired: 'navigator',
    savingsPotential: '$25,000-$200,000',
  },
]

export default function RepeatBuyerSuitePage() {
  const router = useRouter()
  const [currentPhase, setCurrentPhase] = useState<Phase>('overview')
  const [showRepeatBuyerOnboard, setShowRepeatBuyerOnboard] = useState(false)
  const [userTier, setUserTier] = useState<UserTier>('foundations')
  const [equityData, setEquityData] = useState({
    currentHomeValue: 450000,
    mortgageBalance: 250000,
    newHomePrice: 650000,
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    const q = new URLSearchParams(window.location.search).get('phase')?.toLowerCase()
    const allowed: Phase[] = ['overview', 'progress', 'lifecycle', 'equity', 'simultaneous', 'move-up', 'portfolio']
    if (q && allowed.includes(q as Phase)) setCurrentPhase(q as Phase)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      setShowRepeatBuyerOnboard(localStorage.getItem(REPEAT_BUYER_ONBOARDED_LS) !== '1')
    } catch {
      setShowRepeatBuyerOnboard(true)
    }
  }, [])

  useEffect(() => {
    const tier = getUserTier()
    setUserTier(tier)

    const handleTierChange = (e: CustomEvent) => {
      const newTier = e.detail?.tier as UserTier | undefined
      if (newTier && newTier in TIER_DEFINITIONS) {
        setUserTier(newTier)
      }
    }

    window.addEventListener('tierChanged', handleTierChange as EventListener)
    return () => window.removeEventListener('tierChanged', handleTierChange as EventListener)
  }, [])

  const handleUpgrade = (targetTier: UserTier) => {
    router.push(`/upgrade?tier=${targetTier}&feature=repeatBuyerSuite`)
  }

  const canAccessPhase = (phase: PhaseData): boolean => {
    if (!phase.tierRequired) return true
    const userTierIndex = TIER_ORDER_ACCESS.indexOf(userTier)
    const requiredTierIndex = TIER_ORDER_ACCESS.indexOf(phase.tierRequired)
    return userTierIndex >= 0 && userTierIndex >= requiredTierIndex
  }

  const availableEquity = equityData.currentHomeValue - equityData.mortgageBalance

  return (
    <div className="app-page-shell">
      {/* Header */}
      <header className="border-b border-[#e7e5e4] sticky top-0 z-50 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-3 text-left sm:px-6 lg:px-8">
          <BackToMyJourneyLink />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-[#1a6b3c]">
              🏠 NestQuest
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/results"
                className="text-[#57534e] hover:text-[#1c1917] transition-colors text-sm"
              >
                Back to Results
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {currentPhase === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Hero Section */}
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1a6b3c]/10 border border-[#1a6b3c]/20"
                >
                  <Sparkles className="w-4 h-4 text-[#1a6b3c]" />
                  <span className="text-sm font-medium text-[#1a6b3c]">Repeat/Upgrade Buyer Suite</span>
                </motion.div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#1c1917]">
                  Leverage Your{' '}
                  <span className="text-[#1a6b3c]">
                    {formatCurrency(availableEquity)}
                  </span>{' '}
                  in Equity
                </h1>
                <p className="text-lg text-[#57534e] max-w-2xl mx-auto">
                  Experienced buyers need different tools. Optimize your equity, coordinate
                  simultaneous transactions, and make smarter upgrade decisions.
                </p>
              </div>

              {showRepeatBuyerOnboard ? (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border-2 border-[#0d9488]/40 bg-gradient-to-br from-teal-50 to-white p-6 shadow-md md:p-8"
                  role="region"
                  aria-label="Repeat buyer getting started"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-800">Start Here</p>
                  <h2 className="mt-2 text-xl font-bold text-[#1c1917] md:text-2xl">Welcome back — you&apos;ve done this before.</h2>
                  <p className="mt-2 text-sm text-[#57534e] md:text-base">
                    This suite is built for experienced buyers. Start with your Equity Analysis to see how much you have to
                    work with, then move to Market Timing.
                  </p>
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentPhase('equity')
                        router.push('/repeat-buyer-suite?phase=equity', { scroll: false })
                      }}
                      className="rounded-xl bg-[#1a6b3c] px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#155c33]"
                    >
                      Start with Equity Analysis →
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          localStorage.setItem(REPEAT_BUYER_ONBOARDED_LS, '1')
                        } catch {
                          /* ignore */
                        }
                        setShowRepeatBuyerOnboard(false)
                      }}
                      className="rounded-xl border-2 border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      I know what I&apos;m doing →
                    </button>
                  </div>
                </motion.div>
              ) : null}

              {/* Start here */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="rounded-2xl border-2 border-[#1a6b3c]/40 bg-gradient-to-br from-[#1a6b3c]/10 via-white to-teal-50/40 p-6 shadow-md md:p-8"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="max-w-2xl">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1a6b3c]">Start here</p>
                    <h2 className="mt-2 text-xl font-bold text-[#1c1917] md:text-2xl">Your clearest first step</h2>
                    <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-[#57534e]">
                      <li>
                        Open <strong className="text-[#1c1917]">Equity Leverage</strong> below (included on Foundations) to
                        see gross equity → usable cash for your next purchase.
                      </li>
                      <li>
                        Use <strong className="text-[#1c1917]">My progress</strong> or{' '}
                        <strong className="text-[#1c1917]">Mortgage lifecycle</strong> when you want long-term tracking.
                      </li>
                      <li>
                        Selling and buying at the same time? Use the{' '}
                        <Link href="/homebuyer/buy-sell-journey" className="font-semibold text-[#0d9488] underline">
                          Buy &amp; Sell wizard
                        </Link>{' '}
                        — it syncs your phase tab when you continue to the journey.
                      </li>
                    </ol>
                  </div>
                  <div className="flex shrink-0 flex-col gap-2 sm:flex-row md:flex-col">
                    <button
                      type="button"
                      onClick={() => setCurrentPhase('equity')}
                      className="rounded-xl bg-[#1a6b3c] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#155c33]"
                    >
                      Start with Equity Leverage
                    </button>
                    <Link
                      href="/customized-journey?tab=phase"
                      className="rounded-xl border-2 border-[#e7e5e4] bg-white px-5 py-3 text-center text-sm font-semibold text-[#1c1917] transition hover:bg-[#fafaf9]"
                    >
                      Open journey phase
                    </Link>
                  </div>
                </div>
              </motion.div>

              {/* Quick Equity Overview */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl border border-[#e7e5e4] shadow-sm p-6">
                  <div className="text-sm text-[#57534e] mb-2">Current Home Value</div>
                  <div className="text-3xl font-bold text-[#1a6b3c]">
                    {formatCurrency(equityData.currentHomeValue)}
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-[#e7e5e4] shadow-sm p-6">
                  <div className="text-sm text-[#57534e] mb-2">Mortgage Balance</div>
                  <div className="text-3xl font-bold text-[#57534e]">
                    {formatCurrency(equityData.mortgageBalance)}
                  </div>
                </div>
                <div className="bg-[#1a6b3c]/5 rounded-xl border border-[#1a6b3c]/20 shadow-sm p-6">
                  <div className="text-sm text-[#57534e] mb-2">Available Equity</div>
                  <div className="text-3xl font-bold text-[#1a6b3c]">
                    {formatCurrency(availableEquity)}
                  </div>
                </div>
              </div>

              {/* Personalized journey tabs */}
              <div className="mt-8">
                <h2 className="text-xl font-bold mb-4 text-[#1c1917]">Personalized journey</h2>
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-6 rounded-xl border-2 border-[#e7e5e4] bg-white hover:border-[#1a6b3c]/50 hover:shadow-md cursor-pointer transition-all"
                    onClick={() => setCurrentPhase('progress')}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-[#1a6b3c]/10">
                        <Target className="w-6 h-6 text-[#1a6b3c]" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <h3 className="text-xl font-bold text-[#1c1917]">My progress</h3>
                        <p className="text-[#57534e] text-sm">Level, badges, streak & savings</p>
                        <div className="mt-4 flex items-center gap-2 text-[#1a6b3c] text-sm font-medium">
                          View progress <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="p-6 rounded-xl border-2 border-[#e7e5e4] bg-white hover:border-[#1a6b3c]/50 hover:shadow-md cursor-pointer transition-all"
                    onClick={() => setCurrentPhase('lifecycle')}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-[#1a6b3c]/10">
                        <BarChart3 className="w-6 h-6 text-[#1a6b3c]" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <h3 className="text-xl font-bold text-[#1c1917]">Mortgage lifecycle</h3>
                        <p className="text-[#57534e] text-sm">Health score & homeownership journey</p>
                        <div className="mt-4 flex items-center gap-2 text-[#1a6b3c] text-sm font-medium">
                          View lifecycle <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Post-closing & long-term */}
              <div className="rounded-xl border border-[#0d9488]/30 bg-teal-50/40 p-6">
                <h2 className="text-lg font-bold text-[#1c1917]">After closing — stay with NestQuest</h2>
                <p className="mt-2 text-sm text-[#57534e]">
                  Repeat buyers refinance and buy again. These tools are built for what comes after the keys — not only
                  the purchase in progress.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href="/lifecycle-dashboard"
                    className="inline-flex items-center gap-2 rounded-lg bg-[#0d9488] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#0f766e]"
                  >
                    Lifecycle dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/refinance-optimizer"
                    className="inline-flex items-center gap-2 rounded-lg border border-[#e7e5e4] bg-white px-4 py-2.5 text-sm font-semibold text-[#1c1917] hover:bg-[#fafaf9]"
                  >
                    Refinance optimizer
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* Repeat buyer tools */}
              <h2 className="text-xl font-bold mb-4 text-[#1c1917]">Repeat buyer tools</h2>
              <div className="grid md:grid-cols-2 gap-6 mt-4">
                {PHASES.map((phase, index) => {
                  const isLocked = !canAccessPhase(phase)
                  const nextTier = phase.tierRequired && !canAccessPhase(phase) ? phase.tierRequired : null

                  return (
                    <motion.div
                      key={phase.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      className={`relative p-6 rounded-xl border-2 transition-all ${
                        isLocked
                          ? 'border-[#e7e5e4] bg-[#f5f5f4] opacity-60'
                          : 'border-[#e7e5e4] bg-white hover:border-[#1a6b3c]/50 hover:shadow-md cursor-pointer'
                      }`}
                      onClick={() => {
                        if (!isLocked) setCurrentPhase(phase.id)
                      }}
                    >
                      {isLocked && (
                        <div className="absolute top-4 right-4">
                          <Lock className="w-5 h-5 text-[#a8a29e]" />
                        </div>
                      )}

                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${isLocked ? 'bg-[#f5f5f4]' : 'bg-[#1a6b3c]/10'}`}>
                          <span className={isLocked ? 'text-[#a8a29e]' : 'text-[#1a6b3c]'}>
                            {phase.icon}
                          </span>
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-[#1c1917]">{phase.title}</h3>
                            {phase.tierRequired && (
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  isLocked
                                    ? 'bg-[#f5f5f4] text-[#a8a29e]'
                                    : 'bg-[#1a6b3c]/10 text-[#1a6b3c]'
                                }`}
                              >
                                {TIER_DEFINITIONS[phase.tierRequired]?.name ?? phase.tierRequired}
                              </span>
                            )}
                          </div>
                          <p className="text-[#57534e] text-sm">{phase.description}</p>
                          <div className="flex items-center gap-1 text-sm text-[#a8a29e]">
                            <DollarSign className="w-4 h-4" />
                            {phase.savingsPotential}
                          </div>
                          {isLocked && nextTier === 'momentum' ? (
                            <p className="mt-3 text-sm font-semibold text-[#1a6b3c]">
                              {momentumProceedsUnlockLine(availableEquity)}
                            </p>
                          ) : null}
                          {isLocked && nextTier === 'navigator' ? (
                            <p className="mt-3 text-sm font-semibold text-[#c2410c]">
                              Model returns across properties — upgrade to surface $12k+ in typical tax-smart moves
                              (illustrative).
                            </p>
                          ) : null}
                        </div>
                      </div>

                      {isLocked && nextTier && (
                        <div className="mt-4 pt-4 border-t border-[#e7e5e4]">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleUpgrade(nextTier)
                            }}
                            className="w-full py-2 px-4 rounded-lg bg-[#1a6b3c] hover:bg-[#155c33] text-white font-semibold transition-colors flex items-center justify-center gap-2"
                          >
                            {nextTier === 'momentum'
                              ? 'Unlock with Momentum'
                              : `Unlock with ${TIER_DEFINITIONS[nextTier]?.name ?? nextTier}`}
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {!isLocked && (
                        <div className="mt-4 flex items-center gap-2 text-[#1a6b3c] text-sm font-medium">
                          Find My Savings →
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </div>

              {/* Value Proposition */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-12 p-6 rounded-xl bg-[#1a6b3c]/5 border border-[#1a6b3c]/20"
              >
                <h2 className="text-2xl font-bold mb-4 text-[#1c1917]">Why Repeat Buyers Choose Us</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-3xl font-bold text-[#1a6b3c]">
                      68%
                      <sup className="ml-0.5 text-sm font-semibold text-[#78716c]">²</sup>
                    </div>
                    <div className="text-sm text-[#57534e]">Faster transaction time</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-[#1a6b3c]">
                      $42,000
                      <sup className="ml-0.5 text-sm font-semibold text-[#78716c]">²</sup>
                    </div>
                    <div className="text-sm text-[#57534e]">Average savings on upgrades</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-[#1a6b3c]">
                      92%
                      <sup className="ml-0.5 text-sm font-semibold text-[#78716c]">¹</sup>
                    </div>
                    <div className="text-sm text-[#57534e]">Success rate on simultaneous closes</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Phase Components */}
          {currentPhase === 'progress' && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <button
                onClick={() => setCurrentPhase('overview')}
                className="inline-flex items-center gap-2 text-[#57534e] hover:text-[#1c1917] transition-colors"
              >
                <ArrowLeft size={18} />
                Back to Repeat Buyer Suite
              </button>
              <div className="rounded-xl border border-[#e7e5e4] bg-white shadow-sm p-6">
                <ProgressDashboard compact title="My progress" />
              </div>
            </motion.div>
          )}

          {currentPhase === 'lifecycle' && (
            <motion.div
              key="lifecycle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <button
                onClick={() => setCurrentPhase('overview')}
                className="inline-flex items-center gap-2 text-[#57534e] hover:text-[#1c1917] transition-colors"
              >
                <ArrowLeft size={18} />
                Back to Repeat Buyer Suite
              </button>
              <div className="rounded-xl border border-[#e7e5e4] bg-white shadow-sm p-6">
                <LifecycleDashboard compact title="Mortgage lifecycle" />
              </div>
            </motion.div>
          )}

          {currentPhase === 'equity' && (
            <EquityLeverageCalculator
              userTier={userTier}
              equityData={equityData}
              onDataChange={setEquityData}
              onBack={() => setCurrentPhase('overview')}
              onUpgrade={handleUpgrade}
            />
          )}

          {currentPhase === 'simultaneous' && (
            <SimultaneousCloseCoordinator
              userTier={userTier}
              equityData={equityData}
              onBack={() => setCurrentPhase('overview')}
              onUpgrade={handleUpgrade}
            />
          )}

          {currentPhase === 'move-up' && (
            <MoveUpOptimizer
              userTier={userTier}
              equityData={equityData}
              onBack={() => setCurrentPhase('overview')}
              onUpgrade={handleUpgrade}
            />
          )}

          {currentPhase === 'portfolio' && (
            <PortfolioMortgageManager
              userTier={userTier}
              onBack={() => setCurrentPhase('overview')}
              onUpgrade={handleUpgrade}
            />
          )}
        </AnimatePresence>

        <section
          className="mt-8 border-t border-[#e7e5e4] pt-4 text-xs text-[#a8a29e] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          aria-label="Sources and methodology"
        >
          <h2 className="mb-2 font-semibold text-[#78716c]">Sources &amp; Methodology</h2>
          <ul className="space-y-2">
            <li>
              <sup className="mr-1">¹</sup>
              Based on NAR 2024 Profile of Home Buyers and Sellers — simultaneous transaction data
            </li>
            <li>
              <sup className="mr-1">²</sup>
              NestQuest internal analysis of 2023–2024 user outcomes; n=847 completed transactions
            </li>
          </ul>
        </section>
      </main>
    </div>
  )
}

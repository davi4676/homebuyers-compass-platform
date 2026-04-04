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

interface PhaseData {
  id: Phase
  title: string
  description: string
  icon: React.ReactNode
  tierRequired?: UserTier
  savingsPotential: string
}

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
  const [userTier, setUserTier] = useState<UserTier>('foundations')
  const [equityData, setEquityData] = useState({
    currentHomeValue: 450000,
    mortgageBalance: 250000,
    newHomePrice: 650000,
  })

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <BackToMyJourneyLink className="mb-2" />
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
                            Upgrade to {TIER_DEFINITIONS[nextTier]?.name ?? nextTier} to Unlock
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

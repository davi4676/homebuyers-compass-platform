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
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-gray-800 sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#06b6d4] to-[#22d3ee]">
                🏠 NestQuest
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/results"
                className="text-gray-400 hover:text-white transition-colors text-sm"
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
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#06b6d4]/20 to-[#22d3ee]/20 border border-[#06b6d4]/30"
                >
                  <Sparkles className="w-4 h-4 text-[#06b6d4]" />
                  <span className="text-sm font-medium">Repeat/Upgrade Buyer Suite</span>
                </motion.div>
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                  Leverage Your{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#06b6d4] to-[#22d3ee]">
                    {formatCurrency(availableEquity)}
                  </span>{' '}
                  in Equity
                </h1>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                  Experienced buyers need different tools. Optimize your equity, coordinate
                  simultaneous transactions, and make smarter upgrade decisions.
                </p>
              </div>

              {/* Quick Equity Overview */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 rounded-xl border border-[#06b6d4]/30 p-6">
                  <div className="text-sm text-gray-400 mb-2">Current Home Value</div>
                  <div className="text-3xl font-bold text-[#06b6d4]">
                    {formatCurrency(equityData.currentHomeValue)}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 rounded-xl border border-[#06b6d4]/30 p-6">
                  <div className="text-sm text-gray-400 mb-2">Mortgage Balance</div>
                  <div className="text-3xl font-bold text-gray-300">
                    {formatCurrency(equityData.mortgageBalance)}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-[#06b6d4]/20 to-[#22d3ee]/20 rounded-xl border border-[#06b6d4]/30 p-6">
                  <div className="text-sm text-gray-400 mb-2">Available Equity</div>
                  <div className="text-3xl font-bold text-white">
                    {formatCurrency(availableEquity)}
                  </div>
                </div>
              </div>

              {/* Personalized journey tabs: My progress + Mortgage lifecycle */}
              <div className="mt-8">
                <h2 className="text-xl font-bold mb-4 text-gray-200">Personalized journey</h2>
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-6 rounded-xl border-2 border-[#06b6d4]/30 bg-gradient-to-br from-gray-900/50 to-gray-800/30 hover:border-[#06b6d4]/50 cursor-pointer"
                    onClick={() => setCurrentPhase('progress')}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-[#06b6d4]/20">
                        <Target className="w-6 h-6 text-[#06b6d4]" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <h3 className="text-xl font-bold">My progress</h3>
                        <p className="text-gray-400 text-sm">Level, badges, streak & savings</p>
                        <div className="mt-4 flex items-center gap-2 text-[#06b6d4] text-sm font-medium">
                          View progress <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="p-6 rounded-xl border-2 border-[#06b6d4]/30 bg-gradient-to-br from-gray-900/50 to-gray-800/30 hover:border-[#06b6d4]/50 cursor-pointer"
                    onClick={() => setCurrentPhase('lifecycle')}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-[#06b6d4]/20">
                        <BarChart3 className="w-6 h-6 text-[#06b6d4]" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <h3 className="text-xl font-bold">Mortgage lifecycle</h3>
                        <p className="text-gray-400 text-sm">Health score & homeownership journey</p>
                        <div className="mt-4 flex items-center gap-2 text-[#06b6d4] text-sm font-medium">
                          View lifecycle <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Repeat buyer tools */}
              <h2 className="text-xl font-bold mb-4 text-gray-200">Repeat buyer tools</h2>
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
                          ? 'border-gray-800 bg-gray-900/50 opacity-60'
                          : 'border-[#06b6d4]/30 bg-gradient-to-br from-gray-900/50 to-gray-800/30 hover:border-[#06b6d4]/50 cursor-pointer'
                      }`}
                      onClick={() => {
                        if (!isLocked) {
                          setCurrentPhase(phase.id)
                        }
                      }}
                    >
                      {isLocked && (
                        <div className="absolute top-4 right-4">
                          <Lock className="w-5 h-5 text-gray-600" />
                        </div>
                      )}

                      <div className="flex items-start gap-4">
                        <div
                          className={`p-3 rounded-lg ${
                            isLocked ? 'bg-gray-800' : 'bg-[#06b6d4]/20'
                          }`}
                        >
                          {phase.icon}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold">{phase.title}</h3>
                            {phase.tierRequired && (
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  isLocked
                                    ? 'bg-gray-800 text-gray-500'
                                    : 'bg-[#06b6d4]/20 text-[#06b6d4]'
                                }`}
                              >
                                {phase.tierRequired === 'momentum' ? 'Guided' : 'Concierge'}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-400 text-sm">{phase.description}</p>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <DollarSign className="w-4 h-4" />
                            {phase.savingsPotential}
                          </div>
                        </div>
                      </div>

                      {isLocked && nextTier && (
                        <div className="mt-4 pt-4 border-t border-gray-800">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleUpgrade(nextTier)
                            }}
                            className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-[#06b6d4] to-[#22d3ee] text-white font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                          >
                            Upgrade to {nextTier === 'momentum' ? 'Guided' : 'Concierge'} to Unlock
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {!isLocked && (
                        <div className="mt-4 flex items-center gap-2 text-[#06b6d4] text-sm font-medium">
                          Get Started <ArrowRight className="w-4 h-4" />
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
                className="mt-12 p-6 rounded-xl bg-gradient-to-r from-[#06b6d4]/10 to-[#22d3ee]/10 border border-[#06b6d4]/20"
              >
                <h2 className="text-2xl font-bold mb-4">Why Repeat Buyers Choose Us</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-3xl font-bold text-[#06b6d4]">68%</div>
                    <div className="text-sm text-gray-400">Faster transaction time</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-[#06b6d4]">$42,000</div>
                    <div className="text-sm text-gray-400">Average savings on upgrades</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-[#06b6d4]">92%</div>
                    <div className="text-sm text-gray-400">Success rate on simultaneous closes</div>
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
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft size={18} />
                Back to Repeat Buyer Suite
              </button>
              <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
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
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft size={18} />
                Back to Repeat Buyer Suite
              </button>
              <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
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
      </main>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Lock,
  TrendingDown,
  Calculator,
  FileText,
  Users,
  Shield,
  Sparkles,
  Info,
  DollarSign,
  Clock,
  Target,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import { getUserTier } from '@/lib/user-tracking'
import { TIER_DEFINITIONS, hasFeature, getNextTier, type UserTier, TIER_ORDER_ACCESS } from '@/lib/tiers'
import { formatCurrency } from '@/lib/calculations'
import SavingsCalculator from '@/components/mortgage-shopping/SavingsCalculator'
import Phase1Preparation from '@/components/mortgage-shopping/Phase1Preparation'
import Phase2Research from '@/components/mortgage-shopping/Phase2Research'
import Phase3Negotiation from '@/components/mortgage-shopping/Phase3Negotiation'
import Phase4Closing from '@/components/mortgage-shopping/Phase4Closing'
import RoadmapProgress from '@/components/mortgage-shopping/RoadmapProgress'
import TrustSignals from '@/components/trust/TrustSignals'
import UserJourneyTracker from '@/components/analytics/UserJourneyTracker'

type Phase = 'overview' | 'preparation' | 'research' | 'negotiation' | 'closing'

interface PhaseData {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  estimatedTime: string
  savingsPotential: string
  tierRequired?: UserTier
}

const PHASES: PhaseData[] = [
  {
    id: 'preparation',
    title: 'Preparation',
    description: 'Get your credit, documents, and finances ready',
    icon: <FileText className="w-6 h-6" />,
    estimatedTime: '2-3 hours',
    savingsPotential: '$3,000-$15,000',
  },
  {
    id: 'research',
    title: 'Lender Research',
    description: 'Compare rates and collect quotes from multiple lenders',
    icon: <Calculator className="w-6 h-6" />,
    estimatedTime: '3-5 hours',
    savingsPotential: '$5,000-$30,000',
    tierRequired: 'momentum',
  },
  {
    id: 'negotiation',
    title: 'Negotiation',
    description: 'Use AI-powered scripts to negotiate the best deal',
    icon: <Users className="w-6 h-6" />,
    estimatedTime: '2-4 hours',
    savingsPotential: '$2,000-$20,000',
    tierRequired: 'navigator',
  },
  {
    id: 'closing',
    title: 'Document Management',
    description: 'Organize documents and track closing costs',
    icon: <Shield className="w-6 h-6" />,
    estimatedTime: '1-2 hours',
    savingsPotential: '$500-$5,000',
    tierRequired: 'momentum',
  },
]

export default function MortgageShoppingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentPhase, setCurrentPhase] = useState<Phase>('overview')
  const [userTier, setUserTier] = useState<UserTier>('foundations')
  const [savingsData, setSavingsData] = useState({
    loanAmount: 400000,
    creditScore: 720,
    downPayment: 80000,
    timeline: '45 days',
  })

  // Handle URL parameter for direct phase navigation
  useEffect(() => {
    const phaseParam = searchParams.get('phase')
    if (phaseParam && ['preparation', 'research', 'negotiation', 'closing'].includes(phaseParam)) {
      setCurrentPhase(phaseParam as Phase)
    }
  }, [searchParams])

  useEffect(() => {
    const tier = getUserTier()
    setUserTier(tier)

    // Listen for tier changes
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
    router.push(`/upgrade?tier=${targetTier}&feature=mortgageShopping`)
  }

  const canAccessPhase = (phase: PhaseData): boolean => {
    if (!phase.tierRequired) return true
    const userTierIndex = TIER_ORDER_ACCESS.indexOf(userTier)
    const requiredTierIndex = TIER_ORDER_ACCESS.indexOf(phase.tierRequired)
    return userTierIndex >= 0 && userTierIndex >= requiredTierIndex
  }

  const getPhaseStatus = (phase: PhaseData): 'locked' | 'available' | 'completed' => {
    if (!canAccessPhase(phase)) return 'locked'
    // In a real app, you'd track completion status
    return 'available'
  }

  const calculateTotalSavingsPotential = (): { min: number; max: number } => {
    // Based on loan amount and credit score
    const baseMin = savingsData.loanAmount * 0.003 // 0.3% of loan
    const baseMax = savingsData.loanAmount * 0.15 // 15% of loan
    return { min: baseMin, max: baseMax }
  }

  const totalSavings = calculateTotalSavingsPotential()

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
        <UserJourneyTracker />
        <TrustSignals />
        
        {/* Navigation Buttons */}
        <div className="mb-6 flex items-center justify-between sticky top-20 z-40 bg-[#0a0a0a]/80 backdrop-blur-sm py-3 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 rounded-lg">
          <Link
            href="/results"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold bg-gray-800 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-[#06b6d4] transition-all"
          >
            <ArrowLeft size={18} />
            <span>Back to Results</span>
          </Link>
          <Link
            href="/down-payment-optimizer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold bg-[#06b6d4] text-white hover:bg-[#0891b2] focus:outline-none focus:ring-2 focus:ring-[#06b6d4] transition-all"
          >
            <span>Down Payment Optimizer</span>
            <ArrowRight size={18} />
          </Link>
        </div>
        
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
                  <span className="text-sm font-medium">Mortgage Savings Roadmap</span>
                </motion.div>
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                  Save{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#06b6d4] to-[#22d3ee]">
                    ${totalSavings.min.toLocaleString()}-${totalSavings.max.toLocaleString()}
                  </span>{' '}
                  on Your Mortgage
                </h1>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                  A step-by-step journey to maximize your savings while shopping for the best
                  mortgage rate. Most users save $15,000-$50,000 with our proven strategy.
                </p>
              </div>

              {/* Savings Calculator */}
              <SavingsCalculator
                initialData={savingsData}
                onDataChange={setSavingsData}
                userTier={userTier === 'navigator_plus' ? 'navigator' : userTier}
              />

              {/* Roadmap Progress */}
              <RoadmapProgress
                phases={PHASES}
                userTier={userTier}
                onPhaseClick={(phase) => {
                  if (canAccessPhase(phase)) {
                    setCurrentPhase(phase.id as Phase)
                  }
                }}
                getPhaseStatus={getPhaseStatus}
              />

              {/* Phase Cards */}
              <div className="grid md:grid-cols-2 gap-6 mt-12">
                {PHASES.map((phase, index) => {
                  const status = getPhaseStatus(phase)
                  const isLocked = status === 'locked'
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
                          setCurrentPhase(phase.id as Phase)
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
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {phase.estimatedTime}
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              {phase.savingsPotential}
                            </div>
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

              {/* Social Proof */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-12 p-6 rounded-xl bg-gradient-to-r from-[#06b6d4]/10 to-[#22d3ee]/10 border border-[#06b6d4]/20"
              >
                <div className="flex items-center justify-center gap-8 text-center">
                  <div>
                    <div className="text-3xl font-bold text-[#06b6d4]">83%</div>
                    <div className="text-sm text-gray-400">of Concierge users negotiate successfully</div>
                  </div>
                  <div className="h-12 w-px bg-gray-700" />
                  <div>
                    <div className="text-3xl font-bold text-[#06b6d4]">$48,760</div>
                    <div className="text-sm text-gray-400">Average savings for Concierge users</div>
                  </div>
                  <div className="h-12 w-px bg-gray-700" />
                  <div>
                    <div className="text-3xl font-bold text-[#06b6d4]">37%</div>
                    <div className="text-sm text-gray-400">More savings vs Guided users</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Phase Components */}
          {currentPhase === 'preparation' && (
            <Phase1Preparation
              userTier={userTier}
              savingsData={savingsData}
              onBack={() => setCurrentPhase('overview')}
              onUpgrade={handleUpgrade}
            />
          )}

          {currentPhase === 'research' && (
            <Phase2Research
              userTier={userTier}
              savingsData={savingsData}
              onBack={() => setCurrentPhase('overview')}
              onUpgrade={handleUpgrade}
            />
          )}

          {currentPhase === 'negotiation' && (
            <Phase3Negotiation
              userTier={userTier}
              savingsData={savingsData}
              onBack={() => setCurrentPhase('overview')}
              onUpgrade={handleUpgrade}
            />
          )}

          {currentPhase === 'closing' && (
            <Phase4Closing
              userTier={userTier}
              savingsData={savingsData}
              onBack={() => setCurrentPhase('overview')}
              onUpgrade={handleUpgrade}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

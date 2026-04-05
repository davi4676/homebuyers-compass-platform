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
import BackToMyJourneyLink from '@/components/BackToMyJourneyLink'

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

  useEffect(() => {
    const phaseParam = searchParams.get('phase')
    if (phaseParam && ['preparation', 'research', 'negotiation', 'closing'].includes(phaseParam)) {
      setCurrentPhase(phaseParam as Phase)
    }
  }, [searchParams])

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
    router.push(`/upgrade?tier=${targetTier}&feature=mortgageShopping`)
  }

  const canAccessPhase = (phase: PhaseData): boolean => {
    if (!phase.tierRequired) return true
    const userTierIndex = TIER_ORDER_ACCESS.indexOf(userTier)
    const requiredTierIndex = TIER_ORDER_ACCESS.indexOf(phase.tierRequired as UserTier)
    return userTierIndex >= 0 && userTierIndex >= requiredTierIndex
  }

  const getPhaseStatus = (phase: PhaseData): 'locked' | 'available' | 'completed' => {
    if (!canAccessPhase(phase)) return 'locked'
    return 'available'
  }

  const calculateTotalSavingsPotential = (): { min: number; max: number } => {
    const baseMin = savingsData.loanAmount * 0.003
    const baseMax = savingsData.loanAmount * 0.15
    return { min: baseMin, max: baseMax }
  }

  const totalSavings = calculateTotalSavingsPotential()

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
        <UserJourneyTracker />
        <TrustSignals />

        {searchParams.get('icp') === 'solo' ? (
          <div
            className="mb-6 rounded-xl border border-teal-200 bg-teal-50/90 p-4 shadow-sm sm:p-5"
            role="region"
            aria-label="Solo buyer mortgage tips"
          >
            <p className="text-sm font-bold text-teal-950">Personalized for buying on one income</p>
            <p className="mt-2 text-sm text-teal-900/95">
              Underwriters will stress-test <strong className="font-semibold">debt-to-income</strong> and{' '}
              <strong className="font-semibold">post-closing reserves</strong> with only your income on the application.
              Gather two years of consistent earnings documentation, avoid new credit before pre-approval, and ask each
              lender for your max <em>comfortable</em> payment — not just the max you can qualify for.
            </p>
          </div>
        ) : null}

        {/* Navigation Buttons */}
        <div className="mb-6 flex items-center justify-between sticky top-20 z-40 bg-[#fafaf9]/90 backdrop-blur-sm py-3 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 rounded-lg">
          <Link
            href="/results"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold bg-white border border-[#e7e5e4] text-[#1c1917] hover:bg-[#f5f5f4] focus:outline-none focus:ring-2 focus:ring-[#1a6b3c] transition-all"
          >
            <ArrowLeft size={18} />
            <span>Back to Results</span>
          </Link>
          <Link
            href="/down-payment-optimizer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold bg-[#1a6b3c] hover:bg-[#155c33] text-white focus:outline-none focus:ring-2 focus:ring-[#1a6b3c] transition-all"
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
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1a6b3c]/10 border border-[#1a6b3c]/20"
                >
                  <Sparkles className="w-4 h-4 text-[#1a6b3c]" />
                  <span className="text-sm font-medium text-[#1a6b3c]">Mortgage Savings Roadmap</span>
                </motion.div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#1c1917]">
                  Save{' '}
                  <span className="text-[#1a6b3c]">
                    ${totalSavings.min.toLocaleString()}-${totalSavings.max.toLocaleString()}
                  </span>{' '}
                  on Your Mortgage
                </h1>
                <p className="text-lg text-[#57534e] max-w-2xl mx-auto">
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
                  const nextTier = phase.tierRequired && !canAccessPhase(phase) ? phase.tierRequired as UserTier : null

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
                        if (!isLocked) setCurrentPhase(phase.id as Phase)
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
                                {TIER_DEFINITIONS[phase.tierRequired as UserTier]?.name ?? phase.tierRequired}
                              </span>
                            )}
                          </div>
                          <p className="text-[#57534e] text-sm">{phase.description}</p>
                          <div className="flex items-center gap-4 text-sm text-[#a8a29e]">
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

              {/* Social Proof */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-12 p-6 rounded-xl bg-[#1a6b3c]/5 border border-[#1a6b3c]/20"
              >
                <div className="flex items-center justify-center gap-8 text-center flex-wrap gap-y-6">
                  <div>
                    <div className="text-3xl font-bold text-[#1a6b3c]">83%</div>
                    <div className="text-sm text-[#57534e]">of Navigator+ users negotiate successfully</div>
                  </div>
                  <div className="h-12 w-px bg-[#e7e5e4] hidden sm:block" />
                  <div>
                    <div className="text-3xl font-bold text-[#1a6b3c]">$48,760</div>
                    <div className="text-sm text-[#57534e]">Average savings for Navigator+ users</div>
                  </div>
                  <div className="h-12 w-px bg-[#e7e5e4] hidden sm:block" />
                  <div>
                    <div className="text-3xl font-bold text-[#1a6b3c]">37%</div>
                    <div className="text-sm text-[#57534e]">More savings vs Momentum users</div>
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

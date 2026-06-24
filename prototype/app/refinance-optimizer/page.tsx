'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  TrendingDown,
  DollarSign,
  Calculator,
  Bell,
  Lock,
  BarChart3,
  Target,
} from 'lucide-react'
import Link from 'next/link'
import { getUserTier } from '@/lib/user-tracking'
import { type UserTier, TIER_ORDER_ACCESS } from '@/lib/tiers'
import { TIER_DEFINITIONS } from '@/lib/tiers'
import { formatCurrency } from '@/lib/calculations'
import RateDropRadar from '@/components/refinance/RateDropRadar'
import CashOutOptimizer from '@/components/refinance/CashOutOptimizer'
import RefinanceAnalyzer from '@/components/refinance/RefinanceAnalyzer'
import InvestmentRefinanceSuite from '@/components/refinance/InvestmentRefinanceSuite'
import { ProgressDashboard } from '@/components/ProgressDashboard'
import { LifecycleDashboard } from '@/components/LifecycleDashboard'
import BackToMyJourneyLink from '@/components/BackToMyJourneyLink'
import NqHubTabLayout from '@/components/hub/NqHubTabLayout'
import NqHubStatCard from '@/components/hub/NqHubStatCard'

type Phase = 'overview' | 'progress' | 'lifecycle' | 'rate-radar' | 'cash-out' | 'analyzer' | 'investment'

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
    id: 'rate-radar',
    title: 'Rate Drop Radar',
    description: 'Compare your rate to the market; personalized alerts with Momentum',
    icon: <Bell className="w-6 h-6" />,
    savingsPotential: '$2,000-$30,000',
  },
  {
    id: 'cash-out',
    title: 'Cash-Out Optimizer',
    description: 'Optimize cash-out refinancing for debt consolidation or investments',
    icon: <DollarSign className="w-6 h-6" />,
    tierRequired: 'momentum',
    savingsPotential: '$5,000-$50,000',
  },
  {
    id: 'analyzer',
    title: 'Should I Refinance?',
    description: 'Multi-factor analysis beyond just rates',
    icon: <Calculator className="w-6 h-6" />,
    tierRequired: 'momentum',
    savingsPotential: '$3,000-$40,000',
  },
  {
    id: 'investment',
    title: 'Investment Property Refi',
    description: 'Specialized tools for real estate investors',
    icon: <BarChart3 className="w-6 h-6" />,
    tierRequired: 'navigator',
    savingsPotential: '$10,000-$100,000',
  },
]

export default function RefinanceOptimizerPage() {
  const router = useRouter()
  const [currentPhase, setCurrentPhase] = useState<Phase>('overview')
  const [userTier, setUserTier] = useState<UserTier>('foundations')
  const [refinanceData, setRefinanceData] = useState({
    currentRate: 6.5,
    currentBalance: 300000,
    homeValue: 450000,
    yearsRemaining: 25,
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
    router.push(`/upgrade?tier=${targetTier}&feature=refinanceOptimizer`)
  }

  const canAccessPhase = (phase: PhaseData): boolean => {
    if (!phase.tierRequired) return true
    const userTierIndex = TIER_ORDER_ACCESS.indexOf(userTier)
    const requiredTierIndex = TIER_ORDER_ACCESS.indexOf(phase.tierRequired)
    return userTierIndex >= 0 && userTierIndex >= requiredTierIndex
  }

  const currentEquity = refinanceData.homeValue - refinanceData.currentBalance
  const equityPercent = (currentEquity / refinanceData.homeValue) * 100

  const onOverview = currentPhase === 'overview'

  return (
    <NqHubTabLayout
      tab="refinance"
      backLink={<BackToMyJourneyLink />}
      maxWidth="6xl"
      showHero={onOverview}
      showTrustBar={onOverview}
      showFunnel={onOverview}
      glassCard={
        <div className="nq-glass nq-savings-glass">
          <p className="nq-savings-glass-label">Available equity</p>
          <p className="nq-savings-glass-amount tabular-nums">{formatCurrency(currentEquity)}</p>
          <p className="mt-2 text-sm text-[var(--nq-ed-muted)]">{equityPercent.toFixed(1)}% of home value</p>
        </div>
      }
    >
        <AnimatePresence mode="wait">
          {currentPhase === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <NqHubStatCard
                  label="Current rate"
                  value={`${refinanceData.currentRate.toFixed(2)}%`}
                  hint="Your loan rate today"
                />
                <NqHubStatCard
                  label="Loan balance"
                  value={formatCurrency(refinanceData.currentBalance)}
                  hint="Outstanding principal"
                />
                <NqHubStatCard
                  label="Home value"
                  value={formatCurrency(refinanceData.homeValue)}
                  hint="Estimated market value"
                />
                <NqHubStatCard
                  label="Equity"
                  value={formatCurrency(currentEquity)}
                  hint={`${equityPercent.toFixed(1)}% of value`}
                />
              </div>

              <div className="mt-4">
                <h2 className="nq-sl-section-title">Personalized journey</h2>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="nq-hub-panel cursor-pointer p-6 transition hover:-translate-y-0.5 hover:shadow-md"
                    onClick={() => setCurrentPhase('progress')}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-[var(--nq-ed-accent-soft)]">
                        <Target className="w-6 h-6 text-[var(--nq-ed-accent)]" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <h3 className="font-display text-xl font-bold text-[var(--nq-ed-text)]">My progress</h3>
                        <p className="text-sm text-[var(--nq-ed-muted)]">Level, badges, streak & savings</p>
                        <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-[var(--nq-ed-accent)]">
                          View progress <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="nq-hub-panel cursor-pointer p-6 transition hover:-translate-y-0.5 hover:shadow-md"
                    onClick={() => setCurrentPhase('lifecycle')}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-[var(--nq-ed-accent-soft)]">
                        <BarChart3 className="w-6 h-6 text-[var(--nq-ed-accent)]" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <h3 className="font-display text-xl font-bold text-[var(--nq-ed-text)]">Mortgage lifecycle</h3>
                        <p className="text-sm text-[var(--nq-ed-muted)]">Health score & homeownership journey</p>
                        <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-[var(--nq-ed-accent)]">
                          View lifecycle <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>

              <h2 className="nq-sl-section-title">Refinance tools</h2>
              <p className="nq-sl-section-lede mb-4 max-w-2xl">
                Ready to execute?{' '}
                <Link
                  href="/homebuyer/refinance-journey"
                  className="font-semibold text-[var(--nq-ed-accent)] hover:underline"
                >
                  Open the refinance roadmap wizard
                </Link>{' '}
                for lender comparison prep, a document checklist, and appraisal timeline.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                {PHASES.map((phase, index) => {
                  const isLocked = !canAccessPhase(phase)
                  const nextTier =
                    phase.tierRequired && !canAccessPhase(phase) ? phase.tierRequired : null

                  return (
                    <motion.div
                      key={phase.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      className={`nq-hub-panel relative p-6 transition ${
                        isLocked
                          ? 'opacity-60'
                          : 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md'
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
                className="mt-12 p-6 rounded-xl bg-[#0d9488]/5 border border-[#0d9488]/20"
              >
                <h2 className="text-2xl font-bold mb-4 text-[#1c1917]">Why Refinance with Us</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-3xl font-bold text-[#1a6b3c]">
                      $18,400
                      <sup className="ml-0.5 text-sm font-semibold text-[#78716c]">¹</sup>
                    </div>
                    <div className="text-sm text-[#57534e]">Average annual savings</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-[#1a6b3c]">14 months</div>
                    <div className="text-sm text-[#57534e]">Average break-even point</div>
                  </div>
                  <div>
                    <div
                      className="text-3xl font-bold text-[#1a6b3c]"
                      title="Based on aggregate outcomes from NestQuest users who completed this journey"
                    >
                      89%
                      <sup className="ml-0.5 text-sm font-semibold text-[#78716c]">²</sup>
                    </div>
                    <div className="text-sm text-[#57534e]">Users save money refinancing</div>
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
                Back to Refinance Optimizer
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
                Back to Refinance Optimizer
              </button>
              <div className="rounded-xl border border-[#e7e5e4] bg-white shadow-sm p-6">
                <LifecycleDashboard compact title="Mortgage lifecycle" />
              </div>
            </motion.div>
          )}

          {currentPhase === 'rate-radar' && (
            <RateDropRadar
              userTier={userTier}
              refinanceData={refinanceData}
              onDataChange={setRefinanceData}
              onBack={() => setCurrentPhase('overview')}
              onUpgrade={handleUpgrade}
            />
          )}

          {currentPhase === 'cash-out' && (
            <CashOutOptimizer
              userTier={userTier}
              refinanceData={refinanceData}
              onBack={() => setCurrentPhase('overview')}
              onUpgrade={handleUpgrade}
            />
          )}

          {currentPhase === 'analyzer' && (
            <RefinanceAnalyzer
              userTier={userTier}
              refinanceData={refinanceData}
              onBack={() => setCurrentPhase('overview')}
              onUpgrade={handleUpgrade}
            />
          )}

          {currentPhase === 'investment' && (
            <InvestmentRefinanceSuite
              userTier={userTier}
              onBack={() => setCurrentPhase('overview')}
              onUpgrade={handleUpgrade}
            />
          )}
        </AnimatePresence>

        <section
          className="mt-8 border-t border-[var(--nq-ed-line-soft)] pt-4 text-xs text-[var(--nq-ed-muted)]"
          aria-label="Sources and methodology"
        >
          <h2 className="mb-2 font-semibold text-[var(--nq-ed-text)]">Sources &amp; Methodology</h2>
          <ul className="space-y-2">
            <li>
              <sup className="mr-1">¹</sup>
              Calculated for users who refinanced from 7.5% to 6.5% on a $350K 30-year fixed loan
            </li>
            <li>
              <sup className="mr-1">²</sup>
              NestQuest user outcome data, 2024
            </li>
          </ul>
        </section>
    </NqHubTabLayout>
  )
}

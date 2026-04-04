'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Home,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  ArrowRight,
  DollarSign,
  BarChart3,
  Sparkles,
  CheckCircle,
} from 'lucide-react'
import Link from 'next/link'
import { getUserTier } from '@/lib/user-tracking'
import { type UserTier } from '@/lib/tiers'
import { TIER_DEFINITIONS } from '@/lib/tiers'
import { formatCurrency } from '@/lib/calculations'
import { calculateMortgageHealthScore } from '@/lib/mortgage-health-score'

type LifecycleStage = 'first-time' | 'building-equity' | 'rate-opportunity' | 'upgrade-ready' | 'wealth-building'

interface LifecycleStageData {
  id: LifecycleStage
  title: string
  description: string
  icon: React.ReactNode
  recommendedAction: string
  link: string
  color: string
}

const LIFECYCLE_STAGES: LifecycleStageData[] = [
  {
    id: 'first-time',
    title: 'First-Time Buyer',
    description: 'Learning and preparing for your first home purchase',
    icon: <Home className="w-6 h-6" />,
    recommendedAction: 'Complete readiness assessment',
    link: '/quiz',
    color: 'from-blue-600 to-cyan-600',
  },
  {
    id: 'building-equity',
    title: 'Building Equity',
    description: 'Growing your home equity and monitoring your mortgage',
    icon: <TrendingUp className="w-6 h-6" />,
    recommendedAction: 'Track equity growth',
    link: '/results',
    color: 'from-green-600 to-emerald-600',
  },
  {
    id: 'rate-opportunity',
    title: 'Rate Opportunity',
    description: 'Rates have dropped - time to refinance',
    icon: <RefreshCw className="w-6 h-6" />,
    recommendedAction: 'Check refinance savings',
    link: '/refinance-optimizer',
    color: 'from-purple-600 to-pink-600',
  },
  {
    id: 'upgrade-ready',
    title: 'Upgrade Ready',
    description: 'You have equity to leverage for your next home',
    icon: <ArrowRight className="w-6 h-6" />,
    recommendedAction: 'Explore upgrade options',
    link: '/repeat-buyer-suite',
    color: 'from-orange-600 to-red-600',
  },
  {
    id: 'wealth-building',
    title: 'Wealth Building',
    description: 'Optimizing multiple properties and building portfolio',
    icon: <BarChart3 className="w-6 h-6" />,
    recommendedAction: 'Portfolio optimization',
    link: '/repeat-buyer-suite?phase=portfolio',
    color: 'from-millennial-cta-secondary to-purple-600',
  },
]

interface LifecycleDashboardProps {
  compact?: boolean
  title?: string
}

export function LifecycleDashboard({ compact = false, title = 'Mortgage lifecycle' }: LifecycleDashboardProps) {
  const [userTier, setUserTier] = useState<UserTier>('foundations')
  const [currentStage, setCurrentStage] = useState<LifecycleStage>('building-equity')

  useEffect(() => {
    const tier = getUserTier()
    setUserTier(tier)
    const handleTierChange = (e: CustomEvent) => {
      const newTier = e.detail?.tier as UserTier | undefined
      if (newTier && newTier in TIER_DEFINITIONS) setUserTier(newTier)
    }
    window.addEventListener('tierChanged', handleTierChange as EventListener)
    return () => window.removeEventListener('tierChanged', handleTierChange as EventListener)
  }, [])

  const healthScore = calculateMortgageHealthScore({
    rateCompetitiveness: 75,
    equityUtilization: 60,
    paymentToIncome: 28,
    refinanceEligibility: 80,
    upgradeReadiness: 45,
    creditHealth: 85,
    savingsBuffer: 70,
    debtToIncome: 32,
  })
  const mortgageHealthScore = healthScore.overall
  const equityPosition = 200000
  const rateCompetitiveness = healthScore.factors.rateCompetitiveness

  return (
    <div className="space-y-8">
      {!compact && (
        <div className="text-center space-y-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#06b6d4]/20 to-[#22d3ee]/20 border border-[#06b6d4]/30"
          >
            <Sparkles className="w-4 h-4 text-[#06b6d4]" />
            <span className="text-sm font-medium">Complete Homeownership Lifecycle</span>
          </motion.div>
          <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Track your journey through homeownership and discover opportunities at every stage.
          </p>
        </div>
      )}

      {/* Mortgage Health Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-[#06b6d4]/30 bg-gradient-to-br from-[#06b6d4]/20 to-[#22d3ee]/20 p-6"
      >
        <h3 className="text-xl font-bold mb-4">Mortgage Health Score</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-[#06b6d4] mb-2">{mortgageHealthScore}</div>
            <div className="text-sm text-gray-400">Overall Health</div>
            <div className="mt-2 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#06b6d4] to-[#22d3ee]"
                style={{ width: `${mortgageHealthScore}%` }}
              />
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-2">{formatCurrency(equityPosition)}</div>
            <div className="text-sm text-gray-400">Equity Position</div>
            <div className="text-xs text-green-400 mt-1">↑ 12% this year</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-2">{rateCompetitiveness}%</div>
            <div className="text-sm text-gray-400">Rate Competitiveness</div>
            <div className="text-xs text-yellow-400 mt-1">Could improve</div>
          </div>
        </div>

        {healthScore.recommendations.length > 0 && (
          <div className="mt-6 pt-6 border-t border-[#06b6d4]/20">
            <h4 className="text-sm font-semibold mb-2">Recommendations</h4>
            <div className="space-y-1">
              {healthScore.recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-[#50C878] mt-0.5 flex-shrink-0" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {healthScore.nextActions.length > 0 && (
          <div className="mt-6 pt-6 border-t border-[#06b6d4]/20">
            <h4 className="text-sm font-semibold mb-2">Recommended Next Actions</h4>
            <div className="space-y-2">
              {healthScore.nextActions.map((action, idx) => (
                <Link
                  key={idx}
                  href={action.link || '#'}
                  className={`block p-3 rounded-lg border-2 transition-all ${
                    action.priority === 'high'
                      ? 'border-[#50C878] bg-[#50C878]/10 hover:bg-[#50C878]/20'
                      : action.priority === 'medium'
                        ? 'border-[#D4AF37] bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20'
                        : 'border-gray-700 bg-gray-800/50 hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-white text-sm mb-0.5">{action.action}</div>
                      <div className="text-xs text-gray-400">{action.impact}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Lifecycle Timeline */}
      <div>
        <h3 className="text-xl font-bold mb-4">Your Homeownership Journey</h3>
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-800" />
          <div className="space-y-4">
            {LIFECYCLE_STAGES.map((stage, index) => {
              const isActive = stage.id === currentStage
              const completedIndex = LIFECYCLE_STAGES.findIndex((s) => s.id === currentStage)
              const isCompleted = index < completedIndex

              return (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative flex items-start gap-4"
                >
                  <div className="relative z-10 flex-shrink-0">
                    {isCompleted ? (
                      <div className="w-12 h-12 rounded-full bg-[#06b6d4] flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                    ) : isActive ? (
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${stage.color} flex items-center justify-center`}>
                        {stage.icon}
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center">
                        {stage.icon}
                      </div>
                    )}
                  </div>
                  <div
                    className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                      isActive ? `border-[#06b6d4] bg-gradient-to-br ${stage.color} bg-opacity-20` : 'border-gray-800 bg-gray-900/50'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="text-lg font-bold">{stage.title}</h4>
                        <p className="text-sm text-gray-400">{stage.description}</p>
                      </div>
                      {isActive && (
                        <span className="px-2 py-0.5 rounded-full bg-[#06b6d4] text-white text-xs font-semibold">
                          Current Stage
                        </span>
                      )}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-800 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="text-xs text-gray-400">Recommended Action</div>
                        <div className="text-sm font-semibold">{stage.recommendedAction}</div>
                      </div>
                      <Link
                        href={stage.link}
                        className="px-3 py-1.5 rounded-lg bg-[#06b6d4] hover:bg-[#0891b2] transition-colors text-white text-sm font-semibold flex items-center gap-1"
                      >
                        Find My Savings →
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Cross-Ecosystem Recommendations */}
      {!compact && (
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
          <h3 className="text-lg font-bold mb-4">Recommended Next Steps</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/customized-journey"
              className="p-4 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-[#06b6d4] transition-colors"
            >
              <TrendingDown className="w-6 h-6 text-[#06b6d4] mb-2" />
              <h4 className="font-bold text-sm mb-1">Personalized Journey</h4>
              <p className="text-xs text-gray-400">First-time buyer steps and tools</p>
            </Link>
            <Link
              href="/repeat-buyer-suite"
              className="p-4 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-purple-600 transition-colors"
            >
              <TrendingUp className="w-6 h-6 text-purple-600 mb-2" />
              <h4 className="font-bold text-sm mb-1">Repeat Buyer Suite</h4>
              <p className="text-xs text-gray-400">Leverage equity and upgrade strategy</p>
            </Link>
            <Link
              href="/refinance-optimizer"
              className="p-4 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-green-600 transition-colors"
            >
              <RefreshCw className="w-6 h-6 text-green-600 mb-2" />
              <h4 className="font-bold text-sm mb-1">Refinance Optimizer</h4>
              <p className="text-xs text-gray-400">Monitor rates and refinance strategy</p>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

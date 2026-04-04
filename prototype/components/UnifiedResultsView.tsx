/**
 * Unified Results View
 * Combines Journey Map and Standard financial views into one engaging experience
 * Consumer app best practices: progressive disclosure, visual storytelling, actionable insights
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
  Home,
  DollarSign,
  Zap,
  Target,
  AlertTriangle,
  CheckCircle,
  Trophy,
  Star,
  ArrowRight,
  Lock,
  Crown,
  PiggyBank,
  TrendingUp,
  Shield,
  FileText,
  Sparkles,
  ChevronDown,
  ChevronUp,
  MapPin,
  BarChart3,
  Calculator,
  TrendingDown,
  Info,
} from 'lucide-react'
import type { QuizData, AffordabilityResult, ReadinessScore, CostBreakdown, SavingsOpportunity } from '@/lib/calculations'
import { formatCurrency } from '@/lib/calculations'
import type { UserTier } from '@/lib/tiers'
import type { RepeatBuyerData, RepeatBuyerAnalysis } from '@/lib/calculations-repeat-buyer'
import type { RefinanceData, RefinanceAnalysis } from '@/lib/calculations-refinance'

interface UnifiedResultsViewProps {
  // First-time buyer props
  quizData?: QuizData
  affordability?: AffordabilityResult
  readiness?: ReadinessScore
  costs?: CostBreakdown
  savingsOpportunities?: SavingsOpportunity[]
  actionItems?: Array<{ title: string; description: string; impact: string }>
  // Repeat buyer props
  repeatBuyerData?: RepeatBuyerData
  repeatBuyerAnalysis?: RepeatBuyerAnalysis
  // Refinance props
  refinanceData?: RefinanceData
  refinanceAnalysis?: RefinanceAnalysis
  // Common props
  transactionType: 'first-time' | 'repeat-buyer' | 'refinance'
  userTier: UserTier
  onUpgrade?: () => void
}

export default function UnifiedResultsView({
  quizData,
  affordability,
  readiness,
  costs,
  savingsOpportunities = [],
  actionItems = [],
  repeatBuyerData,
  repeatBuyerAnalysis,
  refinanceData,
  refinanceAnalysis,
  transactionType,
  userTier,
  onUpgrade,
}: UnifiedResultsViewProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [activeMilestone, setActiveMilestone] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ container: containerRef })

  // Calculate key metrics based on transaction type
  const getKeyMetrics = () => {
    if (transactionType === 'first-time' && affordability && costs) {
      return {
        primary: {
          label: 'You Can Afford',
          value: formatCurrency(affordability.realisticMax),
          sublabel: 'Based on 28/36 rule',
          icon: Home,
          color: 'text-[#10b981]',
        },
        secondary: [
          {
            label: 'Monthly Payment',
            value: formatCurrency(costs.monthlyPayment.total),
            icon: DollarSign,
          },
          {
            label: 'Down Payment',
            value: formatCurrency(costs.downPayment),
            icon: PiggyBank,
          },
          {
            label: 'Readiness Score',
            value: `${readiness?.total || 0}/100`,
            icon: Target,
          },
        ],
      }
    }
    if (transactionType === 'repeat-buyer' && repeatBuyerAnalysis) {
      return {
        primary: {
          label: 'Net Proceeds',
          value: formatCurrency(repeatBuyerAnalysis.saleProceeds.netProceeds),
          sublabel: 'After all costs',
          icon: TrendingUp,
          color: 'text-[#10b981]',
        },
        secondary: [
          {
            label: 'Equity Position',
            value: `${Math.round(repeatBuyerAnalysis.equityPosition.equityPercent)}%`,
            icon: Home,
          },
          {
            label: 'Timing Risk',
            value: repeatBuyerAnalysis.timing.riskLevel,
            icon: AlertTriangle,
          },
        ],
      }
    }
    if (transactionType === 'refinance' && refinanceAnalysis) {
      return {
        primary: {
          label: 'Net Savings',
          value: formatCurrency(refinanceAnalysis.lifetimeAnalysis.netSavings),
          sublabel: 'Over loan life',
          icon: TrendingDown,
          color: refinanceAnalysis.lifetimeAnalysis.netSavings >= 0 ? 'text-[#10b981]' : 'text-red-400',
        },
        secondary: [
          {
            label: 'Break-Even',
            value: `${refinanceAnalysis.breakEvenAnalysis.breakEvenMonths} months`,
            icon: Target,
          },
          {
            label: 'New Rate',
            value: `${refinanceAnalysis.newLoanOptions.rateAndTerm.newRate.toFixed(2)}%`,
            icon: BarChart3,
          },
        ],
      }
    }
    return null
  }

  const metrics = getKeyMetrics()

  // Define journey milestones with embedded financial insights
  const getMilestones = () => {
    if (transactionType === 'first-time') {
      return [
        {
          id: 'affordability',
          title: 'Know Your Numbers',
          description: 'Understanding what you can truly afford',
          progress: readiness ? (readiness.total / 100) * 100 : 0,
          financial: affordability ? {
            maxApproved: affordability.maxApproved,
            realisticMax: affordability.realisticMax,
            monthlyPayment: costs?.monthlyPayment.total || 0,
          } : null,
          icon: Calculator,
          color: 'from-blue-500 to-cyan-500',
        },
        {
          id: 'preparation',
          title: 'Get Ready',
          description: 'Build your readiness score',
          progress: readiness ? readiness.total : 0,
          financial: readiness ? {
            creditScore: readiness.breakdown.creditScore,
            dtiRatio: readiness.breakdown.dtiRatio,
            downPayment: readiness.breakdown.downPayment,
          } : null,
          icon: Target,
          color: 'from-purple-500 to-pink-500',
        },
        {
          id: 'costs',
          title: 'Every Dollar Counts',
          description: 'See the full cost breakdown',
          progress: 75,
          financial: costs ? {
            closingCosts: costs.closingCosts.total,
            downPayment: costs.downPayment,
            totalCost: costs.lifetimeCosts.totalPaid,
          } : null,
          icon: DollarSign,
          color: 'from-green-500 to-emerald-500',
        },
        {
          id: 'savings',
          title: 'Save Smart',
          description: 'Opportunities to reduce costs',
          progress: savingsOpportunities.length > 0 ? 80 : 0,
          financial: savingsOpportunities.length > 0 ? {
            totalSavings: savingsOpportunities.reduce((sum, opp) => sum + (opp.savingsMin + opp.savingsMax) / 2, 0),
            opportunities: savingsOpportunities.length,
          } : null,
          icon: PiggyBank,
          color: 'from-yellow-500 to-orange-500',
        },
        {
          id: 'action',
          title: 'Take Action',
          description: 'Your personalized action plan',
          progress: actionItems.length > 0 ? 90 : 0,
          financial: null,
          icon: Zap,
          color: 'from-red-500 to-rose-500',
        },
      ]
    }
    // Add milestones for other transaction types...
    return []
  }

  const milestones = getMilestones()

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }))
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveMilestone(sectionId)
    }
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5] relative">
      {/* Sticky Summary Sidebar */}
      {metrics && (
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="fixed left-0 top-1/2 -translate-y-1/2 z-40 hidden lg:block"
        >
          <div className="bg-gray-900/95 backdrop-blur-sm border-r border-gray-800 rounded-r-2xl p-6 shadow-2xl w-80">
            {/* Primary Metric */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <metrics.primary.icon className={`w-6 h-6 ${metrics.primary.color}`} />
                <span className="text-sm text-gray-400">{metrics.primary.label}</span>
              </div>
              <div className={`text-3xl font-bold ${metrics.primary.color} mb-1`}>
                {metrics.primary.value}
              </div>
              {metrics.primary.sublabel && (
                <div className="text-xs text-gray-500">{metrics.primary.sublabel}</div>
              )}
            </div>

            {/* Secondary Metrics */}
            <div className="space-y-4 border-t border-gray-800 pt-4">
              {metrics.secondary.map((metric, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <metric.icon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-400">{metric.label}</span>
                  </div>
                  <span className="text-sm font-semibold">{metric.value}</span>
                </div>
              ))}
            </div>

            {/* Quick Navigation */}
            <div className="mt-6 pt-4 border-t border-gray-800">
              <div className="text-xs text-gray-500 mb-3">Quick Navigation</div>
              <div className="space-y-2">
                {milestones.map((milestone) => (
                  <button
                    key={milestone.id}
                    onClick={() => scrollToSection(milestone.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                      activeMilestone === milestone.id
                        ? 'bg-[#06b6d4]/20 text-[#06b6d4]'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    {milestone.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className={`${metrics ? 'lg:ml-80' : ''} transition-all duration-300`}>
        {/* Hero Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#0a0a0a] via-[#0f172a] to-[#0a0a0a]">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-[#f5f5f5] to-[#06b6d4] bg-clip-text text-transparent">
                Your home buying Journey
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Track your progress and see exactly where every dollar goes
              </p>
            </motion.div>

            {/* Mobile Summary Cards */}
            {metrics && (
              <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-800"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <metrics.primary.icon className={`w-5 h-5 ${metrics.primary.color}`} />
                    <span className="text-sm text-gray-400">{metrics.primary.label}</span>
                  </div>
                  <div className={`text-2xl font-bold ${metrics.primary.color}`}>
                    {metrics.primary.value}
                  </div>
                  {metrics.primary.sublabel && (
                    <div className="text-xs text-gray-500 mt-1">{metrics.primary.sublabel}</div>
                  )}
                </motion.div>
                {metrics.secondary.map((metric, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (idx + 1) * 0.1 }}
                    className="bg-gray-900/50 rounded-xl p-4 border border-gray-800"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <metric.icon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-400">{metric.label}</span>
                      </div>
                      <span className="text-sm font-semibold">{metric.value}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Journey Milestones with Embedded Financial Data */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.id}
                  id={milestone.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  {/* Milestone Card */}
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-800 hover:border-[#06b6d4]/50 transition-all duration-300">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Left: Milestone Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${milestone.color} flex items-center justify-center shadow-lg`}>
                            <milestone.icon className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold mb-1">{milestone.title}</h2>
                            <p className="text-gray-400">{milestone.description}</p>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-6">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">Progress</span>
                            <span className="text-sm font-semibold">{Math.round(milestone.progress)}%</span>
                          </div>
                          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: `${milestone.progress}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 1, delay: index * 0.2 }}
                              className={`h-full bg-gradient-to-r ${milestone.color}`}
                            />
                          </div>
                        </div>

                        {/* Financial Insights Embedded */}
                        {milestone.financial && (
                          <div className="bg-gray-800/50 rounded-xl p-4 mb-4">
                            <div className="flex items-center gap-2 mb-3">
                              <DollarSign className="w-4 h-4 text-[#06b6d4]" />
                              <span className="text-sm font-semibold text-[#06b6d4]">Key Numbers</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              {Object.entries(milestone.financial).map(([key, value]) => (
                                <div key={key}>
                                  <div className="text-xs text-gray-500 mb-1 capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                  </div>
                                  <div className="text-lg font-bold">
                                    {typeof value === 'number' ? formatCurrency(value) : value}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right: Expandable Details */}
                      <div className="lg:w-96">
                        <button
                          onClick={() => toggleSection(milestone.id)}
                          className="w-full flex items-center justify-between p-4 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-colors"
                        >
                          <span className="text-sm font-semibold">
                            {expandedSections[milestone.id] ? 'Hide Details' : 'Show Details'}
                          </span>
                          {expandedSections[milestone.id] ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </button>

                        {expandedSections[milestone.id] && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 space-y-4"
                          >
                            {milestone.id === 'affordability' && affordability && (
                              <AffordabilityDetails affordability={affordability} />
                            )}
                            {milestone.id === 'costs' && costs && (
                              <CostBreakdownDetails costs={costs} />
                            )}
                            {milestone.id === 'savings' && savingsOpportunities.length > 0 && (
                              <SavingsDetails opportunities={savingsOpportunities} />
                            )}
                            {milestone.id === 'action' && actionItems.length > 0 && (
                              <ActionItemsDetails items={actionItems} />
                            )}
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

// Detail Components
function AffordabilityDetails({ affordability }: { affordability: AffordabilityResult }) {
  return (
    <div className="bg-gray-800/30 rounded-lg p-4 space-y-3">
      <div className="flex justify-between">
        <span className="text-sm text-gray-400">Lender Max Approval</span>
        <span className="text-sm font-semibold">{formatCurrency(affordability.maxApproved)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-400">Realistic Max (28/36 Rule)</span>
        <span className="text-sm font-semibold text-[#10b981]">{formatCurrency(affordability.realisticMax)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-400">Interest Rate</span>
        <span className="text-sm font-semibold">{(affordability.interestRate * 100).toFixed(2)}%</span>
      </div>
    </div>
  )
}

function CostBreakdownDetails({ costs }: { costs: CostBreakdown }) {
  return (
    <div className="bg-gray-800/30 rounded-lg p-4 space-y-3">
      <div className="flex justify-between">
        <span className="text-sm text-gray-400">Down Payment</span>
        <span className="text-sm font-semibold">{formatCurrency(costs.downPayment)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-400">Closing Costs</span>
        <span className="text-sm font-semibold">{formatCurrency(costs.closingCosts.total)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-400">Total Upfront</span>
        <span className="text-sm font-semibold text-[#06b6d4]">
          {formatCurrency(costs.downPayment + costs.closingCosts.total)}
        </span>
      </div>
    </div>
  )
}

function SavingsDetails({ opportunities }: { opportunities: SavingsOpportunity[] }) {
  const totalSavings = opportunities.reduce((sum, opp) => sum + (opp.savingsMin + opp.savingsMax) / 2, 0)
  return (
    <div className="bg-gray-800/30 rounded-lg p-4 space-y-3">
      <div className="flex justify-between mb-3">
        <span className="text-sm font-semibold">Total Potential Savings</span>
        <span className="text-sm font-bold text-[#10b981]">{formatCurrency(totalSavings)}</span>
      </div>
      {opportunities.slice(0, 3).map((opp) => {
        const avgSavings = (opp.savingsMin + opp.savingsMax) / 2
        return (
          <div key={opp.id} className="flex justify-between text-sm">
            <span className="text-gray-400">{opp.title}</span>
            <span className="font-semibold">{formatCurrency(avgSavings)}</span>
          </div>
        )
      })}
    </div>
  )
}

function ActionItemsDetails({ items }: { items: Array<{ title: string; description: string; impact: string }> }) {
  return (
    <div className="bg-gray-800/30 rounded-lg p-4 space-y-3">
      {items.slice(0, 3).map((item, idx) => (
        <div key={idx} className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-[#10b981] mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-sm font-semibold mb-1">{item.title}</div>
            <div className="text-xs text-gray-400">{item.impact}</div>
          </div>
        </div>
      ))}
    </div>
  )
}


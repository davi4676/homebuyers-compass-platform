'use client'

import { motion } from 'framer-motion'
import {
  Home,
  DollarSign,
  Zap,
  Target,
  AlertTriangle,
  CheckCircle,
  Trophy,
  Star,
  MapPin,
  ArrowRight,
  Lock,
  Crown,
  PiggyBank,
  TrendingUp,
  Shield,
  FileText,
  Sparkles,
} from 'lucide-react'
import { useState } from 'react'
import type { QuizData, AffordabilityResult, ReadinessScore, CostBreakdown, SavingsOpportunity } from '@/lib/calculations'
import { formatCurrency } from '@/lib/calculations'
import type { UserTier } from '@/lib/tiers'
import type { RepeatBuyerData, RepeatBuyerAnalysis } from '@/lib/calculations-repeat-buyer'
import type { RefinanceData, RefinanceAnalysis } from '@/lib/calculations-refinance'

interface JourneyMapViewProps {
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

export default function JourneyMapView({
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
}: JourneyMapViewProps) {
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null)
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([])

  // Adapter functions to normalize data across transaction types
  const getReadinessScore = (): number => {
    if (transactionType === 'first-time' && readiness) {
      return readiness.total
    }
    if (transactionType === 'repeat-buyer' && repeatBuyerAnalysis) {
      // Calculate readiness based on equity position, sale proceeds, and timing
      const equityScore = Math.min((repeatBuyerAnalysis.equityPosition.equityPercent / 20) * 100, 100)
      const proceedsScore = repeatBuyerAnalysis.saleProceeds.netProceeds > 0 ? 80 : 40
      const timingScore = repeatBuyerAnalysis.timing.riskLevel === 'low' ? 90 : repeatBuyerAnalysis.timing.riskLevel === 'medium' ? 70 : 50
      return Math.round((equityScore + proceedsScore + timingScore) / 3)
    }
    if (transactionType === 'refinance' && refinanceAnalysis) {
      // Calculate readiness based on break-even and savings
      const breakEvenScore = refinanceAnalysis.breakEvenAnalysis.worthIt ? 90 : 50
      const savingsScore = refinanceAnalysis.lifetimeAnalysis.netSavings > 0 ? 85 : 40
      const ltvScore = refinanceAnalysis.currentSituation.ltv < 80 ? 90 : refinanceAnalysis.currentSituation.ltv < 90 ? 70 : 50
      return Math.round((breakEvenScore + savingsScore + ltvScore) / 3)
    }
    return 50 // Default
  }

  const getAffordabilityMax = (): number => {
    if (transactionType === 'first-time' && affordability) {
      return affordability.realisticMax
    }
    if (transactionType === 'repeat-buyer' && repeatBuyerAnalysis) {
      return repeatBuyerAnalysis.comparison.newHome.targetPrice
    }
    if (transactionType === 'refinance' && refinanceAnalysis) {
      return refinanceAnalysis.currentSituation.homeValue
    }
    return 0
  }

  const getClosingCosts = (): number => {
    if (transactionType === 'first-time' && costs) {
      return costs.closingCosts.total
    }
    if (transactionType === 'repeat-buyer' && repeatBuyerAnalysis) {
      return repeatBuyerAnalysis.saleProceeds.sellerClosingCosts + repeatBuyerAnalysis.saleProceeds.agentCommission
    }
    if (transactionType === 'refinance' && refinanceAnalysis) {
      return refinanceAnalysis.breakEvenAnalysis.closingCosts
    }
    return 0
  }

  const getDownPayment = (): number => {
    if (transactionType === 'first-time' && quizData) {
      return quizData.downPayment
    }
    if (transactionType === 'repeat-buyer' && repeatBuyerAnalysis) {
      return repeatBuyerAnalysis.newPurchase.totalDownPayment
    }
    return 0
  }

  const getSavingsOpportunities = (): SavingsOpportunity[] => {
    if (transactionType === 'first-time' && savingsOpportunities) {
      return savingsOpportunities
    }
    // Create savings opportunities from repeat buyer or refinance analysis
    const opps: SavingsOpportunity[] = []
    if (transactionType === 'repeat-buyer' && repeatBuyerAnalysis) {
      if (repeatBuyerAnalysis.saleProceeds.agentCommission > 0) {
        opps.push({
          id: 'commission-negotiation',
          title: 'Negotiate Agent Commission',
          description: 'You can often negotiate commission down from 6% to 4.5-5%',
          savingsMin: repeatBuyerAnalysis.saleProceeds.agentCommission * 0.15,
          savingsMax: repeatBuyerAnalysis.saleProceeds.agentCommission * 0.25,
          difficulty: 'medium',
          priority: 1,
          actionSteps: ['Research local commission rates', 'Interview multiple agents', 'Negotiate before signing listing agreement'],
          category: 'negotiation',
        })
      }
      if (repeatBuyerAnalysis.saleProceeds.taxes.taxLiability > 0) {
        opps.push({
          id: 'tax-strategy',
          title: 'Optimize Tax Strategy',
          description: 'Consider timing sale to maximize capital gains exclusion',
          savingsMin: repeatBuyerAnalysis.saleProceeds.taxes.taxLiability * 0.5,
          savingsMax: repeatBuyerAnalysis.saleProceeds.taxes.taxLiability,
          difficulty: 'hard',
          priority: 2,
          actionSteps: ['Consult with tax professional', 'Review ownership timeline', 'Consider 1031 exchange if applicable'],
          category: 'tax',
        })
      }
    }
    if (transactionType === 'refinance' && refinanceAnalysis) {
      if (refinanceAnalysis.lifetimeAnalysis.netSavings > 0) {
        opps.push({
          id: 'refinance-savings',
          title: 'Refinance Savings',
          description: `Save ${formatCurrency(refinanceAnalysis.lifetimeAnalysis.netSavings)} over loan lifetime`,
          savingsMin: refinanceAnalysis.lifetimeAnalysis.netSavings * 0.8,
          savingsMax: refinanceAnalysis.lifetimeAnalysis.netSavings,
          difficulty: 'medium',
          priority: 1,
          actionSteps: ['Compare rates from multiple lenders', 'Calculate break-even point', 'Lock in rate when ready'],
          category: 'refinance',
        })
      }
      if (refinanceAnalysis.breakEvenAnalysis.monthlySavings > 0) {
        opps.push({
          id: 'monthly-savings',
          title: 'Monthly Payment Reduction',
          description: `Save ${formatCurrency(refinanceAnalysis.breakEvenAnalysis.monthlySavings)} per month`,
          savingsMin: refinanceAnalysis.breakEvenAnalysis.monthlySavings * 12,
          savingsMax: refinanceAnalysis.breakEvenAnalysis.monthlySavings * 12 * 2,
          difficulty: 'easy',
          priority: 2,
          actionSteps: ['Review current rate vs market rates', 'Calculate monthly savings', 'Apply for refinance'],
          category: 'payment',
        })
      }
    }
    return opps
  }

  const getActionItems = (): Array<{ title: string; description: string; impact: string }> => {
    if (transactionType === 'first-time' && actionItems) {
      return actionItems
    }
    const items: Array<{ title: string; description: string; impact: string }> = []
    if (transactionType === 'repeat-buyer' && repeatBuyerAnalysis) {
      items.push({
        title: 'Coordinate Sale and Purchase',
        description: repeatBuyerAnalysis.timing.reasoning,
        impact: repeatBuyerAnalysis.timing.riskLevel === 'low' ? 'Low Risk' : 'Medium Risk',
      })
      if (repeatBuyerAnalysis.saleProceeds.taxes.taxLiability > 0) {
        items.push({
          title: 'Plan for Capital Gains Tax',
          description: `You may owe ${formatCurrency(repeatBuyerAnalysis.saleProceeds.taxes.taxLiability)} in taxes`,
          impact: 'High Impact',
        })
      }
    }
    if (transactionType === 'refinance' && refinanceAnalysis) {
      items.push({
        title: refinanceAnalysis.recommendation.bestOption === 'dont-refinance' ? 'Consider Waiting' : 'Proceed with Refinance',
        description: refinanceAnalysis.recommendation.reasoning,
        impact: refinanceAnalysis.recommendation.confidence === 'high' ? 'High Confidence' : 'Medium Confidence',
      })
      if (refinanceAnalysis.breakEvenAnalysis.breakEvenMonths > 0) {
        items.push({
          title: 'Break-Even Analysis',
          description: `You'll break even in ${refinanceAnalysis.breakEvenAnalysis.breakEvenMonths} months`,
          impact: refinanceAnalysis.breakEvenAnalysis.worthIt ? 'Worth It' : 'Consider Carefully',
        })
      }
    }
    return items
  }

  const readinessScore = getReadinessScore()
  const affordabilityMax = getAffordabilityMax()
  const closingCosts = getClosingCosts()
  const downPayment = getDownPayment()
  const adaptedSavingsOpps = getSavingsOpportunities()
  const adaptedActionItems = getActionItems()

  // Calculate journey progress
  const totalMilestones = 8
  const completedMilestones = Math.min(
    Math.floor((readinessScore / 100) * totalMilestones),
    totalMilestones
  )
  const journeyProgress = (completedMilestones / totalMilestones) * 100

  // Milestones along the journey with expert insights
  const milestones = [
    {
      id: 'start',
      title: 'Journey Begins',
      icon: Home,
      color: 'from-[#06b6d4] to-[#0891b2]',
      position: 0,
      unlocked: true,
      description: 'You\'ve started your home buying journey!',
      stats: { label: 'Readiness Score', value: `${readinessScore}/100` },
      freddieMacInsight: 'Before shopping for a home, determine how much you can afford based on your spending plan and comfort level. Talk to a homeownership education counselor (call 800-569-4287) to learn the basics and evaluate your financial readiness.',
    },
    {
      id: 'affordability',
      title: 'Know Your Numbers',
      icon: DollarSign,
      color: 'from-[#10b981] to-[#06b6d4]',
      position: 12.5,
      unlocked: true,
      description: transactionType === 'first-time' 
        ? `You can afford ${formatCurrency(affordabilityMax)}`
        : transactionType === 'repeat-buyer'
        ? `Target home price: ${formatCurrency(affordabilityMax)}`
        : `Current home value: ${formatCurrency(affordabilityMax)}`,
      stats: { 
        label: transactionType === 'first-time' ? 'Realistic Max' : transactionType === 'repeat-buyer' ? 'Target Price' : 'Home Value', 
        value: formatCurrency(affordabilityMax) 
      },
      freddieMacInsight: 'Talk to a loan officer to review your income and expenses, which determines the type and amount of mortgage loan you qualify for. Remember: what lenders approve you for may be too much—focus on what you can actually afford without being house-poor.',
    },
    {
      id: 'costs',
      title: 'Understand All Costs',
      icon: FileText,
      color: 'from-[#f97316] to-[#ea580c]',
      position: 25,
      unlocked: true,
      description: `Total closing costs: ${formatCurrency(closingCosts)}`,
      stats: { label: 'Closing Costs', value: formatCurrency(closingCosts) },
      freddieMacInsight: 'Closing costs include points, taxes, title insurance, financing costs, and items that must be prepaid or escrowed. Your lender must provide you with a Loan Estimate within 3 business days of application and a Closing Disclosure before closing. Compare the APR (Annual Percentage Rate), which combines interest rate with all fees.',
    },
    {
      id: 'savings',
      title: 'Find Savings',
      icon: Zap,
      color: 'from-[#f59e0b] to-[#f97316]',
      position: 37.5,
      unlocked: savingsOpportunities.length > 0,
      description: `${adaptedSavingsOpps.length} ways to save money`,
      stats: { label: 'Opportunities', value: adaptedSavingsOpps.length },
      freddieMacInsight: 'Shop around! Always talk to several lenders to find the best mortgage loan. A mortgage product may seem reasonable until compared with similar products from other lenders. Ask for written estimates that include all points and fees, and question any items you didn\'t request.',
    },
    {
      id: 'funding',
      title: 'Secure Funding',
      icon: PiggyBank,
      color: 'from-[#10b981] to-[#06b6d4]',
      position: 50,
      unlocked: downPayment > 0,
      description: transactionType === 'first-time' 
        ? `Down payment: ${formatCurrency(downPayment)}`
        : transactionType === 'repeat-buyer'
        ? `Available for down payment: ${formatCurrency(downPayment)}`
        : 'Refinance analysis complete',
      stats: { 
        label: transactionType === 'first-time' ? 'Down Payment' : transactionType === 'repeat-buyer' ? 'Available Funds' : 'Analysis', 
        value: transactionType === 'refinance' ? 'Complete' : formatCurrency(downPayment) 
      },
      freddieMacInsight: 'The down payment is a portion of the home price paid upfront and not part of your mortgage. If you make a down payment of less than 20%, your lender will generally require mortgage insurance (PMI), which protects the lender if you default. Consider all funding sources and understand the total package before committing.',
    },
    {
      id: 'protection',
      title: 'Avoid Red Flags',
      icon: Shield,
      color: 'from-[#ef4444] to-[#dc2626]',
      position: 62.5,
      unlocked: readinessScore >= 50,
      description: 'Learn to spot scams and overcharges',
      stats: { label: 'Protection Level', value: readinessScore >= 70 ? 'High' : 'Medium' },
      freddieMacInsight: 'Say NO to "easy money." Beware if someone claims your "credit problems won\'t affect the interest rate." Never falsify information or sign documents with incorrect dates or blank fields. Make sure documents are complete and correct. If you\'re not sure, don\'t sign—get advice first from a reputable housing counselor.',
    },
    {
      id: 'resources',
      title: 'Get Your Toolkit',
      icon: Sparkles,
      color: 'from-[#06b6d4] to-[#0891b2]',
      position: 75,
      unlocked: userTier !== 'foundations',
      description: 'Access all guides and scripts',
      stats: { label: 'Resources', value: userTier !== 'foundations' ? 'Unlocked' : 'Locked' },
      freddieMacInsight: 'Understanding the people involved in your transaction is important: loan officers, real estate professionals, appraisers, home inspectors, and closing representatives. Each provides a specific service to help you become a homeowner. Know their roles and what to expect from each.',
    },
    {
      id: 'finish',
      title: 'Ready to Buy!',
      icon: Trophy,
      color: 'from-[#10b981] to-[#06b6d4]',
      position: 100,
      unlocked: readinessScore >= 70,
      description: transactionType === 'first-time' 
        ? 'You\'re ready to start shopping!'
        : transactionType === 'repeat-buyer'
        ? 'You\'re ready to coordinate your sale and purchase!'
        : 'You\'re ready to refinance!',
      stats: { label: 'Status', value: readinessScore >= 70 ? 'Ready' : 'Almost There' },
      freddieMacInsight: 'Before closing, review your Loan Estimate and Closing Disclosure carefully. Understand all fees, your payment schedule, interest rate, APR, and any prepayment penalties. At closing, you\'ll sign the mortgage note (your promise to repay) and the mortgage document (grants the lender a lien on your home). After closing, keep your home by making payments on time and maintaining the property.',
    },
  ]

  // Achievements
  const achievements = [
    {
      id: 'first-step',
      title: 'First Steps',
      icon: Star,
      description: 'Completed your affordability analysis',
      unlocked: true,
      points: 10,
    },
    {
      id: 'cost-master',
      title: 'Cost Master',
      icon: DollarSign,
      description: 'Reviewed all closing costs',
      unlocked: true,
      points: 25,
    },
    {
      id: 'saver',
      title: 'Super Saver',
      icon: Zap,
                  description: `Found ${adaptedSavingsOpps.length} savings opportunities`,
                  unlocked: adaptedSavingsOpps.length >= 3,
      points: 50,
    },
    {
      id: 'ready',
      title: 'Homebuyer Ready',
      icon: Trophy,
                  description: 'Achieved 70+ readiness score',
                  unlocked: readinessScore >= 70,
      points: 100,
    },
    {
      id: 'expert',
      title: 'home buying Expert',
      icon: Crown,
                  description: 'Achieved 90+ readiness score',
                  unlocked: readinessScore >= 90,
      points: 200,
    },
  ]

  const totalPoints = achievements
    .filter(a => a.unlocked)
    .reduce((sum, a) => sum + a.points, 0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0f172a] to-[#0a0a0a] text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-md bg-[#0a0a0a]/80 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <MapPin className="text-[#06b6d4]" size={24} />
                <h1 className="text-3xl font-bold">Your home buying Journey</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-gray-800/50 rounded-lg px-4 py-2 border border-gray-700">
                <div className="text-xs text-gray-400 mb-1">Total Points</div>
                <div className="text-2xl font-bold text-[#f97316]">{totalPoints}</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg px-4 py-2 border border-gray-700">
                <div className="text-xs text-gray-400 mb-1">Level</div>
                <div className="text-2xl font-bold text-[#06b6d4]">
                  {Math.floor(totalPoints / 100) + 1}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Overview */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/50 border-2 border-gray-800 rounded-xl p-8 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl font-bold">Journey Progress</h2>
              <div className="text-3xl font-bold text-[#06b6d4]">{Math.round(journeyProgress)}%</div>
            </div>
            <div className="relative h-4 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#06b6d4] to-[#10b981]"
                initial={{ width: 0 }}
                animate={{ width: `${journeyProgress}%` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
            </div>
            <div className="flex items-center justify-between mt-4 text-base text-gray-400">
              <span>{completedMilestones} of {totalMilestones} milestones completed</span>
              <span>{readinessScore}/100 Readiness Score</span>
            </div>
          </div>
        </div>

        {/* Journey Map */}
        <div className="relative mb-12 min-h-[400px] md:min-h-[600px]">
          {/* Path Line - Hidden on mobile, shown on desktop */}
          <div className="hidden md:block absolute left-0 right-0 top-1/2 h-1 bg-gray-800 -translate-y-1/2" />
          <motion.div
            className="hidden md:block absolute left-0 top-1/2 h-1 bg-gradient-to-r from-[#06b6d4] to-[#10b981] -translate-y-1/2"
            initial={{ width: 0 }}
            animate={{ width: `${journeyProgress}%` }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />

          {/* Milestones - Desktop: Horizontal Layout */}
          <div className="hidden md:block relative" style={{ minHeight: '400px' }}>
            {milestones.map((milestone, index) => {
              const Icon = milestone.icon
              const isUnlocked = milestone.unlocked
              const isSelected = selectedMilestone === milestone.id
              
              // Alternate labels above and below to prevent overlap
              // Check if nearby milestones would overlap (within 20% of journey)
              const nearbyMilestones = milestones.filter((m, i) => 
                i !== index && Math.abs(m.position - milestone.position) < 20
              )
              // Determine label position: alternate, but ensure nearby ones are opposite
              let labelPosition: 'top' | 'bottom' = index % 2 === 0 ? 'bottom' : 'top'
              
              // If there's a nearby milestone on the same side, flip this one
              if (nearbyMilestones.length > 0) {
                const nearbyIndex = milestones.findIndex(m => m.id === nearbyMilestones[0].id)
                if (nearbyIndex % 2 === index % 2) {
                  labelPosition = labelPosition === 'top' ? 'bottom' : 'top'
                }
              }

              return (
                <div
                  key={milestone.id}
                  className="absolute top-1/2 -translate-y-1/2"
                  style={{ left: `${milestone.position}%`, transform: 'translate(-50%, -50%)' }}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setSelectedMilestone(isSelected ? null : milestone.id)}
                    className={`relative cursor-pointer group ${
                      isUnlocked ? '' : 'opacity-50'
                    }`}
                    style={{ zIndex: isSelected ? 50 : 10 + index }}
                  >

                    {/* Milestone Circle */}
                    <div
                      className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all ${
                        isUnlocked
                          ? `bg-gradient-to-br ${milestone.color} border-white shadow-lg shadow-${milestone.color.split(' ')[1]}/50`
                          : 'bg-gray-800 border-gray-700'
                      } ${isSelected ? 'scale-125' : 'hover:scale-110'}`}
                    >
                      {isUnlocked ? (
                        <Icon className="text-white" size={32} />
                      ) : (
                        <Lock className="text-gray-500" size={32} />
                      )}
                    </div>

                    {/* Milestone Label - Positioned above or below to prevent overlap */}
                    <div 
                      className={`absolute left-1/2 -translate-x-1/2 w-48 max-w-[200px] ${
                        labelPosition === 'top' 
                          ? 'bottom-full mb-4' 
                          : 'top-full mt-4'
                      }`}
                      style={{ 
                        zIndex: isSelected ? 100 : 20 + index,
                        // Prevent horizontal overflow for edge milestones
                        left: milestone.position < 10 ? '0%' : milestone.position > 90 ? '100%' : '50%',
                        transform: milestone.position < 10 
                          ? 'translateX(0)' 
                          : milestone.position > 90 
                          ? 'translateX(-100%)' 
                          : 'translateX(-50%)'
                      }}
                    >
                      <div
                        className={`text-center p-3 rounded-lg border-2 transition-all ${
                          isSelected
                            ? `bg-gradient-to-br ${milestone.color} border-white shadow-lg`
                            : 'bg-gray-900/80 border-gray-800'
                        }`}
                      >
                        <div className="font-bold text-lg mb-1">{milestone.title}</div>
                        <div className="text-xs text-gray-400">{milestone.description}</div>
                        {isSelected && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-3 pt-3 border-t border-white/20 space-y-3"
                          >
                            <div className="text-xs">
                              <div className="font-semibold mb-1">{milestone.stats.label}</div>
                              <div className="text-xl font-bold">{milestone.stats.value}</div>
                            </div>
                            {milestone.freddieMacInsight && (
                              <div className="text-xs bg-white/10 rounded p-2 border-l-2 border-[#06b6d4]">
                                <div className="font-semibold text-[#06b6d4] mb-1 flex items-center gap-1">
                                  <FileText size={12} />
                                  Expert Insight
                                </div>
                                <div className="text-gray-300 leading-relaxed">
                                  {milestone.freddieMacInsight}
                                </div>
                                <a
                                  href="#"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#06b6d4] hover:text-[#0891b2] text-xs mt-1 inline-flex items-center gap-1 underline"
                                >
                                  Read full guide <ArrowRight size={10} />
                                </a>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </div>
                    </div>

                    {/* Progress Indicator */}
                    {milestone.position <= journeyProgress && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.5, 1] }}
                        className="absolute inset-0 rounded-full bg-white/20 animate-ping"
                      />
                    )}
                  </motion.div>
                </div>
              )
            })}
          </div>

          {/* Milestones - Mobile: Vertical Layout */}
          <div className="md:hidden space-y-8">
            {milestones.map((milestone, index) => {
              const Icon = milestone.icon
              const isUnlocked = milestone.unlocked
              const isSelected = selectedMilestone === milestone.id

              return (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedMilestone(isSelected ? null : milestone.id)}
                  className={`relative cursor-pointer ${
                    isUnlocked ? '' : 'opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Milestone Circle */}
                    <div
                      className={`w-16 h-16 rounded-full border-4 flex items-center justify-center flex-shrink-0 transition-all ${
                        isUnlocked
                          ? `bg-gradient-to-br ${milestone.color} border-white shadow-lg`
                          : 'bg-gray-800 border-gray-700'
                      } ${isSelected ? 'scale-110' : ''}`}
                    >
                      {isUnlocked ? (
                        <Icon className="text-white" size={24} />
                      ) : (
                        <Lock className="text-gray-500" size={24} />
                      )}
                    </div>

                    {/* Milestone Content */}
                    <div
                      className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                        isSelected
                          ? `bg-gradient-to-br ${milestone.color} border-white shadow-lg`
                          : 'bg-gray-900/80 border-gray-800'
                      }`}
                    >
                      <div className="font-bold text-lg mb-1">{milestone.title}</div>
                      <div className="text-sm text-gray-400 mb-2">{milestone.description}</div>
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-3 pt-3 border-t border-white/20 space-y-3"
                        >
                          <div className="text-xs">
                            <div className="font-semibold mb-1">{milestone.stats.label}</div>
                            <div className="text-lg font-bold">{milestone.stats.value}</div>
                          </div>
                          {milestone.freddieMacInsight && (
                            <div className="text-xs bg-white/10 rounded p-2 border-l-2 border-[#06b6d4]">
                              <div className="font-semibold text-[#06b6d4] mb-1 flex items-center gap-1">
                                <FileText size={12} />
                                Expert Insight
                              </div>
                              <div className="text-gray-300 leading-relaxed">
                                {milestone.freddieMacInsight}
                              </div>
                              <a
                                href="#"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#06b6d4] hover:text-[#0891b2] text-xs mt-1 inline-flex items-center gap-1 underline"
                              >
                                Read full guide <ArrowRight size={10} />
                              </a>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </div>

                    {/* Connection Arrow */}
                    {index < milestones.length - 1 && (
                      <div className="absolute left-8 top-full w-0.5 h-8 bg-gray-800" />
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Achievements Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Trophy className="text-[#f97316]" size={24} />
            Achievements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {achievements.map((achievement) => {
              const Icon = achievement.icon
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className={`bg-gradient-to-br from-gray-900/80 to-gray-800/50 border-2 rounded-xl p-6 text-center relative overflow-hidden group ${
                    achievement.unlocked
                      ? 'border-[#f97316] shadow-lg shadow-[#f97316]/20'
                      : 'border-gray-800 opacity-50'
                  }`}
                >
                  {achievement.unlocked && (
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#f97316]/10 rounded-full -mr-8 -mt-8 blur-xl" />
                  )}
                  <div className="relative">
                    <div
                      className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                        achievement.unlocked
                          ? 'bg-gradient-to-br from-[#f97316] to-[#ea580c]'
                          : 'bg-gray-700'
                      }`}
                    >
                      <Icon
                        className={achievement.unlocked ? 'text-white' : 'text-gray-500'}
                        size={32}
                      />
                    </div>
                    <h3 className="font-bold mb-2">{achievement.title}</h3>
                    <p className="text-xs text-gray-400 mb-3">{achievement.description}</p>
                    <div className="flex items-center justify-center gap-1 text-[#f97316] font-bold">
                      <Star size={16} />
                      <span>{achievement.points} pts</span>
                    </div>
                    {!achievement.unlocked && (
                      <div className="mt-3 text-xs text-gray-500">Locked</div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Action Items as Quests */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Target className="text-[#06b6d4]" size={24} />
            Your Quests
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {adaptedActionItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border-2 border-gray-800 rounded-xl p-6 hover:border-[#06b6d4]/50 transition-all relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-[#06b6d4]/5 rounded-full -mr-10 -mt-10 blur-xl group-hover:bg-[#06b6d4]/10 transition-colors" />
                <div className="relative">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-[#06b6d4]/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-[#06b6d4] font-bold text-sm">#{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold mb-2 text-base">{item.title}</h3>
                      <p className="text-sm text-gray-400 mb-3">{item.description}</p>
                      <div className="flex items-center gap-2 text-xs">
                        <Zap className="text-[#f97316]" size={14} />
                        <span className="text-[#f97316] font-semibold">Impact: {item.impact}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-700">
                    <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-[#06b6d4] to-[#10b981]"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.random() * 30 + 10}%` }}
                        transition={{ duration: 1, delay: index * 0.2 }}
                      />
                    </div>
                    <span className="text-xs text-gray-400">In Progress</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Savings Opportunities as Power-Ups */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Zap className="text-[#f97316]" size={24} />
            Power-Ups (Savings Opportunities)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {adaptedSavingsOpps.slice(0, 8).map((opp, index) => (
              <motion.div
                key={opp.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border-2 border-gray-800 rounded-xl p-4 hover:border-[#f97316]/50 hover:scale-105 transition-all relative overflow-hidden group aspect-square"
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#f97316]/5 rounded-full -mr-8 -mt-8 blur-xl group-hover:bg-[#f97316]/10 transition-colors" />
                <div className="relative flex flex-col h-full">
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`w-6 h-6 rounded text-xs font-bold flex items-center justify-center ${
                        opp.priority === 1
                          ? 'bg-red-500 text-white'
                          : opp.priority <= 3
                          ? 'bg-yellow-500 text-white'
                          : 'bg-gray-600 text-white'
                      }`}
                    >
                      #{opp.priority}
                    </div>
                    {userTier === 'foundations' && (
                      <Lock className="text-gray-500" size={14} />
                    )}
                  </div>
                  <h4 className="font-bold text-sm mb-2 line-clamp-2">{opp.title}</h4>
                  <div className="mt-auto">
                    <div className="text-xs text-gray-400 mb-1">Save</div>
                    <div className="text-base font-bold text-[#f97316]">
                      {formatCurrency(opp.savingsMin)}
                    </div>
                    <div className="text-xs text-gray-500">up to {formatCurrency(opp.savingsMax)}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-[#06b6d4]/20 to-[#0891b2]/20 border-2 border-[#06b6d4]/50 rounded-xl p-6 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-[#06b6d4]/10 rounded-full -mr-10 -mt-10 blur-xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="text-[#06b6d4]" size={20} />
                <span className="text-sm font-semibold text-[#06b6d4]">You Can Afford</span>
              </div>
              <div className="text-2xl font-bold text-[#06b6d4] mb-2">
                {formatCurrency(affordabilityMax)}
              </div>
              <div className="text-xs text-gray-400">Realistic maximum</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-[#f97316]/20 to-[#ea580c]/20 border-2 border-[#f97316]/50 rounded-xl p-6 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-[#f97316]/10 rounded-full -mr-10 -mt-10 blur-xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="text-[#f97316]" size={20} />
                <span className="text-sm font-semibold text-[#f97316]">Potential Savings</span>
              </div>
              <div className="text-2xl font-bold text-[#f97316] mb-2">
                {formatCurrency(
                  adaptedSavingsOpps.reduce(
                    (sum, opp) => sum + (opp.savingsMin + opp.savingsMax) / 2,
                    0
                  )
                )}
              </div>
              <div className="text-xs text-gray-400">Across all opportunities</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-[#10b981]/20 to-[#06b6d4]/20 border-2 border-[#10b981]/50 rounded-xl p-6 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-[#10b981]/10 rounded-full -mr-10 -mt-10 blur-xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <Target className="text-[#10b981]" size={20} />
                <span className="text-sm font-semibold text-[#10b981]">Readiness</span>
              </div>
              <div className="text-2xl font-bold text-[#10b981] mb-2">
                {readinessScore}/100
              </div>
              <div className="text-xs text-gray-400">
                {transactionType === 'first-time' && readiness
                  ? readiness.interpretation
                  : readinessScore >= 70
                  ? 'Ready to proceed'
                  : readinessScore >= 50
                  ? 'Getting there'
                  : 'Needs improvement'}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border-2 border-gray-800 rounded-xl p-6 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-[#06b6d4]/5 rounded-full -mr-10 -mt-10 blur-xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="text-[#06b6d4]" size={20} />
                <span className="text-sm font-semibold text-gray-400">Closing Costs</span>
              </div>
              <div className="text-2xl font-bold text-[#06b6d4] mb-2">
                {formatCurrency(closingCosts)}
              </div>
              <div className="text-xs text-gray-400">One-time fees</div>
            </div>
          </motion.div>
        </div>

        {/* Upgrade CTA */}
        {userTier === 'foundations' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-[#f97316] to-[#ea580c] rounded-xl p-8 border-2 border-white/20 text-center"
          >
            <Crown className="w-12 h-12 mx-auto mb-4 text-white" />
            <h3 className="text-2xl font-bold mb-2 text-white">Unlock Your Full Journey</h3>
            <p className="text-sm text-white/90 mb-6">
              Upgrade to Essential or Premium to unlock all milestones, detailed quest guides, and exclusive achievements!
            </p>
            <button
              onClick={onUpgrade}
              className="bg-white text-[#f97316] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2 mx-auto"
            >
              <Crown size={20} />
              Upgrade Now
              <ArrowRight size={20} />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}


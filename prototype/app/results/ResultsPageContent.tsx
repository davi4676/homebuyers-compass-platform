'use client'

import React, { useState, useEffect, useMemo, useRef, Suspense, type ReactNode } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle, 
  Circle, 
  ArrowRight, 
  ArrowLeft,
  Home, 
  DollarSign, 
  Calculator, 
  FileText, 
  Clock, 
  TrendingUp,
  TrendingDown, 
  RefreshCw, 
  AlertCircle,
  AlertTriangle,
  Eye,
  ChevronDown,
  ChevronUp,
  Info,
  Mail,
  Lock,
  Sparkles,
  Shield,
  X,
  Building2,
  ScrollText,
  Users,
  Scale,
  Cog,
  Crown,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import { 
  calculateAffordability, 
  formatCurrency, 
  getCityData,
  calculateCostBreakdown,
  calculateReadinessScore,
  identifySavingsOpportunities,
  calculateMonthlyPayment,
  type QuizData,
  type CostBreakdown as CostBreakdownType,
  type SavingsOpportunity
} from '@/lib/calculations'
import { HOSA, type HOSAInput, type HOSAOutput } from '@/lib/algorithm/hosa-core'
import { TIER_DEFINITIONS, hasFeature, getNextTier, type UserTier, TIER_ORDER, formatTierPrice } from '@/lib/tiers'
import PersonalizedAIAssistant from '@/components/ai-assistant/PersonalizedAIAssistant'
import { initializeProgress, awardXp, type UserProgress } from '@/lib/gamification'
import { getUserTier, getUserProgress, saveUserProgress, awardXpForAction, getUserId } from '@/lib/user-tracking'
import { useAuth } from '@/lib/hooks/useAuth'
import { trackActivity } from '@/lib/track-activity'
import { syncProgressToApi } from '@/lib/sync-progress'
import { useNotifications, NotificationSystem } from '@/components/NotificationSystem'
import AIChatbot from '@/components/AIChatBot'
import { BADGES } from '@/lib/gamification'
import TrustSignals from '@/components/trust/TrustSignals'
import UserJourneyTracker from '@/components/analytics/UserJourneyTracker'
import { analyzeRepeatBuyer, type RepeatBuyerData } from '@/lib/calculations-repeat-buyer'
import { analyzeRefinance, type RefinanceData } from '@/lib/calculations-refinance'
import { getFannieMaeResources, getResourcesForReadinessScore, type FannieMaeResource } from '@/lib/fannie-mae-resources'
import { getCachedFreddieMacRates } from '@/lib/freddie-mac-rates'
import { computeEducationScoreFromQuiz } from '@/lib/quiz-questions'

type TransactionType = 'first-time' | 'repeat-buyer' | 'refinance'

interface Step {
  id: string
  title: string
  description: string
  completed: boolean
  tips?: string[]
}

// TIER PREVIEW COMPONENT - Must be defined before ResultsPage
function ChooseYourPlanSection({ 
  currentTier, 
  previewTier,
  onSelectTier 
}: { 
  currentTier: UserTier
  previewTier: UserTier
  onSelectTier: (tier: UserTier) => void 
}) {
  const [billingCycle, setBillingCycle] = useState<'one-time' | 'monthly'>('one-time')
  const tiers = TIER_ORDER

  const getTierIcon = (tier: UserTier) => {
    switch (tier) {
      case 'free': return <Sparkles className="w-6 h-6" />
      case 'premium': return <Zap className="w-6 h-6" />
      case 'pro': return <Shield className="w-6 h-6" />
      case 'proplus': return <Crown className="w-6 h-6" />
    }
  }

  const getTierColor = (tier: UserTier) => {
    switch (tier) {
      case 'free': return 'text-slate-500'
      case 'premium': return 'text-[#06b6d4]'
      case 'pro': return 'text-[#f97316]'
      case 'proplus': return 'text-[#D4AF37]'
    }
  }

  const getTierBgColor = (tier: UserTier) => {
    switch (tier) {
      case 'free': return 'bg-slate-100'
      case 'premium': return 'bg-[#06b6d4]/10 border-[#06b6d4]'
      case 'pro': return 'bg-[#f97316]/10 border-[#f97316]'
      case 'proplus': return 'bg-[#D4AF37]/10 border-[#D4AF37]'
    }
  }

  return (
    <motion.section
      id="choose-plan-section"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-16"
    >
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Plan</h2>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">
            Unlock powerful tools and insights to save thousands on your home purchase
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="bg-slate-100 rounded-lg p-1 inline-flex gap-1">
            <button
              onClick={() => setBillingCycle('one-time')}
              className={`px-6 py-2 rounded-md font-semibold transition-all ${
                billingCycle === 'one-time' ? 'bg-[#06b6d4] text-white' : 'text-slate-500 hover:text-white'
              }`}
            >
              One-Time
            </button>
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-md font-semibold transition-all ${
                billingCycle === 'monthly' ? 'bg-[#06b6d4] text-white' : 'text-slate-500 hover:text-white'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiers.map((tier) => {
            const tierDef = TIER_DEFINITIONS[tier]
            const priceLabel = formatTierPrice(tierDef)
            const isCurrentPlan = currentTier === tier
            const isPreviewing = previewTier === tier
            const isFree = tier === 'foundations'

            return (
              <motion.div
                key={tier}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: tiers.indexOf(tier) * 0.1 }}
                className={`relative rounded-lg border-2 p-6 transition-all ${
                  isPreviewing && !isFree
                    ? `${getTierBgColor(tier)} border-2 scale-105`
                    : 'bg-slate-100 border-slate-200'
                } ${isFree ? 'opacity-60' : 'hover:border-slate-200 cursor-pointer'}`}
                onClick={() => !isFree && onSelectTier(tier)}
              >
                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-green-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                      Current Plan
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className={getTierColor(tier)}>{getTierIcon(tier)}</div>
                  <div>
                    <h3 className="text-2xl font-bold">{tierDef.name}</h3>
                    <p className="text-sm text-slate-500">{tierDef.description}</p>
                  </div>
                </div>

                <div className="mb-6">
                  {isFree ? (
                    <div className="text-3xl font-bold">Free</div>
                  ) : (
                    <>
                      <div className="text-3xl font-bold">{priceLabel}</div>
                      <p className="text-sm text-slate-500 mt-1">Placeholder pricing range</p>
                    </>
                  )}
                </div>

                <ul className="space-y-2 mb-6">
                  {tierDef.features.hosa.optimizationScore && (
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-[#06b6d4]" />
                      <span>HOSA Optimization Score</span>
                    </li>
                  )}
                  {tierDef.features.hosa.savingsOpportunities > 0 && (
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-[#06b6d4]" />
                      <span>
                        {tierDef.features.hosa.savingsOpportunities === Infinity ? 'Unlimited' : tierDef.features.hosa.savingsOpportunities} Savings Opportunities
                      </span>
                    </li>
                  )}
                  {tierDef.features.hosa.actionPlan && (
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-[#06b6d4]" />
                      <span>Personalized Action Plan</span>
                    </li>
                  )}
                  {tierDef.features.aiAssistant.enabled && (
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-[#06b6d4]" />
                      <span>
                        AI Assistant ({tierDef.features.aiAssistant.dailyMessageLimit === Infinity ? 'Unlimited' : `${tierDef.features.aiAssistant.dailyMessageLimit} msgs/day`})
                      </span>
                    </li>
                  )}
                  {tier === 'proplus' && tierDef.features.crowdsourcedDownPayment.enabled && (
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-[#06b6d4]" />
                      <span>Crowdsourced Down Payment</span>
                    </li>
                  )}
                </ul>

                {!isFree && !isCurrentPlan && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectTier(tier)
                    }}
                    className="w-full py-3 rounded-lg font-semibold transition-all bg-[#06b6d4] text-white hover:bg-[#0891b2]"
                  >
                    Upgrade Now
                  </button>
                )}
                
                {isCurrentPlan && (
                  <div className="w-full py-3 rounded-lg font-semibold text-center bg-slate-200 text-slate-600">
                    Current Plan
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </motion.section>
  )
}

import { ResultsPageStateContext } from './ResultsPageStateContext'
import ResultsPageBody from './ResultsPageBody'
import GuestResultsPreview from '@/components/results/GuestResultsPreview'

function ResultsPageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e8eef9] via-[#f2f6fc] to-[#f8fafc] text-slate-800 font-sans antialiased">
      {children}
    </div>
  )
}

function ResultsPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const transactionType = (searchParams.get('transactionType') || 'first-time') as TransactionType
  
  // Check authentication status
  const { isAuthenticated, user } = useAuth()
  
  // Get user tier from storage with validation - default to 'free' if not authenticated
  const [userTier, setUserTier] = useState<UserTier>('free')
  
  // Preview tier for comparing plans (defaults to user's actual tier)
  const [previewTier, setPreviewTier] = useState<UserTier>('free')
  
  // Update tier based on authentication status and tier changes
  useEffect(() => {
    const updateTier = () => {
      if (!isAuthenticated) {
        setUserTier('free')
        setPreviewTier('free')
      } else {
        const tier = getUserTier()
        // Validate tier exists in TIER_DEFINITIONS, default to 'free' if invalid
        const validTier = tier && TIER_DEFINITIONS[tier] ? tier : 'free'
        setUserTier(validTier)
        setPreviewTier(validTier)
      }
    }

    // Initial load
    updateTier()

    // Listen for tier changes from developer switcher
    const handleTierChange = (e: CustomEvent) => {
      const newTier = e.detail?.tier as UserTier | undefined
      if (newTier && newTier in TIER_DEFINITIONS) {
        setUserTier(newTier)
      }
    }

    window.addEventListener('tierChanged', handleTierChange as EventListener)
    
    return () => {
      window.removeEventListener('tierChanged', handleTierChange as EventListener)
    }
  }, [isAuthenticated])
  const [userProgress, setUserProgress] = useState<UserProgress | null>(() => getUserProgress())
  
  // Notification system
  const {
    notifications,
    addNotification,
    removeNotification,
    showLevelUp,
    showBadgeUnlock,
    showXpEarned,
  } = useNotifications()

  // Parse form data from URL
  const formData = useMemo(() => {
    const data: Record<string, any> = {}
    searchParams.forEach((value, key) => {
      data[key] = value
    })
    console.log('Form data from URL:', data)
    console.log('Transaction type:', transactionType)
    return data
  }, [searchParams, transactionType])

  // When URL has no params, try to restore from localStorage (from a previous results view)
  const [hasTriedRestore, setHasTriedRestore] = useState(false)
  useEffect(() => {
    if (hasTriedRestore || typeof window === 'undefined') return
    const paramCount = Array.from(searchParams.keys()).length
    if (paramCount > 0) return // Already have params
    try {
      const stored = localStorage.getItem('quizData')
      if (!stored) {
        setHasTriedRestore(true)
        return
      }
      const parsed = JSON.parse(stored) as Record<string, unknown>
      const tt = (parsed.transactionType as string) || 'first-time'
      const params = new URLSearchParams()
      params.set('transactionType', tt)
      const keys = [
        'income',
        'monthlyDebt',
        'downPayment',
        'targetHomePrice',
        'city',
        'timeline',
        'creditScore',
        'agentStatus',
        'concern',
        'zipCode',
        'eduQuiz_1',
        'eduQuiz_3',
        'eduQuiz_4',
        'currentHomeValue',
        'currentMortgageBalance',
        'expectedSalePrice',
        'currentRate',
        'currentMonthlyPayment',
        'currentYearsRemaining',
        'yearsRemaining',
        'refinanceGoals',
        'cashoutAmount',
        'propertyType',
        'previousRefinances',
        'ownedYears',
        'saleStatus',
        'additionalSavings',
        'agentCommission',
        'repairsAndConcessions',
        'debtPayoff',
        'sellingClosingCosts',
      ]
      keys.forEach((k) => {
        const v = parsed[k]
        if (v !== undefined && v !== null && v !== '') params.set(k, String(v))
      })
      if (params.get('income') || params.get('downPayment') || params.get('currentHomeValue')) {
        router.replace(`/results?${params.toString()}`, { scroll: false })
        setHasTriedRestore(true)
      } else {
        setHasTriedRestore(true)
      }
    } catch {
      setHasTriedRestore(true)
    }
  }, [searchParams, router, hasTriedRestore])

  // Calculate results based on transaction type
  const [results, setResults] = useState<any>(null)
  const [hosaOutput, setHosaOutput] = useState<HOSAOutput | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // If no quiz params in URL, show "complete the quiz" immediately instead of hanging on calculations
    const paramKeys = Array.from(searchParams.keys()).filter((k) => k !== 'transactionType')
    if (paramKeys.length === 0) {
      setLoading(false)
      setResults(null)
      return
    }

    let cancelled = false
    const timeoutId = setTimeout(() => {
      if (!cancelled) {
        cancelled = true
        setLoading(false)
        setResults((prev) => prev ?? { type: 'error', error: 'Calculation timed out. Please try again.', transactionType })
      }
    }, 25000)

    const calculateResults = async () => {
      setLoading(true)
      try {
        // Warm Freddie Mac PMMS cache so downstream sync rate calculations
        // use the latest available weekly benchmark when possible.
        await getCachedFreddieMacRates().catch(() => {})

        if (transactionType === 'first-time') {
          const eduScoreFromQuiz = computeEducationScoreFromQuiz(formData as Record<string, string | undefined>)
          const quizData: QuizData & { eduScore?: number } = {
            income: Number(formData.income) || 60000,
            monthlyDebt: Number(formData.monthlyDebt) || 0,
            downPayment: Number(formData.downPayment) || 20000,
            city: formData.city || 'Austin',
            ...(formData.zipCode && String(formData.zipCode).trim() !== ''
              ? { zipCode: String(formData.zipCode).trim() }
              : {}),
            timeline: (formData.timeline || '6-months') as any,
            creditScore: (formData.creditScore || '650-700') as any,
            agentStatus: (formData.agentStatus || 'not-yet') as any,
            concern: (formData.concern || 'hidden-costs') as any,
            ...(formData.targetHomePrice ? { targetHomePrice: Number(formData.targetHomePrice) } : {}),
            ...(eduScoreFromQuiz != null ? { eduScore: eduScoreFromQuiz } : {}),
          }

          let affordability, cityData, costBreakdown, readinessScore, savingsOpportunities
          
          try {
            console.log('Step 1: Calculating affordability...')
            affordability = calculateAffordability(quizData)
            console.log('✅ Affordability calculated:', affordability)
          } catch (e) {
            console.error('❌ Error calculating affordability:', e)
            throw new Error(`Affordability calculation failed: ${e instanceof Error ? e.message : 'Unknown error'}`)
          }
          
          try {
            console.log('Step 2: Getting city data...')
            // Try to get Zillow data first, fallback to static data
            try {
              const { getCityDataWithZillow } = await import('@/lib/calculations')
              cityData = await getCityDataWithZillow(quizData.city)
              console.log('✅ City data retrieved with Zillow:', cityData)
            } catch (zillowError) {
              console.warn('⚠️ Zillow data fetch failed, using static data:', zillowError)
              cityData = getCityData(quizData.city)
              console.log('✅ City data retrieved (static):', cityData)
            }
          } catch (e) {
            console.error('❌ Error getting city data:', e)
            throw new Error(`City data retrieval failed: ${e instanceof Error ? e.message : 'Unknown error'}`)
          }
          
          try {
            console.log('Step 3: Calculating cost breakdown...')
            costBreakdown = await calculateCostBreakdown(affordability, quizData.city, quizData.downPayment)
            console.log('✅ Cost breakdown calculated')
          } catch (e) {
            console.error('❌ Error calculating cost breakdown:', e)
            throw new Error(`Cost breakdown calculation failed: ${e instanceof Error ? e.message : 'Unknown error'}`)
          }
          
          try {
            console.log('Step 4: Calculating readiness score...')
            readinessScore = calculateReadinessScore(quizData, affordability)
            console.log('✅ Readiness score calculated')
          } catch (e) {
            console.error('❌ Error calculating readiness score:', e)
            throw new Error(`Readiness score calculation failed: ${e instanceof Error ? e.message : 'Unknown error'}`)
          }
          
          try {
            console.log('Step 5: Identifying savings opportunities...')
            savingsOpportunities = identifySavingsOpportunities(quizData, costBreakdown, affordability)
            console.log('✅ Savings opportunities identified:', savingsOpportunities?.length || 0)
          } catch (e) {
            console.error('❌ Error identifying savings opportunities:', e)
            throw new Error(`Savings opportunities identification failed: ${e instanceof Error ? e.message : 'Unknown error'}`)
          }

          // Run HOSA algorithm (if user has access)
          let hosa: HOSAOutput | null = null
          if (hasFeature(userTier, 'hosa.optimizationScore')) {
            try {
              const hosaInput: HOSAInput = {
                income: quizData.income,
                monthlyDebt: quizData.monthlyDebt,
                creditScore: quizData.creditScore,
                downPayment: quizData.downPayment,
                additionalSavings: 0, // Would come from quiz
                employmentStability: 8, // Default
                incomeGrowthProjection: 3, // Default
                targetCity: quizData.city,
                propertyType: 'sfh',
                marketVelocity: 30, // Would fetch real data
                seasonality: 1.0,
                competitionIndex: 5,
                priceAppreciationRate: 3,
                transactionType: 'first-time',
                timeline: quizData.timeline,
                urgency: quizData.timeline === '3-months' ? 'high' : quizData.timeline === '6-months' ? 'medium' : 'low',
                flexibility: 7,
                riskTolerance: 'moderate', // Would come from quiz
                negotiationComfort: 5,
                decisionMakingSpeed: 'medium',
                primaryConcern: quizData.concern,
                mustHaveFeatures: [],
                niceToHaveFeatures: [],
                hasRealtor: quizData.agentStatus === 'have-agent',
                realtorQuality: 7,
                hasLender: false,
                lenderRelationship: 'none',
                familySupport: 'none',
              }
              hosa = await HOSA.optimize(hosaInput)
              setHosaOutput(hosa)
            } catch (hosaError) {
              console.error('❌ Error running HOSA algorithm:', hosaError)
              // Continue without HOSA - it's not critical for basic results
              hosa = null
            }
          }

          // Initialize user progress if first time and award XP for completing quiz
          try {
            if (!userProgress) {
              // Ensure valid tier for initializeProgress (defaults to 'pro' if 'proplus')
              const validTier: 'free' | 'premium' | 'pro' = userTier === 'proplus' ? 'pro' : (userTier as 'free' | 'premium' | 'pro')
              const progress = getUserProgress() || initializeProgress(getUserId(), validTier)
              // Award XP for completing quiz
              const { newProgress, leveledUp, newLevel, badgesUnlocked } = awardXpForAction('quiz-complete', 50)
              setUserProgress(newProgress)
              if (isAuthenticated) syncProgressToApi(newProgress)
              // Show notifications (use setTimeout to avoid blocking)
              setTimeout(() => {
                showXpEarned(50, 'Completed quiz assessment')
                if (leveledUp && newLevel) {
                  showLevelUp(newLevel)
                }
                badgesUnlocked.forEach((badgeId) => {
                  const badge = BADGES.find((b) => b.id === badgeId)
                  if (badge) {
                    showBadgeUnlock(badge.name)
                  }
                })
              }, 100)
            } else {
              // Award XP if quiz was just completed (check if this is first time seeing results)
              const lastQuizDate = localStorage.getItem('lastQuizCompletion')
              const today = new Date().toISOString().split('T')[0]
              if (lastQuizDate !== today) {
                const { newProgress, leveledUp, newLevel, badgesUnlocked } = awardXpForAction('quiz-complete', 50)
                setUserProgress(newProgress)
                if (isAuthenticated) syncProgressToApi(newProgress)
                localStorage.setItem('lastQuizCompletion', today)
                // Show notifications (use setTimeout to avoid blocking)
                setTimeout(() => {
                  showXpEarned(50, 'Completed quiz assessment')
                  if (leveledUp && newLevel) {
                    showLevelUp(newLevel)
                  }
                  badgesUnlocked.forEach((badgeId) => {
                    const badge = BADGES.find((b) => b.id === badgeId)
                    if (badge) {
                      showBadgeUnlock(badge.name)
                    }
                  })
                }, 100)
              }
            }
          } catch (progressError) {
            console.error('Error with progress/notifications:', progressError)
            // Continue even if progress/notifications fail
          }

          const resultsData = {
            type: 'first-time',
            affordability,
            cityData,
            quizData,
            costBreakdown,
            readinessScore,
            savingsOpportunities,
            hosa,
          }
          
          // Validate all required data exists
          if (!affordability) {
            throw new Error('Affordability calculation failed - result is null/undefined')
          }
          if (!costBreakdown) {
            throw new Error('Cost breakdown calculation failed - result is null/undefined')
          }
          if (!readinessScore) {
            throw new Error('Readiness score calculation failed - result is null/undefined')
          }
          
          // Save quiz data and readiness score to localStorage for journey page
          try {
            const dataToSave = {
              ...quizData,
              transactionType: 'first-time',
              timeline: quizData.timeline,
              readinessScore: readinessScore.total || readinessScore,
              affordability,
              costBreakdown
            }
            localStorage.setItem('quizData', JSON.stringify(dataToSave))
            
            // Save HOSA output if available (for Premium/Pro users)
            if (hosa && hasFeature(userTier, 'hosa.optimizationScore')) {
              localStorage.setItem('hosaOutput', JSON.stringify(hosa))
            }
            
            console.log('✅ Quiz data saved to localStorage for journey page')
          } catch (saveError) {
            console.error('Error saving quiz data to localStorage:', saveError)
            // Continue even if save fails
          }
          
          console.log('✅ All calculations validated, setting results...')
          console.log('Results structure:', {
            type: resultsData.type,
            hasAffordability: !!resultsData.affordability,
            hasCostBreakdown: !!resultsData.costBreakdown,
            hasReadinessScore: !!resultsData.readinessScore,
            savingsCount: resultsData.savingsOpportunities?.length || 0
          })
          
          setResults(resultsData)
          setLoading(false)
          console.log('=== RESULTS SET SUCCESSFULLY ===')
          return
        } else if (transactionType === 'repeat-buyer') {
          try {
            console.log('Processing repeat-buyer results...')
            const repeatBuyerData: RepeatBuyerData = {
              transactionType: 'repeat-buyer',
              income: Number(formData.income) || 80000,
              monthlyDebt: Number(formData.monthlyDebt) || 0,
              currentHomeValue: Number(formData.currentHomeValue) || Number(formData.expectedSalePrice) || 300000,
              currentMortgageBalance: Number(formData.currentMortgageBalance) || 200000,
              ownedYears: (formData.ownedYears || '<1') as any,
              saleStatus: (formData.saleStatus || 'not-listed') as any,
              expectedSalePrice: Number(formData.expectedSalePrice) || Number(formData.currentHomeValue) || 300000,
              sellingClosingCosts: Number(formData.sellingClosingCosts) || 0,
              agentCommission: Number(formData.agentCommission) || 5.5,
              repairsAndConcessions: Number(formData.repairsAndConcessions) || 0,
              debtPayoff: Number(formData.debtPayoff) || 0,
              additionalSavings: Number(formData.additionalSavings) || 0,
              currentRate: Number(formData.currentRate) || 6,
              currentYearsRemaining: Number(formData.currentYearsRemaining) || 30,
              currentMonthlyPayment: Number(formData.currentMonthlyPayment) || 0,
              city: formData.city || 'Austin',
              timeline: (formData.timeline || '6-months') as any,
              creditScore: (formData.creditScore || '650-700') as any,
              agentStatus: (formData.agentStatus || 'not-yet') as any,
              concern: formData.concern || 'other',
            }

            console.log('Repeat buyer data prepared:', repeatBuyerData)
            const analysis = analyzeRepeatBuyer(repeatBuyerData)
            console.log('Repeat buyer analysis complete')
            
            // Save quiz data to localStorage for journey page
            try {
              const dataToSave = {
                ...repeatBuyerData,
                transactionType: 'repeat-buyer',
                timeline: repeatBuyerData.timeline,
                readinessScore: 50, // Default readiness score for repeat buyers
                analysis
              }
              localStorage.setItem('quizData', JSON.stringify(dataToSave))
              console.log('✅ Repeat buyer quiz data saved to localStorage for journey page')
            } catch (saveError) {
              console.error('Error saving repeat buyer quiz data to localStorage:', saveError)
            }
            
            setResults({
              type: 'repeat-buyer',
              analysis,
              data: repeatBuyerData,
            })
            setLoading(false)
            return
          } catch (e) {
            console.error('❌ Error calculating repeat-buyer results:', e)
            throw new Error(`Repeat buyer calculation failed: ${e instanceof Error ? e.message : 'Unknown error'}`)
          }
        } else if (transactionType === 'refinance') {
          try {
            console.log('Processing refinance results...')
            const refinanceData: RefinanceData = {
              transactionType: 'refinance',
              currentHomeValue: Number(formData.currentHomeValue) || 300000,
              currentMortgageBalance: Number(formData.currentMortgageBalance) || 200000,
              currentRate: Number(formData.currentRate) || 6.5,
              currentMonthlyPayment: Number(formData.currentMonthlyPayment) || 1500,
              yearsRemaining: Number(formData.yearsRemaining) || 30,
              refinanceGoals: Array.isArray(formData.refinanceGoals) ? formData.refinanceGoals : (formData.refinanceGoals ? [formData.refinanceGoals] : ['lower-rate']),
              cashoutAmount: Number(formData.cashoutAmount) || 0,
              creditScore: (formData.creditScore || '650-700') as any,
              propertyType: (formData.propertyType || 'primary') as any,
              previousRefinances: (formData.previousRefinances || 'never') as any,
              concern: formData.concern || 'break-even',
            }

            console.log('Refinance data prepared:', refinanceData)
            const analysis = await analyzeRefinance(refinanceData)
            console.log('Refinance analysis complete')
            
            // Save quiz data to localStorage for journey page
            try {
              const dataToSave = {
                ...refinanceData,
                transactionType: 'refinance',
                timeline: '6-months', // Default for refinance
                readinessScore: 50, // Default readiness score for refinance
                analysis
              }
              localStorage.setItem('quizData', JSON.stringify(dataToSave))
              console.log('✅ Refinance quiz data saved to localStorage for journey page')
            } catch (saveError) {
              console.error('Error saving refinance quiz data to localStorage:', saveError)
            }
            
            setResults({
              type: 'refinance',
              analysis,
              data: refinanceData,
            })
            setLoading(false)
            return
          } catch (e) {
            console.error('❌ Error calculating refinance results:', e)
            throw new Error(`Refinance calculation failed: ${e instanceof Error ? e.message : 'Unknown error'}`)
          }
        } else {
          throw new Error(`Unknown transaction type: ${transactionType}`)
        }
      } catch (error) {
        clearTimeout(timeoutId)
        console.error('❌❌❌ FATAL ERROR calculating results:', error)
        if (error instanceof Error) {
          console.error('Error message:', error.message)
          console.error('Error stack:', error.stack)
          console.error('Error name:', error.name)
        }
        // Store error details for display
        setResults({ 
          type: 'error',
          error: error instanceof Error ? error.message : String(error),
          transactionType,
          formData: Object.keys(formData).slice(0, 5), // First 5 keys for debugging
          stack: error instanceof Error ? error.stack : undefined
        })
        setLoading(false)
      }
    }

    if (transactionType) {
      calculateResults().then(() => {}).catch(() => {}).finally(() => {
        clearTimeout(timeoutId)
      })
    } else {
      clearTimeout(timeoutId)
      setLoading(false)
    }

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
  }, [transactionType, formData])

  // Track results_viewed for productivity (once per page load)
  const hasTrackedResults = useRef(false)
  useEffect(() => {
    if (results && !loading && !hasTrackedResults.current && typeof results === 'object' && 'type' in results && (results as any).type !== 'error') {
      hasTrackedResults.current = true
      trackActivity('results_viewed', { transactionType })
    }
  }, [results, loading, transactionType])

  // Build context state (must be before any conditional return — rules of hooks)
  const state = useMemo(() => {
    return {
      searchParams,
      router,
      transactionType,
      formData: formData ?? {},
      results,
      loading,
      userTier,
      setUserTier,
      previewTier,
      setPreviewTier,
      userProgress,
      setUserProgress,
      isAuthenticated,
      user,
      notifications: notifications ?? [],
      addNotification: typeof addNotification === 'function' ? addNotification : () => {},
      removeNotification: typeof removeNotification === 'function' ? removeNotification : () => {},
      hosaOutput,
    }
  }, [searchParams, router, transactionType, formData, results, loading, userTier, previewTier, userProgress, isAuthenticated, user, notifications, addNotification, removeNotification, hosaOutput])

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-cream text-slate-800 font-sans antialiased">
        <div className="mx-auto max-w-3xl px-4 py-16">
          <div className="mb-6 h-10 w-48 animate-pulse rounded-lg bg-brand-mist" />
          <div className="mb-4 h-64 animate-pulse rounded-2xl bg-brand-mist" />
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="h-28 animate-pulse rounded-xl bg-brand-mist" />
            <div className="h-28 animate-pulse rounded-xl bg-brand-mist" />
            <div className="h-28 animate-pulse rounded-xl bg-brand-mist" />
          </div>
          <p className="mt-8 text-center text-sm font-medium text-slate-600">Creating your personalized results…</p>
        </div>
      </div>
    )
  }

  // Check if results is an error object
  if (results && typeof results === 'object' && 'type' in results && (results as any).type === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#e8eef9] via-[#f2f6fc] to-[#f8fafc] text-slate-800 font-sans antialiased flex items-center justify-center">
        <div className="text-center max-w-lg mx-auto px-4">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-bold mb-2">Calculation Error</h2>
          <p className="text-lg text-slate-600 mb-4">
            {results.error || 'An error occurred while calculating your results.'}
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left text-sm">
            <p className="font-semibold text-red-600 mb-2">Error Details:</p>
            <p className="text-slate-700">Transaction Type: {results.transactionType || 'unknown'}</p>
            <p className="text-slate-700">Error: {results.error}</p>
            <p className="text-slate-500 text-xs mt-2">Please check the browser console (F12) for more details.</p>
          </div>
          <Link 
            href="/quiz" 
            className="inline-block bg-[rgb(var(--coral))] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
          >
            Start Quiz Again
          </Link>
        </div>
      </div>
    )
  }

  if (!loading && !results) {
    const hasFormData = Object.keys(formData).length > 0
    const tryRestoreFromStorage = () => {
      try {
        const stored = localStorage.getItem('quizData')
        if (!stored) return
        const parsed = JSON.parse(stored) as Record<string, unknown>
        const tt = (parsed.transactionType as string) || 'first-time'
        const params = new URLSearchParams()
        params.set('transactionType', tt)
        const keys = [
          'income',
          'monthlyDebt',
          'downPayment',
          'targetHomePrice',
          'city',
          'timeline',
          'creditScore',
          'agentStatus',
          'concern',
          'currentHomeValue',
          'currentMortgageBalance',
          'expectedSalePrice',
          'currentRate',
          'currentMonthlyPayment',
          'currentYearsRemaining',
          'yearsRemaining',
          'refinanceGoals',
          'cashoutAmount',
          'propertyType',
          'previousRefinances',
          'ownedYears',
          'saleStatus',
          'additionalSavings',
          'agentCommission',
          'repairsAndConcessions',
          'debtPayoff',
          'sellingClosingCosts',
        ]
        keys.forEach((k) => {
          const v = parsed[k]
          if (v !== undefined && v !== null && v !== '') params.set(k, String(v))
        })
        if (params.get('income') || params.get('downPayment') || params.get('currentHomeValue')) {
          router.replace(`/results?${params.toString()}`, { scroll: false })
        }
      } catch {
        // ignore
      }
    }

    return (
      <div className="min-h-screen bg-gradient-to-b from-[#e8eef9] via-[#f2f6fc] to-[#f8fafc] text-slate-800 font-sans antialiased flex items-center justify-center p-4">
        <div className="text-center max-w-lg mx-auto">
          <div className="mb-6">
            <span className="text-6xl" aria-hidden>📋</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Your results aren&apos;t here yet</h1>
          <p className="text-lg text-slate-500 mb-8">
            {hasFormData
              ? 'Something went wrong while calculating your results. Try again or restore from your last quiz.'
              : 'Complete the quiz to see your personalized cost breakdown and savings opportunities.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link
              href="/quiz"
              className="inline-flex items-center gap-2 bg-[#06b6d4] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0891b2] transition"
            >
              <ArrowRight size={20} />
              Start quiz
            </Link>
            <button
              type="button"
              onClick={tryRestoreFromStorage}
              className="inline-flex items-center gap-2 bg-slate-200 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-200 transition"
            >
              <RefreshCw size={18} />
              Restore from last quiz
            </button>
          </div>
          <p className="mt-8 text-sm text-slate-500">
            <Link href="/" className="text-[#06b6d4] hover:underline">← Back to home</Link>
          </p>
        </div>
      </div>
    )
  }

  const resultsRecord = results as Record<string, unknown>
  const isFirstTimeResults =
    resultsRecord &&
    typeof resultsRecord === 'object' &&
    resultsRecord.type === 'first-time'

  if (!isAuthenticated && isFirstTimeResults) {
    return React.createElement(ResultsPageStateContext.Provider, { value: state },
      React.createElement(ResultsPageLayout, null,
        React.createElement(UserJourneyTracker),
        React.createElement('div', { className: 'bg-white border-b border-slate-200 shadow-sm' },
          React.createElement('div', { className: 'max-w-7xl mx-auto' }, React.createElement(TrustSignals))),
        React.createElement(GuestResultsPreview, { results: resultsRecord })
      )
    )
  }

  return React.createElement(ResultsPageStateContext.Provider, { value: state },
    React.createElement(ResultsPageLayout, null,
      React.createElement(UserJourneyTracker),
      React.createElement('div', { className: 'bg-white border-b border-slate-200 shadow-sm' },
        React.createElement('div', { className: 'max-w-7xl mx-auto' }, React.createElement(TrustSignals))),
      React.createElement(ResultsPageBody)
    )
  )
}


const resultsPageFallback = (
  <div className="min-h-screen bg-gradient-to-b from-[#e8eef9] via-[#f2f6fc] to-[#f8fafc] text-slate-800 font-sans antialiased flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(var(--coral))] mx-auto mb-4" />
      <p className="text-lg font-semibold">Loading your results...</p>
    </div>
  </div>
)

export { ResultsPageContent, resultsPageFallback }

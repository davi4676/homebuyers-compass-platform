'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle,
  Circle,
  Lock,
  ArrowRight,
  ArrowLeft,
  Home,
  FileText,
  Calculator,
  DollarSign,
  Users,
  Shield,
  Key,
  TrendingUp,
  AlertCircle,
  Info,
  Calendar,
  CheckSquare,
  Clock,
  Target,
  Award,
  Sparkles,
  X
} from 'lucide-react'
import Link from 'next/link'
import { getUserTier, getUserProgress } from '@/lib/user-tracking'
import { TIER_DEFINITIONS, hasFeature, getNextTier, type UserTier, TIER_ORDER } from '@/lib/tiers'
import { useAuth } from '@/lib/hooks/useAuth'
import { useNotifications, NotificationSystem } from '@/components/NotificationSystem'
import { awardXpForAction } from '@/lib/user-tracking'
import { syncProgressToApi } from '@/lib/sync-progress'
import { getResourcesForJourneyStep, type FannieMaeResource } from '@/lib/fannie-mae-resources'
import { generateFreddieMacJourney, getFreddieMacGuideUrl, type FreddieMacJourneyStep } from '@/lib/journey-freddie-mac'
import { generateFannieMaeJourney, type FannieMaeJourneyStep } from '@/lib/journey-fannie-mae'
import { type HOSAOutput } from '@/lib/algorithm/hosa-core'
import { formatCurrency } from '@/lib/calculations'

// Personalized Mortgage Journey System
interface JourneyStep {
  id: string
  phase: 'preparation' | 'application' | 'processing' | 'closing' | 'post-closing'
  title: string
  description: string
  estimatedDays: number
  order: number
  checklist: {
    id: string
    task: string
    description: string
    required: boolean
    xpReward: number
  }[]
  resources: {
    title: string
    type: 'document' | 'calculator' | 'guide' | 'video'
    url?: string
  }[]
  tips: string[]
  redFlags: string[]
  personalizedNote?: string
}

interface JourneyData {
  transactionType: 'first-time' | 'repeat-buyer' | 'refinance'
  timeline: string
  readinessScore: number
  currentStep: number
  completedSteps: string[]
  quizData?: any
}

function JourneyPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [userTier, setUserTier] = useState<UserTier>('foundations')
  const [previewTier, setPreviewTier] = useState<UserTier>('foundations')
  const [userProgress, setUserProgress] = useState<any>(null)
  const [journeyData, setJourneyData] = useState<JourneyData | null>(null)
  const [hosaOutput, setHosaOutput] = useState<HOSAOutput | null>(null)
  const [readinessScore, setReadinessScore] = useState<{ total: number; breakdown: any; interpretation: string } | null>(null)
  const [activeReadinessModal, setActiveReadinessModal] = useState<string | null>(null)
  const [currentPhase, setCurrentPhase] = useState<string>('preparation')
  const [expandedStep, setExpandedStep] = useState<string | null>(null)
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set())
  const { notifications, addNotification, removeNotification, showLevelUp, showBadgeUnlock, showXpEarned } = useNotifications()

  useEffect(() => {
    const updateTier = () => {
      if (!isAuthenticated) {
        setUserTier('foundations')
        setPreviewTier('foundations')
        setUserProgress(null)
      } else {
        const tier = getUserTier()
        const validTier = tier && TIER_DEFINITIONS[tier] ? tier : 'foundations'
        setUserTier(validTier)
        setPreviewTier(validTier)
        
        // Get user progress
        const progress = getUserProgress()
        setUserProgress(progress)
      }
    }

    // Initial load
    updateTier()

    // Listen for tier changes from developer switcher or preview switcher
    const handleTierChange = (e: CustomEvent) => {
      const newTier = e.detail?.tier as UserTier
      if (newTier && TIER_DEFINITIONS[newTier]) {
        setUserTier(newTier)
        setPreviewTier(newTier)
      }
    }

    window.addEventListener('tierChanged', handleTierChange as EventListener)
    
    return () => {
      window.removeEventListener('tierChanged', handleTierChange as EventListener)
    }
  }, [isAuthenticated])

  useEffect(() => {
    // Load journey data (separate effect for clarity)
    if (!isAuthenticated) {
      return
    }
    
    const tier = getUserTier()
    const progress = getUserProgress()

    // Load HOSA data if available (for Premium/Pro users)
    try {
      const savedHosa = localStorage.getItem('hosaOutput')
      if (savedHosa && hasFeature(tier, 'hosa.optimizationScore')) {
        const hosa = JSON.parse(savedHosa)
        setHosaOutput(hosa)
      }
    } catch (error) {
      console.error('Error loading HOSA data:', error)
    }

    // Load journey data from localStorage or URL params (available for all users)
    try {
      let loadedJourney: JourneyData | null = null
      const savedJourney = localStorage.getItem('journeyData')
      
      if (savedJourney) {
        try {
          const parsed = JSON.parse(savedJourney)
          // Validate the parsed data has required fields
          if (parsed && typeof parsed === 'object') {
            loadedJourney = {
              transactionType: parsed.transactionType || 'first-time',
              timeline: parsed.timeline || '6-months',
              readinessScore: parsed.readinessScore || 50,
              currentStep: parsed.currentStep || 0,
              completedSteps: parsed.completedSteps || [],
              quizData: parsed.quizData
            }
          }
        } catch (e) {
          console.error('Error parsing journey data:', e)
        }
      }
      
      // If no saved journey or parsing failed, create from quiz data
      if (!loadedJourney) {
        const quizData = localStorage.getItem('quizData')
        if (quizData) {
          try {
            const data = JSON.parse(quizData)
            loadedJourney = {
              transactionType: data.transactionType || 'first-time',
              timeline: data.timeline || '6-months',
              readinessScore: data.readinessScore?.total || data.readinessScore || 50,
              currentStep: 0,
              completedSteps: [],
              quizData: data
            }
            localStorage.setItem('journeyData', JSON.stringify(loadedJourney))
            
            // Load readiness score data if available
            if (data.readinessScore && typeof data.readinessScore === 'object' && data.readinessScore.breakdown) {
              setReadinessScore(data.readinessScore)
            }
          } catch (e) {
            console.error('Error creating journey from quiz data:', e)
          }
        }
      } else if (loadedJourney.quizData?.readinessScore && typeof loadedJourney.quizData.readinessScore === 'object' && loadedJourney.quizData.readinessScore.breakdown) {
        // Load readiness score from loaded journey data
        setReadinessScore(loadedJourney.quizData.readinessScore)
      }
      
      // If still no journey, set default
      if (!loadedJourney) {
        loadedJourney = {
          transactionType: 'first-time',
          timeline: '6-months',
          readinessScore: 50,
          currentStep: 0,
          completedSteps: []
        }
      }
      
      setJourneyData(loadedJourney)
    } catch (error) {
      console.error('Error loading journey data:', error)
      // Set default journey on error
      const defaultJourney: JourneyData = {
        transactionType: 'first-time',
        timeline: '6-months',
        readinessScore: 50,
        currentStep: 0,
        completedSteps: []
      }
      setJourneyData(defaultJourney)
    }
  }, [isAuthenticated])

  // Generate personalized journey steps using the 7-step structure
  const generateJourneySteps = (data: JourneyData | null): JourneyStep[] => {
    // Use default data if none provided
    const journeyData: JourneyData = data || {
      transactionType: 'first-time',
      timeline: '6-months',
      readinessScore: 50,
      currentStep: 0,
      completedSteps: []
    }
    
    try {
      // Use the 7-step journey structure
      const fannieMaeSteps = generateFannieMaeJourney(
        journeyData.transactionType || 'first-time',
        journeyData.readinessScore || 50,
        (journeyData.timeline || '6-months') as '3-months' | '6-months' | '1-year' | 'exploring'
      )
      
      // Map steps to phase-based structure for compatibility
      const phaseMap: Record<number, 'preparation' | 'application' | 'processing' | 'closing' | 'post-closing'> = {
        1: 'preparation',
        2: 'preparation',
        3: 'application',
        4: 'application',
        5: 'processing',
        6: 'closing',
        7: 'post-closing'
      }
      
      // Convert FannieMaeJourneyStep to JourneyStep format
      return fannieMaeSteps.map(step => ({
        id: step.id,
        phase: phaseMap[step.stepNumber] || 'preparation',
        title: step.title,
        description: step.description,
        estimatedDays: step.estimatedDays,
        order: step.stepNumber,
        checklist: step.checklist.map(item => ({
          id: item.id,
          task: item.task,
          description: item.description,
          required: item.required,
          xpReward: item.xpReward
        })),
        resources: step.resources.map(res => ({
          title: res.title,
          type: res.type as any,
          url: res.url
        })),
        tips: step.tips,
        redFlags: step.redFlags,
        personalizedNote: step.personalizedNote
      }))
    } catch (error) {
      console.error('Error generating journey steps:', error)
      // Return empty array if generation fails
      return []
    }
  }

  // Journey generator implementation

  const handleTaskComplete = (stepId: string, taskId: string, xpReward: number) => {
    const newCompleted = new Set(completedTasks)
    newCompleted.add(`${stepId}-${taskId}`)
    setCompletedTasks(newCompleted)

    // Award XP
    if (effectiveTier !== 'foundations' && hasFeature(effectiveTier, 'gamification.xp')) {
      const { newProgress, leveledUp, newLevel, badgesUnlocked } = awardXpForAction('journey-task', xpReward)
      setUserProgress(newProgress)
      if (isAuthenticated) syncProgressToApi(newProgress)
      // Save to localStorage
      localStorage.setItem('completedTasks', JSON.stringify(Array.from(newCompleted)))

      // Show notification
      showXpEarned(xpReward, 'Task completed')

      if (leveledUp && newLevel) {
        showLevelUp(newLevel)
      }

      if (badgesUnlocked && badgesUnlocked.length > 0) {
        badgesUnlocked.forEach(badgeId => {
          showBadgeUnlock(badgeId)
        })
      }
    }
  }

  // Check if user has access to personalized journey using preview tier
  // personalizedJourney is a top-level boolean feature, so check it directly
  const effectiveTier = previewTier || userTier
  const tierDef = TIER_DEFINITIONS[effectiveTier]
  const hasAccess = tierDef?.features?.personalizedJourney === true || 
                    effectiveTier === 'momentum' || 
                    effectiveTier === 'navigator' ||
                    effectiveTier === 'navigator_plus'
  
  if (!hasAccess) {
    const nextTier = getNextTier(effectiveTier)
    return (
      <div className="min-h-screen bg-[rgb(var(--sky-light))] text-slate-800 font-sans flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <Lock className="text-[#f97316] mx-auto mb-6" size={64} />
          <h1 className="text-4xl font-bold mb-4">Personalized Journey Unlocked</h1>
          <p className="text-xl text-slate-500 mb-8">
            Get your step-by-step mortgage journey personalized to your situation.
          </p>
          <div className="bg-white rounded-xl p-6 mb-8 text-left border border-slate-200 shadow-sm">
            <h2 className="text-2xl font-bold mb-4 text-[rgb(var(--navy))]">What You&apos;ll Get:</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle className="text-[#06b6d4] mt-1" size={20} />
                <div>
                  <strong>8-Step Personalized Journey</strong>
                  <p className="text-slate-500 text-sm">Comprehensive step-by-step mortgage guide</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="text-[#06b6d4] mt-1" size={20} />
                <div>
                  <strong>Interactive Checklists</strong>
                  <p className="text-slate-500 text-sm">Track your progress with detailed task lists</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="text-[#06b6d4] mt-1" size={20} />
                <div>
                  <strong>Red Flags & Tips</strong>
                  <p className="text-slate-500 text-sm">Learn what to watch out for at each step</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="text-[#06b6d4] mt-1" size={20} />
                <div>
                  <strong>XP Rewards</strong>
                  <p className="text-slate-500 text-sm">Earn points for completing journey tasks</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="text-[#06b6d4] mt-1" size={20} />
                <div>
                  <strong>Personalized Guidance</strong>
                  <p className="text-slate-500 text-sm">Customized based on your transaction type and readiness</p>
                </div>
              </li>
            </ul>
          </div>
          {nextTier && (
            <Link
              href={`/upgrade?tier=${nextTier}&feature=personalizedJourney`}
              className="inline-block bg-[rgb(var(--coral))] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:opacity-90 transition-all"
            >
              Upgrade to {TIER_DEFINITIONS[nextTier].name} to Unlock →
            </Link>
          )}
          <p className="text-slate-500 mt-6 text-sm">
            Available in {nextTier ? TIER_DEFINITIONS[nextTier].name : 'paid'} tiers and above
          </p>
        </div>
      </div>
    )
  }

  // Generate journey steps (will use defaults if journeyData is null)
  const steps = generateJourneySteps(journeyData)
  
  // Get the 7-step structure for enhanced gamification
  const fannieMaeSteps: FannieMaeJourneyStep[] = journeyData ? generateFannieMaeJourney(
    journeyData.transactionType || 'first-time',
    journeyData.readinessScore || 50,
    (journeyData.timeline || '6-months') as '3-months' | '6-months' | '1-year' | 'exploring'
  ) : []
  
  // Only show error if we truly can't generate any steps
  if (steps.length === 0) {
    return (
      <div className="min-h-screen bg-[rgb(var(--sky-light))] text-slate-800 font-sans flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="text-yellow-500 mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-bold mb-2">Unable to Load Journey</h2>
          <p className="text-slate-500 mb-6">
            There was an error generating your journey. Please try refreshing the page or contact support if the issue persists.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-block bg-[#f97316] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#ea580c] transition"
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }
  const phases = ['preparation', 'application', 'processing', 'closing', 'post-closing']
  const currentPhaseSteps = steps.filter(s => s.phase === currentPhase)
  const totalTasks = steps.reduce((sum, step) => sum + step.checklist.length, 0)
  const completedCount = completedTasks.size
  const progressPercent = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0
  
  // Calculate step completion for the 7 steps
  const completedStepsCount = fannieMaeSteps.filter(step => 
    step.checklist.every(task => completedTasks.has(`${step.id}-${task.id}`))
  ).length
  const totalSteps = fannieMaeSteps.length
  const stepsProgressPercent = totalSteps > 0 ? (completedStepsCount / totalSteps) * 100 : 0
  
  // Calculate total XP earned from journey
  const totalXpEarned = (fannieMaeSteps || []).reduce((sum, step) => {
    const stepXp = (step.checklist || [])
      .filter(task => completedTasks.has(`${step.id}-${task.id}`))
      .reduce((taskSum, task) => taskSum + (task.xpReward || 0), 0)
    return sum + stepXp
  }, 0)
  
  // Get user level and XP from progress
  const userLevel = userProgress?.level || 1
  const userXp = userProgress?.xp || 0

  return (
    <div className="min-h-screen bg-[rgb(var(--sky-light))] text-slate-800 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Top Navigation Bar */}
        <div className="mb-6 flex items-center justify-between sticky top-20 z-40 bg-white/95 backdrop-blur-sm border border-slate-200 shadow-sm py-3 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 rounded-xl">
          <Link
            href="/results"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold bg-[rgb(var(--navy))] text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--coral))] transition-all"
          >
            <ArrowLeft size={18} />
            <span>Back to Results</span>
          </Link>
          
          <Link
            href="/refinance-optimizer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold bg-[rgb(var(--coral))] text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--coral))] transition-all"
          >
            <span>Mortgage lifecycle</span>
            <ArrowRight size={18} />
          </Link>
        </div>

        {/* Tier Preview Switcher - Omio */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">
                  Viewing as: <span className="text-[rgb(var(--coral))]">{TIER_DEFINITIONS[effectiveTier].name}</span>
                </h3>
                <p className="text-sm text-slate-500">
                  {effectiveTier === userTier 
                    ? "This is your current plan. Switch to preview other plans." 
                    : "Previewing what you'd get with this plan."}
                </p>
              </div>
              <div className="flex gap-2 flex-wrap justify-center">
                {TIER_ORDER.map((tier) => {
                  const tierDef = TIER_DEFINITIONS[tier]
                  const isActive = effectiveTier === tier
                  const isCurrentPlan = userTier === tier
                  
                  return (
                    <button
                      key={tier}
                      onClick={() => {
                        setPreviewTier(tier)
                        if (typeof window !== 'undefined') {
                          window.dispatchEvent(new CustomEvent('tierChanged', { detail: { tier } }))
                        }
                      }}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        isActive
                          ? 'bg-[#06b6d4] text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                      } ${isCurrentPlan ? 'ring-2 ring-[#06b6d4]' : ''}`}
                    >
                      {tierDef.name}
                      {isCurrentPlan && <span className="ml-1 text-xs">✓</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Header */}
        <div className="mb-8">
          <div className="mb-6">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">Your Mortgage Journey</h1>
            <p className="text-xl text-slate-500">
              Complete your steps to unlock your home
            </p>
          </div>

          {/* Readiness Score Section */}
          {readinessScore && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-xl p-6 mb-6 border border-blue-500/30"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                    <Target className="text-blue-400" size={24} />
                    Your Readiness Score
                  </h3>
                  <p className="text-slate-600 mb-4">{readinessScore.interpretation}</p>
                </div>
                <div className="text-right ml-4">
                  <div className="text-4xl font-bold text-blue-400">{readinessScore.total}</div>
                  <div className="text-sm text-slate-500">/100</div>
                </div>
              </div>
              
              {/* Readiness Score Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { key: 'creditScore', label: 'Credit Score', max: 30, icon: '💳' },
                  { key: 'dtiRatio', label: 'Debt-to-Income', max: 25, icon: '📊' },
                  { key: 'downPayment', label: 'Down Payment', max: 25, icon: '💰' },
                  { key: 'timeline', label: 'Timeline', max: 10, icon: '📅' },
                  { key: 'savingsBuffer', label: 'Savings Buffer', max: 10, icon: '🏦' },
                ].map((item) => {
                  const score = readinessScore.breakdown[item.key] || 0
                  const percent = (score / item.max) * 100
                  const status = percent >= 80 ? 'excellent' : percent >= 60 ? 'good' : percent >= 40 ? 'fair' : 'needs-work'
                  
                  return (
                    <motion.button
                      key={item.key}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveReadinessModal(item.key)}
                      className="relative p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-500/50 transition-all cursor-pointer text-left group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{item.icon}</span>
                        <Info size={16} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
                      </div>
                      <div className="text-sm font-semibold text-slate-600 mb-1">{item.label}</div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-lg font-bold text-blue-400">{score}</div>
                        <div className="text-xs text-slate-500">/ {item.max}</div>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percent}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                          className={`h-full ${
                            status === 'excellent' ? 'bg-green-500' :
                            status === 'good' ? 'bg-blue-500' :
                            status === 'fair' ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                        />
                      </div>
                      <div className={`text-xs mt-1 font-semibold ${
                        status === 'excellent' ? 'text-green-400' :
                        status === 'good' ? 'text-blue-400' :
                        status === 'fair' ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {status === 'excellent' ? 'Excellent' :
                         status === 'good' ? 'Good' :
                         status === 'fair' ? 'Fair' :
                         'Needs Work'}
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* Progress Cards Grid */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {/* Journey Progress Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-white to-slate-50 rounded-xl p-6 border border-slate-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
                    <Target className="text-[#06b6d4]" size={20} />
                    Journey Progress
                  </h3>
                  <p className="text-sm text-slate-500">
                    {completedStepsCount} of {totalSteps} steps • {completedCount} of {totalTasks} tasks
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-[#06b6d4]">{Math.round(stepsProgressPercent)}%</div>
                  <div className="text-xs text-slate-500">Complete</div>
                </div>
              </div>
              <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stepsProgressPercent}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-[#06b6d4] via-[#0891b2] to-[#0e7490]"
                />
              </div>
            </motion.div>

            {/* HOSA Optimization Score Card or Level/XP Card */}
            {hosaOutput && hasFeature(effectiveTier, 'hosa.optimizationScore') ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-xl p-6 border border-purple-500/30"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
                      <Sparkles className="text-purple-400" size={20} />
                      HOSA Score
                    </h3>
                    <p className="text-sm text-slate-500">
                      Optimization potential
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-purple-400">{Math.round(hosaOutput.optimizationScore)}</div>
                    <div className="text-xs text-slate-500">/100</div>
                  </div>
                </div>
                <div className="w-full h-4 bg-slate-50 rounded-full overflow-hidden mb-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${hosaOutput.optimizationScore}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-600"
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Savings Potential</span>
                  <span className="text-green-400 font-semibold">
                    {formatCurrency(hosaOutput.totalSavingsPotential.expected)}
                  </span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-white to-slate-50 rounded-xl p-6 border border-slate-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
                      <Award className="text-[#f97316]" size={20} />
                      Level & XP
                    </h3>
                    <p className="text-sm text-slate-500">
                      Your progress
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-[#f97316]">{userLevel}</div>
                    <div className="text-xs text-slate-500">Level</div>
                  </div>
                </div>
                <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden mb-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(userXp % 1000) / 10}%` }}
                    transition={{ duration: 1 }}
                    className="h-full bg-gradient-to-r from-[#f97316] to-[#ea580c]"
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Total XP</span>
                  <span className="text-[#06b6d4] font-semibold">{totalXpEarned}</span>
                </div>
              </motion.div>
            )}
          </div>
          
          {/* Interactive Journey Map */}
          {fannieMaeSteps.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 mb-8 border border-slate-200"
            >
              <h3 className="text-xl font-bold mb-6">Your Journey Steps</h3>
              <div className="relative">
                {/* Progress Line */}
                <div className="absolute top-10 left-0 right-0 h-1 bg-slate-100 hidden md:block">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stepsProgressPercent}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-[#06b6d4] to-[#0891b2]"
                  />
                </div>
                
                {/* Steps Grid */}
                <div className="grid grid-cols-2 md:grid-cols-7 gap-3 relative z-10">
                  {fannieMaeSteps.map((step, index) => {
                    const stepCompleted = step.checklist.every(task => 
                      completedTasks.has(`${step.id}-${task.id}`)
                    )
                    const stepProgress = step.checklist.filter(task => 
                      completedTasks.has(`${step.id}-${task.id}`)
                    ).length
                    
                    return (
                      <motion.button
                        key={step.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          const stepPhase = steps.find(s => s.id === step.id)?.phase || 'preparation'
                          setCurrentPhase(stepPhase)
                          setExpandedStep(expandedStep === step.id ? null : step.id)
                          // Scroll to step
                          setTimeout(() => {
                            document.getElementById(step.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                          }, 100)
                        }}
                        className={`relative group ${
                          stepCompleted 
                            ? 'cursor-pointer' 
                            : stepProgress > 0 
                            ? 'cursor-pointer' 
                            : 'opacity-50'
                        }`}
                      >
                        {/* Step Circle */}
                        <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center font-bold text-base md:text-lg mx-auto mb-2 transition-all ${
                          stepCompleted
                            ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg shadow-green-500/50 group-hover:shadow-green-500/70'
                            : stepProgress > 0
                            ? 'bg-gradient-to-br from-[#06b6d4] to-[#0891b2] text-white shadow-lg shadow-[#06b6d4]/50 group-hover:shadow-[#06b6d4]/70'
                            : 'bg-slate-100 text-slate-500 border-2 border-slate-200 group-hover:border-[#06b6d4]'
                        }`}>
                          {stepCompleted ? (
                            <CheckCircle size={28} className="md:w-8 md:h-8" />
                          ) : (
                            <span>{step.stepNumber}</span>
                          )}
                        </div>
                        
                        {/* Step Title */}
                        <div className="text-center">
                          <h4 className={`text-xs font-semibold ${
                            stepCompleted ? 'text-green-400' : stepProgress > 0 ? 'text-[#06b6d4]' : 'text-slate-500'
                          }`}>
                            {step.shortTitle}
                          </h4>
                        </div>
                        
                        {/* Pulse animation for active step */}
                        {expandedStep === step.id && (
                          <motion.div
                            initial={{ scale: 1 }}
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute inset-0 rounded-full border-2 border-[#06b6d4] opacity-50"
                          />
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Journey Steps */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {currentPhaseSteps.map((step, index) => {
              const stepCompleted = step.checklist.every(task => 
                completedTasks.has(`${step.id}-${task.id}`)
              )
              const stepProgress = step.checklist.filter(task => 
                completedTasks.has(`${step.id}-${task.id}`)
              ).length
              const stepProgressPercent = (stepProgress / step.checklist.length) * 100
              const isExpanded = expandedStep === step.id

              return (
                <motion.div
                  key={step.id}
                  id={step.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-white border rounded-xl overflow-hidden transition-all ${
                    isExpanded 
                      ? 'border-[#06b6d4] shadow-lg shadow-[#06b6d4]/20' 
                      : 'border-slate-200 hover:border-slate-200'
                  }`}
                >
                  {/* Step Header */}
                  <motion.div
                    className="p-6 cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                            stepCompleted
                              ? 'bg-green-500 text-white'
                              : stepProgress > 0
                              ? 'bg-[#06b6d4] text-white'
                              : 'bg-slate-200 text-slate-600'
                          }`}>
                            {stepCompleted ? (
                              <CheckCircle size={24} />
                            ) : (
                              <span>{step.order}</span>
                            )}
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold">{step.title}</h3>
                            <p className="text-slate-500 mt-1">{step.description}</p>
                          </div>
                        </div>
                        {step.personalizedNote && (
                          <div className="mt-3 p-3 bg-[#06b6d4]/10 border border-[#06b6d4]/30 rounded-lg">
                            <div className="flex items-start gap-2">
                              <Info className="text-[#06b6d4] mt-0.5" size={18} />
                              <p className="text-sm text-slate-600">{step.personalizedNote}</p>
                            </div>
                          </div>
                        )}
                        <div className="mt-4 flex items-center gap-4 text-sm text-slate-500">
                          <div className="flex items-center gap-2">
                            <Clock size={16} />
                            <span>~{step.estimatedDays} days</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Target size={16} />
                            <span>{stepProgress}/{step.checklist.length} tasks</span>
                          </div>
                          {stepProgress > 0 && (
                            <div className="flex-1 max-w-xs">
                              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${stepProgressPercent}%` }}
                                  className="h-full bg-[#06b6d4]"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <motion.div
                        animate={{ rotate: isExpanded ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ArrowRight size={24} />
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {expandedStep === step.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 space-y-6 border-t border-slate-200">
                          {/* Interactive Checklist */}
                          <div>
                            <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                              <CheckSquare size={20} className="text-[#06b6d4]" />
                              Your Action Items
                            </h4>
                            <div className="space-y-2">
                              {step.checklist.map((task) => {
                                const taskKey = `${step.id}-${task.id}`
                                const isCompleted = completedTasks.has(taskKey)
                                return (
                                  <motion.label
                                    key={task.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    whileHover={{ x: 4 }}
                                    className={`flex items-start gap-3 p-4 rounded-lg cursor-pointer transition-all ${
                                      isCompleted
                                        ? 'bg-green-500/10 border border-green-500/30'
                                        : 'bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-[#06b6d4]/50'
                                    }`}
                                  >
                                    <motion.div
                                      whileTap={{ scale: 0.9 }}
                                      className="relative"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isCompleted}
                                        onChange={() => {
                                          if (isCompleted) {
                                            const newSet = new Set(completedTasks)
                                            newSet.delete(taskKey)
                                            setCompletedTasks(newSet)
                                          } else {
                                            handleTaskComplete(step.id, task.id, task.xpReward)
                                          }
                                        }}
                                        className="w-6 h-6 rounded border-slate-200 bg-slate-100 text-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4] cursor-pointer"
                                      />
                                      {isCompleted && (
                                        <motion.div
                                          initial={{ scale: 0 }}
                                          animate={{ scale: 1 }}
                                          className="absolute inset-0 flex items-center justify-center"
                                        >
                                          <CheckCircle size={20} className="text-green-400" />
                                        </motion.div>
                                      )}
                                    </motion.div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`font-medium ${
                                          isCompleted 
                                            ? 'line-through text-slate-500' 
                                            : 'text-slate-700'
                                        }`}>
                                          {task.task}
                                        </span>
                                        {task.required && !isCompleted && (
                                          <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">Required</span>
                                        )}
                                        {!isCompleted && (
                                          <motion.span
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-xs bg-[#06b6d4]/20 text-[#06b6d4] px-2 py-0.5 rounded ml-auto"
                                          >
                                            +{task.xpReward} XP
                                          </motion.span>
                                        )}
                                      </div>
                                      <p className={`text-sm mt-1 ${
                                        isCompleted ? 'text-slate-500' : 'text-slate-500'
                                      }`}>
                                        {task.description}
                                      </p>
                                    </div>
                                  </motion.label>
                                )
                              })}
                            </div>
                          </div>

                          {/* Interactive Resources */}
                          {(step.resources.length > 0 || getResourcesForJourneyStep(step.id).length > 0) && (
                            <div>
                              <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <FileText size={20} className="text-[#06b6d4]" />
                                Helpful Resources
                              </h4>
                              <div className="grid md:grid-cols-2 gap-3">
                                {step.resources.map((resource, idx) => (
                                  <motion.a
                                    key={idx}
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    whileHover={{ scale: 1.02, x: 4 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-[#06b6d4] transition-all cursor-pointer group"
                                  >
                                    <div className="flex items-center gap-2 mb-2">
                                      {resource.type === 'calculator' && <Calculator size={18} className="text-[#06b6d4]" />}
                                      {resource.type !== 'calculator' && <FileText size={18} className="text-[#06b6d4]" />}
                                      <span className="font-medium text-slate-700 group-hover:text-[#06b6d4] transition-colors">
                                        {resource.title}
                                      </span>
                                      <ArrowRight size={14} className="ml-auto text-slate-500 group-hover:text-[#06b6d4] group-hover:translate-x-1 transition-all" />
                                    </div>
                                  </motion.a>
                                ))}
                                {getResourcesForJourneyStep(step.id).map((fannieResource) => (
                                  <motion.a
                                    key={fannieResource.id}
                                    href={fannieResource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    whileHover={{ scale: 1.02, x: 4 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg border border-blue-500/30 hover:border-blue-500/50 transition-all cursor-pointer group"
                                  >
                                    <div className="flex items-center gap-2 mb-2">
                                      {(fannieResource.category === 'calculator' || fannieResource.category === 'tool') && (
                                        <Calculator size={18} className="text-blue-400" />
                                      )}
                                      {fannieResource.category !== 'calculator' && fannieResource.category !== 'tool' && (
                                        <FileText size={18} className="text-blue-400" />
                                      )}
                                      <span className="font-medium text-blue-300 group-hover:text-blue-200 transition-colors">
                                        {fannieResource.title}
                                      </span>
                                      <ArrowRight size={14} className="ml-auto text-blue-400 group-hover:translate-x-1 transition-all" />
                                    </div>
                                    <p className="text-xs text-slate-500 line-clamp-2">{fannieResource.description}</p>
                                  </motion.a>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Tips & Red Flags */}
                          {(step.tips.length > 0 || step.redFlags.length > 0) && (
                            <div className="grid md:grid-cols-2 gap-4">
                              {step.tips.length > 0 && (
                                <motion.div
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg"
                                >
                                  <h4 className="text-lg font-bold mb-3 flex items-center gap-2">
                                    <Info className="text-green-400" size={20} />
                                    Pro Tips
                                  </h4>
                                  <ul className="space-y-2">
                                    {step.tips.map((tip, idx) => (
                                      <motion.li
                                        key={idx}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="flex items-start gap-2 text-sm text-slate-600"
                                      >
                                        <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                                        <span>{tip}</span>
                                      </motion.li>
                                    ))}
                                  </ul>
                                </motion.div>
                              )}
                              {step.redFlags.length > 0 && (
                                <motion.div
                                  initial={{ opacity: 0, x: 20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
                                >
                                  <h4 className="text-lg font-bold mb-3 flex items-center gap-2">
                                    <AlertCircle className="text-red-400" size={20} />
                                    Watch Out
                                  </h4>
                                  <ul className="space-y-2">
                                    {step.redFlags.map((flag, idx) => (
                                      <motion.li
                                        key={idx}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="flex items-start gap-2 text-sm text-slate-600"
                                      >
                                        <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                                        <span>{flag}</span>
                                      </motion.li>
                                    ))}
                                  </ul>
                                </motion.div>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* Readiness Score Modal */}
        {activeReadinessModal && readinessScore && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setActiveReadinessModal(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-6"
            >
              {(() => {
                const item = {
                  creditScore: {
                    title: 'Credit Score',
                    icon: '💳',
                    max: 30,
                    description: 'Your credit score determines the interest rate you\'ll get on your mortgage. Higher scores = lower rates = thousands saved over the life of the loan.',
                    statusExplanations: {
                      excellent: '750+ credit score - You\'ll get the best rates available, saving thousands in interest.',
                      good: '700-749 credit score - Good rates, but improving to 750+ could save additional money.',
                      fair: '650-699 credit score - Decent rates, but room for improvement. Focus on paying bills on time and reducing debt.',
                      'needs-work': 'Under 650 - Lower scores mean higher rates. Prioritize improving your credit before buying.'
                    },
                    tips: [
                      'Pay all bills on time - even one late payment can hurt your score',
                      'Keep credit card balances under 30% of limits',
                      'Don\'t open new credit accounts before applying for a mortgage',
                      'Check your credit report for errors and dispute them'
                    ]
                  },
                  dtiRatio: {
                    title: 'Debt-to-Income Ratio',
                    icon: '📊',
                    max: 25,
                    description: 'Your DTI is your monthly debt payments divided by your gross monthly income. Lenders prefer DTI under 36%, but under 20% gets you the best rates.',
                    statusExplanations: {
                      excellent: 'DTI under 20% - Excellent! You\'ll get the best rates and have plenty of breathing room.',
                      good: 'DTI 20-28% - Good position. You\'ll qualify for competitive rates.',
                      fair: 'DTI 28-36% - Acceptable, but lenders may be more cautious. Consider paying down debt.',
                      'needs-work': 'DTI over 36% - This will limit your buying power and increase your interest rate significantly.'
                    },
                    tips: [
                      'Pay down high-interest debt before applying',
                      'Avoid taking on new debt before buying',
                      'Increase your income if possible',
                      'Consider debt consolidation to lower monthly payments'
                    ]
                  },
                  downPayment: {
                    title: 'Down Payment',
                    icon: '💰',
                    max: 25,
                    description: 'The amount you pay upfront. 20% down eliminates PMI and gets you better rates. Even 10% down saves money compared to minimum down payments.',
                    statusExplanations: {
                      excellent: '20%+ down - Excellent! No PMI, better rates, and lower monthly payments.',
                      good: '15-19% down - Good position. You\'ll pay PMI but it\'s manageable.',
                      fair: '10-14% down - Acceptable, but PMI adds to monthly costs. Saving more will help.',
                      'needs-work': 'Under 10% down - Higher PMI costs and rates. Consider saving more or looking at lower-priced homes.'
                    },
                    tips: [
                      'Aim for 20% to avoid PMI (saves $100-300/month)',
                      'Look into down payment assistance programs',
                      'Consider gift funds from family if allowed',
                      'Use our savings calculator to see how long to save'
                    ]
                  },
                  timeline: {
                    title: 'Timeline',
                    icon: '📅',
                    max: 10,
                    description: 'How soon you want to buy. More time = better preparation, more savings, and better deals.',
                    statusExplanations: {
                      excellent: 'Exploring/1 year+ - Perfect! You have time to improve your financial position and save more.',
                      good: '6-12 months - Good timeline. Enough time to prepare and shop for deals.',
                      fair: '3-6 months - Doable, but you\'ll need to move fast. Less time to save and negotiate.',
                      'needs-work': 'Under 3 months - Very tight timeline. You may miss opportunities to save money.'
                    },
                    tips: [
                      'More time = more savings opportunities',
                      'Use extra time to improve credit and save more',
                      'Shop during off-peak seasons for better deals',
                      'Don\'t rush - better preparation saves thousands'
                    ]
                  },
                  savingsBuffer: {
                    title: 'Savings Buffer',
                    icon: '🏦',
                    max: 10,
                    description: 'Your emergency fund beyond the down payment. Having 3-6 months of expenses saved protects you from unexpected costs and job loss.',
                    statusExplanations: {
                      excellent: '6+ months expenses saved - Excellent financial security! You\'re well-protected.',
                      good: '3-6 months expenses saved - Good buffer. You have protection against emergencies.',
                      fair: '1-3 months expenses saved - Some protection, but consider building it up more.',
                      'needs-work': 'Less than 1 month saved - Risky. Unexpected costs could cause serious problems.'
                    },
                    tips: [
                      'Keep 3-6 months of expenses in emergency fund',
                      'Don\'t use all savings for down payment',
                      'Factor in homeownership costs (repairs, maintenance)',
                      'Build buffer before buying if possible'
                    ]
                  }
                }[activeReadinessModal]
                
                if (!item) return null
                
                const score = readinessScore.breakdown[activeReadinessModal] || 0
                const percent = (score / item.max) * 100
                const status = percent >= 80 ? 'excellent' : percent >= 60 ? 'good' : percent >= 40 ? 'fair' : 'needs-work'
                
                return (
                  <>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{item.icon}</span>
                        <div>
                          <h3 className="text-xl font-bold">{item.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-2xl font-bold text-blue-400">{score}</span>
                            <span className="text-slate-500">/ {item.max}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveReadinessModal(null)}
                        className="text-slate-500 hover:text-white transition-colors"
                      >
                        <X size={24} />
                      </button>
                    </div>
                    
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-4">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        className={`h-full ${
                          status === 'excellent' ? 'bg-green-500' :
                          status === 'good' ? 'bg-blue-500' :
                          status === 'fair' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                      />
                    </div>
                    
                    <p className="text-slate-600 mb-4">{item.description}</p>
                    
                    <div className={`p-3 rounded-lg mb-4 ${
                      status === 'excellent' ? 'bg-green-500/20 border border-green-500/30' :
                      status === 'good' ? 'bg-blue-500/20 border border-blue-500/30' :
                      status === 'fair' ? 'bg-yellow-500/20 border border-yellow-500/30' :
                      'bg-red-500/20 border border-red-500/30'
                    }`}>
                      <p className={`font-semibold mb-1 ${
                        status === 'excellent' ? 'text-green-400' :
                        status === 'good' ? 'text-blue-400' :
                        status === 'fair' ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        Your Status: {status === 'excellent' ? 'Excellent' : status === 'good' ? 'Good' : status === 'fair' ? 'Fair' : 'Needs Work'}
                      </p>
                      <p className="text-sm text-slate-600">{item.statusExplanations[status]}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2 text-slate-700">Tips to Improve:</h4>
                      <ul className="space-y-2">
                        {item.tips.map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                            <CheckCircle size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )
              })()}
            </motion.div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="mt-12 flex justify-between items-center">
          <Link
            href="/results"
            className="text-[#06b6d4] hover:text-[#0891b2] font-semibold flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            Back to Results
          </Link>
          <Link
            href="/customized-journey"
            className="bg-[#06b6d4] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0891b2] transition-colors"
          >
            View Your Journey
          </Link>
        </div>
      </div>

      <NotificationSystem
        notifications={notifications}
        onRemove={removeNotification}
      />
    </div>
  )
}

export default function JourneyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[rgb(var(--sky-light))] text-slate-800 font-sans flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#06b6d4] mx-auto mb-4"></div>
          <p className="text-slate-500">Loading your journey...</p>
        </div>
      </div>
    }>
      <JourneyPageContent />
    </Suspense>
  )
}

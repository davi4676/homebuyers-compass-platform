'use client'

import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpCircle,
  Check,
  Home,
  Info,
  Landmark,
  Loader2,
  Percent,
  RefreshCw,
  Sprout,
  TrendingUp,
  User,
  Waypoints,
} from 'lucide-react'
import Link from 'next/link'
import { useAuth, saveQuizResults } from '@/lib/hooks/useAuth'
import { trackActivity } from '@/lib/track-activity'
import {
  formatCurrency,
  calculateDTI,
  getCityData,
  getZipCodeData,
  getCityDataWithZillow,
  getZipCodeDataWithZillow,
  calculateAffordability,
  calculateCostBreakdown,
  identifySavingsOpportunities,
  type CreditScoreRange,
  type Timeline,
  type AgentStatus,
  type Concern,
  type QuizData,
} from '@/lib/calculations'
import { computeEducationScoreFromQuiz } from '@/lib/quiz-questions'
import { analyzeRepeatBuyer, type RepeatBuyerData } from '@/lib/calculations-repeat-buyer'
import { analyzeRefinance, type RefinanceData } from '@/lib/calculations-refinance'
import { SIGNUP_DISABLED } from '@/lib/auth-flags'
import { formatNumberForInput, parseFormattedNumber } from '@/lib/number-format'
import { 
  getQuestionsForTransactionType, 
  getFilteredQuestions, 
  type TransactionType, 
  type Question 
} from '@/lib/quiz-questions'
import { parseIcpTypeParam, parseNarrativeQuizEntry, resolveTransactionAndIcp, type IcpType } from '@/lib/icp-types'
import { enablePlainEnglishForFirstGenBuyer } from '@/lib/first-gen-preferences'
import { getPersonalizedQuizHeadline, getQuizStateDisplayName } from '@/lib/quiz-result-copy'
import { ConversationalIcpQuiz } from '@/components/quiz/ConversationalIcpQuiz'
import PlainEnglishText from '@/components/PlainEnglishText'
import BackToMyJourneyLink from '@/components/BackToMyJourneyLink'
import ResultsReferralCard from '@/components/results/ResultsReferralCard'
import { getOrCreateReferralCode } from '@/lib/referral-program'
import { track } from '@/lib/analytics'
import { startMomentumTrialFromUi } from '@/lib/start-momentum-trial-client'

const QUICK_SCAN_STEPS = 3

function QuizCardProgressBar({
  left,
  right,
  percent,
}: {
  left: ReactNode
  right: ReactNode
  percent: number
}) {
  const w = Math.min(100, Math.max(0, percent))
  return (
    <div className="w-full mb-6">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{left}</span>
        <span>{right}</span>
      </div>
      <div className="w-full rounded-full bg-gray-200 h-2">
        <div
          className="h-2 rounded-full bg-teal-500 transition-all duration-500 ease-out"
          style={{ width: `${w}%` }}
        />
      </div>
    </div>
  )
}

// Form validation schema - base schema that gets extended based on transaction type
const baseQuizSchema = z.object({
  transactionType: z.enum(['first-time', 'repeat-buyer', 'refinance']),
})

const firstTimeSchema = baseQuizSchema.extend({
  transactionType: z.literal('first-time'),
  income: z.number().min(30000).max(2000000),
  monthlyDebt: z.number().min(0).max(5000),
  downPayment: z.number().min(0).max(100000),
  targetHomePrice: z.number().min(100000).max(2000000).optional(),
  city: z.string().min(1),
  timeline: z.enum(['3-months', '6-months', '1-year', 'exploring']),
  creditScore: z.enum(['under-600', '600-650', '650-700', '700-750', '750+']),
  agentStatus: z.enum(['have-agent', 'interviewing', 'not-yet', 'solo']),
  concern: z.enum(['affording', 'hidden-costs', 'ripped-off', 'wrong-choice', 'timing', 'other']),
  icpType: z.enum(['first-time', 'first-gen', 'solo', 'move-up']).optional(),
  firstGenFamilyOwned: z.enum(['yes', 'no-first', 'unsure']).optional(),
  soloPurchaseIncome: z.enum(['solo', 'coborrower', 'other']).optional(),
  soloNeighborhoodPriority: z.enum(['safety', 'schools', 'walkability', 'commute', 'community']).optional(),
  eduQuiz_1: z.enum(['0', '1', '2', '3']).optional(),
  eduQuiz_3: z.enum(['0', '1', '2', '3']).optional(),
  eduQuiz_4: z.enum(['0', '1', '2', '3']).optional(),
})

const repeatBuyerSchema = baseQuizSchema.extend({
  transactionType: z.literal('repeat-buyer'),
  icpType: z.enum(['repeat-buyer', 'move-up']).optional(),
  income: z.number().min(30000).max(2000000),
  monthlyDebt: z.number().min(0).max(5000),
  currentHomeValue: z.number().min(100000).max(2000000),
  currentMortgageBalance: z.number().min(0).max(1500000),
  ownedYears: z.enum(['<1', '1-2', '2-5', '5-10', '10+']),
  saleStatus: z.enum(['not-listed', 'listed', 'under-contract', 'closed']),
  expectedSalePrice: z.number().min(100000).max(2000000),
  agentCommission: z.number().min(0).max(6),
  repairsAndConcessions: z.number().min(0).max(50000),
  debtPayoff: z.number().min(0).max(200000),
  additionalSavings: z.number().min(0).max(200000),
  repeatBuyerSellConcurrent: z.enum(['yes', 'no', 'already-sold']).optional(),
  city: z.string().min(1),
  timeline: z.enum(['3-months', '6-months', '1-year', 'exploring']),
  creditScore: z.enum(['under-600', '600-650', '650-700', '700-750', '750+']),
  currentRate: z.number().min(2).max(8),
  currentYearsRemaining: z.number().min(1).max(30),
  currentMonthlyPayment: z.number().min(500).max(10000),
  agentStatus: z.enum(['have-agent', 'interviewing', 'not-yet', 'solo']),
  concern: z.enum(['affording', 'hidden-costs', 'ripped-off', 'wrong-choice', 'timing', 'sale-timing', 'bridge-financing', 'tax-implications', 'other']),
})

const refinanceSchema = baseQuizSchema.extend({
  transactionType: z.literal('refinance'),
  icpType: z.literal('refinance').optional(),
  refiPrimaryGoal: z.enum(['lower-monthly', 'access-equity', 'shorten-term', 'better-rate']),
  refiYearsInHome: z.enum(['<2', '2-5', '5-10', '10+']),
})

// Union type for all schemas
const quizSchema = z.discriminatedUnion('transactionType', [
  firstTimeSchema,
  repeatBuyerSchema,
  refinanceSchema,
])

type QuizFormData = z.infer<typeof quizSchema>

/** First question id that begins the financial inputs for each journey (after transaction type). */
const FINANCIAL_ASSESSMENT_START_ID: Record<TransactionType, string> = {
  'first-time': 'income',
  'repeat-buyer': 'income',
  refinance: 'refiPrimaryGoal',
}

// City options (100+ major US metro areas)
const CITIES = [
  'Akron', 'Albany', 'Albuquerque', 'Alexandria', 'Allentown', 'Amarillo', 'Anaheim', 'Anchorage', 'Ann Arbor', 'Arlington',
  'Atlanta', 'Augusta', 'Aurora', 'Austin', 'Bakersfield', 'Baltimore', 'Baton Rouge', 'Birmingham', 'Boise', 'Boston',
  'Bridgeport', 'Buffalo', 'Cape Coral', 'Carlsbad', 'Carrollton', 'Cary', 'Cedar Rapids', 'Chandler', 'Charleston', 'Charlotte',
  'Chattanooga', 'Chesapeake', 'Chicago', 'Chula Vista', 'Cincinnati', 'Clarksville', 'Clearwater', 'Cleveland', 'Colorado Springs', 'Columbia',
  'Columbus', 'Concord', 'Corpus Christi', 'Dallas', 'Davenport', 'Dayton', 'Denver', 'Des Moines', 'Detroit', 'Durham',
  'El Paso', 'Elk Grove', 'Escondido', 'Eugene', 'Evansville', 'Fayetteville', 'Fontana', 'Fort Collins', 'Fort Lauderdale', 'Fort Wayne',
  'Fort Worth', 'Fremont', 'Fresno', 'Frisco', 'Gainesville', 'Garden Grove', 'Garland', 'Gilbert', 'Glendale', 'Grand Prairie',
  'Grand Rapids', 'Greensboro', 'Greenville', 'Hampton', 'Hartford', 'Hayward', 'Henderson', 'Hialeah', 'Honolulu', 'Houston',
  'Huntsville', 'Independence', 'Indianapolis', 'Inglewood', 'Irvine', 'Irving', 'Jackson', 'Jacksonville', 'Jersey City', 'Joliet',
  'Kansas City', 'Knoxville', 'Lakeland', 'Laredo', 'Las Vegas', 'Lexington', 'Lincoln', 'Little Rock', 'Long Beach', 'Los Angeles',
  'Louisville', 'Lubbock', 'Madison', 'McAllen', 'McKinney', 'Memphis', 'Mesa', 'Miami', 'Milwaukee', 'Minneapolis',
  'Mobile', 'Modesto', 'Montgomery', 'Moreno Valley', 'Nashville', 'New Haven', 'New Orleans', 'New York', 'Newark', 'Newport News',
  'Norfolk', 'Norman', 'North Las Vegas', 'Oakland', 'Oceanside', 'Oklahoma City', 'Omaha', 'Ontario', 'Orlando', 'Oxnard',
  'Palm Bay', 'Palmdale', 'Pasadena', 'Paterson', 'Pensacola', 'Peoria', 'Philadelphia', 'Phoenix', 'Pittsburgh', 'Plano',
  'Portland', 'Port St. Lucie', 'Providence', 'Raleigh', 'Reno', 'Richmond', 'Riverside', 'Rochester', 'Rockford', 'Sacramento',
  'Saint Louis', 'Saint Paul', 'Saint Petersburg', 'Salem', 'Salinas', 'Salt Lake City', 'San Antonio', 'San Bernardino', 'San Diego', 'San Francisco',
  'San Jose', 'Santa Ana', 'Santa Clarita', 'Santa Rosa', 'Savannah', 'Scottsdale', 'Seattle', 'Shreveport', 'Spokane', 'Springfield',
  'Stockton', 'Sunnyvale', 'Syracuse', 'Tacoma', 'Tallahassee', 'Tampa', 'Tempe', 'Thornton', 'Toledo', 'Topeka',
  'Tucson', 'Tulsa', 'Vallejo', 'Vancouver', 'Virginia Beach', 'Visalia', 'Warren', 'Washington DC', 'West Covina', 'West Valley City',
  'Wichita', 'Wilmington', 'Winston-Salem', 'Worcester', 'Yonkers',
].sort()

function quizStageLabel(
  filtered: Question[],
  currentIndex: number,
  transactionType: TransactionType | null
): string {
  if (!transactionType || filtered.length === 0) return ''
  const skipTxn = filtered[0]?.id === 'transactionType' ? 1 : 0
  const i = Math.max(0, currentIndex - skipTxn)
  if (i < 3) return 'Financial Picture'
  if (i < 6) return 'Your Situation'
  return 'Your Goals'
}

async function computeQuizSavingsEstimate(
  data: Record<string, unknown>,
  transactionType: TransactionType
): Promise<number> {
  if (transactionType === 'first-time') {
    const eduScore = computeEducationScoreFromQuiz(data as Record<string, string | undefined>)
    const quizData: QuizData & { eduScore?: number } = {
      income: Number(data.income) || 60000,
      monthlyDebt: Number(data.monthlyDebt) || 0,
      downPayment: Number(data.downPayment) || 20000,
      city: String(data.city || 'Austin'),
      timeline: (data.timeline || '6-months') as QuizData['timeline'],
      creditScore: (data.creditScore || '650-700') as QuizData['creditScore'],
      agentStatus: (data.agentStatus || 'not-yet') as QuizData['agentStatus'],
      concern: (data.concern || 'hidden-costs') as QuizData['concern'],
      ...(data.targetHomePrice != null ? { targetHomePrice: Number(data.targetHomePrice) } : {}),
      ...(eduScore != null ? { eduScore } : {}),
    }
    const affordability = calculateAffordability(quizData)
    const costBreakdown = await calculateCostBreakdown(affordability, quizData.city, quizData.downPayment)
    const opps = identifySavingsOpportunities(quizData, costBreakdown, affordability)
    return Math.round(
      opps.reduce((sum, o) => sum + Number(o.savingsMax ?? o.savingsMin ?? 0), 0)
    )
  }

  if (transactionType === 'repeat-buyer') {
    const salePrice = Number(data.expectedSalePrice) || 400000
    const rb: RepeatBuyerData = {
      transactionType: 'repeat-buyer',
      income: Number(data.income) || 80000,
      monthlyDebt: Number(data.monthlyDebt) || 0,
      currentHomeValue: Number(data.currentHomeValue) || 400000,
      currentMortgageBalance: Number(data.currentMortgageBalance) || 200000,
      ownedYears: (data.ownedYears || '2-5') as RepeatBuyerData['ownedYears'],
      saleStatus: (data.saleStatus || 'not-listed') as RepeatBuyerData['saleStatus'],
      expectedSalePrice: salePrice,
      sellingClosingCosts: Math.round(salePrice * 0.02),
      agentCommission: Number(data.agentCommission) || 5,
      repairsAndConcessions: Number(data.repairsAndConcessions) || 0,
      debtPayoff: Number(data.debtPayoff) || 0,
      additionalSavings: Number(data.additionalSavings) || 0,
      city: String(data.city || 'Austin'),
      timeline: (data.timeline || '6-months') as RepeatBuyerData['timeline'],
      creditScore: (data.creditScore || '650-700') as RepeatBuyerData['creditScore'],
      agentStatus: (data.agentStatus || 'not-yet') as RepeatBuyerData['agentStatus'],
      concern: String(data.concern || 'other'),
      currentRate: Number(data.currentRate) || 6,
      currentYearsRemaining: Number(data.currentYearsRemaining) || 25,
      currentMonthlyPayment: Number(data.currentMonthlyPayment) || 2000,
    }
    const analysis = analyzeRepeatBuyer(rb)
    const equity = analysis.equityPosition.grossEquity
    return Math.min(
      150000,
      Math.max(12000, Math.round(equity * 0.1 + Number(analysis.saleProceeds.netProceeds) * 0.04))
    )
  }

  const primary = String(data.refiPrimaryGoal || 'lower-monthly')
  const cashout =
    primary === 'access-equity'
      ? 35000
      : data.cashoutAmount != null
        ? Number(data.cashoutAmount)
        : undefined
  const goals: string[] =
    primary === 'lower-monthly'
      ? ['lower-payment']
      : primary === 'shorten-term'
        ? ['shorter-term']
        : primary === 'access-equity'
          ? ['lower-payment']
          : []

  const refi: RefinanceData = {
    transactionType: 'refinance',
    currentHomeValue: Number(data.currentHomeValue) || 450000,
    currentMortgageBalance: Number(data.currentMortgageBalance) || 300000,
    currentRate: Number(data.currentRate) || 6.5,
    currentMonthlyPayment: Number(data.currentMonthlyPayment) || 2000,
    yearsRemaining: Number(data.yearsRemaining) || 25,
    refinanceGoals: goals,
    cashoutAmount: cashout,
    creditScore: (data.creditScore || '650-700') as RefinanceData['creditScore'],
    propertyType: (data.propertyType || 'primary') as RefinanceData['propertyType'],
    previousRefinances: (data.previousRefinances || 'never') as RefinanceData['previousRefinances'],
    concern: String(data.concern || 'other'),
  }
  const analysis = await analyzeRefinance(refi)
  const life = analysis.lifetimeAnalysis.netSavings
  const fallback = analysis.breakEvenAnalysis.monthlySavings * 12 * 7
  return Math.max(4000, Math.round(Math.abs(life) > 1000 ? Math.abs(life) : fallback))
}

export default function QuizPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const narrativeEntry = parseNarrativeQuizEntry(searchParams.get('type'))
  const { isAuthenticated } = useAuth()
  const [transactionType, setTransactionType] = useState<TransactionType | null>(null)
  const [icpType, setIcpType] = useState<IcpType>('first-time')
  /** Quick scan: 3 steps then teaser; full quiz after CTA unless ?full=1 */
  const [quizMode, setQuizMode] = useState<'quick' | 'quick-teaser' | 'full'>(() => {
    const t = searchParams.get('type')?.trim().toLowerCase()
    if (searchParams.get('full') === '1' || t === 'full') return 'full'
    return 'quick'
  })
  const [quickStep, setQuickStep] = useState(0)
  const [quickIncome, setQuickIncome] = useState(75000)
  const [quickPrice, setQuickPrice] = useState(350000)
  const [quickIcp, setQuickIcp] = useState<IcpType>('first-time')
  const [hasLoadedSavedState, setHasLoadedSavedState] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [showTooltip, setShowTooltip] = useState(false)
  const [showInsight, setShowInsight] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [citySearch, setCitySearch] = useState('')
  const [filteredCities, setFilteredCities] = useState(CITIES)
  const [showCityDropdown, setShowCityDropdown] = useState(false)
  const [locationType, setLocationType] = useState<'metro' | 'zip'>('metro')
  const [zipCode, setZipCode] = useState('')
  const [zillowPrice, setZillowPrice] = useState<number | null>(null)
  const [loadingZillow, setLoadingZillow] = useState(false)
  const cityDropdownRef = useRef<HTMLDivElement>(null)
  /** Questions already answered in quick scan or implied by URL — do not show again in full quiz. */
  const [skippedQuestionIds, setSkippedQuestionIds] = useState<Set<string>>(() => new Set())

  const [showCompletionResults, setShowCompletionResults] = useState(false)
  const [completionSavings, setCompletionSavings] = useState(0)
  const [animatedSavings, setAnimatedSavings] = useState(0)
  const [resultEmail, setResultEmail] = useState('')
  /** After email submit or "Skip for now" — reveals full-plan CTA. */
  const [resultPlanRevealed, setResultPlanRevealed] = useState(false)
  /** Set when user submits email (shows success copy before CTA); skip leaves this false. */
  const [resultEmailSaved, setResultEmailSaved] = useState(false)
  const [celebrateResults, setCelebrateResults] = useState(false)
  const [resultReferralSlug, setResultReferralSlug] = useState('yourname')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<any>({
    defaultValues: {
      transactionType: null,
      icpType: 'first-time' as IcpType,
      income: 60000,
      monthlyDebt: 0,
      downPayment: 20000,
      targetHomePrice: 350000,
      city: '',
      refiPrimaryGoal: 'lower-monthly' as const,
      refiYearsInHome: '2-5' as const,
    },
  })

  const watchedValues = watch()

  const prevIcpForPlainEnglish = useRef<IcpType | null>(null)
  useEffect(() => {
    const icp: IcpType =
      quizMode === 'quick' || quizMode === 'quick-teaser'
        ? quickIcp
        : ((watchedValues.icpType as IcpType) || icpType)
    if (icp === 'first-gen' && prevIcpForPlainEnglish.current !== 'first-gen') {
      enablePlainEnglishForFirstGenBuyer()
    }
    prevIcpForPlainEnglish.current = icp
  }, [quizMode, quickIcp, watchedValues.icpType, icpType])

  /** Simultaneous sell+buy → move-up ICP; otherwise stay on repeat-buyer (Repeat Buyer Suite path). */
  useEffect(() => {
    if (transactionType !== 'repeat-buyer') return
    const concurrent = watchedValues.repeatBuyerSellConcurrent as string | undefined
    if (concurrent === 'yes') {
      setIcpType('move-up')
      setValue('icpType', 'move-up')
    } else if (concurrent === 'no' || concurrent === 'already-sold') {
      setIcpType('repeat-buyer')
      setValue('icpType', 'repeat-buyer')
    }
  }, [transactionType, watchedValues.repeatBuyerSellConcurrent, setValue])

  useEffect(() => {
    if (transactionType !== 'first-time') return
    const fg = watchedValues.firstGenFamilyOwned as string | undefined
    if (fg === 'no-first') {
      setIcpType('first-gen')
      setValue('icpType', 'first-gen')
    } else if (fg === 'yes' || fg === 'unsure') {
      if ((watchedValues.icpType as IcpType) === 'first-gen') {
        setIcpType('first-time')
        setValue('icpType', 'first-time')
      }
    }
  }, [transactionType, watchedValues.firstGenFamilyOwned, watchedValues.icpType, setValue])

  // Long-form quiz deep link: ?type=full
  useEffect(() => {
    const t = searchParams.get('type')?.trim().toLowerCase()
    if (t !== 'full') return
    setQuizMode('full')
    setTransactionType('first-time')
    setValue('transactionType', 'first-time')
    setIcpType('first-time')
    setValue('icpType', 'first-time')
  }, [searchParams, setValue])

  // Sync URL ?type= → transaction + ICP (skips narrative-only slugs + full)
  useEffect(() => {
    const fromUrl = parseIcpTypeParam(searchParams.get('type'))
    const legacyTt = searchParams.get('transactionType') as TransactionType | null
    if (fromUrl) {
      const r = resolveTransactionAndIcp(fromUrl)
      setIcpType(r.icpType)
      setTransactionType(r.transactionType)
      setValue('transactionType', r.transactionType)
      setValue('icpType', r.icpType)
      setQuickIcp(fromUrl)
    } else if (legacyTt === 'first-time' || legacyTt === 'repeat-buyer' || legacyTt === 'refinance') {
      setTransactionType(legacyTt)
      setValue('transactionType', legacyTt)
      if (legacyTt === 'repeat-buyer') {
        setValue('icpType', 'repeat-buyer')
        setIcpType('repeat-buyer')
      } else if (legacyTt === 'refinance') {
        setValue('icpType', 'refinance')
        setIcpType('refinance')
      } else {
        setValue('icpType', 'first-time')
        setIcpType('first-time')
      }
    }
  }, [searchParams, setValue])

  // Quick / teaser modes: clear skips so a fresh full run can ask everything
  useEffect(() => {
    if (quizMode === 'quick' || quizMode === 'quick-teaser') {
      setSkippedQuestionIds(new Set())
    }
  }, [quizMode])

  // Deep link ?full=1 with transaction type or ICP in URL — skip re-asking transaction type
  useEffect(() => {
    if (quizMode !== 'full' || searchParams.get('full') !== '1') return
    if (transactionType === null) return
    setSkippedQuestionIds((prev) => {
      if (prev.has('transactionType')) return prev
      return new Set(Array.from(prev).concat('transactionType'))
    })
  }, [quizMode, searchParams, transactionType])

  // Get questions based on transaction type (null = one question: transaction type with three categories)
  const allQuestions = getQuestionsForTransactionType(transactionType)
  const filteredQuestions = getFilteredQuestions(allQuestions, {
    transactionType,
    icpType: (watchedValues.icpType as IcpType) || icpType,
    ...watchedValues,
  }).filter((q) => !skippedQuestionIds.has(q.id))

  // Reset to first question if current index is out of bounds
  useEffect(() => {
    if (currentQuestion >= filteredQuestions.length && filteredQuestions.length > 0) {
      setCurrentQuestion(0)
    }
  }, [filteredQuestions.length, currentQuestion])

  const currentQ = filteredQuestions[currentQuestion]
  const currentValue = currentQ ? watchedValues[currentQ.id] : undefined

  // Filter cities based on search
  useEffect(() => {
    if (citySearch) {
      setFilteredCities(CITIES.filter(city =>
        city.toLowerCase().includes(citySearch.toLowerCase())
      ))
    } else {
      setFilteredCities(CITIES)
    }
  }, [citySearch])

  // Show micro-insight after answer
  useEffect(() => {
    if (currentValue !== undefined && currentValue !== '' && currentValue !== null) {
      if (currentQ?.getInsight) {
        setShowInsight(true)
        const timer = setTimeout(() => setShowInsight(false), 5000)
        return () => clearTimeout(timer)
      }
    } else {
      setShowInsight(false)
    }
  }, [currentValue, currentQ])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
        setShowCityDropdown(false)
      }
    }

    if (showCityDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showCityDropdown])

  // Load saved quiz state for signed-in users (transaction type + answers)
  useEffect(() => {
    if (!isAuthenticated || hasLoadedSavedState) return
    let cancelled = false
    fetch('/api/user/quiz-state', { credentials: 'include' })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (cancelled || !data) return
        if (data.transactionType && ['first-time', 'repeat-buyer', 'refinance'].includes(data.transactionType)) {
          setTransactionType(data.transactionType as TransactionType)
          setValue('transactionType', data.transactionType)
        }
        if (data.quizAnswers && typeof data.quizAnswers === 'object') {
          Object.entries(data.quizAnswers).forEach(([key, value]) => {
            if (value !== undefined && value !== null && key !== 'transactionType') {
              setValue(key, value)
            }
          })
        }
      })
      .finally(() => setHasLoadedSavedState(true))
    return () => { cancelled = true }
  }, [isAuthenticated, hasLoadedSavedState, setValue])

  const handleNext = () => {
    if (currentQuestion < filteredQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setShowTooltip(false)
      setShowInsight(false)
    } else {
      handleSubmit(onSubmit)()
    }
  }

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
      setShowTooltip(false)
      setShowInsight(false)
    }
  }

  useEffect(() => {
    if (!showCompletionResults || completionSavings <= 0) return
    setAnimatedSavings(0)
    let start: number | null = null
    const duration = 1500
    const to = completionSavings
    const tick = (now: number) => {
      if (start === null) start = now
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const raw = Math.floor(eased * to)
      setAnimatedSavings(progress >= 1 ? to : raw)
      if (progress < 1) requestAnimationFrame(tick)
    }
    const id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [showCompletionResults, completionSavings])

  useEffect(() => {
    if (!showCompletionResults) {
      setCelebrateResults(false)
      return
    }
    const timer = setTimeout(() => setCelebrateResults(true), 500)
    return () => clearTimeout(timer)
  }, [showCompletionResults])

  useEffect(() => {
    if (!showCompletionResults || typeof window === 'undefined') return
    setResultReferralSlug(getOrCreateReferralCode(null))
  }, [showCompletionResults])

  const onSubmit = async (data: any) => {
    setIsLoading(true)
    const tt = transactionType || 'first-time'
    const icp = (data.icpType as IcpType) || icpType
    if (icp === 'first-gen') enablePlainEnglishForFirstGenBuyer()
    track.quizCompleted(icp)

    let total = 12450
    try {
      total = await computeQuizSavingsEstimate(data as Record<string, unknown>, tt)
    } catch (e) {
      console.warn('Savings estimate fallback', e)
    }
    total = Math.min(200000, Math.max(3500, Math.round(total)))

    const params = new URLSearchParams({
      transactionType: tt,
    })
    params.set('icpType', icp)
    params.set('type', icp)

    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
        if (Array.isArray(data[key])) {
          params.append(key, data[key].join(','))
        } else {
          params.append(key, String(data[key]))
        }
      }
    })

    if (locationType === 'zip' && zipCode) {
      params.set('city', zipCode)
      if (/^\d{5}$/.test(zipCode.trim())) {
        params.set('zipCode', zipCode.trim())
      }
    }
    params.set('locationType', locationType)

    const quizPayload = {
      ...data,
      transactionType: tt,
      icpType: icp,
      estimatedSavings: total,
      completedAt: new Date().toISOString(),
    }
    try {
      localStorage.setItem('quizData', JSON.stringify(quizPayload))
    } catch {
      /* ignore quota */
    }

    if (isAuthenticated) {
      saveQuizResults({ ...data, transactionType: tt, icpType: icp }).catch(() => {})
      trackActivity('quiz_completed', { transactionType: tt, icpType: icp })
    }

    if (tt === 'refinance') {
      router.push('/refinance-optimizer')
      return
    }
    if (tt === 'repeat-buyer' && icp === 'repeat-buyer') {
      router.push('/repeat-buyer-suite')
      return
    }

    setCompletionSavings(total)
    setAnimatedSavings(0)
    setShowCompletionResults(true)
    setResultPlanRevealed(false)
    setResultEmailSaved(false)
    setResultEmail('')
    setIsLoading(false)
  }

  const handlePlanEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!resultEmail.trim()) return
    const trimmed = resultEmail.trim()
    console.log('[quiz results] email capture:', trimmed)
    try {
      localStorage.setItem('quizLeadEmail', trimmed)
      localStorage.setItem('quizLeadEmailCapturedAt', new Date().toISOString())
    } catch {
      /* ignore */
    }
    trackActivity('tool_used', {
      tool: 'quiz_result_email_capture',
      email_length: trimmed.length,
    })
    setResultEmailSaved(true)
    setResultPlanRevealed(true)
  }

  const authSignupRedirect = (path: string) =>
    SIGNUP_DISABLED ? path : `/auth?mode=signup&redirect=${encodeURIComponent(path)}`

  const handleStartTrialFromQuiz = useCallback(() => {
    void startMomentumTrialFromUi('quiz_result', router.push)
  }, [router])

  const progress = filteredQuestions.length > 0 ? ((currentQuestion + 1) / filteredQuestions.length) * 100 : 0
  const quizStageLine = quizStageLabel(filteredQuestions, currentQuestion, transactionType)
  const hasAnswer = currentQ && (
    currentQ.type === 'transaction-type' ? transactionType !== null :
    currentValue !== undefined && currentValue !== '' && currentValue !== null
  )
  const insightText = currentQ?.getInsight && currentValue
    ? currentQ.getInsight(currentValue, { ...watchedValues, locationType, zipCode } as any)
    : null

  const isStartOfFinancialAssessment =
    Boolean(transactionType && currentQ?.id === FINANCIAL_ASSESSMENT_START_ID[transactionType])

  const teaserAssist = Math.min(25000, Math.round(quickIncome * 0.11 + quickPrice * 0.012))

  const resultIcp = (watchedValues.icpType as IcpType) || icpType
  const resultStateDisplay = getQuizStateDisplayName({
    locationType,
    city: String(watchedValues.city ?? ''),
    zipCode,
  })
  const resultHeadline = getPersonalizedQuizHeadline(resultIcp, resultStateDisplay)
  const sourceSplitDpa = Math.round(completionSavings * 0.6)
  const sourceSplitNegotiation = Math.round(completionSavings * 0.25)
  const sourceSplitProcess = Math.round(completionSavings * 0.15)

  const applyQuickDefaultsToForm = () => {
    const r = resolveTransactionAndIcp(quickIcp)
    setTransactionType(r.transactionType)
    setValue('transactionType', r.transactionType)
    setValue('icpType', r.icpType)
    setIcpType(r.icpType)
    setValue('income', quickIncome)
    setValue('targetHomePrice', quickPrice)
  }

  const startFullQuizFromQuick = () => {
    applyQuickDefaultsToForm()
    setSkippedQuestionIds(new Set(['transactionType', 'income', 'targetHomePrice']))
    setQuizMode('full')
    setCurrentQuestion(0)
  }

  /** Skip link from quick scan: always skip transaction type; skip income/price only after those quick steps were shown. */
  const skipToFullAssessment = () => {
    applyQuickDefaultsToForm()
    const skip = new Set<string>(['transactionType'])
    if (quickStep >= 1) skip.add('income')
    if (quickStep >= 2) skip.add('targetHomePrice')
    setSkippedQuestionIds(skip)
    setQuizMode('full')
    setCurrentQuestion(0)
  }

  return (
    <div className="app-page-shell">
      {/* Header section with graphic */}
      <div className="relative h-32 sm:h-36 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'linear-gradient(135deg, rgba(30,58,95,0.85) 0%, rgba(30,64,175,0.75) 50%, rgba(59,130,246,0.6) 100%), url(https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80)',
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center gap-3 text-white">
            <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            </span>
            <span className="text-lg font-bold tracking-tight">Your free guide</span>
          </div>
        </div>
      </div>

      {narrativeEntry ? (
        <ConversationalIcpQuiz entry={narrativeEntry} />
      ) : (
      <>
      <div className="max-w-2xl mx-auto px-4 pt-4 sm:px-6 lg:px-8">
        <div
          className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-full border border-teal-200/90 bg-teal-50/95 px-3 py-1.5 text-xs font-semibold text-teal-950 shadow-sm"
          role="status"
          aria-live="polite"
        >
          <span className="rounded-md bg-white/90 px-2 py-0.5 font-bold text-teal-900 ring-1 ring-teal-100">
            {quizMode === 'full' ? 'Full assessment' : 'Quick scan'}
          </span>
          <span className="text-teal-800/95">
            {quizMode === 'quick' && `Step ${quickStep + 1} of ${QUICK_SCAN_STEPS}`}
            {quizMode === 'quick-teaser' && 'Results preview'}
            {quizMode === 'full' &&
              filteredQuestions.length > 0 &&
              `Question ${currentQuestion + 1} of ${filteredQuestions.length}`}
          </span>
        </div>
      </div>
      {quizMode === 'quick' && (
        <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <QuizCardProgressBar
              left={<span>Step {quickStep + 1} of {QUICK_SCAN_STEPS}</span>}
              right={<span>{Math.round((quickStep / QUICK_SCAN_STEPS) * 100)}% complete</span>}
              percent={(quickStep / QUICK_SCAN_STEPS) * 100}
            />
            <p className="text-sm font-semibold text-brand-sage">Quick scan · 3 questions</p>
            <h2 className="font-display mt-2 text-2xl font-bold text-brand-forest">
              {quickStep === 0 && 'What best describes your situation?'}
              {quickStep === 1 && 'Approximate household income?'}
              {quickStep === 2 && 'Target home price?'}
            </h2>
            {quickStep === 0 && (
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {(
                  [
                    { icp: 'first-time' as IcpType, icon: '🏠', label: 'First-Time Buyer', sub: "I've never owned a home before" },
                    { icp: 'first-gen' as IcpType, icon: '🌱', label: 'First in My Family', sub: 'No one in my family has done this before' },
                    { icp: 'solo' as IcpType, icon: '👩', label: 'Buying Solo', sub: "I'm purchasing on my own" },
                    { icp: 'move-up' as IcpType, icon: '🔄', label: 'I Own & Want to Upgrade', sub: 'I want to sell and buy simultaneously' },
                  ] as const
                ).map((row) => (
                  <button
                    key={row.icp}
                    type="button"
                    onClick={() => {
                      setQuickIcp(row.icp)
                      if (row.icp === 'first-gen') {
                        enablePlainEnglishForFirstGenBuyer()
                      }
                    }}
                    className={`rounded-xl border-2 p-4 text-left transition ${
                      quickIcp === row.icp
                        ? 'border-brand-forest bg-brand-mist'
                        : 'border-slate-200 hover:border-brand-sage/50'
                    }`}
                  >
                    <span className="text-2xl">{row.icon}</span>
                    <p className="mt-2 font-bold text-brand-forest">{row.label}</p>
                    <p className="text-sm text-slate-600">{row.sub}</p>
                  </button>
                ))}
              </div>
            )}
            {quickStep === 1 && (
              <div className="mt-6">
                <p className="text-center text-2xl font-bold text-brand-forest sm:text-3xl">
                  {quickIncome >= 30_000 ? formatCurrency(quickIncome) : '—'}
                </p>
                <label htmlFor="quick-household-income" className="sr-only">
                  Approximate annual household income
                </label>
                <div className="relative mt-4">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                    $
                  </span>
                  <input
                    id="quick-household-income"
                    type="number"
                    inputMode="numeric"
                    autoComplete="off"
                    min={30_000}
                    max={1_500_000}
                    step={1000}
                    value={quickIncome}
                    onChange={(e) => {
                      const v = e.target.valueAsNumber
                      if (e.target.value === '' || Number.isNaN(v)) {
                        setQuickIncome(0)
                        return
                      }
                      setQuickIncome(Math.min(1_500_000, Math.max(0, v)))
                    }}
                    placeholder="75000"
                    className="w-full rounded-lg border border-slate-300 bg-white py-4 pl-8 pr-4 text-lg text-slate-800 [appearance:textfield] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--coral))] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                </div>
                <p className="mt-2 text-center text-sm text-slate-500">
                  Gross annual income for your household · {formatCurrency(30_000)} – {formatCurrency(1_500_000)}
                </p>
              </div>
            )}
            {quickStep === 2 && (
              <div className="mt-6">
                <p className="text-center text-3xl font-bold text-brand-forest">{formatCurrency(quickPrice)}</p>
                <input
                  type="range"
                  min={100000}
                  max={1500000}
                  step={5000}
                  value={quickPrice}
                  onChange={(e) => setQuickPrice(Number(e.target.value))}
                  className="mt-4 w-full accent-brand-forest"
                />
              </div>
            )}
            <div className="mt-8 flex justify-between">
              <button
                type="button"
                disabled={quickStep === 0}
                onClick={() => setQuickStep((s) => Math.max(0, s - 1))}
                className="rounded-lg border border-slate-300 px-4 py-2 font-semibold disabled:opacity-40"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (quickStep === 1) {
                    setQuickIncome((v) =>
                      Math.min(1_500_000, Math.max(30_000, v > 0 ? v : 30_000))
                    )
                  }
                  if (quickStep < 2) setQuickStep((s) => s + 1)
                  else setQuizMode('quick-teaser')
                }}
                className="rounded-lg bg-brand-forest px-6 py-2 font-semibold text-white hover:bg-brand-sage"
              >
                {quickStep < 2 ? 'Next' : 'See estimate'}
              </button>
            </div>
            <button
              type="button"
              onClick={skipToFullAssessment}
              className="mt-4 w-full text-center text-sm font-semibold text-brand-sage underline"
            >
              Skip quick scan — full assessment
            </button>
          </div>
        </div>
      )}

      {quizMode === 'quick-teaser' && (
        <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-brand-gold bg-brand-gold/10 p-8 text-center shadow-sm">
            <QuizCardProgressBar
              left={<span className="font-semibold text-teal-600">Complete ✓</span>}
              right={<span>100% complete</span>}
              percent={100}
            />
            <PlainEnglishText
              className="text-lg text-brand-forest"
              text="Based on your answers, you may qualify for up to"
              as="p"
            />
            <p className="mt-3 text-4xl font-black text-brand-gold">{formatCurrency(teaserAssist)}</p>
            <PlainEnglishText
              className="mt-2 text-slate-600"
              text="in assistance programs. Complete the full assessment for your personalized plan."
              as="p"
            />
            <button
              type="button"
              onClick={startFullQuizFromQuick}
              className="mt-8 w-full rounded-xl bg-brand-terracotta py-4 text-lg font-bold text-white hover:opacity-90 sm:w-auto sm:px-10"
            >
              Get My Full Plan
            </button>
          </div>
        </div>
      )}

      {quizMode === 'full' && (
      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Top Navigation Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 sticky top-4 z-40 bg-white/95 backdrop-blur-sm border border-slate-200 shadow-sm py-3 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 rounded-xl">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold bg-[rgb(var(--navy))] text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--coral))] transition-all"
            >
              <ArrowLeft size={18} />
              <span>Return to Home</span>
            </Link>
            {!showCompletionResults ? <BackToMyJourneyLink className="font-semibold" /> : null}
          </div>
          <p className="text-sm font-semibold text-slate-600">
            {showCompletionResults
              ? 'Your results'
              : `Question ${currentQuestion + 1} of ${filteredQuestions.length}`}
          </p>
        </div>

        {showCompletionResults ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative space-y-8 overflow-hidden rounded-2xl border border-[#e7e5e4] bg-[#fafaf9] p-6 shadow-sm sm:p-8"
        >
          <div className="relative z-10">
            <QuizCardProgressBar
              left={<span className="font-semibold text-teal-600">Complete ✓</span>}
              right={<span>100% complete</span>}
              percent={100}
            />
          </div>
          {celebrateResults ? (
            <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
              {Array.from({ length: 18 }).map((_, i) => (
                <motion.span
                  key={i}
                  className="absolute h-2 w-2 rounded-sm bg-[#0d9488]/80"
                  initial={{
                    opacity: 0,
                    top: '42%',
                    left: '50%',
                    scale: 0,
                    rotate: 0,
                  }}
                  animate={{
                    opacity: [0, 1, 1, 0],
                    top: `${28 + (i % 6) * 9}%`,
                    left: `${20 + (i % 5) * 14}%`,
                    scale: [0, 1, 1, 0.6],
                    rotate: i * 40,
                  }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: i * 0.02 }}
                />
              ))}
            </div>
          ) : null}
          <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <BackToMyJourneyLink />
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#57534e] hover:text-[#1c1917]"
            >
              <ArrowLeft size={18} />
              Home
            </Link>
          </div>

          <div className="relative z-10 text-center">
            <p className="font-display text-xl font-semibold leading-snug text-[#1c1917] sm:text-2xl">
              {resultHeadline}
            </p>
            <p className="mt-6 text-6xl font-bold tabular-nums text-millennial-cta-primary font-display">
              {formatCurrency(animatedSavings)}
            </p>
            <p className="mt-3 text-base font-medium text-[#57534e]">
              in potential savings identified for your profile
            </p>
          </div>

          <div className="relative z-10 grid gap-4 md:grid-cols-3">
            {(
              [
                {
                  title: 'DPA Programs',
                  line: `Up to ${formatCurrency(sourceSplitDpa)} in grants & assistance`,
                  Icon: Landmark,
                },
                {
                  title: 'Negotiation & Fees',
                  line: `Up to ${formatCurrency(sourceSplitNegotiation)} in fee reductions`,
                  Icon: Percent,
                },
                {
                  title: 'Process Optimization',
                  line: `Up to ${formatCurrency(sourceSplitProcess)} in process savings`,
                  Icon: Waypoints,
                },
              ] as const
            ).map((card, cardIndex) => {
              const CardIcon = card.Icon
              return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: cardIndex * 0.15, ease: 'easeOut' }}
                className="flex h-full flex-col rounded-xl border-2 border-millennial-cta-primary bg-white p-5 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <span
                    className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-millennial-primary-light text-millennial-cta-primary"
                    aria-hidden
                  >
                    <CardIcon className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="font-display font-semibold text-[#1c1917]">{card.title}</p>
                    <p className="mt-2 text-sm font-medium leading-relaxed text-[#57534e]">{card.line}</p>
                    <p className="mt-4 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-millennial-cta-primary">
                      <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
                      Included in your plan
                    </p>
                  </div>
                </div>
              </motion.div>
              )
            })}
          </div>

          <div className="relative z-10 mx-auto mt-4 max-w-lg">
            <p className="mb-2 text-center text-sm text-[#57534e]">
              Know someone who&apos;s also buying? Share NestQuest and you both save $50.
            </p>
            <ResultsReferralCard referralSlug={resultReferralSlug} />
          </div>

          <p className="relative z-10 text-center text-xs leading-relaxed text-[#78716c]">
            Illustrative breakdown of your total estimate for this prototype. Eligibility, benefits, and savings vary by
            location and lender—confirm with housing agencies and licensed professionals before you rely on them.
          </p>

          {!resultPlanRevealed ? (
            <div className="relative z-10 mt-6 rounded-xl border border-teal-200 bg-white p-6">
              <h3 className="mb-1 text-lg font-bold text-gray-900">Your savings estimate is ready.</h3>
              <p className="mb-4 text-sm text-gray-600">
                Enter your email to save your results and get your personalized action plan — free.
              </p>
              <form onSubmit={handlePlanEmailSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                <label htmlFor="quiz-result-email" className="sr-only">
                  Email
                </label>
                <input
                  id="quiz-result-email"
                  type="email"
                  autoComplete="email"
                  value={resultEmail}
                  onChange={(e) => setResultEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
                >
                  Get My Plan →
                </button>
              </form>
              <p className="mt-2 text-xs text-gray-400">No credit card. No spam. Unsubscribe anytime.</p>
              <button
                type="button"
                onClick={() => {
                  setResultEmailSaved(false)
                  setResultPlanRevealed(true)
                }}
                className="mt-2 block text-xs text-gray-400 underline hover:text-gray-600"
              >
                Skip for now →
              </button>
            </div>
          ) : (
            <div className="relative z-10 space-y-4 text-center">
              {resultEmailSaved ? (
                <p className="text-base font-semibold text-gray-900" role="status">
                  ✓ Saved! Your plan is ready.
                </p>
              ) : null}
              <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-5 text-left">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-600">
                  Free for 7 days
                </p>
                <h3 className="mb-1 text-lg font-bold text-slate-900">Try Momentum — no credit card required</h3>
                <p className="mb-4 text-sm text-slate-600">
                  Get your personalized roadmap, lender matches, and full DPA report. Cancel anytime. We&apos;ll remind
                  you before the trial ends.
                </p>
                <button
                  type="button"
                  onClick={handleStartTrialFromQuiz}
                  className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white"
                >
                  Start my free 7-day trial →
                </button>
                <p className="mt-2 text-center text-xs text-slate-400">
                  No credit card required · Cancel anytime
                </p>
              </div>
              <p className="text-sm text-[#57534e]">
                Join 6,303 buyers who&apos;ve already found their savings
              </p>
            </div>
          )}

          <div className="relative z-10 text-center">
            <Link
              href={`/results?transactionType=${encodeURIComponent(transactionType || 'first-time')}`}
              className="text-sm font-semibold text-teal-700 underline underline-offset-2 hover:text-teal-900"
            >
              View detailed breakdown on full results page →
            </Link>
          </div>
        </motion.div>
        ) : (
        <>
        {/* Question Card */}
        {currentQ && (
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8"
        >
          <QuizCardProgressBar
            left={<span>Step {currentQuestion + 1} of {filteredQuestions.length}</span>}
            right={<span>{Math.round(progress)}% complete</span>}
            percent={progress}
          />
          {quizStageLine ? (
            <p className="mb-6 text-sm text-brand-sage">{quizStageLine}</p>
          ) : null}
          {isStartOfFinancialAssessment ? (
            <div
              className="mb-6 rounded-xl border border-teal-200 bg-gradient-to-r from-millennial-primary-light/50 to-teal-50/80 px-4 py-3 text-sm text-slate-800 shadow-sm sm:text-base"
              role="status"
              aria-live="polite"
            >
              <PlainEnglishText className="font-bold text-[rgb(var(--navy))]" text="Financial assessment" as="p" />
              <PlainEnglishText
                className="mt-1 leading-snug text-slate-700"
                text="You're now on the questions we use to estimate affordability, debt-to-income, and your personalized numbers. Your answers stay private and power your results — rough estimates are fine."
                as="p"
              />
            </div>
          ) : null}
          {/* Question Header */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <PlainEnglishText
                className="font-display text-2xl font-bold text-[rgb(var(--navy))]"
                text={currentQ.title}
                as="h2"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setShowTooltip(!showTooltip)
                }}
                className="text-[rgb(var(--coral))] hover:opacity-80 transition-colors focus:outline-none focus:ring-2 focus:ring-[rgb(var(--coral))] rounded p-1 cursor-pointer"
                aria-label="Why we ask this"
                aria-expanded={showTooltip}
              >
                <Info size={20} />
              </button>
            </div>

            {/* Tooltip */}
            <AnimatePresence>
              {showTooltip && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-[#06b6d4]/20 border border-[#06b6d4]/60 rounded-lg p-4 text-sm text-slate-800 mb-4"
                >
                  💡 <PlainEnglishText text={currentQ.tooltip} as="span" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Helper text */}
            {currentQ.helper && (
              <PlainEnglishText className="text-sm text-slate-500" text={currentQ.helper} as="p" />
            )}
          </div>

          {/* Input Field */}
          <div className="mb-6">
            {currentQ.type === 'transaction-type' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    const type: TransactionType = 'first-time'
                    setTransactionType(type)
                    setValue('transactionType', type)
                    setValue('icpType', 'first-time')
                    setIcpType('first-time')
                  }}
                  className={`p-6 rounded-lg border-2 transition-all text-left ${
                    transactionType === 'first-time'
                      ? 'border-[#06b6d4] bg-[#06b6d4]/10 text-slate-900'
                      : 'border-slate-300 bg-slate-50 hover:border-slate-400'
                  }`}
                >
                  <Home className="w-8 h-8 text-[#06b6d4] mb-3" />
                  <h3 className="text-xl font-bold mb-2">First-Time Homebuyer</h3>
                  <p className="text-sm text-slate-500 mb-1">This is your first home purchase</p>
                  <p className="text-xs text-gray-500">Never owned a home before</p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const type: TransactionType = 'repeat-buyer'
                    setTransactionType(type)
                    setValue('transactionType', type)
                    setValue('icpType', 'repeat-buyer')
                    setIcpType('repeat-buyer')
                  }}
                  className={`p-6 rounded-lg border-2 transition-all text-left ${
                    transactionType === 'repeat-buyer'
                      ? 'border-[#06b6d4] bg-[#06b6d4]/10 text-slate-900'
                      : 'border-slate-300 bg-slate-50 hover:border-slate-400'
                  }`}
                >
                  <TrendingUp className="w-8 h-8 text-[#06b6d4] mb-3" />
                  <h3 className="text-xl font-bold mb-2">I&apos;ve Bought Before</h3>
                  <p className="text-sm text-slate-500 mb-1">Own a home now or sold recently — next purchase or upgrade</p>
                  <p className="text-xs text-gray-500">We&apos;ll route you to equity tools; say if you&apos;re buying &amp; selling at once</p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const type: TransactionType = 'refinance'
                    setTransactionType(type)
                    setValue('transactionType', type)
                    setValue('icpType', 'refinance')
                    setIcpType('refinance')
                  }}
                  className={`p-6 rounded-lg border-2 transition-all text-left ${
                    transactionType === 'refinance'
                      ? 'border-[#06b6d4] bg-[#06b6d4]/10 text-slate-900'
                      : 'border-slate-300 bg-slate-50 hover:border-slate-400'
                  }`}
                >
                  <RefreshCw className="w-8 h-8 text-[#06b6d4] mb-3" />
                  <h3 className="text-xl font-bold mb-2">I Own &amp; Want to Refinance</h3>
                  <p className="text-sm text-slate-500 mb-1">Lower my rate, reduce my payment, or access equity</p>
                  <p className="text-xs text-gray-500">Quick scan, then open the refinance optimizer</p>
                </button>
              </div>
            )}

            {currentQ.type === 'slider' && currentQ.min !== undefined && currentQ.max !== undefined && (
              <div>
                <div className="text-4xl font-bold text-[#06b6d4] mb-4 text-center">
                  {formatCurrency(Number(currentValue) || currentQ.min)}
                </div>
                <input
                  type="range"
                  min={currentQ.min}
                  max={currentQ.max}
                  step={currentQ.step || 1}
                  value={currentValue || currentQ.min}
                  onChange={(e) => setValue(currentQ.id, Number(e.target.value))}
                  className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#06b6d4]"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>{formatCurrency(currentQ.min)}</span>
                  <span>{formatCurrency(currentQ.max)}</span>
                </div>
              </div>
            )}

            {currentQ.type === 'currency' && (
              <div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    {...register(currentQ.id, {
                      setValueAs: (v) => parseFormattedNumber(String(v)),
                    })}
                    placeholder={currentQ.placeholder}
                    min={currentQ.min}
                    max={currentQ.max}
                    onInput={(e) => {
                      const input = e.currentTarget
                      if (input.value.trim() === '') return
                      input.value = formatNumberForInput(parseFormattedNumber(input.value), 0)
                    }}
                    className="w-full pl-8 pr-4 py-4 bg-white border border-slate-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--coral))] text-slate-800"
                  />
                </div>
                {errors[currentQ.id] && (
                  <p className="text-red-500 text-sm mt-2">{String(errors[currentQ.id]?.message || '')}</p>
                )}
              </div>
            )}

            {currentQ.type === 'percentage' && (
              <div>
                <div className="relative">
                  <input
                    type="number"
                    {...register(currentQ.id, { valueAsNumber: true })}
                    placeholder={currentQ.placeholder}
                    min={currentQ.min}
                    max={currentQ.max}
                    step={currentQ.step || 0.1}
                    className="w-full px-4 py-4 bg-white border border-slate-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--coral))] text-slate-800"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">%</span>
                </div>
                {errors[currentQ.id] && (
                  <p className="text-red-500 text-sm mt-2">{String(errors[currentQ.id]?.message || '')}</p>
                )}
              </div>
            )}

            {currentQ.type === 'rate' && (
              <div>
                <div className="relative">
                  <input
                    type="number"
                    {...register(currentQ.id, { valueAsNumber: true })}
                    placeholder={currentQ.placeholder}
                    min={currentQ.min}
                    max={currentQ.max}
                    step={0.1}
                    onChange={(e) => {
                      const value = e.target.value
                      // Round to one decimal place and update form value
                      const numValue = parseFloat(value)
                      if (!isNaN(numValue) && value !== '') {
                        const rounded = Math.round(numValue * 10) / 10
                        setValue(currentQ.id, rounded, { shouldValidate: true })
                      } else if (value === '') {
                        setValue(currentQ.id, undefined, { shouldValidate: true })
                      }
                    }}
                    className="w-full px-4 py-4 pr-12 bg-white border border-slate-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--coral))] text-slate-800"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">%</span>
                </div>
                {errors[currentQ.id] && (
                  <p className="text-red-500 text-sm mt-2">{String(errors[currentQ.id]?.message || '')}</p>
                )}
              </div>
            )}

            {currentQ.type === 'number' && (
              <div>
                <input
                  type="text"
                  inputMode="numeric"
                  {...register(currentQ.id, {
                    setValueAs: (v) => parseFormattedNumber(String(v)),
                  })}
                  placeholder={currentQ.placeholder}
                  min={currentQ.min}
                  max={currentQ.max}
                  step={currentQ.step || 1}
                  onInput={(e) => {
                    const input = e.currentTarget
                    if (input.value.trim() === '') return
                    input.value = formatNumberForInput(parseFormattedNumber(input.value), 0)
                  }}
                  className="w-full px-4 py-4 bg-white border border-slate-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--coral))] text-slate-800"
                />
                {errors[currentQ.id] && (
                  <p className="text-red-500 text-sm mt-2">{String(errors[currentQ.id]?.message || '')}</p>
                )}
              </div>
            )}

            {currentQ.type === 'location' && (
              <div>
                {/* Location Type Toggle */}
                <div className="flex gap-4 mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      setLocationType('metro')
                      setCitySearch('')
                      setZipCode('')
                      setValue('city', '')
                    }}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                      locationType === 'metro'
                        ? 'border-[#06b6d4] bg-[#06b6d4]/10 text-slate-900'
                        : 'border-slate-300 bg-slate-50 text-slate-500 hover:border-slate-400'
                    }`}
                  >
                    Metro Area
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLocationType('zip')
                      setCitySearch('')
                      setZipCode('')
                      setValue('city', '')
                    }}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                      locationType === 'zip'
                        ? 'border-[#06b6d4] bg-[#06b6d4]/10 text-slate-900'
                        : 'border-slate-300 bg-slate-50 text-slate-500 hover:border-slate-400'
                    }`}
                  >
                    Zip Code
                  </button>
                </div>

                {/* Metro Area Input */}
                {locationType === 'metro' && (
                  <div className="relative" ref={cityDropdownRef}>
                    <input
                      type="text"
                      value={citySearch}
                      onChange={(e) => {
                        setCitySearch(e.target.value)
                        setShowCityDropdown(true)
                        setZillowPrice(null) // Reset when changing city search
                      }}
                      onFocus={() => setShowCityDropdown(true)}
                      placeholder="Search for your metro area..."
                      className="w-full px-4 py-4 bg-white border border-slate-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--coral))] text-slate-800"
                    />
                    {citySearch && watchedValues.city && citySearch === watchedValues.city && (
                      <div className="mt-2 space-y-1">
                        {loadingZillow && (
                          <p className="text-sm text-slate-500 flex items-center gap-2">
                            <Loader2 size={14} className="animate-spin" />
                            Fetching latest home prices...
                          </p>
                        )}
                        {!loadingZillow && zillowPrice && (
                          <p className="text-sm text-green-400">
                            Average home price: {formatCurrency(zillowPrice)} (latest data)
                          </p>
                        )}
                      </div>
                    )}
                    {showCityDropdown && filteredCities.length > 0 && citySearch && (
                      <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-lg max-h-60 overflow-y-auto shadow-lg">
                        {filteredCities.map((city) => (
                          <button
                            key={city}
                            type="button"
                            onClick={async () => {
                              setValue('city', city)
                              setCitySearch(city)
                              setShowCityDropdown(false)
                              
                              // Fetch Zillow data for accurate pricing
                              setLoadingZillow(true)
                              try {
                                const zillowData = await getCityDataWithZillow(city)
                                if (zillowData?.medianPrice) {
                                  setZillowPrice(zillowData.medianPrice)
                                } else {
                                  setZillowPrice(null)
                                }
                              } catch (error) {
                                console.error('Error fetching Zillow data:', error)
                                setZillowPrice(null)
                              } finally {
                                setLoadingZillow(false)
                              }
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-[#06b6d4]"
                          >
                            {city}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Zip Code Input */}
                {locationType === 'zip' && (
                  <div>
                    <input
                      type="text"
                      value={zipCode}
                      onChange={async (e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 5)
                        setZipCode(value)
                        if (value.length === 5) {
                          // Try legacy data first for quick city/state detection
                          const zipData = getZipCodeData(value)
                          if (zipData) {
                            setValue('city', zipData.city)
                          } else {
                            setValue('city', value) // Use zip code as fallback
                          }
                          
                          // Fetch Zillow data for accurate pricing
                          setLoadingZillow(true)
                          try {
                            const zillowData = await getZipCodeDataWithZillow(value)
                            if (zillowData?.averageHomePrice) {
                              setZillowPrice(zillowData.averageHomePrice)
                            } else {
                              setZillowPrice(null)
                            }
                          } catch (error) {
                            console.error('Error fetching Zillow data:', error)
                            setZillowPrice(null)
                          } finally {
                            setLoadingZillow(false)
                          }
                        } else {
                          setZillowPrice(null)
                        }
                      }}
                      placeholder="Enter 5-digit zip code"
                      pattern="[0-9]{5}"
                      maxLength={5}
                      className="w-full px-4 py-4 bg-white border border-slate-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--coral))] text-slate-800"
                    />
                    {zipCode.length === 5 && (
                      <div className="mt-2 space-y-1">
                        {getZipCodeData(zipCode) && (
                          <p className="text-sm text-[#06b6d4]">
                            Detected: {getZipCodeData(zipCode)?.city}, {getZipCodeData(zipCode)?.state}
                          </p>
                        )}
                        {loadingZillow && (
                          <p className="text-sm text-slate-500 flex items-center gap-2">
                            <Loader2 size={14} className="animate-spin" />
                            Fetching latest home prices...
                          </p>
                        )}
                        {!loadingZillow && zillowPrice && (
                          <p className="text-sm text-green-400">
                            Average home price: {formatCurrency(zillowPrice)} (latest data)
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {errors.city && (
                  <p className="text-red-500 text-sm mt-2">{String(errors.city.message || '')}</p>
                )}
              </div>
            )}

            {(currentQ.type === 'radio' || currentQ.type === 'knowledge-check') && (
              <div className="space-y-3">
                {currentQ.options?.map((option: { value: string; label: string }) => (
                  <label
                    key={option.value}
                    className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      currentValue === option.value
                        ? 'border-[#06b6d4] bg-[#06b6d4]/10 text-slate-900'
                        : 'border-slate-300 bg-slate-50 hover:border-slate-400'
                    }`}
                  >
                    <input
                      type="radio"
                      {...register(currentQ.id)}
                      value={option.value}
                      className="sr-only"
                      onChange={(e) => {
                        setValue(currentQ.id, e.target.value as any)
                      }}
                    />
                    <span className="text-lg">{option.label}</span>
                  </label>
                ))}
                {errors[currentQ.id] && (
                  <p className="text-red-500 text-sm mt-2">
                    {String(errors[currentQ.id]?.message || '')}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Micro Insight */}
          <AnimatePresence>
            {showInsight && insightText && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-[#06b6d4]/20 border border-[#06b6d4]/60 rounded-lg p-4 mb-6 text-sm text-slate-800"
              >
                {insightText}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={handleBack}
              disabled={currentQuestion === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold ${
                currentQuestion === 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-[rgb(var(--navy))] text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--coral))]'
              }`}
            >
              <ArrowLeft size={20} />
              Back
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={!hasAnswer}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                hasAnswer
                  ? currentQuestion === filteredQuestions.length - 1
                    ? 'bg-[#f97316] text-white hover:bg-[#ea580c] focus:outline-none focus:ring-2 focus:ring-[#f97316] animate-pulse'
                    : 'bg-[#f97316] text-white hover:bg-[#ea580c] focus:outline-none focus:ring-2 focus:ring-[#f97316]'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {currentQuestion === filteredQuestions.length - 1 ? 'Show Me The Truth' : 'Next'}
              {currentQuestion < filteredQuestions.length - 1 && <ArrowRight size={20} />}
            </button>
          </div>
        </motion.div>
        )}
        </>
        )}
      </div>
      )}
      </>
      )}

      {/* Loading Screen */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-[#06b6d4] animate-spin mx-auto mb-6" />
              <h3 className="text-2xl font-bold mb-8">Analyzing Your Numbers...</h3>
              <div className="space-y-4 text-slate-500">
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0 }}
                >
                  Checking market data for {watchedValues.city || 'your area'}...
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  Calculating true affordability...
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.6 }}
                >
                  Identifying savings opportunities...
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.4 }}
                >
                  Comparing typical lender costs...
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 3.2 }}
                >
                  Generating your cost breakdown...
                </motion.p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

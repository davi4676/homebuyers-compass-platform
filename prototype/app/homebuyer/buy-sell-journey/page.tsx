'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Home,
  MapPin,
  DollarSign,
  TrendingUp,
  BarChart3,
  Scale,
  FileCheck,
  ChevronRight,
  Share2,
  Mail,
  HelpCircle,
  Wallet,
  Gauge,
  Zap,
  Sparkles,
  Target,
  LayoutList,
  KeyRound,
  ClipboardCheck,
  Crosshair,
  PiggyBank,
  ListChecks,
} from 'lucide-react'
import { formatCurrency } from '@/lib/calculations'
import {
  netProceedsFromSale,
  getBuySellWaterfall,
  buildPurchaseScenarios,
  type BuySellCurrentHome,
  type BuySellNewHome,
  type BridgeScenario,
} from '@/lib/journey-calculations'
import { formatNumberForInput, parseFormattedNumber } from '@/lib/number-format'
import {
  JourneyProgressBar,
  SavingsCard,
  TimelineVisualization,
  Tooltip,
} from '@/components/journeys'
import { getCachedFreddieMacRates } from '@/lib/freddie-mac-rates'
import BackToMyJourneyLink from '@/components/BackToMyJourneyLink'
import ReferralProgramModal from '@/components/referral/ReferralProgramModal'
import { REFERRAL_PROMPT_LS } from '@/lib/referral-program'
import { getOrCreateReferralCode } from '@/lib/referral-program'
import { queueMoveUpWizardJourneySync, buySellWizardStepToPhaseOrder, BUY_SELL_JOURNEY_STORAGE_KEY } from '@/lib/move-up-journey-sync'
import { loadMoveUpRateAlert, saveMoveUpRateAlert } from '@/lib/move-up-rate-alert'
import { useRouter } from 'next/navigation'

const BUY_SELL_STORAGE_KEY = BUY_SELL_JOURNEY_STORAGE_KEY
const BUY_SELL_STEPS: { id: string; label: string; shortLabel: string }[] = [
  { id: 'current', label: 'Current Home Profile', shortLabel: 'Current' },
  { id: 'vision', label: 'New Home Vision', shortLabel: 'Vision' },
  { id: 'bridge', label: 'Bridge Financing', shortLabel: 'Bridge' },
  { id: 'waterfall', label: 'Financial Waterfall', shortLabel: 'Waterfall' },
  { id: 'scenarios', label: 'Comparative Scenarios', shortLabel: 'Scenarios' },
  { id: 'savings', label: 'Savings & Opportunity', shortLabel: 'Savings' },
  { id: 'action', label: 'Action Plan', shortLabel: 'Action' },
]

const CREDIT_OPTIONS: { value: BuySellNewHome['creditScore']; label: string }[] = [
  { value: '750+', label: '750+' },
  { value: '700-750', label: '700–750' },
  { value: '650-700', label: '650–700' },
  { value: '600-650', label: '600–650' },
  { value: 'under-600', label: 'Under 600' },
]

const TIMELINE_OPTIONS: { value: BuySellCurrentHome['timelineToSell']; label: string }[] = [
  { value: '1-3', label: '1–3 months' },
  { value: '3-6', label: '3–6 months' },
  { value: '6-12', label: '6–12 months' },
  { value: '12+', label: '12+ months' },
]

const BRIDGE_OPTIONS: {
  id: BridgeScenario;
  label: string;
  pros: string[];
  cons: string[];
  costNote: string;
  risk: 'low' | 'medium' | 'high';
}[] = [
  {
    id: 'buy-first',
    label: 'Buy first (need bridge loan)',
    pros: ['Move once', 'No rush to sell'],
    cons: ['Carry two mortgages', 'Bridge loan costs'],
    costNote: 'Bridge loan interest and fees',
    risk: 'high',
  },
  {
    id: 'sell-first',
    label: 'Sell first (need temporary housing)',
    pros: ['Cash in hand', 'No bridge loan'],
    cons: ['May need short-term rental', 'Two moves'],
    costNote: 'Rent + storage during gap',
    risk: 'medium',
  },
  {
    id: 'contingent',
    label: 'Contingent offer (sell & buy simultaneously)',
    pros: ['One move', 'No bridge or rent'],
    cons: ['Harder in hot markets', 'Timing risk'],
    costNote: 'Minimal if both close same day',
    risk: 'low',
  },
]

const defaultCurrentHome: BuySellCurrentHome = {
  homeValue: 450000,
  mortgageBalance: 280000,
  sellingCostsPercent: 6,
  sellingCostsFixed: 0,
  timelineToSell: '6-12',
}

const defaultNewHome: BuySellNewHome = {
  targetPriceMin: 400000,
  targetPriceMax: 600000,
  location: '',
  downPaymentSource: 'both',
  additionalSavings: 50000,
  creditScore: '700-750',
}
const QUIZ_STORAGE_KEY = 'quizData'
const defaultMonthlyExpenses = 4000
const defaultCurrentHousingCost = 2800

const NEXT_ACTION_BY_STEP: Record<string, string> = {
  current: 'Confirm current home value and mortgage balance so net proceeds are accurate.',
  vision: 'Set realistic target price and down payment source before shopping listings.',
  bridge: 'Pick your bridge strategy and align your risk tolerance with timing.',
  waterfall: 'Review each cash-flow line item and flag any assumptions to revisit.',
  scenarios: 'Choose a recommended scenario and note your monthly payment comfort zone.',
  savings: 'Capture your top savings opportunities before talking to lenders or agents.',
  action: 'Execute your checklist in order: pre-approval, listing prep, and timeline sync.',
}

const NEXT_ACTION_ICON_BY_STEP = {
  current: ClipboardCheck,
  vision: Crosshair,
  bridge: Scale,
  waterfall: BarChart3,
  scenarios: LayoutList,
  savings: PiggyBank,
  action: ListChecks,
} as const

function normalizeValue(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return 0
  if (max <= min) return 0.5
  return (value - min) / (max - min)
}

function tierLabelFromRank(rank: number, total: number): 'Good' | 'Better' | 'Best' {
  if (total <= 1) return 'Best'
  if (total === 2) return rank === 0 ? 'Best' : 'Good'
  const percentile = rank / (total - 1)
  if (percentile <= 0.33) return 'Best'
  if (percentile <= 0.66) return 'Better'
  return 'Good'
}

function toBuySellCreditScore(value: unknown): BuySellNewHome['creditScore'] {
  const allowed: BuySellNewHome['creditScore'][] = ['750+', '700-750', '650-700', '600-650', 'under-600']
  return allowed.includes(value as BuySellNewHome['creditScore'])
    ? (value as BuySellNewHome['creditScore'])
    : defaultNewHome.creditScore
}

function toTimelineToSell(value: unknown): BuySellCurrentHome['timelineToSell'] {
  if (value === '1-3' || value === '3-6' || value === '6-12' || value === '12+') {
    return value
  }
  switch (value) {
    case '3-months':
      return '1-3'
    case '6-months':
      return '3-6'
    case '1-year':
      return '6-12'
    case 'exploring':
      return '12+'
    default:
      return defaultCurrentHome.timelineToSell
  }
}

function mapQuizDataToBuySellState(quizData: unknown): {
  currentHome: BuySellCurrentHome
  newHome: BuySellNewHome
  monthlyExpenses: number
  currentHousingCost: number
} | null {
  if (!quizData || typeof quizData !== 'object') return null
  const data = quizData as Record<string, unknown>
  if (data.transactionType !== 'repeat-buyer') return null

  const expectedSalePrice = Number(data.expectedSalePrice)
  const currentHomeValue = Number(data.currentHomeValue)
  const baseHomeValue =
    expectedSalePrice > 0 ? expectedSalePrice : currentHomeValue > 0 ? currentHomeValue : defaultCurrentHome.homeValue

  const additionalSavings = Number(data.additionalSavings)
  const currentMonthlyPayment = Number(data.currentMonthlyPayment)
  const monthlyDebt = Number(data.monthlyDebt)
  const monthlyExpenses = monthlyDebt > 0 ? Math.max(defaultMonthlyExpenses, monthlyDebt + 2500) : defaultMonthlyExpenses
  const currentHousingCost = currentMonthlyPayment > 0 ? currentMonthlyPayment : defaultCurrentHousingCost

  const currentHome: BuySellCurrentHome = {
    homeValue: baseHomeValue,
    mortgageBalance:
      Number(data.currentMortgageBalance) > 0
        ? Number(data.currentMortgageBalance)
        : defaultCurrentHome.mortgageBalance,
    sellingCostsPercent:
      Number(data.agentCommission) >= 0 ? Number(data.agentCommission) : defaultCurrentHome.sellingCostsPercent,
    sellingCostsFixed:
      Number(data.repairsAndConcessions) > 0
        ? Number(data.repairsAndConcessions)
        : defaultCurrentHome.sellingCostsFixed,
    timelineToSell: toTimelineToSell(data.timeline),
  }

  const newHome: BuySellNewHome = {
    targetPriceMin: Math.max(100000, Math.round(baseHomeValue * 0.9)),
    targetPriceMax: Math.max(120000, Math.round(baseHomeValue * 1.15)),
    location: typeof data.city === 'string' ? data.city : '',
    downPaymentSource: additionalSavings > 0 ? 'both' : 'proceeds',
    additionalSavings: additionalSavings > 0 ? additionalSavings : 0,
    creditScore: toBuySellCreditScore(data.creditScore),
  }

  return {
    currentHome,
    newHome,
    monthlyExpenses,
    currentHousingCost,
  }
}

function isBuySellJourneyStateUnstarted(
  currentHome: BuySellCurrentHome,
  newHome: BuySellNewHome,
  monthlyExpenses: number,
  currentHousingCost: number
): boolean {
  const currentHomeDefault =
    currentHome.homeValue === defaultCurrentHome.homeValue &&
    currentHome.mortgageBalance === defaultCurrentHome.mortgageBalance &&
    currentHome.sellingCostsPercent === defaultCurrentHome.sellingCostsPercent &&
    currentHome.sellingCostsFixed === defaultCurrentHome.sellingCostsFixed &&
    currentHome.timelineToSell === defaultCurrentHome.timelineToSell
  const newHomeDefault =
    newHome.targetPriceMin === defaultNewHome.targetPriceMin &&
    newHome.targetPriceMax === defaultNewHome.targetPriceMax &&
    newHome.location === defaultNewHome.location &&
    newHome.downPaymentSource === defaultNewHome.downPaymentSource &&
    newHome.additionalSavings === defaultNewHome.additionalSavings &&
    newHome.creditScore === defaultNewHome.creditScore
  const baselineDefault =
    monthlyExpenses === defaultMonthlyExpenses && currentHousingCost === defaultCurrentHousingCost

  return currentHomeDefault && newHomeDefault && baselineDefault
}

function loadBuySellState(): {
  currentHome: BuySellCurrentHome
  newHome: BuySellNewHome
  step: number
  monthlyExpenses: number
  currentHousingCost: number
} {
  if (typeof window === 'undefined')
    return {
      currentHome: defaultCurrentHome,
      newHome: defaultNewHome,
      step: 0,
      monthlyExpenses: defaultMonthlyExpenses,
      currentHousingCost: defaultCurrentHousingCost,
    }
  try {
    const quizRaw = localStorage.getItem(QUIZ_STORAGE_KEY)
    const quizMapped = quizRaw ? mapQuizDataToBuySellState(JSON.parse(quizRaw)) : null

    const raw = localStorage.getItem(BUY_SELL_STORAGE_KEY)
    if (!raw) {
      if (quizMapped) {
        return {
          currentHome: quizMapped.currentHome,
          newHome: quizMapped.newHome,
          step: 0,
          monthlyExpenses: quizMapped.monthlyExpenses,
          currentHousingCost: quizMapped.currentHousingCost,
        }
      }
      return {
        currentHome: defaultCurrentHome,
        newHome: defaultNewHome,
        step: 0,
        monthlyExpenses: defaultMonthlyExpenses,
        currentHousingCost: defaultCurrentHousingCost,
      }
    }

    const parsed = JSON.parse(raw)
    const parsedStep = Number(parsed.step)
    const safeStep = Number.isFinite(parsedStep)
      ? Math.max(0, Math.min(BUY_SELL_STEPS.length - 1, Math.floor(parsedStep)))
      : 0
    const saved = {
      currentHome: { ...defaultCurrentHome, ...parsed.currentHome },
      newHome: { ...defaultNewHome, ...parsed.newHome },
      step: safeStep,
      monthlyExpenses:
        Number(parsed.monthlyExpenses) > 0 ? Number(parsed.monthlyExpenses) : defaultMonthlyExpenses,
      currentHousingCost:
        Number(parsed.currentHousingCost) > 0
          ? Number(parsed.currentHousingCost)
          : defaultCurrentHousingCost,
    }

    if (
      quizMapped &&
      isBuySellJourneyStateUnstarted(
        saved.currentHome,
        saved.newHome,
        saved.monthlyExpenses,
        saved.currentHousingCost
      )
    ) {
      return { ...quizMapped, step: saved.step }
    }

    return saved
  } catch {
    return {
      currentHome: defaultCurrentHome,
      newHome: defaultNewHome,
      step: 0,
      monthlyExpenses: defaultMonthlyExpenses,
      currentHousingCost: defaultCurrentHousingCost,
    }
  }
}

function saveBuySellState(
  currentHome: BuySellCurrentHome,
  newHome: BuySellNewHome,
  step: number,
  monthlyExpenses: number,
  currentHousingCost: number
) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(
      BUY_SELL_STORAGE_KEY,
      JSON.stringify({
        currentHome,
        newHome,
        step,
        monthlyExpenses,
        currentHousingCost,
        savedAt: new Date().toISOString(),
      })
    )
  } catch {}
}

export default function BuySellJourneyPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [currentHome, setCurrentHome] = useState<BuySellCurrentHome>(defaultCurrentHome)
  const [newHome, setNewHome] = useState<BuySellNewHome>(defaultNewHome)
  const [monthlyExpenses, setMonthlyExpenses] = useState(defaultMonthlyExpenses)
  const [currentHousingCost, setCurrentHousingCost] = useState(defaultCurrentHousingCost)
  const [snapshotScenarioId, setSnapshotScenarioId] = useState<string>('')
  const [pmmsRefreshVersion, setPmmsRefreshVersion] = useState(0)
  const [rateAlertEmail, setRateAlertEmail] = useState('')
  const [rateAlertBusy, setRateAlertBusy] = useState(false)
  const [rateAlertSubscribed, setRateAlertSubscribed] = useState(false)
  const [referralOpen, setReferralOpen] = useState(false)
  const [referralSlug, setReferralSlug] = useState('yourname')

  useEffect(() => {
    setRateAlertSubscribed(!!loadMoveUpRateAlert())
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    setReferralSlug(getOrCreateReferralCode(null))
  }, [])

  useEffect(() => {
    const s = loadBuySellState()
    setStep(s.step)
    setCurrentHome(s.currentHome)
    setNewHome(s.newHome)
    setMonthlyExpenses(s.monthlyExpenses)
    setCurrentHousingCost(s.currentHousingCost)
  }, [])

  useEffect(() => {
    saveBuySellState(currentHome, newHome, step, monthlyExpenses, currentHousingCost)
  }, [currentHome, newHome, step, monthlyExpenses, currentHousingCost])

  useEffect(() => {
    let active = true
    getCachedFreddieMacRates()
      .then(() => {
        if (active) setPmmsRefreshVersion((v) => v + 1)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  const netProceeds = useMemo(
    () =>
      netProceedsFromSale(
        currentHome.homeValue,
        currentHome.mortgageBalance,
        currentHome.sellingCostsPercent,
        currentHome.sellingCostsFixed
      ),
    [currentHome]
  )

  const targetPrice = useMemo(
    () => (newHome.targetPriceMin + newHome.targetPriceMax) / 2,
    [newHome.targetPriceMin, newHome.targetPriceMax]
  )

  const waterfallSteps = useMemo(
    () =>
      getBuySellWaterfall(
        currentHome,
        newHome.downPaymentSource === 'proceeds' ? 0 : newHome.additionalSavings,
        0.15
      ),
    [currentHome, newHome.downPaymentSource, newHome.additionalSavings]
  )

  const availableDown =
    newHome.downPaymentSource === 'proceeds'
      ? netProceeds
      : newHome.downPaymentSource === 'savings'
        ? newHome.additionalSavings
        : netProceeds + newHome.additionalSavings

  const purchaseScenarios = useMemo(
    () =>
      buildPurchaseScenarios(
        newHome.downPaymentSource === 'savings' ? 0 : netProceeds,
        newHome.downPaymentSource === 'proceeds' ? 0 : newHome.additionalSavings,
        targetPrice,
        newHome.creditScore,
        monthlyExpenses
      ),
    [
      netProceeds,
      newHome.downPaymentSource,
      newHome.additionalSavings,
      targetPrice,
      newHome.creditScore,
      monthlyExpenses,
      pmmsRefreshVersion,
    ]
  )

  const recommendedScenario = purchaseScenarios.find((s) => s.recommended)
  const rankedPurchaseScenarioDetails = useMemo(() => {
    if (!purchaseScenarios.length) return [] as Array<{
      scenario: (typeof purchaseScenarios)[number]
      affordabilityScore: number
      reserveSafetyScore: number
      totalBenefitScore: number
      totalScore: number
    }>

    const affordabilityValues = purchaseScenarios.map((s) => {
      const burdenRatio = s.monthlyPayment / Math.max(1, monthlyExpenses)
      return -burdenRatio
    })
    const reserveSafetyValues = purchaseScenarios.map(
      (s) => s.emergencyFundMonths * 0.7 + (s.cashReservesAfter / Math.max(1, monthlyExpenses)) * 0.3
    )
    const totalBenefitValues = purchaseScenarios.map((s) => {
      const fiveYearPaymentCost = s.monthlyPayment * 60
      const pmiCost = s.pmiMonthly * 60
      return s.purchasePrice - (fiveYearPaymentCost + pmiCost)
    })

    const minAffordability = Math.min(...affordabilityValues)
    const maxAffordability = Math.max(...affordabilityValues)
    const minReserve = Math.min(...reserveSafetyValues)
    const maxReserve = Math.max(...reserveSafetyValues)
    const minBenefit = Math.min(...totalBenefitValues)
    const maxBenefit = Math.max(...totalBenefitValues)

    const scored = purchaseScenarios.map((scenario, idx) => {
      const affordabilityScore = normalizeValue(affordabilityValues[idx], minAffordability, maxAffordability)
      const reserveSafetyScore = normalizeValue(reserveSafetyValues[idx], minReserve, maxReserve)
      const totalBenefitScore = normalizeValue(totalBenefitValues[idx], minBenefit, maxBenefit)
      const totalScore = affordabilityScore * 0.4 + reserveSafetyScore * 0.35 + totalBenefitScore * 0.25
      return {
        scenario,
        affordabilityScore,
        reserveSafetyScore,
        totalBenefitScore,
        totalScore,
      }
    })

    scored.sort((a, b) => b.totalScore - a.totalScore)
    return scored
  }, [purchaseScenarios, monthlyExpenses])
  const rankedPurchaseScenarios = useMemo(
    () => rankedPurchaseScenarioDetails.map((entry) => entry.scenario),
    [rankedPurchaseScenarioDetails]
  )
  const snapshotTierById = useMemo(() => {
    const map = new Map<string, 'Good' | 'Better' | 'Best'>()
    rankedPurchaseScenarios.forEach((scenario, idx) => {
      map.set(scenario.id, tierLabelFromRank(idx, rankedPurchaseScenarios.length))
    })
    return map
  }, [rankedPurchaseScenarios])
  const snapshotScoreById = useMemo(() => {
    const map = new Map<string, { affordability: number; safety: number; benefit: number; total: number }>()
    rankedPurchaseScenarioDetails.forEach((entry) => {
      map.set(entry.scenario.id, {
        affordability: Math.round(entry.affordabilityScore * 100),
        safety: Math.round(entry.reserveSafetyScore * 100),
        benefit: Math.round(entry.totalBenefitScore * 100),
        total: Math.round(entry.totalScore * 100),
      })
    })
    return map
  }, [rankedPurchaseScenarioDetails])
  const snapshotScenario = useMemo(
    () =>
      purchaseScenarios.find((s) => s.id === snapshotScenarioId) ??
      rankedPurchaseScenarios[0] ??
      recommendedScenario ??
      purchaseScenarios[0],
    [purchaseScenarios, rankedPurchaseScenarios, snapshotScenarioId, recommendedScenario]
  )
  const equityGrowth = currentHome.homeValue - currentHome.mortgageBalance
  const currentStep = BUY_SELL_STEPS[step]
  const nextActionText = NEXT_ACTION_BY_STEP[currentStep.id] || 'Complete this step, then continue.'

  useEffect(() => {
    if (!purchaseScenarios.length) return
    if (!snapshotScenarioId || !purchaseScenarios.some((s) => s.id === snapshotScenarioId)) {
      setSnapshotScenarioId((rankedPurchaseScenarios[0] ?? recommendedScenario ?? purchaseScenarios[0]).id)
    }
  }, [purchaseScenarios, rankedPurchaseScenarios, snapshotScenarioId, recommendedScenario])

  const snapshotDownPayment = snapshotScenario
    ? snapshotScenario.purchasePrice * (snapshotScenario.downPaymentPercent / 100)
    : 0
  const estimatedBuyerClosingCosts = snapshotScenario ? snapshotScenario.purchasePrice * 0.03 : 0
  const estimatedMoveAndSetupCosts = snapshotScenario
    ? Math.min(15000, Math.max(3000, snapshotScenario.purchasePrice * 0.01))
    : 0
  const estimatedCashNeededAtClose =
    snapshotDownPayment + estimatedBuyerClosingCosts + estimatedMoveAndSetupCosts
  const cashLeftAfterClose = Math.max(0, availableDown - estimatedCashNeededAtClose)
  const emergencyRunwayMonths = monthlyExpenses > 0 ? cashLeftAfterClose / monthlyExpenses : 0
  const allInMonthlyChange = (snapshotScenario?.monthlyPayment ?? 0) - currentHousingCost
  const safetyBufferMonths = 6
  const maxSafePurchasePrice = Math.max(0, (availableDown - monthlyExpenses * safetyBufferMonths) / 0.2)
  const decisionBadge = useMemo(() => {
    if (!snapshotScenario) return 'Needs review'
    if (emergencyRunwayMonths >= 6 && allInMonthlyChange <= 500) return 'Likely affordable'
    if (emergencyRunwayMonths >= 3) return 'Borderline'
    return 'High risk'
  }, [snapshotScenario, emergencyRunwayMonths, allInMonthlyChange])
  const decisionBadgeClasses =
    decisionBadge === 'Likely affordable'
      ? 'bg-green-100 text-green-800 border-green-200'
      : decisionBadge === 'Borderline'
        ? 'bg-amber-100 text-amber-800 border-amber-200'
        : 'bg-red-100 text-red-800 border-red-200'
  const paymentAtBaseRate = snapshotScenario?.monthlyPayment ?? 0
  const paymentAtLowerRate = paymentAtBaseRate * 0.92
  const paymentAtHigherRate = paymentAtBaseRate * 1.08
  const salePriceShockNetProceeds = netProceedsFromSale(
    currentHome.homeValue * 0.95,
    currentHome.mortgageBalance,
    currentHome.sellingCostsPercent,
    currentHome.sellingCostsFixed
  )
  const salePriceShockAvailableDown =
    newHome.downPaymentSource === 'proceeds'
      ? salePriceShockNetProceeds
      : newHome.downPaymentSource === 'savings'
        ? newHome.additionalSavings
        : salePriceShockNetProceeds + newHome.additionalSavings
  const salePriceHighNetProceeds = netProceedsFromSale(
    currentHome.homeValue * 1.05,
    currentHome.mortgageBalance,
    currentHome.sellingCostsPercent,
    currentHome.sellingCostsFixed
  )
  const salePriceHighAvailableDown =
    newHome.downPaymentSource === 'proceeds'
      ? salePriceHighNetProceeds
      : newHome.downPaymentSource === 'savings'
        ? newHome.additionalSavings
        : salePriceHighNetProceeds + newHome.additionalSavings
  const equityConfidenceLow = Math.max(0, currentHome.homeValue * 0.95 - currentHome.mortgageBalance)
  const equityConfidenceHigh = Math.max(0, currentHome.homeValue * 1.05 - currentHome.mortgageBalance)
  const cashNeededConfidenceLow = estimatedCashNeededAtClose * 0.95
  const cashNeededConfidenceHigh = estimatedCashNeededAtClose * 1.05
  const cashAfterCloseConfidenceLow = Math.max(0, salePriceShockAvailableDown - cashNeededConfidenceHigh)
  const cashAfterCloseConfidenceHigh = Math.max(0, salePriceHighAvailableDown - cashNeededConfidenceLow)
  const monthlyImpactConfidenceLow = paymentAtLowerRate - currentHousingCost
  const monthlyImpactConfidenceHigh = paymentAtHigherRate - currentHousingCost
  const maxSafePriceConfidenceLow = Math.max(0, (salePriceShockAvailableDown - monthlyExpenses * safetyBufferMonths) / 0.2)
  const maxSafePriceConfidenceHigh = Math.max(0, (salePriceHighAvailableDown - monthlyExpenses * safetyBufferMonths) / 0.2)
  const primaryRecommendation = useMemo(() => {
    if (!snapshotScenario) return 'Complete scenario inputs to receive a recommendation.'
    if (decisionBadge === 'Likely affordable') {
      return `Your current plan looks affordable with about ${emergencyRunwayMonths.toFixed(1)} months of reserves after close.`
    }
    if (decisionBadge === 'Borderline') {
      return 'Your plan is workable but tight. Increase reserves or lower price for safer runway.'
    }
    return 'Your current plan appears risky due to low post-close reserves or high payment jump.'
  }, [snapshotScenario, decisionBadge, emergencyRunwayMonths])
  const outcomeHeadline = useMemo(() => {
    if (!snapshotScenario) return 'Complete your scenario to see a clear decision.'
    if (decisionBadge === 'Likely affordable') return 'You are in a strong position to buy next.'
    if (decisionBadge === 'Borderline') return 'You can move forward, but your cushion is tight.'
    return 'Pause and strengthen your buffer before moving forward.'
  }, [snapshotScenario, decisionBadge])
  const confidenceMeterPercent = Math.max(
    15,
    Math.min(100, Math.round((emergencyRunwayMonths / safetyBufferMonths) * 100))
  )
  const confidenceBarClasses =
    decisionBadge === 'Likely affordable'
      ? 'bg-green-500'
      : decisionBadge === 'Borderline'
        ? 'bg-amber-500'
        : 'bg-red-500'

  return (
    <div className="app-page-shell text-[17px] [&_.text-xs]:text-base [&_.text-sm]:text-base [&_.text-base]:text-lg [&_.text-lg]:text-xl [&_.text-xl]:text-[22px] [&_.text-2xl]:text-[26px]">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <BackToMyJourneyLink />
            <Link
              href="/"
              className="flex items-center gap-2 text-sm font-medium text-[#57534e] hover:text-[#1c1917] transition"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Home</span>
            </Link>
          </div>
          <h1 className="font-display text-xl font-bold text-[#15803d]">Buy & Sell Journey</h1>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition print:hidden"
            aria-label="Print or save as PDF"
          >
            <Share2 className="h-5 w-5" />
            <span className="hidden sm:inline">Print / Share</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-4 pb-14">
        <JourneyProgressBar
          steps={BUY_SELL_STEPS}
          currentStep={step}
          onStepClick={(i) => setStep(i)}
          allowJump={true}
          className="mb-5"
        />

        {/* Main section divider - like "YOUR POSITION" */}
        <div className="w-full rounded-lg bg-gradient-to-r from-brand-forest via-millennial-cta-primary to-teal-400 px-4 py-2.5 mb-4">
          <span className="text-sm font-bold tracking-wider text-white uppercase">Today&apos;s focus</span>
        </div>

        <section className="mb-4">
          <div className="rounded-xl border-0 bg-gradient-to-r from-brand-forest via-millennial-cta-primary to-teal-400 p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 text-white">
                <Target className="h-5 w-5" strokeWidth={2} />
              </span>
              <p className="text-xs font-semibold uppercase tracking-wide text-white/90">Today view</p>
            </div>
            <h2 className="text-lg font-bold text-white mb-1">{currentStep.label}</h2>
            <div className="flex items-start gap-3 mb-3">
              {(() => {
                const ActionIcon = (NEXT_ACTION_ICON_BY_STEP as Record<string, typeof Target>)[currentStep.id] ?? Target
                return (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/20 text-white mt-0.5">
                    <ActionIcon className="h-4 w-4" strokeWidth={2} />
                  </span>
                )
              })()}
              <p className="text-sm text-white/95 pt-0.5">{nextActionText}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setStep((s) => Math.min(BUY_SELL_STEPS.length - 1, s + 1))}
                className="inline-flex items-center gap-2 rounded-lg bg-white text-teal-700 px-4 py-2 text-sm font-semibold hover:bg-white/90 transition"
              >
                Mark done & next
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setStep(BUY_SELL_STEPS.length - 1)}
                className="inline-flex items-center gap-2 rounded-lg border-2 border-white/60 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 transition"
              >
                Jump to action plan
              </button>
            </div>
          </div>
        </section>

        <AnimatePresence mode="wait">
          {/* Step 1: Current Home Profile */}
          {step === 0 && (
            <motion.section
              key="step0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Sub-section header - dark charcoal bar, rounded top */}
              <div className="rounded-t-lg bg-slate-800 px-5 py-2.5">
                <span className="text-sm font-bold text-white">Current home profile</span>
              </div>
              <div className="flex items-center gap-3 mb-1 mt-2">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <Home className="h-5 w-5" strokeWidth={2} />
                </span>
                <h2 className="text-2xl font-bold text-gray-900">Current Home Profile</h2>
              </div>
              <p className="text-gray-600">
                Enter your current home details to see net proceeds and buying power.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Current home value (estimate)</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    min={10000}
                    step={5000}
                    value={formatNumberForInput(currentHome.homeValue || '', 0)}
                    onChange={(e) =>
                      setCurrentHome((c) => ({ ...c, homeValue: parseFormattedNumber(e.target.value) || 0 }))
                    }
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Outstanding mortgage balance</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    min={0}
                    step={1000}
                    value={formatNumberForInput(currentHome.mortgageBalance || '', 0)}
                    onChange={(e) =>
                      setCurrentHome((c) => ({ ...c, mortgageBalance: parseFormattedNumber(e.target.value) || 0 }))
                    }
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">
                    Expected selling costs (%){' '}
                    <Tooltip content="Typically 5–8% (agent commission, transfer taxes, etc.).">ⓘ</Tooltip>
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    min={0}
                    max={20}
                    step={0.5}
                    value={formatNumberForInput(currentHome.sellingCostsPercent || '', 3)}
                    onChange={(e) =>
                      setCurrentHome((c) => ({
                        ...c,
                        sellingCostsPercent: parseFormattedNumber(e.target.value) || 0,
                      }))
                    }
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Fixed selling costs (optional)</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    min={0}
                    step={500}
                    value={formatNumberForInput(currentHome.sellingCostsFixed || '', 0)}
                    onChange={(e) =>
                      setCurrentHome((c) => ({ ...c, sellingCostsFixed: parseFormattedNumber(e.target.value) || 0 }))
                    }
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-sm font-medium text-gray-700">Desired timeline to sell</span>
                  <select
                    value={currentHome.timelineToSell}
                    onChange={(e) =>
                      setCurrentHome((c) => ({
                        ...c,
                        timelineToSell: e.target.value as BuySellCurrentHome['timelineToSell'],
                      }))
                    }
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  >
                    {TIMELINE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="rounded-xl border-2 border-teal-200/60 bg-gradient-to-br from-teal-50/80 to-emerald-50/50 p-5 shadow-sm ring-1 ring-teal-100/50">
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/20 text-teal-600">
                    <DollarSign className="h-4 w-4" strokeWidth={2.5} />
                  </span>
                  <h3 className="font-semibold text-gray-900">Equity calculator</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Home Value − Mortgage − Costs = Net Proceeds
                </p>
                <p className="text-2xl font-bold text-teal-700">
                  Net proceeds: {formatCurrency(netProceeds)}
                </p>
              </div>
            </motion.section>
          )}

          {/* Step 2: New Home Vision */}
          {step === 1 && (
            <motion.section
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="rounded-t-lg bg-slate-800 px-5 py-2.5">
                <span className="text-sm font-bold text-white">New home vision</span>
              </div>
              <div className="flex items-center gap-3 mb-1 mt-2">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-600">
                  <Target className="h-5 w-5" strokeWidth={2} />
                </span>
                <h2 className="text-2xl font-bold text-gray-900">New Home Vision</h2>
              </div>
              <p className="text-gray-600">
                Set your target price range and how you'll fund the down payment.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block sm:col-span-2">
                  <span className="text-sm font-medium text-gray-700">Target purchase price range (min)</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    min={50000}
                    step={10000}
                    value={formatNumberForInput(newHome.targetPriceMin || '', 0)}
                    onChange={(e) =>
                      setNewHome((n) => ({ ...n, targetPriceMin: parseFormattedNumber(e.target.value) || 0 }))
                    }
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-sm font-medium text-gray-700">Target purchase price range (max)</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    min={50000}
                    step={10000}
                    value={formatNumberForInput(newHome.targetPriceMax || '', 0)}
                    onChange={(e) =>
                      setNewHome((n) => ({ ...n, targetPriceMax: parseFormattedNumber(e.target.value) || 0 }))
                    }
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-sm font-medium text-gray-700">Desired location (city or zip)</span>
                  <input
                    type="text"
                    value={newHome.location}
                    onChange={(e) => setNewHome((n) => ({ ...n, location: e.target.value }))}
                    placeholder="e.g. Austin, TX or 78701"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-sm font-medium text-gray-700">Down payment source</span>
                  <select
                    value={newHome.downPaymentSource}
                    onChange={(e) =>
                      setNewHome((n) => ({
                        ...n,
                        downPaymentSource: e.target.value as BuySellNewHome['downPaymentSource'],
                      }))
                    }
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  >
                    <option value="proceeds">Proceeds from sale only</option>
                    <option value="savings">Additional savings only</option>
                    <option value="both">Both (proceeds + savings)</option>
                  </select>
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-sm font-medium text-gray-700">Additional savings for down payment</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    min={0}
                    step={5000}
                    value={formatNumberForInput(newHome.additionalSavings || '', 0)}
                    onChange={(e) =>
                      setNewHome((n) => ({ ...n, additionalSavings: parseFormattedNumber(e.target.value) || 0 }))
                    }
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-sm font-medium text-gray-700">Credit score range</span>
                  <select
                    value={newHome.creditScore}
                    onChange={(e) =>
                      setNewHome((n) => ({
                        ...n,
                        creditScore: e.target.value as BuySellNewHome['creditScore'],
                      }))
                    }
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  >
                    {CREDIT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

            </motion.section>
          )}

          {/* Step 3: Bridge Financing */}
          {step === 2 && (
            <motion.section
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="rounded-t-lg bg-slate-800 px-5 py-2.5">
                <span className="text-sm font-bold text-white">Bridge financing options</span>
              </div>
              <div className="flex items-center gap-3 mb-1 mt-2">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                  <BarChart3 className="h-5 w-5" strokeWidth={2} />
                </span>
                <h2 className="text-[26px] font-bold text-gray-900">Bridge Financing Options</h2>
              </div>
              <p className="text-lg text-gray-600">
                Choose how you'll time the sale and purchase. Each has trade-offs.
              </p>

              <div className="grid sm:grid-cols-3 gap-4">
                {BRIDGE_OPTIONS.map((opt, idx) => {
                  const accentColors = [
                    'border-l-4 border-l-amber-400 bg-amber-50/50 hover:border-amber-300',
                    'border-l-4 border-l-teal-400 bg-teal-50/50 hover:border-teal-300',
                    'border-l-4 border-l-emerald-400 bg-emerald-50/50 hover:border-emerald-300',
                  ]
                  return (
                  <div
                    key={opt.id}
                    className={`rounded-xl border-2 border-gray-200 p-4 shadow-sm transition ${accentColors[idx]}`}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{opt.label}</h3>
                    <p className="text-sm font-medium text-gray-500 mb-2">
                      Risk: <span className={opt.risk === 'high' ? 'text-red-600' : opt.risk === 'medium' ? 'text-amber-600' : 'text-green-600'}>{opt.risk}</span>
                    </p>
                    <ul className="text-base text-gray-600 space-y-1 mb-2">
                      <li className="text-green-600">+ {opt.pros[0]}</li>
                      <li className="text-green-600">+ {opt.pros[1]}</li>
                      <li className="text-red-600">− {opt.cons[0]}</li>
                      <li className="text-red-600">− {opt.cons[1]}</li>
                    </ul>
                    <p className="text-sm text-gray-500">{opt.costNote}</p>
                  </div>
                  )
                })}
              </div>
            </motion.section>
          )}

          {/* Step 4: Financial Waterfall */}
          {step === 3 && (
            <motion.section
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="rounded-t-lg bg-slate-800 px-5 py-2.5">
                <span className="text-sm font-bold text-white">Financial waterfall analysis</span>
              </div>
              <div className="flex items-center gap-3 mb-1 mt-2">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-600">
                  <TrendingUp className="h-5 w-5" strokeWidth={2} />
                </span>
                <h2 className="text-2xl font-bold text-gray-900">Financial Waterfall Analysis</h2>
              </div>
              <p className="text-gray-600">
                How your current equity and savings turn into buying power.
              </p>

              <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                <div className="rounded-t-lg bg-slate-800 px-4 py-2.5">
                  <span className="text-sm font-bold text-white">Money flow</span>
                </div>
                <ul className="divide-y divide-gray-100">
                  {waterfallSteps.map((s, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between px-4 py-3 text-sm"
                    >
                      <span className="text-gray-700">{s.label}</span>
                      <span
                        className={`tabular-nums font-medium ${
                          s.value >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {s.type === 'minus' ? '−' : s.type === 'plus' ? '+' : ''}
                        {formatCurrency(Math.abs(s.value))}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {recommendedScenario && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <SavingsCard
                    title="New monthly payment (est.)"
                    value={formatCurrency(recommendedScenario.monthlyPayment)}
                    variant="neutral"
                  />
                  <SavingsCard
                    title="Cash reserves after purchase"
                    value={formatCurrency(recommendedScenario.cashReservesAfter)}
                    variant="savings"
                  />
                </div>
              )}

              <div className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50/90 to-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <Gauge className="h-6 w-6 text-indigo-600" aria-hidden />
                  <h3 className="text-lg font-bold text-gray-900">Rate alerts (prototype)</h3>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  When benchmark mortgage rates move enough, your bridge cost and new payment estimates can shift. Subscribe
                  to save today&apos;s PMMS baseline; we&apos;ll surface a notice in your lifecycle dashboard when the
                  market moves by your threshold (stored on this device only in the prototype).
                </p>
                {rateAlertSubscribed ? (
                  <p className="mt-4 text-sm font-semibold text-indigo-900">
                    You&apos;re subscribed. We&apos;ll compare future rates to your saved benchmark and highlight changes
                    on the{' '}
                    <Link href="/lifecycle-dashboard" className="underline underline-offset-2 hover:text-indigo-950">
                      lifecycle dashboard
                    </Link>
                    .
                  </p>
                ) : (
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                    <label className="flex-1 text-sm font-medium text-gray-700">
                      Email (optional)
                      <input
                        type="email"
                        value={rateAlertEmail}
                        onChange={(e) => setRateAlertEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                    </label>
                    <button
                      type="button"
                      disabled={rateAlertBusy}
                      onClick={async () => {
                        setRateAlertBusy(true)
                        try {
                          const r = await getCachedFreddieMacRates()
                          saveMoveUpRateAlert(rateAlertEmail, { rate30Year: r.rate30Year, date: r.date })
                          setRateAlertSubscribed(true)
                        } finally {
                          setRateAlertBusy(false)
                        }
                      }}
                      className="shrink-0 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
                    >
                      {rateAlertBusy ? 'Saving…' : 'Subscribe to rate alerts'}
                    </button>
                  </div>
                )}
              </div>
            </motion.section>
          )}

          {/* Step 5: Comparative Scenarios */}
          {step === 4 && (
            <motion.section
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="rounded-t-lg bg-slate-800 px-5 py-2.5">
                <span className="text-sm font-bold text-white">Comparative purchase scenarios</span>
              </div>
              <div className="flex items-center gap-3 mb-1 mt-2">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                  <LayoutList className="h-5 w-5" strokeWidth={2} />
                </span>
                <h2 className="text-2xl font-bold text-gray-900">Comparative Purchase Scenarios</h2>
              </div>
              <p className="text-gray-600">
                Three ways to use your down payment. We highlight a balanced option.
              </p>

              <div className="grid sm:grid-cols-3 gap-4">
                {purchaseScenarios.map((sc, idx) => {
                  const accents = sc.recommended
                    ? 'border-l-4 border-l-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-200/40'
                    : idx === 0
                      ? 'border-l-4 border-l-teal-400 bg-teal-50/40 hover:border-teal-300'
                      : idx === 1
                        ? 'border-l-4 border-l-violet-400 bg-violet-50/40 hover:border-violet-300'
                        : 'border-l-4 border-l-amber-400 bg-amber-50/40 hover:border-amber-300'
                  return (
                  <div
                    key={sc.id}
                    className={`rounded-xl border-2 border-gray-200 p-4 shadow-sm transition ${accents}`}
                  >
                    {sc.recommended && (
                      <span className="inline-block text-xs font-semibold text-green-700 mb-2">
                        Recommended
                      </span>
                    )}
                    <h3 className="font-semibold text-gray-900 mb-3">{sc.label}</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>Price: {formatCurrency(sc.purchasePrice)}</li>
                      <li>Down: {sc.downPaymentPercent}%</li>
                      <li>Monthly: {formatCurrency(sc.monthlyPayment)}</li>
                      <li>PMI: {formatCurrency(sc.pmiMonthly)}/mo</li>
                      <li>Reserves: {formatCurrency(sc.cashReservesAfter)}</li>
                      <li>Emergency runway: {sc.emergencyFundMonths} months</li>
                    </ul>
                  </div>
                  )
                })}
              </div>

              {recommendedScenario && (
                <p className="text-sm text-gray-600 rounded-lg bg-gray-50 p-4">
                  <strong>Why balanced?</strong> A 15% down option keeps monthly payments manageable
                  while using your proceeds. You'll have PMI until you reach 20% equity but retain
                  more cash reserves for moving and emergencies.
                </p>
              )}
            </motion.section>
          )}

          {/* Step 6: Savings & Opportunity */}
          {step === 5 && (
            <motion.section
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Main section divider - "YOUR POSITION" style */}
              <div className="w-full rounded-lg bg-gradient-to-r from-brand-forest via-millennial-cta-primary to-teal-400 px-4 py-2.5 mb-4">
                <span className="text-sm font-bold tracking-wider text-white uppercase">Your position</span>
              </div>
              <div className="flex items-center gap-3 mb-1">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <Sparkles className="h-5 w-5" strokeWidth={2} />
                </span>
                <h2 className="text-2xl font-bold text-gray-900">Can you move confidently right now?</h2>
              </div>
              <div className="rounded-lg overflow-hidden border border-gray-200 shadow-lg">
                <div className="rounded-t-lg bg-slate-800 px-5 py-2.5">
                  <span className="text-sm font-bold text-white">Savings & opportunity snapshot</span>
                </div>
                <div className="rounded-2xl rounded-t-none border-2 border-t-0 border-emerald-200/50 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/50 p-5 sm:p-6 shadow-emerald-100/30">
                <div className="relative mb-4 -mx-5 -mt-2 sm:-mx-6 h-32 sm:h-40">
                  <img
                    src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80"
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/40 via-transparent to-transparent" />
                </div>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-emerald-900">Your personalized move-ready snapshot</p>
                    <h3 className="mt-1 text-xl font-semibold text-gray-900">{outcomeHeadline}</h3>
                    <p className="mt-2 text-sm text-gray-700">{primaryRecommendation}</p>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${decisionBadgeClasses}`}>
                    {decisionBadge}
                  </span>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border-2 border-emerald-300/50 bg-gradient-to-br from-emerald-50 to-teal-50/40 p-4 shadow-sm ring-1 ring-emerald-100/40">
                    <div className="flex items-center gap-2 mb-1">
                      <Wallet className="h-4 w-4 text-emerald-600" strokeWidth={2} />
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Post-close cash cushion</p>
                    </div>
                    <p className="mt-1 text-2xl font-bold text-gray-900">{formatCurrency(cashLeftAfterClose)}</p>
                    <p className="mt-1 text-sm text-gray-700">
                      About {emergencyRunwayMonths.toFixed(1)} months of reserves after closing.
                    </p>
                  </div>
                  <div className="rounded-xl border-2 border-violet-300/50 bg-gradient-to-br from-violet-50 to-purple-50/40 p-4 shadow-sm ring-1 ring-violet-100/40">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Gauge className="h-4 w-4 text-violet-600" strokeWidth={2} />
                        <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Confidence meter</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-700">{confidenceMeterPercent}%</p>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                      <div
                        className={`h-2 rounded-full transition-all ${confidenceBarClasses}`}
                        style={{ width: `${confidenceMeterPercent}%` }}
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      Goal: at least {safetyBufferMonths} months of reserves for stronger resilience.
                    </p>
                  </div>
                  <div className="rounded-xl border-2 border-amber-300/50 bg-gradient-to-br from-amber-50 to-orange-50/40 p-4 shadow-sm ring-1 ring-amber-100/40">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="h-4 w-4 text-amber-600" strokeWidth={2} />
                      <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Monthly payment impact</p>
                    </div>
                    <p className="mt-1 text-2xl font-bold text-gray-900">{formatCurrency(allInMonthlyChange)}</p>
                    <p className="mt-1 text-sm text-gray-700">Compared with your current monthly housing cost.</p>
                  </div>
                </div>
                <div className="mt-5">
                  <Link
                    href="/customized-journey?tab=phase"
                    onClick={() => queueMoveUpWizardJourneySync(buySellWizardStepToPhaseOrder(5))}
                    className="inline-flex items-center gap-2 rounded-lg bg-rose-500 px-5 py-3 text-white font-semibold hover:bg-rose-600 transition shadow-md shadow-rose-200/50"
                  >
                    Show my customized next steps
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
                <p className="mt-3 text-sm text-gray-600">
                  No commitment • no hard credit pull • most buyers complete this in under 2 minutes.
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
                  <button
                    type="button"
                    onClick={() => setStep(6)}
                    className="text-gray-700 underline underline-offset-2 hover:text-gray-900"
                  >
                    See prioritized action plan
                  </button>
                  <button
                    type="button"
                    onClick={() => document.getElementById('full-analysis-buy-sell')?.scrollIntoView({ behavior: 'smooth' })}
                    className="text-gray-700 underline underline-offset-2 hover:text-gray-900"
                  >
                    See assumptions and full breakdown
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const subject = encodeURIComponent('My NestQuest buy & sell summary')
                      const body = encodeURIComponent(
                        'I saved my buy-and-sell summary from NestQuest and want to review next steps.'
                      )
                      window.location.href = `mailto:?subject=${subject}&body=${body}`
                    }}
                    className="inline-flex items-center gap-2 text-gray-700 underline underline-offset-2 hover:text-gray-900"
                  >
                    <Mail className="h-4 w-4" />
                    Email summary
                  </button>
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-green-200 bg-green-50/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-green-900">Benefits you can unlock</p>
                    <ul className="mt-2 space-y-1 text-sm text-green-900">
                      <li>
                        {decisionBadge === 'Likely affordable'
                          ? 'Strong affordability position based on your current scenario.'
                          : 'A feasible path is available with some optimization.'}
                      </li>
                      <li>
                        Potential savings runway: {formatCurrency(Math.max(0, cashLeftAfterClose))} after close.
                      </li>
                      <li>Comfortable reserve target: {safetyBufferMonths}+ months for resilience.</li>
                    </ul>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-700">Common consumer concerns</p>
                    <ul className="mt-2 space-y-1 text-sm text-gray-700">
                      <li>This works best when you keep at least {safetyBufferMonths} months of reserves.</li>
                      <li>Cash needed at close is about {formatCurrency(estimatedCashNeededAtClose)}.</li>
                      <li>Rate shifts can change monthly payment; stress tests are included below.</li>
                    </ul>
                  </div>
                </div>
                </div>
              </div>

              <div className="rounded-lg overflow-hidden border border-gray-200 mt-4">
                <div className="rounded-t-lg bg-slate-800 px-4 py-2.5">
                  <span className="text-sm font-bold text-white">Choose snapshot scenario</span>
                </div>
              <div className="rounded-xl rounded-t-none border border-t-0 border-gray-200 bg-white p-4">
                <p className="text-sm font-semibold text-gray-900 mb-2 sr-only">Scenario options</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                  {purchaseScenarios.map((sc) => {
                    const tierLabel = snapshotTierById.get(sc.id) ?? 'Good'
                    const score = snapshotScoreById.get(sc.id)
                    const selected = snapshotScenario?.id === sc.id
                    return (
                      <button
                        key={sc.id}
                        type="button"
                        onClick={() => setSnapshotScenarioId(sc.id)}
                        className={`rounded-lg border px-3 py-2 text-left transition ${
                          selected
                            ? 'border-green-500 bg-green-50 text-green-900'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-green-200'
                        }`}
                      >
                        <p className="text-xs font-semibold uppercase tracking-wide">{tierLabel}</p>
                        <p className="text-sm font-semibold">{sc.label}</p>
                        <p className="text-xs">
                          {formatCurrency(sc.purchasePrice)} · {formatCurrency(sc.monthlyPayment)}/mo
                        </p>
                        <p className="mt-1 text-[11px] text-gray-500">
                          Why this rank{' '}
                          <Tooltip
                            content={`Affordability ${score?.affordability ?? 0}/100 · Safety ${score?.safety ?? 0}/100 · Benefit ${score?.benefit ?? 0}/100 · Total ${score?.total ?? 0}/100`}
                          >
                            ⓘ
                          </Tooltip>
                        </p>
                      </button>
                    )
                  })}
                </div>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">
                    Current monthly housing payment (for comparison)
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    min={0}
                    step={50}
                    value={formatNumberForInput(currentHousingCost || '', 0)}
                    onChange={(e) => setCurrentHousingCost(parseFormattedNumber(e.target.value) || 0)}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 sm:max-w-xs"
                  />
                </label>
                <p className="mt-2 text-sm text-gray-600">
                  This helps compare your estimated new monthly payment to your current baseline.
                </p>
              </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <SavingsCard
                    title="Estimated cash needed at close"
                    value={formatCurrency(estimatedCashNeededAtClose)}
                    subtitle={`Confidence: ${formatCurrency(cashNeededConfidenceLow)} to ${formatCurrency(cashNeededConfidenceHigh)}`}
                    variant="alert"
                  />
                </div>
                <div>
                  <SavingsCard
                    title="Cash left after close"
                    value={formatCurrency(cashLeftAfterClose)}
                    subtitle={`Confidence: ${formatCurrency(cashAfterCloseConfidenceLow)} to ${formatCurrency(cashAfterCloseConfidenceHigh)}`}
                    variant={emergencyRunwayMonths >= 6 ? 'savings' : emergencyRunwayMonths >= 3 ? 'neutral' : 'alert'}
                  />
                </div>
                <div>
                  <SavingsCard
                    title="Monthly payment impact vs today"
                    value={formatCurrency(allInMonthlyChange)}
                    subtitle={`Confidence: ${formatCurrency(monthlyImpactConfidenceLow)} to ${formatCurrency(monthlyImpactConfidenceHigh)}`}
                    variant={allInMonthlyChange <= 0 ? 'savings' : allInMonthlyChange < 500 ? 'neutral' : 'alert'}
                  />
                </div>
              </div>

              <details id="full-analysis-buy-sell" className="rounded-xl border border-gray-200 bg-white p-4">
                <summary className="cursor-pointer font-semibold text-gray-900">
                  View full analysis (risk checks, assumptions, and detailed metrics)
                </summary>
                <div className="mt-4 grid sm:grid-cols-3 gap-4">
                  <SavingsCard
                    title="Max safe purchase price (est.)"
                    value={formatCurrency(maxSafePurchasePrice)}
                    subtitle={`Confidence: ${formatCurrency(maxSafePriceConfidenceLow)} to ${formatCurrency(maxSafePriceConfidenceHigh)}`}
                    variant="neutral"
                  />
                  <SavingsCard
                    title="Net proceeds from sale"
                    value={formatCurrency(netProceeds)}
                    subtitle={`Confidence: ${formatCurrency(salePriceShockNetProceeds)} to ${formatCurrency(salePriceHighNetProceeds)}`}
                    variant="neutral"
                  />
                  <SavingsCard
                    title="Your home equity (current)"
                    value={formatCurrency(equityGrowth)}
                    subtitle={`Confidence: ${formatCurrency(equityConfidenceLow)} to ${formatCurrency(equityConfidenceHigh)}`}
                    variant="savings"
                  />
                </div>
                <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Risk checks (what if conditions change)</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>
                      If your sale closes 5% below estimate, usable funds could shift to about{' '}
                      <span className="font-semibold">{formatCurrency(salePriceShockAvailableDown)}</span>.
                    </li>
                    <li>
                      If rates rise by 0.5%, estimated monthly principal and interest could move from{' '}
                      <span className="font-semibold">{formatCurrency(paymentAtBaseRate)}</span> to{' '}
                      <span className="font-semibold">{formatCurrency(paymentAtHigherRate)}</span>.
                    </li>
                    <li>
                      If rates improve by 0.5%, principal and interest could move to about{' '}
                      <span className="font-semibold">{formatCurrency(paymentAtLowerRate)}</span>.
                    </li>
                  </ul>
                </div>
                <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Assumptions used in this snapshot</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    <li>Buyer closing costs are estimated at 3% of purchase price.</li>
                    <li>Move/setup costs are estimated at 1% (bounded for realism).</li>
                    <li>Payment stress test assumes a 30-year fixed mortgage.</li>
                    <li>Safety target uses {safetyBufferMonths} months of non-housing reserves.</li>
                  </ul>
                </div>
                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50/50 p-4">
                  <h3 className="font-semibold text-amber-900 mb-2">Personalized insights</h3>
                  <ul className="space-y-2 text-sm text-amber-900">
                    <li>Your home equity has grown to {formatCurrency(equityGrowth)} (current value minus balance).</li>
                    <li>After selling costs, you'll have about {formatCurrency(netProceeds)} for your next down payment.</li>
                    <li>Upgrading now vs. waiting: rates and prices may change; this snapshot helps you compare.</li>
                    <li>
                      Post-close runway is about {emergencyRunwayMonths.toFixed(1)} months. Target at least{' '}
                      {safetyBufferMonths} months for stronger resilience.
                    </li>
                    <li>Your estimated monthly payment change versus today is {formatCurrency(allInMonthlyChange)}.</li>
                  </ul>
                </div>
              </details>
            </motion.section>
          )}

          {/* Step 7: Action Plan */}
          {step === 6 && (
            <motion.section
              key="step6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Main section divider */}
              <div className="w-full rounded-lg bg-gradient-to-r from-brand-forest via-millennial-cta-primary to-teal-400 px-4 py-2.5 mb-4">
                <span className="text-sm font-bold tracking-wider text-white uppercase">Action plan</span>
              </div>
              <div className="flex items-center gap-3 mb-1">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                  <KeyRound className="h-5 w-5" strokeWidth={2} />
                </span>
                <h2 className="text-2xl font-bold text-gray-900">Coordinated Action Plan</h2>
              </div>

              <TimelineVisualization
                title="Selling & buying timeline"
                variant="dual"
                milestones={[
                  { id: 'list', label: 'List current home', sublabel: 'Prep & list', completed: false },
                  { id: 'offer', label: 'Accept offer', sublabel: 'Negotiate & sign', completed: false },
                  { id: 'close-sell', label: 'Close sale', sublabel: 'Fund & transfer', completed: false },
                ]}
                secondTrack={{
                  title: 'Buying',
                  milestones: [
                    { id: 'preapprove', label: 'Get pre-approved', sublabel: 'Lender & amount', completed: false },
                    { id: 'search', label: 'Search & offer', sublabel: 'Find new home', completed: false },
                    { id: 'close-buy', label: 'Close purchase', sublabel: 'Sign & move', completed: false },
                  ],
                }}
              />

              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Checklist for both transactions</h3>
                <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
                  <li>Gather pay stubs, tax returns, bank statements</li>
                  <li>Get pre-approved for your new loan</li>
                  <li>List documents for sale (title, mortgage statement, etc.)</li>
                  <li>Coordinate with agent and lender on timing</li>
                </ul>
              </div>

              <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-5">
                <h3 className="font-bold text-gray-900 mb-3">After you close on your new home</h3>
                <div className="grid gap-3 md:grid-cols-3">
                  <Link
                    href="/lifecycle-dashboard"
                    className="rounded-lg border border-white bg-white p-4 shadow-sm transition hover:border-teal-300"
                  >
                    <p className="font-semibold text-gray-900">Lifecycle Dashboard</p>
                    <p className="mt-2 text-sm text-gray-600">
                      Track your mortgage, equity, and refinance opportunities in one place.
                    </p>
                  </Link>
                  <Link
                    href="/refinance-optimizer#rate-radar"
                    className="rounded-lg border border-white bg-white p-4 shadow-sm transition hover:border-teal-300"
                  >
                    <p className="font-semibold text-gray-900">Rate Drop Radar</p>
                    <p className="mt-2 text-sm text-gray-600">
                      Get alerted when rates drop enough to save you $200+/month.
                    </p>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setReferralOpen(true)}
                    className="rounded-lg border border-white bg-white p-4 text-left shadow-sm transition hover:border-teal-300"
                  >
                    <p className="font-semibold text-gray-900">Refer a Friend</p>
                    <p className="mt-2 text-sm text-gray-600">
                      Know someone buying? Share NestQuest and you both get $50 off.
                    </p>
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  queueMoveUpWizardJourneySync(7)
                  router.push('/customized-journey?tab=phase')
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-6 py-4 text-base font-bold text-white shadow-md transition hover:bg-teal-800"
              >
                Continue to my customized journey
                <ArrowRight className="h-5 w-5" aria-hidden />
              </button>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/mortgage-shopping"
                  className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-3 text-white font-semibold hover:bg-green-700 transition shadow-sm"
                >
                  Get pre-approved
                </Link>
                <Link
                  href="/marketplace"
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-3 text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  Connect with agent
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    const subject = encodeURIComponent('My NestQuest buy & sell summary')
                    const body = encodeURIComponent('I saved my buy-and-sell summary from NestQuest and want to review next steps.')
                    window.location.href = `mailto:?subject=${subject}&body=${body}`
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-3 text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  <Mail className="h-5 w-5" />
                  Email summary
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-3 text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  <Share2 className="h-5 w-5" />
                  Save & share summary
                </button>
              </div>

              <p className="text-sm text-gray-500">
                Your journey is auto-saved. Return anytime or share your unique link to continue.
              </p>
            </motion.section>
          )}
        </AnimatePresence>

        <nav
          className="mt-5 flex items-center justify-between border-t border-gray-200 pt-4 print:hidden"
          aria-label="Journey navigation"
        >
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          {step < BUY_SELL_STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2 text-white font-semibold hover:bg-green-700 transition"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                queueMoveUpWizardJourneySync(7)
                router.push('/customized-journey?tab=phase')
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2 text-white font-semibold hover:bg-green-700 transition"
            >
              Continue to journey
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </nav>
      </main>

      <ReferralProgramModal
        open={referralOpen}
        onClose={() => setReferralOpen(false)}
        referralSlug={referralSlug}
        milestone="quiz"
        storageKeyOnDismiss={REFERRAL_PROMPT_LS.afterQuizResults}
      />
    </div>
  )
}

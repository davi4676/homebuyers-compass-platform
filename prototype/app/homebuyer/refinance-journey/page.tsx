'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  DollarSign,
  Home,
  Target,
  BarChart3,
  FileCheck,
  ChevronRight,
  Lock,
  Download,
  Mail,
  HelpCircle,
  Wallet,
  Gauge,
  Zap,
  Sparkles,
  Calculator,
  KeyRound,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { formatCurrency } from '@/lib/calculations'
import {
  buildRefiScenarios,
  totalInterestOverLife,
  estimateRefiClosingCosts,
  lifetimeInterestSavings,
  type RefiCurrentSituation,
  type RefiGoal,
  type RefiScenario,
} from '@/lib/journey-calculations'
import {
  JourneyProgressBar,
  SavingsCard,
  ComparisonTable,
  TimelineVisualization,
  Tooltip,
} from '@/components/journeys'
import { getCachedFreddieMacRates } from '@/lib/freddie-mac-rates'
import { formatNumberForInput, parseFormattedNumber } from '@/lib/number-format'

const REFI_STORAGE_KEY = 'refinance-journey-v1'
const REFI_STEPS: { id: string; label: string; shortLabel: string }[] = [
  { id: 'situation', label: 'Current Situation', shortLabel: 'Situation' },
  { id: 'goals', label: 'Refinance Goals', shortLabel: 'Goals' },
  { id: 'scenarios', label: 'Rate Scenarios', shortLabel: 'Scenarios' },
  { id: 'savings', label: 'Savings & Insights', shortLabel: 'Savings' },
  { id: 'action', label: 'Action Plan', shortLabel: 'Action' },
]

const CREDIT_OPTIONS: { value: RefiCurrentSituation['creditScore']; label: string }[] = [
  { value: '750+', label: '750+' },
  { value: '700-750', label: '700–750' },
  { value: '650-700', label: '650–700' },
  { value: '600-650', label: '600–650' },
  { value: 'under-600', label: 'Under 600' },
]

const GOAL_OPTIONS: { id: string; label: string; benefit: string; icon: React.ReactNode }[] = [
  { id: 'lower-payment', label: 'Lower monthly payment', benefit: 'Reduce your monthly obligation', icon: <DollarSign className="h-6 w-6" /> },
  { id: 'reduce-term', label: 'Reduce loan term', benefit: 'Pay off your loan faster', icon: <Target className="h-6 w-6" /> },
  { id: 'cash-out', label: 'Cash-out equity', benefit: 'Use home equity for goals', icon: <Home className="h-6 w-6" /> },
  { id: 'arm-to-fixed', label: 'Switch from ARM to fixed rate', benefit: 'Lock in predictable payments', icon: <Lock className="h-6 w-6" /> },
  { id: 'consolidate-debt', label: 'Consolidate debt', benefit: 'Combine high-interest debt', icon: <RefreshCw className="h-6 w-6" /> },
]

const defaultSituation: RefiCurrentSituation = {
  mortgageBalance: 300000,
  currentRate: 6.5,
  monthlyPayment: 2100,
  yearsRemaining: 25,
  homeValue: 450000,
  creditScore: '700-750',
}

const defaultGoals: RefiGoal[] = GOAL_OPTIONS.map((g) => ({ id: g.id, label: g.label, selected: false }))
const QUIZ_STORAGE_KEY = 'quizData'

const NEXT_ACTION_BY_STEP: Record<string, string> = {
  situation: 'Verify balance, rate, and home value for accurate refinance math.',
  goals: 'Pick your top refinance objective so recommendations match your priorities.',
  scenarios: 'Compare payment, break-even, and total interest before choosing a path.',
  savings: 'Confirm real savings after closing costs and expected hold period.',
  action: 'Collect docs, lock rate when ready, and proceed with lender application.',
}

const NEXT_ACTION_ICON_BY_STEP = {
  situation: Calculator,
  goals: Target,
  scenarios: BarChart3,
  savings: Wallet,
  action: FileCheck,
} as const

function estimateMonthlyPI(principal: number, annualRatePercent: number, years: number): number {
  if (principal <= 0 || years <= 0) return 0
  const monthlyRate = annualRatePercent / 100 / 12
  const months = years * 12
  if (monthlyRate === 0) return principal / months
  return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months))
}

function estimateTotalInterest(principal: number, annualRatePercent: number, years: number): number {
  const monthly = estimateMonthlyPI(principal, annualRatePercent, years)
  return Math.max(0, monthly * years * 12 - principal)
}

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

function toRefiCreditScore(value: unknown): RefiCurrentSituation['creditScore'] {
  const allowed: RefiCurrentSituation['creditScore'][] = ['750+', '700-750', '650-700', '600-650', 'under-600']
  return allowed.includes(value as RefiCurrentSituation['creditScore'])
    ? (value as RefiCurrentSituation['creditScore'])
    : defaultSituation.creditScore
}

function mapQuizGoalsToJourneyGoals(input: unknown): RefiGoal[] {
  const rawGoals = Array.isArray(input) ? input : typeof input === 'string' ? [input] : []
  const selectedJourneyGoalIds = new Set<string>()

  rawGoals.forEach((goal) => {
    switch (goal) {
      case 'lower-payment':
      case 'lower-rate':
        selectedJourneyGoalIds.add('lower-payment')
        break
      case 'shorter-term':
        selectedJourneyGoalIds.add('reduce-term')
        break
      case 'arm-to-fixed':
        selectedJourneyGoalIds.add('arm-to-fixed')
        break
      case 'cashout-improvements':
      case 'cashout-investment':
        selectedJourneyGoalIds.add('cash-out')
        break
      case 'cashout-debt':
        selectedJourneyGoalIds.add('consolidate-debt')
        selectedJourneyGoalIds.add('cash-out')
        break
      default:
        break
    }
  })

  return defaultGoals.map((g) => ({ ...g, selected: selectedJourneyGoalIds.has(g.id) }))
}

function mapQuizDataToRefiState(quizData: unknown): { situation: RefiCurrentSituation; goals: RefiGoal[] } | null {
  if (!quizData || typeof quizData !== 'object') return null
  const data = quizData as Record<string, unknown>
  if (data.transactionType !== 'refinance') return null

  const mortgageBalance = Number(data.currentMortgageBalance)
  const currentRate = Number(data.currentRate)
  const monthlyPayment = Number(data.currentMonthlyPayment)
  const yearsRemaining = Number(data.yearsRemaining)
  const homeValue = Number(data.currentHomeValue)

  const situation: RefiCurrentSituation = {
    mortgageBalance: mortgageBalance > 0 ? mortgageBalance : defaultSituation.mortgageBalance,
    currentRate: currentRate > 0 ? currentRate : defaultSituation.currentRate,
    monthlyPayment: monthlyPayment > 0 ? monthlyPayment : defaultSituation.monthlyPayment,
    yearsRemaining: yearsRemaining > 0 ? yearsRemaining : defaultSituation.yearsRemaining,
    homeValue: homeValue > 0 ? homeValue : defaultSituation.homeValue,
    creditScore: toRefiCreditScore(data.creditScore),
  }

  return {
    situation,
    goals: mapQuizGoalsToJourneyGoals(data.refinanceGoals),
  }
}

function isJourneyStateUnstarted(situation: RefiCurrentSituation, goals: RefiGoal[]): boolean {
  const noGoals = !goals.some((g) => g.selected)
  const nearDefaultSituation =
    situation.mortgageBalance === defaultSituation.mortgageBalance &&
    situation.currentRate === defaultSituation.currentRate &&
    situation.monthlyPayment === defaultSituation.monthlyPayment &&
    situation.yearsRemaining === defaultSituation.yearsRemaining &&
    situation.homeValue === defaultSituation.homeValue &&
    situation.creditScore === defaultSituation.creditScore
  return noGoals && nearDefaultSituation
}

function loadRefiState(): { situation: RefiCurrentSituation; goals: RefiGoal[]; step: number } {
  if (typeof window === 'undefined') return { situation: defaultSituation, goals: defaultGoals, step: 0 }
  try {
    const quizRaw = localStorage.getItem(QUIZ_STORAGE_KEY)
    const quizMapped = quizRaw ? mapQuizDataToRefiState(JSON.parse(quizRaw)) : null

    const raw = localStorage.getItem(REFI_STORAGE_KEY)
    if (!raw) return quizMapped ? { ...quizMapped, step: 0 } : { situation: defaultSituation, goals: defaultGoals, step: 0 }

    const parsed = JSON.parse(raw)
    const saved = {
      situation: { ...defaultSituation, ...parsed.situation },
      goals: Array.isArray(parsed.goals) ? parsed.goals : defaultGoals,
      step: Number.isInteger(parsed.step)
        ? Math.max(0, Math.min(REFI_STEPS.length - 1, Number(parsed.step)))
        : 0,
    }

    // If journey was never started, prefer richer quiz-derived values.
    if (quizMapped && isJourneyStateUnstarted(saved.situation, saved.goals)) {
      return { ...quizMapped, step: saved.step }
    }

    return saved
  } catch {
    return { situation: defaultSituation, goals: defaultGoals, step: 0 }
  }
}

function saveRefiState(situation: RefiCurrentSituation, goals: RefiGoal[], step: number) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(
      REFI_STORAGE_KEY,
      JSON.stringify({ situation, goals, step, savedAt: new Date().toISOString() })
    )
  } catch {}
}

export default function RefinanceJourneyPage() {
  const [step, setStep] = useState(() => loadRefiState().step)
  const [situation, setSituation] = useState<RefiCurrentSituation>(defaultSituation)
  const [goals, setGoals] = useState<RefiGoal[]>(defaultGoals)
  const [expectedHoldYears, setExpectedHoldYears] = useState(7)
  const [snapshotScenarioId, setSnapshotScenarioId] = useState<string>('')
  const [pmmsRefreshVersion, setPmmsRefreshVersion] = useState(0)

  useEffect(() => {
    const { situation: s, goals: g } = loadRefiState()
    setSituation(s)
    setGoals(g)
  }, [])

  useEffect(() => {
    saveRefiState(situation, goals, step)
  }, [situation, goals, step])

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

  const scenarios = useMemo(() => buildRefiScenarios(situation, goals), [situation, goals, pmmsRefreshVersion])
  const currentTotalInterest = useMemo(
    () => totalInterestOverLife(situation.mortgageBalance, situation.currentRate, situation.yearsRemaining),
    [situation]
  )
  const bestScenario = scenarios[0]
  const rankedScenarioDetails = useMemo(() => {
    if (!scenarios.length) return [] as Array<{
      scenario: RefiScenario
      affordabilityScore: number
      reserveSafetyScore: number
      totalBenefitScore: number
      totalScore: number
    }>

    const holdMonths = expectedHoldYears * 12
    const affordabilityValues = scenarios.map((s) => s.monthlySavings)
    const reserveSafetyValues = scenarios.map((s) => {
      if (s.breakEvenMonths === Infinity || s.monthlySavings <= 0) return -1
      const holdFit = Math.max(0, holdMonths - s.breakEvenMonths)
      return holdFit + Math.max(0, s.monthlySavings / 50)
    })
    const totalBenefitValues = scenarios.map((s) => {
      const holdPeriodBenefit = s.monthlySavings * holdMonths - s.closingCostsEstimate
      const lifetimeBenefit = lifetimeInterestSavings(
        currentTotalInterest,
        s.totalInterestNew,
        s.closingCostsEstimate
      )
      return holdPeriodBenefit * 0.6 + lifetimeBenefit * 0.4
    })

    const minAffordability = Math.min(...affordabilityValues)
    const maxAffordability = Math.max(...affordabilityValues)
    const minReserve = Math.min(...reserveSafetyValues)
    const maxReserve = Math.max(...reserveSafetyValues)
    const minBenefit = Math.min(...totalBenefitValues)
    const maxBenefit = Math.max(...totalBenefitValues)

    const scored = scenarios.map((scenario, idx) => {
      const affordabilityScore = normalizeValue(affordabilityValues[idx], minAffordability, maxAffordability)
      const reserveSafetyScore = normalizeValue(reserveSafetyValues[idx], minReserve, maxReserve)
      const totalBenefitScore = normalizeValue(totalBenefitValues[idx], minBenefit, maxBenefit)
      const totalScore = affordabilityScore * 0.4 + reserveSafetyScore * 0.3 + totalBenefitScore * 0.3
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
  }, [scenarios, expectedHoldYears, currentTotalInterest])
  const rankedScenarios = useMemo(
    () => rankedScenarioDetails.map((entry) => entry.scenario),
    [rankedScenarioDetails]
  )
  const snapshotTierById = useMemo(() => {
    const map = new Map<string, 'Good' | 'Better' | 'Best'>()
    rankedScenarios.forEach((scenario, idx) => {
      map.set(scenario.id, tierLabelFromRank(idx, rankedScenarios.length))
    })
    return map
  }, [rankedScenarios])
  const snapshotScoreById = useMemo(() => {
    const map = new Map<string, { affordability: number; safety: number; benefit: number; total: number }>()
    rankedScenarioDetails.forEach((entry) => {
      map.set(entry.scenario.id, {
        affordability: Math.round(entry.affordabilityScore * 100),
        safety: Math.round(entry.reserveSafetyScore * 100),
        benefit: Math.round(entry.totalBenefitScore * 100),
        total: Math.round(entry.totalScore * 100),
      })
    })
    return map
  }, [rankedScenarioDetails])
  const snapshotScenario = useMemo(
    () =>
      scenarios.find((s) => s.id === snapshotScenarioId) ??
      rankedScenarios[0] ??
      scenarios[0],
    [scenarios, rankedScenarios, snapshotScenarioId]
  )
  const closingCosts = useMemo(() => estimateRefiClosingCosts(situation.mortgageBalance), [situation.mortgageBalance])
  const equity = Math.max(0, situation.homeValue - situation.mortgageBalance)
  const ltv = situation.homeValue > 0 ? (situation.mortgageBalance / situation.homeValue) * 100 : 0
  const currentStep = REFI_STEPS[step]
  const nextActionText = NEXT_ACTION_BY_STEP[currentStep.id] || 'Complete this step and continue.'
  useEffect(() => {
    if (!scenarios.length) return
    if (!snapshotScenarioId || !scenarios.some((s) => s.id === snapshotScenarioId)) {
      setSnapshotScenarioId((rankedScenarios[0] ?? scenarios[0]).id)
    }
  }, [scenarios, rankedScenarios, snapshotScenarioId])

  const netSavings12Months = useMemo(
    () => (snapshotScenario?.monthlySavings ?? 0) * 12 - closingCosts,
    [snapshotScenario?.monthlySavings, closingCosts]
  )
  const netSavings5Years = useMemo(
    () => (snapshotScenario?.monthlySavings ?? 0) * 60 - closingCosts,
    [snapshotScenario?.monthlySavings, closingCosts]
  )
  const holdPeriodNet = useMemo(
    () => (snapshotScenario?.monthlySavings ?? 0) * expectedHoldYears * 12 - closingCosts,
    [snapshotScenario?.monthlySavings, expectedHoldYears, closingCosts]
  )
  const breakEvenMonths = snapshotScenario?.breakEvenMonths ?? Infinity
  const decisionBadge = useMemo(() => {
    if (!snapshotScenario || snapshotScenario.monthlySavings <= 0) return 'Not beneficial'
    if (breakEvenMonths === Infinity || breakEvenMonths > expectedHoldYears * 12) return 'Borderline'
    return 'Likely beneficial'
  }, [snapshotScenario, breakEvenMonths, expectedHoldYears])
  const decisionBadgeClasses =
    decisionBadge === 'Likely beneficial'
      ? 'bg-green-100 text-green-800 border-green-200'
      : decisionBadge === 'Borderline'
        ? 'bg-amber-100 text-amber-800 border-amber-200'
        : 'bg-red-100 text-red-800 border-red-200'
  const sensitivity = useMemo(() => {
    if (!snapshotScenario) {
      return {
        low: { monthlySavings: 0, totalInterest: 0 },
        base: { monthlySavings: 0, totalInterest: 0 },
        high: { monthlySavings: 0, totalInterest: 0 },
      }
    }

    const principal = situation.mortgageBalance
    const termYears = snapshotScenario.loanTermYears
    const lowRate = Math.max(0.1, snapshotScenario.newRate - 0.5)
    const baseRate = snapshotScenario.newRate
    const highRate = snapshotScenario.newRate + 0.5

    const lowPayment = estimateMonthlyPI(principal, lowRate, termYears)
    const basePayment = estimateMonthlyPI(principal, baseRate, termYears)
    const highPayment = estimateMonthlyPI(principal, highRate, termYears)

    return {
      low: {
        monthlySavings: situation.monthlyPayment - lowPayment,
        totalInterest: estimateTotalInterest(principal, lowRate, termYears),
      },
      base: {
        monthlySavings: situation.monthlyPayment - basePayment,
        totalInterest: estimateTotalInterest(principal, baseRate, termYears),
      },
      high: {
        monthlySavings: situation.monthlyPayment - highPayment,
        totalInterest: estimateTotalInterest(principal, highRate, termYears),
      },
    }
  }, [snapshotScenario, situation.mortgageBalance, situation.monthlyPayment])
  const monthlyConfidenceLow = Math.min(sensitivity.low.monthlySavings, sensitivity.high.monthlySavings)
  const monthlyConfidenceHigh = Math.max(sensitivity.low.monthlySavings, sensitivity.high.monthlySavings)
  const net12ConfidenceLow = monthlyConfidenceLow * 12 - closingCosts
  const net12ConfidenceHigh = monthlyConfidenceHigh * 12 - closingCosts
  const net5yConfidenceLow = monthlyConfidenceLow * 60 - closingCosts
  const net5yConfidenceHigh = monthlyConfidenceHigh * 60 - closingCosts
  const holdConfidenceLow = monthlyConfidenceLow * expectedHoldYears * 12 - closingCosts
  const holdConfidenceHigh = monthlyConfidenceHigh * expectedHoldYears * 12 - closingCosts
  const lifetimeSavingsLow = lifetimeInterestSavings(currentTotalInterest, sensitivity.high.totalInterest, closingCosts)
  const lifetimeSavingsHigh = lifetimeInterestSavings(currentTotalInterest, sensitivity.low.totalInterest, closingCosts)
  const breakEvenFastMonths = monthlyConfidenceHigh > 0 ? Math.ceil(closingCosts / monthlyConfidenceHigh) : Infinity
  const breakEvenSlowMonths = monthlyConfidenceLow > 0 ? Math.ceil(closingCosts / monthlyConfidenceLow) : Infinity
  const equityConfidenceLow = Math.max(0, situation.homeValue * 0.95 - situation.mortgageBalance)
  const equityConfidenceHigh = Math.max(0, situation.homeValue * 1.05 - situation.mortgageBalance)
  const primaryRecommendation = useMemo(() => {
    if (!snapshotScenario || snapshotScenario.monthlySavings <= 0) {
      return 'Refinancing is unlikely to reduce your payment with current assumptions.'
    }
    if (breakEvenMonths === Infinity) {
      return 'Refinancing may not recover closing costs under current assumptions.'
    }
    return `Refinancing likely saves about ${formatCurrency(snapshotScenario.monthlySavings)}/month and breaks even in about ${breakEvenMonths} months.`
  }, [snapshotScenario, breakEvenMonths])
  const outcomeHeadline = useMemo(() => {
    if (!snapshotScenario || snapshotScenario.monthlySavings <= 0) {
      return 'Refinancing may not be worth it at this time.'
    }
    if (decisionBadge === 'Likely beneficial') return 'This refinance path looks strong for your timeline.'
    if (decisionBadge === 'Borderline') return 'This can work, but your margin is narrow.'
    return 'This option is unlikely to pay off before your timeline.'
  }, [snapshotScenario, decisionBadge])
  const confidenceMeterPercent =
    decisionBadge === 'Likely beneficial' ? 85 : decisionBadge === 'Borderline' ? 55 : 25
  const confidenceBarClasses =
    decisionBadge === 'Likely beneficial'
      ? 'bg-blue-500'
      : decisionBadge === 'Borderline'
        ? 'bg-amber-500'
        : 'bg-red-500'

  const toggleGoal = useCallback((id: string) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, selected: !g.selected } : g)))
  }, [])

  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white print:bg-white text-[17px] [&_.text-xs]:text-base [&_.text-sm]:text-base [&_.text-base]:text-lg [&_.text-lg]:text-xl [&_.text-xl]:text-[22px] [&_.text-2xl]:text-[26px]">
      <header className="bg-white shadow-sm sticky top-0 z-40 print:static">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition print:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </Link>
          <h1 className="text-xl font-bold text-blue-600">Refinance Journey</h1>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition print:hidden"
            aria-label="Print or save as PDF"
          >
            <Download className="h-5 w-5" />
            <span className="hidden sm:inline">Print / PDF</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-4 pb-14">
        <JourneyProgressBar
          steps={REFI_STEPS}
          currentStep={step}
          onStepClick={(i) => setStep(i)}
          allowJump={true}
          className="mb-5 print:mb-3"
        />

        {/* Main section divider - like "YOUR POSITION" */}
        <div className="w-full rounded-lg bg-gradient-to-r from-blue-950 via-indigo-600 to-sky-400 px-4 py-2.5 mb-4 print:hidden">
          <span className="text-sm font-bold tracking-wider text-white uppercase">Today&apos;s focus</span>
        </div>

        <section className="mb-4 print:hidden">
          <div className="rounded-xl border-0 bg-gradient-to-r from-blue-950 via-indigo-600 to-sky-400 p-4 shadow-lg">
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
                onClick={() => setStep((s) => Math.min(REFI_STEPS.length - 1, s + 1))}
                className="inline-flex items-center gap-2 rounded-lg bg-white text-indigo-700 px-4 py-2 text-sm font-semibold hover:bg-white/90 transition"
              >
                Mark done & next
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setStep(REFI_STEPS.length - 1)}
                className="inline-flex items-center gap-2 rounded-lg border-2 border-white/60 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 transition"
              >
                Jump to action plan
              </button>
            </div>
          </div>
        </section>

        <AnimatePresence mode="wait">
          {/* Step 1: Current Situation */}
          {step === 0 && (
            <motion.section
              key="step0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="rounded-t-lg bg-slate-800 px-5 py-2.5">
                <span className="text-sm font-bold text-white">Current situation assessment</span>
              </div>
              <div className="flex items-center gap-3 mb-1 mt-2">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <Calculator className="h-5 w-5" strokeWidth={2} />
                </span>
                <h2 className="text-2xl font-bold text-gray-900">Current Situation Assessment</h2>
              </div>
              <p className="text-gray-600">
                Enter your current mortgage details so we can show personalized refinance options.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">
                    Current mortgage balance{' '}
                    <Tooltip content="The amount you still owe on your mortgage.">ⓘ</Tooltip>
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    min={1000}
                    step={1000}
                    value={formatNumberForInput(situation.mortgageBalance || '', 0)}
                    onChange={(e) =>
                      setSituation((s) => ({ ...s, mortgageBalance: parseFormattedNumber(e.target.value) || 0 }))
                    }
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Current interest rate (%)</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    min={0.1}
                    max={20}
                    step={0.125}
                    value={formatNumberForInput(situation.currentRate || '', 3)}
                    onChange={(e) =>
                      setSituation((s) => ({ ...s, currentRate: parseFormattedNumber(e.target.value) || 0 }))
                    }
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Monthly payment (P&I)</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    min={1}
                    step={50}
                    value={formatNumberForInput(situation.monthlyPayment || '', 0)}
                    onChange={(e) =>
                      setSituation((s) => ({ ...s, monthlyPayment: parseFormattedNumber(e.target.value) || 0 }))
                    }
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Years remaining on loan</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    min={1}
                    max={30}
                    value={formatNumberForInput(situation.yearsRemaining || '', 0)}
                    onChange={(e) =>
                      setSituation((s) => ({ ...s, yearsRemaining: parseFormattedNumber(e.target.value) || 0 }))
                    }
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-sm font-medium text-gray-700">Home value estimate</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    min={10000}
                    step={5000}
                    value={formatNumberForInput(situation.homeValue || '', 0)}
                    onChange={(e) =>
                      setSituation((s) => ({ ...s, homeValue: parseFormattedNumber(e.target.value) || 0 }))
                    }
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-sm font-medium text-gray-700">Credit score range</span>
                  <select
                    value={situation.creditScore}
                    onChange={(e) =>
                      setSituation((s) => ({
                        ...s,
                        creditScore: e.target.value as RefiCurrentSituation['creditScore'],
                      }))
                    }
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    {CREDIT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="rounded-lg overflow-hidden border border-gray-200">
                <div className="rounded-t-lg bg-slate-800 px-4 py-2.5">
                  <span className="text-sm font-bold text-white">Current loan snapshot</span>
                </div>
              <div className="rounded-b-lg border-2 border-t-0 border-sky-200/60 bg-gradient-to-br from-sky-50/80 to-blue-50/50 p-5 shadow-sm ring-1 ring-sky-100/50">
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/20 text-sky-600">
                    <DollarSign className="h-4 w-4" strokeWidth={2.5} />
                  </span>
                  <h3 className="font-semibold text-gray-900">Summary</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Balance</p>
                    <p className="font-semibold text-gray-900">{formatCurrency(situation.mortgageBalance)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Rate</p>
                    <p className="font-semibold text-gray-900">{situation.currentRate}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Monthly P&I</p>
                    <p className="font-semibold text-gray-900">{formatCurrency(situation.monthlyPayment)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Equity</p>
                    <p className="font-semibold text-green-700">{formatCurrency(equity)}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  LTV: {ltv.toFixed(0)}% (loan-to-value){' '}
                  <Tooltip content="Loan balance divided by home value. Lenders use this for rate and PMI.">
                    <HelpCircle className="inline h-4 w-4 text-gray-400" />
                  </Tooltip>
                </p>
              </div>
              </div>
            </motion.section>
          )}

          {/* Step 2: Refinance Goals */}
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
                <span className="text-sm font-bold text-white">Refinance goals</span>
              </div>
              <div className="flex items-center gap-3 mb-1 mt-2">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                  <Target className="h-5 w-5" strokeWidth={2} />
                </span>
                <h2 className="text-2xl font-bold text-gray-900">Refinance Goals</h2>
              </div>
              <p className="text-gray-600">Select all that apply. We'll tailor scenarios to your goals.</p>

              <div className="grid sm:grid-cols-2 gap-4">
                {GOAL_OPTIONS.map((opt) => {
                  const selected = goals.find((g) => g.id === opt.id)?.selected ?? false
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggleGoal(opt.id)}
                      className={`
                        flex items-start gap-4 rounded-xl border-2 p-4 text-left transition
                        ${selected ? 'border-indigo-400 bg-indigo-50/80 ring-2 ring-indigo-200/50 shadow-sm' : 'border-gray-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/30'}
                      `}
                    >
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${selected ? 'bg-indigo-200/80 text-indigo-700' : 'bg-indigo-100/70 text-indigo-600'}`}>
                        {opt.icon}
                      </span>
                      <div>
                        <p className="font-semibold text-gray-900">{opt.label}</p>
                        <p className="text-sm text-gray-600">{opt.benefit}</p>
                      </div>
                      <span
                        className={`ml-auto h-6 w-6 shrink-0 rounded-full border-2 flex items-center justify-center ${
                          selected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-300'
                        }`}
                      >
                        {selected && <span className="text-xs">✓</span>}
                      </span>
                    </button>
                  )
                })}
              </div>
            </motion.section>
          )}

          {/* Step 3: Rate Scenarios */}
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
                <span className="text-sm font-bold text-white">Personalized rate scenarios</span>
              </div>
              <div className="flex items-center gap-3 mb-1 mt-2">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                  <BarChart3 className="h-5 w-5" strokeWidth={2} />
                </span>
                <h2 className="text-2xl font-bold text-gray-900">Personalized Rate Scenarios</h2>
              </div>
              <p className="text-gray-600">
                Three options based on your situation. Compare and choose what fits best.
              </p>

              <div className="grid sm:grid-cols-3 gap-4">
                {scenarios.map((sc, idx) => {
                  const accents = [
                    'border-l-4 border-l-emerald-500 bg-emerald-50/40',
                    'border-l-4 border-l-sky-500 bg-sky-50/40',
                    'border-l-4 border-l-indigo-500 bg-indigo-50/40',
                  ][idx] ?? 'border-l-4 border-l-slate-400 bg-slate-50/40'
                  return (
                  <div
                    key={sc.id}
                    className={`rounded-xl border-2 border-gray-200 p-4 shadow-sm transition hover:shadow-md ${accents}`}
                  >
                    <h3 className="font-semibold text-gray-900 mb-3">{sc.label}</h3>
                    <ul className="space-y-2 text-sm">
                      <li>
                        <span className="text-gray-500">New rate:</span>{' '}
                        <span className="font-medium">{sc.newRate.toFixed(2)}%</span>
                      </li>
                      <li>
                        <span className="text-gray-500">New payment:</span>{' '}
                        <span className="font-medium">{formatCurrency(sc.newMonthlyPayment)}/mo</span>
                      </li>
                      <li>
                        <span className="text-gray-500">Term:</span>{' '}
                        <span className="font-medium">{sc.loanTermYears} years</span>
                      </li>
                      <li>
                        <span className="text-gray-500">Closing costs (est.):</span>{' '}
                        <span className="font-medium">{formatCurrency(sc.closingCostsEstimate)}</span>
                      </li>
                      <li>
                        <span className="text-gray-500">Break-even:</span>{' '}
                        <span className="font-medium text-amber-600">
                          {sc.breakEvenMonths === Infinity ? 'N/A' : `${sc.breakEvenMonths} months`}
                        </span>
                      </li>
                    </ul>
                    {sc.monthlySavings > 0 && (
                      <p className="mt-3 text-sm font-medium text-green-600">
                        Save {formatCurrency(sc.monthlySavings)}/mo
                      </p>
                    )}
                  </div>
                  )
                })}
              </div>

              <ComparisonTable
                title="Current vs. New (Best Rate)"
                currentLabel="Current"
                newLabel="New"
                rows={[
                  { label: 'Interest rate', current: `${situation.currentRate}%`, new: `${bestScenario?.newRate.toFixed(2)}%`, highlight: 'savings' },
                  { label: 'Monthly payment', current: formatCurrency(situation.monthlyPayment), new: formatCurrency(bestScenario?.newMonthlyPayment ?? 0), highlight: 'savings' },
                  { label: 'Loan term', current: `${situation.yearsRemaining} years`, new: `${bestScenario?.loanTermYears} years` },
                  { label: 'Closing costs', current: '—', new: formatCurrency(closingCosts) },
                  { label: 'Break-even', current: '—', new: bestScenario?.breakEvenMonths === Infinity ? 'N/A' : `${bestScenario?.breakEvenMonths} months`, highlight: 'neutral' },
                ]}
              />
            </motion.section>
          )}

          {/* Step 4: Savings & Insights */}
          {step === 3 && (
            <motion.section
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Main section divider - "YOUR POSITION" style */}
              <div className="w-full rounded-lg bg-gradient-to-r from-blue-950 via-indigo-600 to-sky-400 px-4 py-2.5 mb-4">
                <span className="text-sm font-bold tracking-wider text-white uppercase">Your position</span>
              </div>
              <div className="flex items-center gap-3 mb-1">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <Sparkles className="h-5 w-5" strokeWidth={2} />
                </span>
                <h2 className="text-2xl font-bold text-gray-900">Should you refinance now?</h2>
              </div>
              <div className="rounded-lg overflow-hidden border border-gray-200 shadow-lg">
                <div className="rounded-t-lg bg-slate-800 px-5 py-2.5">
                  <span className="text-sm font-bold text-white">Decision snapshot</span>
                </div>
                <div className="rounded-2xl rounded-t-none border-2 border-t-0 border-sky-200/50 bg-gradient-to-br from-sky-50/80 via-white to-indigo-50/50 p-5 sm:p-6 shadow-sky-100/30">
                <div className="relative mb-4 -mx-5 -mt-2 sm:-mx-6 h-32 sm:h-40">
                  <img
                    src="https://images.unsplash.com/photo-1560185127-6a1896b4d133?w=800&q=80"
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 via-transparent to-transparent" />
                </div>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-blue-900">Decision snapshot</p>
                    <h3 className="mt-1 text-xl font-semibold text-gray-900">{outcomeHeadline}</h3>
                    <p className="mt-2 text-sm text-gray-700">{primaryRecommendation}</p>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${decisionBadgeClasses}`}>
                    {decisionBadge}
                  </span>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border-2 border-emerald-300/50 bg-gradient-to-br from-emerald-50 to-teal-50/40 p-4 shadow-sm ring-1 ring-emerald-100/40">
                    <div className="flex items-center gap-2 mb-1">
                      <Wallet className="h-4 w-4 text-emerald-600" strokeWidth={2} />
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Estimated monthly impact</p>
                    </div>
                    <p className="mt-1 text-2xl font-bold text-gray-900">
                      {formatCurrency(snapshotScenario?.monthlySavings ?? 0)}
                    </p>
                    <p className="mt-1 text-sm text-gray-700">Principal and interest only.</p>
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
                      Better confidence comes from positive monthly savings and break-even within your timeline.
                    </p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href="/refinance-optimizer"
                    className="inline-flex items-center gap-2 rounded-lg bg-rose-500 px-5 py-3 text-white font-semibold hover:bg-rose-600 transition shadow-md shadow-rose-200/50"
                  >
                    Lock this rate
                  </Link>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-3 text-gray-700 font-medium hover:bg-gray-50 transition"
                  >
                    View action plan
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const subject = encodeURIComponent('My NestQuest refinance summary')
                      const body = encodeURIComponent(
                        'I saved my refinance summary from NestQuest and would like to review options.'
                      )
                      window.location.href = `mailto:?subject=${subject}&body=${body}`
                    }}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-3 text-gray-700 font-medium hover:bg-gray-50 transition"
                  >
                    <Mail className="h-5 w-5" />
                    Email summary
                  </button>
                </div>
                <p className="mt-3 text-sm text-gray-600">Compare terms in minutes with no commitment required.</p>
              </div>
              </div>

              <div className="rounded-lg overflow-hidden border border-gray-200 mt-4">
                <div className="rounded-t-lg bg-slate-800 px-4 py-2.5">
                  <span className="text-sm font-bold text-white">Choose snapshot scenario</span>
                </div>
              <div className="rounded-xl rounded-t-none border border-t-0 border-gray-200 bg-white p-4">
                <p className="text-sm font-semibold text-gray-900 mb-2 sr-only">Scenario options</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                  {scenarios.map((sc) => {
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
                            ? 'border-blue-500 bg-blue-50 text-blue-900'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-blue-200'
                        }`}
                      >
                        <p className="text-xs font-semibold uppercase tracking-wide">{tierLabel}</p>
                        <p className="text-sm font-semibold">{sc.label}</p>
                        <p className="text-xs">Rate {sc.newRate.toFixed(2)}% · {formatCurrency(sc.newMonthlyPayment)}/mo</p>
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
                    How many years do you expect to keep this loan?
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    min={1}
                    max={30}
                    value={formatNumberForInput(expectedHoldYears, 0)}
                    onChange={(e) => setExpectedHoldYears(Math.max(1, parseFormattedNumber(e.target.value) || 1))}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:max-w-xs"
                  />
                </label>
                <p className="mt-2 text-sm text-gray-600">
                  Hold-period fit:{' '}
                  {breakEvenMonths <= expectedHoldYears * 12
                    ? 'You are likely to pass break-even within your expected timeline.'
                    : 'You may not reach break-even before moving or refinancing again.'}
                </p>
              </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <SavingsCard
                    title="Estimated monthly impact"
                    value={formatCurrency(snapshotScenario?.monthlySavings ?? 0)}
                    subtitle={`P&I only. Confidence: ${formatCurrency(monthlyConfidenceLow)} to ${formatCurrency(monthlyConfidenceHigh)}/mo`}
                    variant={(snapshotScenario?.monthlySavings ?? 0) >= 0 ? 'savings' : 'alert'}
                  />
                </div>
                <div>
                  <SavingsCard
                    title="Break-even timeline"
                    value={
                      snapshotScenario?.breakEvenMonths === Infinity
                        ? 'N/A'
                        : `${snapshotScenario?.breakEvenMonths} months`
                    }
                    subtitle={`Confidence: ${breakEvenFastMonths === Infinity ? 'N/A' : `${breakEvenFastMonths}mo`} to ${breakEvenSlowMonths === Infinity ? 'N/A' : `${breakEvenSlowMonths}mo`}`}
                    variant="alert"
                  />
                </div>
                <div>
                  <SavingsCard
                    title={`${expectedHoldYears}-year net benefit`}
                    value={formatCurrency(holdPeriodNet)}
                    subtitle={`Confidence: ${formatCurrency(holdConfidenceLow)} to ${formatCurrency(holdConfidenceHigh)}`}
                    variant={holdPeriodNet >= 0 ? 'savings' : 'alert'}
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <Link
                  href="/refinance-optimizer"
                  className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-left text-blue-900 hover:bg-blue-100 transition"
                >
                  <p className="font-semibold">Continue with lender</p>
                  <p className="text-sm mt-1">Request a full quote and compare APR, fees, and points.</p>
                </Link>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="rounded-xl border border-gray-300 bg-white p-4 text-left text-gray-900 hover:bg-gray-50 transition"
                >
                  <p className="font-semibold">Review action plan</p>
                  <p className="text-sm mt-1">See the document checklist and refinance timeline.</p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const subject = encodeURIComponent('My NestQuest refinance summary')
                    const body = encodeURIComponent(
                      'I saved my refinance summary from NestQuest and would like to review options.'
                    )
                    window.location.href = `mailto:?subject=${subject}&body=${body}`
                  }}
                  className="rounded-xl border border-gray-300 bg-white p-4 text-left text-gray-900 hover:bg-gray-50 transition"
                >
                  <p className="font-semibold">Email summary</p>
                  <p className="text-sm mt-1">Share this snapshot with your co-borrower or advisor.</p>
                </button>
              </div>

              <details className="rounded-xl border border-gray-200 bg-white p-4">
                <summary className="cursor-pointer font-semibold text-gray-900">
                  View full analysis (sensitivity, assumptions, and detailed metrics)
                </summary>
                <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <SavingsCard
                    title="12-month net benefit"
                    value={formatCurrency(netSavings12Months)}
                    subtitle={`Confidence: ${formatCurrency(net12ConfidenceLow)} to ${formatCurrency(net12ConfidenceHigh)}`}
                    variant={netSavings12Months >= 0 ? 'savings' : 'alert'}
                  />
                  <SavingsCard
                    title="5-year net benefit"
                    value={formatCurrency(netSavings5Years)}
                    subtitle={`Confidence: ${formatCurrency(net5yConfidenceLow)} to ${formatCurrency(net5yConfidenceHigh)}`}
                    variant={netSavings5Years >= 0 ? 'savings' : 'alert'}
                  />
                  <SavingsCard
                    title="Lifetime interest savings"
                    value={formatCurrency(
                      lifetimeInterestSavings(
                        currentTotalInterest,
                        snapshotScenario?.totalInterestNew ?? 0,
                        closingCosts
                      )
                    )}
                    subtitle={`Confidence: ${formatCurrency(lifetimeSavingsLow)} to ${formatCurrency(lifetimeSavingsHigh)}`}
                    variant="savings"
                    tooltip="Estimated total interest you'd save over the life of the new loan vs. staying in your current loan, minus closing costs."
                  />
                  <SavingsCard
                    title="Equity available"
                    value={formatCurrency(equity)}
                    subtitle={`Confidence: ${formatCurrency(equityConfidenceLow)} to ${formatCurrency(equityConfidenceHigh)}`}
                    variant="neutral"
                    tooltip="Home value minus mortgage balance. Cash-out refi could tap a portion of this."
                  />
                </div>
                <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Rate sensitivity (low/base/high)</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    We stress-test your selected scenario with a 0.5% lower and higher rate.
                  </p>
                  <div className="grid sm:grid-cols-3 gap-3 text-sm">
                    <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                      <p className="font-semibold text-green-800">Lower rate</p>
                      <p className="text-green-900">Monthly impact: {formatCurrency(sensitivity.low.monthlySavings)}/mo</p>
                      <p className="text-green-900">Lifetime interest: {formatCurrency(sensitivity.low.totalInterest)}</p>
                    </div>
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                      <p className="font-semibold text-blue-800">Base case</p>
                      <p className="text-blue-900">Monthly impact: {formatCurrency(sensitivity.base.monthlySavings)}/mo</p>
                      <p className="text-blue-900">Lifetime interest: {formatCurrency(sensitivity.base.totalInterest)}</p>
                    </div>
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                      <p className="font-semibold text-amber-800">Higher rate</p>
                      <p className="text-amber-900">Monthly impact: {formatCurrency(sensitivity.high.monthlySavings)}/mo</p>
                      <p className="text-amber-900">Lifetime interest: {formatCurrency(sensitivity.high.totalInterest)}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Lifetime interest comparison</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: 'Current loan', interest: Math.round(currentTotalInterest), fill: '#94a3b8' },
                          ...scenarios.map((s) => ({
                            name: s.label,
                            interest: Math.round(s.totalInterestNew),
                            fill: s.id === 'best-rate' ? '#22c55e' : '#3b82f6',
                          })),
                        ]}
                        margin={{ top: 10, right: 10, left: 10, bottom: 30 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v / 1000}k`} />
                        <RechartsTooltip formatter={(v: number | undefined) => (v != null ? formatCurrency(v) : '')} />
                        <Bar dataKey="interest" name="Total interest" radius={[4, 4, 0, 0]}>
                          {[
                            { name: 'Current loan', fill: '#94a3b8' },
                            ...scenarios.map((s) => ({
                              name: s.label,
                              fill: s.id === 'best-rate' ? '#22c55e' : '#3b82f6',
                            })),
                          ].map((d, i) => (
                            <Cell key={i} fill={d.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Assumptions used in this snapshot</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    <li>Payment comparison is principal and interest only.</li>
                    <li>Closing costs use an estimate based on loan balance.</li>
                    <li>Rates shown are illustrative and not lender quotes.</li>
                    <li>No taxes, insurance, HOA, or escrow changes are included.</li>
                  </ul>
                </div>
                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50/50 p-4">
                  <h3 className="font-semibold text-amber-900 mb-2">Personalized insights</h3>
                  <ul className="space-y-2 text-sm text-amber-900">
                    {snapshotScenario && snapshotScenario.monthlySavings > 0 && (
                      <li>
                        You could save {formatCurrency(snapshotScenario.monthlySavings)} per month starting after closing.
                      </li>
                    )}
                    {snapshotScenario && (
                      <li>
                        For this selected scenario, you'd save approximately{' '}
                        {formatCurrency(
                          lifetimeInterestSavings(
                            currentTotalInterest,
                            snapshotScenario.totalInterestNew,
                            closingCosts
                          )
                        )}{' '}
                        over the life of the loan.
                      </li>
                    )}
                    <li>
                      If your final rate is 0.5% higher than estimated, your monthly savings could drop to about{' '}
                      {formatCurrency(sensitivity.high.monthlySavings)}/month.
                    </li>
                    <li>
                      If you plan to keep the loan for {expectedHoldYears} years, your projected net outcome is{' '}
                      {formatCurrency(holdPeriodNet)} after estimated closing costs.
                    </li>
                    <li>Your equity position: {formatCurrency(equity)} available.</li>
                  </ul>
                </div>
              </details>
            </motion.section>
          )}

          {/* Step 5: Action Plan */}
          {step === 4 && (
            <motion.section
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Main section divider */}
              <div className="w-full rounded-lg bg-gradient-to-r from-blue-950 via-indigo-600 to-sky-400 px-4 py-2.5 mb-4">
                <span className="text-sm font-bold tracking-wider text-white uppercase">Action plan</span>
              </div>
              <div className="flex items-center gap-3 mb-1">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                  <KeyRound className="h-5 w-5" strokeWidth={2} />
                </span>
                <h2 className="text-2xl font-bold text-gray-900">Coordinated Action Plan</h2>
              </div>

              <TimelineVisualization
                title="Refinance timeline"
                milestones={[
                  { id: 'app', label: 'Application', sublabel: 'Submit application & documents', completed: false },
                  { id: 'approval', label: 'Approval', sublabel: 'Underwriting & conditional approval', completed: false },
                  { id: 'close', label: 'Closing', sublabel: 'Sign docs & fund new loan', completed: false },
                ]}
              />

              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Checklist to complete your refinance</h3>
                <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
                  <li>Pay stubs (last 30 days)</li>
                  <li>W-2s / tax returns (last 2 years)</li>
                  <li>Bank statements (last 2 months)</li>
                  <li>Photo ID</li>
                  <li>Current mortgage statement</li>
                  <li>Homeowners insurance declaration</li>
                </ul>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/refinance-optimizer"
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-white font-semibold hover:bg-blue-700 transition shadow-sm"
                >
                  Continue with lender
                </Link>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-3 text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  Review rate scenarios
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const subject = encodeURIComponent('My NestQuest refinance summary')
                    const body = encodeURIComponent('I saved my refinance summary from NestQuest and would like to review options.')
                    window.location.href = `mailto:?subject=${subject}&body=${body}`
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-3 text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  <Mail className="h-5 w-5" />
                  Email summary
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-3 text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  <Download className="h-5 w-5" />
                  Save & share summary
                </button>
              </div>

              <p className="text-sm text-gray-500">
                Your journey is auto-saved. Return anytime or share your summary PDF to keep everyone aligned.
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
          {step < REFI_STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-white font-semibold hover:bg-blue-700 transition"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2 text-white font-semibold hover:bg-green-700 transition"
            >
              Done
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </nav>
      </main>
    </div>
  )
}

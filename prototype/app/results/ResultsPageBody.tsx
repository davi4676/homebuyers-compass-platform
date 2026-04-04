'use client'

import { useContext, useEffect, useState } from 'react'
import FirstGenHub from '@/components/results/FirstGenHub'
import SoloAdvocateChecklist from '@/components/results/SoloAdvocateChecklist'
import { SavingsOpportunitiesHeadline } from '@/components/results/SavingsOpportunitiesHeadline'
import GlossaryTooltip from '@/components/GlossaryTooltip'
import { usePlainEnglish } from '@/lib/hooks/usePlainEnglish'
import { applyPlainEnglishCopy } from '@/lib/plain-english'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, DollarSign, Target,
  AlertTriangle, CheckCircle, ChevronRight, ChevronDown, Lightbulb, ShieldCheck,
  BarChart2, Clock, Star, X, TrendingUp, Zap, Bell
} from 'lucide-react'
import { ResultsPageStateContext } from './ResultsPageStateContext'
import { formatCurrency } from '@/lib/calculations'
import { calculateMonthlyPayment } from '@/lib/calculations'
import { TIER_DEFINITIONS, type UserTier } from '@/lib/tiers'
import TierPreviewSwitcher from '@/components/TierPreviewSwitcher'
import { trackActivity } from '@/lib/track-activity'
import { useExperiment } from '@/lib/hooks/useExperiment'
import { getCachedFreddieMacRates } from '@/lib/freddie-mac-rates'
import { formatNumberForInput, parseFormattedNumber } from '@/lib/number-format'
import { JOURNEY_PHASES_DATA } from '@/lib/journey-phases-data'
import ResultsAchievementBadgesRow from '@/components/results/ResultsAchievementBadgesRow'

// Difficulty badge colours
const difficultyColor: Record<string, string> = {
  easy: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  hard: 'bg-rose-100 text-rose-700',
}

// Readiness score ring colour
function readinessColor(score: number) {
  if (score >= 75) return '#22c55e'
  if (score >= 50) return '#f59e0b'
  return '#ef4444'
}
function eduScoreColor(score: number) {
  if (score >= 80) return '#22c55e'
  if (score >= 60) return '#f59e0b'
  return '#ef4444'
}
function tileChartColor(ok: boolean, warn: boolean) {
  if (ok) return '#22c55e'
  if (warn) return '#f59e0b'
  return '#ef4444'
}
function tileTrackColor(ok: boolean, warn: boolean) {
  if (ok) return '#bbf7d0'
  if (warn) return '#fde68a'
  return '#fecaca'
}

const HALF_DONUT_ARC = 144.5
function HalfDonut({ pct, color, trackColor = '#e2e8f0', size = 32 }: { pct: number; color: string; trackColor?: string; size?: number }) {
  const strokeW = 10
  const clamped = Math.max(0, Math.min(100, pct))
  const dash = (clamped / 100) * HALF_DONUT_ARC
  const aspect = 120 / 66
  return (
    <svg viewBox="0 0 120 66" width={size} height={size / aspect} className="shrink-0" preserveAspectRatio="xMidYMid meet">
      <path d="M 14 62 A 46 46 0 0 1 106 62" fill="none" stroke={trackColor} strokeWidth={strokeW} strokeLinecap="round" />
      <path d="M 14 62 A 46 46 0 0 1 106 62" fill="none" stroke={color} strokeWidth={strokeW} strokeLinecap="round" strokeDasharray={`${dash} ${HALF_DONUT_ARC}`} strokeDashoffset={0} />
    </svg>
  )
}

// ── Educational preparedness quiz ────────────────────────────────────────
const EDU_QUIZ = [
  {
    q: 'What does DTI (Debt-to-Income ratio) measure?',
    options: [
      'The interest rate on your loan',
      'How much of your monthly income goes to all debt payments',
      'Your down payment as a % of home price',
      'Your credit utilization rate',
    ],
    correct: 1,
    explain: 'DTI is the share of your gross monthly income that goes to all debt payments. Lenders use it to decide how much mortgage you can safely carry.',
  },
  {
    q: 'Which step typically comes BEFORE making an offer on a home?',
    options: [
      'Home inspection',
      'Final walkthrough',
      'Getting a mortgage pre-approval',
      'Title search',
    ],
    correct: 2,
    explain: 'A pre-approval letter tells sellers you can actually afford the home — it dramatically strengthens your offer in a competitive market.',
  },
  {
    q: 'PMI (Private Mortgage Insurance) is required when:',
    options: [
      'Your credit score is below 620',
      'Your down payment is less than 20% of the purchase price',
      'You own more than one property',
      'Your DTI exceeds 43%',
    ],
    correct: 1,
    explain: 'PMI protects the lender — not you — when you put down less than 20%. It typically adds $50–$200/month and can be removed once you reach 20% equity.',
  },
  {
    q: '"Cash to close" includes:',
    options: [
      'Just your down payment',
      'Only lender origination fees',
      'Down payment + closing costs + prepaid items (escrow, insurance)',
      'First month\'s mortgage payment only',
    ],
    correct: 2,
    explain: 'Cash to close is the full amount you bring to the closing table: down payment, lender fees, title costs, prepaid homeowners insurance, and initial escrow.',
  },
  {
    q: 'What is an earnest money deposit?',
    options: [
      'A fee paid to your real estate agent at closing',
      'A good-faith payment made when your offer is accepted',
      'The first mortgage payment due at closing',
      'A non-refundable application fee paid to the lender',
    ],
    correct: 1,
    explain: 'Earnest money (typically 1–3% of price) signals you\'re serious. It counts toward your down payment or closing costs — and can be at risk if you back out without a contingency.',
  },
] as const

const ICP_RESULT_HEADLINES: Record<string, string> = {
  'first-time': "Here's Your First-Time Buyer Savings Plan",
  'first-gen': "You're Making History — Here's What We Found For You",
  solo: 'Your Solo Buyer Action Plan',
  'move-up': 'Your Move-Up Strategy & Equity Analysis',
}

function normalizeIcpKey(raw: string): keyof typeof ICP_RESULT_HEADLINES | '' {
  const p = raw.trim().toLowerCase().replace(/_/g, '-')
  if (p === 'first-gen' || p === 'firstgen') return 'first-gen'
  if (p === 'solo') return 'solo'
  if (p === 'move-up' || p === 'moveup') return 'move-up'
  if (p === 'first-time' || p === 'firsttime') return 'first-time'
  return ''
}

export default function ResultsPageBody() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const icpParam = searchParams.get('type') || searchParams.get('icpType') || ''
  const [quizIcpHint, setQuizIcpHint] = useState('')
  const plainEnglish = usePlainEnglish()
  const [showFullBreakdown, setShowFullBreakdown] = useState(false)
  const [showTuner, setShowTuner] = useState(false)
  // Educational preparedness quiz state
  const [eduStep, setEduStep] = useState<number>(0) // 0=idle, 1-5=question, 6=done
  const [eduAnswers, setEduAnswers] = useState<Record<number, boolean>>({})
  const [eduSelected, setEduSelected] = useState<number | null>(null) // answer index chosen this step
  const [decisionExplanation, setDecisionExplanation] = useState<{
    title: string
    summary: string
    bullets: string[]
  } | null>(null)
  const [showAllSavingsOpportunities, setShowAllSavingsOpportunities] = useState(false)
  const resultsExperiment = useExperiment('results_layout_v2')
  const state = useContext(ResultsPageStateContext)

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem('quizData')
      if (raw) {
        const q = JSON.parse(raw) as { icpType?: string; type?: string }
        setQuizIcpHint(String(q.icpType || q.type || ''))
      }
    } catch {
      /* ignore */
    }
  }, [])

  const effectiveIcpKey = normalizeIcpKey(icpParam || quizIcpHint)
  if (!state) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-lg text-slate-600">Loading…</p>
      </div>
    )
  }

  const results = state.results as Record<string, unknown> | null
  const user = state.user as { firstName?: string } | null | undefined
  const userTier = ((state.userTier as UserTier) || 'foundations') as UserTier
  const previewTier = ((state.previewTier as UserTier) || 'foundations') as UserTier
  const setPreviewTier = state.setPreviewTier as (t: UserTier) => void

  const hasResults = results && typeof results === 'object' && results.type && (results.type as string) !== 'error'
  const resType = hasResults ? (results!.type as string) : null
  const resolvedJourneyType: 'first-time' | 'repeat-buyer' | 'refinance' =
    resType === 'repeat-buyer' || resType === 'refinance' ? resType : 'first-time'
  const journeyHomeHrefByType: Record<'first-time' | 'repeat-buyer' | 'refinance', string> = {
    'first-time': '/customized-journey',
    'repeat-buyer': '/customized-journey',
    'refinance': '/homebuyer/refinance-journey',
  }

  // First-time metrics
  const affordability = hasResults && resType === 'first-time' ? (results!.affordability as Record<string, unknown>) : null
  const costBreakdown = hasResults && resType === 'first-time' ? (results!.costBreakdown as Record<string, unknown>) : null
  const readinessScore = hasResults && resType === 'first-time' ? (results!.readinessScore as { total?: number }) : null
  const savingsOpportunities = hasResults && resType === 'first-time' ? (results!.savingsOpportunities as unknown[]) : null
  const closingCosts = costBreakdown?.closingCosts as { total?: number; lenderFees?: { total?: number }; titleAndSettlement?: { total?: number }; governmentFees?: { total?: number }; prepaidCosts?: { total?: number } } | undefined
  const lifetimeCosts = costBreakdown?.lifetimeCosts as { totalInterest?: number } | undefined
  const monthlyPayment = costBreakdown?.monthlyPayment as {
    total?: number; principalAndInterest?: number; propertyTaxes?: number;
    homeownersInsurance?: number; pmi?: number
  } | undefined

  const firstName = user?.firstName ? String(user.firstName) : null
  const maxApproved = affordability?.maxApproved != null ? Number(affordability.maxApproved) : null
  const realisticMax = affordability?.realisticMax != null ? Number(affordability.realisticMax) : null
  const overpayGap = maxApproved != null && realisticMax != null ? maxApproved - realisticMax : null
  const readiness = readinessScore?.total != null ? Number(readinessScore.total) : null
  type SavingsOppRow = {
    title?: string
    description?: string
    savingsMin?: number
    savingsMax?: number
    difficulty?: string
    category?: string
  }
  const savingsList: SavingsOppRow[] = Array.isArray(savingsOpportunities)
    ? (savingsOpportunities as SavingsOppRow[])
    : []
  const totalSavings = savingsList.reduce(
    (sum, opp) => sum + Number(opp.savingsMax || opp.savingsMin || 0),
    0
  )
  const tierSavingsLimit = TIER_DEFINITIONS[userTier]?.features.hosa.savingsOpportunities ?? 0
  const visibleSavings = Number.isFinite(tierSavingsLimit)
    ? savingsList.slice(0, Math.max(0, tierSavingsLimit))
    : savingsList
  const hasSavingsDetailsAccess = visibleSavings.length > 0
  const lockedSavingsCount = Math.max(0, savingsList.length - visibleSavings.length)

  useEffect(() => {
    if (resultsExperiment.isReady) {
      resultsExperiment.track('results_body_viewed')
    }
  }, [resultsExperiment.isReady, resultsExperiment.variant])

  const quizData = hasResults && resType === 'first-time' ? (results!.quizData as Record<string, unknown>) : null
  const assumedMortgageRatePct = affordability?.interestRate != null ? Number(affordability.interestRate) * 100 : null
  const [latestAverageMortgageRatePct, setLatestAverageMortgageRatePct] = useState<number | null>(null)
  const [latestAverageMortgageRateAsOf, setLatestAverageMortgageRateAsOf] = useState<string | null>(null)
  const [latestAverageMortgageRateSource, setLatestAverageMortgageRateSource] = useState<'freddie-mac-pmms' | 'fallback' | null>(null)
  const creditScoreBand = quizData?.creditScore != null ? String(quizData.creditScore) : 'your profile'
  useEffect(() => {
    let active = true
    getCachedFreddieMacRates()
      .then((rates) => {
        if (!active) return
        setLatestAverageMortgageRatePct(rates.rate30Year * 100)
        setLatestAverageMortgageRateAsOf(rates.date)
        setLatestAverageMortgageRateSource(rates.source)
      })
      .catch(() => {
        if (!active) return
        setLatestAverageMortgageRatePct(null)
        setLatestAverageMortgageRateAsOf(null)
        setLatestAverageMortgageRateSource(null)
      })
    return () => {
      active = false
    }
  }, [])

  // Load / save educational quiz from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('hc_edu_quiz_v1')
      if (saved) {
        const parsed = JSON.parse(saved) as { step: number; answers: Record<number, boolean> }
        if (parsed.step >= 6 && parsed.answers) {
          setEduStep(parsed.step)
          setEduAnswers(parsed.answers)
        }
      }
    } catch { /* ignore */ }
  }, [])
  useEffect(() => {
    if (eduStep >= 6) {
      try {
        localStorage.setItem('hc_edu_quiz_v1', JSON.stringify({ step: eduStep, answers: eduAnswers }))
      } catch { /* ignore */ }
    }
  }, [eduStep, eduAnswers])

  const repeatBuyerAnalysis =
    hasResults && resType === 'repeat-buyer' ? (results!.analysis as Record<string, unknown>) : null
  const refinanceAnalysis =
    hasResults && resType === 'refinance' ? (results!.analysis as Record<string, unknown>) : null
  const repeatBuyerData =
    hasResults && resType === 'repeat-buyer' ? (results!.data as Record<string, unknown>) : null
  const refinanceData =
    hasResults && resType === 'refinance' ? (results!.data as Record<string, unknown>) : null

  const repeatSaleProceeds = (repeatBuyerAnalysis?.saleProceeds as Record<string, unknown> | undefined) ?? null
  const repeatNewPurchase = (repeatBuyerAnalysis?.newPurchase as Record<string, unknown> | undefined) ?? null
  const repeatComparison = (repeatBuyerAnalysis?.comparison as Record<string, unknown> | undefined) ?? null
  const repeatTiming = (repeatBuyerAnalysis?.timing as Record<string, unknown> | undefined) ?? null
  const repeatNetProceeds = Number(repeatSaleProceeds?.netProceeds ?? 0)
  const repeatDownPaymentPower = Number(repeatNewPurchase?.totalDownPayment ?? 0)
  const repeatCashFlowChange = Number(repeatComparison?.cashFlowChange ?? 0)
  const repeatTargetPrice = Number(
    ((repeatComparison?.newHome as Record<string, unknown> | undefined)?.targetPrice as number | undefined) ?? 0
  )

  const refiBreakEven = (refinanceAnalysis?.breakEvenAnalysis as Record<string, unknown> | undefined) ?? null
  const refiLifetime = (refinanceAnalysis?.lifetimeAnalysis as Record<string, unknown> | undefined) ?? null
  const refiRecommendation = (refinanceAnalysis?.recommendation as Record<string, unknown> | undefined) ?? null
  const refiCurrent = (refinanceAnalysis?.currentSituation as Record<string, unknown> | undefined) ?? null
  const refiMonthlySavings = Number(refiBreakEven?.monthlySavings ?? 0)
  const refiBreakEvenMonths = Number(refiBreakEven?.breakEvenMonths ?? 0)
  const refiNetSavings = Number(refiLifetime?.netSavings ?? 0)
  const refiCurrentPayment = Number(refiCurrent?.monthlyPayment ?? refinanceData?.currentMonthlyPayment ?? 0)
  const refiNewPayment = refiCurrentPayment - refiMonthlySavings
  const repeatTimingRisk = String(repeatTiming?.riskLevel ?? 'medium')
  const repeatDecision = (() => {
    if (repeatNetProceeds <= 0 || (repeatCashFlowChange > 400 && repeatTimingRisk === 'high')) {
      return {
        label: 'Not yet',
        reason: 'Numbers look tight right now. Improve proceeds, lower target price, or reduce payment risk first.',
        classes: 'bg-rose-100 text-rose-700 border-rose-200',
      }
    }
    if (repeatTimingRisk === 'high' || repeatCashFlowChange > 150) {
      return {
        label: 'Proceed with caution',
        reason: 'Plan is workable, but timing or payment risk is elevated. Add buffer before committing.',
        classes: 'bg-amber-100 text-amber-700 border-amber-200',
      }
    }
    return {
      label: 'Looks strong',
      reason: 'Proceeds and payment impact look manageable with current assumptions.',
      classes: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    }
  })()
  const refiDecision = (() => {
    if (refiMonthlySavings <= 0 || !Number.isFinite(refiBreakEvenMonths) || refiNetSavings <= 0) {
      return {
        label: 'Not yet',
        reason: 'Current terms do not show clear financial benefit after costs.',
        classes: 'bg-rose-100 text-rose-700 border-rose-200',
      }
    }
    if (refiBreakEvenMonths > 24) {
      return {
        label: 'Proceed with caution',
        reason: 'Savings are positive, but payoff takes longer. Confirm your hold timeline.',
        classes: 'bg-amber-100 text-amber-700 border-amber-200',
      }
    }
    return {
      label: 'Looks strong',
      reason: 'Savings and break-even timeline suggest refinancing is likely worthwhile.',
      classes: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    }
  })()
  const refiConfidencePercent =
    refiDecision.label === 'Looks strong' ? 85 : refiDecision.label === 'Proceed with caution' ? 55 : 25
  const refiConfidenceBarClass =
    refiDecision.label === 'Looks strong'
      ? 'bg-emerald-500'
      : refiDecision.label === 'Proceed with caution'
        ? 'bg-amber-500'
        : 'bg-rose-500'
  const topIntroByType: Record<'first-time' | 'repeat-buyer' | 'refinance', string> = {
    'first-time': '', // First-time uses roadmap banner instead
    'repeat-buyer': 'Here is your buy-and-sell snapshot with the fastest next steps to reduce risk.',
    'refinance': 'Here is your refinance snapshot focused on monthly impact, break-even, and total payoff.',
  }

  // Phase completion from customized-journey localStorage
  const [phasesComplete, setPhasesComplete] = useState({ completed: 0, total: JOURNEY_PHASES_DATA.length })
  useEffect(() => {
    try {
      const saved = JSON.parse(typeof window !== 'undefined' ? (window.localStorage.getItem('phaseStatus') || '{}') : '{}') as Record<string, string>
      const completed = JOURNEY_PHASES_DATA.filter((p) => saved[p.id] === 'complete').length
      setPhasesComplete({ completed, total: JOURNEY_PHASES_DATA.length })
    } catch {
      setPhasesComplete({ completed: 0, total: JOURNEY_PHASES_DATA.length })
    }
  }, [])

  const assumptionDefaults = {
    ratePct: affordability?.interestRate != null ? Number(affordability.interestRate) * 100 : 6.75,
    taxPct: 1.2,
    insuranceAnnual: monthlyPayment?.homeownersInsurance != null
      ? Number(monthlyPayment.homeownersInsurance) * 12
      : 1800,
    hoaMonthly: 0,
    pmiMonthly: monthlyPayment?.pmi != null ? Number(monthlyPayment.pmi) : 0,
    maintenancePct: 1.0,
  }
  const [assumptionOverrides, setAssumptionOverrides] = useState<{
    ratePct: number | null
    taxPct: number | null
    insuranceAnnual: number | null
    hoaMonthly: number | null
    pmiMonthly: number | null
    maintenancePct: number | null
  }>({
    ratePct: null,
    taxPct: null,
    insuranceAnnual: null,
    hoaMonthly: null,
    pmiMonthly: null,
    maintenancePct: null,
  })
  const assumptionValues = {
    ratePct: assumptionOverrides.ratePct ?? assumptionDefaults.ratePct,
    taxPct: assumptionOverrides.taxPct ?? assumptionDefaults.taxPct,
    insuranceAnnual: assumptionOverrides.insuranceAnnual ?? assumptionDefaults.insuranceAnnual,
    hoaMonthly: assumptionOverrides.hoaMonthly ?? assumptionDefaults.hoaMonthly,
    pmiMonthly: assumptionOverrides.pmiMonthly ?? assumptionDefaults.pmiMonthly,
    maintenancePct: assumptionOverrides.maintenancePct ?? assumptionDefaults.maintenancePct,
  }

  const scenarioHomePrice = realisticMax ?? maxApproved
  const comfortableMaxText = realisticMax != null ? formatCurrency(realisticMax) : 'Not available'
  const defaultScenarioDownPayment = quizData?.downPayment != null ? Number(quizData.downPayment) : 0
  // Prefer user's stated target price over income-derived max as the default scenario
  const quizTargetHomePrice = quizData?.targetHomePrice != null ? Number(quizData.targetHomePrice) : null
  const defaultScenarioLoanAmount = quizTargetHomePrice != null
    ? Math.max(0, quizTargetHomePrice - defaultScenarioDownPayment)
    : scenarioHomePrice != null
      ? Math.max(0, scenarioHomePrice - defaultScenarioDownPayment)
      : 0
  const [loanAmountInput, setLoanAmountInput] = useState<string>('')
  const [hasEditedLoanAmount, setHasEditedLoanAmount] = useState(false)
  const [downPaymentInput, setDownPaymentInput] = useState<string>('')
  const [hasEditedDownPayment, setHasEditedDownPayment] = useState(false)
  const parseOrEmpty = (raw: string): string => (raw.trim() === '' ? '' : String(parseFormattedNumber(raw)))
  useEffect(() => {
    if (resType === 'first-time' && !hasEditedLoanAmount) {
      setLoanAmountInput(String(Math.round(defaultScenarioLoanAmount)))
    }
  }, [resType, defaultScenarioLoanAmount, hasEditedLoanAmount])
  useEffect(() => {
    if (resType === 'first-time' && !hasEditedDownPayment) {
      setDownPaymentInput(String(Math.round(defaultScenarioDownPayment)))
    }
  }, [resType, defaultScenarioDownPayment, hasEditedDownPayment])
  const scenarioLoanAmount = Math.max(0, Number(loanAmountInput) || 0)
  const scenarioDownPayment = Math.max(0, Number(downPaymentInput) || 0)
  const scenarioEstimatedHomePrice = scenarioLoanAmount + scenarioDownPayment
  const closingCostsTotal = Number(closingCosts?.total ?? 0)
  const targetCashAtClose = 0.2 * scenarioEstimatedHomePrice + closingCostsTotal
  const totalFundsCommitted = scenarioDownPayment + closingCostsTotal
  const cashAtCloseOk = totalFundsCommitted >= targetCashAtClose
  const cashAtCloseWarn = !cashAtCloseOk && totalFundsCommitted >= targetCashAtClose * 0.75
  const scenarioPrincipalAndInterest = scenarioLoanAmount > 0
    ? calculateMonthlyPayment(scenarioLoanAmount, assumptionValues.ratePct / 100, 30)
    : 0
  const scenarioTaxes = scenarioEstimatedHomePrice > 0
    ? (scenarioEstimatedHomePrice * (assumptionValues.taxPct / 100)) / 12
    : 0
  const scenarioInsurance = assumptionValues.insuranceAnnual / 12
  const scenarioMaintenance = scenarioEstimatedHomePrice > 0
    ? (scenarioEstimatedHomePrice * (assumptionValues.maintenancePct / 100)) / 12
    : 0
  const adjustedMonthlyScenario = scenarioPrincipalAndInterest +
    scenarioTaxes +
    scenarioInsurance +
    assumptionValues.pmiMonthly +
    assumptionValues.hoaMonthly +
    scenarioMaintenance
  const annualIncome = Number(quizData?.income ?? 0)
  const monthlyIncome = annualIncome > 0 ? annualIncome / 12 : 0
  const monthlyDebt = Number(quizData?.monthlyDebt ?? 0)
  const housingRatio = monthlyIncome > 0 ? adjustedMonthlyScenario / monthlyIncome : 0
  const dtiRatio = monthlyIncome > 0 ? (adjustedMonthlyScenario + monthlyDebt) / monthlyIncome : 0
  const loanToIncome = annualIncome > 0 ? scenarioLoanAmount / annualIncome : 0
  const ltvPercent = scenarioEstimatedHomePrice > 0 ? (scenarioLoanAmount / scenarioEstimatedHomePrice) * 100 : 0
  const ltvOk = ltvPercent > 0 && ltvPercent <= 80
  const ltvWarn = ltvPercent > 80 && ltvPercent <= 90
  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`
  const firstTimeDecision = (() => {
    if (scenarioLoanAmount <= 0 || monthlyIncome <= 0) {
      return {
        label: 'Needs adjustment',
        reason: 'Enter a valid loan amount and income to calculate a reliable recommendation.',
        classes: 'bg-rose-100 text-rose-700 border-rose-200',
      }
    }
    // Needs adjustment: exceeds FHA/conventional limits (housing 36%, DTI 43% — FHA max; Fannie/Freddie can go to 50% with AUS)
    if (housingRatio > 0.36 || dtiRatio > 0.43 || loanToIncome > 6) {
      return {
        label: 'Needs adjustment',
        reason: `This setup is likely stretched (housing ${formatPercent(housingRatio)}, DTI ${formatPercent(dtiRatio)}).`,
        classes: 'bg-rose-100 text-rose-700 border-rose-200',
      }
    }
    // Workable: within FHA limits (31/43) but above conventional ideal (28/36)
    if (housingRatio > 0.28 || dtiRatio > 0.36 || loanToIncome > 5) {
      return {
        label: 'Workable, but tighten budget',
        reason: `You can move forward if you reduce payment pressure or add cash buffer (housing ${formatPercent(housingRatio)}, DTI ${formatPercent(dtiRatio)}).`,
        classes: 'bg-amber-100 text-amber-700 border-amber-200',
      }
    }
    // Looks strong: within conventional ideal (28/36 housing/DTI, loan-to-income ≤5x)
    return {
      label: 'Looks strong',
      reason: `This profile looks resilient (housing ${formatPercent(housingRatio)}, DTI ${formatPercent(dtiRatio)}).`,
      classes: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    }
  })()
  const firstTimeDecisionReasonClass =
    firstTimeDecision.label === 'Looks strong'
      ? 'text-emerald-800'
      : firstTimeDecision.label === 'Workable, but tighten budget'
        ? 'text-amber-800'
        : 'text-rose-800'
  const stressPenalty =
    Math.max(0, (housingRatio - 0.28) * 180) +
    Math.max(0, (dtiRatio - 0.36) * 120) +
    Math.max(0, (loanToIncome - 4.2) * 8)
  const firstTimeConfidencePercent = Math.max(15, Math.min(95, Math.round((readiness ?? 60) - stressPenalty)))
  const firstTimeConfidenceBarClass =
    firstTimeConfidencePercent >= 75
      ? 'bg-emerald-500'
      : firstTimeConfidencePercent >= 50
        ? 'bg-amber-500'
        : 'bg-rose-500'
  const firstTimeConfidenceGuidance =
    firstTimeConfidencePercent >= 75
      ? 'On track: this is typically strong enough to move toward an offer.'
      : firstTimeConfidencePercent >= 50
        ? 'Close, but tighten payment or increase buffer before submitting offers.'
        : 'High risk zone. Reduce budget and rebuild cushion before taking next steps.'
  const monthlyReductionForHousing =
    monthlyIncome > 0 ? Math.max(0, adjustedMonthlyScenario - monthlyIncome * 0.28) : 0
  const monthlyReductionForDti =
    monthlyIncome > 0 ? Math.max(0, adjustedMonthlyScenario + monthlyDebt - monthlyIncome * 0.36) : 0
  const monthlyReductionNeeded = Math.max(monthlyReductionForHousing, monthlyReductionForDti)
  const exceedsLenderApprovedAmount = maxApproved != null && scenarioLoanAmount > maxApproved
  const paymentPerLoanDollar = scenarioLoanAmount > 0 ? scenarioPrincipalAndInterest / scenarioLoanAmount : 0
  const paymentPerHomePriceDollar =
    paymentPerLoanDollar + assumptionValues.taxPct / 100 / 12 + assumptionValues.maintenancePct / 100 / 12
  const suggestedLoanReduction =
    paymentPerHomePriceDollar > 0
      ? Math.max(0, Math.min(scenarioLoanAmount, Math.round(monthlyReductionNeeded / paymentPerHomePriceDollar / 500) * 500))
      : 0
  const suggestedDownIncrease =
    paymentPerLoanDollar > 0 ? Math.max(0, Math.round(monthlyReductionNeeded / paymentPerLoanDollar / 500) * 500) : 0
  const improvedMonthlyForTarget = Math.max(0, adjustedMonthlyScenario - monthlyReductionNeeded)
  const improvedHousingRatio = monthlyIncome > 0 ? improvedMonthlyForTarget / monthlyIncome : 0
  const improvedDtiRatio = monthlyIncome > 0 ? (improvedMonthlyForTarget + monthlyDebt) / monthlyIncome : 0
  const improvedStressPenalty =
    Math.max(0, (improvedHousingRatio - 0.28) * 180) +
    Math.max(0, (improvedDtiRatio - 0.36) * 120) +
    Math.max(0, (loanToIncome - 4.2) * 8)
  const improvedConfidenceEstimate = Math.max(15, Math.min(95, Math.round((readiness ?? 60) - improvedStressPenalty)))
  const confidenceLiftEstimate = Math.max(0, improvedConfidenceEstimate - firstTimeConfidencePercent)

  // ── Educational preparedness score ────────────────────────────────
  // Prefer score from main quiz if available; otherwise use in-page quiz
  const eduScoreFromMainQuiz = quizData?.eduScore != null ? Number(quizData.eduScore) : null
  const eduCorrectCount = Object.values(eduAnswers).filter(Boolean).length
  const eduScoreFromInPageQuiz = eduStep >= 6 ? Math.round((eduCorrectCount / EDU_QUIZ.length) * 100) : null
  const eduScore = eduScoreFromMainQuiz ?? eduScoreFromInPageQuiz
  const showInPageEducationQuiz = eduScoreFromMainQuiz == null
  const eduScoreGuidance =
    eduScore == null ? '' :
    eduScore >= 80 ? 'Strong foundation — you know the key concepts that help buyers avoid costly mistakes.' :
    eduScore >= 60 ? 'Good baseline — a few gaps to close before you\'re fully prepared.' :
    eduScore >= 40 ? 'Building knowledge — understanding these concepts will directly save you money.' :
    'Great time to start learning — most buyers learn these the hard way at closing.'

  const handleEduAnswer = (selectedIndex: number) => {
    if (eduSelected !== null) return // already answered this step
    const qIdx = eduStep - 1
    const isCorrect = selectedIndex === EDU_QUIZ[qIdx].correct
    setEduSelected(selectedIndex)
    setEduAnswers((prev) => ({ ...prev, [qIdx]: isCorrect }))
    setTimeout(() => {
      setEduSelected(null)
      setEduStep((s) => s + 1)
    }, 1600)
  }

  // ── Scenario 3 & 4 derived values ────────────────────────────────
  const estimatedMonthlyRent = Math.round(adjustedMonthlyScenario * 0.82)
  const principalPaydownYear1 = scenarioPrincipalAndInterest > 0 && scenarioLoanAmount > 0
    ? Math.max(0, scenarioPrincipalAndInterest * 12 - scenarioLoanAmount * (assumptionValues.ratePct / 100))
    : 0
  const appreciationInYear1 = scenarioEstimatedHomePrice > 0 ? Math.round(scenarioEstimatedHomePrice * 0.035) : 0
  const year1EquityBuilt = Math.round(principalPaydownYear1 + appreciationInYear1)
  const rateRiseMonthlyImpact = scenarioLoanAmount > 0
    ? Math.round(calculateMonthlyPayment(scenarioLoanAmount, (assumptionValues.ratePct + 0.5) / 100, 30) - scenarioPrincipalAndInterest)
    : 0
  const readinessUnder75 = readiness != null && (Number(readiness) < 75)
  const dtiGt43 = dtiRatio > 0.43
  const dtiGt36 = dtiRatio > 0.36
  const bufferLabel = dtiGt43 ? 'thin' : dtiGt36 ? 'moderate' : readinessUnder75 ? 'moderate' : 'healthy'

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-12 overflow-x-hidden min-w-0 text-lg">
      {/* Nav bar — aligned with Action Roadmap */}
      <div className="bg-white border border-slate-200 rounded-xl px-4 sm:px-6 py-3 mb-4 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-[rgb(var(--navy))] text-white border border-[rgb(var(--navy))] shadow-sm transition-all duration-200 ease-out">
          <span className="w-1.5 h-1.5 rounded-full bg-white/90" aria-hidden="true" />
          Savings Snapshot
        </span>
        <Link href="/inbox" className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold border transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 ${
          pathname === '/inbox'
            ? 'bg-[rgb(var(--navy))] text-white border-[rgb(var(--navy))] shadow-sm'
            : 'bg-white border-slate-200 text-[#1e293b] hover:border-slate-300 hover:bg-slate-50'
        }`}>
          <Bell className="w-4 h-4" />
          {pathname === '/inbox' && <span className="w-1.5 h-1.5 rounded-full bg-white/90" aria-hidden="true" />}
          Inbox
        </Link>
        <Link href="/customized-journey" className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold border transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 ${
          pathname === '/customized-journey'
            ? 'bg-[rgb(var(--navy))] text-white border-[rgb(var(--navy))] shadow-sm'
            : 'bg-white border-slate-200 text-[#1e293b] hover:border-slate-300 hover:bg-slate-50'
        }`}>
          {pathname === '/customized-journey' && <span className="w-1.5 h-1.5 rounded-full bg-white/90" aria-hidden="true" />}
          Action Roadmap
        </Link>
        <Link href="/resources" className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold border transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 ${
          pathname === '/resources'
            ? 'bg-[rgb(var(--navy))] text-white border-[rgb(var(--navy))] shadow-sm'
            : 'bg-white border-slate-200 text-[#1e293b] hover:border-slate-300 hover:bg-slate-50'
        }`}>
          {pathname === '/resources' && <span className="w-1.5 h-1.5 rounded-full bg-white/90" aria-hidden="true" />}
          Playbooks
        </Link>
      </div>

      <ResultsAchievementBadgesRow />

      {/* ═══════════════════════════════════════════════════════════════
          ABOVE FOLD: 3 core sections only
      ════════════════════════════════════════════════════════════════ */}

      {effectiveIcpKey && ICP_RESULT_HEADLINES[effectiveIcpKey] ? (
        <p className="mb-4 text-center text-xl font-bold text-brand-forest sm:text-2xl">
          {ICP_RESULT_HEADLINES[effectiveIcpKey]}
        </p>
      ) : null}

      {/* 1. Primary outcome */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        {topIntroByType[resolvedJourneyType] ? (
          <p className="text-base sm:text-lg text-[#475569] leading-relaxed max-w-3xl mb-4">
            {topIntroByType[resolvedJourneyType]}
          </p>
        ) : null}
        {resType === 'first-time' && totalSavings > 0 ? (
          <>
            {hasResults && resType === 'first-time' && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 rounded-2xl shadow-xl border border-gray-100 bg-white p-6 md:p-8"
            >
              <div className="mb-4 flex w-full items-center gap-2 rounded-xl bg-gradient-to-r from-brand-forest via-millennial-cta-primary to-teal-400 px-4 py-3 shadow-sm sm:py-3.5">
                <Lightbulb className="h-5 w-5 shrink-0 text-white/90" aria-hidden />
                <p className="text-base font-bold uppercase tracking-wide text-white">Protect your buying power now</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
                <div className="mb-2">
                  <SavingsOpportunitiesHeadline firstName={firstName} count={savingsList.length} totalDollars={totalSavings} />
                </div>

                <div className="mt-6 rounded-xl border border-amber-200/80 bg-amber-50/50 p-4 sm:p-6">
                  <h3 className="text-lg font-bold text-[#1e293b]">
                    {plainEnglish
                      ? 'Help with your down payment and closing costs'
                      : 'Down Payment & Closing Cost Assistance You Qualify For'}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {applyPlainEnglishCopy(
                      'Illustrative programs matched to your profile — always verify with the program administrator.',
                      plainEnglish
                    )}
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {[
                      { n: 'HFA First-Time Buyer', a: 12000 },
                      { n: 'Local Workforce Grant', a: 8500 },
                      { n: 'Closing Cost Assistance', a: 4500 },
                    ].map((prog, idx) => (
                      <div
                        key={prog.n}
                        className={`rounded-lg border border-slate-200 bg-white p-3 ${
                          userTier === 'foundations' && idx > 0 ? 'relative overflow-hidden blur-[3px]' : ''
                        }`}
                      >
                        <p className="font-semibold text-slate-900">{prog.n}</p>
                        <p className="mt-1 text-lg font-bold text-emerald-700">{formatCurrency(prog.a)}</p>
                        <p className="text-xs text-slate-500">Income &amp; occupancy rules apply</p>
                        <Link href="/down-payment-optimizer" className="mt-2 inline-block text-sm font-bold text-teal-700 hover:underline">
                          See How It Works
                        </Link>
                        {userTier === 'foundations' && idx > 0 ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/40">
                            <span className="rounded-full bg-slate-900/85 px-3 py-1 text-xs font-bold text-white">
                              Unlock — $29
                            </span>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-sm font-semibold text-slate-800">
                    Total potential assistance: {formatCurrency(25000)}
                  </p>
                </div>

                {effectiveIcpKey === 'first-gen' ? <FirstGenHub /> : null}
                {effectiveIcpKey === 'solo' ? (
                  <SoloAdvocateChecklist
                    neighborhoodPriority={
                      quizData?.soloNeighborhoodPriority != null
                        ? String(quizData.soloNeighborhoodPriority)
                        : null
                    }
                  />
                ) : null}

                <p className="mt-4 text-xs text-slate-500">
                  <span className="font-semibold text-slate-600">Key terms:</span>{' '}
                  <GlossaryTooltip term="DTI">DTI</GlossaryTooltip>
                  <span aria-hidden> · </span>
                  <GlossaryTooltip term="LTV">LTV</GlossaryTooltip>
                  <span aria-hidden> · </span>
                  <GlossaryTooltip term="PMI">PMI</GlossaryTooltip>
                  <span aria-hidden> · </span>
                  <GlossaryTooltip term="Escrow">Escrow</GlossaryTooltip>
                </p>

                {/* ── Educational quiz in progress (only when not completed in main quiz) ── */}
                {showInPageEducationQuiz && eduStep >= 1 && eduStep <= EDU_QUIZ.length && (
                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden">
                    <motion.div
                      key={`edu-q-${eduStep}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-4 pt-3 pb-4"
                    >
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                              Question {eduStep} of {EDU_QUIZ.length}
                            </p>
                            <div className="flex gap-1">
                              {EDU_QUIZ.map((_, i) => (
                                <span
                                  key={i}
                                  className={`inline-block h-1.5 w-4 rounded-full transition-all ${
                                    i < eduStep - 1 ? (eduAnswers[i] ? 'bg-emerald-500' : 'bg-rose-400') :
                                    i === eduStep - 1 ? 'bg-[rgb(var(--navy))]' : 'bg-slate-200'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm font-bold text-slate-800 mb-3 leading-snug">
                            {EDU_QUIZ[eduStep - 1].q}
                          </p>
                          <div className="space-y-1.5">
                            {EDU_QUIZ[eduStep - 1].options.map((opt, i) => {
                              const correctIdx = EDU_QUIZ[eduStep - 1].correct
                              const isSelected = eduSelected === i
                              const isCorrect = i === correctIdx
                              const showFeedback = eduSelected !== null
                              let style = 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                              if (showFeedback && isCorrect) style = 'border-emerald-400 bg-emerald-50 text-emerald-800'
                              else if (showFeedback && isSelected && !isCorrect) style = 'border-rose-400 bg-rose-50 text-rose-800'
                              else if (!showFeedback) style = 'border-slate-200 bg-white text-slate-700 hover:border-[rgb(var(--navy))]/40 hover:bg-slate-50 cursor-pointer'
                              return (
                                <button
                                  key={i}
                                  type="button"
                                  disabled={showFeedback}
                                  onClick={() => handleEduAnswer(i)}
                                  className={`w-full rounded-lg border px-3 py-2 text-left text-xs font-semibold transition-all ${style}`}
                                >
                                  <span className="inline-flex items-center gap-2">
                                    <span className={`shrink-0 inline-flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-black border ${
                                      showFeedback && isCorrect ? 'border-emerald-500 bg-emerald-500 text-white' :
                                      showFeedback && isSelected && !isCorrect ? 'border-rose-500 bg-rose-500 text-white' :
                                      'border-slate-300 text-slate-400'
                                    }`}>
                                      {String.fromCharCode(65 + i)}
                                    </span>
                                    {opt}
                                  </span>
                                </button>
                              )
                            })}
                          </div>
                          {eduSelected !== null && (
                            <motion.p
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-2.5 text-[10px] text-slate-600 leading-relaxed border-t border-slate-100 pt-2"
                            >
                              <strong>{eduAnswers[eduStep - 1] ? '✓ Correct.' : '✗ Not quite.'}</strong>{' '}
                              {EDU_QUIZ[eduStep - 1].explain}
                            </motion.p>
                          )}
                    </motion.div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-2.5">
                  {savingsList.length > 0 &&
                    savingsList.slice(0, 3).map((opp, index) => {
                      const diff = (opp.difficulty || 'medium').toLowerCase()
                      const badgeColor =
                        diff === 'easy'
                          ? 'bg-emerald-100 text-emerald-800'
                          : diff === 'hard'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                      const label = diff === 'easy' ? 'Easy' : diff === 'hard' ? 'Hard' : 'Medium'
                      return (
                        <div
                          key={`${opp.title || 'opp'}-${index}`}
                          className="flex min-h-0 flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50/80 p-2.5 sm:p-3"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--navy))] text-xs font-bold text-white sm:h-9 sm:w-9 sm:text-sm">
                              {index + 1}
                            </span>
                            <span
                              className={`shrink-0 text-[10px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5 sm:text-xs ${badgeColor}`}
                            >
                              {label}
                            </span>
                          </div>
                          <p className="min-h-[2.75rem] text-sm font-semibold leading-snug text-slate-900 line-clamp-3 sm:min-h-[3.25rem] sm:text-[0.9375rem]">
                            {opp.title || 'Savings opportunity'}
                          </p>
                        </div>
                      )
                    })}
                  {savingsList.length === 0 && (
                    <p className="col-span-full text-sm text-slate-500">
                      Complete the quiz to see your ranked savings opportunities.
                    </p>
                  )}
                </div>

                {savingsList.length > 3 && (
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAllSavingsOpportunities((v) => !v)
                        trackActivity('tool_used', {
                          tool: 'results_savings_expand_all',
                          expanded: !showAllSavingsOpportunities,
                        })
                      }}
                      className="text-sm font-semibold text-[rgb(var(--navy))] underline underline-offset-2 hover:text-slate-900"
                    >
                      {showAllSavingsOpportunities
                        ? 'Show less'
                        : `All ${savingsList.length} moves + dollar impact`}
                    </button>
                  </div>
                )}

                {savingsList.length > 0 && savingsList.length <= 3 && (
                  <details className="mt-4 rounded-xl border border-slate-200 bg-white">
                    <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-[rgb(var(--navy))] hover:bg-slate-50 rounded-xl">
                      Dollar impact by item
                    </summary>
                    <ul className="divide-y divide-slate-100 border-t border-slate-100">
                      {savingsList.map((opp, index) => {
                        const min = Number(opp.savingsMin || 0)
                        const max = Number(opp.savingsMax || opp.savingsMin || 0)
                        const rangeLabel =
                          min > 0 && max > 0 && min !== max
                            ? `${formatCurrency(min)} – ${formatCurrency(max)}`
                            : max > 0
                              ? formatCurrency(max)
                              : min > 0
                                ? formatCurrency(min)
                                : '—'
                        const diff = (opp.difficulty || 'medium').toLowerCase()
                        const label = diff === 'easy' ? 'Easy' : diff === 'hard' ? 'Hard' : 'Medium'
                        return (
                          <li key={`compact-${opp.title || 'opp'}-${index}`} className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3 text-sm">
                            <span className="font-medium text-slate-800">
                              <span className="tabular-nums text-slate-500 mr-2">{index + 1}.</span>
                              {opp.title || 'Savings opportunity'}
                              <span className="ml-2 text-[10px] font-bold uppercase text-slate-400">{label}</span>
                            </span>
                            <span className="font-semibold tabular-nums text-emerald-700">{rangeLabel}</span>
                          </li>
                        )
                      })}
                    </ul>
                    {totalSavings > 0 && (
                      <p className="border-t border-slate-100 px-4 py-2.5 text-xs text-slate-500">
                        Combined (upper range):{' '}
                        <span className="font-semibold text-slate-700">{formatCurrency(totalSavings)}</span>
                        <span className="text-slate-400"> · illustrative, not a guarantee</span>
                      </p>
                    )}
                  </details>
                )}

                {showAllSavingsOpportunities && savingsList.length > 3 && (
                  <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <ul className="divide-y divide-slate-100">
                      {savingsList.map((opp, index) => {
                        const min = Number(opp.savingsMin || 0)
                        const max = Number(opp.savingsMax || opp.savingsMin || 0)
                        const rangeLabel =
                          min > 0 && max > 0 && min !== max
                            ? `${formatCurrency(min)} – ${formatCurrency(max)}`
                            : max > 0
                              ? formatCurrency(max)
                              : min > 0
                                ? formatCurrency(min)
                                : '—'
                        const diff = (opp.difficulty || 'medium').toLowerCase()
                        const label = diff === 'easy' ? 'Easy' : diff === 'hard' ? 'Hard' : 'Medium'
                        return (
                          <li key={`full-${opp.title || 'opp'}-${index}`} className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3 text-sm">
                            <span className="font-medium text-slate-800">
                              <span className="tabular-nums text-slate-500 mr-2">{index + 1}.</span>
                              {opp.title || 'Savings opportunity'}
                              <span className="ml-2 text-[10px] font-bold uppercase text-slate-400">{label}</span>
                            </span>
                            <span className="font-semibold tabular-nums text-emerald-700">{rangeLabel}</span>
                          </li>
                        )
                      })}
                    </ul>
                    {totalSavings > 0 && (
                      <p className="border-t border-slate-100 px-4 py-2.5 text-xs text-slate-500">
                        Combined (upper range):{' '}
                        <span className="font-semibold text-slate-700">{formatCurrency(totalSavings)}</span>
                        <span className="text-slate-400"> · illustrative, not a guarantee</span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                <Link
                  href="/inbox"
                  onClick={() => trackActivity('tool_used', { tool: 'results_open_inbox' })}
                  className="font-semibold text-slate-700 underline underline-offset-2 hover:text-slate-900"
                >
                  See prioritized action plan
                </Link>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setShowFullBreakdown((prev) => !prev)
                  }}
                  className="font-semibold text-slate-700 underline underline-offset-2 hover:text-slate-900 cursor-pointer"
                >
                  {showFullBreakdown ? 'Hide assumptions and full breakdown' : 'See assumptions and full breakdown'}
                </button>
              </div>
            </motion.div>
            )}
          <div className="relative overflow-hidden rounded-2xl shadow-xl border border-gray-100 bg-white p-6 md:p-8">
            <Link
              href="/customized-journey"
              onClick={() => trackActivity('tool_used', { tool: 'results_roadmap_banner_cta' })}
              className="relative mb-4 flex flex-col overflow-hidden rounded-2xl shadow-lg"
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage:
                    'linear-gradient(135deg, rgba(30,58,95,0.92) 0%, rgba(30,64,175,0.85) 50%, rgba(59,130,246,0.75) 100%), url(https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1400&q=80)',
                }}
              />
              <div className="relative flex flex-col justify-center gap-3 px-6 py-5 sm:px-8 sm:py-6">
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  First-time buyer snapshot
                </h2>
                <div className="space-y-2 max-w-md">
                  <div className="h-2 rounded-full bg-white/20 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-slate-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${(phasesComplete.completed / phasesComplete.total) * 100}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                  <p className="text-white/80 text-sm font-medium">
                    {phasesComplete.completed} of {phasesComplete.total} phases complete
                  </p>
                </div>
              </div>
            </Link>
            {/* ── Metric cards — horizontal scroll on mobile ── */}
            <div className="mt-4 -mx-1">
              <div className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-hide px-1" style={{ scrollbarWidth: 'none' }}>

                {/* Card 1: Loan amount (adjustable) */}
                <div className="snap-start shrink-0 w-[min(280px,85vw)] sm:w-auto sm:flex-1 group relative overflow-hidden rounded-2xl p-6 border border-emerald-200/50 bg-gradient-to-br from-emerald-50/80 to-[#f8fafc] shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <Target className="h-5 w-5 text-emerald-700" />
                    </div>
                    <h3 className="text-lg font-bold text-[#1e293b]">Loan amount</h3>
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    min={0}
                    max={maxApproved ?? undefined}
                    step={1000}
                    value={formatNumberForInput(loanAmountInput, 0)}
                    onChange={(e) => {
                      setHasEditedLoanAmount(true)
                      setLoanAmountInput(parseOrEmpty(e.target.value))
                    }}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-2xl font-bold text-[#1e293b] focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none tracking-tight"
                  />
                  <p className="mt-2 text-sm text-slate-600">
                    Comfortable max: <span className="font-semibold text-[#1e293b]">{comfortableMaxText}</span>
                  </p>
                  {maxApproved != null && (
                    <p className="mt-0.5 text-xs text-slate-500">Lender max: {formatCurrency(maxApproved)}</p>
                  )}
                </div>

                {/* Card 2: Monthly payment */}
                <div className="snap-start shrink-0 w-[min(280px,85vw)] sm:w-auto sm:flex-1 group relative overflow-hidden rounded-2xl p-6 border border-teal-200/50 bg-gradient-to-br from-teal-50/80 to-[#f8fafc] shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-teal-700" />
                    </div>
                    <h3 className="text-lg font-bold text-[#1e293b]">Monthly payment</h3>
                  </div>
                  <p className="text-2xl font-bold text-teal-700 mb-2">{formatCurrency(adjustedMonthlyScenario)}</p>
                  <p className="text-sm text-slate-600 mb-2">
                    All-in estimate (PITI + PMI + maintenance)
                  </p>
                  <p className="text-xs text-slate-500 mb-2">
                    Baseline: {formatCurrency(Number(affordability?.monthlyPayment ?? monthlyPayment?.total ?? 0))}
                  </p>
                  {monthlyIncome > 0 && (
                    <div className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${housingRatio <= 0.28 ? 'bg-emerald-100 text-emerald-700' : housingRatio <= 0.31 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                      Housing ratio: {formatPercent(housingRatio)}
                    </div>
                  )}
                </div>

                {/* Card 3: Cash to close — mini stacked bar (20% down + closing costs, same as verdict tile) */}
                <div className={`snap-start shrink-0 w-[min(280px,85vw)] sm:w-auto sm:flex-1 group relative overflow-hidden rounded-2xl p-6 border shadow-sm hover:shadow-md transition-shadow ${
                  cashAtCloseOk ? 'border-emerald-200/50 bg-gradient-to-br from-emerald-50/80 to-[#f8fafc]' :
                  cashAtCloseWarn ? 'border-amber-200/50 bg-gradient-to-br from-amber-50/80 to-[#f8fafc]' :
                  'border-teal-200/50 bg-gradient-to-br from-millennial-primary-light/40 to-[#f8fafc]'
                }`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      cashAtCloseOk ? 'bg-emerald-500/20' :
                      cashAtCloseWarn ? 'bg-amber-500/20' :
                      'bg-teal-500/20'
                    }`}>
                      <BarChart2 className={`h-5 w-5 ${
                        cashAtCloseOk ? 'text-emerald-700' : cashAtCloseWarn ? 'text-amber-700' : 'text-teal-700'
                      }`} />
                    </div>
                    <h3 className="text-lg font-bold text-[#1e293b]">Cash to close</h3>
                  </div>
                  <p className={`text-2xl font-bold mb-2 ${
                    cashAtCloseOk ? 'text-emerald-700' : cashAtCloseWarn ? 'text-amber-700' : 'text-teal-700'
                  }`}>{formatCurrency(totalFundsCommitted)}</p>
                  <p className="text-sm text-slate-600 mb-2">Target: 20% down + closing costs</p>
                  {/* Stacked progress bar: committed vs target */}
                  {targetCashAtClose > 0 && (
                    <div>
                      <div className="relative h-3 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${
                            cashAtCloseOk ? 'bg-emerald-500' : cashAtCloseWarn ? 'bg-amber-500' : 'bg-teal-400'
                          }`}
                          style={{ width: `${Math.min(100, (totalFundsCommitted / targetCashAtClose) * 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1 text-xs font-semibold">
                        <span className={
                          cashAtCloseOk ? 'text-emerald-600' : cashAtCloseWarn ? 'text-amber-600' : 'text-teal-600'
                        }>
                          You have: {formatCurrency(totalFundsCommitted)}
                        </span>
                        <span className="text-slate-400">{Math.round((totalFundsCommitted / targetCashAtClose) * 100)}%</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card 4: LTV */}
                {ltvPercent > 0 && (
                  <div className={`snap-start shrink-0 w-[min(280px,85vw)] sm:w-auto sm:flex-1 group relative overflow-hidden rounded-2xl p-6 border shadow-sm hover:shadow-md transition-shadow ${
                    ltvOk ? 'border-emerald-200/50 bg-gradient-to-br from-emerald-50/80 to-[#f8fafc]' :
                    ltvWarn ? 'border-amber-200/50 bg-gradient-to-br from-amber-50/80 to-[#f8fafc]' :
                    'border-rose-200/50 bg-gradient-to-br from-rose-50/80 to-[#f8fafc]'
                  }`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        ltvOk ? 'bg-emerald-500/20' :
                        ltvWarn ? 'bg-amber-500/20' :
                        'bg-rose-500/20'
                      }`}>
                        <TrendingUp className={`h-5 w-5 ${
                          ltvOk ? 'text-emerald-700' : ltvWarn ? 'text-amber-700' : 'text-rose-700'
                        }`} />
                      </div>
                      <h3 className="text-lg font-bold text-[#1e293b]">Loan-to-Value (LTV)</h3>
                    </div>
                    <p className={`text-2xl font-bold mb-2 ${
                      ltvOk ? 'text-emerald-700' : ltvWarn ? 'text-amber-700' : 'text-rose-700'
                    }`}>{ltvPercent.toFixed(1)}%</p>
                    <p className="text-sm text-slate-600 mb-2">
                      {ltvOk ? '✓ No PMI required' : ltvWarn ? 'PMI applies until 80%' : 'High LTV — PMI + rate premium'}
                    </p>
                    {/* Mini LTV bar */}
                    <div className="mt-2 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          ltvOk ? 'bg-emerald-500' : ltvWarn ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, ltvPercent)}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-0.5 text-xs text-slate-500">
                      <span>0%</span>
                      <span className="text-emerald-600 font-semibold">80%</span>
                      <span>100%</span>
                    </div>
                    {quizTargetHomePrice && (
                      <p className="mt-1.5 text-xs text-slate-500">
                        Target: {formatCurrency(quizTargetHomePrice)}
                      </p>
                    )}
                  </div>
                )}

              </div>
              {/* Swipe hint — mobile only */}
              <p className="sm:hidden text-center text-xs text-slate-500 mt-2">← swipe to see all cards →</p>
            </div>

            {/* ── Verdict section: two main bullets with explanations ── */}
            <div className="mt-6">
              <div className="mb-4 flex w-full items-center rounded-xl bg-gradient-to-r from-brand-forest via-millennial-cta-primary to-teal-400 px-4 py-3 shadow-sm sm:py-3.5">
                <p className="text-base font-bold uppercase tracking-wide text-white">Your Position</p>
              </div>

              {/* Verdict bullets */}
              {(() => {
                const dpTarget = 0.2 * scenarioEstimatedHomePrice
                const dpPct = dpTarget > 0 ? Math.min(100, (scenarioDownPayment / dpTarget) * 100) : 0
                const readinessNum = readiness ?? 60
                const financialReadinessScore = Math.round((dpPct + readinessNum) / 2)
                const paymentScore = firstTimeDecision.label === 'Looks strong' ? 100 : firstTimeDecision.label === 'Needs adjustment' ? 25 : 60
                const paymentOk = paymentScore >= 80
                const paymentWarn = paymentScore >= 50 && paymentScore < 80
                const financialOk = financialReadinessScore >= 75
                const financialWarn = financialReadinessScore >= 50 && financialReadinessScore < 75
                const eduScoreNum = eduScore ?? 0
                const eduOk = eduScoreNum >= 80
                const eduWarn = eduScoreNum >= 60 && eduScoreNum < 80
                const bullets = [
                  {
                    label: 'Payment sustainability',
                    subtitle: 'Can you afford the monthly payment?',
                    value: `${paymentScore}%`,
                    ok: paymentOk,
                    warn: paymentWarn,
                    fillPct: paymentScore,
                    explanation: {
                      title: 'What is payment sustainability?',
                      summary: 'This measures whether you can comfortably afford the monthly payment over time. It combines your housing ratio (payment vs. income), DTI (all debt vs. income), and loan-to-income.',
                      bullets: [
                        `Housing ratio: ${formatPercent(housingRatio)} (conventional ideal 28%; FHA allows 31%; many lenders up to 36%)`,
                        `DTI ratio: ${formatPercent(dtiRatio)} (Fannie/Freddie ideal 36%; FHA max 43%; automated systems may allow up to 50%)`,
                        `Loan-to-income: ${loanToIncome.toFixed(1)}x (typical 4–5x; some programs allow up to 6x)`,
                        firstTimeDecision.reason,
                        'Explore a co-borrower to strengthen qualifying income and improve approval odds.',
                      ],
                    },
                  },
                  {
                    label: 'Financial readiness',
                    subtitle: 'Debt, credit, reserves — enough to qualify?',
                    value: `${financialReadinessScore}%`,
                    ok: financialOk,
                    warn: financialWarn,
                    fillPct: financialReadinessScore,
                    explanation: {
                      title: 'What is financial readiness?',
                      summary: 'This combines your down payment position and overall readiness. A higher score means you have the savings, cushion, and profile to move forward confidently.',
                      bullets: [
                        `Down payment: ${formatCurrency(scenarioDownPayment)} of ${formatCurrency(dpTarget)} target (20%) — ${dpPct.toFixed(0)}% there`,
                        readiness != null ? `Overall readiness score: ${readiness}` : 'Complete the quiz for your full readiness score.',
                        financialOk ? 'You\'re in a strong position to buy.' : financialWarn ? 'You\'re close — a bit more savings or a smaller budget would help.' : 'More preparation will reduce risk and stress.',
                      ],
                    },
                  },
                  {
                    label: 'Process Understanding',
                    subtitle: 'Know enough to navigate the process unassisted?',
                    value: eduScore != null ? `${eduScoreNum}%` : '—',
                    ok: eduOk,
                    warn: eduWarn,
                    fillPct: eduScoreNum,
                    explanation: {
                      title: 'What is process understanding?',
                      summary: 'This measures how well you understand key home buying concepts: DTI, PMI, closing costs, rate locks, and the offer-to-close process. Strong process understanding helps you avoid costly mistakes and negotiate confidently.',
                      bullets: [
                        '80%+ suggests strong familiarity with the process.',
                        '60–79% is a good baseline — a few gaps to close.',
                        'Below 60% means more learning will directly save you money.',
                        eduScore != null ? `Your score: ${eduScoreNum}%.` : 'Complete the quiz in the arc gauge to get your score.',
                      ],
                    },
                  },
                ]
                return (
                  <div className="grid grid-cols-1 gap-2 min-[700px]:grid-cols-3 min-[700px]:gap-2.5">
                    {bullets.map(({ label, subtitle, value, ok, warn, fillPct, explanation }) => (
                      <div key={label} className="flex min-w-0 flex-col">
                        <div className="mb-1.5 flex min-h-0 w-full min-w-0 items-center rounded-lg bg-gradient-to-r from-slate-700 via-slate-600 to-slate-500 px-3 py-2.5 text-white shadow-sm sm:px-3.5 sm:py-3">
                          <p className="w-full text-center text-sm font-semibold leading-snug antialiased min-[700px]:text-left min-[700px]:text-[0.9375rem]">
                            {label}
                          </p>
                        </div>
                        <div
                          className={`flex min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-hidden rounded-lg border p-3 shadow-sm transition-shadow hover:shadow-md sm:gap-2.5 sm:p-3.5 ${
                            ok
                              ? 'border-emerald-200/90 bg-white ring-1 ring-emerald-100'
                              : warn
                                ? 'border-amber-200/90 bg-white ring-1 ring-amber-100'
                                : 'border-rose-200/90 bg-white ring-1 ring-rose-100'
                          }`}
                        >
                          {subtitle ? (
                            <p className="line-clamp-2 text-center text-sm font-medium leading-snug text-slate-600 min-[700px]:text-left">
                              {subtitle}
                            </p>
                          ) : null}
                          {/* Gauge */}
                          <div className="relative mx-auto flex h-[5.5rem] w-full max-w-[11rem] shrink-0 items-center justify-center overflow-hidden sm:h-24 sm:max-w-[12rem]">
                            <HalfDonut pct={fillPct} color={tileChartColor(ok, warn)} trackColor={tileTrackColor(ok, warn)} size={124} />
                            <span
                              className={`pointer-events-none absolute inset-0 flex items-end justify-center pb-0.5 pt-8 text-xl font-bold tabular-nums antialiased sm:pt-9 sm:text-2xl ${
                                ok ? 'text-emerald-700' : warn ? 'text-amber-700' : 'text-rose-700'
                              }`}
                            >
                              {value}
                            </span>
                          </div>
                          <div className="min-w-0 space-y-1.5 border-t border-slate-100 pt-2.5 text-center min-[700px]:text-left">
                            <p
                              className={`text-sm font-bold antialiased sm:text-[0.9375rem] ${
                                ok ? 'text-emerald-800' : warn ? 'text-amber-800' : 'text-rose-800'
                              }`}
                            >
                              {ok ? 'On track' : warn ? 'Needs attention' : 'Needs work'}
                            </p>
                            {(() => {
                              const statusDescription =
                                label === 'Payment sustainability'
                                  ? paymentOk
                                    ? 'Your payment fits comfortably within your income.'
                                    : paymentWarn
                                      ? 'Your payment is workable but leaves limited buffer.'
                                      : 'This payment may stretch your budget too far.'
                                  : label === 'Financial readiness'
                                    ? financialOk
                                      ? 'Your savings and profile support this purchase.'
                                      : financialWarn
                                        ? 'You\'re close — small adjustments could strengthen your position.'
                                        : 'Building more savings will reduce risk.'
                                    : eduOk
                                      ? 'You understand key home buying concepts well.'
                                      : eduWarn
                                        ? 'Good baseline — a few concepts to reinforce.'
                                        : eduScore != null
                                          ? 'Building knowledge will help you negotiate and avoid costly mistakes.'
                                          : 'Complete the quiz to see your score.'
                              return statusDescription ? (
                                <p className="line-clamp-3 break-words text-sm leading-relaxed text-slate-600 antialiased sm:line-clamp-4 sm:leading-snug">
                                  {statusDescription}
                                </p>
                              ) : null
                            })()}
                            <button
                              type="button"
                              onClick={() => setDecisionExplanation(explanation)}
                              className="text-sm font-semibold text-slate-600 underline underline-offset-2 hover:text-slate-900"
                            >
                              See How It Works
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </div>
          </div>
          </>
        ) : (
          resType === 'first-time' && realisticMax != null ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-2">
                Loan Amount (adjustable{maxApproved != null ? `, lender max ${formatCurrency(maxApproved)}` : ''})
              </p>
              <input
                type="text"
                inputMode="numeric"
                min={0}
                max={maxApproved ?? undefined}
                step={1000}
                value={formatNumberForInput(loanAmountInput, 0)}
                onChange={(e) => {
                  setHasEditedLoanAmount(true)
                  setLoanAmountInput(parseOrEmpty(e.target.value))
                }}
                className="w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2 text-base font-semibold text-[#1e293b] focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <p className="text-sm text-slate-600 mt-2">
                Comfortable max home price estimate: <span className="font-semibold text-slate-700">{comfortableMaxText}</span>
              </p>
            </div>
          ) : null
        )}

      {hasResults && resType === 'first-time' && affordability && (
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h2 className="text-xl font-bold text-[#1e293b] mb-4">
            {plainEnglish ? 'Your numbers at a glance' : 'Snapshot metrics'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {readiness != null && (
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col items-center justify-center min-h-[120px]">
                <div
                  className="relative w-16 h-16 mb-2"
                  title={`Readiness score: ${readiness}/100`}
                >
                  <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                    <circle
                      cx="18" cy="18" r="15.9" fill="none"
                      stroke={readinessColor(readiness)}
                      strokeWidth="3"
                      strokeDasharray={`${readiness} 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-[#1e293b]">
                    {readiness}
                  </span>
                </div>
                <span className="text-xs font-semibold text-slate-500 text-center">
                  {plainEnglish ? 'How ready you are (0–100)' : 'Readiness score'}
                </span>
                <span className="text-xs text-slate-400 mt-0.5">
                  {readiness >= 75 ? 'Ready to buy' : readiness >= 50 ? 'Almost ready' : 'Needs work'}
                </span>
              </div>
            )}
            {realisticMax != null && (
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm min-w-0">
                <div className="flex items-center gap-2 text-emerald-500 mb-1">
                  <Target className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    Loan Amount (adjustable{maxApproved != null ? `, lender max ${formatCurrency(maxApproved)}` : ''})
                  </span>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  min={0}
                  max={maxApproved ?? undefined}
                  step={1000}
                  value={formatNumberForInput(loanAmountInput, 0)}
                  onChange={(e) => {
                    setHasEditedLoanAmount(true)
                    setLoanAmountInput(parseOrEmpty(e.target.value))
                  }}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-[#1e293b] focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Comfortable max home price estimate: <span className="font-semibold text-slate-700">{comfortableMaxText}</span>
                </p>
              </div>
            )}
            {affordability.monthlyPayment != null && (
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm min-w-0">
                <div className="flex items-center gap-2 text-[#06b6d4] mb-1">
                  <DollarSign className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-semibold uppercase tracking-wide">Monthly (adjusted scenario)</span>
                </div>
                <p className="text-xl font-bold text-[#1e293b]">{formatCurrency(adjustedMonthlyScenario)}</p>
                <p className="text-xs text-slate-500 mt-1">
                  Baseline: {formatCurrency(Number(affordability.monthlyPayment))}. Includes adjusted taxes, insurance, PMI, HOA, and maintenance.
                </p>
              </div>
            )}
            {closingCosts?.total != null && (
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm min-w-0">
                <div className="flex items-center gap-2 text-rose-500 mb-1">
                  <BarChart2 className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-semibold uppercase tracking-wide">Closing costs</span>
                </div>
                <p className="text-xl font-bold text-[#1e293b]">{formatCurrency(Number(closingCosts.total))}</p>
                <p className="text-xs text-slate-500 mt-1">Estimate — most of this is negotiable.</p>
              </div>
            )}
          </div>
        </motion.section>
      )}

      {hasResults && resType === 'first-time' && costBreakdown && (
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h2 className="text-xl font-bold text-[#1e293b] mb-1">
            {plainEnglish ? 'What buying really costs' : 'Full cost breakdown'}
          </h2>
          <p className="text-sm text-[#475569] mb-5">
            {plainEnglish
              ? 'A straight list of fees and monthly costs — so nothing at closing feels like a surprise.'
              : 'Every fee, clearly explained. Most buyers see this for the first time at the closing table.'}
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h3 className="text-base font-bold text-[#1e293b] mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Closing costs (what you pay at the table)
              </h3>
              <div className="space-y-2.5 text-sm">
                {[
                  { label: 'Total closing costs', value: closingCosts?.total, bold: true },
                  { label: 'Lender fees', value: closingCosts?.lenderFees?.total },
                  { label: 'Title + settlement', value: closingCosts?.titleAndSettlement?.total },
                  { label: 'Government fees', value: closingCosts?.governmentFees?.total },
                  { label: 'Prepaid costs (insurance, taxes, interest)', value: closingCosts?.prepaidCosts?.total },
                ].map(({ label, value, bold }) =>
                  value != null ? (
                    <div key={label} className={`flex items-center justify-between ${bold ? 'pt-2 border-t border-slate-100 font-bold' : ''}`}>
                      <span className="text-[#475569]">{label}</span>
                      <span className={bold ? 'text-[#1e293b] text-base' : 'font-semibold text-[#1e293b]'}>{formatCurrency(Number(value))}</span>
                    </div>
                  ) : null
                )}
              </div>
              <p className="mt-3 text-xs text-slate-400">Most lender fees and title insurance are negotiable. Always shop at least 3 lenders.</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h3 className="text-base font-bold text-[#1e293b] mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#06b6d4]" /> Monthly + long-term costs
              </h3>
              <div className="space-y-2.5 text-sm">
                {[
                  { label: 'All-in monthly total', value: monthlyPayment?.total, bold: true, note: 'PITI + PMI + maintenance buffer' },
                  { label: 'Principal + interest', value: monthlyPayment?.principalAndInterest },
                  { label: 'Property taxes', value: monthlyPayment?.propertyTaxes },
                  { label: 'Home insurance', value: monthlyPayment?.homeownersInsurance },
                  { label: 'PMI (drops at 20% equity)', value: monthlyPayment?.pmi && Number(monthlyPayment.pmi) > 0 ? monthlyPayment.pmi : null },
                  { label: 'Lifetime interest (30 yr)', value: lifetimeCosts?.totalInterest, bold: true },
                ].map(({ label, value, bold, note }) =>
                  value != null ? (
                    <div key={label} className={`flex items-start justify-between ${bold ? 'pt-2 border-t border-slate-100' : ''}`}>
                      <div>
                        <span className={`${bold ? 'font-bold text-[#1e293b]' : 'text-[#475569]'}`}>{label}</span>
                        {note && <p className="text-xs text-slate-400">{note}</p>}
                      </div>
                      <span className={bold ? 'font-bold text-[#1e293b] text-base' : 'font-semibold text-[#1e293b]'}>{formatCurrency(Number(value))}</span>
                    </div>
                  ) : null
                )}
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {hasResults && resType === 'first-time' && totalSavings > 0 && (
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mb-10 space-y-4">
          <Link
            href="/customized-journey"
            onClick={() => trackActivity('tool_used', { tool: 'results_action_roadmap_cta' })}
            className="group relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-800 to-slate-900 px-6 py-6 shadow-2xl ring-2 ring-white/10 transition-all duration-200 hover:ring-white/20 sm:gap-8 sm:px-10 sm:py-8"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,255,255,0.12),transparent)]" aria-hidden />
            <div className="relative flex-1">
              <p className="space-y-1.5 mb-3">
                <span className="block text-lg sm:text-xl font-bold text-[rgb(var(--coral))]">Still feeling confused or overwhelmed?</span>
                <span className="block text-base sm:text-lg font-semibold text-white/90">Let us walk through this journey with you.</span>
              </p>
              <h3 className="text-2xl sm:text-4xl font-black tracking-tight text-white drop-shadow-sm">Start your next best step</h3>
            </div>
            <span className="relative shrink-0 inline-flex items-center justify-center gap-2 self-start sm:self-center rounded-xl bg-[rgb(var(--coral))] px-7 py-4 text-lg font-bold text-white shadow-lg shadow-black/20 ring-2 ring-white/20 transition-all duration-200 group-hover:scale-[1.03] group-hover:shadow-xl group-hover:ring-white/30">
              Open Action Roadmap
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
          <div className="rounded-lg border border-teal-200 bg-teal-50/60 p-3.5">
            <Link
              href="/find-my-plan"
              onClick={() => trackActivity('tool_used', { tool: 'results_find_my_plan_cta' })}
              className="flex w-full items-center justify-between gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3.5 hover:border-[rgb(var(--coral))]/50 hover:bg-[rgb(var(--coral))]/5 transition-all group"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200 text-base shadow-sm">🧭</span>
                <div>
                  <p className="text-sm font-bold text-slate-800 group-hover:text-[rgb(var(--coral))] transition-colors">Not sure how much help you need?</p>
                  <p className="text-xs text-slate-500">Answer 5 quick questions → get your plan match</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-[rgb(var(--coral))] transition-colors" />
            </Link>
            <div className="relative mt-4 w-full sm:w-auto inline-block">
              <span className="absolute inset-0 rounded-xl bg-[rgb(var(--coral))]/30 animate-ping opacity-60 pointer-events-none" style={{ animationDuration: '2s' }} />
              <Link
                href="/customized-journey"
                onClick={() => trackActivity('tool_used', { tool: 'results_customized_guidance_cta' })}
                className="relative inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[rgb(var(--coral))] px-7 py-4 text-base font-bold text-white hover:opacity-90 transition shadow-lg"
              >
                Show me my action plan
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </motion.div>
      )}

        {showFullBreakdown && (
        <div className="mt-4 rounded-2xl border border-slate-200/90 bg-white/90 backdrop-blur-sm p-3.5 sm:p-4 shadow-sm">
              <button
                type="button"
                onClick={() => setShowTuner((p) => !p)}
                className="flex w-full items-center justify-between gap-2 text-sm font-bold text-slate-800 hover:text-slate-900 transition"
              >
                <span>⚙ Tune your plan (loan amount, down payment &amp; assumptions)</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showTuner ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
              {showTuner ? (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
              <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3.5">
                <p className="text-xs font-semibold text-slate-600 mb-3">Adjust values below — numbers update live above.</p>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <p className="text-xs text-slate-500 mb-1">
                      Loan Amount (adjustable{maxApproved != null ? `, lender max ${formatCurrency(maxApproved)}` : ''})
                    </p>
                    <input
                      type="text"
                      inputMode="numeric"
                      min={0}
                      max={maxApproved ?? undefined}
                      step={1000}
                      value={formatNumberForInput(loanAmountInput, 0)}
                      onChange={(e) => {
                        setHasEditedLoanAmount(true)
                        setLoanAmountInput(parseOrEmpty(e.target.value))
                      }}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-[#1e293b] focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <p className="text-xs text-slate-500 mb-1">Down payment</p>
                    <input
                      type="text"
                      inputMode="numeric"
                      min={0}
                      step={1000}
                      value={formatNumberForInput(downPaymentInput, 0)}
                      onChange={(e) => {
                        setHasEditedDownPayment(true)
                        setDownPaymentInput(parseOrEmpty(e.target.value))
                      }}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-[#1e293b] focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3">
                    <p className="text-xs font-semibold text-blue-900 mb-1">Rate assumptions</p>
                    <p className="text-xs italic text-slate-500 mb-2">Rates are market-based and subject to change.</p>
                    <div className="space-y-1">
                      <p className="flex items-center justify-between gap-2 text-xs text-slate-700">
                        <span>Your adjusted rate ({creditScoreBand} credit score)</span>
                        <span className="font-semibold text-slate-900">
                          {assumedMortgageRatePct != null ? `${assumedMortgageRatePct.toFixed(2)}%` : 'Not available'}
                        </span>
                      </p>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">
                      30-year market average:{' '}
                      <span className="font-semibold text-slate-700">
                        {latestAverageMortgageRatePct != null ? `${latestAverageMortgageRatePct.toFixed(2)}%` : 'Not available'}
                      </span>
                    </p>
                    {latestAverageMortgageRateAsOf ? (
                      <p className="mt-1 text-[11px] text-slate-500">
                        {latestAverageMortgageRateSource === 'fallback'
                          ? `PMMS fallback • verified ${latestAverageMortgageRateAsOf}`
                          : `Freddie Mac PMMS • ${latestAverageMortgageRateAsOf}`}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-600">Money out of pocket</p>
                  <p className="text-xs font-semibold text-slate-700">
                    Total: <span className="text-[#1e293b]">{formatCurrency(scenarioDownPayment + Number(closingCosts?.total ?? 0))}</span>
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs text-slate-500 mb-1">Down payment</p>
                    <p className="text-2xl font-black text-[#1e293b]">{formatCurrency(scenarioDownPayment)}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs text-slate-500 mb-1">Estimated closing costs</p>
                    <p className="text-2xl font-black text-[#1e293b]">{formatCurrency(Number(closingCosts?.total ?? 0))}</p>
                    <p className="mt-0.5 text-xs text-slate-400">Most fees are negotiable.</p>
                  </div>
                </div>
              </div>
              </motion.div>
              ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-2">
                Loan Amount (adjustable{maxApproved != null ? `, lender max ${formatCurrency(maxApproved)}` : ''})
              </p>
              <input
                type="text"
                inputMode="numeric"
                min={0}
                max={maxApproved ?? undefined}
                step={1000}
                value={formatNumberForInput(loanAmountInput, 0)}
                onChange={(e) => {
                  setHasEditedLoanAmount(true)
                  setLoanAmountInput(parseOrEmpty(e.target.value))
                }}
                className="w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2 text-base font-semibold text-[#1e293b] focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <p className="text-sm text-slate-600 mt-2">
                Comfortable max home price estimate: <span className="font-semibold text-slate-700">{comfortableMaxText}</span>
              </p>
            </div>
              )}
              </AnimatePresence>

            <p className="text-xs text-slate-500 mt-3">Most buyers finish these first steps in under 30 minutes.</p>
            </div>
        )}
      </motion.div>

      {/* Hero verdict + savings summary now inside snapshot card (before Protect your buying power) */}
      {(!hasResults || resType !== 'first-time') && (
        <div className="relative h-28 sm:h-32 overflow-hidden rounded-2xl mb-4 sm:mb-5">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                'linear-gradient(135deg, rgba(30,58,95,0.85) 0%, rgba(30,64,175,0.75) 50%, rgba(59,130,246,0.6) 100%), url(https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1400&q=80)',
            }}
          />
          <div className="absolute inset-0 flex items-center px-6 sm:px-10">
            <p className="text-white text-lg sm:text-xl font-semibold opacity-90">
              {firstName ? `${firstName}'s Savings Snapshot` : 'Your Savings Snapshot'}
            </p>
          </div>
        </div>
      )}

      {/* ── Sticky nav: minimal CTAs + Home (hidden when assumptions collapsed for first-time) ───────────────────────────── */}
      {(!hasResults || resType !== 'first-time' || showFullBreakdown) && (
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2 sticky top-8 z-40 bg-white/95 backdrop-blur-sm border border-slate-200 shadow-sm py-2 sm:py-3 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 rounded-xl">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm bg-[rgb(var(--navy))] text-white shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-white/90" aria-hidden="true" />
            Savings Snapshot
          </span>
          <Link href="/" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all">
            Home
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {hasResults && resType === 'first-time' && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setShowFullBreakdown((prev) => !prev)
              }}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm bg-white border border-slate-200 text-[#1e293b] hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer"
            >
              {showFullBreakdown ? 'Hide assumptions and full breakdown' : 'See assumptions and full breakdown'}
              <ChevronDown className={`w-4 h-4 transition-transform ${showFullBreakdown ? 'rotate-180' : ''}`} />
            </button>
          )}
          <Link
            href="/inbox"
            onClick={() => trackActivity('tool_used', { tool: 'results_sticky_nav_open_inbox' })}
            className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-lg font-bold text-sm bg-[rgb(var(--coral))] text-white hover:opacity-90 transition-all shrink-0"
          >
            Action inbox <ArrowRight size={16} className="shrink-0" />
          </Link>
        </div>
      </div>
      )}

      {/* ── Scenario 3: 12-Month Cost of Waiting ─────────────────────── */}
      {showFullBreakdown && hasResults && resType === 'first-time' && firstTimeDecision.label !== 'Needs adjustment' && adjustedMonthlyScenario > 0 && scenarioEstimatedHomePrice > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3 sm:px-5">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0 text-slate-400" />
              <p className="text-sm font-bold text-slate-800">The math on waiting 12 months vs. buying now</p>
            </div>
            <span className="shrink-0 text-[10px] font-medium italic text-slate-400">Not pressure — just the numbers.</span>
          </div>
          <div className="grid grid-cols-2 divide-x divide-slate-100">
            <div className="p-4 sm:p-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-emerald-700">Buy within 90 days</p>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Year 1 equity built</p>
                  <p className="text-xl font-black text-slate-800">{formatCurrency(year1EquityBuilt)}</p>
                  <p className="text-[10px] text-slate-400">principal paydown + 3.5% appreciation</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Rate you lock in today</p>
                  <p className="text-xl font-black text-slate-800">{assumptionValues.ratePct.toFixed(2)}%</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Rent you stop paying</p>
                  <p className="text-xl font-black text-emerald-700">{formatCurrency(estimatedMonthlyRent * 12)}</p>
                  <p className="text-[10px] text-slate-400">over the next 12 months</p>
                </div>
              </div>
            </div>
            <div className="bg-rose-50/30 p-4 sm:p-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-rose-700">Wait 12 months instead</p>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Rent paid (est.)</p>
                  <p className="text-xl font-black text-rose-700">{formatCurrency(estimatedMonthlyRent * 12)}</p>
                  <p className="text-[10px] text-slate-400">→ zero equity from that</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">If rate rises +0.5%</p>
                  <p className="text-xl font-black text-rose-700">+{formatCurrency(rateRiseMonthlyImpact)}/mo</p>
                  <p className="text-[10px] text-slate-400">on same loan size, forever</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Home price risk (+3.5%/yr)</p>
                  <p className="text-xl font-black text-slate-700">+{formatCurrency(appreciationInYear1)}</p>
                  <p className="text-[10px] text-slate-400">more to finance next year</p>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-100 bg-slate-50/40 px-4 py-2.5 sm:px-5">
            <p className="text-[10px] italic text-slate-400">Rent est. = ~82% of your housing cost · Appreciation assumes 3.5%/yr · Rate projection is illustrative, not a guarantee.</p>
          </div>
        </motion.div>
      )}

      {hasResults && resType === 'repeat-buyer' && (
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-2">Your buy + sell snapshot</p>
            <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-1">Should you do this now?</p>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${repeatDecision.classes}`}>
                  {repeatDecision.label}
                </span>
                <span className="text-sm text-slate-700">{repeatDecision.reason}</span>
                <button
                  type="button"
                  onClick={() =>
                    setDecisionExplanation({
                      title: `Why this is "${repeatDecision.label}"`,
                      summary: repeatDecision.reason,
                      bullets: [
                        `Estimated net proceeds: ${formatCurrency(repeatNetProceeds)}.`,
                        `Estimated monthly payment change: ${repeatCashFlowChange >= 0 ? '+' : ''}${formatCurrency(repeatCashFlowChange)}.`,
                        `Timing risk signal: ${String(repeatTiming?.riskLevel ?? 'medium')}.`,
                      ],
                    })
                  }
                  className="text-xs font-semibold text-slate-600 underline underline-offset-2 hover:text-slate-900"
                >
                  Why?
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Estimated net proceeds</p>
                <p className="text-lg font-bold text-[#1e293b]">{formatCurrency(repeatNetProceeds)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Down payment power</p>
                <p className="text-lg font-bold text-[#1e293b]">{formatCurrency(repeatDownPaymentPower)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Monthly payment change</p>
                <p className={`text-lg font-bold ${repeatCashFlowChange <= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {repeatCashFlowChange >= 0 ? '+' : ''}
                  {formatCurrency(repeatCashFlowChange)}
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-700 mb-2">
              Recommended timing: <span className="font-semibold">{String(repeatTiming?.recommendation ?? 'review timing options')}</span>{' '}
              ({String(repeatTiming?.riskLevel ?? 'medium')} risk)
            </p>
            <p className="text-sm text-slate-600">
              Target home budget from your current inputs: <span className="font-semibold">{formatCurrency(repeatTargetPrice)}</span>.
              We&apos;ll show exactly how to improve this before you list or make offers.
            </p>
          </div>
        </motion.div>
      )}

      {hasResults && resType === 'refinance' && (
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-5 sm:p-6 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-2">Your refinance snapshot</p>
            <div className="mb-4 rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-1">Should you do this now?</p>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${refiDecision.classes}`}>
                  {refiDecision.label}
                </span>
                <span className="text-sm text-slate-700">{refiDecision.reason}</span>
                <button
                  type="button"
                  onClick={() =>
                    setDecisionExplanation({
                      title: `Why this is "${refiDecision.label}"`,
                      summary: refiDecision.reason,
                      bullets: [
                        `Estimated monthly impact: ${refiMonthlySavings >= 0 ? '+' : ''}${formatCurrency(refiMonthlySavings)}.`,
                        `Break-even estimate: ${refiBreakEvenMonths > 0 && Number.isFinite(refiBreakEvenMonths) ? `${refiBreakEvenMonths} months` : 'Needs review'}.`,
                        `Estimated lifetime net impact: ${formatCurrency(refiNetSavings)}.`,
                      ],
                    })
                  }
                  className="text-xs font-semibold text-slate-600 underline underline-offset-2 hover:text-slate-900"
                >
                  Why?
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-xs text-slate-500">Estimated monthly impact</p>
                <p className={`text-lg font-bold ${refiMonthlySavings >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {refiMonthlySavings >= 0 ? '+' : ''}
                  {formatCurrency(refiMonthlySavings)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-xs text-slate-500">Break-even timeline</p>
                <p className="text-lg font-bold text-[#1e293b]">
                  {refiBreakEvenMonths > 0 && Number.isFinite(refiBreakEvenMonths) ? `${refiBreakEvenMonths} months` : 'Needs review'}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-xs text-slate-500">Lifetime net impact</p>
                <p className={`text-lg font-bold ${refiNetSavings >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {formatCurrency(refiNetSavings)}
                </p>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3 mb-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">Confidence meter</p>
                <p className="text-xs font-semibold text-slate-700">{refiConfidencePercent}%</p>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-200">
                <div className={`h-2 rounded-full ${refiConfidenceBarClass}`} style={{ width: `${refiConfidencePercent}%` }} />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Current to projected payment: <span className="font-semibold">{formatCurrency(refiCurrentPayment)}</span> →{' '}
                <span className="font-semibold">{formatCurrency(refiNewPayment)}</span>
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link
                href="/homebuyer/refinance-journey"
                onClick={() => trackActivity('tool_used', { tool: 'results_open_action_roadmap' })}
                className="rounded-xl bg-[rgb(var(--coral))] text-white px-4 py-3 font-semibold text-center hover:opacity-90 transition"
              >
                Open refinance roadmap
              </Link>
              <Link
                href="/inbox"
                onClick={() => trackActivity('tool_used', { tool: 'results_open_inbox' })}
                className="rounded-xl border border-slate-300 bg-white text-slate-700 px-4 py-3 font-semibold text-center hover:bg-slate-50 transition"
              >
                Open action inbox
              </Link>
              <div className="rounded-xl border border-slate-300 bg-white text-slate-700 px-4 py-3 text-sm">
                Suggested option: <span className="font-semibold">{String(refiRecommendation?.bestOption ?? 'review options')}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Repeat buyer: simplified CTA */}
      {hasResults && resType === 'repeat-buyer' && (
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link
            href={journeyHomeHrefByType[resolvedJourneyType]}
            onClick={() => trackActivity('tool_used', { tool: 'results_open_action_roadmap' })}
            className="inline-flex items-center gap-2 bg-[rgb(var(--coral))] text-white px-6 py-3 rounded-xl font-bold text-base hover:opacity-90"
          >
            Open Action Roadmap <ArrowRight size={18} />
          </Link>
          <p className="text-xs text-slate-500 mt-2">
            Next best move: follow the first roadmap task now while your assumptions are fresh.
          </p>
        </motion.div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          BELOW FOLD: Accordion (demoted content)
      ════════════════════════════════════════════════════════════════ */}

      {showFullBreakdown && hasResults && resType === 'first-time' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>

          {/* ── Buffer Reality Check ──────────────────────────────────── */}
          {(readiness == null || readiness < 75 || dtiRatio > 0.36) && adjustedMonthlyScenario > 0 && (
            <div className="mb-6 overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-amber-50/30 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100">
                  <ShieldCheck className="h-4 w-4 text-amber-600" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-amber-900">
                    Your plan has a{' '}
                    <span className={bufferLabel === 'thin' ? 'font-black text-rose-700' : bufferLabel === 'moderate' ? 'font-black text-amber-700' : 'font-black text-emerald-700'}>
                      {bufferLabel}
                    </span>{' '}
                    buffer for surprises
                  </p>
                  <p className="mt-1 text-xs text-amber-800">
                    Most buyers focus on making the payment. The harder question:{' '}
                    <em>what happens the month something unexpected hits?</em>
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[
                      { label: 'Job disruption', amount: 3000 },
                      { label: 'Car repair', amount: 2500 },
                      { label: 'Medical bill', amount: 3500 },
                    ].map(({ label, amount }) => {
                      const monthsCovered = adjustedMonthlyScenario > 0
                        ? (amount / adjustedMonthlyScenario).toFixed(1)
                        : '—'
                      return (
                        <div key={label} className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-center shadow-sm">
                          <p className="text-[10px] font-semibold text-slate-500">{label}</p>
                          <p className="text-sm font-black text-slate-800">{formatCurrency(amount)}</p>
                          <p className="text-[10px] font-semibold text-amber-700">≈ {monthsCovered} mo of housing</p>
                        </div>
                      )
                    })}
                  </div>
                  <p className="mt-3 text-xs text-amber-800">
                    A recommended 3-month emergency fund for your housing costs:{' '}
                    <strong>{formatCurrency(Math.round(adjustedMonthlyScenario * 3))}</strong>.{' '}
                    Your action plan shows the fastest path to building this buffer.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Editable assumptions */}
          <div className="mb-8 rounded-2xl border border-blue-200 bg-blue-50/60 p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-[#1e293b]">Assumptions playground</h3>
                <p className="text-sm text-slate-600">
                  Adjust assumptions to see how your monthly cost changes in real time.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setAssumptionOverrides({
                    ratePct: null,
                    taxPct: null,
                    insuranceAnnual: null,
                    hoaMonthly: null,
                    pmiMonthly: null,
                    maintenancePct: null,
                  })
                }
                className="text-xs font-semibold text-[rgb(var(--navy))] hover:underline"
              >
                Reset defaults
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              <label className="text-xs text-slate-600">
                Interest rate (%)
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.125"
                  min="2"
                  max="12"
                  value={assumptionValues.ratePct ?? ''}
                  onChange={(e) =>
                    setAssumptionOverrides((prev) => ({
                      ...prev,
                      ratePct: e.target.value === '' ? null : Number(e.target.value),
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-xs text-slate-600">
                Property tax (% annual)
                <input
                  type="text"
                  inputMode="decimal"
                  step="0.1"
                  min="0"
                  max="5"
                  value={formatNumberForInput(assumptionValues.taxPct, 3)}
                  onChange={(e) =>
                    setAssumptionOverrides((prev) => ({
                      ...prev,
                      taxPct: parseFormattedNumber(e.target.value),
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-xs text-slate-600">
                Home insurance (annual)
                <input
                  type="text"
                  inputMode="numeric"
                  step="100"
                  min="0"
                  value={formatNumberForInput(Math.round(assumptionValues.insuranceAnnual), 0)}
                  onChange={(e) =>
                    setAssumptionOverrides((prev) => ({
                      ...prev,
                      insuranceAnnual: parseFormattedNumber(e.target.value),
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-xs text-slate-600">
                HOA (monthly)
                <input
                  type="text"
                  inputMode="numeric"
                  step="25"
                  min="0"
                  value={formatNumberForInput(Math.round(assumptionValues.hoaMonthly), 0)}
                  onChange={(e) =>
                    setAssumptionOverrides((prev) => ({
                      ...prev,
                      hoaMonthly: parseFormattedNumber(e.target.value),
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-xs text-slate-600">
                PMI (monthly)
                <input
                  type="text"
                  inputMode="numeric"
                  step="25"
                  min="0"
                  value={formatNumberForInput(Math.round(assumptionValues.pmiMonthly), 0)}
                  onChange={(e) =>
                    setAssumptionOverrides((prev) => ({
                      ...prev,
                      pmiMonthly: parseFormattedNumber(e.target.value),
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-xs text-slate-600">
                Maintenance (% annual)
                <input
                  type="text"
                  inputMode="decimal"
                  step="0.1"
                  min="0"
                  max="3"
                  value={formatNumberForInput(assumptionValues.maintenancePct, 3)}
                  onChange={(e) =>
                    setAssumptionOverrides((prev) => ({
                      ...prev,
                      maintenancePct: parseFormattedNumber(e.target.value),
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
            </div>
            <div className="rounded-xl bg-white border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <p className="text-sm text-slate-600">
                Adjusted monthly estimate based on {scenarioEstimatedHomePrice > 0 ? formatCurrency(scenarioEstimatedHomePrice) : 'your target home price'}
              </p>
              <div className="text-right">
                <p className="text-xl font-bold text-[#1e293b]">{formatCurrency(adjustedMonthlyScenario)}</p>
                <p className="text-xs text-slate-500">
                  Baseline: {formatCurrency(Number(monthlyPayment?.total || 0))}
                </p>
              </div>
            </div>
          </div>

        </motion.div>
      )}

      {/* Lender vs Reality side-by-side */}
      {showFullBreakdown && maxApproved != null && realisticMax != null && (
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h2 className="text-xl font-bold text-[#1e293b] mb-1">What they tell you vs. what we recommend</h2>
          <p className="text-sm text-[#475569] mb-5">Lenders show you the max you can borrow. We show you the max you should borrow.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-rose-50 border border-rose-200 p-5">
              <p className="text-xs font-semibold text-rose-600 uppercase tracking-wide mb-2">Lender&apos;s number</p>
              <p className="text-3xl font-bold text-rose-700">{formatCurrency(maxApproved)}</p>
              <p className="text-sm text-rose-600 mt-2">This is the maximum they&apos;ll lend you. It stretches your finances to the limit and leaves no room for emergencies.</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5">
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-2">Our recommendation</p>
              <p className="text-3xl font-bold text-emerald-700">{formatCurrency(realisticMax)}</p>
              <p className="text-sm text-emerald-700 mt-2">Based on the 28/36 rule. Keeps housing costs under 28% of income, leaving room for life.</p>
            </div>
          </div>
        </motion.section>
      )}

      {/* Savings opportunities — ranked */}
      {showFullBreakdown && hasResults && resType === 'first-time' && savingsList.length > 0 && (
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h2 className="text-xl font-bold text-[#1e293b] mb-1">Savings opportunities (ranked)</h2>
          <p className="text-sm text-[#475569] mb-5">
            {hasSavingsDetailsAccess
              ? 'Ranked by impact. Each one is something you can act on before or during closing.'
              : 'Your free plan shows total potential savings. Upgrade to unlock the ranked opportunities, action steps, and scripts.'}
          </p>
          {hasSavingsDetailsAccess ? (
            <div className="space-y-3">
              {lockedSavingsCount > 0 && (
                <p className="text-sm text-slate-600">
                  {lockedSavingsCount} more opportunity{lockedSavingsCount !== 1 ? 's' : ''} unlocked with Momentum.
                </p>
              )}
              {visibleSavings.map((item, index) => {
                const opp = item as { title?: string; description?: string; savingsMin?: number; savingsMax?: number; difficulty?: string; actionSteps?: string[] }
                const diff = (opp.difficulty || 'medium').toLowerCase()
                return (
                  <div key={`${opp.title || 'opp'}-${index}`} className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[rgb(var(--navy))] text-white text-xs font-bold shrink-0">{index + 1}</span>
                          <h3 className="text-base font-bold text-[#1e293b]">{opp.title || 'Savings opportunity'}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColor[diff] || difficultyColor.medium}`}>{diff}</span>
                        </div>
                        {opp.description && <p className="text-sm text-[#475569] mb-2">{opp.description}</p>}
                        {Array.isArray(opp.actionSteps) && opp.actionSteps.length > 0 && (
                          <ul className="space-y-1">
                            {opp.actionSteps.slice(0, 2).map((step, i) => (
                              <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                                <ChevronRight className="w-3.5 h-3.5 text-[rgb(var(--coral))] shrink-0 mt-0.5" />
                                {step}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div className="sm:text-right shrink-0">
                        {(opp.savingsMin != null || opp.savingsMax != null) && (
                          <p className="text-emerald-600 font-bold text-base sm:text-lg">
                            {formatCurrency(Number(opp.savingsMin || 0))}
                            {opp.savingsMax != null && opp.savingsMax !== opp.savingsMin ? `–${formatCurrency(Number(opp.savingsMax))}` : ''}
                          </p>
                        )}
                        <p className="text-xs text-slate-400 mt-0.5">potential savings</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-600">
              Unlock Momentum to see ranked opportunities, scripts, and step-by-step guidance.
            </p>
          )}
        </motion.section>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          ZONE 3 – ACT (next steps + journey CTA)
      ════════════════════════════════════════════════════════════════ */}

      {showFullBreakdown && hasResults && resType === 'first-time' && (
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h2 className="text-xl font-bold text-[#1e293b] mb-1">Your next 3 actions</h2>
          <p className="text-sm text-[#475569] mb-5">Do these in order. Each one protects your money before the next step.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: <ShieldCheck className="w-5 h-5 text-[#06b6d4]" />,
                step: '1',
                title: 'Get pre-approved from 3+ lenders',
                detail: 'Not one — three. Rates vary. Compare line by line, not just the headline rate.',
              },
              {
                icon: <Lightbulb className="w-5 h-5 text-amber-500" />,
                step: '2',
                title: 'Review your closing cost estimate',
                detail: 'Use the breakdown above to know which fees are negotiable before you sign anything.',
              },
              {
                icon: <Star className="w-5 h-5 text-[rgb(var(--coral))]" />,
                step: '3',
                title: 'Follow your personalized journey',
                detail: 'Your roadmap is built on your numbers — every step tells you what to do and why.',
              },
            ].map(({ icon, step, title, detail }) => (
              <div key={step} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-[rgb(var(--navy))] text-white text-sm font-bold flex items-center justify-center shrink-0">{step}</span>
                  {icon}
                </div>
                <h3 className="font-bold text-[#1e293b] text-sm sm:text-base">{title}</h3>
                <p className="text-xs text-[#475569] leading-relaxed">{detail}</p>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Link
              href="/inbox"
              onClick={() => trackActivity('tool_used', { tool: 'results_open_inbox' })}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[rgb(var(--navy))] hover:underline"
            >
              Open Action Inbox for reminders <ArrowRight size={16} />
            </Link>
          </div>
        </motion.section>
      )}

      {/* Journey CTA */}
      {showFullBreakdown && hasResults && resType === 'first-time' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="rounded-2xl bg-[rgb(var(--navy))] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="flex-1">
              <p className="text-white/70 text-sm mb-1">What&apos;s next</p>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Start your next best step</h3>
              <p className="text-white/80 text-sm">
                Every phase is built on <strong className="text-white">your</strong> numbers — from pre-approval to closing day. No generic advice.
              </p>
            </div>
            <Link
              href="/customized-journey"
              onClick={() => trackActivity('tool_used', { tool: 'results_open_action_roadmap' })}
              className="inline-flex items-center gap-2 bg-[rgb(var(--coral))] hover:bg-[rgb(var(--coral-hover))] text-white px-7 py-3.5 rounded-xl font-bold text-base transition-colors shrink-0"
            >
              Open Action Roadmap <ArrowRight size={20} />
            </Link>
          </div>
        </motion.div>
      )}

      {/* Single upgrade CTA — outcome-based, one per accordion region */}
      {showFullBreakdown && hasResults && resType === 'first-time' && userTier === 'foundations' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="rounded-2xl border-2 border-[rgb(var(--coral))] bg-[rgb(var(--coral))]/5 p-5 sm:p-6">
            <p className="text-sm font-bold text-[#1e293b] mb-2">
              Unlock Momentum: protect an estimated additional {totalSavings > 0 ? formatCurrency(Math.round(totalSavings * 0.4)) + '–' + formatCurrency(Math.round(totalSavings * 0.7)) : '$2,000–$8,000'} in this phase
            </p>
            <p className="text-sm text-slate-600 mb-4">
              Ranked opportunities, negotiation scripts, and step-by-step guidance — so you know exactly what to do and when.
            </p>
            <Link
              href="/upgrade?tier=momentum&source=results"
              onClick={() => trackActivity('tool_used', { tool: 'results_upgrade_cta_consolidated' })}
              className="inline-flex items-center gap-2 bg-[rgb(var(--coral))] hover:bg-[rgb(var(--coral-hover))] text-white px-5 py-2.5 rounded-xl font-semibold text-sm"
            >
              Protect my savings <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>
      )}

      {/* Improve estimate accuracy checklist (in accordion) */}
      {(!hasResults || resType !== 'first-time' || showFullBreakdown) && (
      <div className="mb-8">
        <h3 className="text-sm font-bold text-[#1e293b] mb-3">Improve estimate accuracy</h3>
        <ul className="space-y-2 text-sm text-slate-600">
          <li className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-500">1</span>
            Add your exact income and debts in Profile for a tighter affordability range
          </li>
          <li className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-500">2</span>
            Get real quotes from 3 lenders to lock in accurate closing costs
          </li>
          <li className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-500">3</span>
            Re-run after major changes (rate shifts, down payment, new property)
          </li>
        </ul>
      </div>
      )}

      {/* Unbiased trust signal */}
      {(!hasResults || resType !== 'first-time' || showFullBreakdown) && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-10">
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-600 leading-relaxed">
            <strong className="text-slate-800">How we make money:</strong> We charge for optional premium plan features — never through commissions, referrals, or kickbacks from lenders, agents, or title companies. That&apos;s why we can tell you what no one else will.
          </p>
        </div>
      </motion.div>
      )}

      {hasResults && resType === 'first-time' && totalSavings > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 mt-8 scroll-mt-28"
          id="results-upgrade-cta"
        >
          <div className="rounded-2xl border-2 border-brand-sage/30 bg-brand-mist/60 p-6 sm:p-8">
            <p className="text-center text-lg font-bold text-brand-forest">
              You&apos;ve identified {formatCurrency(totalSavings)} in potential savings. Unlock your complete action plan to
              capture every dollar.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Link
                href="/upgrade?tier=momentum&source=results"
                className="relative flex flex-col rounded-2xl border-2 border-brand-forest bg-white p-5 shadow-md transition hover:shadow-lg"
              >
                <span className="absolute -top-3 right-4 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white">
                  Best Value
                </span>
                <p className="text-sm font-semibold text-slate-500">Strategist</p>
                <p className="mt-1 text-3xl font-black text-brand-forest">$29</p>
                <p className="mt-2 text-sm text-slate-600">One-time · Full action plan &amp; negotiation scripts</p>
              </Link>
              <Link
                href="/upgrade?tier=navigator&source=results"
                className="relative flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <span className="absolute -top-3 right-4 rounded-full bg-slate-700 px-3 py-1 text-xs font-bold text-white">
                  Most Popular
                </span>
                <p className="text-sm font-semibold text-slate-500">Pro</p>
                <p className="mt-1 text-3xl font-black text-slate-900">$149</p>
                <p className="mt-2 text-sm text-slate-600">Deeper tools &amp; concierge-style guidance</p>
              </Link>
            </div>
          </div>
        </motion.section>
      )}

      {/* ── Tier Switcher (bottom) ────────────────────────────────────── */}
      {hasResults && (resType !== 'first-time' || showFullBreakdown) && (
        <TierPreviewSwitcher
          currentTier={userTier}
          previewTier={previewTier}
          onPreviewChange={setPreviewTier}
        />
      )}

      {/* No results yet */}
      {!hasResults && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8">
          <p className="text-[#475569]">Complete the quiz to see your personalized results here.</p>
          <Link href="/quiz" className="inline-flex items-center gap-2 text-[rgb(var(--coral))] font-semibold mt-4 hover:underline">
            Go to quiz <ArrowRight size={18} />
          </Link>
        </div>
      )}

      {decisionExplanation && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 p-4 flex items-center justify-center"
          onClick={() => setDecisionExplanation(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Recommendation explanation"
        >
          <div
            className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-1">Recommendation details</p>
                <h3 className="text-lg font-bold text-[#1e293b]">{decisionExplanation.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setDecisionExplanation(null)}
                className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition"
                aria-label="Close explanation"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-3 text-sm text-slate-700">{decisionExplanation.summary}</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {decisionExplanation.bullets.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setDecisionExplanation(null)}
                className="inline-flex items-center gap-2 rounded-lg bg-[rgb(var(--coral))] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition"
              >
                Got it
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}

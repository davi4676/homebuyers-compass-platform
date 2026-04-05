'use client'

import {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  type ReactNode,
} from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import {
  Lock,
  ArrowRight,
  ChevronLeft,
  Check,
  Sparkles,
  MessageCircle,
  Target,
  Lightbulb,
  HelpCircle,
  Receipt,
  CalendarClock,
  Gauge,
  ChevronDown,
  Search,
  Bell,
  Mail,
  AlertCircle,
  Copy,
  Gift,
  BookOpen,
  ExternalLink,
} from 'lucide-react'
import { ChatPopover } from '@/components/chatbot/ChatPopover'
import { useJourneyNavChrome } from '@/components/JourneyNavChromeContext'
import {
  type JourneyTab,
  parseJourneyTabParam,
  journeyTabHrefPreservingSearch,
  JOURNEY_PAGE_PATH,
  JOURNEY_TAB_STORAGE_KEY,
} from '@/lib/journey-nav-tabs'
import {
  JOURNEY_LIBRARY_ITEMS,
  JOURNEY_LIBRARY_CATEGORY_LABEL,
  type LibraryCategoryId,
} from '@/lib/journey-library-items'
import {
  NQ_GUIDED_STEPS,
  NQ_FOUNDATIONS_LAST_STEP_INDEX,
  NQ_GUIDED_PHASE_ORDERS,
  getNQStepByIndex,
  getNqGuidedIndicesForPhaseOrder,
  isNqGuidedPhaseFullyComplete,
  countNqGuidedPhasesFullyComplete,
  getNqGuidedFirstAccessibleIndexInPhase,
  migrateNQGuidedLocalStorageIfNeeded,
  isHomeownerHubPhaseUnlocked,
  type NQGuidedStep,
} from '@/lib/nq-guided-steps'
import {
  type UserTier,
  TIER_ORDER,
  TIER_DEFINITIONS,
  tierAtLeast,
  getMomentumToNavigatorUpgradeCopy,
} from '@/lib/tiers'
import { trackActivity } from '@/lib/track-activity'
import { getJourneyPhaseById, getJourneyPhaseByOrder } from '@/lib/journey-phases-data'
import {
  buildUserSnapshot,
  getStoredQuizTransactionMeta,
  loadQuizDataFromLocalStorage,
  personalizeNqStep,
  type UserSnapshot,
} from '@/lib/user-snapshot'
import HousingBudgetSketchTile from '@/components/HousingBudgetSketchTile'
import AssistanceProgramsTab from '@/components/journey/AssistanceProgramsTab'
import FirstGenJourneyHub from '@/components/journey/FirstGenJourneyHub'
import TierPreviewSwitcher from '@/components/TierPreviewSwitcher'
import TierBadge from '@/components/TierBadge'
import { useTierMindset } from '@/components/tier-mindset/TierMindsetProvider'
import MindsetTag from '@/components/journey/MindsetTag'
import UpsellCard from '@/components/journey/UpsellCard'
import DynamicRoadmap from '@/components/journey/DynamicRoadmap'
import LearningCard from '@/components/journey/LearningCard'
import LockedFeatureCard from '@/components/journey/LockedFeatureCard'
import JourneyOnboardingFlow from '@/components/journey/JourneyOnboardingFlow'
import MoneyInsights from '@/components/journey/MoneyInsights'
import WhyItMattersCard from '@/components/journey/WhyItMattersCard'
import NextStepCard from '@/components/journey/NextStepCard'
import HomeownerHubSection from '@/components/journey/HomeownerHubSection'
import ReferralProgramModal from '@/components/referral/ReferralProgramModal'
import {
  REFERRAL_PROMPT_LS,
  referralProgramUrl,
  getOrCreateReferralCode,
} from '@/lib/referral-program'
import { getUserProgress } from '@/lib/user-tracking'
import { hasJourneyFeature } from '@/lib/journey-feature-access'
import { runNextStepEngineWithContext, type NextStepAction } from '@/lib/next-step-engine'
import {
  estimateTrackerTotals,
  getPhaseMoneyOpportunities,
  getFundingOpportunities,
  getAlternativeSolutions,
} from '@/lib/money-engine'
import { useMoneyTrackers } from '@/lib/hooks/useMoneyTrackers'
import {
  JOURNEY_LEARN_MONEY_ITEMS,
  JOURNEY_LEARN_SOLO_ITEMS,
  type LearnMoneyFilterId,
} from '@/lib/journey-learn-money-items'
import MoneyTag from '@/components/journey/MoneyTag'
import { formatCurrency } from '@/lib/calculations'
import type { ReadinessScore } from '@/lib/calculations'
import { consumeMoveUpWizardJourneySync } from '@/lib/move-up-journey-sync'

function ReadinessScoreReveal({ readiness }: { readiness: ReadinessScore }) {
  const reduceMotion = useReducedMotion() ?? false
  const target = Math.max(0, Math.min(100, Math.round(readiness.total)))
  const [displayed, setDisplayed] = useState(reduceMotion ? target : 0)

  useEffect(() => {
    if (reduceMotion) {
      setDisplayed(target)
      return
    }
    setDisplayed(0)
    let raf = 0
    const started = performance.now()
    const durationMs = 1100
    const tick = (now: number) => {
      const t = Math.min(1, (now - started) / durationMs)
      const eased = 1 - (1 - t) ** 3
      setDisplayed(Math.round(eased * target))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, reduceMotion])

  return (
    <span className="flex min-w-0 flex-1 flex-col gap-2 sm:max-w-lg sm:flex-1">
      <span>
        <strong
          className="text-slate-900 tabular-nums"
          aria-label={`Readiness score ${target} out of 100`}
        >
          <span aria-hidden>
            {displayed}
            /100
          </span>
        </strong>
        <span className="text-slate-600"> — {readiness.interpretation}</span>
      </span>
      <div
        className="h-1.5 w-full max-w-[11rem] overflow-hidden rounded-full bg-slate-200/90"
        aria-hidden
      >
        <div
          className={`h-full rounded-full bg-gradient-to-r from-millennial-cta-primary to-millennial-cta-secondary ${
            reduceMotion ? '' : 'transition-[width] duration-150 ease-out'
          }`}
          style={{ width: `${displayed}%` }}
        />
      </div>
    </span>
  )
}

interface NQGuidedRoadmapProps {
  userFirstName?: string | null
  /** For referral links (`nestquest.com/ref/...`); falls back to a placeholder when omitted. */
  referralSlug?: string | null
  onGoToResults: () => void
  /** Hub page should pass the tab from `useSearchParams()` so panels match the URL reliably. */
  activeTab?: JourneyTab
  /** Increment to open the referral share modal from parent (e.g. onboarding notification). */
  requestReferralModalOpen?: number
}

/** Foundations users can browse all steps; momentum-only depth is surfaced via inline upgrade prompts. */
const hasAccessToStep = (_stepIndex: number, _tier: UserTier): boolean => true

const hasToolAccess = (step: NQGuidedStep, tier: UserTier): boolean => {
  if (!step.tierRequired) return true
  const tierIndex = TIER_ORDER.indexOf(tier)
  const requiredIndex = TIER_ORDER.indexOf(step.tierRequired)
  return tierIndex >= requiredIndex
}

const ANNUAL_CREDIT_REPORT_MARKER = 'AnnualCreditReport.com'

/**
 * Renders action copy with `**bold**` / NQ tokens (via `renderNqSaysContext`) and links AnnualCreditReport.com.
 */
function renderWithAnnualCreditReportLink(text: string): ReactNode {
  if (!text.includes(ANNUAL_CREDIT_REPORT_MARKER)) return renderNqSaysContext(text)
  const segments = text.split(ANNUAL_CREDIT_REPORT_MARKER)
  return (
    <>
      {segments.map((segment, i) => (
        <span key={i}>
          {renderNqSaysContext(segment)}
          {i < segments.length - 1 ? (
            <a
              href="https://www.annualcreditreport.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-millennial-cta-primary underline decoration-millennial-cta-primary/70 underline-offset-2 hover:text-teal-900"
            >
              {ANNUAL_CREDIT_REPORT_MARKER}
            </a>
          ) : null}
        </span>
      ))}
    </>
  )
}

const NQ_SAYS_TOKEN_RE = /(\*\*[^*]+\*\*|\[\[y:[^\]]+\]\]|\[\[g:[^\]]+\]\])/g

/**
 * Renders NQ quote copy: `**phrase**` → bold blue; `[[y:text]]` → bold amber; `[[g:text]]` → bold green.
 */
function renderNqSaysContext(text: string): ReactNode {
  const chunks = text.split(NQ_SAYS_TOKEN_RE)
  return chunks.map((chunk, i) => {
    const blue = chunk.match(/^\*\*([^*]+)\*\*$/)
    if (blue) {
      return (
        <strong key={i} className="font-bold not-italic text-millennial-cta-primary">
          {blue[1]}
        </strong>
      )
    }
    const yellow = chunk.match(/^\[\[y:([^\]]+)\]\]$/)
    if (yellow) {
      return (
        <strong key={i} className="font-bold not-italic text-amber-600">
          {yellow[1]}
        </strong>
      )
    }
    const green = chunk.match(/^\[\[g:([^\]]+)\]\]$/)
    if (green) {
      return (
        <strong key={i} className="font-bold not-italic text-emerald-600">
          {green[1]}
        </strong>
      )
    }
    return chunk ? <span key={i}>{chunk}</span> : null
  })
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
  exit: { opacity: 0, y: -8 },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

const WHY_IT_MATTERS_MYTH_ICONS = [Receipt, CalendarClock, Gauge] as const
const WHY_IT_MATTERS_MYTH_ICON_STYLES = [
  'bg-millennial-primary-light/50 text-teal-800 ring-teal-200/80',
  'bg-amber-100 text-amber-800 ring-amber-200/70',
  'bg-violet-100 text-violet-700 ring-violet-200/70',
] as const

const PHASE_CHECKLIST_LS = 'nq_phase_checklist_v1'

const ONBOARDING_LS = 'nq_customized_onboarding_v1'

/** First visit to customized journey — show "Start here" → Budget tab (onboarding bridge from quiz → hub). */
const START_HERE_CARD_LS = 'nq_journey_start_here_v1'

const REFINANCE_PHASE_TITLES: Record<number, string> = {
  1: 'Review Current Loan & Goals',
  2: 'Check Credit & Equity',
  3: 'Compare Rates & Lenders',
  4: 'Lock Rate & Apply',
  5: 'Close & Save',
}

/** Aligns hub phase headings with repeat / move-up buyer workflow (buy-sell journey steps). */
const REPEAT_BUYER_PHASE_TITLES: Record<number, string> = {
  1: 'Current Home Profile',
  2: 'New Home Vision',
  3: 'Bridge Financing',
  4: 'Financial Waterfall',
  5: 'Comparative Scenarios',
  6: 'Savings & Opportunity',
  7: 'Action Plan',
}

const FIRSTGEN_GLOSSARY_TERMS: { term: string; def: string }[] = [
  { term: 'Pre-approval', def: 'A lender’s preliminary yes on how much you can borrow — not a final loan promise.' },
  { term: 'DTI', def: 'Debt-to-income: monthly debts divided by gross monthly income; lenders use it to size your payment.' },
  { term: 'APR', def: 'Annual percentage rate: the full yearly cost of credit including some fees, not just the note rate.' },
  { term: 'LTV', def: 'Loan-to-value: loan amount divided by appraised value; affects PMI and pricing.' },
  { term: 'PMI', def: 'Private mortgage insurance when you put down less than 20%; protects the lender, not you.' },
  { term: 'Escrow', def: 'Account where taxes and insurance are collected with your payment until paid at closing or to agencies.' },
  { term: 'Closing costs', def: 'One-time fees at closing: lender, title, recording, prepaid items, etc.' },
  { term: 'Earnest money', def: 'Good-faith deposit with your offer; usually credited toward cash to close.' },
  { term: 'Contingency', def: 'A contract escape hatch (inspection, appraisal, financing) if something fails.' },
  { term: 'Appraisal', def: 'Licensed opinion of value — the lender uses it to justify the loan amount.' },
  { term: 'Title', def: 'Legal ownership; title insurance protects against hidden claims.' },
  { term: 'Underwriting', def: 'Lender review of your file before final approval.' },
  { term: 'Rate lock', def: 'Fixing a quoted rate for a set period while you close.' },
  { term: 'Points', def: 'Fees paid to lower the rate; 1 point ≈ 1% of loan amount.' },
  { term: 'PITI', def: 'Principal, interest, taxes, and insurance — core housing payment pieces.' },
  { term: 'HOA', def: 'Homeowners association with dues and rules affecting affordability.' },
  { term: 'CD / Closing Disclosure', def: 'Final line-item summary of loan and cash to close, received before signing.' },
  { term: 'LE / Loan Estimate', def: 'Early good-faith summary of loan terms and closing costs.' },
  { term: 'CASH TO CLOSE', def: 'Total funds you bring at signing beyond the loan.' },
  { term: 'Down payment', def: 'Your equity at purchase; rest is financed.' },
  { term: 'Gift letter', def: 'Lender documentation when part of the down payment is a gift.' },
  { term: 'FHA / VA / USDA', def: 'Government-backed loan programs with different rules and costs.' },
  { term: 'Conventional', def: 'Non-government loan, often with PMI under 20% down.' },
  { term: 'ARM vs fixed', def: 'Adjustable rate changes over time; fixed keeps the same rate for the locked term.' },
  { term: 'Amortization', def: 'Schedule paying interest first, then more principal over time.' },
]

const SOLO_ADVOCATE_12: string[] = [
  'Get pre-approved before touring',
  'Never share your max budget with an agent',
  'Request all disclosures in writing',
  'Hire an independent inspector — not one referred by the agent',
  'Get a second opinion on the inspection report',
  'Research comparable sales yourself',
  'Never waive inspection contingency',
  'Read the HOA documents yourself',
  'Verify the title search independently',
  'Understand your closing costs before signing',
  'Have an attorney review the purchase agreement',
  'Keep all communications in writing',
]

export default function NQGuidedRoadmap({
  userFirstName,
  referralSlug: referralSlugProp,
  onGoToResults,
  activeTab: activeTabProp,
  requestReferralModalOpen = 0,
}: NQGuidedRoadmapProps) {
  const { userTier, effectiveTier, previewTier, setPreviewTier, resetPreviewToAccount, mindsetFor } =
    useTierMindset()
  const reduceMotion = useReducedMotion() ?? false
  const router = useRouter()
  const searchParams = useSearchParams()
  /** `toString()` dependency: ensures updates on client query changes (some Next versions reuse the ReadonlyURLSearchParams ref). */
  const searchKey = searchParams.toString()
  const activeTabFromUrl = useMemo(
    () => parseJourneyTabParam(new URLSearchParams(searchKey).get('tab')),
    [searchKey]
  )
  const activeTab = activeTabProp ?? activeTabFromUrl
  const { setJourneyNavChrome } = useJourneyNavChrome()

  const goTab = useCallback(
    (t: JourneyTab) => {
      try {
        localStorage.setItem(JOURNEY_TAB_STORAGE_KEY, t)
      } catch {
        // ignore
      }
      router.push(journeyTabHrefPreservingSearch(JOURNEY_PAGE_PATH, searchKey, t), { scroll: false })
    },
    [router, searchKey]
  )

  useEffect(() => {
    if (activeTab !== 'library' || typeof window === 'undefined') return
    sessionStorage.setItem('nq_library_seen', '1')
    setJourneyNavChrome({ libraryHasNew: false })
  }, [activeTab, setJourneyNavChrome])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      setOnboardingComplete(localStorage.getItem(ONBOARDING_LS) === '1')
    } catch {
      setOnboardingComplete(false)
    }
    setOnboardingHydrated(true)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      setStartHereState(localStorage.getItem(START_HERE_CARD_LS) === '1' ? 'hide' : 'show')
    } catch {
      setStartHereState('show')
    }
  }, [])

  const dismissStartHereCard = useCallback(() => {
    try {
      localStorage.setItem(START_HERE_CARD_LS, '1')
    } catch {
      /* ignore */
    }
    setStartHereState('hide')
  }, [])

  const goToBudgetFromStartHere = useCallback(() => {
    trackActivity('tool_used', { tool: 'journey_start_here_budget' })
    dismissStartHereCard()
    goTab('budget')
  }, [dismissStartHereCard, goTab])

  const prevJourneyTabRef = useRef<JourneyTab>(activeTab)
  useEffect(() => {
    const prev = prevJourneyTabRef.current
    prevJourneyTabRef.current = activeTab
    if (prev === 'upgrades' && activeTab !== 'upgrades') {
      resetPreviewToAccount()
    }
  }, [activeTab, resetPreviewToAccount])

  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [chatOpen, setChatOpen] = useState(false)
  const [chatAnchor, setChatAnchor] = useState<'message' | 'help'>('message')
  const [snapshot, setSnapshot] = useState<UserSnapshot | null>(null)
  const [quizTxnMeta, setQuizTxnMeta] = useState<
    ReturnType<typeof getStoredQuizTransactionMeta>
  >({ transactionType: null, icpType: null })
  const chatTriggerRef = useRef<HTMLButtonElement>(null)
  const helpChatTriggerRef = useRef<HTMLButtonElement>(null)
  const chatExtraTriggerRefs = useMemo(() => [chatTriggerRef, helpChatTriggerRef], [])

  const refreshSnapshot = useCallback(() => {
    const q = loadQuizDataFromLocalStorage()
    setSnapshot(buildUserSnapshot(q, { firstName: userFirstName }))
    setQuizTxnMeta(getStoredQuizTransactionMeta())
  }, [userFirstName])

  const hubReferralSlug = useMemo(() => {
    const trimmed = referralSlugProp?.trim()
    if (trimmed) return trimmed.slice(0, 32)
    if (typeof window !== 'undefined') {
      return getOrCreateReferralCode(null).slice(0, 32)
    }
    if (userFirstName) {
      const s = String(userFirstName)
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '')
        .slice(0, 32)
      if (s) return s
    }
    return 'yourname'
  }, [referralSlugProp, userFirstName])

  useEffect(() => {
    refreshSnapshot()
  }, [refreshSnapshot])

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'quizData') refreshSnapshot()
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [refreshSnapshot])

  useEffect(() => {
    const bump = () => refreshSnapshot()
    window.addEventListener('focus', bump)
    document.addEventListener('visibilitychange', bump)
    return () => {
      window.removeEventListener('focus', bump)
      document.removeEventListener('visibilitychange', bump)
    }
  }, [refreshSnapshot])

  useEffect(() => {
    if (typeof window === 'undefined') return
    migrateNQGuidedLocalStorageIfNeeded()
    const meta = getStoredQuizTransactionMeta()
    /** Buy-sell wizard sync targets move-up (simultaneous) buyers only — not generic repeat buyers. */
    const synced = consumeMoveUpWizardJourneySync(meta.icpType === 'move-up')

    try {
      let idx: number
      if (synced) {
        idx = Math.max(0, Math.min(synced.targetStepIndex, NQ_GUIDED_STEPS.length - 1))
      } else {
        const stored = JSON.parse(localStorage.getItem('nq_current_step') || '0')
        let n = typeof stored === 'number' ? stored : Number(stored)
        if (!Number.isFinite(n)) n = 0
        idx = Math.max(0, Math.min(Math.floor(n), NQ_GUIDED_STEPS.length - 1))
      }
      setCurrentStepIndex(idx)
    } catch {
      setCurrentStepIndex(0)
    }
    try {
      if (synced) {
        const allowed = new Set(synced.completedStepIndices.filter((i) => i >= 0 && i < NQ_GUIDED_STEPS.length))
        setCompletedSteps(allowed)
      } else {
        const done = JSON.parse(localStorage.getItem('nq_completed_steps') || '[]') as number[]
        setCompletedSteps(new Set(done.filter((i) => i >= 0 && i < NQ_GUIDED_STEPS.length)))
      }
    } catch {
      setCompletedSteps(new Set())
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('nq_current_step', String(currentStepIndex))
    }
  }, [currentStepIndex])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('nq_completed_steps', JSON.stringify(Array.from(completedSteps)))
    }
  }, [completedSteps])

  const referralPromptPrevCompletedRef = useRef<Set<number> | null>(null)
  const [referralRoadmapOpen, setReferralRoadmapOpen] = useState<
    null | 'preapproval' | 'phase7' | 'quiz'
  >(null)

  useEffect(() => {
    if (requestReferralModalOpen > 0) {
      setReferralRoadmapOpen('quiz')
    }
  }, [requestReferralModalOpen])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (referralPromptPrevCompletedRef.current === null) {
      referralPromptPrevCompletedRef.current = new Set(completedSteps)
      return
    }
    const prev = referralPromptPrevCompletedRef.current
    const phase2Now = isNqGuidedPhaseFullyComplete(2, completedSteps)
    const phase2Was = isNqGuidedPhaseFullyComplete(2, prev)
    const phase7Now = isNqGuidedPhaseFullyComplete(7, completedSteps)
    const phase7Was = isNqGuidedPhaseFullyComplete(7, prev)
    referralPromptPrevCompletedRef.current = new Set(completedSteps)

    try {
      if (
        phase7Now &&
        !phase7Was &&
        !localStorage.getItem(REFERRAL_PROMPT_LS.afterPhase7PostClosing)
      ) {
        setReferralRoadmapOpen('phase7')
        return
      }
      if (
        phase2Now &&
        !phase2Was &&
        !localStorage.getItem(REFERRAL_PROMPT_LS.afterPreApprovalPhase)
      ) {
        setReferralRoadmapOpen('preapproval')
      }
    } catch {
      /* ignore */
    }
  }, [completedSteps])

  const step = getNQStepByIndex(currentStepIndex) ?? NQ_GUIDED_STEPS[0]
  const displayStep = useMemo(() => personalizeNqStep(step, snapshot), [step, snapshot])

  const [phaseChecklistDone, setPhaseChecklistDone] = useState<boolean[]>([])
  const [openMythTitle, setOpenMythTitle] = useState<string | null>(null)
  const [libraryQuery, setLibraryQuery] = useState('')
  const [libraryCategory, setLibraryCategory] = useState<LibraryCategoryId | 'all'>('all')
  const [libraryMoreExpanded, setLibraryMoreExpanded] = useState(false)
  const [budgetSketchDirty, setBudgetSketchDirty] = useState(false)
  const [inboxTasks, setInboxTasks] = useState<
    {
      id: string
      label: string
      done: boolean
      savesAmount?: number
      findsAmount?: number
      altUnlock?: boolean
    }[]
  >([
    {
      id: 't1',
      label: 'Upload last 2 pay stubs to your lender portal (if requested)',
      done: false,
      findsAmount: 850,
      savesAmount: 120,
    },
    {
      id: 't2',
      label: 'Confirm homeowners insurance quotes 2 weeks before closing',
      done: false,
      savesAmount: 340,
      altUnlock: true,
    },
  ])
  const [learnMoneyFilter, setLearnMoneyFilter] = useState<LearnMoneyFilterId>('all')
  const [budgetMonthlyPair, setBudgetMonthlyPair] = useState({ sketch: 0, base: 0 })
  const [onboardingComplete, setOnboardingComplete] = useState(false)
  const [onboardingHydrated, setOnboardingHydrated] = useState(false)
  const [startHereState, setStartHereState] = useState<'loading' | 'show' | 'hide'>('loading')
  const [docTaskTouched, setDocTaskTouched] = useState(false)
  const phaseChecklistItems = displayStep?.nqPhaseChecklist
  const phaseChecklistSig = phaseChecklistItems?.join('\u0001') ?? ''

  useEffect(() => {
    if (typeof window === 'undefined' || !displayStep?.nqPhaseChecklist?.length) {
      setPhaseChecklistDone([])
      return
    }
    const lines = displayStep.nqPhaseChecklist
    try {
      const raw = localStorage.getItem(PHASE_CHECKLIST_LS)
      const all = raw ? (JSON.parse(raw) as Record<string, boolean[]>) : {}
      const saved = all[displayStep.id]
      if (Array.isArray(saved) && saved.length === lines.length) {
        setPhaseChecklistDone(saved)
        return
      }
    } catch {
      // ignore
    }
    setPhaseChecklistDone(Array(lines.length).fill(false))
  }, [displayStep?.id, phaseChecklistSig])

  useEffect(() => {
    setOpenMythTitle(null)
  }, [displayStep?.id])

  useEffect(() => {
    if (!step) return
    const displayPhaseOrder = Math.max(1, step.phaseOrder)
    const guidedPhaseTotal = NQ_GUIDED_PHASE_ORDERS.length
    const isRefi =
      quizTxnMeta.transactionType === 'refinance' || quizTxnMeta.icpType === 'refinance'
    const phaseTotalForDisplay =
      isRefi && displayPhaseOrder >= 1 && displayPhaseOrder <= 5 ? 5 : guidedPhaseTotal
    const progressDenom = isRefi && displayPhaseOrder <= 5 ? 5 : guidedPhaseTotal
    const indicesInCurrentPhase = getNqGuidedIndicesForPhaseOrder(step.phaseOrder)
    const milestoneIndexInPhase = Math.max(1, indicesInCurrentPhase.indexOf(currentStepIndex) + 1)
    const milestonesInPhase = indicesInCurrentPhase.length
    const progressPct = Math.min(
      100,
      ((step.phaseOrder - 1 + milestoneIndexInPhase / milestonesInPhase) / progressDenom) * 100
    )
    const readinessScore = snapshot ? Math.round(snapshot.readiness.total) : null
    const learnTipCount =
      displayStep && displayStep.nqWhyItMattersCards && displayStep.nqWhyItMattersCards.length > 0
        ? displayStep.nqWhyItMattersCards.length
        : displayStep?.nqWhatItMeans
          ? 1
          : 0
    const librarySeen =
      typeof window !== 'undefined' && sessionStorage.getItem('nq_library_seen') === '1'
    const inboxPendingCount = snapshot ? 2 : 3
    setJourneyNavChrome({
      phaseOrder: displayPhaseOrder,
      phaseTotal: phaseTotalForDisplay,
      phaseProgressPct: progressPct,
      readinessScore,
      learnTipCount,
      inboxPendingCount,
      libraryHasNew: !librarySeen,
    })
  }, [step, currentStepIndex, snapshot, displayStep, setJourneyNavChrome, quizTxnMeta])

  const totalSteps = NQ_GUIDED_STEPS.length
  const showMomentumRoadmapBanner =
    currentStepIndex > NQ_FOUNDATIONS_LAST_STEP_INDEX && !tierAtLeast(effectiveTier, 'momentum')
  const isLastStep = currentStepIndex === totalSteps - 1

  const handleIDidIt = () => {
    setCompletedSteps((prev) => new Set(prev).add(currentStepIndex))
    if (!isLastStep) {
      setTimeout(() => {
        setCurrentStepIndex((i) => i + 1)
      }, 350)
    }
  }

  const handleSkip = () => {
    if (!isLastStep) setCurrentStepIndex(currentStepIndex + 1)
  }

  const handleBack = () => {
    if (currentStepIndex > 0) setCurrentStepIndex(currentStepIndex - 1)
  }

  const togglePhaseChecklist = useCallback(
    (index: number) => {
      if (!step) return
      const items = personalizeNqStep(step, snapshot).nqPhaseChecklist
      if (!items?.length || index < 0 || index >= items.length) return
      setPhaseChecklistDone((prev) => {
        const base = prev.length === items.length ? prev : Array(items.length).fill(false)
        const next = base.map((v, i) => (i === index ? !v : v))
        try {
          const raw = localStorage.getItem(PHASE_CHECKLIST_LS)
          const all = raw ? (JSON.parse(raw) as Record<string, boolean[]>) : {}
          all[step.id] = next
          localStorage.setItem(PHASE_CHECKLIST_LS, JSON.stringify(all))
        } catch {
          // ignore
        }
        return next
      })
    },
    [step, snapshot]
  )

  const canAccess = useCallback(
    (idx: number) => {
      if (!hasAccessToStep(idx, effectiveTier)) return false
      const s = getNQStepByIndex(idx)
      if (s?.phaseOrder === 8 && !isHomeownerHubPhaseUnlocked(completedSteps)) return false
      return true
    },
    [effectiveTier, completedSteps]
  )

  useEffect(() => {
    const s = getNQStepByIndex(currentStepIndex)
    if (!s || s.phaseOrder !== 8) return
    if (isHomeownerHubPhaseUnlocked(completedSteps)) return
    const indices7 = getNqGuidedIndicesForPhaseOrder(7)
    const firstIncomplete = indices7.find((i) => !completedSteps.has(i))
    const fallback = firstIncomplete ?? indices7[indices7.length - 1] ?? 0
    setCurrentStepIndex(fallback)
  }, [completedSteps, currentStepIndex])

  const goToPhase = (phaseOrder: number) => {
    const idx = getNqGuidedFirstAccessibleIndexInPhase(phaseOrder, canAccess)
    if (idx !== null) setCurrentStepIndex(idx)
  }

  const displayPhaseOrderSafe = step ? Math.max(1, step.phaseOrder) : 1

  const moneyTotals = useMoneyTrackers(snapshot, userTier, displayPhaseOrderSafe)
  const moneyInsightsDetailsUnlocked = tierAtLeast(effectiveTier, 'momentum')
  const budgetSketchLineCap = TIER_DEFINITIONS[effectiveTier].features.budgetSketch.maxEditableLineItems

  const nextEngine = useMemo(
    () =>
      runNextStepEngineWithContext({
        userTier,
        effectiveTier,
        currentPhaseOrder: displayPhaseOrderSafe,
        mindset: mindsetFor(userTier),
        snapshot,
        recentActivity: {
          budgetSketchEdited: budgetSketchDirty,
          docRelatedTaskChecked: docTaskTouched,
          lastTab: activeTab,
        },
      }),
    [
      userTier,
      effectiveTier,
      displayPhaseOrderSafe,
      mindsetFor,
      snapshot,
      budgetSketchDirty,
      docTaskTouched,
      activeTab,
    ]
  )

  useEffect(() => {
    setJourneyNavChrome({ moneyTotals })
  }, [moneyTotals, setJourneyNavChrome])

  const learnMoneyCatalog = useMemo(() => {
    const solo = quizTxnMeta.icpType === 'solo' ? JOURNEY_LEARN_SOLO_ITEMS : []
    return [...solo, ...JOURNEY_LEARN_MONEY_ITEMS]
  }, [quizTxnMeta.icpType])

  const learnMoneyFiltered = useMemo(() => {
    return learnMoneyCatalog.filter((item) => {
      if (learnMoneyFilter === 'all') return true
      return item.moneyTags.includes(learnMoneyFilter)
    })
  }, [learnMoneyCatalog, learnMoneyFilter])

  const savingsDetails = useMemo(
    () => {
      const phaseOpps = getPhaseMoneyOpportunities(displayPhaseOrderSafe, effectiveTier)
      return [
        {
          title: phaseOpps.savings.title,
          description: phaseOpps.savings.description,
          value: phaseOpps.savings.estimatedValue,
        },
      ]
    },
    [displayPhaseOrderSafe, effectiveTier]
  )
  const fundingDetails = useMemo(
    () =>
      getFundingOpportunities(effectiveTier).map((o) => ({
        title: o.title,
        description: o.description,
        value: o.estimatedValue,
      })),
    [effectiveTier]
  )
  const alternativeDetails = useMemo(
    () =>
      getAlternativeSolutions(effectiveTier).map((o) => ({
        title: o.title,
        description: o.description,
        value: o.estimatedValue,
      })),
    [effectiveTier]
  )

  const moneyEstOnboarding = useMemo(
    () => estimateTrackerTotals(snapshot, userTier, 1),
    [snapshot, userTier]
  )

  const followNextHint = useCallback(
    (h?: NextStepAction['hint']) => {
      if (!h) return
      goTab(h as JourneyTab)
    },
    [goTab]
  )

  /** 1-based phase index on the purchase roadmap (prep = 1, never 0). */
  const displayPhaseOrder = Math.max(1, step.phaseOrder)
  const guidedPhaseTotal = NQ_GUIDED_PHASE_ORDERS.length
  const isRefinanceUser =
    quizTxnMeta.transactionType === 'refinance' || quizTxnMeta.icpType === 'refinance'
  const isRepeatBuyerUser =
    !isRefinanceUser &&
    (quizTxnMeta.transactionType === 'repeat-buyer' || quizTxnMeta.icpType === 'move-up')
  const phaseTotalForDisplay =
    isRefinanceUser && displayPhaseOrder >= 1 && displayPhaseOrder <= 5 ? 5 : guidedPhaseTotal
  const progressDenom = isRefinanceUser && displayPhaseOrder <= 5 ? 5 : guidedPhaseTotal
  const libraryPhase =
    getJourneyPhaseByOrder(displayPhaseOrder) ?? getJourneyPhaseById(step.phaseId)
  const nextLibraryPhase =
    displayPhaseOrder < guidedPhaseTotal
      ? (getJourneyPhaseByOrder(displayPhaseOrder + 1) ?? null)
      : null
  const indicesInCurrentPhase = getNqGuidedIndicesForPhaseOrder(step.phaseOrder)
  const milestoneIndexInPhase = Math.max(1, indicesInCurrentPhase.indexOf(currentStepIndex) + 1)
  const milestonesInPhase = indicesInCurrentPhase.length
  const phasesDoneCount = countNqGuidedPhasesFullyComplete(completedSteps)

  const refinancePhaseTitle =
    isRefinanceUser && REFINANCE_PHASE_TITLES[displayPhaseOrder]
      ? REFINANCE_PHASE_TITLES[displayPhaseOrder]
      : null
  const repeatBuyerPhaseTitle =
    isRepeatBuyerUser &&
    quizTxnMeta.icpType === 'move-up' &&
    REPEAT_BUYER_PHASE_TITLES[displayPhaseOrder]
      ? REPEAT_BUYER_PHASE_TITLES[displayPhaseOrder]
      : null
  const phaseHeadingTitle =
    refinancePhaseTitle ?? repeatBuyerPhaseTitle ?? libraryPhase?.title ?? `Phase ${displayPhaseOrder}`
  const nextRefiTitle =
    isRefinanceUser && displayPhaseOrder < 5 && REFINANCE_PHASE_TITLES[displayPhaseOrder + 1]
      ? REFINANCE_PHASE_TITLES[displayPhaseOrder + 1]
      : null
  const nextRepeatBuyerTitle =
    isRepeatBuyerUser &&
    quizTxnMeta.icpType === 'move-up' &&
    displayPhaseOrder < guidedPhaseTotal &&
    REPEAT_BUYER_PHASE_TITLES[displayPhaseOrder + 1]
      ? REPEAT_BUYER_PHASE_TITLES[displayPhaseOrder + 1]
      : null

  const progressPct = Math.min(
    100,
    ((step.phaseOrder - 1 + milestoneIndexInPhase / milestonesInPhase) / progressDenom) * 100
  )
  const currentStepMarkedDone = completedSteps.has(currentStepIndex)

  const nextStepTitles = NQ_GUIDED_STEPS.slice(currentStepIndex + 1, currentStepIndex + 3).map((s) => s.title)

  const overviewWarmth =
    snapshot == null
      ? 'Run your snapshot once and this page becomes a calm home base for your numbers.'
      : snapshot.readiness.total >= 60
        ? "You're making progress!"
        : snapshot.readiness.total >= 40
          ? "You're building momentum."
          : "You're building a strong foundation."

  const hosaFeatures = TIER_DEFINITIONS[effectiveTier].features.hosa
  const showFullHosaBreakdown =
    Boolean(hosaFeatures.optimizationScore) && tierAtLeast(effectiveTier, 'momentum')

  const quizEstimatedSavings = useMemo(() => {
    const q = loadQuizDataFromLocalStorage() as { estimatedSavings?: number } | null
    return typeof q?.estimatedSavings === 'number' ? q.estimatedSavings : 8500
  }, [snapshot?.readiness.total])

  const unclaimedSavingsAmount = useMemo(() => {
    if (tierAtLeast(effectiveTier, 'momentum')) return null
    const claimedApprox = Math.min(quizEstimatedSavings * 0.22, 4500)
    return Math.max(1500, Math.round(quizEstimatedSavings - claimedApprox))
  }, [effectiveTier, quizEstimatedSavings])

  const [soloAdvocateOpen, setSoloAdvocateOpen] = useState(false)
  const [referralCopied, setReferralCopied] = useState(false)
  const [firstGenGlossaryOpen, setFirstGenGlossaryOpen] = useState(false)

  const hasLearnContent = Boolean(
    (displayStep.nqWhyItMattersCards && displayStep.nqWhyItMattersCards.length > 0) ||
      displayStep.nqWhatItMeans
  )

  const libraryFiltered = useMemo(() => {
    const q = libraryQuery.trim().toLowerCase()
    return JOURNEY_LIBRARY_ITEMS.filter((item) => {
      const catOk = libraryCategory === 'all' || item.category === libraryCategory
      if (!catOk) return false
      if (!q) return true
      return item.title.toLowerCase().includes(q) || item.summary.toLowerCase().includes(q)
    })
  }, [libraryQuery, libraryCategory])

  return (
    <div className="space-y-8 sm:space-y-10 md:space-y-12 leading-relaxed pb-4 pt-2 sm:pt-4">
      {onboardingHydrated && !onboardingComplete ? (
        <JourneyOnboardingFlow
          userTier={userTier}
          effectiveTier={effectiveTier}
          snapshot={snapshot}
          moneyEst={moneyEstOnboarding}
          displayPhaseOrder={displayPhaseOrder}
          progressPct={progressPct}
          completedStepIndices={completedSteps}
          canAccessIndex={canAccess}
          onPhaseSelect={goToPhase}
          goTab={goTab}
          quizIcpType={quizTxnMeta.icpType}
          onComplete={() => {
            try {
              localStorage.setItem(ONBOARDING_LS, '1')
            } catch {
              // ignore
            }
            setOnboardingComplete(true)
          }}
          reduceMotion={reduceMotion ?? false}
        />
      ) : null}

      {activeTab === 'overview' ? (
        <div
          role="tabpanel"
          id="journey-panel-overview"
          aria-labelledby="journey-tab-overview"
            className="space-y-4 scroll-mt-28 sm:space-y-5 md:space-y-6"
          >
          {startHereState === 'show' ? (
            <motion.div
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0.01 : 0.35 }}
              className="relative overflow-hidden rounded-2xl border-2 border-teal-400/70 bg-gradient-to-br from-teal-50 via-white to-emerald-50/40 p-5 shadow-lg ring-1 ring-teal-200/60 sm:p-6"
              role="region"
              aria-label="Getting started"
            >
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-teal-200/20 blur-2xl" aria-hidden />
              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-teal-900">
                    <Sparkles className="h-4 w-4 text-teal-600" aria-hidden />
                    Start here
                  </p>
                  <h2 className="mt-2 font-display text-xl font-bold text-[rgb(var(--navy))] sm:text-2xl">
                    New to this hub? Start with your Budget Sketch
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
                    You just saw your savings snapshot on results — next, stress-test your{' '}
                    <strong className="font-semibold text-slate-800">monthly payment</strong> line by line (or your
                    affordability snapshot on Foundations). Then come back to Overview and your phase tab.
                  </p>
                </div>
                <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:min-w-[11rem]">
                  <button
                    type="button"
                    onClick={goToBudgetFromStartHere}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-3 text-sm font-bold text-white shadow-md transition hover:bg-teal-700"
                  >
                    Go to Budget Sketch
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={dismissStartHereCard}
                    className="text-center text-sm font-semibold text-slate-500 underline decoration-slate-300 underline-offset-2 hover:text-slate-800"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </motion.div>
          ) : null}

          <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-start">
            <div className="flex flex-wrap items-center gap-2">
              <TierBadge tier={effectiveTier} className="max-w-sm" />
              <MindsetTag mindset={mindsetFor(effectiveTier)} className="hidden sm:inline-flex" />
            </div>
          </div>
          <MoneyInsights
            totals={moneyTotals}
            savingsDetails={savingsDetails}
            fundingDetails={fundingDetails}
            alternativeDetails={alternativeDetails}
            detailsUnlocked={moneyInsightsDetailsUnlocked}
            upgradeHref="/upgrade?source=journey-overview-insights&tier=momentum"
          />
          {unclaimedSavingsAmount != null ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 mb-1">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <span className="text-2xl" aria-hidden>
                  💰
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-amber-900 text-sm">
                    You have {formatCurrency(unclaimedSavingsAmount)} in unclaimed savings
                  </p>
                  <p className="text-amber-700 text-xs">
                    Based on your profile, you qualify for programs and optimizations you haven&apos;t accessed yet.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push('/upgrade')}
                  className="shrink-0 bg-amber-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold"
                >
                  Claim Now →
                </button>
              </div>
            </div>
          ) : null}
          {!tierAtLeast(effectiveTier, 'momentum') && activeTab === 'overview' ? (
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Your momentum</p>
              {(() => {
                const p = typeof window !== 'undefined' ? getUserProgress() : null
                if (!p) return <p className="mt-2 text-sm text-slate-600">Complete the quiz to start earning XP.</p>
                return (
                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-800">
                    <span>
                      <strong className="tabular-nums">{p.totalXp}</strong> XP total
                    </span>
                    <span>
                      <strong className="tabular-nums">{p.currentStreak}</strong>-day streak
                    </span>
                  </div>
                )
              })()}
              <p className="mt-2 text-xs text-slate-500">
                Level up to Momentum to unlock levels and the leaderboard.
              </p>
            </div>
          ) : null}
          {isRefinanceUser ? (
            <section
              className="rounded-xl border border-slate-200/90 border-l-4 border-l-teal-500 bg-white p-5 shadow-sm sm:p-6"
              aria-labelledby="refi-journey-hub-overview"
            >
              <h2 id="refi-journey-hub-overview" className="font-display text-lg font-bold text-slate-900">
                Your Refinance Journey
              </h2>
              <p className="mt-2 text-sm text-slate-600 sm:text-base">
                Follow your personalized 5-step refinance roadmap — from reviewing your current loan to
                locking your new rate and closing.
              </p>
              <Link
                href="/homebuyer/refinance-journey"
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
              >
                Continue My Refinance Journey
                <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
              </Link>
            </section>
          ) : null}
          <motion.section
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0.01 : 0.45 }}
            className="rounded-3xl border-2 border-teal-300/70 bg-gradient-to-br from-white via-millennial-primary-light/30 to-emerald-50/35 p-5 shadow-xl shadow-slate-900/10 ring-1 ring-teal-100/80 sm:p-6"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-900/90">Readiness score</p>
            <p className="mt-1.5 text-base font-semibold text-slate-700">{overviewWarmth}</p>
            {snapshot ? (
              <div className="mt-4 space-y-4 border-t border-teal-100/90 pt-4">
                <ReadinessScoreReveal readiness={snapshot.readiness} />
                {showFullHosaBreakdown ? (
                  <div className="rounded-2xl border border-emerald-200/80 bg-white/90 p-4 shadow-sm ring-1 ring-emerald-100/70">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-900/90">
                      HOSA Savings Score
                    </p>
                    <p className="mt-2 font-display text-3xl font-black tabular-nums text-emerald-900 sm:text-4xl">
                      {Math.round(snapshot.readiness.total)}
                      <span className="text-xl font-bold text-slate-500 sm:text-2xl">/100</span>
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      Factor weights, savings opportunities, and the full optimization view live on your results page.
                    </p>
                    <Link
                      href="/results"
                      className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-emerald-900 underline decoration-emerald-600/60 underline-offset-2 hover:text-emerald-950"
                    >
                      View full HOSA breakdown
                      <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                    </Link>
                  </div>
                ) : (
                  <div className="rounded-xl border-2 border-dashed border-teal-300 bg-teal-50 p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-gray-900">Your HOSA Savings Score</h3>
                      <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full">Preview</span>
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-teal-600 flex items-center justify-center blur-sm">
                          <span className="text-white font-bold text-2xl">{Math.round(snapshot.readiness.total)}</span>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Lock className="text-teal-700 w-8 h-8" aria-hidden />
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-700 text-sm">
                          Your score is calculated. Upgrade to see your full breakdown and the 3 actions that would
                          increase it the most.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => router.push('/upgrade')}
                      className="w-full bg-teal-600 text-white py-2 rounded-lg font-semibold text-sm hover:bg-teal-700"
                    >
                      Unlock My Full Score →
                    </button>
                    <p className="text-xs text-gray-500 text-center mt-2">Includes your top 3 savings opportunities</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white/90 p-4 text-center sm:p-5">
                <p className="text-slate-600">
                  <button
                    type="button"
                    onClick={onGoToResults}
                    className="font-semibold text-teal-800 underline decoration-millennial-cta-primary/70 underline-offset-2 hover:text-teal-900"
                  >
                    Run the savings snapshot
                  </button>{' '}
                  to unlock your animated readiness score and personalized numbers.
                </p>
              </div>
            )}
          </motion.section>

          <div className="rounded-2xl border border-teal-200/80 bg-gradient-to-br from-white to-teal-50/40 p-5 shadow-sm sm:p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                <Gift className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-lg font-bold text-slate-900">Know someone buying a home?</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Share your link and you both get $50 off your next plan.
                </p>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <code className="truncate rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800">
                    {referralProgramUrl(hubReferralSlug)}
                  </code>
                  <button
                    type="button"
                    onClick={() => {
                      void navigator.clipboard.writeText(referralProgramUrl(hubReferralSlug))
                      setReferralCopied(true)
                      window.setTimeout(() => setReferralCopied(false), 2000)
                    }}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
                  >
                    <Copy className="h-4 w-4" aria-hidden />
                    {referralCopied ? 'Copied' : 'Copy Link'}
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href={`mailto:?subject=${encodeURIComponent('Check out NestQuest')}&body=${encodeURIComponent(`I'm using NestQuest for my home buying plan — thought you might want it too: ${referralProgramUrl(hubReferralSlug)}`)}`}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-teal-800 underline"
                  >
                    <Mail className="h-4 w-4" aria-hidden />
                    Share via Email
                  </a>
                  <a
                    href={`sms:?body=${encodeURIComponent(`Check out NestQuest: ${referralProgramUrl(hubReferralSlug)}`)}`}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-teal-800 underline"
                  >
                    Share via Text
                  </a>
                </div>
              </div>
            </div>
          </div>

          {snapshot ? (
            <section className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-lg sm:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Savings snapshot summary</p>
              <p className="mt-1.5 text-sm text-slate-600">
                Aligned with your savings snapshot scenario: we use your{' '}
                <strong className="font-semibold text-slate-800">target home price</strong>{' '}
                (when set) for price and monthly payment — not the income-based comfortable max.
              </p>
              <ul className="mt-3 space-y-2.5 text-sm text-slate-700 sm:text-base">
                <li className="flex flex-col gap-0.5 border-b border-slate-100 pb-3 sm:flex-row sm:justify-between sm:gap-4">
                  <span className="font-medium text-slate-500">Potential home price</span>
                  <span className="font-semibold text-slate-900 tabular-nums sm:text-right">
                    {snapshot.tokens.targetHome ? (
                      snapshot.tokens.targetHome
                    ) : (
                      <span className="font-normal text-slate-500">
                        Not set — add a target price in your snapshot
                      </span>
                    )}
                  </span>
                </li>
                <li className="flex flex-col gap-0.5 border-b border-slate-100 pb-3 sm:flex-row sm:justify-between sm:gap-4">
                  <span className="font-medium text-slate-500">Down payment</span>
                  <span className="font-semibold text-slate-900 tabular-nums sm:text-right">
                    {snapshot.tokens.downPayment}
                  </span>
                </li>
                <li className="flex flex-col gap-0.5 border-b border-slate-100 pb-3 sm:flex-row sm:justify-between sm:gap-4">
                  <div className="min-w-0">
                    <span className="font-medium text-slate-500">Indicative monthly payment</span>
                    <p className="mt-0.5 text-xs font-normal text-slate-500">
                      PITI-style estimate at your target home (same assumptions as the snapshot cards).
                    </p>
                  </div>
                  <span className="shrink-0 font-semibold text-slate-900 tabular-nums sm:text-right">
                    {snapshot.tokens.targetMonthly ? (
                      <>{snapshot.tokens.targetMonthly}/mo</>
                    ) : (
                      <span className="font-normal text-slate-500">—</span>
                    )}
                  </span>
                </li>
                <li className="flex flex-col gap-1 pt-1 text-xs text-slate-500 sm:flex-row sm:justify-between sm:gap-4">
                  <span>Reference · comfortable max · lender ceiling</span>
                  <span className="tabular-nums text-slate-600">
                    {snapshot.tokens.realisticMax}
                    <span className="mx-1.5 text-slate-300">·</span>
                    {snapshot.tokens.maxApproved}
                  </span>
                </li>
              </ul>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={onGoToResults}
                  className="inline-flex w-full justify-center rounded-xl border-2 border-millennial-cta-primary bg-white px-5 py-3 text-sm font-bold text-teal-900 shadow-md transition hover:bg-millennial-primary-light/25 sm:w-auto sm:text-base sm:px-6"
                >
                  Update snapshot
                </button>
                <p className="text-sm text-slate-600 sm:max-w-md">
                  Re-run after big changes to income, debt, or target home price so NQ stays aligned.
                </p>
              </div>
            </section>
          ) : null}

          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0.01 : 0.45 }}
            className="rounded-3xl border border-slate-200/90 bg-gradient-to-br from-white via-millennial-primary-light/25 to-emerald-50/25 p-6 shadow-lg sm:p-8"
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-millennial-primary-light/70 to-teal-100/55 shadow-lg ring-2 ring-teal-200/50">
                <Image
                  src="/images/nq-assistant.png"
                  alt="NQ, your home buying guide"
                  width={120}
                  height={120}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-800/90">From NQ</p>
                <p className="mt-3 font-serif text-lg italic leading-relaxed text-slate-700 sm:text-xl">
                  &ldquo;{renderNqSaysContext(displayStep.nqContext)}&rdquo;
                </p>
                {snapshot ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full border border-slate-200/90 bg-white px-3 py-1 text-sm font-medium text-slate-700 shadow-sm">
                      {snapshot.tokens.city}
                    </span>
                    <span className="rounded-full border border-slate-200/90 bg-white px-3 py-1 text-sm font-medium text-slate-700 shadow-sm">
                      {snapshot.tokens.timeline}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          </motion.div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm ring-1 ring-slate-100/80 sm:p-6">
            <p className="text-sm font-bold uppercase tracking-wide text-slate-600">Your phase</p>
            <p className="mt-1 text-sm text-slate-700">
              Phase {displayPhaseOrder} of {phaseTotalForDisplay}. A simple step now keeps your momentum steady.
            </p>
            <div className="mt-4">
              <NextStepCard
                action={nextEngine.actions[0]?.label ?? 'Open your phase and complete one checklist item'}
                onAction={() => followNextHint(nextEngine.actions[0]?.hint ?? 'phase')}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => goTab('phase')}
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-millennial-cta-primary to-millennial-cta-secondary px-5 py-3 text-sm font-bold text-white shadow-md transition hover:shadow-lg sm:text-base"
            >
              View your phase
            </button>
            <button
              type="button"
              onClick={() => goTab('budget')}
              className="inline-flex items-center justify-center rounded-xl border-2 border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-millennial-cta-primary hover:bg-millennial-primary-light/25 sm:text-base"
            >
              {budgetSketchLineCap <= 0 ? 'Affordability calculator' : 'Open Budget Sketch'}
            </button>
            <button
              type="button"
              disabled={!hasLearnContent}
              onClick={() => goTab('learn')}
              className="inline-flex items-center justify-center rounded-xl border-2 border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition enabled:hover:border-violet-300 enabled:hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-45 sm:text-base"
            >
              Learn along the way
            </button>
          </div>
        </div>
      ) : null}

      {activeTab === 'budget' ? (
        <div
          role="tabpanel"
          id="journey-panel-budget"
          aria-labelledby="journey-tab-budget"
          className="scroll-mt-28 space-y-6"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-end">
            <div className="flex flex-wrap items-center justify-end gap-2">
              <TierBadge tier={effectiveTier} className="max-w-sm" />
              <MindsetTag mindset={mindsetFor(effectiveTier)} className="hidden sm:inline-flex max-w-[280px]" />
            </div>
          </div>
          <MoneyInsights
            totals={moneyTotals}
            savingsDetails={savingsDetails}
            fundingDetails={fundingDetails}
            alternativeDetails={alternativeDetails}
            detailsUnlocked={moneyInsightsDetailsUnlocked}
            upgradeHref="/upgrade?source=journey-budget-insights&tier=momentum"
          />
          {!hasJourneyFeature(effectiveTier, 'affordability_review') ? (
            <div className="rounded-2xl border border-teal-100/90 bg-millennial-primary-light/30 p-4 shadow-sm sm:p-5">
              <p className="text-sm font-semibold text-slate-900">
                {getMomentumToNavigatorUpgradeCopy(quizTxnMeta.icpType)}
              </p>
              <MindsetTag className="mt-2 border-teal-100 bg-white/90" mindset={TIER_DEFINITIONS.navigator.mindset} />
              <Link
                href="/upgrade?source=budget-inline&tier=navigator"
                className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-teal-900 underline decoration-millennial-cta-primary/60 underline-offset-2 hover:text-teal-950"
              >
                {quizTxnMeta.icpType === 'first-gen' ? 'Get Expert Review →' : 'Explore Navigator+'}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          ) : null}
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-white/90 p-5 shadow-sm sm:flex-row sm:items-start sm:justify-between sm:p-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                Stress-test your monthly payment
              </h2>
              <p className="mt-2 text-sm text-slate-600 sm:text-base">
                Every line is editable. Reset snaps back to your quiz snapshot baseline.
              </p>
            </div>
            <button
              type="button"
              onClick={() => document.getElementById('nq-budget-sketch-reset')?.click()}
              className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 shadow-sm transition hover:border-millennial-cta-primary hover:bg-millennial-primary-light/25"
            >
              Reset
            </button>
          </div>
          <HousingBudgetSketchTile
            snapshot={snapshot}
            maxEditableLineItems={budgetSketchLineCap}
            budgetUpgradeHref="/upgrade?source=budget-sketch-lines&tier=momentum"
            onSketchDirtyChange={(dirty) => {
              setBudgetSketchDirty(dirty)
              setJourneyNavChrome({ budgetSketchEdited: dirty })
            }}
            onSketchMonthlyCompare={(sketch, base) => {
              setBudgetMonthlyPair({ sketch, base })
            }}
          />
          {budgetMonthlyPair.base > 0 && budgetMonthlyPair.sketch < budgetMonthlyPair.base ? (
            <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/60 p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-900/90">Savings impact (illustrative)</p>
              <p className="mt-2 text-sm text-slate-700">
                Your sketch is{' '}
                <strong className="font-semibold text-emerald-900 tabular-nums">
                  {formatCurrency(budgetMonthlyPair.base - budgetMonthlyPair.sketch)}
                </strong>{' '}
                lower per month than the snapshot baseline — about{' '}
                <strong className="font-semibold text-emerald-900 tabular-nums">
                  {formatCurrency(Math.round((budgetMonthlyPair.base - budgetMonthlyPair.sketch) * 12))}
                </strong>{' '}
                a year in cash-flow room before other optimizations.
              </p>
              <p className="mt-2 text-sm font-medium text-emerald-900">
                Nice — this adjustment saves you {formatCurrency(budgetMonthlyPair.base - budgetMonthlyPair.sketch)}/mo.
              </p>
            </div>
          ) : null}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-800">You may qualify for additional help.</p>
            <button
              type="button"
              onClick={() => goTab('library')}
              className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-teal-800 underline decoration-millennial-cta-primary/70 underline-offset-2 hover:text-teal-900"
            >
              Funding opportunities based on your profile
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => goTab('learn')}
              className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-violet-700 underline decoration-violet-400/70 underline-offset-2 hover:text-violet-900"
            >
              Alternative options you may consider
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
          <div className="rounded-2xl border border-slate-200/90 bg-slate-50/90 p-5 sm:p-6">
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600">Why these numbers matter</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-700 sm:text-base">
              Lenders look at debt-to-income (DTI), reserves, and how comfortably a payment fits your life — not
              just whether you can clear a minimum. Your sketch is a safe sandbox before you talk to a loan officer.
            </p>
            <button
              type="button"
              onClick={() => goTab('library')}
              className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-teal-800 underline decoration-millennial-cta-primary/70 underline-offset-2 hover:text-teal-900"
            >
              Open the Library tab
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      ) : null}

      {activeTab === 'assistance' ? <AssistanceProgramsTab userTier={effectiveTier} /> : null}

      {activeTab === 'firstgen' ? (
        <div
          role="tabpanel"
          id="journey-panel-firstgen"
          aria-labelledby="journey-tab-firstgen"
          className="scroll-mt-28"
        >
          <FirstGenJourneyHub goTab={goTab} />
        </div>
      ) : null}

      {activeTab === 'phase' ? (
        <div
          role="tabpanel"
          id="journey-panel-phase"
          aria-labelledby="journey-tab-phase"
          className="scroll-mt-28 space-y-4 sm:space-y-5 md:space-y-6"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-end">
            <div className="flex flex-wrap items-center justify-end gap-2">
              <TierBadge tier={effectiveTier} className="max-w-sm" />
              <MindsetTag mindset={mindsetFor(effectiveTier)} className="hidden sm:inline-flex max-w-[280px]" />
            </div>
          </div>
          <MoneyInsights
            totals={moneyTotals}
            savingsDetails={savingsDetails}
            fundingDetails={fundingDetails}
            alternativeDetails={alternativeDetails}
            detailsUnlocked={moneyInsightsDetailsUnlocked}
            upgradeHref="/upgrade?source=journey-phase-insights&tier=momentum"
          />
          <section
            className="relative scroll-mt-28 pt-0 md:pt-1"
            aria-labelledby="nq-phase-heading"
          >
            <div className="mb-4 flex flex-col gap-2 sm:mb-5 sm:flex-row sm:items-center sm:gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-slate-300 sm:max-w-[min(100%,12rem)]" aria-hidden />
              <p className="shrink-0 text-[11px] font-bold uppercase tracking-[0.28em] text-slate-500">
                Current phase
              </p>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent via-slate-300 to-slate-300 sm:from-slate-300 sm:via-slate-300" aria-hidden />
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/90 px-5 py-5 shadow-lg ring-1 ring-slate-200/50 sm:px-6 sm:py-6 md:px-8">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-teal-800/90">
                    Phase {displayPhaseOrder} of {phaseTotalForDisplay}
                  </p>
                  <h1
                    id="nq-phase-heading"
                    className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl md:text-[2.25rem] md:leading-tight"
                  >
                    {phaseHeadingTitle}
                  </h1>
                  {libraryPhase?.description && !refinancePhaseTitle && !repeatBuyerPhaseTitle ? (
                    <p className="mt-2 max-w-prose text-sm font-medium leading-relaxed text-slate-600 sm:text-base">
                      {libraryPhase.description}
                    </p>
                  ) : null}
                  <p className="mt-2 text-sm text-slate-500">Milestone {milestoneIndexInPhase} of {milestonesInPhase}</p>
                  {!(phaseChecklistItems && phaseChecklistItems.length > 0) ? (
                    <p className="mt-1 text-xs italic text-slate-500 sm:text-sm">Most buyers spend 2–4 weeks in this phase.</p>
                  ) : null}
                </div>
              </div>

              <div className="my-4 h-[3px] w-full rounded-full bg-gradient-to-r from-millennial-cta-primary via-teal-500 to-slate-200/80 sm:my-5" aria-hidden />

              <div className="h-1.5 w-full max-w-xl overflow-hidden rounded-full bg-slate-200/90">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-millennial-cta-primary to-teal-600 transition-[width] duration-500 ease-out motion-reduce:transition-none"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </section>

          <div className="flex flex-col gap-2 rounded-2xl border border-slate-200/90 bg-white/85 px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStepIndex === 0}
              className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
            <div
              className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-100 bg-white/90 px-3 py-1.5 text-xs text-slate-600"
              title="How many roadmap phases you have finished"
            >
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-500" aria-hidden />
              <span className="font-semibold text-slate-800">
                <span className="tabular-nums">{phasesDoneCount}</span>
                <span className="mx-1 font-normal text-slate-400">/</span>
                <span className="tabular-nums">{guidedPhaseTotal}</span>
              </span>
              <span className="text-slate-500">phases done</span>
            </div>
          </div>

          <WhyItMattersCard
            text={`This phase helps protect your monthly payment and cash reserves. Completing one key step now can unlock better terms later.`}
          />
          <NextStepCard
            action={nextEngine.actions[0]?.label ?? 'Open your checklist and complete one item'}
            onAction={() => followNextHint(nextEngine.actions[0]?.hint ?? 'phase')}
          />

          <section className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm sm:p-5">
            <DynamicRoadmap
              phaseOrders={NQ_GUIDED_PHASE_ORDERS}
              effectiveTier={effectiveTier}
              currentPhaseOrder={displayPhaseOrder}
              canAccessPhase={(phaseOrder) =>
                getNqGuidedFirstAccessibleIndexInPhase(phaseOrder, canAccess) !== null
              }
              onSelectPhase={goToPhase}
              isPhaseComplete={(phaseOrder) => isNqGuidedPhaseFullyComplete(phaseOrder, completedSteps)}
              getPhaseBlockedHint={(phaseOrder) =>
                phaseOrder === 8 && !isHomeownerHubPhaseUnlocked(completedSteps)
                  ? 'Complete all milestones in Post-Closing first.'
                  : undefined
              }
            />
          </section>

          {step.phaseOrder === 8 ? (
            <HomeownerHubSection snapshot={snapshot} referralSlug={hubReferralSlug} />
          ) : null}

          {phasesDoneCount >= 3 &&
          tierAtLeast(effectiveTier, 'navigator') &&
          !tierAtLeast(effectiveTier, 'navigator_plus') ? (
            <div className="rounded-2xl border border-amber-200/70 bg-gradient-to-r from-amber-50/90 to-white p-4 shadow-sm sm:p-5">
              <p className="text-sm font-bold text-amber-950">Major milestone — add a strategy session?</p>
              <p className="mt-1 text-sm text-slate-700">
                Navigator+ includes personalized strategy sessions when you&apos;re deep in the journey.
              </p>
              <p className="mt-2 text-xs italic text-slate-600">&ldquo;{TIER_DEFINITIONS.navigator_plus.mindset}&rdquo;</p>
              <Link
                href="/upgrade?source=phase-milestone&tier=navigator_plus"
                className="mt-2 inline-flex text-sm font-bold text-amber-900 underline underline-offset-2 hover:text-amber-950"
              >
                Upgrade to Navigator+
              </Link>
            </div>
          ) : null}

          {nextRefiTitle || nextRepeatBuyerTitle || nextLibraryPhase ? (
            <div className="rounded-2xl border border-millennial-border bg-gradient-to-br from-millennial-primary-light/35 to-white p-4 shadow-sm sm:p-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-millennial-cta-secondary">Coming up</p>
              <p className="mt-1.5 text-base font-bold text-slate-900 sm:text-lg">
                Phase {displayPhaseOrder + 1} —{' '}
                {nextRefiTitle ?? nextRepeatBuyerTitle ?? nextLibraryPhase?.title}
              </p>
              {nextRefiTitle || nextRepeatBuyerTitle ? null : (
                <p className="mt-1.5 text-sm text-slate-600">{nextLibraryPhase?.description}</p>
              )}
              <button
                type="button"
                onClick={() => goTab('library')}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-teal-800 hover:text-teal-900"
              >
                Scripts &amp; checklists in Library
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            </div>
          ) : null}

          <div className="pt-0 md:pt-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={displayStep.id}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.25 }}
                className="relative rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white via-millennial-primary-light/28 to-emerald-50/28 shadow-xl shadow-slate-900/10 ring-1 ring-teal-100/60 sm:rounded-3xl"
              >
                <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl sm:rounded-3xl" aria-hidden>
                  <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[rgb(var(--navy))] via-millennial-cta-primary to-teal-400" />
                  <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-millennial-cta-primary/10 blur-3xl" />
                  <div className="absolute -left-16 bottom-0 h-32 w-32 rounded-full bg-millennial-cta-primary/10 blur-3xl" />
                </div>

                <div className="relative z-10 border-l-4 border-millennial-cta-primary bg-gradient-to-b from-transparent to-white/70 p-4 pl-4 sm:p-6 sm:pl-6">
                  {showMomentumRoadmapBanner ? (
                    <div className="mb-4 rounded-2xl border border-teal-200/90 bg-gradient-to-br from-teal-50 to-emerald-50/90 p-4 shadow-sm ring-1 ring-teal-100/80 sm:p-5">
                      <p className="flex items-start gap-2 text-sm font-semibold text-teal-950">
                        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" aria-hidden />
                        <span>
                          You&apos;re viewing a later-phase milestone. Full scripts, checklists, and weekly rhythm for
                          House Hunting onward are included in{' '}
                          <strong className="font-bold">{TIER_DEFINITIONS.momentum.name}</strong> — browse the step
                          below, then upgrade when you want NQ to go deeper with you.
                        </span>
                      </p>
                      <Link
                        href="/upgrade?source=nq-guided-phase&tier=momentum"
                        className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-teal-900 underline decoration-teal-600/60 underline-offset-2 hover:text-teal-950"
                      >
                        Unlock full roadmap with Momentum
                        <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                      </Link>
                    </div>
                  ) : null}
                  <motion.div variants={itemVariants} className="mb-4 flex items-start gap-3 sm:gap-4">
                      <div className="relative">
                        <motion.div
                          className="flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-millennial-primary-light/70 to-teal-100/55 shadow-xl shadow-teal-600/15 ring-2 ring-teal-200/60"
                          whileHover={{ scale: 1.03 }}
                          transition={{ type: 'spring', stiffness: 400 }}
                        >
                          <Image
                            src="/images/nq-assistant.png"
                            alt="NQ, your home buying guide"
                            width={140}
                            height={140}
                            className="h-full w-full object-contain"
                            priority
                          />
                        </motion.div>
                      </div>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {milestonesInPhase > 1 ? (
                            <>
                              Milestone {milestoneIndexInPhase} of {milestonesInPhase}
                            </>
                          ) : (
                            <>This step</>
                          )}
                        </p>
                        <h2 className="text-xl font-bold leading-tight tracking-tight text-slate-900 sm:text-2xl md:text-[1.75rem] md:leading-snug">
                          {step.title}
                        </h2>
                      </div>
                      <div className="relative shrink-0">
                        <button
                          ref={chatTriggerRef}
                          type="button"
                          onClick={() => {
                            setChatAnchor('message')
                            setChatOpen((o) => !o)
                          }}
                          title="Ask NQ a question"
                          className={`flex h-12 w-12 items-center justify-center rounded-xl border-2 shadow-sm transition-all ${
                            chatOpen
                              ? 'border-millennial-cta-primary bg-millennial-primary-light/50 text-teal-900 ring-2 ring-teal-200'
                              : 'border-teal-200 bg-white text-millennial-cta-primary hover:border-millennial-cta-primary hover:bg-millennial-primary-light/25 hover:shadow-md'
                          }`}
                        >
                          <MessageCircle className="h-6 w-6" strokeWidth={2} />
                        </button>
                        <ChatPopover
                          isOpen={chatOpen}
                          onClose={() => setChatOpen(false)}
                          triggerRef={chatAnchor === 'help' ? helpChatTriggerRef : chatTriggerRef}
                          extraTriggerRefs={chatExtraTriggerRefs}
                        />
                      </div>
                    </motion.div>

                    {nextStepTitles.length > 0 ? (
                      <motion.div
                        variants={itemVariants}
                        className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-sm"
                      >
                        <span className="font-semibold text-slate-600">Coming up next</span>
                        {nextStepTitles.map((t, i) => (
                          <span key={t} className="inline-flex items-center gap-1.5 text-slate-600">
                            {i > 0 ? <span className="text-slate-300">·</span> : null}
                            <span className="rounded-full border border-slate-200/90 bg-white/90 px-2.5 py-1 font-medium shadow-sm">
                              {t}
                            </span>
                          </span>
                        ))}
                      </motion.div>
                    ) : null}

                    <motion.div variants={itemVariants} className="space-y-4 pt-3">
                      <div className="rounded-xl bg-gradient-to-r from-millennial-cta-primary to-millennial-cta-secondary p-[2px] shadow-md shadow-slate-900/12">
                        <div className="relative overflow-visible rounded-[calc(0.75rem-2px)] bg-white/90 px-4 pb-3 pt-6 shadow-inner shadow-slate-100/50 sm:px-5 sm:pb-3.5 sm:pt-7">
                          <h3 className="sr-only">From NQ</h3>
                          <div className="pointer-events-none absolute left-3 top-0 z-20 -translate-y-1/2 sm:left-4">
                            <span className="relative inline-flex items-center">
                              <span className="inline-flex items-center rounded-full bg-gradient-to-r from-millennial-cta-primary to-millennial-cta-secondary py-1 pl-[1.35rem] pr-2.5 text-sm font-bold uppercase tracking-wide text-white shadow-md shadow-slate-900/15 sm:py-1.5 sm:pl-7 sm:pr-3 sm:text-base">
                                NQ says
                              </span>
                              <span
                                className="absolute left-0 top-1/2 z-10 h-9 w-9 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full ring-2 ring-white/90 shadow-md shadow-slate-900/20 sm:h-10 sm:w-10 sm:shadow-lg"
                                aria-hidden
                              >
                                <Image
                                  src="/images/nq-assistant.png"
                                  alt=""
                                  width={80}
                                  height={80}
                                  className="h-full w-full object-cover"
                                />
                              </span>
                            </span>
                          </div>
                          <p className="relative z-10 font-serif text-base italic leading-relaxed text-slate-700 sm:text-lg sm:leading-relaxed">
                            &ldquo;{renderNqSaysContext(displayStep.nqContext)}&rdquo;
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,7.5rem)_1fr] sm:items-stretch">
                        <div className="flex flex-row items-center justify-center gap-3 rounded-2xl bg-[rgb(var(--navy))] px-4 py-3 shadow-lg shadow-slate-900/15 ring-1 ring-white/10 sm:flex-col sm:gap-2.5 sm:px-3 sm:py-4 sm:text-center">
                          <Target className="h-5 w-5 shrink-0 text-teal-300/90 sm:h-5 sm:w-5" strokeWidth={2} aria-hidden />
                          <h3 className="text-xs font-bold uppercase leading-snug tracking-[0.12em] text-white/95 sm:max-w-[7rem] sm:text-sm sm:leading-tight">
                            What to do now
                          </h3>
                        </div>
                        <div className="relative min-h-0 overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 shadow-md ring-1 ring-slate-100/80 sm:p-5">
                          <div className="absolute right-2 top-2 opacity-[0.06] sm:right-3 sm:top-3">
                            <Target className="h-14 w-14 text-[rgb(var(--navy))]" strokeWidth={1} aria-hidden />
                          </div>
                          <p className="relative text-lg font-semibold leading-relaxed text-slate-900 sm:text-xl">
                            {renderWithAnnualCreditReportLink(displayStep.nqWhatToDo)}
                          </p>
                          {displayStep.toolLink &&
                            (hasToolAccess(displayStep, effectiveTier) ? (
                              displayStep.toolLink.startsWith('http') ? (
                                <a
                                  href={displayStep.toolLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group relative mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-teal-400 via-millennial-cta-primary to-millennial-cta-secondary px-5 py-3 text-base font-bold text-white shadow-md shadow-slate-900/15 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-teal-500/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-millennial-primary-light/60"
                                >
                                  {displayStep.toolLabel || 'Open tool'}{' '}
                                  <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                                </a>
                              ) : (
                                <Link
                                  href={displayStep.toolLink}
                                  className="group relative mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-teal-400 via-millennial-cta-primary to-millennial-cta-secondary px-5 py-3 text-base font-bold text-white shadow-md shadow-slate-900/15 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-teal-500/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-millennial-primary-light/60"
                                >
                                  {displayStep.toolLabel || 'Open tool'}{' '}
                                  <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                                </Link>
                              )
                            ) : (
                              <ToolTierLockCallout
                                toolLabel={displayStep.toolLabel}
                                requiredTier={displayStep.tierRequired ?? 'momentum'}
                                userTier={effectiveTier}
                              />
                            ))}
                        </div>
                      </div>

                      {phaseChecklistItems && phaseChecklistItems.length > 0 ? (
                        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3.5 sm:p-4">
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-600">
                            Check off as you go
                          </p>
                          <ul className="mt-2 list-none space-y-2" role="list">
                            {phaseChecklistItems.map((line, i) => {
                              const done = phaseChecklistDone[i] ?? false
                              const cid = `nq-check-${displayStep.id}-${i}`
                              return (
                                <li key={cid} className="flex items-start gap-3">
                                  <input
                                    id={cid}
                                    type="checkbox"
                                    checked={done}
                                    onChange={() => togglePhaseChecklist(i)}
                                    className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-millennial-cta-primary focus:ring-millennial-cta-primary"
                                  />
                                  <label
                                    htmlFor={cid}
                                    className={`cursor-pointer text-sm leading-snug sm:text-base ${
                                      done ? 'text-slate-500 line-through' : 'font-medium text-slate-800'
                                    }`}
                                  >
                                    {renderNqSaysContext(line)}
                                  </label>
                                </li>
                              )
                            })}
                          </ul>
                          <p className="mt-2 text-xs text-slate-500">
                            Most buyers spend 2–4 weeks in this phase.
                          </p>
                        </div>
                      ) : null}

                      {displayStep.nqEncouragement ? (
                        <div className="rounded-xl border-l-4 border-millennial-cta-primary bg-gradient-to-r from-millennial-primary-light/40 to-transparent py-2.5 pl-4 pr-2">
                          <p className="text-base font-semibold italic text-teal-900">
                            &ldquo;{displayStep.nqEncouragement}&rdquo;
                          </p>
                        </div>
                      ) : null}
                    </motion.div>

                    <motion.div
                      variants={itemVariants}
                      className="mt-5 flex flex-wrap gap-3 border-t border-slate-200/80 pt-4"
                    >
                      <motion.button
                        type="button"
                        onClick={handleIDidIt}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`inline-flex items-center gap-2 rounded-2xl px-8 py-4 text-lg font-bold text-white shadow-lg ring-2 ring-white/30 transition-all duration-200 ${
                          currentStepMarkedDone
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/40 ring-emerald-200/50'
                            : 'bg-gradient-to-r from-rose-500 via-rose-600 to-orange-500 shadow-rose-500/35 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-rose-500/40'
                        }`}
                      >
                        {currentStepMarkedDone ? <Check className="h-5 w-5" /> : null}
                        I did it {currentStepMarkedDone ? '' : '✓'}
                      </motion.button>
                      <motion.button
                        ref={helpChatTriggerRef}
                        type="button"
                        onClick={() => {
                          setChatAnchor('help')
                          setChatOpen(true)
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="inline-flex items-center gap-2 rounded-2xl border-2 border-slate-200 bg-white px-6 py-3.5 text-lg font-semibold text-slate-800 shadow-sm transition-all duration-200 hover:border-millennial-cta-primary hover:bg-millennial-primary-light/25 hover:shadow-md"
                      >
                        <HelpCircle className="h-5 w-5 text-millennial-cta-primary" strokeWidth={2} />
                        I need help
                      </motion.button>
                      {!isLastStep ? (
                        <button
                          type="button"
                          onClick={handleSkip}
                          className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-base font-medium text-slate-500 underline-offset-4 transition-colors hover:bg-slate-100 hover:text-slate-700"
                        >
                          Skip for now
                        </button>
                      ) : null}
                    </motion.div>
                  </div>
                </motion.div>
            </AnimatePresence>
          </div>

          <section
            className="rounded-2xl border border-slate-200/90 bg-gradient-to-br from-slate-50/80 to-white p-4 shadow-sm sm:p-5"
            aria-label="Learn and Library"
          >
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Confidence builders</p>
            <div className="mt-3 flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => goTab('learn')}
                className="inline-flex flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-millennial-cta-primary to-millennial-cta-secondary px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:shadow-lg min-[480px]:flex-none"
              >
                Learn
              </button>
              <button
                type="button"
                onClick={() => goTab('library')}
                className="inline-flex flex-1 items-center justify-center rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 shadow-sm transition hover:border-millennial-cta-primary hover:bg-millennial-primary-light/25 min-[480px]:flex-none"
              >
                Library
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {activeTab === 'learn' ? (
        <div
          role="tabpanel"
          id="journey-panel-learn"
          aria-labelledby="journey-tab-learn"
          className="scroll-mt-28 space-y-8"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Learn</h2>
              <p className="mt-2 max-w-prose text-slate-600">
                Short reads matched to <span className="font-semibold text-slate-800">{step.title}</span>.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <TierBadge tier={effectiveTier} compact className="max-w-[220px]" />
              <MindsetTag mindset={mindsetFor(effectiveTier)} />
            </div>
          </div>

          <MoneyInsights
            totals={moneyTotals}
            savingsDetails={savingsDetails}
            fundingDetails={fundingDetails}
            alternativeDetails={alternativeDetails}
            detailsUnlocked={moneyInsightsDetailsUnlocked}
            upgradeHref="/upgrade?source=journey-learn-insights&tier=momentum"
          />

          {quizTxnMeta.icpType === 'first-gen' ? (
            <section className="rounded-2xl border border-teal-200/90 bg-gradient-to-br from-teal-50/60 to-white p-5 shadow-sm" aria-labelledby="firstgen-learn-hub-heading">
              <h3 id="firstgen-learn-hub-heading" className="font-display text-lg font-bold text-slate-900">
                First-Gen Hub
              </h3>
              <p className="mt-1 text-sm text-slate-600">Resources picked for buyers who are first in their family to own.</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-teal-700">
                    <BookOpen className="h-5 w-5" aria-hidden />
                    <p className="font-bold text-slate-900">Glossary</p>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">25 terms every first-time buyer needs to know</p>
                  <button
                    type="button"
                    onClick={() => setFirstGenGlossaryOpen((o) => !o)}
                    className="mt-3 text-sm font-semibold text-teal-800 underline"
                  >
                    {firstGenGlossaryOpen ? 'Hide glossary' : 'View glossary'}
                  </button>
                  {firstGenGlossaryOpen ? (
                    <ul className="mt-3 max-h-60 list-none space-y-2 overflow-y-auto text-sm text-slate-700">
                      {FIRSTGEN_GLOSSARY_TERMS.map((g) => (
                        <li key={g.term} className="rounded-lg bg-slate-50 px-2 py-1.5">
                          <strong className="text-slate-900">{g.term}</strong> — {g.def}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
                <a
                  href="https://www.hud.gov/i_want_to/talk_to_a_housing_counselor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-teal-300"
                >
                  <div className="flex items-center gap-2 text-teal-700">
                    <ExternalLink className="h-5 w-5" aria-hidden />
                    <p className="font-bold text-slate-900">HUD Counselors</p>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">Free, government-approved housing counselors in your area</p>
                  <span className="mt-3 inline-flex text-sm font-semibold text-teal-800">Open HUD directory →</span>
                </a>
                <Link
                  href="/resources"
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-teal-300"
                >
                  <p className="font-bold text-slate-900">Gift Fund Guide</p>
                  <p className="mt-2 text-sm text-slate-600">
                    How to use family money for your down payment — the right way
                  </p>
                  <span className="mt-3 inline-flex text-sm font-semibold text-teal-800">Read guide →</span>
                </Link>
                <Link
                  href="/learn/buying-solo"
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-teal-300"
                >
                  <p className="font-bold text-slate-900">Family Conversation Scripts</p>
                  <p className="mt-2 text-sm text-slate-600">
                    How to talk to your family about helping you buy a home
                  </p>
                  <span className="mt-3 inline-flex text-sm font-semibold text-teal-800">Open scripts →</span>
                </Link>
              </div>
            </section>
          ) : null}

          {quizTxnMeta.icpType === 'solo' ? (
            <section className="space-y-3" aria-label="Solo buyer learn cards">
              <div className="rounded-xl border border-teal-200/80 bg-gradient-to-r from-teal-50/90 to-white p-4 text-sm text-slate-700 shadow-sm">
                <p className="font-bold text-teal-950">Buying solo</p>
                <p className="mt-1">Extra picks below — then the rest of the Learn library still applies.</p>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="font-bold text-slate-900">Qualifying on One Income</p>
                  <p className="mt-2 text-sm text-slate-600">
                    Lenders look at your debt-to-income ratio. Here&apos;s how to maximize your qualification on a single
                    income.
                  </p>
                  <Link
                    href={
                      tierAtLeast(effectiveTier, 'momentum')
                        ? '/mortgage-shopping'
                        : '/upgrade?source=solo-dti&tier=momentum'
                    }
                    className="mt-3 inline-flex text-sm font-semibold text-teal-800 underline"
                  >
                    Calculate My DTI →
                  </Link>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="font-bold text-slate-900">The Solo Buyer Advocate Checklist</p>
                  <p className="mt-2 text-sm text-slate-600">
                    Buying alone means you need to be your own advocate. Here are 12 things to verify before signing
                    anything.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSoloAdvocateOpen((o) => !o)}
                    className="mt-3 text-sm font-semibold text-teal-800 underline"
                  >
                    {soloAdvocateOpen ? 'Hide checklist' : 'View Checklist →'}
                  </button>
                  {soloAdvocateOpen ? (
                    <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-slate-700">
                      {SOLO_ADVOCATE_12.map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ol>
                  ) : null}
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="font-bold text-slate-900">Negotiating Without a Partner</p>
                  <p className="mt-2 text-sm text-slate-600">
                    Solo buyers can actually negotiate harder — here&apos;s why, and how to use it to your advantage.
                  </p>
                  <Link
                    href="/upgrade?source=solo-negotiation&tier=momentum"
                    className="mt-3 inline-flex text-sm font-semibold text-teal-800 underline"
                  >
                    Get Negotiation Scripts →
                  </Link>
                </div>
              </div>
            </section>
          ) : null}

          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter learn by money type">
            {(
              [
                ['all', 'All'],
                ['saves_money', 'Saves money'],
                ['finds_funds', 'Finds funds'],
                ['alternative_solution', 'Alternative'],
              ] as const
            ).map(([id, label]) => {
              const active = learnMoneyFilter === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setLearnMoneyFilter(id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition ${
                    active
                      ? 'bg-[rgb(var(--navy))] text-white shadow-sm'
                      : 'border border-slate-200 bg-white text-slate-600 hover:border-teal-200 hover:bg-millennial-primary-light/25'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {learnMoneyFiltered.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="group rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm ring-1 ring-slate-100/80 transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
              >
                <div className="flex flex-wrap gap-1.5">
                  {item.moneyTags.includes('saves_money') ? (
                    <MoneyTag variant="savings" amount={item.savesAmount} />
                  ) : null}
                  {item.moneyTags.includes('finds_funds') ? (
                    <MoneyTag variant="funds" amount={item.findsAmount} />
                  ) : null}
                  {item.moneyTags.includes('alternative_solution') ? <MoneyTag variant="alternative" /> : null}
                </div>
                <span className="mt-2 inline-block rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-900">
                  {item.tag}
                </span>
                <p className="mt-2 font-bold text-slate-900">{item.title}</p>
                <p className="mt-1 text-sm text-slate-600">{item.sub}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-teal-800">
                  Open
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              </Link>
            ))}
          </div>

          {displayStep.phaseOrder >= 3 && !tierAtLeast(effectiveTier, 'momentum') ? (
            <LockedFeatureCard
              title="Scripts and checklists for later phases"
              description="Your full playbook lives in the Library — unlock it when you want structure through every phase."
              nextTier="momentum"
              mindsetLine="Momentum is for buyers who want structure and momentum."
              upgradeHref="/upgrade?source=learn-phase&tier=momentum"
            />
          ) : null}

          {tierAtLeast(effectiveTier, 'navigator') && !tierAtLeast(effectiveTier, 'navigator_plus') ? (
            <div className="rounded-2xl border border-violet-200/80 bg-violet-50/70 p-4 sm:p-5">
              <p className="text-sm font-bold text-violet-950">Want unlimited expert back-and-forth?</p>
              <p className="mt-1 text-sm text-slate-700">
                Navigator+ adds unlimited Q&amp;A and weekly check-ins when questions start piling up.
              </p>
              <p className="mt-2 text-xs italic text-slate-600">&ldquo;{TIER_DEFINITIONS.navigator_plus.mindset}&rdquo;</p>
              <Link
                href="/upgrade?source=learn-human&tier=navigator_plus"
                className="mt-2 inline-flex text-sm font-bold text-violet-900 underline underline-offset-2 hover:text-violet-950"
              >
                Explore Navigator+
              </Link>
            </div>
          ) : null}

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-violet-800/90">Start here — myth cards</h3>
            <p className="mt-1 text-sm text-slate-600">
              Quick reframes that make the next conversation with a lender or agent calmer.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <LearningCard
              userTier={effectiveTier}
              href="/resources"
              title="Closing costs"
              sub="What shows up at signing"
              tag="Basic myth"
              minTier="foundations"
            />
            <LearningCard
              userTier={effectiveTier}
              href="/resources"
              title="Rent vs buy"
              sub="Frame the tradeoffs calmly"
              tag="Basic myth"
              minTier="foundations"
            />
            <LearningCard
              userTier={effectiveTier}
              href="/resources"
              title="DTI basics"
              sub="How lenders size you"
              tag={hasJourneyFeature(effectiveTier, 'learning_library_full') ? 'Deep concept' : 'Key concept'}
              minTier={hasJourneyFeature(effectiveTier, 'learning_library_full') ? 'foundations' : 'momentum'}
            />
          </div>

          {!hasJourneyFeature(effectiveTier, 'learning_library_full') ? (
            <LockedFeatureCard
              title="Full learning library"
              description="Move to Momentum for every script, checklist, and timed module alongside your roadmap."
              nextTier="momentum"
              upgradeHref="/upgrade?source=learn-library&tier=momentum"
            />
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <LearningCard
              userTier={effectiveTier}
              href="/resources"
              title="Market-specific insights"
              sub="Hyper-local trends and offer strategy context when you are deep in the hunt."
              tag="Navigator+"
              minTier="navigator_plus"
              isPremiumDeepDive
            />
          </div>

          {hasLearnContent ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,7.5rem)_1fr] sm:items-stretch">
              <div className="flex flex-row items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-millennial-cta-primary to-millennial-cta-secondary px-4 py-3 shadow-lg shadow-slate-900/15 ring-1 ring-white/20 sm:flex-col sm:gap-2.5 sm:px-3 sm:py-4 sm:text-center">
                <Lightbulb className="h-5 w-5 shrink-0 text-white/90 sm:h-5 sm:w-5" strokeWidth={2.5} aria-hidden />
                <h3 className="text-xs font-bold uppercase leading-snug tracking-[0.12em] text-white/95 sm:max-w-[7rem] sm:text-sm sm:leading-tight">
                  Why it matters
                </h3>
              </div>
              <div className="relative min-h-0 overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-md ring-1 ring-slate-100/80 sm:p-6">
                <div className="absolute right-2 top-2 opacity-[0.06] sm:right-3 sm:top-3">
                  <Lightbulb className="h-14 w-14 text-millennial-cta-primary" strokeWidth={1} aria-hidden />
                </div>
                {displayStep.nqWhyItMattersCards && displayStep.nqWhyItMattersCards.length > 0 ? (
                  <div className="relative">
                    <h4 className="mb-5 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                      Myths worth knowing
                    </h4>
                    <ul className="grid list-none gap-4 lg:grid-cols-3 lg:gap-4" role="list">
                      {displayStep.nqWhyItMattersCards.map((card, i) => {
                        const Icon = WHY_IT_MATTERS_MYTH_ICONS[i] ?? Lightbulb
                        const ring = WHY_IT_MATTERS_MYTH_ICON_STYLES[i] ?? 'bg-slate-100 text-slate-700 ring-slate-200'
                        const expanded = openMythTitle === card.title
                        return (
                          <motion.li
                            key={card.title}
                            layout
                            whileHover={reduceMotion ? undefined : { y: -2 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                            className="rounded-xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/90 p-4 shadow-sm ring-1 ring-slate-100/70"
                          >
                            <button
                              type="button"
                              onClick={() => setOpenMythTitle(expanded ? null : card.title)}
                              aria-expanded={expanded}
                              className="flex w-full items-start gap-3.5 text-left"
                            >
                              <div
                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ${ring}`}
                                aria-hidden
                              >
                                <Icon className="h-5 w-5" strokeWidth={2} />
                              </div>
                              <div className="min-w-0 flex-1 pt-0.5">
                                <span className="flex items-start justify-between gap-2">
                                  <span className="text-base font-bold leading-snug text-slate-900">{card.title}</span>
                                  <ChevronDown
                                    className={`mt-0.5 h-5 w-5 shrink-0 text-slate-400 transition-transform ${
                                      expanded ? 'rotate-180' : ''
                                    }`}
                                    aria-hidden
                                  />
                                </span>
                              </div>
                            </button>
                            {expanded ? (
                              <p className="mt-3 border-t border-slate-100 pt-3 text-sm leading-relaxed text-slate-600">
                                {renderNqSaysContext(card.detail)}
                              </p>
                            ) : (
                              <p className="mt-2 text-xs text-slate-500">Tap to expand</p>
                            )}
                          </motion.li>
                        )
                      })}
                    </ul>
                  </div>
                ) : displayStep.nqWhatItMeans ? (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMythTitle((t) => (t === '__whatItMeans__' ? null : '__whatItMeans__'))
                      }
                      aria-expanded={openMythTitle === '__whatItMeans__'}
                      className="flex w-full items-center justify-between gap-3 text-left"
                    >
                      <span className="text-sm font-bold uppercase tracking-wide text-slate-600">
                        Why this step matters
                      </span>
                      <ChevronDown
                        className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${
                          openMythTitle === '__whatItMeans__' ? 'rotate-180' : ''
                        }`}
                        aria-hidden
                      />
                    </button>
                    {openMythTitle === '__whatItMeans__' ? (
                      <p className="mt-3 text-lg leading-relaxed text-slate-800 sm:text-xl sm:leading-relaxed">
                        {renderNqSaysContext(displayStep.nqWhatItMeans)}
                      </p>
                    ) : (
                      <p className="mt-2 text-xs text-slate-500">Tap to expand</p>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-6 text-slate-600">
              NQ will drop in more &ldquo;myths worth knowing&rdquo; and explainers as you move through milestones. Meanwhile, start with the library picks above.
            </p>
          )}

          {nextStepTitles.length > 0 ? (
            <div className="rounded-2xl border border-slate-200/90 bg-slate-50/80 p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Recommended for your phase · {phaseHeadingTitle ?? 'this phase'}
              </p>
              <ul className="mt-3 list-none space-y-2">
                {nextStepTitles.map((t) => (
                  <li key={t}>
                    <button
                      type="button"
                      onClick={() => goTab('phase')}
                      className="text-left text-sm font-semibold text-teal-900 underline decoration-millennial-cta-primary/60 underline-offset-2 hover:text-teal-950"
                    >
                      {t}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      {activeTab === 'library' ? (
        <div
          role="tabpanel"
          id="journey-panel-library"
          aria-labelledby="journey-tab-library"
          className="scroll-mt-28 space-y-6"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Library</h2>
              <p className="mt-2 max-w-prose text-slate-600">
                Scripts, guides, and checklists — curated to pair with your journey. Full archive also lives on the
                site resources area.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <TierBadge tier={effectiveTier} compact className="sm:max-w-[220px]" />
              <MindsetTag mindset={mindsetFor(effectiveTier)} className="max-w-[260px]" />
            </div>
          </div>

          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <label htmlFor="journey-library-search" className="sr-only">
              Search library
            </label>
            <input
              id="journey-library-search"
              type="search"
              value={libraryQuery}
              onChange={(e) => setLibraryQuery(e.target.value)}
              placeholder="Search titles and summaries…"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm font-medium text-slate-900 shadow-sm outline-none ring-teal-200 transition focus:border-millennial-cta-primary focus:ring-2"
            />
          </div>

          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Library categories"
          >
            {(
              [
                'all',
                'scripts',
                'checklists',
                'guides',
                'money_finder',
                'savings_strategies',
                'alternative_solutions',
              ] as const
            ).map((cat) => {
              const label =
                cat === 'all' ? 'All' : JOURNEY_LIBRARY_CATEGORY_LABEL[cat as LibraryCategoryId]
              const active = libraryCategory === cat
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setLibraryCategory(cat)}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition ${
                    active
                      ? 'bg-[rgb(var(--navy))] text-white shadow-sm'
                      : 'border border-slate-200 bg-white text-slate-600 hover:border-teal-200 hover:bg-millennial-primary-light/25'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>

          <ul className="space-y-3" role="list">
            {libraryFiltered.slice(0, 3).map((item) => (
              <li key={item.id}>
                <div className="block rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm ring-1 ring-slate-100/80 transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-700">
                      {JOURNEY_LIBRARY_CATEGORY_LABEL[item.category]}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">{item.readMin} min read</span>
                  </div>
                  <p className="mt-2 text-lg font-bold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.summary}</p>
                  <Link
                    href={item.href}
                    className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-teal-800"
                  >
                    Open
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </div>
              </li>
            ))}
          </ul>

          {libraryFiltered.length > 3 ? (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setLibraryMoreExpanded((e) => !e)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-700 shadow-sm transition hover:border-teal-200 hover:bg-millennial-primary-light/25"
                aria-expanded={libraryMoreExpanded}
              >
                {libraryMoreExpanded ? (
                  <>Show fewer resources</>
                ) : (
                  <>Show {libraryFiltered.length - 3} more resources (Momentum unlocks full archive)</>
                )}
              </button>

              <AnimatePresence initial={false}>
                {libraryMoreExpanded ? (
                  <motion.div
                    key="library-more-expanded"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4 overflow-hidden"
                  >
                    {!tierAtLeast(effectiveTier, 'momentum') ? (
                      <div className="rounded-2xl border border-[#0d9488]/25 bg-gradient-to-br from-teal-50/90 to-white p-5 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900">Unlock the full library</h3>
                        <p className="mt-2 text-sm text-slate-600">
                          Momentum unlocks every script and deep guide in this tab — one upgrade instead of repeated
                          nudges.
                        </p>
                        <ul className="mt-3 list-none space-y-2 text-sm text-slate-700">
                          <li className="flex gap-2">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#0d9488]" aria-hidden />
                            <span>All scripts &amp; checklists across phases</span>
                          </li>
                          <li className="flex gap-2">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#0d9488]" aria-hidden />
                            <span>Money Finder, savings strategies, and weekly plans</span>
                          </li>
                        </ul>
                        <p className="mt-4 text-lg font-bold text-slate-900">
                          {TIER_DEFINITIONS.momentum.price.displayMonthly}{' '}
                          <span className="text-sm font-semibold text-slate-500">billed monthly · cancel anytime</span>
                        </p>
                        <Link
                          href="/upgrade?source=library-bundle&tier=momentum"
                          className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-[#1a6b3c] px-6 py-3.5 text-center text-base font-bold text-white shadow-md transition hover:bg-[#155c33] sm:w-auto"
                        >
                          Upgrade to Momentum — $29/mo
                        </Link>
                      </div>
                    ) : (
                      <p className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-700">
                        You&apos;re on <strong>{TIER_DEFINITIONS.momentum.name}</strong> or higher — open any resource below
                        that your plan includes. Navigator+ unlocks the deepest guides marked in copy.
                      </p>
                    )}

                    <ul className="space-y-3" role="list">
                      {libraryFiltered.slice(3).map((item) => {
                        const minT = item.minTier ?? 'foundations'
                        const canOpen = tierAtLeast(effectiveTier, minT)
                        const unlockDef = TIER_DEFINITIONS[minT]
                        return (
                          <li key={item.id}>
                            <div
                              className={`rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm ring-1 ring-slate-100/80 sm:p-5 ${
                                canOpen
                                  ? 'transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md'
                                  : 'opacity-80'
                              }`}
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-700">
                                  {JOURNEY_LIBRARY_CATEGORY_LABEL[item.category]}
                                </span>
                                <span className="text-xs font-semibold text-slate-500">{item.readMin} min read</span>
                              </div>
                              <p className="mt-2 text-lg font-bold text-slate-900">{item.title}</p>
                              <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.summary}</p>
                              {canOpen ? (
                                <Link
                                  href={item.href}
                                  className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-teal-800"
                                >
                                  Open
                                  <ArrowRight className="h-4 w-4" aria-hidden />
                                </Link>
                              ) : (
                                <p className="mt-3 text-sm text-slate-500">
                                  <Lock className="inline h-3.5 w-3.5 text-slate-400" aria-hidden /> Included in{' '}
                                  <span className="font-semibold text-slate-700">{unlockDef.name}</span>
                                  {tierAtLeast(effectiveTier, 'momentum') &&
                                  (minT === 'navigator' || minT === 'navigator_plus') ? (
                                    <Link
                                      href={`/upgrade?source=library-item&tier=${minT}`}
                                      className="ml-2 font-bold text-teal-800 underline underline-offset-2"
                                    >
                                      Upgrade to {unlockDef.name}
                                    </Link>
                                  ) : null}
                                </p>
                              )}
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          ) : null}

          {libraryFiltered.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-6 text-center text-slate-600">
              No matches — try another category or a shorter search.
            </p>
          ) : null}

          <Link
            href="/resources"
            className="inline-flex items-center gap-2 text-sm font-bold text-teal-900 underline decoration-millennial-cta-primary/60 underline-offset-2 hover:text-teal-950"
          >
            Browse all resources on the site
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      ) : null}

      {activeTab === 'inbox' ? (
        <div
          role="tabpanel"
          id="journey-panel-inbox"
          aria-labelledby="journey-tab-inbox"
          className="scroll-mt-28 space-y-8"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Inbox</h2>
              <p className="mt-2 max-w-prose text-slate-600">
                Alerts, tasks, and messages — everything that needs your attention in one calm view.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <TierBadge tier={effectiveTier} compact className="sm:max-w-[220px]" />
              <MindsetTag mindset={mindsetFor(effectiveTier)} className="max-w-[260px]" />
            </div>
          </div>

          {!hasJourneyFeature(effectiveTier, 'inbox_priority_sort') ? (
            <LockedFeatureCard
              title="Priority inbox sorting"
              description="Surface lender asks, nudges, and deadlines in the order that protects your timeline."
              nextTier="momentum"
              upgradeHref="/upgrade?source=inbox&tier=momentum"
            />
          ) : null}

          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-sm font-bold uppercase tracking-wide text-slate-600">Suggested next steps</p>
            <ul className="mt-3 list-none space-y-3">
              {nextEngine.actions.map((a) => (
                <li key={`inbox-ns-${a.id}`} className="flex flex-col gap-1.5">
                  <div className="flex flex-wrap gap-2">
                    {a.pillar === 'savings' ? <MoneyTag variant="saves_label" /> : null}
                    {a.pillar === 'funds' ? <MoneyTag variant="finds_label" /> : null}
                    {a.pillar === 'alternative' ? <MoneyTag variant="alternative" /> : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => followNextHint(a.hint)}
                    className="text-left text-sm font-semibold text-teal-900 underline decoration-millennial-cta-primary/60 underline-offset-2"
                  >
                    {a.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {docTaskTouched && !hasJourneyFeature(effectiveTier, 'journey_concierge') ? (
            <UpsellCard
              id="nq-inbox-doc-concierge"
              title="Documents piling up?"
              valueLine="Navigator+ adds full journey concierge and weekly check-ins when paperwork gets heavy."
              nextTier="navigator_plus"
              upgradeHref="/upgrade?source=inbox-docs&tier=navigator_plus"
            />
          ) : null}

          <section aria-labelledby="inbox-alerts-heading" className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-5 sm:p-6">
            <h3 id="inbox-alerts-heading" className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-amber-900">
              <Bell className="h-4 w-4 shrink-0" aria-hidden />
              Alerts
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-amber-950" role="list">
              <li className="flex gap-2 rounded-lg bg-white/80 px-3 py-2 shadow-sm">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
                <span>
                  Rate quotes are moving weekly — if you&apos;re pre-approved, consider refreshing quotes before
                  you go under contract.
                </span>
              </li>
              <li className="flex gap-2 rounded-lg bg-white/80 px-3 py-2 shadow-sm">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
                <span>Wire fraud reminder: always confirm wiring instructions by phone on a number you trust.</span>
              </li>
            </ul>
          </section>

          <section aria-labelledby="inbox-tasks-heading" className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6">
            <h3 id="inbox-tasks-heading" className="text-sm font-bold uppercase tracking-wide text-slate-600">
              Tasks
            </h3>
            <ul className="mt-4 list-none space-y-3" role="list">
              {inboxTasks.map((task, idx) => (
                <li key={task.id} className="flex items-start gap-3">
                  <input
                    id={`inbox-task-${task.id}`}
                    type="checkbox"
                    checked={task.done}
                    onChange={() => {
                      setInboxTasks((prev) =>
                        prev.map((t, i) => (i === idx ? { ...t, done: !t.done } : t))
                      )
                      const nextDone = !task.done
                      if (
                        nextDone &&
                        /upload|document|pay stub|lender portal/i.test(task.label)
                      ) {
                        setDocTaskTouched(true)
                      }
                    }}
                    className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-millennial-cta-primary focus:ring-millennial-cta-primary"
                  />
                  <label
                    htmlFor={`inbox-task-${task.id}`}
                    className={`cursor-pointer text-sm leading-snug sm:text-base ${
                      task.done ? 'text-slate-400 line-through' : 'font-medium text-slate-800'
                    }`}
                  >
                    {task.label}
                    <span className="mt-1 flex flex-wrap gap-1">
                      {task.savesAmount != null && task.savesAmount > 0 ? (
                        <MoneyTag variant="savings" amount={task.savesAmount} />
                      ) : null}
                      {task.findsAmount != null && task.findsAmount > 0 ? (
                        <MoneyTag variant="funds" amount={task.findsAmount} />
                      ) : null}
                      {task.altUnlock ? <MoneyTag variant="alternative" /> : null}
                    </span>
                    {!task.done ? (
                      <span className="mt-1 block text-xs font-medium text-slate-600">
                        {task.findsAmount != null && task.findsAmount > 0
                          ? `You just unlocked a potential funding move worth about ${formatCurrency(task.findsAmount)}.`
                          : task.savesAmount != null && task.savesAmount > 0
                            ? `Nice — this task may protect about ${formatCurrency(task.savesAmount)} in ongoing savings.`
                            : task.altUnlock
                              ? 'Most buyers skip this alternative path check; completing it keeps options open.'
                              : 'Small action now, calmer decisions later.'}
                      </span>
                    ) : (
                      <span className="mt-1 block text-xs font-medium text-emerald-700">Great work — progress like this compounds fast.</span>
                    )}
                  </label>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="inbox-messages-heading" className="rounded-2xl border border-slate-200/90 bg-slate-50/80 p-5 sm:p-6">
            <h3 id="inbox-messages-heading" className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-600">
              <Mail className="h-4 w-4 shrink-0" aria-hidden />
              Messages
            </h3>
            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">NQ</p>
                <p className="mt-1 text-sm text-slate-700">
                  When you&apos;re ready, open <strong className="font-semibold text-slate-900">Your Phase</strong> and
                  check off one checklist item — small wins keep momentum.
                </p>
              </div>
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-200 bg-white/60 px-4 py-6 text-center">
                <Mail className="h-7 w-7 text-slate-300" aria-hidden />
                <p className="text-sm font-medium text-slate-500">No new messages</p>
                <p className="text-xs text-slate-400">Lender updates, agent notes, and NQ tips will appear here as your journey progresses.</p>
              </div>
            </div>
          </section>

          <Link
            href="/inbox"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-millennial-cta-primary to-millennial-cta-secondary px-5 py-3.5 text-base font-bold text-white shadow-md transition hover:shadow-lg sm:w-auto"
          >
            Open full inbox
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      ) : null}

      {activeTab === 'upgrades' ? (
        <div
          role="tabpanel"
          id="journey-panel-upgrades"
          aria-labelledby="journey-tab-upgrades"
          className="scroll-mt-28 space-y-6"
        >
          <TierPreviewSwitcher
            currentTier={userTier}
            previewTier={previewTier}
            onPreviewChange={setPreviewTier}
          />
        </div>
      ) : null}

      <ReferralProgramModal
        open={referralRoadmapOpen !== null}
        onClose={() => setReferralRoadmapOpen(null)}
        referralSlug={hubReferralSlug}
        milestone={
          referralRoadmapOpen === 'phase7' ? 'phase7' : referralRoadmapOpen === 'quiz' ? 'quiz' : 'preapproval'
        }
        storageKeyOnDismiss={
          referralRoadmapOpen === 'phase7'
            ? REFERRAL_PROMPT_LS.afterPhase7PostClosing
            : referralRoadmapOpen === 'quiz'
              ? REFERRAL_PROMPT_LS.afterQuizResults
              : REFERRAL_PROMPT_LS.afterPreApprovalPhase
        }
      />
    </div>
  )
}


function ToolTierLockCallout({
  toolLabel,
  requiredTier,
  userTier,
}: {
  toolLabel?: string
  requiredTier: UserTier
  userTier: UserTier
}) {
  const reqIdx = TIER_ORDER.indexOf(requiredTier)
  const userIdx = TIER_ORDER.indexOf(userTier)
  if (userIdx >= reqIdx) return null
  const def = TIER_DEFINITIONS[requiredTier]
  return (
    <div className="relative mt-4 flex w-full flex-col items-center gap-2 rounded-xl border-2 border-amber-200 bg-amber-50 px-4 py-3 text-center">
      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-800">
        <Lock className="h-4 w-4 text-amber-600" aria-hidden />
        {toolLabel ?? 'This tool'} is included in {def.name}
      </span>
      <p className="text-xs italic text-amber-900/90">&ldquo;{def.mindset}&rdquo;</p>
      <Link
        href={`/upgrade?source=nq-guided-tool&tier=${requiredTier}`}
        className="text-sm font-bold text-amber-800 underline underline-offset-2 hover:text-amber-950"
      >
        Upgrade to {def.name}
      </Link>
    </div>
  )
}

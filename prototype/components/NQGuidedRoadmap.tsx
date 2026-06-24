'use client'

import {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  type ReactNode,
} from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useSafeSearchParams } from '@/lib/use-safe-search-params'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import {
  Lock,
  ArrowRight,
  CaretLeft,
  Check,
  Sparkle,
  ChatCircle,
  Target,
  Lightbulb,
  Question,
  Receipt,
  Calendar,
  Gauge,
  CaretDown,
  MagnifyingGlass,
  Bell,
  Envelope,
  WarningCircle,
  Copy,
  Gift,
  BookOpen,
  ArrowSquareOut,
  MapPin,
  CaretRight,
} from '@phosphor-icons/react'
import { openCompassChat } from '@/lib/open-compass-chat'
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
import { useMilestoneGate } from '@/components/journey/MilestoneGate'
import FirstGenJourneyHub from '@/components/journey/FirstGenJourneyHub'
import TierBadge from '@/components/TierBadge'
import TierPreviewSwitcher from '@/components/TierPreviewSwitcher'
import { useTierMindset } from '@/components/tier-mindset/TierMindsetProvider'
import MindsetTag from '@/components/journey/MindsetTag'
import JourneyTimeline from '@/components/journey/JourneyTimeline'
import DailyInsightCard from '@/components/journey/DailyInsightCard'
import WeeklyLessonCard from '@/components/journey/WeeklyLessonCard'
import JourneyWinsBoard from '@/components/journey/JourneyWinsBoard'
import JourneyNextMilestoneTeaser from '@/components/journey/JourneyNextMilestoneTeaser'
import JourneyTabHeroShell from '@/components/journey/JourneyTabHeroShell'
import { labelForWinsBoard } from '@/lib/nq-completed-actions'
import { recordCompletion, setNextActionStartedNow } from '@/lib/nq-record-completion'
import { useICP } from '@/lib/icp-context'
import LearningCard from '@/components/journey/LearningCard'
import LockedFeatureCard from '@/components/journey/LockedFeatureCard'
import UpgradeLockCallout, {
  upgradeLockSecondaryLinkClass,
} from '@/components/monetization/UpgradeLockCallout'
import JourneyOnboardingFlow from '@/components/journey/JourneyOnboardingFlow'
import JourneyTodayChecklistCard from '@/components/journey/JourneyTodayChecklistCard'
import JourneyTodayStatusStrip from '@/components/journey/JourneyTodayStatusStrip'
import JourneyPlanTab from '@/components/journey/JourneyPlanTab'
import MoneyInsights from '@/components/journey/MoneyInsights'
import WhyItMattersCard from '@/components/journey/WhyItMattersCard'
import NextStepCard from '@/components/journey/NextStepCard'
import { CertificatePreview } from '@/components/journey/CertificatePreview'
import HudCounselorHandoffCard from '@/components/journey/HudCounselorHandoffCard'
import PhaseCertificateModal from '@/components/journey/PhaseCertificateModal'
import PhaseReengagementModal from '@/components/journey/PhaseReengagementModal'
import { isPhaseCertificateModalDismissed } from '@/lib/phase-certificates'
import { isPhaseReengagementModalShown } from '@/lib/phase-reengagement'
import { SavingsLedger } from '@/components/journey/SavingsLedger'
import { syncNqUnreadFromInboxState } from '@/lib/nq-unread-alerts'
import { startMomentumTrialFromUi } from '@/lib/start-momentum-trial-client'
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
import { consumeMoveUpWizardJourneySync } from '@/lib/move-up-journey-sync'

function getOverviewWarmth(snapshot: UserSnapshot | null): string {
  if (snapshot == null) {
    return 'Run your snapshot once and this page becomes a calm home base for your numbers.'
  }
  const total = snapshot.readiness.total
  if (total >= 60) return "You're making progress!"
  if (total >= 40) return "You're building momentum."
  return "You're building a strong foundation."
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
              className="font-semibold text-[var(--nq-ed-accent)] underline decoration-[var(--nq-ed-accent)]/70 underline-offset-2 hover:text-[#0f6058]"
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
        <strong key={i} className="font-bold not-italic text-[var(--nq-ed-accent)]">
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

const WHY_IT_MATTERS_MYTH_ICONS = [Receipt, Calendar, Gauge] as const
const WHY_IT_MATTERS_MYTH_ICON_STYLES = [
  'bg-[var(--nq-ed-accent-soft)] text-[var(--nq-ed-accent)] ring-[var(--nq-ed-accent)]/20/80',
  'bg-amber-100 text-amber-800 ring-amber-200/70',
  'bg-violet-100 text-violet-700 ring-violet-200/70',
] as const

const PHASE_CHECKLIST_LS = 'nq_phase_checklist_v1'

const ONBOARDING_LS = 'nq_customized_onboarding_v1'

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
  const { content } = useICP()
  const { userTier, effectiveTier, mindsetFor } =
    useTierMindset()
  const reduceMotion = useReducedMotion() ?? false
  const router = useRouter()
  const searchParams = useSafeSearchParams()
  /** `toString()` dependency: ensures updates on client query changes (some Next versions reuse the ReadonlyURLSearchParams ref). */
  const searchKey = searchParams.toString()
  const activeTabFromUrl = useMemo(
    () => parseJourneyTabParam(new URLSearchParams(searchKey).get('tab')),
    [searchKey]
  )
  const activeTab = activeTabProp ?? activeTabFromUrl
  const { setJourneyNavChrome } = useJourneyNavChrome()
  const { tryOpenGate } = useMilestoneGate()

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
    setPreviewTier(userTier)
  }, [userTier])

  useEffect(() => {
    if (activeTab !== 'learn' || typeof window === 'undefined') return
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

  const handleCertificatePurchase = useCallback(async () => {
    try {
      const res = await fetch('/api/checkout/completion-certificate', { method: 'POST' })
      const data = (await res.json()) as { url?: string; error?: string }
      if (!res.ok) throw new Error(typeof data.error === 'string' ? data.error : 'Checkout failed')
      if (data.url) {
        window.location.href = data.url
        return
      }
      throw new Error('No checkout URL')
    } catch {
      router.push('/upgrade?source=certificate-preview&tier=momentum')
    }
  }, [router])

  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [snapshot, setSnapshot] = useState<UserSnapshot | null>(null)
  const [quizTxnMeta, setQuizTxnMeta] = useState<
    ReturnType<typeof getStoredQuizTransactionMeta>
  >({ transactionType: null, icpType: null })

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

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.dispatchEvent(new Event('nq-journey-progress'))
  }, [completedSteps, currentStepIndex])

  const referralPromptPrevCompletedRef = useRef<Set<number> | null>(null)
  const phaseCompletionPrevRef = useRef<Set<number> | null>(null)
  const [referralRoadmapOpen, setReferralRoadmapOpen] = useState<
    null | 'preapproval' | 'phase7' | 'quiz'
  >(null)
  const [reengagementPhase, setReengagementPhase] = useState<number | null>(null)
  const [certificatePhase, setCertificatePhase] = useState<number | null>(null)
  const [pendingCertificatePhase, setPendingCertificatePhase] = useState<number | null>(null)

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

  useEffect(() => {
    if (typeof window === 'undefined') return
    const phaseOrders = [1, 2, 3, 4, 5, 6, 7] as const
    const currentlyComplete = new Set(phaseOrders.filter((o) => isNqGuidedPhaseFullyComplete(o, completedSteps)))

    if (phaseCompletionPrevRef.current === null) {
      phaseCompletionPrevRef.current = currentlyComplete
      return
    }

    const prev = phaseCompletionPrevRef.current
    for (const order of phaseOrders) {
      const nowComplete = currentlyComplete.has(order)
      const wasComplete = prev.has(order)
      if (!nowComplete || wasComplete) continue

      const showReengagement = order <= 6 && !isPhaseReengagementModalShown(order)
      const showCertificate = !isPhaseCertificateModalDismissed(order)

      if (showReengagement) {
        setReengagementPhase(order)
        if (showCertificate) setPendingCertificatePhase(order)
      } else if (showCertificate) {
        setCertificatePhase(order)
      }
      break
    }

    phaseCompletionPrevRef.current = currentlyComplete
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

  useEffect(() => {
    syncNqUnreadFromInboxState(activeTab, inboxTasks)
  }, [activeTab, inboxTasks])

  const [learnMoneyFilter, setLearnMoneyFilter] = useState<LearnMoneyFilterId>('all')
  const [budgetMonthlyPair, setBudgetMonthlyPair] = useState({ sketch: 0, base: 0 })
  const [onboardingComplete, setOnboardingComplete] = useState(false)
  const [onboardingHydrated, setOnboardingHydrated] = useState(false)
  const [previewTier, setPreviewTier] = useState<UserTier>(userTier)
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
    const doneStep = getNQStepByIndex(currentStepIndex)
    if (doneStep && typeof window !== 'undefined') {
      recordCompletion({
        id: `nq-step-${doneStep.id}`,
        label: personalizeNqStep(doneStep, snapshot).title,
        completedAt: new Date().toISOString(),
      })
    }
    if (!isLastStep) {
      setTimeout(() => {
        setCurrentStepIndex((i) => i + 1)
        setNextActionStartedNow()
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
        if (!base[index] && next[index]) {
          recordCompletion({
            id: `nq-checklist-${step.id}-${index}`,
            label: labelForWinsBoard(items[index]),
            completedAt: new Date().toISOString(),
          })
        }
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

  useEffect(() => {
    if (!step || step.phaseOrder !== 1) return
    const items = personalizeNqStep(step, snapshot).nqPhaseChecklist
    if (!items?.length) return
    if (phaseChecklistDone.length !== items.length) return
    if (!phaseChecklistDone.every(Boolean)) return
    tryOpenGate('progress', '100')
  }, [step, snapshot, phaseChecklistDone, tryOpenGate])

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

  const [phaseLockModal, setPhaseLockModal] = useState<'trial' | 'hint' | null>(null)
  const [phaseLockHintText, setPhaseLockHintText] = useState('')

  const onRoadmapLockedPhase = useCallback(
    (phaseOrder: number) => {
      const hint =
        phaseOrder === 8 && !isHomeownerHubPhaseUnlocked(completedSteps)
          ? 'Complete all milestones in Post-Closing first.'
          : undefined
      if (hint) {
        setPhaseLockHintText(hint)
        setPhaseLockModal('hint')
        return
      }
      setPhaseLockModal('trial')
    },
    [completedSteps]
  )

  const handleStartTrialFromPhaseLock = useCallback(() => {
    void startMomentumTrialFromUi('phase_lock', router.push).finally(() => setPhaseLockModal(null))
  }, [router])

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
  const progressPct = Math.min(
    100,
    ((step.phaseOrder - 1 + milestoneIndexInPhase / milestonesInPhase) / progressDenom) * 100
  )
  const phasesDoneCount = countNqGuidedPhasesFullyComplete(completedSteps)
  const certificatePhasesCompleted = useMemo(
    () =>
      ([1, 2, 3, 4, 5, 6, 7] as const).filter((o) => isNqGuidedPhaseFullyComplete(o, completedSteps)).length,
    [completedSteps]
  )

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

  const nextStepForTeaser = NQ_GUIDED_STEPS[currentStepIndex + 1]
  const nextUnlockFeatureTitle =
    nextStepForTeaser?.title ??
    nextLibraryPhase?.features[0]?.title ??
    nextLibraryPhase?.title ??
    'Your next milestone'

  const currentStepMarkedDone = completedSteps.has(currentStepIndex)

  const nextStepTitles = NQ_GUIDED_STEPS.slice(currentStepIndex + 1, currentStepIndex + 3).map((s) => s.title)

  const hosaFeatures = TIER_DEFINITIONS[effectiveTier].features.hosa
  const showFullHosaBreakdown =
    Boolean(hosaFeatures.optimizationScore) && tierAtLeast(effectiveTier, 'momentum')

  const overviewWarmth = getOverviewWarmth(snapshot)

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

  const [xpLeaderboardLockReason, setXpLeaderboardLockReason] = useState(
    'Complete the quiz to start earning XP. Momentum unlocks levels and the leaderboard.'
  )
  useEffect(() => {
    const p = getUserProgress()
    if (!p) return
    setXpLeaderboardLockReason(
      `${p.totalXp} XP total · ${p.currentStreak}-day streak. Momentum unlocks levels and the leaderboard.`
    )
  }, [])

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

  const showTodayLoading = activeTab === 'today' && !onboardingHydrated
  const showOnboardingTour = onboardingHydrated && !onboardingComplete && activeTab === 'today'
  const showTodayPanel = activeTab === 'today' && onboardingHydrated && !showOnboardingTour

  const todayChecklistSlot =
    displayStep && showOnboardingTour ? (
      <JourneyTodayChecklistCard
        embedded
        displayStep={displayStep}
        phaseChecklistItems={phaseChecklistItems}
        phaseChecklistDone={phaseChecklistDone}
        togglePhaseChecklist={togglePhaseChecklist}
        renderNqSaysContext={renderNqSaysContext}
        renderWithAnnualCreditReportLink={renderWithAnnualCreditReportLink}
        onIDidIt={handleIDidIt}
        onSkip={handleSkip}
        onBack={handleBack}
        currentStepMarkedDone={currentStepMarkedDone}
        isLastStep={isLastStep}
        currentStepIndex={currentStepIndex}
        reduceMotion={reduceMotion ?? false}
      />
    ) : null

  const todayStatusStrip = (
    <JourneyTodayStatusStrip
      inset
      displayPhaseOrder={displayPhaseOrder}
      phaseTotalForDisplay={phaseTotalForDisplay}
      phaseHeadingTitle={phaseHeadingTitle}
      milestoneIndexInPhase={milestoneIndexInPhase}
      milestonesInPhase={milestonesInPhase}
      progressPct={progressPct}
      accentColor={content.accentColor}
    />
  )

  return (
    <div
      className="nq-ed-roadmap nq-journey-roadmap-root leading-relaxed"
      data-active-tab={activeTab}
    >
      {showTodayLoading ? (
        <div
          role="tabpanel"
          id="journey-panel-today"
          aria-labelledby="journey-tab-today"
          className="nq-journey-tab-panel"
          aria-busy="true"
        >
          <JourneyTabHeroShell
            eyebrow="Today"
            title="Your next move"
            description="Loading your current step…"
            headingId="journey-today-heading"
          />
        </div>
      ) : null}

      {showOnboardingTour ? (
        <div
          role="tabpanel"
          id="journey-panel-today"
          aria-labelledby="journey-tab-today"
          className="nq-journey-tab-panel"
        >
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
          statusStrip={todayStatusStrip}
          todayChecklist={todayChecklistSlot}
          onComplete={() => {
              try {
                localStorage.setItem(ONBOARDING_LS, '1')
                window.dispatchEvent(new Event('nq-onboarding-complete'))
              } catch {
                // ignore
              }
              setOnboardingComplete(true)
            }}
            reduceMotion={reduceMotion ?? false}
          />
        </div>
      ) : null}

      {showTodayPanel ? (
        <div
          role="tabpanel"
          id="journey-panel-today"
          aria-labelledby="journey-tab-today"
          className="nq-journey-tab-panel"
        >
          <JourneyTabHeroShell
            eyebrow="Today"
            title="Your next move"
            description="One focused task at a time — finish today's step, then use Plan, Money, or Learn for more depth."
            headingId="journey-today-heading"
          >
            {todayStatusStrip}
          </JourneyTabHeroShell>

          {displayStep ? (
            <>
              <section className="nq-ed-soft-card border border-[var(--nq-ed-line)] p-5 sm:p-6">
                <JourneyTodayChecklistCard
                  embedded
                  displayStep={displayStep}
                  phaseChecklistItems={phaseChecklistItems}
                  phaseChecklistDone={phaseChecklistDone}
                  togglePhaseChecklist={togglePhaseChecklist}
                  renderNqSaysContext={renderNqSaysContext}
                  renderWithAnnualCreditReportLink={renderWithAnnualCreditReportLink}
                  onIDidIt={handleIDidIt}
                  onSkip={handleSkip}
                  onBack={handleBack}
                  currentStepMarkedDone={currentStepMarkedDone}
                  isLastStep={isLastStep}
                  currentStepIndex={currentStepIndex}
                  reduceMotion={reduceMotion ?? false}
                />
              </section>

              <p className="text-center text-sm text-[var(--nq-ed-muted)]">
                Need more depth?{' '}
                <button
                  type="button"
                  onClick={() => goTab('plan')}
                  className="font-semibold text-[var(--nq-ed-accent)] underline decoration-[var(--nq-ed-accent)]/40 underline-offset-2 hover:text-[#0f6058]"
                >
                  My Plan
                </button>
                {' · '}
                <button
                  type="button"
                  onClick={() => goTab('money')}
                  className="font-semibold text-[var(--nq-ed-accent)] underline decoration-[var(--nq-ed-accent)]/40 underline-offset-2 hover:text-[#0f6058]"
                >
                  Money
                </button>
                {' · '}
                <button
                  type="button"
                  onClick={() => goTab('learn')}
                  className="font-semibold text-[var(--nq-ed-accent)] underline decoration-[var(--nq-ed-accent)]/40 underline-offset-2 hover:text-[#0f6058]"
                >
                  Learn
                </button>
              </p>
            </>
          ) : (
            <p className="text-center text-sm text-[var(--nq-ed-muted)]">Loading your current step…</p>
          )}
        </div>
      ) : null}

      {activeTab === 'plan' ? (
        <JourneyPlanTab
          effectiveTier={effectiveTier}
          displayPhaseOrder={displayPhaseOrder}
          phaseTotalForDisplay={phaseTotalForDisplay}
          phaseHeadingTitle={phaseHeadingTitle}
          milestoneIndexInPhase={milestoneIndexInPhase}
          milestonesInPhase={milestonesInPhase}
          progressPct={progressPct}
          accentColor={content.accentColor}
          snapshot={snapshot}
          readinessWarmth={overviewWarmth}
          readinessScore={snapshot ? Math.round(snapshot.readiness.total) : undefined}
          moneyTotals={moneyTotals}
          budgetHeadline={content.budgetHeadline}
          budgetSubtext={content.budgetSubtext}
          budgetSketchLineCap={budgetSketchLineCap}
          budgetMonthlyPair={budgetMonthlyPair}
          canAccessPhase={(phaseOrder) =>
            getNqGuidedFirstAccessibleIndexInPhase(phaseOrder, canAccess) !== null
          }
          onSelectPhase={(order) => {
            goToPhase(order)
            goTab('learn')
          }}
          onLockedPhaseClick={onRoadmapLockedPhase}
          isPhaseComplete={(phaseOrder) => isNqGuidedPhaseFullyComplete(phaseOrder, completedSteps)}
          getPhaseBlockedHint={(phaseOrder) =>
            phaseOrder === 8 && !isHomeownerHubPhaseUnlocked(completedSteps)
              ? 'Complete all milestones in Post-Closing first.'
              : undefined
          }
          goTab={goTab}
          onGoToResults={onGoToResults}
          onSketchDirtyChange={(dirty) => {
            setBudgetSketchDirty(dirty)
            setJourneyNavChrome({ budgetSketchEdited: dirty })
          }}
          onSketchMonthlyCompare={(sketch, base) => {
            setBudgetMonthlyPair({ sketch, base })
          }}
          onBudgetSketchFirstCustomized={(monthlyTotal) => {
            tryOpenGate('discovery', String(Math.round(monthlyTotal)))
          }}
        />
      ) : null}

      {activeTab === 'money' && (
        <div
          role="tabpanel"
          id="journey-panel-money"
          aria-labelledby="journey-tab-money"
          className="nq-journey-tab-panel"
        >
          <JourneyTabHeroShell
            eyebrow="Money"
            title="Your capital briefing"
            description="Programs, savings, and alternatives grouped so you can scan impact before diving into detail."
            headingId="journey-money-heading"
          >
            <div className="flex flex-wrap items-center gap-2">
              <TierBadge tier={effectiveTier} className="max-w-sm" />
              <MindsetTag mindset={mindsetFor(effectiveTier)} className="hidden sm:inline-flex max-w-[280px]" />
            </div>
          </JourneyTabHeroShell>
          <div className="nq-journey-tab-grid">
            <div className="nq-journey-tab-stack">
              <MoneyInsights
                totals={moneyTotals}
                savingsDetails={savingsDetails}
                fundingDetails={fundingDetails}
                alternativeDetails={alternativeDetails}
                detailsUnlocked={moneyInsightsDetailsUnlocked}
                upgradeHref="/upgrade?source=journey-money-insights&tier=momentum"
              />
            </div>
            <aside className="nq-ed-quote hidden lg:flex" aria-label="Capital briefing">
              <div className="flex flex-col justify-between gap-6">
                <div>
                  <span className="nq-ed-eyebrow">Capital</span>
                  <h3 className="mt-3 font-display text-xl font-semibold text-[var(--nq-ed-text)] sm:text-2xl">
                    Numbers as a briefing — not widget clutter.
                  </h3>
                  <p className="mt-3 text-sm text-[var(--nq-ed-muted)]">
                    Programs, savings, and alternatives stay grouped so you can scan impact before diving into detail.
                  </p>
                </div>
                <div className="nq-ed-row">
                  <div className="nq-ed-chip">$</div>
                  <div className="min-w-0">
                    <strong className="text-[var(--nq-ed-text)]">Verify with administrators</strong>
                    <div className="text-sm text-[var(--nq-ed-muted)]">
                      Illustrative totals — confirm eligibility and dollars with lenders and program offices.
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          {unclaimedSavingsAmount != null ? (
            <UpgradeLockCallout
              className="mb-1"
              lockedLabel={`${formatCurrency(unclaimedSavingsAmount)} in unclaimed savings`}
              reason="Based on your profile, you qualify for programs and optimizations you haven't accessed yet."
              ctaLabel="Claim now — see plans →"
              ctaHref="/upgrade?source=journey-unclaimed"
            />
          ) : null}

          <AssistanceProgramsTab userTier={effectiveTier} />

          <SavingsLedger className="!mx-0 mt-0 max-w-none" />

          {snapshot ? (
            <section className="nq-ed-soft-card rounded-3xl border border-[var(--nq-ed-line)] p-5 shadow-lg sm:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--nq-ed-muted)]">Savings snapshot summary</p>
              <p className="mt-1.5 text-sm text-[var(--nq-ed-muted)]">
                Based on your target home price (when set) — not the income-based comfortable max.
              </p>
              <ul className="mt-3 space-y-2.5 text-sm text-[var(--nq-ed-muted)] sm:text-base">
                <li className="flex flex-col gap-0.5 border-b border-[var(--nq-ed-line-soft)] pb-3 sm:flex-row sm:justify-between sm:gap-4">
                  <span className="font-medium text-[var(--nq-ed-muted)]">Potential home price</span>
                  <span className="font-semibold text-[var(--nq-ed-text)] tabular-nums sm:text-right">
                    {snapshot.tokens.targetHome || <span className="font-normal text-[var(--nq-ed-muted)]">Not set</span>}
                  </span>
                </li>
                <li className="flex flex-col gap-0.5 border-b border-[var(--nq-ed-line-soft)] pb-3 sm:flex-row sm:justify-between sm:gap-4">
                  <span className="font-medium text-[var(--nq-ed-muted)]">Down payment</span>
                  <span className="font-semibold text-[var(--nq-ed-text)] tabular-nums sm:text-right">{snapshot.tokens.downPayment}</span>
                </li>
                <li className="flex flex-col gap-0.5 border-b border-[var(--nq-ed-line-soft)] pb-3 sm:flex-row sm:justify-between sm:gap-4">
                  <span className="font-medium text-[var(--nq-ed-muted)]">Indicative monthly</span>
                  <span className="shrink-0 font-semibold text-[var(--nq-ed-text)] tabular-nums sm:text-right">
                    {snapshot.tokens.targetMonthly ? <>{snapshot.tokens.targetMonthly}/mo</> : <span className="font-normal text-[var(--nq-ed-muted)]">—</span>}
                  </span>
                </li>
              </ul>
              <button type="button" onClick={onGoToResults} className="mt-4 inline-flex items-center justify-center rounded-xl border-2 border-[var(--nq-ed-accent)] bg-white px-5 py-3 text-sm font-bold text-[var(--nq-ed-accent)] shadow-md transition hover:bg-[var(--nq-ed-accent-soft)]">
                Update snapshot
              </button>
            </section>
          ) : null}

          {showFullHosaBreakdown ? (
            <div className="nq-card rounded-2xl border border-emerald-200/80 bg-white/90 p-4 shadow-sm ring-1 ring-emerald-100/70">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-900/90">HOSA Savings Score</p>
              <p className="mt-2 font-display text-3xl font-black tabular-nums text-emerald-900 sm:text-4xl">
                {snapshot ? Math.round(snapshot.readiness.total) : '—'}<span className="text-xl font-bold text-[var(--nq-ed-muted)] sm:text-2xl">/100</span>
              </p>
              <Link href="/results" className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-emerald-900 underline decoration-emerald-600/60 underline-offset-2 hover:text-emerald-950">
                View full HOSA breakdown <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
              </Link>
            </div>
          ) : snapshot ? (
            <UpgradeLockCallout
              lockedLabel="Your HOSA Savings Score (full breakdown)"
              reason={`Your score is about ${Math.round(snapshot.readiness.total)}/100. Upgrade to see the full breakdown and top savings opportunities.`}
              ctaLabel="Unlock my full score →"
              ctaHref="/upgrade?source=journey-hosa-preview&tier=momentum"
            />
          ) : null}

          <div className="nq-ed-soft-card border border-[var(--nq-ed-line)] p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <span className="nq-ed-chip flex h-10 w-10 shrink-0 items-center justify-center !rounded-xl">
                <Gift className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <span className="nq-ed-eyebrow">Referral</span>
                <h3 className="mt-1 font-display text-lg font-bold text-[var(--nq-ed-text)]">Know someone buying a home?</h3>
                <p className="mt-1 text-sm text-[var(--nq-ed-muted)]">Share your link and you both get $50 off your next plan.</p>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <code className="truncate rounded-lg border border-[var(--nq-ed-line)] bg-white px-3 py-2 text-xs text-[var(--nq-ed-text)]">{referralProgramUrl(hubReferralSlug)}</code>
                  <button type="button" onClick={() => { void navigator.clipboard.writeText(referralProgramUrl(hubReferralSlug)); setReferralCopied(true); window.setTimeout(() => setReferralCopied(false), 2000) }} className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[var(--nq-ed-accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0f6058]">
                    <Copy className="h-4 w-4" aria-hidden /> {referralCopied ? 'Copied' : 'Copy Link'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'learn' ? (
        <div
          role="tabpanel"
          id="journey-panel-learn"
          aria-labelledby="journey-tab-learn"
          className="nq-journey-tab-panel"
        >
          <JourneyTabHeroShell
            eyebrow="Learn"
            title="Your active phase guidance"
            description="Scripts, milestones, and checklists for where you are today — one calm headline at a time."
            headingId="journey-learn-heading"
          />
          <div className="nq-journey-tab-grid">
            <div className="nq-journey-tab-stack">
              <section className="nq-ed-soft-card space-y-4 border border-[var(--nq-ed-line)] p-4 sm:p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--nq-ed-line)] to-[var(--nq-ed-line)] sm:max-w-[min(100%,12rem)]" aria-hidden />
                  <p className="shrink-0 text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--nq-ed-muted)]">
                    {content.phaseFraming}
                  </p>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[var(--nq-ed-line)] to-[var(--nq-ed-line)] sm:from-[var(--nq-ed-line)] sm:via-[var(--nq-ed-line)]" aria-hidden />
                </div>

                <div className="nq-ed-quote px-5 py-5 sm:px-6 sm:py-6 md:px-8">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--nq-ed-accent)]">
                        Phase {displayPhaseOrder} of {phaseTotalForDisplay}
                      </p>
                      <h1
                        id="nq-phase-heading"
                        className="mt-2 text-2xl font-bold tracking-tight text-[var(--nq-ed-text)] sm:text-3xl md:text-[2.25rem] md:leading-tight"
                      >
                        {phaseHeadingTitle}
                      </h1>
                      {libraryPhase?.description && !refinancePhaseTitle && !repeatBuyerPhaseTitle ? (
                        <p className="mt-2 max-w-prose text-sm font-medium leading-relaxed text-[var(--nq-ed-muted)] sm:text-base">
                          {libraryPhase.description}
                        </p>
                      ) : null}
                      <p className="mt-2 text-sm text-[var(--nq-ed-muted)]">Milestone {milestoneIndexInPhase} of {milestonesInPhase}</p>
                      {!(phaseChecklistItems && phaseChecklistItems.length > 0) ? (
                        <p className="mt-1 text-xs italic text-[var(--nq-ed-muted)] sm:text-sm">Most buyers spend 2–4 weeks in this phase.</p>
                      ) : null}
                    </div>
                  </div>

                  <div
                    className="my-4 h-[3px] w-full rounded-full bg-gradient-to-r from-transparent via-[var(--nq-ed-accent)] to-transparent sm:my-5"
                    aria-hidden
                  />

                  <div className="h-1.5 w-full max-w-xl overflow-hidden rounded-full bg-[var(--nq-ed-line-soft)]">
                    <div
                      className="h-full rounded-full bg-[var(--nq-ed-accent)] transition-[width] duration-500 ease-out motion-reduce:transition-none"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              </section>
            </div>
            <aside className="nq-ed-quote hidden lg:flex" aria-label="Learn briefing">
              <div className="flex flex-col justify-between gap-6">
                <div>
                  <span className="nq-ed-eyebrow">Active phase</span>
                  <h3 className="mt-3 font-display text-xl font-semibold text-[var(--nq-ed-text)] sm:text-2xl">
                    One calm headline for where you are today.
                  </h3>
                  <p className="mt-3 text-sm text-[var(--nq-ed-muted)]">
                    Progress and milestones stay readable at a glance — the briefing column carries tone without competing with the checklist.
                  </p>
                </div>
                <div className="nq-ed-row">
                  <div className="nq-ed-chip">◇</div>
                  <div className="min-w-0">
                    <strong className="text-[var(--nq-ed-text)]">Work below the fold</strong>
                    <div className="text-sm text-[var(--nq-ed-muted)]">
                      Scripts, timeline, and “I did it” live in the main column so action stays central.
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          <div className="nq-card flex flex-col gap-2 rounded-2xl border border-[var(--nq-ed-line)] bg-white/85 px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStepIndex === 0}
              className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-[var(--nq-ed-muted)] transition-colors hover:text-[var(--nq-ed-text)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <CaretLeft className="h-4 w-4" /> Back
            </button>
            <div
              className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--nq-ed-line-soft)] bg-white/90 px-3 py-1.5 text-xs text-[var(--nq-ed-muted)]"
              title="How many roadmap phases you have finished"
            >
              <Sparkle className="h-3.5 w-3.5 shrink-0 text-amber-500" aria-hidden />
              <span className="font-semibold text-[var(--nq-ed-text)]">
                <span className="tabular-nums">{phasesDoneCount}</span>
                <span className="mx-1 font-normal text-[var(--nq-ed-muted)]">/</span>
                <span className="tabular-nums">{guidedPhaseTotal}</span>
              </span>
              <span className="text-[var(--nq-ed-muted)]">phases done</span>
            </div>
          </div>

          <WhyItMattersCard
            text={`This phase helps protect your monthly payment and cash reserves. Completing one key step now can unlock better terms later.`}
          />
          <NextStepCard
            action={nextEngine.actions[0]?.label ?? 'Open your checklist and complete one item'}
            onAction={() => followNextHint(nextEngine.actions[0]?.hint ?? 'plan')}
          />

          <DailyInsightCard />

          <WeeklyLessonCard />

          <section className="nq-card rounded-2xl border border-[var(--nq-ed-line)] bg-white p-4 shadow-sm sm:p-5">
            <JourneyTimeline
              phaseOrders={NQ_GUIDED_PHASE_ORDERS}
              effectiveTier={effectiveTier}
              currentPhaseOrder={displayPhaseOrder}
              currentSavings={snapshot?.quiz.downPayment ?? 0}
              canAccessPhase={(phaseOrder) =>
                getNqGuidedFirstAccessibleIndexInPhase(phaseOrder, canAccess) !== null
              }
              onSelectPhase={goToPhase}
              onLockedPhaseClick={onRoadmapLockedPhase}
              isPhaseComplete={(phaseOrder) => isNqGuidedPhaseFullyComplete(phaseOrder, completedSteps)}
              getPhaseBlockedHint={(phaseOrder) =>
                phaseOrder === 8 && !isHomeownerHubPhaseUnlocked(completedSteps)
                  ? 'Complete all milestones in Post-Closing first.'
                  : undefined
              }
            />
          </section>

          <JourneyWinsBoard />

          {step.phaseOrder === 8 ? (
            <HomeownerHubSection snapshot={snapshot} referralSlug={hubReferralSlug} />
          ) : null}

          {phasesDoneCount >= 3 &&
          tierAtLeast(effectiveTier, 'navigator') &&
          !tierAtLeast(effectiveTier, 'navigator_plus') ? (
            <UpgradeLockCallout
              lockedLabel="Major milestone — strategy sessions"
              reason={`Navigator+ includes personalized strategy sessions when you're deep in the journey. “${TIER_DEFINITIONS.navigator_plus.mindset}”`}
              ctaLabel="Upgrade to Navigator+"
              ctaHref="/upgrade?source=phase-milestone&tier=navigator_plus"
            />
          ) : null}

          {nextRefiTitle || nextRepeatBuyerTitle || nextLibraryPhase ? (
            <div className="nq-card rounded-2xl border border-[var(--nq-ed-line)] bg-gradient-to-br from-[var(--nq-ed-accent-soft)]/35 to-white p-4 shadow-sm sm:p-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-millennial-cta-secondary">Coming up</p>
              <p className="mt-1.5 text-base font-bold text-[var(--nq-ed-text)] sm:text-lg">
                Phase {displayPhaseOrder + 1} —{' '}
                {nextRefiTitle ?? nextRepeatBuyerTitle ?? nextLibraryPhase?.title}
              </p>
              {nextRefiTitle || nextRepeatBuyerTitle ? null : (
                <p className="mt-1.5 text-sm text-[var(--nq-ed-muted)]">{nextLibraryPhase?.description}</p>
              )}
              <button
                type="button"
                onClick={() => goTab('library')}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-[var(--nq-ed-accent)] hover:text-[#0f6058]"
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
                className="nq-ed-soft-card relative border border-[var(--nq-ed-line)] sm:rounded-2xl"
              >
                <div className="relative z-10 border-l-4 p-4 pl-4 sm:p-6 sm:pl-6" style={{ borderLeftColor: content.accentColor }}>
                  {showMomentumRoadmapBanner ? (
                    <UpgradeLockCallout
                      className="mb-4"
                      lockedLabel="Later-phase milestone (preview)"
                      reason={`Full scripts, checklists, and weekly rhythm for House Hunting onward are included in ${TIER_DEFINITIONS.momentum.name}. Browse the step below, then upgrade when you want NQ to go deeper with you.`}
                      ctaLabel="Unlock full roadmap with Momentum"
                      ctaHref="/upgrade?source=nq-guided-phase&tier=momentum"
                    />
                  ) : null}
                  <motion.div variants={itemVariants} className="mb-4 flex items-start gap-3 sm:gap-4">
                      <div className="relative">
                        <motion.div
                          className="flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[var(--nq-ed-line-soft)] bg-[var(--nq-ed-surface)] shadow-sm"
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
                        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--nq-ed-muted)]">
                          {milestonesInPhase > 1 ? (
                            <>
                              Milestone {milestoneIndexInPhase} of {milestonesInPhase}
                            </>
                          ) : (
                            <>This step</>
                          )}
                        </p>
                        <h2 className="text-xl font-bold leading-tight tracking-tight text-[var(--nq-ed-text)] sm:text-2xl md:text-[1.75rem] md:leading-snug">
                          {step.title}
                        </h2>
                      </div>
                      <div className="relative shrink-0">
                        <button
                          type="button"
                          onClick={openCompassChat}
                          title="Ask Compass"
                          className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-teal-200 bg-white text-[var(--nq-ed-accent)] shadow-sm transition-all hover:border-[var(--nq-ed-accent)] hover:bg-[var(--nq-ed-accent-soft)] hover:shadow-md"
                        >
                          <ChatCircle weight="duotone" size={24} />
                        </button>
                      </div>
                    </motion.div>

                    {nextStepTitles.length > 0 ? (
                      <motion.div
                        variants={itemVariants}
                        className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-sm"
                      >
                        <span className="font-semibold text-[var(--nq-ed-muted)]">Coming up next</span>
                        {nextStepTitles.map((t, i) => (
                          <span key={t} className="inline-flex items-center gap-1.5 text-[var(--nq-ed-muted)]">
                            {i > 0 ? <span className="text-slate-300">·</span> : null}
                            <span className="rounded-full border border-[var(--nq-ed-line)] bg-white/90 px-2.5 py-1 font-medium shadow-sm">
                              {t}
                            </span>
                          </span>
                        ))}
                      </motion.div>
                    ) : null}

                    <motion.div variants={itemVariants} className="space-y-4 pt-3">
                      <div className="rounded-xl bg-[var(--nq-ed-accent)] p-[2px] shadow-md shadow-slate-900/12">
                        <div className="relative overflow-visible rounded-[calc(0.75rem-2px)] bg-white/90 px-4 pb-3 pt-6 shadow-inner shadow-slate-100/50 sm:px-5 sm:pb-3.5 sm:pt-7">
                          <h3 className="sr-only">From NQ</h3>
                          <div className="pointer-events-none absolute left-3 top-0 z-20 -translate-y-1/2 sm:left-4">
                            <span className="relative inline-flex items-center">
                              <span className="inline-flex items-center rounded-full bg-[var(--nq-ed-accent)] py-1 pl-[1.35rem] pr-2.5 text-sm font-bold uppercase tracking-wide text-white shadow-md shadow-slate-900/15 sm:py-1.5 sm:pl-7 sm:pr-3 sm:text-base">
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
                          <p className="relative z-10 text-base italic leading-relaxed text-[var(--nq-ed-muted)] sm:text-lg sm:leading-relaxed">
                            &ldquo;{renderNqSaysContext(displayStep.nqContext)}&rdquo;
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,7.5rem)_1fr] sm:items-stretch">
                        <div className="flex flex-row items-center justify-center gap-3 rounded-2xl bg-[rgb(var(--navy))] px-4 py-3 shadow-lg shadow-slate-900/15 ring-1 ring-white/10 sm:flex-col sm:gap-2.5 sm:px-3 sm:py-4 sm:text-center">
                          <Target weight="duotone" size={20} className="shrink-0 text-teal-300/90" aria-hidden />
                          <h3 className="text-xs font-bold uppercase leading-snug tracking-[0.12em] text-white/95 sm:max-w-[7rem] sm:text-sm sm:leading-tight">
                            What to do now
                          </h3>
                        </div>
                        <div className="nq-card relative min-h-0 overflow-hidden rounded-2xl border border-[var(--nq-ed-line)] bg-white p-4 shadow-md ring-1 ring-slate-100/80 sm:p-5">
                          <div className="absolute right-2 top-2 opacity-[0.06] sm:right-3 sm:top-3">
                            <Target weight="duotone" size={56} className="text-[rgb(var(--navy))]" aria-hidden />
                          </div>
                          <p className="relative text-lg font-semibold leading-relaxed text-[var(--nq-ed-text)] sm:text-xl">
                            {renderWithAnnualCreditReportLink(displayStep.nqWhatToDo)}
                          </p>
                          {displayStep.toolLink &&
                            (hasToolAccess(displayStep, effectiveTier) ? (
                              displayStep.toolLink.startsWith('http') ? (
                                <a
                                  href={displayStep.toolLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group relative mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--nq-ed-accent)] hover:bg-[#0f6058] px-5 py-3 text-base font-bold text-white shadow-md shadow-slate-900/15 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-teal-500/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-millennial-primary-light/60"
                                >
                                  {displayStep.toolLabel || 'Open tool'}{' '}
                                  <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                                </a>
                              ) : (
                                <Link
                                  href={displayStep.toolLink}
                                  className="group relative mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--nq-ed-accent)] hover:bg-[#0f6058] px-5 py-3 text-base font-bold text-white shadow-md shadow-slate-900/15 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-teal-500/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-millennial-primary-light/60"
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
                        <div className="nq-card rounded-2xl border border-[var(--nq-ed-line)]/80 bg-slate-50/80 p-3.5 sm:p-4">
                          <p className="text-xs font-bold uppercase tracking-wide text-[var(--nq-ed-muted)]">
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
                                    className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 focus:ring-2 focus:ring-offset-0"
                                    style={{ accentColor: content.accentColor }}
                                  />
                                  <label
                                    htmlFor={cid}
                                    className={`cursor-pointer text-sm leading-snug sm:text-base ${
                                      done ? 'text-[var(--nq-ed-muted)] line-through' : 'font-medium text-[var(--nq-ed-text)]'
                                    }`}
                                  >
                                    {renderNqSaysContext(line)}
                                  </label>
                                </li>
                              )
                            })}
                          </ul>
                          <p className="mt-2 text-xs text-[var(--nq-ed-muted)]">
                            Most buyers spend 2–4 weeks in this phase.
                          </p>
                        </div>
                      ) : null}

                      {displayStep.nqEncouragement ? (
                        <div className="rounded-xl border-l-4 border-[var(--nq-ed-accent)] bg-gradient-to-r from-[var(--nq-ed-accent-soft)]/40 to-transparent py-2.5 pl-4 pr-2">
                          <p className="text-base font-semibold italic text-[var(--nq-ed-accent)]">
                            &ldquo;{displayStep.nqEncouragement}&rdquo;
                          </p>
                        </div>
                      ) : null}
                    </motion.div>

                    {displayStep.phaseOrder === 2 ? (
                      <motion.div variants={itemVariants} className="mt-4">
                        <HudCounselorHandoffCard variant="journey" />
                      </motion.div>
                    ) : null}

                    <motion.div
                      variants={itemVariants}
                      className="mt-5 flex flex-wrap gap-3 border-t border-[var(--nq-ed-line)]/80 pt-4"
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
                        type="button"
                        onClick={openCompassChat}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="inline-flex items-center gap-2 rounded-2xl border-2 border-[var(--nq-ed-line)] bg-white px-6 py-3.5 text-lg font-semibold text-[var(--nq-ed-text)] shadow-sm transition-all duration-200 hover:border-[var(--nq-ed-accent)] hover:bg-[var(--nq-ed-accent-soft)] hover:shadow-md"
                      >
                        <Question weight="duotone" size={20} className="text-[var(--nq-ed-accent)]" />
                        I need help
                      </motion.button>
                      {!isLastStep ? (
                        <button
                          type="button"
                          onClick={handleSkip}
                          className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-base font-medium text-[var(--nq-ed-muted)] underline-offset-4 transition-colors hover:bg-slate-100 hover:text-[var(--nq-ed-muted)]"
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
            className="nq-card nq-ed-soft-card rounded-2xl border border-[var(--nq-ed-line)] bg-gradient-to-br from-slate-50/80 to-white p-4 shadow-sm sm:p-5"
            aria-label="Learn and Library"
          >
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--nq-ed-muted)]">Confidence builders</p>
            <div className="mt-3 flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() =>
                  document.getElementById('journey-learn-hub')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
                className="inline-flex flex-1 items-center justify-center rounded-xl bg-[var(--nq-ed-accent)] px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:shadow-lg min-[480px]:flex-none"
              >
                Short reads
              </button>
              <button
                type="button"
                onClick={() => goTab('library')}
                className="inline-flex flex-1 items-center justify-center rounded-xl border-2 border-[var(--nq-ed-line)] bg-white px-4 py-2.5 text-sm font-bold text-[var(--nq-ed-text)] shadow-sm transition hover:border-[var(--nq-ed-accent)] hover:bg-[var(--nq-ed-accent-soft)] min-[480px]:flex-none"
              >
                Library
              </button>
            </div>
          </section>

          <CertificatePreview
            phasesCompleted={certificatePhasesCompleted}
            onPurchase={() => void handleCertificatePurchase()}
            firstNameFallback={userFirstName}
          />
        </div>
      ) : null}

      {activeTab === 'learn' ? (
        <div
          role="region"
          id="journey-learn-hub"
          aria-labelledby="journey-learn-hub-heading"
          className="nq-journey-tab-panel nq-journey-tab-panel--section"
        >
          <div className="nq-journey-tab-grid">
            <div className="nq-journey-tab-stack">
              <div className="nq-ed-section-frame">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <span className="nq-ed-eyebrow">Learn</span>
                    <h2
                      id="journey-learn-hub-heading"
                      className="mt-2 text-2xl font-bold tracking-tight text-[var(--nq-ed-text)] sm:text-3xl"
                    >
                      Short reads for this step
                    </h2>
                    <p className="mt-2 max-w-prose text-[var(--nq-ed-muted)]">
                      Matched to <span className="font-semibold text-[var(--nq-ed-text)]">{step.title}</span>.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <TierBadge tier={effectiveTier} compact className="max-w-[220px]" />
                    <MindsetTag mindset={mindsetFor(effectiveTier)} />
                  </div>
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
            </div>
            <aside className="nq-ed-quote hidden lg:flex" aria-label="Learn library briefing">
              <div className="flex flex-col justify-between gap-6">
                <div>
                  <span className="nq-ed-eyebrow">Reads</span>
                  <h3 className="mt-3 font-display text-xl font-semibold text-[var(--nq-ed-text)] sm:text-2xl">
                    Confidence builders beside your numbers.
                  </h3>
                  <p className="mt-3 text-sm text-[var(--nq-ed-muted)]">
                    Budget signals stay visible while articles stay contextual to the step you&apos;re on — same pattern as Today and Money.
                  </p>
                </div>
                <div className="nq-ed-row">
                  <div className="nq-ed-chip">◎</div>
                  <div className="min-w-0">
                    <strong className="text-[var(--nq-ed-text)]">First-Gen &amp; Solo hubs below</strong>
                    <div className="text-sm text-[var(--nq-ed-muted)]">
                      When they apply, tailored cards follow without breaking the briefing frame.
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          {quizTxnMeta.icpType === 'first-gen' ? (
            <section
              className="nq-card nq-ed-quote rounded-2xl border border-teal-200/90 bg-gradient-to-br from-teal-50/60 to-white p-5 shadow-sm"
              aria-labelledby="firstgen-learn-hub-heading"
            >
              <h3 id="firstgen-learn-hub-heading" className="font-display text-lg font-bold text-[var(--nq-ed-text)]">
                First-Gen Hub
              </h3>
              <p className="mt-1 text-sm text-[var(--nq-ed-muted)]">Resources picked for buyers who are first in their family to own.</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-[var(--nq-ed-line)] bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-[var(--nq-ed-accent)]">
                    <BookOpen className="h-5 w-5" aria-hidden />
                    <p className="font-bold text-[var(--nq-ed-text)]">Glossary</p>
                  </div>
                  <p className="mt-2 text-sm text-[var(--nq-ed-muted)]">25 terms every first-time buyer needs to know</p>
                  <button
                    type="button"
                    onClick={() => setFirstGenGlossaryOpen((o) => !o)}
                    className="mt-3 text-sm font-semibold text-[var(--nq-ed-accent)] underline"
                  >
                    {firstGenGlossaryOpen ? 'Hide glossary' : 'View glossary'}
                  </button>
                  {firstGenGlossaryOpen ? (
                    <ul className="mt-3 max-h-60 list-none space-y-2 overflow-y-auto text-sm text-[var(--nq-ed-muted)]">
                      {FIRSTGEN_GLOSSARY_TERMS.map((g) => (
                        <li key={g.term} className="rounded-lg bg-slate-50 px-2 py-1.5">
                          <strong className="text-[var(--nq-ed-text)]">{g.term}</strong> — {g.def}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
                <a
                  href="https://www.hud.gov/i_want_to/talk_to_a_housing_counselor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-[var(--nq-ed-line)] bg-white p-4 shadow-sm transition hover:border-[var(--nq-ed-accent)]/30"
                >
                  <div className="flex items-center gap-2 text-[var(--nq-ed-accent)]">
                    <ArrowSquareOut className="h-5 w-5" aria-hidden />
                    <p className="font-bold text-[var(--nq-ed-text)]">HUD Counselors</p>
                  </div>
                  <p className="mt-2 text-sm text-[var(--nq-ed-muted)]">Free, government-approved housing counselors in your area</p>
                  <span className="mt-3 inline-flex text-sm font-semibold text-[var(--nq-ed-accent)]">Open HUD directory →</span>
                </a>
                <Link
                  href="/resources"
                  className="rounded-xl border border-[var(--nq-ed-line)] bg-white p-4 shadow-sm transition hover:border-[var(--nq-ed-accent)]/30"
                >
                  <p className="font-bold text-[var(--nq-ed-text)]">Gift Fund Guide</p>
                  <p className="mt-2 text-sm text-[var(--nq-ed-muted)]">
                    How to use family money for your down payment — the right way
                  </p>
                  <span className="mt-3 inline-flex text-sm font-semibold text-[var(--nq-ed-accent)]">Read guide →</span>
                </Link>
                <Link
                  href="/learn/buying-solo"
                  className="rounded-xl border border-[var(--nq-ed-line)] bg-white p-4 shadow-sm transition hover:border-[var(--nq-ed-accent)]/30"
                >
                  <p className="font-bold text-[var(--nq-ed-text)]">Family Conversation Scripts</p>
                  <p className="mt-2 text-sm text-[var(--nq-ed-muted)]">
                    How to talk to your family about helping you buy a home
                  </p>
                  <span className="mt-3 inline-flex text-sm font-semibold text-[var(--nq-ed-accent)]">Open scripts →</span>
                </Link>
              </div>
            </section>
          ) : null}

          {quizTxnMeta.icpType === 'solo' ? (
            <section className="space-y-3" aria-label="Solo buyer learn cards">
              <div className="nq-ed-quote rounded-xl border border-teal-200/80 bg-gradient-to-r from-teal-50/90 to-white p-4 text-sm text-[var(--nq-ed-muted)] shadow-sm">
                <p className="font-bold text-[var(--nq-ed-text)]">Buying solo</p>
                <p className="mt-1">Extra picks below — then the rest of the Learn library still applies.</p>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {tierAtLeast(effectiveTier, 'momentum') ? (
                  <div className="rounded-xl border border-[var(--nq-ed-line)] bg-white p-4 shadow-sm">
                    <p className="font-bold text-[var(--nq-ed-text)]">Qualifying on One Income</p>
                    <p className="mt-2 text-sm text-[var(--nq-ed-muted)]">
                      Lenders look at your debt-to-income ratio. Here&apos;s how to maximize your qualification on a
                      single income.
                    </p>
                    <Link
                      href="/mortgage-shopping"
                      className="mt-3 inline-flex text-sm font-semibold text-[var(--nq-ed-accent)] underline"
                    >
                      Calculate My DTI →
                    </Link>
                  </div>
                ) : (
                  <UpgradeLockCallout
                    className="h-full"
                    lockedLabel="Qualifying on one income (DTI)"
                    reason="Lenders size you on debt-to-income. Momentum unlocks the full mortgage-shopping workspace to calculate and stress-test your DTI."
                    ctaLabel="Calculate my DTI →"
                    ctaHref="/upgrade?source=solo-dti&tier=momentum"
                  />
                )}
                <div className="rounded-xl border border-[var(--nq-ed-line)] bg-white p-4 shadow-sm">
                  <p className="font-bold text-[var(--nq-ed-text)]">The Solo Buyer Advocate Checklist</p>
                  <p className="mt-2 text-sm text-[var(--nq-ed-muted)]">
                    Buying alone means you need to be your own advocate. Here are 12 things to verify before signing
                    anything.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSoloAdvocateOpen((o) => !o)}
                    className="mt-3 text-sm font-semibold text-[var(--nq-ed-accent)] underline"
                  >
                    {soloAdvocateOpen ? 'Hide checklist' : 'View Checklist →'}
                  </button>
                  {soloAdvocateOpen ? (
                    <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-[var(--nq-ed-muted)]">
                      {SOLO_ADVOCATE_12.map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ol>
                  ) : null}
                </div>
                <UpgradeLockCallout
                  className="h-full"
                  lockedLabel="Negotiating without a partner"
                  reason="Solo buyers can negotiate effectively with the right scripts — included with Momentum."
                  ctaLabel="Get negotiation scripts →"
                  ctaHref="/upgrade?source=solo-negotiation&tier=momentum"
                />
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
                      : 'border border-[var(--nq-ed-line)] bg-white text-[var(--nq-ed-muted)] hover:border-[var(--nq-ed-accent)]/30 hover:bg-[var(--nq-ed-accent-soft)]'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {learnMoneyFiltered.map((item, idx) => (
              <Link
                key={item.id}
                href={item.href}
                className={`nq-card group rounded-2xl border border-[var(--nq-ed-line)] p-4 shadow-sm ring-1 ring-slate-100/80 transition hover:-translate-y-0.5 hover:border-[var(--nq-ed-accent)]/30 hover:shadow-md ${
                  idx === 0 ? 'nq-ed-quote' : 'nq-ed-soft-card'
                }`}
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
                <p className="mt-2 font-bold text-[var(--nq-ed-text)]">{item.title}</p>
                <p className="mt-1 text-sm text-[var(--nq-ed-muted)]">{item.sub}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[var(--nq-ed-accent)]">
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
            <UpgradeLockCallout
              lockedLabel="Unlimited expert back-and-forth"
              reason={`Navigator+ adds unlimited Q&A and weekly check-ins when questions start piling up. “${TIER_DEFINITIONS.navigator_plus.mindset}”`}
              ctaLabel="Explore Navigator+"
              ctaHref="/upgrade?source=learn-human&tier=navigator_plus"
            />
          ) : null}

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-violet-800/90">Start here — myth cards</h3>
            <p className="mt-1 text-sm text-[var(--nq-ed-muted)]">
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
              <div className="flex flex-row items-center justify-center gap-3 rounded-2xl bg-[var(--nq-ed-accent)] px-4 py-3 shadow-lg shadow-slate-900/15 ring-1 ring-white/20 sm:flex-col sm:gap-2.5 sm:px-3 sm:py-4 sm:text-center">
                <Lightbulb weight="duotone" size={20} className="shrink-0 text-white/90" aria-hidden />
                <h3 className="text-xs font-bold uppercase leading-snug tracking-[0.12em] text-white/95 sm:max-w-[7rem] sm:text-sm sm:leading-tight">
                  Why it matters
                </h3>
              </div>
              <div className="nq-card nq-ed-quote relative min-h-0 overflow-hidden rounded-2xl border border-[var(--nq-ed-line)] p-5 shadow-md ring-1 ring-slate-100/80 sm:p-6">
                <div className="absolute right-2 top-2 opacity-[0.06] sm:right-3 sm:top-3">
                  <Lightbulb weight="duotone" size={56} className="text-[var(--nq-ed-accent)]" aria-hidden />
                </div>
                {displayStep.nqWhyItMattersCards && displayStep.nqWhyItMattersCards.length > 0 ? (
                  <div className="relative">
                    <h4 className="mb-5 text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--nq-ed-muted)]">
                      Myths worth knowing
                    </h4>
                    <ul className="grid list-none gap-4 lg:grid-cols-3 lg:gap-4" role="list">
                      {displayStep.nqWhyItMattersCards.map((card, i) => {
                        const Icon = WHY_IT_MATTERS_MYTH_ICONS[i] ?? Lightbulb
                        const ring = WHY_IT_MATTERS_MYTH_ICON_STYLES[i] ?? 'bg-slate-100 text-[var(--nq-ed-muted)] ring-slate-200'
                        const expanded = openMythTitle === card.title
                        return (
                          <motion.li
                            key={card.title}
                            layout
                            whileHover={reduceMotion ? undefined : { y: -2 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                            className="rounded-xl border border-[var(--nq-ed-line)] bg-gradient-to-b from-white to-slate-50/90 p-4 shadow-sm ring-1 ring-slate-100/70"
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
                                <Icon weight="duotone" size={20} />
                              </div>
                              <div className="min-w-0 flex-1 pt-0.5">
                                <span className="flex items-start justify-between gap-2">
                                  <span className="text-base font-bold leading-snug text-[var(--nq-ed-text)]">{card.title}</span>
                                  <CaretDown
                                    className={`mt-0.5 h-5 w-5 shrink-0 text-[var(--nq-ed-muted)] transition-transform ${
                                      expanded ? 'rotate-180' : ''
                                    }`}
                                    aria-hidden
                                  />
                                </span>
                              </div>
                            </button>
                            {expanded ? (
                              <p className="mt-3 border-t border-[var(--nq-ed-line-soft)] pt-3 text-sm leading-relaxed text-[var(--nq-ed-muted)]">
                                {renderNqSaysContext(card.detail)}
                              </p>
                            ) : (
                              <p className="mt-2 text-xs text-[var(--nq-ed-muted)]">Tap to expand</p>
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
                      <span className="text-sm font-bold uppercase tracking-wide text-[var(--nq-ed-muted)]">
                        Why this step matters
                      </span>
                      <CaretDown
                        className={`h-5 w-5 shrink-0 text-[var(--nq-ed-muted)] transition-transform ${
                          openMythTitle === '__whatItMeans__' ? 'rotate-180' : ''
                        }`}
                        aria-hidden
                      />
                    </button>
                    {openMythTitle === '__whatItMeans__' ? (
                      <p className="mt-3 text-lg leading-relaxed text-[var(--nq-ed-text)] sm:text-xl sm:leading-relaxed">
                        {renderNqSaysContext(displayStep.nqWhatItMeans)}
                      </p>
                    ) : (
                      <p className="mt-2 text-xs text-[var(--nq-ed-muted)]">Tap to expand</p>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-[var(--nq-ed-line)] bg-slate-50/80 p-6 text-[var(--nq-ed-muted)]">
              NQ will drop in more &ldquo;myths worth knowing&rdquo; and explainers as you move through milestones. Meanwhile, start with the library picks above.
            </p>
          )}

          {nextStepTitles.length > 0 ? (
            <div className="nq-card nq-ed-soft-card rounded-2xl border border-[var(--nq-ed-line)] bg-slate-50/80 p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--nq-ed-muted)]">
                Recommended for your phase · {phaseHeadingTitle ?? 'this phase'}
              </p>
              <ul className="mt-3 list-none space-y-2">
                {nextStepTitles.map((t) => (
                  <li key={t}>
                    <button
                      type="button"
                      onClick={() => goTab('plan')}
                      className="text-left text-sm font-semibold text-[var(--nq-ed-accent)] underline decoration-[var(--nq-ed-accent)]/60 underline-offset-2 hover:text-[var(--nq-ed-text)]"
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
          className="nq-journey-tab-panel"
        >
          <JourneyTabHeroShell
            eyebrow="Library"
            title="Scripts, guides & checklists"
            description="Curated to pair with your journey. Full archive also lives on the site resources area."
            headingId="journey-library-heading"
          >
            <div className="flex flex-wrap items-center gap-2">
              <TierBadge tier={effectiveTier} compact className="sm:max-w-[220px]" />
              <MindsetTag mindset={mindsetFor(effectiveTier)} className="max-w-[260px]" />
            </div>
          </JourneyTabHeroShell>
          <div className="nq-journey-tab-grid">
            <div className="nq-journey-tab-stack min-w-0">
          <div className="nq-ed-soft-card relative rounded-2xl p-1">
            <MagnifyingGlass
              weight="duotone"
              size={20}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--nq-ed-muted)]"
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
              className="w-full rounded-xl border border-[var(--nq-ed-line)] bg-[var(--nq-ed-surface)] py-2.5 pl-10 pr-3 text-sm font-medium text-[var(--nq-ed-text)] shadow-sm outline-none transition focus:border-[var(--nq-ed-accent)] focus:ring-2 focus:ring-[var(--nq-ed-accent)]/20"
            />
          </div>

          <div
            className="nq-ed-soft-card flex flex-wrap gap-2 p-3"
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
                      : 'border border-[var(--nq-ed-line)] bg-white text-[var(--nq-ed-muted)] hover:border-[var(--nq-ed-accent)]/30 hover:bg-[var(--nq-ed-accent-soft)]'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>

          <ul className="space-y-3" role="list">
            {libraryFiltered.slice(0, 3).map((item, idx) => (
              <li key={item.id}>
                <div
                  className={`block transition hover:-translate-y-0.5 sm:p-5 ${
                    idx === 0 ? 'nq-ed-quote p-4' : 'nq-ed-soft-card border border-[var(--nq-ed-line)] p-4 hover:border-[var(--nq-ed-line-soft)]'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--nq-ed-muted)]">
                      {JOURNEY_LIBRARY_CATEGORY_LABEL[item.category]}
                    </span>
                    <span className="text-xs font-semibold text-[var(--nq-ed-muted)]">{item.readMin} min read</span>
                  </div>
                  <p className="mt-2 text-lg font-bold text-[var(--nq-ed-text)]">{item.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--nq-ed-muted)]">{item.summary}</p>
                  <Link
                    href={item.href}
                    className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-[var(--nq-ed-accent)]"
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
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--nq-ed-line)] bg-white px-4 py-3 text-center text-sm font-semibold text-[var(--nq-ed-muted)] shadow-sm transition hover:border-[var(--nq-ed-accent)]/30 hover:bg-[var(--nq-ed-accent-soft)]"
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
                      <UpgradeLockCallout
                        lockedLabel="Full journey library"
                        reason={`All scripts and checklists across phases, Money Finder, savings strategies, and weekly plans — one upgrade instead of repeated nudges. ${TIER_DEFINITIONS.momentum.price.displayMonthly} billed monthly · cancel anytime.`}
                        ctaLabel="Upgrade to Momentum"
                        ctaHref="/upgrade?source=library-bundle&tier=momentum"
                      />
                    ) : (
                      <p className="nq-ed-soft-card rounded-xl border border-[var(--nq-ed-line)] px-4 py-3 text-sm text-[var(--nq-ed-muted)]">
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
                              className={`nq-card rounded-2xl border border-[var(--nq-ed-line)] bg-white p-4 shadow-sm ring-1 ring-slate-100/80 sm:p-5 ${
                                canOpen
                                  ? 'transition hover:-translate-y-0.5 hover:border-[var(--nq-ed-accent)]/30 hover:shadow-md'
                                  : 'opacity-80'
                              }`}
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--nq-ed-muted)]">
                                  {JOURNEY_LIBRARY_CATEGORY_LABEL[item.category]}
                                </span>
                                <span className="text-xs font-semibold text-[var(--nq-ed-muted)]">{item.readMin} min read</span>
                              </div>
                              <p className="mt-2 text-lg font-bold text-[var(--nq-ed-text)]">{item.title}</p>
                              <p className="mt-1 text-sm leading-relaxed text-[var(--nq-ed-muted)]">{item.summary}</p>
                              {canOpen ? (
                                <Link
                                  href={item.href}
                                  className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-[var(--nq-ed-accent)]"
                                >
                                  Open
                                  <ArrowRight className="h-4 w-4" aria-hidden />
                                </Link>
                              ) : (
                                <p className="mt-3 text-sm text-[var(--nq-ed-muted)]">
                                  <Lock className="inline h-3.5 w-3.5 text-[var(--nq-ed-muted)]" aria-hidden /> Included in{' '}
                                  <span className="font-semibold text-[var(--nq-ed-muted)]">{unlockDef.name}</span>
                                  {tierAtLeast(effectiveTier, 'momentum') &&
                                  (minT === 'navigator' || minT === 'navigator_plus') ? (
                                    <Link
                                      href={`/upgrade?source=library-item&tier=${minT}`}
                                      className={`ml-2 text-sm ${upgradeLockSecondaryLinkClass}`}
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
            <p className="rounded-2xl border border-dashed border-[var(--nq-ed-line)] bg-slate-50/80 p-6 text-center text-[var(--nq-ed-muted)]">
              No matches — try another category or a shorter search.
            </p>
          ) : null}

          <Link
            href="/resources"
            className="inline-flex items-center gap-2 text-sm font-bold text-[var(--nq-ed-accent)] underline decoration-[var(--nq-ed-accent)]/60 underline-offset-2 hover:text-[#0f6058]"
          >
            Browse all resources on the site
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
            </div>
            <aside className="nq-ed-quote hidden lg:flex" aria-label="Library briefing">
              <div className="flex flex-col justify-between gap-6">
                <div>
                  <span className="nq-ed-eyebrow">Archive</span>
                  <h3 className="mt-3 font-display text-xl font-semibold text-[var(--nq-ed-text)] sm:text-2xl">
                    Search and categories stay in the main column.
                  </h3>
                  <p className="mt-3 text-sm text-[var(--nq-ed-muted)]">
                    The briefing rail signals this is a reference desk — not another dashboard tile farm.
                  </p>
                </div>
                <div className="nq-ed-row">
                  <div className="nq-ed-chip">✦</div>
                  <div className="min-w-0">
                    <strong className="text-[var(--nq-ed-text)]">Tier-aware locks</strong>
                    <div className="text-sm text-[var(--nq-ed-muted)]">
                      Unlocks still read clearly in the list; the rail doesn&apos;t duplicate commerce noise.
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      ) : null}

      {activeTab === 'inbox' ? (
        <div
          role="tabpanel"
          id="journey-panel-inbox"
          aria-labelledby="journey-tab-inbox"
          className="nq-journey-tab-panel"
        >
          <JourneyTabHeroShell
            eyebrow="Inbox"
            title="Alerts, tasks & messages"
            description="Everything that needs your attention in one calm view."
            headingId="journey-inbox-heading"
          >
            <div className="flex flex-wrap items-center gap-2">
              <TierBadge tier={effectiveTier} compact className="sm:max-w-[220px]" />
              <MindsetTag mindset={mindsetFor(effectiveTier)} className="max-w-[260px]" />
            </div>
          </JourneyTabHeroShell>
          <div className="nq-journey-tab-grid">
            <div className="nq-journey-tab-stack min-w-0">

          {!hasJourneyFeature(effectiveTier, 'inbox_priority_sort') ? (
            <LockedFeatureCard
              title="Priority inbox sorting"
              description="Surface lender asks, nudges, and deadlines in the order that protects your timeline."
              nextTier="momentum"
              upgradeHref="/upgrade?source=inbox&tier=momentum"
            />
          ) : null}

          <div className="nq-ed-quote p-5 sm:p-6">
            <span className="nq-ed-eyebrow">Suggested next steps</span>
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
                    className="text-left text-sm font-semibold text-[var(--nq-ed-accent)] underline decoration-[var(--nq-ed-accent)]/60 underline-offset-2"
                  >
                    {a.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {docTaskTouched && !hasJourneyFeature(effectiveTier, 'journey_concierge') ? (
            <UpgradeLockCallout
              lockedLabel="Documents piling up?"
              reason={`Navigator+ adds full journey concierge and weekly check-ins when paperwork gets heavy. “${TIER_DEFINITIONS.navigator_plus.mindset}”`}
              ctaLabel="Upgrade to Navigator+"
              ctaHref="/upgrade?source=inbox-docs&tier=navigator_plus"
            />
          ) : null}

          <section
            aria-labelledby="inbox-alerts-heading"
            className="nq-card nq-ed-soft-card rounded-2xl border border-amber-200/80 bg-amber-50/50 p-5 sm:p-6"
          >
            <h3 id="inbox-alerts-heading" className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-amber-900">
              <Bell className="h-4 w-4 shrink-0" aria-hidden />
              Alerts
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-amber-950" role="list">
              <li className="flex gap-2 rounded-lg bg-white/80 px-3 py-2 shadow-sm">
                <WarningCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
                <span>
                  Rate quotes are moving weekly — if you&apos;re pre-approved, consider refreshing quotes before
                  you go under contract.
                </span>
              </li>
              <li className="flex gap-2 rounded-lg bg-white/80 px-3 py-2 shadow-sm">
                <WarningCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
                <span>Wire fraud reminder: always confirm wiring instructions by phone on a number you trust.</span>
              </li>
            </ul>
          </section>

          <section
            aria-labelledby="inbox-tasks-heading"
            className="nq-card nq-ed-soft-card rounded-2xl border border-[var(--nq-ed-line)] p-5 shadow-sm sm:p-6"
          >
            <h3 id="inbox-tasks-heading" className="text-sm font-bold uppercase tracking-wide text-[var(--nq-ed-muted)]">
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
                      setInboxTasks((prev) => {
                        const cur = prev[idx]
                        if (cur && !cur.done) {
                          recordCompletion({
                            id: `nq-inbox-${cur.id}`,
                            label: cur.label,
                            completedAt: new Date().toISOString(),
                          })
                        }
                        return prev.map((t, i) => (i === idx ? { ...t, done: !t.done } : t))
                      })
                      const nextDone = !task.done
                      if (
                        nextDone &&
                        /upload|document|pay stub|lender portal/i.test(task.label)
                      ) {
                        setDocTaskTouched(true)
                      }
                    }}
                    className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-[var(--nq-ed-accent)] focus:ring-millennial-cta-primary"
                  />
                  <label
                    htmlFor={`inbox-task-${task.id}`}
                    className={`cursor-pointer text-sm leading-snug sm:text-base ${
                      task.done ? 'text-[var(--nq-ed-muted)] line-through' : 'font-medium text-[var(--nq-ed-text)]'
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
                      <span className="mt-1 block text-xs font-medium text-[var(--nq-ed-muted)]">
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

          <section
            aria-labelledby="inbox-messages-heading"
            className="nq-card nq-ed-soft-card rounded-2xl border border-[var(--nq-ed-line)] bg-slate-50/80 p-5 sm:p-6"
          >
            <h3 id="inbox-messages-heading" className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[var(--nq-ed-muted)]">
              <Envelope weight="duotone" className="h-4 w-4 shrink-0" aria-hidden />
              Messages
            </h3>
            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-[var(--nq-ed-line)]/80 bg-white p-4 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--nq-ed-muted)]">NQ</p>
                <p className="mt-1 text-sm text-[var(--nq-ed-muted)]">
                  When you&apos;re ready, open <strong className="font-semibold text-[var(--nq-ed-text)]">Your Phase</strong> and
                  check off one checklist item — small wins keep momentum.
                </p>
              </div>
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-[var(--nq-ed-line)] bg-white/60 px-4 py-6 text-center">
                <Envelope weight="duotone" className="h-7 w-7 text-slate-300" aria-hidden />
                <p className="text-sm font-medium text-[var(--nq-ed-muted)]">No new messages</p>
                <p className="text-xs text-[var(--nq-ed-muted)]">Lender updates, agent notes, and NQ tips will appear here as your journey progresses.</p>
              </div>
            </div>
          </section>

          <Link
            href="/inbox"
            className="nq-ed-btn-primary w-full sm:w-auto"
          >
            Open full inbox
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
            </div>
            <aside className="nq-ed-quote hidden lg:flex" aria-label="Inbox briefing">
              <div className="flex flex-col justify-between gap-6">
                <div>
                  <span className="nq-ed-eyebrow">Signals</span>
                  <h3 className="mt-3 font-display text-xl font-semibold text-[var(--nq-ed-text)] sm:text-2xl">
                    Attention without alarm-stack density.
                  </h3>
                  <p className="mt-3 text-sm text-[var(--nq-ed-muted)]">
                    Suggested steps and lender asks stay actionable below; this column frames the inbox as concierge triage.
                  </p>
                </div>
                <div className="nq-ed-row">
                  <div className="nq-ed-chip">◆</div>
                  <div className="min-w-0">
                    <strong className="text-[var(--nq-ed-text)]">Open full inbox when ready</strong>
                    <div className="text-sm text-[var(--nq-ed-muted)]">
                      Deep history stays on the dedicated inbox route; this tab is the briefing snapshot.
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      ) : null}

      {activeTab === 'upgrades' ? (
        <div
          role="tabpanel"
          id="journey-panel-upgrades"
          aria-labelledby="journey-tab-upgrades"
          className="nq-journey-tab-panel"
        >
          <JourneyTabHeroShell
            eyebrow="Options"
            title="Try Momentum free for 7 days"
            description="Full access. No credit card required. Cancel anytime."
            headingId="journey-upgrades-heading"
          >
            <button
              type="button"
              onClick={() => void startMomentumTrialFromUi('upgrades_tab', router.push)}
              className="nq-ed-btn-primary w-full max-w-sm sm:w-auto"
            >
              Start my free 7-day trial →
            </button>
          </JourneyTabHeroShell>
          <div className="nq-journey-tab-grid">
            <div className="nq-journey-tab-stack min-w-0">
          <div className="nq-ed-section-frame">
            <p className="nq-ed-eyebrow">Compare plans</p>
            <p className="mt-2 text-sm text-[var(--nq-ed-muted)]">Preview features by tier — your checkout price may vary with promotions.</p>
            <div className="mt-4">
              <TierPreviewSwitcher
                currentTier={userTier}
                previewTier={previewTier}
                onPreviewChange={setPreviewTier}
              />
            </div>
          </div>
            </div>
            <aside className="nq-ed-quote hidden lg:flex" aria-label="Upgrades briefing">
              <div className="flex flex-col justify-between gap-6">
                <div>
                  <span className="nq-ed-eyebrow">Partner tier</span>
                  <h3 className="mt-3 font-display text-xl font-semibold text-[var(--nq-ed-text)] sm:text-2xl">
                    Commerce sits in-frame; tone stays advisory.
                  </h3>
                  <p className="mt-3 text-sm text-[var(--nq-ed-muted)]">
                    Trial and compare blocks remain primary actions in the main column — the rail explains why depth unlocks matter.
                  </p>
                </div>
                <div className="nq-ed-row">
                  <div className="nq-ed-chip">↑</div>
                  <div className="min-w-0">
                    <strong className="text-[var(--nq-ed-text)]">Preview features below</strong>
                    <div className="text-sm text-[var(--nq-ed-muted)]">
                      Use the tier switcher to see Navigator and Navigator+ contrast without leaving the journey shell.
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      ) : null}

      {onboardingComplete && step ? (
        <div className="pt-2">
          <JourneyNextMilestoneTeaser
            searchKey={searchKey}
            currentAction={displayStep.title}
            nextFeatureTitle={nextUnlockFeatureTitle}
            progressPct={progressPct}
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

      {phaseLockModal === 'trial' ? (
        <div
          className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-900/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="phase-lock-trial-title"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
            <Lock className="mx-auto mb-3 h-8 w-8 text-slate-300" aria-hidden />
            <h3 id="phase-lock-trial-title" className="mb-1 text-base font-bold text-[var(--nq-ed-text)]">
              This phase is part of Momentum
            </h3>
            <p className="mb-4 text-sm text-[var(--nq-ed-muted)]">Try it free for 7 days. No credit card required.</p>
            <button
              type="button"
              onClick={handleStartTrialFromPhaseLock}
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white"
            >
              Start my free 7-day trial →
            </button>
            <p className="mt-2 text-center text-xs text-[var(--nq-ed-muted)]">No credit card required · Cancel anytime</p>
            <button
              type="button"
              onClick={() => setPhaseLockModal(null)}
              className="mt-3 w-full text-sm text-[var(--nq-ed-muted)]"
            >
              Not now
            </button>
          </div>
        </div>
      ) : null}

      {reengagementPhase != null ? (
        <PhaseReengagementModal
          phaseOrder={reengagementPhase}
          onClose={() => {
            setReengagementPhase(null)
            if (pendingCertificatePhase != null) {
              setCertificatePhase(pendingCertificatePhase)
              setPendingCertificatePhase(null)
            }
          }}
        />
      ) : null}

      {reengagementPhase == null && certificatePhase != null ? (
        <PhaseCertificateModal
          phaseOrder={certificatePhase}
          userName={userFirstName}
          onClose={() => setCertificatePhase(null)}
        />
      ) : null}

      {phaseLockModal === 'hint' ? (
        <div
          className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-900/80 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
            <p className="text-sm text-[var(--nq-ed-muted)]">{phaseLockHintText}</p>
            <button
              type="button"
              onClick={() => setPhaseLockModal(null)}
              className="mt-4 w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white"
            >
              OK
            </button>
          </div>
        </div>
      ) : null}
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
    <UpgradeLockCallout
      className="mt-4 text-left"
      lockedLabel={`${toolLabel ?? 'This tool'} (${def.name})`}
      reason={`This tool is included with ${def.name}. “${def.mindset}”`}
      ctaLabel={`Upgrade to ${def.name}`}
      ctaHref={`/upgrade?source=nq-guided-tool&tier=${requiredTier}`}
    />
  )
}

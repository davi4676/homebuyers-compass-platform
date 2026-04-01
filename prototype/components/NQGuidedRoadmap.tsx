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
} from 'lucide-react'
import { ChatPopover } from '@/components/chatbot/ChatPopover'
import { useJourneyNavChrome } from '@/components/JourneyNavChromeContext'
import {
  type JourneyTab,
  parseJourneyTabParam,
  journeyTabHref,
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
  type NQGuidedStep,
} from '@/lib/nq-guided-steps'
import {
  type UserTier,
  TIER_ORDER,
  TIER_DEFINITIONS,
  tierAtLeast,
  getNextTier,
} from '@/lib/tiers'
import { getJourneyPhaseById, getJourneyPhaseByOrder } from '@/lib/journey-phases-data'
import {
  buildUserSnapshot,
  loadQuizDataFromLocalStorage,
  personalizeNqStep,
  type UserSnapshot,
} from '@/lib/user-snapshot'
import HousingBudgetSketchTile from '@/components/HousingBudgetSketchTile'
import AssistanceProgramsTab from '@/components/journey/AssistanceProgramsTab'
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
import { hasJourneyFeature } from '@/lib/journey-feature-access'
import { runNextStepEngineWithContext, type NextStepAction } from '@/lib/next-step-engine'
import {
  estimateTrackerTotals,
  getPhaseMoneyOpportunities,
  getFundingOpportunities,
  getAlternativeSolutions,
} from '@/lib/money-engine'
import { useMoneyTrackers } from '@/lib/hooks/useMoneyTrackers'
import { JOURNEY_LEARN_MONEY_ITEMS, type LearnMoneyFilterId } from '@/lib/journey-learn-money-items'
import MoneyTag from '@/components/journey/MoneyTag'
import { formatCurrency } from '@/lib/calculations'
import type { ReadinessScore } from '@/lib/calculations'

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
          className={`h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 ${
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
  onGoToResults: () => void
}

const hasAccessToStep = (stepIndex: number, tier: UserTier): boolean => {
  if (stepIndex <= NQ_FOUNDATIONS_LAST_STEP_INDEX) return true
  return tierAtLeast(tier, 'momentum')
}

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
              className="font-semibold text-sky-600 underline decoration-sky-400/70 underline-offset-2 hover:text-sky-800"
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
        <strong key={i} className="font-bold not-italic text-sky-600">
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
  'bg-sky-100 text-sky-700 ring-sky-200/80',
  'bg-amber-100 text-amber-800 ring-amber-200/70',
  'bg-violet-100 text-violet-700 ring-violet-200/70',
] as const

const PHASE_CHECKLIST_LS = 'nq_phase_checklist_v1'

const ONBOARDING_LS = 'nq_customized_onboarding_v1'

export default function NQGuidedRoadmap({ userFirstName, onGoToResults }: NQGuidedRoadmapProps) {
  const { userTier, effectiveTier, previewTier, setPreviewTier, resetPreviewToAccount, mindsetFor } =
    useTierMindset()
  const reduceMotion = useReducedMotion() ?? false
  const router = useRouter()
  const searchParams = useSearchParams()
  /** `toString()` dependency: ensures updates on client query changes (some Next versions reuse the ReadonlyURLSearchParams ref). */
  const searchKey = searchParams.toString()
  const activeTab = useMemo(
    () => parseJourneyTabParam(new URLSearchParams(searchKey).get('tab')),
    [searchKey]
  )
  const { setJourneyNavChrome } = useJourneyNavChrome()

  const goTab = useCallback((t: JourneyTab) => {
    try {
      localStorage.setItem(JOURNEY_TAB_STORAGE_KEY, t)
    } catch {
      // ignore
    }
    router.push(journeyTabHref(t), { scroll: false })
  }, [router])

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
    if (activeTab !== 'upgrades') resetPreviewToAccount()
  }, [activeTab, resetPreviewToAccount])

  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [chatOpen, setChatOpen] = useState(false)
  const [chatAnchor, setChatAnchor] = useState<'message' | 'help'>('message')
  const [snapshot, setSnapshot] = useState<UserSnapshot | null>(null)
  const chatTriggerRef = useRef<HTMLButtonElement>(null)
  const helpChatTriggerRef = useRef<HTMLButtonElement>(null)
  const chatExtraTriggerRefs = useMemo(() => [chatTriggerRef, helpChatTriggerRef], [])

  const refreshSnapshot = useCallback(() => {
    const q = loadQuizDataFromLocalStorage()
    setSnapshot(buildUserSnapshot(q, { firstName: userFirstName }))
  }, [userFirstName])

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
    try {
      const stored = JSON.parse(localStorage.getItem('nq_current_step') || '0')
      let n = typeof stored === 'number' ? stored : Number(stored)
      if (!Number.isFinite(n)) n = 0
      const idx = Math.max(0, Math.min(Math.floor(n), NQ_GUIDED_STEPS.length - 1))
      setCurrentStepIndex(idx)
    } catch {
      setCurrentStepIndex(0)
    }
    try {
      const done = JSON.parse(localStorage.getItem('nq_completed_steps') || '[]') as number[]
      setCompletedSteps(new Set(done.filter((i) => i >= 0 && i < NQ_GUIDED_STEPS.length)))
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

  const step = getNQStepByIndex(currentStepIndex) ?? NQ_GUIDED_STEPS[0]
  const displayStep = useMemo(() => personalizeNqStep(step, snapshot), [step, snapshot])

  const [phaseChecklistDone, setPhaseChecklistDone] = useState<boolean[]>([])
  const [openMythTitle, setOpenMythTitle] = useState<string | null>(null)
  const [libraryQuery, setLibraryQuery] = useState('')
  const [libraryCategory, setLibraryCategory] = useState<LibraryCategoryId | 'all'>('all')
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
    const indicesInCurrentPhase = getNqGuidedIndicesForPhaseOrder(step.phaseOrder)
    const milestoneIndexInPhase = Math.max(1, indicesInCurrentPhase.indexOf(currentStepIndex) + 1)
    const milestonesInPhase = indicesInCurrentPhase.length
    const progressPct = Math.min(
      100,
      ((step.phaseOrder - 1 + milestoneIndexInPhase / milestonesInPhase) / guidedPhaseTotal) * 100
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
      phaseTotal: guidedPhaseTotal,
      phaseProgressPct: progressPct,
      readinessScore,
      learnTipCount,
      inboxPendingCount,
      libraryHasNew: !librarySeen,
    })
  }, [step, currentStepIndex, snapshot, displayStep, setJourneyNavChrome])

  const totalSteps = NQ_GUIDED_STEPS.length
  const isStepLocked = !hasAccessToStep(currentStepIndex, effectiveTier)
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

  const canAccess = (idx: number) => hasAccessToStep(idx, effectiveTier)

  const goToPhase = (phaseOrder: number) => {
    const idx = getNqGuidedFirstAccessibleIndexInPhase(phaseOrder, canAccess)
    if (idx !== null) setCurrentStepIndex(idx)
  }

  const displayPhaseOrderSafe = step ? Math.max(1, step.phaseOrder) : 1

  const moneyTotals = useMoneyTrackers(snapshot, userTier, displayPhaseOrderSafe)

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

  const learnMoneyFiltered = useMemo(() => {
    return JOURNEY_LEARN_MONEY_ITEMS.filter((item) => {
      if (learnMoneyFilter === 'all') return true
      return item.moneyTags.includes(learnMoneyFilter)
    })
  }, [learnMoneyFilter])

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

  const progressPct = Math.min(
    100,
    ((step.phaseOrder - 1 + milestoneIndexInPhase / milestonesInPhase) / guidedPhaseTotal) * 100
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
          />
          <motion.section
            initial={reduceMotion ? undefined : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0.01 : 0.45 }}
            className="rounded-3xl border-2 border-sky-300/80 bg-gradient-to-br from-white via-sky-50/50 to-indigo-50/40 p-5 shadow-xl shadow-sky-900/10 ring-1 ring-sky-100/80 sm:p-6"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-800/90">Readiness score</p>
            <p className="mt-1.5 text-base font-semibold text-slate-700">{overviewWarmth}</p>
            {snapshot ? (
              <div className="mt-4 border-t border-sky-100/90 pt-4">
                <ReadinessScoreReveal readiness={snapshot.readiness} />
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white/90 p-4 text-center sm:p-5">
                <p className="text-slate-600">
                  <button
                    type="button"
                    onClick={onGoToResults}
                    className="font-semibold text-sky-700 underline decoration-sky-400/70 underline-offset-2 hover:text-sky-900"
                  >
                    Run the savings snapshot
                  </button>{' '}
                  to unlock your animated readiness score and personalized numbers.
                </p>
              </div>
            )}
          </motion.section>

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
                  className="inline-flex w-full justify-center rounded-xl border-2 border-sky-400 bg-white px-5 py-3 text-sm font-bold text-sky-900 shadow-md transition hover:bg-sky-50 sm:w-auto sm:text-base sm:px-6"
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
            initial={reduceMotion ? undefined : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0.01 : 0.45 }}
            className="rounded-3xl border border-slate-200/90 bg-gradient-to-br from-white via-sky-50/30 to-indigo-50/20 p-6 shadow-lg sm:p-8"
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-sky-100/80 to-indigo-100/50 shadow-lg ring-2 ring-sky-200/50">
                <Image
                  src="/images/nq-assistant.png"
                  alt="NQ, your homebuying guide"
                  width={120}
                  height={120}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-700/90">From NQ</p>
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
              Phase {displayPhaseOrder} of {guidedPhaseTotal}. A simple step now keeps your momentum steady.
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
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:shadow-lg sm:text-base"
            >
              View your phase
            </button>
            <button
              type="button"
              onClick={() => goTab('budget')}
              className="inline-flex items-center justify-center rounded-xl border-2 border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 sm:text-base"
            >
              Open Budget Sketch
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
          />
          {!hasJourneyFeature(effectiveTier, 'affordability_review') ? (
            <div className="rounded-2xl border border-sky-100/90 bg-sky-50/40 p-4 shadow-sm sm:p-5">
              <p className="text-sm font-semibold text-slate-900">Navigator unlocks a personalized affordability review.</p>
              <MindsetTag className="mt-2 border-sky-100 bg-white/90" mindset={TIER_DEFINITIONS.navigator.mindset} />
              <Link
                href="/upgrade?source=budget-inline&tier=navigator"
                className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-sky-800 underline decoration-sky-400/60 underline-offset-2 hover:text-sky-950"
              >
                Explore Navigator
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
              className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 shadow-sm transition hover:border-sky-300 hover:bg-sky-50"
            >
              Reset
            </button>
          </div>
          <HousingBudgetSketchTile
            snapshot={snapshot}
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
              className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-sky-700 underline decoration-sky-400/70 underline-offset-2 hover:text-sky-900"
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
              className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-sky-700 underline decoration-sky-400/70 underline-offset-2 hover:text-sky-900"
            >
              Open the Library tab
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      ) : null}

      {activeTab === 'assistance' ? <AssistanceProgramsTab /> : null}

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
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-sky-700/90">
                    Phase {displayPhaseOrder} of {guidedPhaseTotal}
                  </p>
                  <h1
                    id="nq-phase-heading"
                    className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl md:text-[2.25rem] md:leading-tight"
                  >
                    {libraryPhase?.title ?? `Phase ${displayPhaseOrder}`}
                  </h1>
                  {libraryPhase?.description ? (
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

              <div className="my-4 h-[3px] w-full rounded-full bg-gradient-to-r from-sky-500 via-indigo-500 to-slate-200/80 sm:my-5" aria-hidden />

              <div className="h-1.5 w-full max-w-xl overflow-hidden rounded-full bg-slate-200/90">
                <motion.div
                  key={activeTab}
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
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
            />
          </section>

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

          {nextLibraryPhase ? (
            <div className="rounded-2xl border border-indigo-200/60 bg-gradient-to-br from-indigo-50/50 to-white p-4 shadow-sm sm:p-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-700/90">Coming up</p>
              <p className="mt-1.5 text-base font-bold text-slate-900 sm:text-lg">
                Phase {displayPhaseOrder + 1} — {nextLibraryPhase.title}
              </p>
              <p className="mt-1.5 text-sm text-slate-600">{nextLibraryPhase.description}</p>
              <button
                type="button"
                onClick={() => goTab('library')}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-sky-700 hover:text-sky-900"
              >
                Scripts &amp; checklists in Library
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            </div>
          ) : null}

          <div className="pt-0 md:pt-2">
            <AnimatePresence mode="wait">
              {isStepLocked ? (
                <PaywallCard
                  key="paywall"
                  step={displayStep}
                  currentStepIndex={currentStepIndex}
                  nextStep={getNQStepByIndex(NQ_FOUNDATIONS_LAST_STEP_INDEX + 1)}
                  accountTier={userTier}
                  onUpgrade={() => (window.location.href = '/upgrade?source=nq-guided&tier=momentum')}
                />
              ) : (
                <motion.div
                  key={displayStep.id}
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.25 }}
                  className="relative rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white via-sky-50/40 to-indigo-50/30 shadow-xl shadow-sky-900/10 ring-1 ring-sky-100/60 sm:rounded-3xl"
                >
                  <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl sm:rounded-3xl" aria-hidden>
                    <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-blue-900 via-indigo-600 to-sky-400" />
                    <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-sky-400/10 blur-3xl" />
                    <div className="absolute -left-16 bottom-0 h-32 w-32 rounded-full bg-indigo-400/10 blur-3xl" />
                  </div>

                  <div className="relative z-10 border-l-4 border-sky-500 bg-gradient-to-b from-transparent to-white/70 p-4 pl-4 sm:p-6 sm:pl-6">
                    <motion.div variants={itemVariants} className="mb-4 flex items-start gap-3 sm:gap-4">
                      <div className="relative">
                        <motion.div
                          className="flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-sky-100/80 to-indigo-100/50 shadow-xl shadow-indigo-500/20 ring-2 ring-sky-200/60"
                          whileHover={{ scale: 1.03 }}
                          transition={{ type: 'spring', stiffness: 400 }}
                        >
                          <Image
                            src="/images/nq-assistant.png"
                            alt="NQ, your homebuying guide"
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
                              ? 'border-sky-400 bg-sky-100 text-sky-800 ring-2 ring-sky-200'
                              : 'border-sky-200 bg-white text-sky-600 hover:border-sky-300 hover:bg-sky-50 hover:shadow-md'
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
                      <div className="rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 p-[2px] shadow-md shadow-sky-900/15">
                        <div className="relative overflow-visible rounded-[calc(0.75rem-2px)] bg-white/90 px-4 pb-3 pt-6 shadow-inner shadow-slate-100/50 sm:px-5 sm:pb-3.5 sm:pt-7">
                          <h3 className="sr-only">From NQ</h3>
                          <div className="pointer-events-none absolute left-3 top-0 z-20 -translate-y-1/2 sm:left-4">
                            <span className="relative inline-flex items-center">
                              <span className="inline-flex items-center rounded-full bg-gradient-to-r from-sky-600 to-indigo-600 py-1 pl-[1.35rem] pr-2.5 text-sm font-bold uppercase tracking-wide text-white shadow-md shadow-sky-900/20 sm:py-1.5 sm:pl-7 sm:pr-3 sm:text-base">
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
                          <Target className="h-5 w-5 shrink-0 text-sky-300/90 sm:h-5 sm:w-5" strokeWidth={2} aria-hidden />
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
                                  className="group relative mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-400 via-sky-500 to-indigo-600 px-5 py-3 text-base font-bold text-white shadow-md shadow-sky-900/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-sky-500/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/50"
                                >
                                  {displayStep.toolLabel || 'Open tool'}{' '}
                                  <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                                </a>
                              ) : (
                                <Link
                                  href={displayStep.toolLink}
                                  className="group relative mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-400 via-sky-500 to-indigo-600 px-5 py-3 text-base font-bold text-white shadow-md shadow-sky-900/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-sky-500/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/50"
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
                                    className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
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
                        <div className="rounded-xl border-l-4 border-sky-500 bg-gradient-to-r from-sky-50/80 to-transparent py-2.5 pl-4 pr-2">
                          <p className="text-base font-semibold italic text-sky-800">
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
                        className="inline-flex items-center gap-2 rounded-2xl border-2 border-slate-200 bg-white px-6 py-3.5 text-lg font-semibold text-slate-800 shadow-sm transition-all duration-200 hover:border-sky-400 hover:bg-sky-50 hover:shadow-md"
                      >
                        <HelpCircle className="h-5 w-5 text-sky-600" strokeWidth={2} />
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
              )}
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
                className="inline-flex flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:shadow-lg min-[480px]:flex-none"
              >
                Learn
              </button>
              <button
                type="button"
                onClick={() => goTab('library')}
                className="inline-flex flex-1 items-center justify-center rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 min-[480px]:flex-none"
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
          />

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
                      : 'border border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:bg-sky-50'
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
                className="group rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm ring-1 ring-slate-100/80 transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md"
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
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-sky-700">
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
              <div className="flex flex-row items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 px-4 py-3 shadow-lg shadow-sky-900/20 ring-1 ring-white/20 sm:flex-col sm:gap-2.5 sm:px-3 sm:py-4 sm:text-center">
                <Lightbulb className="h-5 w-5 shrink-0 text-white/90 sm:h-5 sm:w-5" strokeWidth={2.5} aria-hidden />
                <h3 className="text-xs font-bold uppercase leading-snug tracking-[0.12em] text-white/95 sm:max-w-[7rem] sm:text-sm sm:leading-tight">
                  Why it matters
                </h3>
              </div>
              <div className="relative min-h-0 overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-md ring-1 ring-slate-100/80 sm:p-6">
                <div className="absolute right-2 top-2 opacity-[0.06] sm:right-3 sm:top-3">
                  <Lightbulb className="h-14 w-14 text-sky-600" strokeWidth={1} aria-hidden />
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
                Recommended for your phase · {libraryPhase?.title ?? 'this phase'}
              </p>
              <ul className="mt-3 list-none space-y-2">
                {nextStepTitles.map((t) => (
                  <li key={t}>
                    <button
                      type="button"
                      onClick={() => goTab('phase')}
                      className="text-left text-sm font-semibold text-sky-800 underline decoration-sky-400/60 underline-offset-2 hover:text-sky-950"
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
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm font-medium text-slate-900 shadow-sm outline-none ring-sky-200 transition focus:border-sky-400 focus:ring-2"
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
                      : 'border border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:bg-sky-50'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>

          <ul className="space-y-3" role="list">
            {libraryFiltered.map((item) => {
              const minT = item.minTier ?? 'foundations'
              const locked = !tierAtLeast(effectiveTier, minT)
              const unlockTier = minT
              const unlockDef = TIER_DEFINITIONS[unlockTier]
              return (
                <li key={item.id}>
                  <div
                    className={`relative block rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm ring-1 ring-slate-100/80 sm:p-5 ${
                      locked ? 'opacity-95' : 'transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md'
                    }`}
                  >
                    {locked ? (
                      <div className="absolute inset-0 z-[1] flex flex-col items-center justify-center gap-2 rounded-2xl bg-slate-50/85 p-4 text-center backdrop-blur-[2px]">
                        <Lock className="h-5 w-5 text-slate-500" aria-hidden />
                        <p className="text-sm font-semibold text-slate-800">Included in {unlockDef.name}</p>
                        <p className="text-xs italic text-slate-600">&ldquo;{unlockDef.mindset}&rdquo;</p>
                        <Link
                          href={`/upgrade?source=library&tier=${unlockTier}`}
                          className="mt-1 text-sm font-bold text-sky-700 underline underline-offset-2 hover:text-sky-900"
                        >
                          Upgrade to {unlockDef.name}
                        </Link>
                      </div>
                    ) : null}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-700">
                        {JOURNEY_LIBRARY_CATEGORY_LABEL[item.category]}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">{item.readMin} min read</span>
                    </div>
                    <p className="mt-2 text-lg font-bold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.summary}</p>
                    {locked ? null : (
                      <Link
                        href={item.href}
                        className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-sky-700"
                      >
                        Open
                        <ArrowRight className="h-4 w-4" aria-hidden />
                      </Link>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>

          {libraryFiltered.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-6 text-center text-slate-600">
              No matches — try another category or a shorter search.
            </p>
          ) : null}

          <Link
            href="/resources"
            className="inline-flex items-center gap-2 text-sm font-bold text-sky-800 underline decoration-sky-400/60 underline-offset-2 hover:text-sky-950"
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
                    className="text-left text-sm font-semibold text-sky-800 underline decoration-sky-400/60 underline-offset-2"
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
                    className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
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
              Messages preview
            </h3>
            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">NQ</p>
                <p className="mt-1 text-sm text-slate-700">
                  When you&apos;re ready, open <strong className="font-semibold text-slate-900">Your Phase</strong> and
                  check off one checklist item — small wins keep momentum.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm opacity-80">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">System</p>
                <p className="mt-1 text-sm text-slate-600">No lender emails connected — this is a preview layout.</p>
              </div>
            </div>
          </section>

          <Link
            href="/inbox"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 px-5 py-3.5 text-base font-bold text-white shadow-md transition hover:shadow-lg sm:w-auto"
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

function PaywallCard({
  step,
  currentStepIndex,
  nextStep,
  onUpgrade,
  accountTier,
}: {
  step: NQGuidedStep
  currentStepIndex: number
  nextStep: NQGuidedStep | undefined
  onUpgrade: () => void
  accountTier: UserTier
}) {
  const nextTier = getNextTier(accountTier) ?? 'momentum'
  const nextDef = TIER_DEFINITIONS[nextTier]
  const [chatOpen, setChatOpen] = useState(false)
  const paywallChatTriggerRef = useRef<HTMLButtonElement>(null)
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-3xl border-2 border-amber-300/90 bg-gradient-to-br from-amber-50 via-white to-orange-50/40 p-6 shadow-2xl shadow-amber-200/40 ring-1 ring-amber-100/50 sm:p-8"
    >
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500" />
      <div className="absolute -right-16 top-20 h-32 w-32 rounded-full bg-amber-200/20 blur-3xl" aria-hidden />
      <div className="flex items-start gap-5 mb-6">
        <motion.div
          className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/80 shadow-lg shadow-amber-500/20 ring-2 ring-amber-200/50"
          whileHover={{ rotate: 5, scale: 1.05 }}
        >
          <Image
            src="/images/nq-assistant.png"
            alt="NQ, your homebuying guide"
            width={120}
            height={120}
            className="h-full w-full object-contain"
          />
        </motion.div>
        <div className="flex-1 min-w-0">
          <h2 className="mb-2 text-xl font-bold text-slate-900 sm:text-2xl">
            You&apos;ve finished Preparation & Pre-Approval — nice work!
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            I&apos;d love to guide you through House Hunting, Negotiation, and Closing. Upgrade to{' '}
            <strong className="font-semibold text-slate-800">{nextDef.name}</strong> and we&apos;ll keep going together.
          </p>
          <p className="mt-2 text-sm italic text-slate-600">&ldquo;{nextDef.mindset}&rdquo;</p>
        </div>
        <div className="relative shrink-0">
          <button
            ref={paywallChatTriggerRef}
            type="button"
            onClick={() => setChatOpen((o) => !o)}
            title="Ask NQ a question"
            className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-colors ${
              chatOpen
                ? 'bg-amber-100 border-amber-300 text-amber-700'
                : 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100 hover:border-amber-300 hover:text-amber-700'
            }`}
          >
            <MessageCircle className="w-6 h-6" strokeWidth={2} />
          </button>
          <ChatPopover isOpen={chatOpen} onClose={() => setChatOpen(false)} triggerRef={paywallChatTriggerRef} />
        </div>
      </div>

      {nextStep && (
        <div className="rounded-2xl bg-white/90 border-2 border-amber-200/60 p-5 mb-6">
          <p className="text-sm font-bold text-amber-700 uppercase tracking-wider mb-2">
            A peek at what&apos;s next
          </p>
          <p className="font-bold text-slate-800 text-xl">{nextStep.title}</p>
          <p className="text-base text-slate-600 mt-1">
            {renderWithAnnualCreditReportLink(nextStep.nqWhatToDo)}
          </p>
        </div>
      )}

      <motion.button
        type="button"
        onClick={onUpgrade}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 hover:-translate-y-0.5 transition-all duration-200"
      >
        Upgrade to {nextDef.name} <ArrowRight className="w-5 h-5" />
      </motion.button>
      <p className="mt-4 text-base text-slate-500">
        Or{' '}
        <Link href="/inbox" className="text-sky-600 font-semibold hover:underline">
          ask NQ a question
        </Link>{' '}
        anytime.
      </p>
    </motion.div>
  )
}

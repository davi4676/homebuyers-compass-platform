'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, ChevronDown } from 'lucide-react'
import { formatCurrency } from '@/lib/calculations'
import type { NarrativeQuizEntry } from '@/lib/icp-types'
import { US_STATES } from '@/lib/us-states'
import { getSampleProgramSummary } from '@/lib/quiz-state-programs'
import { SIGNUP_DISABLED } from '@/lib/auth-flags'

const SLIDE = {
  enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
} as const

type ConcernType = 'payment_high' | 'down_payment' | 'qualify' | 'exploring'
type JourneyStage = 'starting' | 'researching' | 'ready_soon' | 'with_lender'
type PrimaryConcern = 'afford' | 'process' | 'programs' | 'agent'

const AFFORDABILITY_Q1 = [
  { value: 'payment_high' as const, label: 'My monthly payment will be too high' },
  { value: 'down_payment' as const, label: "I don't have enough saved for a down payment" },
  { value: 'qualify' as const, label: "I'm not sure if I'll qualify" },
  { value: 'exploring' as const, label: "I'm just exploring what's possible" },
]

const PRICE_PRESETS = [
  { label: '$200K–$300K', rangeLabel: '$200K–$300K', mid: 250_000 },
  { label: '$300K–$400K', rangeLabel: '$300K–$400K', mid: 350_000 },
  { label: '$400K–$500K', rangeLabel: '$400K–$500K', mid: 450_000 },
  { label: '$500K+', rangeLabel: '$500K+', mid: 600_000 },
]

const GUIDED_Q1 = [
  { value: 'starting' as const, label: 'Just starting to think about it' },
  { value: 'researching' as const, label: "I've been researching for a while" },
  { value: 'ready_soon' as const, label: "I'm ready to start soon" },
  { value: 'with_lender' as const, label: "I'm already working with a lender" },
]

const GUIDED_Q2 = [
  { value: 'afford' as const, label: 'Whether I can actually afford it' },
  { value: 'process' as const, label: 'How the whole process works' },
  { value: 'programs' as const, label: 'What programs or grants I qualify for' },
  { value: 'agent' as const, label: 'How to find a trustworthy agent' },
]

function parseMoneyInput(raw: string): number {
  const n = Number(String(raw).replace(/[^0-9.]/g, ''))
  return Number.isFinite(n) ? n : 0
}

function openNestQuestChat() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('nestquest-open-chat'))
  }
}

function journeyStageDescription(stage: JourneyStage): string {
  switch (stage) {
    case 'starting':
      return 'just starting to think about it'
    case 'researching':
      return 'researching and learning the ropes'
    case 'ready_soon':
      return 'ready to start soon'
    case 'with_lender':
      return 'already working with a lender'
    default:
      return 'on your journey'
  }
}

function timelineForStage(stage: JourneyStage): string {
  switch (stage) {
    case 'starting':
    case 'researching':
      return '6–12 months'
    case 'ready_soon':
      return '3–6 months'
    case 'with_lender':
      return '1–3 months'
    default:
      return '6–12 months'
  }
}

function firstStepCopy(
  concern: PrimaryConcern,
  stateName: string
): { title: string; body: string; ctaHref: string; ctaLabel: string } {
  switch (concern) {
    case 'afford':
      return {
        title: 'Start with the Budget Sketch',
        body: 'It takes about 5 minutes and shows you the real monthly cost — not just the mortgage ads.',
        ctaHref: '/customized-journey?tab=budget',
        ctaLabel: 'Open Budget Sketch →',
      }
    case 'process':
      return {
        title: 'Start with Phase 1',
        body: "We'll walk you through every step in plain language — no jargon, no judgment.",
        ctaHref: '/customized-journey',
        ctaLabel: 'Open Phase 1 →',
      }
    case 'programs':
      return {
        title: 'Start with the Assistance tab',
        body: `We'll match you to programs in ${stateName} you may not know exist.`,
        ctaHref: '/customized-journey?tab=assistance',
        ctaLabel: 'Open Assistance tab →',
      }
    case 'agent':
      return {
        title: 'Start with the Library',
        body: 'Our agent negotiation guide is free and shows what to ask before you commit.',
        ctaHref: '/resources',
        ctaLabel: 'Browse the Library →',
      }
  }
}

type Props = { entry: NarrativeQuizEntry }

export function ConversationalIcpQuiz({ entry }: Props) {
  const [step, setStep] = useState(0)
  const [slideDir, setSlideDir] = useState(1)
  const [showResults, setShowResults] = useState(false)

  const [concernType, setConcernType] = useState<ConcernType | null>(null)
  const [monthlyIncome, setMonthlyIncome] = useState('')
  const [currentRent, setCurrentRent] = useState('')
  const [homePriceMid, setHomePriceMid] = useState<number | null>(null)
  const [homeRangeLabel, setHomeRangeLabel] = useState('')

  const [journeyStage, setJourneyStage] = useState<JourneyStage | null>(null)
  const [primaryConcern, setPrimaryConcern] = useState<PrimaryConcern | null>(null)
  const [stateCode, setStateCode] = useState('TX')
  const [stateSearch, setStateSearch] = useState('')
  const [stateOpen, setStateOpen] = useState(false)
  const statePanelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!stateOpen) return
    const close = (e: MouseEvent) => {
      if (statePanelRef.current && !statePanelRef.current.contains(e.target as Node)) setStateOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [stateOpen])

  const filteredStates = useMemo(() => {
    const q = stateSearch.trim().toLowerCase()
    if (!q) return US_STATES
    return US_STATES.filter((s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q))
  }, [stateSearch])

  const stateName = useMemo(() => US_STATES.find((s) => s.code === stateCode)?.name ?? stateCode, [stateCode])

  const totalSteps = 3
  const authRedirect = (path: string) =>
    SIGNUP_DISABLED ? path : `/auth?mode=signup&redirect=${encodeURIComponent(path)}`

  const rentNum = parseMoneyInput(currentRent)
  const incomeNum = parseMoneyInput(monthlyIncome)

  const estimatedMortgage =
    homePriceMid != null ? Math.round(homePriceMid * 0.007) : 0
  const monthlyDiff = estimatedMortgage - rentNum
  const downPaymentFivePct = homePriceMid != null ? Math.round(homePriceMid * 0.05) : 0

  const programSnippet = useMemo(() => getSampleProgramSummary(stateCode), [stateCode])
  const firstStep = primaryConcern ? firstStepCopy(primaryConcern, stateName) : null

  const canAdvance =
    entry === 'affordability'
      ? step === 0
        ? concernType !== null
        : step === 1
          ? incomeNum > 0 && rentNum >= 0
          : homePriceMid !== null
      : step === 0
        ? journeyStage !== null
        : step === 1
          ? primaryConcern !== null
          : stateCode.length === 2

  const goNext = () => {
    if (showResults) return
    if (!canAdvance) return
    if (step >= totalSteps - 1) {
      setSlideDir(1)
      setShowResults(true)
      try {
        const payload =
          entry === 'affordability'
            ? {
                conversationalQuiz: true,
                narrative: 'affordability' as const,
                concern_type: concernType,
                monthly_income: incomeNum,
                current_rent: rentNum,
                home_price: homePriceMid,
              }
            : {
                conversationalQuiz: true,
                narrative: 'guided' as const,
                journey_stage: journeyStage,
                primary_concern: primaryConcern,
                state: stateCode,
              }
        localStorage.setItem('quizData', JSON.stringify({ ...payload, completedAt: new Date().toISOString() }))
      } catch {
        /* ignore */
      }
      return
    }
    setSlideDir(1)
    setStep((s) => s + 1)
  }

  const goBack = () => {
    if (showResults) {
      setSlideDir(-1)
      setShowResults(false)
      return
    }
    if (step <= 0) return
    setSlideDir(-1)
    setStep((s) => s - 1)
  }

  const progressLabel = showResults ? 'Your results' : `Question ${step + 1} of ${totalSteps}`

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 sm:px-6 lg:px-8 pb-16">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/95 py-3 px-4 shadow-sm backdrop-blur-sm sticky top-4 z-30">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-[rgb(var(--navy))] px-3 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          <ArrowLeft size={16} />
          Home
        </Link>
        <span className="text-sm font-semibold text-slate-600">{progressLabel}</span>
      </div>

      {!showResults && (
        <div className="mb-6 h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-brand-forest transition-[width] duration-300 ease-out"
            style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
          />
        </div>
      )}

      <AnimatePresence mode="wait" custom={slideDir}>
        {!showResults && entry === 'affordability' && (
          <motion.div
            key={`a-${step}`}
            custom={slideDir}
            variants={SLIDE}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
          >
            {step === 0 && (
              <>
                <p className="text-sm font-semibold text-brand-sage">Affordability check</p>
                <h2 className="font-display mt-2 text-xl font-bold text-brand-forest sm:text-2xl">
                  What&apos;s your biggest concern right now?
                </h2>
                <div className="mt-6 grid gap-3">
                  {AFFORDABILITY_Q1.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setConcernType(opt.value)}
                      className={`rounded-xl border-2 p-4 text-left text-sm font-semibold transition sm:text-base ${
                        concernType === opt.value
                          ? 'border-brand-forest bg-brand-mist'
                          : 'border-slate-200 hover:border-brand-sage/50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
            {step === 1 && (
              <>
                <p className="text-sm font-semibold text-brand-sage">Your numbers</p>
                <p className="mt-1 text-sm font-medium text-slate-600">
                  These two numbers tell us more than anything else.
                </p>
                <h2 className="font-display mt-3 text-xl font-bold text-brand-forest sm:text-2xl">
                  Tell us about your current situation
                </h2>
                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700">My monthly take-home pay</label>
                    <div className="relative mt-2">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                        $
                      </span>
                      <input
                        type="text"
                        inputMode="decimal"
                        autoComplete="off"
                        placeholder="4,500"
                        value={monthlyIncome}
                        onChange={(e) => setMonthlyIncome(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 py-3 pl-8 pr-3 text-slate-900 shadow-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700">My current monthly rent</label>
                    <div className="relative mt-2">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                        $
                      </span>
                      <input
                        type="text"
                        inputMode="decimal"
                        autoComplete="off"
                        placeholder="1,800"
                        value={currentRent}
                        onChange={(e) => setCurrentRent(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 py-3 pl-8 pr-3 text-slate-900 shadow-sm"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <p className="text-sm font-semibold text-brand-sage">Price range</p>
                <h2 className="font-display mt-2 text-xl font-bold text-brand-forest sm:text-2xl">
                  What home price range are you thinking?
                </h2>
                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {PRICE_PRESETS.map((p) => (
                    <button
                      key={p.mid}
                      type="button"
                      onClick={() => {
                        setHomePriceMid(p.mid)
                        setHomeRangeLabel(p.rangeLabel)
                      }}
                      className={`rounded-xl border-2 px-4 py-4 text-center text-base font-bold transition ${
                        homePriceMid === p.mid
                          ? 'border-brand-forest bg-brand-mist text-brand-forest'
                          : 'border-slate-200 text-slate-800 hover:border-brand-sage/50'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}

        {!showResults && entry === 'guided' && (
          <motion.div
            key={`g-${step}`}
            custom={slideDir}
            variants={SLIDE}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
          >
            {step === 0 && (
              <>
                <p className="text-sm font-semibold text-brand-sage">Guided journey</p>
                <h2 className="font-display mt-2 text-xl font-bold text-brand-forest sm:text-2xl">
                  Where are you in your home buying journey?
                </h2>
                <div className="mt-6 grid gap-3">
                  {GUIDED_Q1.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setJourneyStage(opt.value)}
                      className={`rounded-xl border-2 p-4 text-left text-sm font-semibold transition sm:text-base ${
                        journeyStage === opt.value
                          ? 'border-brand-forest bg-brand-mist'
                          : 'border-slate-200 hover:border-brand-sage/50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
            {step === 1 && (
              <>
                <p className="text-sm font-semibold text-brand-sage">Honest question</p>
                <h2 className="font-display mt-2 text-xl font-bold text-brand-forest sm:text-2xl">
                  What&apos;s the one thing you&apos;re most unsure about?
                </h2>
                <div className="mt-6 grid gap-3">
                  {GUIDED_Q2.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setPrimaryConcern(opt.value)}
                      className={`rounded-xl border-2 p-4 text-left text-sm font-semibold transition sm:text-base ${
                        primaryConcern === opt.value
                          ? 'border-brand-forest bg-brand-mist'
                          : 'border-slate-200 hover:border-brand-sage/50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <p className="text-sm font-semibold text-brand-sage">Location</p>
                <h2 className="font-display mt-2 text-xl font-bold text-brand-forest sm:text-2xl">
                  What state are you hoping to buy in?
                </h2>
                <div className="relative mt-6" ref={statePanelRef}>
                  <button
                    type="button"
                    onClick={() => setStateOpen((o) => !o)}
                    className="flex w-full items-center justify-between rounded-xl border border-slate-300 bg-white px-4 py-3 text-left text-sm font-medium text-slate-900 shadow-sm"
                    aria-expanded={stateOpen}
                    aria-haspopup="listbox"
                  >
                    <span>
                      {stateName} ({stateCode})
                    </span>
                    <ChevronDown className={`h-5 w-5 shrink-0 transition ${stateOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {stateOpen && (
                    <div className="absolute z-40 mt-2 max-h-64 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                      <div className="border-b border-slate-100 p-2">
                        <input
                          type="search"
                          placeholder="Search states…"
                          value={stateSearch}
                          onChange={(e) => setStateSearch(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                          autoFocus
                        />
                      </div>
                      <ul role="listbox" className="max-h-48 overflow-auto p-1">
                        {filteredStates.map((s) => (
                          <li key={s.code}>
                            <button
                              type="button"
                              role="option"
                              aria-selected={stateCode === s.code}
                              onClick={() => {
                                setStateCode(s.code)
                                setStateOpen(false)
                                setStateSearch('')
                              }}
                              className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                                stateCode === s.code ? 'bg-brand-mist font-semibold' : 'hover:bg-slate-50'
                              }`}
                            >
                              {s.name} ({s.code})
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}

        {showResults && entry === 'affordability' && homePriceMid !== null && (
          <motion.div
            key="ra"
            custom={slideDir}
            variants={SLIDE}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="space-y-5"
          >
            <div className="text-center">
              <h2 className="font-display text-2xl font-bold text-brand-forest sm:text-3xl">
                Here&apos;s your real picture.
              </h2>
              <p className="mt-2 text-base text-slate-600">
                Based on {homeRangeLabel} in your area.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <p className="text-center text-xs font-bold uppercase tracking-wide text-slate-500">
                Payment comparison
              </p>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4 text-center">
                  <p className="text-sm font-semibold text-slate-600">Your rent today</p>
                  <p className="mt-2 font-display text-3xl font-extrabold text-slate-900 tabular-nums">
                    {formatCurrency(rentNum)}/mo
                  </p>
                </div>
                <div className="rounded-xl bg-brand-mist/50 p-4 text-center">
                  <p className="text-sm font-semibold text-slate-600">Estimated mortgage</p>
                  <p className="mt-2 font-display text-3xl font-extrabold text-brand-forest tabular-nums">
                    {formatCurrency(estimatedMortgage)}/mo
                  </p>
                </div>
              </div>
              <p
                className={`mt-4 text-center text-sm font-bold ${
                  monthlyDiff <= 0 ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                Difference: {monthlyDiff >= 0 ? '+' : '−'}
                {formatCurrency(Math.abs(monthlyDiff))}/mo
                {monthlyDiff <= 0 ? ' (mortgage is less than rent — estimate only)' : ' (mortgage is more than rent — estimate only)'}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <p className="font-display text-lg font-bold text-brand-forest">Down payment gap</p>
              <p className="mt-2 text-sm text-slate-700">
                You&apos;d need about <strong>{formatCurrency(downPaymentFivePct)}</strong> for a 5% down payment.
              </p>
              <p className="mt-2 text-sm text-slate-700">
                We found <strong>5</strong> programs that could cover part of this — up to{' '}
                <strong>{formatCurrency(17500)}</strong>.
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Illustrative state averages for demos; eligibility varies by program and income.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <p className="font-display text-lg font-bold text-brand-forest">Readiness signal</p>
              <div className="mt-4 space-y-3">
                {(['Financial Picture', 'Timeline', 'Program Match'] as const).map((label) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs font-semibold text-slate-600">
                      <span>{label}</span>
                      <span className="text-amber-700">60%</span>
                    </div>
                    <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full w-[60%] rounded-full bg-gradient-to-r from-amber-500 to-amber-600"
                        aria-hidden
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm font-medium text-slate-700">
                Good starting point. Let&apos;s sharpen the picture.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href={authRedirect('/customized-journey')}
                className="inline-flex h-12 items-center justify-center rounded-xl bg-brand-forest px-6 text-center text-base font-semibold text-white shadow-md hover:bg-brand-forest/90"
              >
                Start My Full Journey →
              </Link>
              <Link
                href="/quiz?type=full"
                className="inline-flex h-12 items-center justify-center rounded-xl border-2 border-slate-300 bg-white px-6 text-center text-base font-semibold text-slate-800 hover:bg-slate-50"
              >
                See the full breakdown (10 questions)
              </Link>
            </div>
          </motion.div>
        )}

        {showResults && entry === 'guided' && journeyStage && primaryConcern && (
          <motion.div
            key="rg"
            custom={slideDir}
            variants={SLIDE}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="space-y-5"
          >
            <div className="text-center">
              <h2 className="font-display text-2xl font-bold text-brand-forest sm:text-3xl">
                You&apos;re in the right place. Here&apos;s where to start.
              </h2>
              <p className="mt-2 text-base text-slate-600">We built this for people exactly like you.</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <p className="font-display text-lg font-bold text-brand-forest">Your starting point</p>
              <p className="mt-2 text-sm text-slate-700">
                You&apos;re <strong>{journeyStageDescription(journeyStage)}</strong>. That&apos;s a great place to be.
              </p>
              <p className="mt-2 text-sm text-slate-700">
                Most buyers in your position close within <strong>{timelineForStage(journeyStage)}</strong>.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <p className="font-display text-lg font-bold text-brand-forest">Programs in your state</p>
              <p className="mt-2 text-sm text-slate-700">
                We found <strong>{programSnippet.count}</strong> assistance programs in <strong>{stateName}</strong>.
              </p>
              <ul className="mt-3 space-y-2">
                {programSnippet.topTwo.map((p) => (
                  <li
                    key={p.name}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm"
                  >
                    <span className="font-semibold text-slate-900">{p.name}</span>
                    <span className="font-bold text-emerald-800">Up to {formatCurrency(p.max)}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm text-slate-700">
                Up to <strong>{formatCurrency(programSnippet.maxAmount)}</strong> available — no repayment required for
                most programs.
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Illustrative samples — verify with each program administrator.
              </p>
            </div>

            {firstStep && (
              <div className="rounded-2xl border-2 border-amber-400/60 bg-amber-50/80 p-5 shadow-sm sm:p-6">
                <p className="text-xs font-bold uppercase tracking-wide text-amber-900/80">Your first step</p>
                <p className="font-display mt-2 text-lg font-bold text-brand-forest">{firstStep.title}</p>
                <p className="mt-2 text-sm text-slate-800">{firstStep.body}</p>
                <Link
                  href={authRedirect(firstStep.ctaHref)}
                  className="mt-4 inline-flex items-center gap-2 font-bold text-brand-forest hover:underline"
                >
                  {firstStep.ctaLabel} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href={authRedirect('/customized-journey')}
                className="inline-flex h-12 items-center justify-center rounded-xl bg-brand-forest px-6 text-center text-base font-semibold text-white shadow-md hover:bg-brand-forest/90"
              >
                Start My Guided Journey →
              </Link>
              <button
                type="button"
                onClick={openNestQuestChat}
                className="inline-flex h-12 items-center justify-center rounded-xl border-2 border-slate-300 bg-white px-6 text-center text-base font-semibold text-slate-800 hover:bg-slate-50"
              >
                I have more questions
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!showResults && (
        <div className="mt-8 flex justify-between gap-4">
          {step === 0 ? (
            <Link
              href="/"
              className="rounded-xl border border-slate-300 px-5 py-3 text-center text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Back
            </Link>
          ) : (
            <button
              type="button"
              onClick={goBack}
              className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={goNext}
            disabled={!canAdvance}
            className="rounded-xl bg-brand-forest px-6 py-3 text-sm font-semibold text-white disabled:opacity-40"
          >
            {step >= totalSteps - 1 ? 'See results' : 'Next'}
          </button>
        </div>
      )}

      {showResults && (
        <div className="mt-8 flex justify-start">
          <button
            type="button"
            onClick={goBack}
            className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800"
          >
            Back
          </button>
        </div>
      )}
    </div>
  )
}

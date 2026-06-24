'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Check } from 'lucide-react'
import { PLAN_YOUR_JOURNEY_STEPS, type PlanYourJourneyStep, type PlanYourJourneyPhaseId } from '@/lib/plan-your-journey-steps'

function getHref(pathname: string, phaseId: PlanYourJourneyStep['phaseId']): string {
  if (pathname === '/customized-journey') return `#phase-${phaseId}`
  if (phaseId === 'pre-approval') return '/quiz'
  return '/customized-journey'
}

const COMPLETED_PHASES_KEY = 'journeyPhaseCompletedIndices'

function loadCompletedPhaseIndices(): Set<number> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(COMPLETED_PHASES_KEY)
    if (!raw) return new Set()
    const arr = JSON.parse(raw) as number[]
    return new Set(arr.filter((i) => i >= 0 && i < PLAN_YOUR_JOURNEY_STEPS.length))
  } catch {
    return new Set()
  }
}

function saveCompletedPhaseIndices(indices: Set<number>): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(COMPLETED_PHASES_KEY, JSON.stringify(Array.from(indices)))
  } catch {
    // ignore
  }
}

type NodeStatus = 'completed' | 'current' | 'available'

interface JourneyNodeProps {
  step: PlanYourJourneyStep
  index: number
  status: NodeStatus
  pathname: string
  onStepClick?: () => void
}

function JourneyNode({ step, index, status, pathname, onStepClick }: JourneyNodeProps) {
  const Icon = step.icon
  const href = getHref(pathname, step.phaseId)
  const isHashLink = href.startsWith('#')

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!isHashLink) return
      e.preventDefault()
      const id = href.replace(/^#/, '')
      const el = document.getElementById(id)
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      if (typeof window !== 'undefined') window.history.replaceState(null, '', href)
      onStepClick?.()
    },
    [href, isHashLink, onStepClick]
  )

  const tileContent = (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`
        nq-ed-soft-card relative overflow-hidden p-6 text-center transition-all duration-300 min-h-[200px]
        flex flex-col items-center justify-between cursor-pointer
        hover:-translate-y-0.5 hover:shadow-md
        group border
        ${status === 'current'
          ? 'border-[var(--nq-ed-accent)]/40 bg-[#fffdf8] ring-2 ring-[var(--nq-ed-accent)]/25 shadow-[0_16px_36px_rgba(20,124,114,0.09)]'
          : status === 'completed'
            ? 'border-[var(--nq-ed-line)] bg-[var(--nq-ed-surface)]'
            : 'border-[var(--nq-ed-line)] bg-[var(--nq-ed-surface)]'}
      `}
    >
      <div className="relative flex flex-col items-center w-full">
        <motion.div
          className={`
            inline-flex items-center justify-center w-[72px] h-[72px] rounded-2xl mb-4 shadow-sm
            ${status === 'completed'
              ? 'bg-[var(--nq-ed-accent)] text-white'
              : status === 'current'
                ? 'bg-[var(--nq-ed-accent-soft)] text-[var(--nq-ed-accent)] ring-2 ring-[var(--nq-ed-accent)]/30'
                : 'bg-[var(--nq-ed-surface-2)] text-[var(--nq-ed-muted)]'}
          `}
          whileHover={{ scale: status === 'current' ? 1.05 : 1.02 }}
        >
          {status === 'completed' ? <Check className="w-9 h-9" /> : <Icon className="w-8 h-8" strokeWidth={2} />}
        </motion.div>
        <span className="nq-ed-eyebrow mb-2">Step {step.id}</span>
        <h3 className="min-h-[3.5rem] flex items-center justify-center text-lg font-bold leading-tight text-[var(--nq-ed-text)]">
          {step.title}
        </h3>
      </div>
      <div className="relative flex items-center gap-2">
        <span className="rounded-lg border border-[var(--nq-ed-line-soft)] bg-[var(--nq-ed-surface-2)] px-3 py-1.5 text-xs font-medium text-[var(--nq-ed-muted)]">
          ⏱️ {step.duration}
        </span>
        {status === 'current' && (
          <motion.span
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-sm font-semibold text-[var(--nq-ed-accent)]"
          >
            Resume →
          </motion.span>
        )}
      </div>
    </motion.div>
  )

  return (
    <Link
      href={href}
      onClick={handleClick}
      className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nq-ed-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--nq-ed-surface)]"
    >
      {tileContent}
    </Link>
  )
}

function JourneyHeroHeader({
  currentPhaseTitle,
  completedCount,
  totalSteps,
}: {
  currentPhaseTitle: string
  completedCount: number
  totalSteps: number
}) {
  const pct = totalSteps > 0 ? Math.round(((completedCount + 1) / totalSteps) * 100) : 0
  const circumference = 2 * Math.PI * 26
  const strokeDashoffset = circumference - (pct / 100) * circumference

  return (
    <header className="sticky top-0 z-40 mb-8 rounded-2xl border border-[var(--nq-ed-line-soft)] bg-[var(--nq-ed-surface)] shadow-[0_4px_24px_rgba(29,23,17,0.06)] backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-5">
        <div className="min-w-0">
          <div className="nq-ed-eyebrow mb-1">Next up</div>
          <h2 className="font-display text-xl font-semibold tracking-tight text-[var(--nq-ed-text)] md:text-2xl">
            {currentPhaseTitle}
          </h2>
        </div>
        <div className="flex-shrink-0 relative w-16 h-16">
          <svg className="w-16 h-16 -rotate-90 drop-shadow-lg" viewBox="0 0 64 64">
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--nq-ed-accent)" />
                <stop offset="100%" stopColor="#0f6058" />
              </linearGradient>
            </defs>
            <circle cx="32" cy="32" r="26" fill="none" stroke="var(--nq-ed-line-soft)" strokeWidth="4" />
            <motion.circle
              cx="32"
              cy="32"
              r="26"
              fill="none"
              stroke="url(#progressGradient)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-[var(--nq-ed-text)] drop-shadow-sm">
            {pct}%
          </span>
        </div>
      </div>
    </header>
  )
}

export default function PersonalizedJourneyPath() {
  const pathname = usePathname()
  const containerRef = useRef<HTMLDivElement>(null)

  const [completedIndices, setCompletedIndices] = useState<Set<number>>(new Set())
  useEffect(() => {
    setCompletedIndices(loadCompletedPhaseIndices())
  }, [pathname])

  const totalSteps = PLAN_YOUR_JOURNEY_STEPS.length

  const completedCount = completedIndices.size
  const firstIncompleteIndex = useMemo(() => {
    for (let i = 0; i < PLAN_YOUR_JOURNEY_STEPS.length; i++) if (!completedIndices.has(i)) return i
    return PLAN_YOUR_JOURNEY_STEPS.length - 1
  }, [completedIndices])
  const currentPhaseTitle = PLAN_YOUR_JOURNEY_STEPS[firstIncompleteIndex]?.title ?? PLAN_YOUR_JOURNEY_STEPS[PLAN_YOUR_JOURNEY_STEPS.length - 1].title

  const getStepStatus = (index: number): NodeStatus => {
    if (completedIndices.has(index)) return 'completed'
    if (index === firstIncompleteIndex) return 'current'
    return 'available'
  }

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })
  const spineScaleY = useTransform(scrollYProgress, [0, 0.15, 0.5, 1], [0, 0.25, 0.6, 1])

  return (
    <div ref={containerRef} className="mx-auto max-w-2xl px-2 scroll-mt-28 sm:px-0">
      <JourneyHeroHeader
        currentPhaseTitle={currentPhaseTitle}
        completedCount={completedCount}
        totalSteps={totalSteps}
      />

      <div className="relative pl-10">
        <div
          className="absolute bottom-0 left-[27px] top-0 w-1 -translate-x-1/2 rounded-full bg-[var(--nq-ed-line-soft)]"
          aria-hidden
        />
        <div className="absolute left-[27px] top-0 bottom-0 w-1 overflow-hidden -translate-x-1/2 rounded-full">
          <motion.div
            className="absolute left-0 top-0 h-full w-full origin-top rounded-full bg-gradient-to-b from-[var(--nq-ed-accent)] to-[#0f6058]"
            style={{ scaleY: spineScaleY }}
          />
        </div>

        <ul className="relative space-y-6 pb-12">
          {PLAN_YOUR_JOURNEY_STEPS.map((step, index) => (
            <li key={step.id} id={`phase-${step.phaseId}`} className="scroll-mt-28">
              <JourneyNode step={step} index={index} status={getStepStatus(index)} pathname={pathname ?? ''} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

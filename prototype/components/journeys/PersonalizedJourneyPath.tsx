'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { motion, useScroll, useTransform, useMotionValue } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Check } from 'lucide-react'
import { PLAN_YOUR_JOURNEY_STEPS, type PlanYourJourneyStep, type PlanYourJourneyPhaseId } from '@/lib/plan-your-journey-steps'

// Step names and styling come from shared config. On customized-journey use hash anchors; otherwise route by phaseId.
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

// --- JourneyNode: single milestone in "Plan Your Journey" tile format (all steps unlocked) ---
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
        relative overflow-hidden rounded-2xl border-2 p-6 text-center transition-all duration-300 min-h-[200px]
        flex flex-col items-center justify-between cursor-pointer
        hover:scale-[1.02] hover:shadow-xl hover:-translate-y-0.5
        group
        ${step.borderColor}
        ${status === 'current' ? 'shadow-[0_0_32px_rgba(34,211,238,0.35)] ring-2 ring-cyan-400/50' : 'shadow-lg'}
        ${status === 'completed' ? 'bg-slate-800/90' : 'bg-slate-800/95'}
      `}
    >
      {/* Gradient accent overlay — each step gets its own color wash */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-[0.12] group-hover:opacity-[0.18] transition-opacity`}
        aria-hidden
      />
      {/* Left accent bar */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${step.color} rounded-l-2xl`}
        aria-hidden
      />
      <div className="relative flex flex-col items-center w-full">
        <motion.div
          className={`
            inline-flex items-center justify-center w-[72px] h-[72px] rounded-2xl mb-4 shadow-xl
            ${status === 'completed' ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white' : `bg-gradient-to-br ${step.color} shadow-lg`}
            ${status === 'current' ? 'ring-4 ring-cyan-400/40 scale-110' : ''}
          `}
          whileHover={{ scale: status === 'current' ? 1.1 : 1.05 }}
        >
          {status === 'completed' ? <Check className="w-9 h-9" /> : <Icon className="text-white w-8 h-8" strokeWidth={2} />}
        </motion.div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Step {step.id}</span>
        <h3 className="text-lg font-bold text-white min-h-[3.5rem] flex items-center justify-center leading-tight">
          {step.title}
        </h3>
      </div>
      <div className="relative flex items-center gap-2">
        <span className="text-xs font-medium text-slate-400 bg-slate-700/80 backdrop-blur rounded-lg px-3 py-1.5">
          ⏱️ {step.duration}
        </span>
        {status === 'current' && (
          <motion.span
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-sm font-semibold text-cyan-400"
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
      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded-2xl"
    >
      {tileContent}
    </Link>
  )
}

// --- Sticky Hero: "Next Up: [Step Name]" + circular progress ring ---
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
    <header className="sticky top-0 z-40 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 backdrop-blur-md border-b border-cyan-500/20 rounded-b-2xl mb-8 shadow-[0_4px_30px_rgba(34,211,238,0.08)]">
      <div className="max-w-3xl mx-auto px-5 py-5 flex items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-cyan-400/90 uppercase tracking-widest mb-1">Next up</div>
          <h2 className="text-xl md:text-2xl font-bold text-white drop-shadow-sm">{currentPhaseTitle}</h2>
        </div>
        <div className="flex-shrink-0 relative w-16 h-16">
          <svg className="w-16 h-16 -rotate-90 drop-shadow-lg" viewBox="0 0 64 64">
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
            <circle cx="32" cy="32" r="26" fill="none" stroke="rgb(51, 65, 85)" strokeWidth="4" />
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
          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white drop-shadow-md">
            {pct}%
          </span>
        </div>
      </div>
    </header>
  )
}

// --- Main: Vertical Progress Path with spine (Plan Your Journey tile format) ---
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
    <div ref={containerRef} className="max-w-2xl mx-auto">
      <JourneyHeroHeader
        currentPhaseTitle={currentPhaseTitle}
        completedCount={completedCount}
        totalSteps={totalSteps}
      />

      {/* Vertical path with spine */}
      <div className="relative pl-10">
        {/* Spine track (background) */}
        <div
          className="absolute left-[27px] top-0 bottom-0 w-1 rounded-full bg-slate-700/60 -translate-x-1/2"
          aria-hidden
        />
        {/* Spine: gradient fill animates with scroll */}
        <div className="absolute left-[27px] top-0 bottom-0 w-1 overflow-hidden -translate-x-1/2 rounded-full">
          <motion.div
            className="absolute left-0 top-0 w-full h-full rounded-full bg-gradient-to-b from-cyan-400 via-teal-400 to-purple-500 shadow-[0_0_8px_rgba(34,211,238,0.4)] origin-top"
            style={{ scaleY: spineScaleY }}
          />
        </div>

        <ul className="relative space-y-6 pb-12">
          {PLAN_YOUR_JOURNEY_STEPS.map((step, index) => (
            <li key={step.id}>
              <JourneyNode step={step} index={index} status={getStepStatus(index)} pathname={pathname ?? ''} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

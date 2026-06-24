'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, MapPin, Calculator } from '@phosphor-icons/react'
import {
  journeyTabHrefPreservingSearch,
  JOURNEY_PAGE_PATH,
  type JourneyTab,
} from '@/lib/journey-nav-tabs'
import { recordSessionWin } from '@/lib/session-wins'
import { getNQStepByIndex, isNqGuidedPhaseFullyComplete } from '@/lib/nq-guided-steps'
import { useMomentumFactors } from '@/hooks/use-momentum-factors'

type Props = { searchKey: string; activeJourneyTab?: JourneyTab }

const LS_HERO_VISIT_PHASE = 'nq_hero_last_visit_phase'
const LS_HERO_VISIT_BUDGET = 'nq_hero_last_visit_budget'

const EASE = [0.22, 1, 0.36, 1] as const

type Primary = 'phase' | 'budget'

function readBudgetSketchComplete(): boolean {
  try {
    const stored = localStorage.getItem('nq_momentum_factors')
    if (stored) {
      return Boolean(JSON.parse(stored).budgetSketchCompleted)
    }
    return false
  } catch {
    return false
  }
}

function readCurrentPhaseComplete(): boolean {
  try {
    const rawStep = JSON.parse(localStorage.getItem('nq_current_step') || '0')
    const step = getNQStepByIndex(Number(rawStep))
    if (!step) return false
    const doneRaw = JSON.parse(localStorage.getItem('nq_completed_steps') || '[]') as number[]
    const completedSteps = new Set(doneRaw)
    return isNqGuidedPhaseFullyComplete(step.phaseOrder, completedSteps)
  } catch {
    return false
  }
}

function resolvePrimary(
  budgetSketchComplete: boolean,
  currentPhaseComplete: boolean,
  lastPhaseVisit: number,
  lastBudgetVisit: number
): Primary {
  if (!budgetSketchComplete) return 'budget'
  if (!currentPhaseComplete) return 'phase'
  if (lastPhaseVisit === 0 && lastBudgetVisit === 0) return 'phase'
  return lastPhaseVisit <= lastBudgetVisit ? 'phase' : 'budget'
}

function recordHeroVisit(kind: Primary) {
  try {
    localStorage.setItem(kind === 'phase' ? LS_HERO_VISIT_PHASE : LS_HERO_VISIT_BUDGET, String(Date.now()))
  } catch {
    /* ignore */
  }
}

/** Legacy `tab=` values preserved for routing (see `LEGACY_TAB_MAP` in journey-nav-tabs). */
const PHASE_TAB = 'phase' as JourneyTab
const BUDGET_TAB = 'budget' as JourneyTab

/**
 * Primary “Today” loop: phase work + money work. Other journey sections live in the index (see journey page copy).
 */
export default function JourneyTodayHero({ searchKey, activeJourneyTab }: Props) {
  const factors = useMomentumFactors()
  const [primary, setPrimary] = useState<Primary>('phase')

  const phaseHref = journeyTabHrefPreservingSearch(JOURNEY_PAGE_PATH, searchKey, PHASE_TAB)
  const budgetHref = journeyTabHrefPreservingSearch(JOURNEY_PAGE_PATH, searchKey, BUDGET_TAB)

  const refreshPrimary = useCallback(() => {
    if (typeof window === 'undefined') return
    const budgetSketchComplete = readBudgetSketchComplete()
    const currentPhaseComplete = readCurrentPhaseComplete()
    const lastPhaseVisit = parseInt(localStorage.getItem(LS_HERO_VISIT_PHASE) || '0', 10)
    const lastBudgetVisit = parseInt(localStorage.getItem(LS_HERO_VISIT_BUDGET) || '0', 10)
    setPrimary(resolvePrimary(budgetSketchComplete, currentPhaseComplete, lastPhaseVisit, lastBudgetVisit))
  }, [])

  useEffect(() => {
    refreshPrimary()
  }, [refreshPrimary, factors.budgetSketchCompleted, activeJourneyTab])

  useEffect(() => {
    const onRefresh = () => refreshPrimary()
    window.addEventListener('nq-journey-progress', onRefresh)
    window.addEventListener('nq-momentum-factors-changed', onRefresh)
    window.addEventListener('storage', onRefresh)
    return () => {
      window.removeEventListener('nq-journey-progress', onRefresh)
      window.removeEventListener('nq-momentum-factors-changed', onRefresh)
      window.removeEventListener('storage', onRefresh)
    }
  }, [refreshPrimary])

  const phaseMeta = useMemo(
    () => ({
      kind: 'phase' as Primary,
      title: 'Your current phase',
      description:
        'See this week’s tasks, what to compare, and what to finish before the next step.',
      href: phaseHref,
      win: 'Opened Your Phase from Today' as const,
      cta: 'Review my phase',
      // When phase is primary, the secondary nudge is the budget tool.
      supportingLabel: 'Check your money picture',
      supportingDesc:
        'Confirm your numbers and compare program tradeoffs before your next lender step.',
      supportingCta: 'Open budget →',
      Icon: MapPin,
      timeLabel: 'About 4 minutes',
    }),
    [phaseHref]
  )

  const budgetMeta = useMemo(
    () => ({
      kind: 'budget' as Primary,
      title: 'Sketch your budget',
      description:
        'Lock in a payment you can afford — then compare programs and lender offers with confidence.',
      href: budgetHref,
      win: 'Opened Budget Sketch from Today' as const,
      cta: 'Open budget sketch',
      // When budget is primary, the secondary nudge is phase details (per spec copy).
      supportingLabel: 'Check your phase details',
      supportingDesc:
        'Review your next tasks, reminders, and documents before moving forward.',
      supportingCta: 'Open details →',
      Icon: Calculator,
      timeLabel: 'About 5 minutes',
    }),
    [budgetHref]
  )

  const hero = primary === 'phase' ? phaseMeta : budgetMeta
  const supporting = primary === 'phase' ? budgetMeta : phaseMeta

  return (
    <section
      className="nq-glass relative overflow-hidden rounded-3xl border border-[var(--nq-ed-line-soft)] p-6 sm:p-8"
      aria-labelledby="journey-today-heading"
    >
      <span
        className="pointer-events-none absolute left-7 top-0 h-[2px] w-9 rounded-b bg-[var(--nq-ed-accent)] sm:left-8"
        aria-hidden
      />

      <span className="nq-ed-eyebrow">Today</span>
      <h2
        id="journey-today-heading"
        className="mt-3 font-display text-[clamp(1.5rem,3.2vw,2.1rem)] font-semibold leading-[1.15] tracking-tight text-[var(--nq-ed-text)]"
      >
        Do this next
      </h2>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[var(--nq-ed-muted)] sm:text-base">
        One primary action below — usually under five minutes. Everything else can wait.
      </p>

      <div className="nq-journey-bento mt-7">
        {/* Primary "Your move for today" card — visually dominant */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05, ease: EASE }}
          className="nq-journey-bento-primary"
        >
          <Link
            href={hero.href}
            scroll={false}
            onClick={() => {
              recordHeroVisit(hero.kind)
              recordSessionWin(hero.win)
            }}
            className="nq-ed-card-primary group relative flex h-full cursor-pointer flex-col overflow-hidden p-6 sm:p-7"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--nq-ed-muted)]">
                Your move for today
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--nq-ed-accent-soft)] px-3 py-1 text-[11px] font-bold text-[var(--nq-ed-accent)] ring-1 ring-inset ring-[var(--nq-ed-accent)]/20">
                <Clock weight="duotone" size={12} aria-hidden />
                {hero.timeLabel}
              </span>
            </div>

            <div className="mt-5 flex items-start gap-3.5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--nq-ed-accent-soft)] text-[var(--nq-ed-accent)] ring-1 ring-inset ring-[var(--nq-ed-accent)]/15">
                <hero.Icon weight="duotone" size={22} aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="font-display text-[1.4rem] font-semibold leading-snug tracking-tight text-[var(--nq-ed-text)] sm:text-2xl">
                  {hero.title}
                </p>
                <p className="mt-2.5 text-[15px] leading-relaxed text-[var(--nq-ed-muted)] sm:text-base">
                  {hero.description}
                </p>
              </div>
            </div>

            <div className="mt-7 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-[var(--nq-ed-accent)] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition group-hover:bg-[#0f6058]">
                {hero.cta} →
              </span>
              <span className="text-xs italic text-[var(--nq-ed-muted)]">
                Most buyers can complete this in one visit.
              </span>
            </div>
          </Link>
        </motion.div>

        {/* Supporting card — visually secondary: smaller padding, no tinted background, no large CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.18, ease: EASE }}
          className="nq-journey-bento-secondary"
        >
          <Link
            href={supporting.href}
            scroll={false}
            onClick={() => {
              recordHeroVisit(supporting.kind)
              recordSessionWin(supporting.win)
            }}
            className="nq-ed-card-secondary group flex h-full cursor-pointer flex-col p-5"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--nq-ed-muted)]">
              Also worth doing
            </span>
            <div className="mt-3 min-w-0">
              <p className="font-display text-base font-semibold leading-snug text-[var(--nq-ed-text)] sm:text-lg">
                {supporting.supportingLabel}
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--nq-ed-muted)] sm:text-sm">
                {supporting.supportingDesc}
              </p>
            </div>
            <span className="mt-auto inline-flex items-center pt-4 text-sm font-semibold text-[var(--nq-ed-accent)] transition-transform duration-200 group-hover:translate-x-1">
              {supporting.supportingCta}
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

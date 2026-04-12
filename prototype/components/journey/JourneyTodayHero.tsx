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

const HERO_GRADIENT = 'linear-gradient(135deg, #2D6A4F 0%, #52B788 60%, #F4A261 100%)'

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
 * Primary “Today” loop: phase work + money work. Other tabs are secondary (see journey page copy).
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
      title: 'Your Phase',
      description: 'See exactly what to do this week — no guesswork',
      href: phaseHref,
      win: 'Opened Your Phase from Today' as const,
      cta: 'Go to Your Phase',
      supportingCta: 'Go to phase →',
      Icon: MapPin,
    }),
    [phaseHref]
  )

  const budgetMeta = useMemo(
    () => ({
      kind: 'budget' as Primary,
      title: 'Budget Sketch',
      description: 'Know your number before you fall in love with a house',
      href: budgetHref,
      win: 'Opened Budget Sketch from Today' as const,
      cta: 'Open Budget Sketch',
      supportingCta: 'Open budget →',
      Icon: Calculator,
    }),
    [budgetHref]
  )

  const hero = primary === 'phase' ? phaseMeta : budgetMeta
  const supporting = primary === 'phase' ? budgetMeta : phaseMeta

  return (
    <section
      className="mb-8 rounded-2xl border-2 border-teal-200/80 bg-gradient-to-br from-teal-50/90 via-white to-emerald-50/40 p-5 shadow-md ring-1 ring-teal-100/60 sm:p-6"
      aria-labelledby="journey-today-heading"
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-teal-800/90">Today</p>
      <h2 id="journey-today-heading" className="mt-1 font-display text-xl font-extrabold text-millennial-text sm:text-2xl">
        Two moves that move the needle
      </h2>
      <p className="mt-1 text-sm text-millennial-text-muted">
        Start here most visits. Use the other tabs anytime for library, inbox, programs, and upgrades.
      </p>

      <div className="mt-4 flex flex-col gap-3 md:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
        >
          <Link
            href={hero.href}
            scroll={false}
            onClick={() => {
              recordHeroVisit(hero.kind)
              recordSessionWin(hero.win)
            }}
            className="group relative block w-full overflow-hidden rounded-2xl p-5 text-white shadow-lg ring-1 ring-white/20 transition-[transform,box-shadow] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.03] hover:shadow-2xl sm:p-6"
            style={{ background: HERO_GRADIENT }}
          >
            <span className="absolute right-4 top-4 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-[var(--primary)]">
              ⚡ Start here
            </span>
            <div className="flex items-start gap-3 pr-24">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white">
                <hero.Icon weight="duotone" size={20} className="text-white" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className="text-[26px] leading-tight text-white"
                  style={{ fontFamily: 'var(--font-dm-serif), "DM Serif Display", ui-serif, Georgia, serif' }}
                >
                  Your move for today
                </p>
                <p className="mt-1 font-[family-name:var(--font-dm-sans)] text-lg font-semibold leading-snug text-white">
                  {hero.title}
                </p>
                <p className="mt-2 max-w-xl font-[family-name:var(--font-dm-sans)] text-sm font-normal leading-relaxed text-white/85">
                  {hero.description}
                </p>
                <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium text-white">
                  <Clock weight="duotone" size={14} className="shrink-0 opacity-90" aria-hidden />
                  ~4 min
                </p>
                <div className="mt-4">
                  <span className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-bold text-[var(--primary)] shadow-sm">
                    {hero.cta}
                  </span>
                </div>
                <p className="mt-3 text-xs italic text-white/70">Most users complete this in one visit</p>
              </div>
            </div>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.22, ease: EASE }}
          className="w-full md:inline-block md:w-[48%] md:max-w-full"
        >
          <Link
            href={supporting.href}
            scroll={false}
            onClick={() => {
              recordHeroVisit(supporting.kind)
              recordSessionWin(supporting.win)
            }}
            className="group block rounded-2xl border border-[rgba(45,106,79,0.12)] bg-white p-4 shadow-sm transition hover:border-[rgba(45,106,79,0.22)] hover:shadow-md sm:p-5"
          >
            <p className="text-lg font-semibold text-millennial-text">{supporting.title}</p>
            <p className="mt-1 text-[13px] leading-snug text-[var(--muted)]">{supporting.description}</p>
            <span className="mt-3 inline-flex items-center text-sm font-semibold text-[var(--primary)] group-hover:underline">
              {supporting.supportingCta}
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

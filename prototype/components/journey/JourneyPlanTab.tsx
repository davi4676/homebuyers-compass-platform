'use client'

import { useState, type ReactNode } from 'react'
import { CaretDown } from '@phosphor-icons/react'
import JourneyTimeline from '@/components/journey/JourneyTimeline'
import JourneyTodayStatusStrip from '@/components/journey/JourneyTodayStatusStrip'
import JourneyTabHeroShell from '@/components/journey/JourneyTabHeroShell'
import HousingBudgetSketchTile from '../HousingBudgetSketchTile'
import TierBadge from '@/components/TierBadge'
import type { UserSnapshot } from '@/lib/user-snapshot'
import type { UserTier } from '@/lib/tiers'
import type { JourneyTab } from '@/lib/journey-nav-tabs'
import { NQ_GUIDED_PHASE_ORDERS } from '@/lib/nq-guided-steps'
import { formatCurrency } from '@/lib/calculations'
import type { PersistedMoneyTrackers } from '@/lib/money-tracker-storage'

type Props = {
  effectiveTier: UserTier
  displayPhaseOrder: number
  phaseTotalForDisplay: number
  phaseHeadingTitle: string
  milestoneIndexInPhase: number
  milestonesInPhase: number
  progressPct: number
  accentColor: string
  snapshot: UserSnapshot | null
  readinessWarmth: string
  readinessScore?: number
  moneyTotals: PersistedMoneyTrackers
  budgetHeadline: string
  budgetSubtext: string
  budgetSketchLineCap: number
  budgetMonthlyPair: { sketch: number; base: number }
  canAccessPhase: (phaseOrder: number) => boolean
  onSelectPhase: (order: number) => void
  onLockedPhaseClick: (phaseOrder: number) => void
  isPhaseComplete: (phaseOrder: number) => boolean
  getPhaseBlockedHint?: (phaseOrder: number) => string | undefined
  goTab: (t: JourneyTab) => void
  onGoToResults: () => void
  onSketchDirtyChange: (dirty: boolean) => void
  onSketchMonthlyCompare: (sketch: number, base: number) => void
  onBudgetSketchFirstCustomized: (monthlyTotal: number) => void
}

export default function JourneyPlanTab({
  effectiveTier,
  displayPhaseOrder,
  phaseTotalForDisplay,
  phaseHeadingTitle,
  milestoneIndexInPhase,
  milestonesInPhase,
  progressPct,
  accentColor,
  snapshot,
  readinessWarmth,
  readinessScore,
  moneyTotals,
  budgetHeadline,
  budgetSubtext,
  budgetSketchLineCap,
  budgetMonthlyPair,
  canAccessPhase,
  onSelectPhase,
  onLockedPhaseClick,
  isPhaseComplete,
  getPhaseBlockedHint,
  goTab,
  onGoToResults,
  onSketchDirtyChange,
  onSketchMonthlyCompare,
  onBudgetSketchFirstCustomized,
}: Props) {
  const [budgetOpen, setBudgetOpen] = useState(true)
  const monthlySavings =
    budgetMonthlyPair.base > 0 && budgetMonthlyPair.sketch < budgetMonthlyPair.base
      ? budgetMonthlyPair.base - budgetMonthlyPair.sketch
      : 0

  return (
    <div
      role="tabpanel"
      id="journey-panel-plan"
      aria-labelledby="journey-tab-plan"
      className="nq-journey-tab-panel"
    >
      <JourneyTabHeroShell
        eyebrow="My Plan"
        title="Your 8-phase roadmap"
        description="Select a phase to open scripts and tasks in Learn. Sketch your budget below when you are ready."
        headingId="journey-plan-heading"
      >
        <div className="flex flex-wrap items-center gap-2">
          <TierBadge tier={effectiveTier} className="!max-w-none scale-90 sm:scale-100" />
        </div>
      </JourneyTabHeroShell>

      <JourneyTodayStatusStrip
        displayPhaseOrder={displayPhaseOrder}
        phaseTotalForDisplay={phaseTotalForDisplay}
        phaseHeadingTitle={phaseHeadingTitle}
        milestoneIndexInPhase={milestoneIndexInPhase}
        milestonesInPhase={milestonesInPhase}
        progressPct={progressPct}
        accentColor={accentColor}
      />

      <div className="nq-plan-stat-row !m-0">
        <StatChip label="Readiness" value={readinessScore != null ? `${readinessScore}/100` : '—'} hint={readinessWarmth}>
          {snapshot ? null : (
            <button type="button" onClick={onGoToResults} className="nq-plan-stat-link">
              Run snapshot
            </button>
          )}
        </StatChip>
        <StatChip
          label="Savings found"
          value={formatCurrency(moneyTotals.savingsFoundSoFar)}
          tone="emerald"
        />
        <StatChip
          label="Programs"
          value={formatCurrency(moneyTotals.fundsFoundSoFar)}
          tone="teal"
          action={
            <button type="button" onClick={() => goTab('money')} className="nq-plan-stat-link">
              Money →
            </button>
          }
        />
      </div>

      <section className="nq-plan-roadmap-zone !m-0" aria-label="Eight phase roadmap">
        <JourneyTimeline
          phaseOrders={NQ_GUIDED_PHASE_ORDERS}
          effectiveTier={effectiveTier}
          currentPhaseOrder={displayPhaseOrder}
          currentSavings={snapshot?.quiz.downPayment ?? 0}
          canAccessPhase={canAccessPhase}
          onSelectPhase={onSelectPhase}
          onLockedPhaseClick={onLockedPhaseClick}
          isPhaseComplete={isPhaseComplete}
          getPhaseBlockedHint={getPhaseBlockedHint}
        />
      </section>

      <section className="nq-ed-soft-card border border-[var(--nq-ed-line)] p-5 sm:p-6">
        <div className="nq-plan-budget-block !m-0 !border-0 !p-0">
          <div className="nq-plan-budget-toggle-row">
            <button
              type="button"
              className="nq-plan-budget-toggle"
              aria-expanded={budgetOpen}
              onClick={() => setBudgetOpen((o) => !o)}
            >
              <span>
                <span className="nq-ed-eyebrow">Budget sketch</span>
                <span className="mt-0.5 block font-display text-base font-semibold text-[var(--nq-ed-text)] sm:text-lg">
                  {budgetHeadline}
                </span>
              </span>
              <CaretDown
                weight="bold"
                size={18}
                className={`shrink-0 text-[var(--nq-ed-muted)] transition ${budgetOpen ? 'rotate-180' : ''}`}
                aria-hidden
              />
            </button>
            <button
              type="button"
              onClick={() => document.getElementById('nq-budget-sketch-reset')?.click()}
              className="nq-ed-btn-outline shrink-0 !px-3 !py-1.5 text-xs"
            >
              Reset
            </button>
          </div>

          {budgetOpen ? (
            <div className="nq-plan-budget-body">
              <p className="text-sm leading-relaxed text-[var(--nq-ed-muted)]">{budgetSubtext}</p>
              {monthlySavings > 0 ? (
                <p className="nq-plan-savings-pill">
                  Illustrative savings:{' '}
                  <strong className="tabular-nums text-emerald-900">{formatCurrency(monthlySavings)}/mo</strong>
                  {' · '}
                  <strong className="tabular-nums text-emerald-900">
                    {formatCurrency(Math.round(monthlySavings * 12))}/yr
                  </strong>{' '}
                  vs baseline
                </p>
              ) : null}
              <HousingBudgetSketchTile
                snapshot={snapshot}
                maxEditableLineItems={budgetSketchLineCap}
                budgetUpgradeHref="/upgrade?source=budget-sketch-lines&tier=momentum"
                onSketchDirtyChange={onSketchDirtyChange}
                onSketchMonthlyCompare={onSketchMonthlyCompare}
                onBudgetSketchFirstCustomized={onBudgetSketchFirstCustomized}
              />
              <p className="text-xs leading-relaxed text-[var(--nq-ed-muted)]">
                Lenders weigh DTI, reserves, and payment comfort — not just minimums. This sketch is your sandbox
                before talking to a loan officer.
              </p>
            </div>
          ) : null}
        </div>
      </section>

      <p className="nq-plan-footer-links !mx-0 !mb-0 text-center">
        <button type="button" onClick={() => goTab('money')} className="nq-plan-footer-link">
          Programs &amp; savings
        </button>
        <span aria-hidden>·</span>
        <button type="button" onClick={() => goTab('learn')} className="nq-plan-footer-link">
          Scripts &amp; guides
        </button>
        <span aria-hidden>·</span>
        <button type="button" onClick={onGoToResults} className="nq-plan-footer-link">
          Update snapshot
        </button>
      </p>
    </div>
  )
}

function StatChip({
  label,
  value,
  hint,
  tone = 'neutral',
  action,
  children,
}: {
  label: string
  value: string
  hint?: string
  tone?: 'neutral' | 'emerald' | 'teal'
  action?: ReactNode
  children?: ReactNode
}) {
  return (
    <div className={`nq-plan-stat-chip nq-plan-stat-chip--${tone}`}>
      <p className="nq-plan-stat-label">{label}</p>
      <p className="nq-plan-stat-value">{value}</p>
      {hint ? <p className="nq-plan-stat-hint">{hint}</p> : null}
      {action ?? children}
    </div>
  )
}

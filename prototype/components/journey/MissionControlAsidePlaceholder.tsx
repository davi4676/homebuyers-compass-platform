'use client'

import Link from 'next/link'
import { Check, Fire, MapTrifold, NotePencil, TrendUp, Wallet } from '@phosphor-icons/react'
import { journeyTabHrefPreservingSearch, JOURNEY_PAGE_PATH, type JourneyTab } from '@/lib/journey-nav-tabs'
import { getMomentumLabel } from '@/lib/momentum-score'
import { formatUsd } from '@/lib/journey-progress-identity'

export type MissionControlAsidePlaceholderProps = {
  searchKey: string
  /** 0–100 phase progress (same source as hero ring / JourneyNav). */
  phaseProgressPct: number
  /** Accent for progress bars (momentum line color, matches hero). */
  accentColor: string
  /** 0–100; same `calculateMomentumScore` as the journey hero ring. */
  momentumScore: number
  /** From `UserSnapshot.readiness` — null when no quiz snapshot. */
  readinessScore: number | null
  readinessHint: string | null
  /** `tokens.downPayment` / `tokens.realisticMax` from `buildUserSnapshot` (parent). */
  downPaymentFormatted: string | null
  comfortableMaxFormatted: string | null
  hasSnapshot: boolean
  /** From `useMomentumFactors()` — not recomputed from budget tile storage. */
  budgetSketchComplete: boolean
  dpaEligibilityChecked: boolean
  /** From `resolveSavingsProgress(user, snapshot)` on the page. */
  savings: { current: number; goal: number; showBar: boolean }
  streakDays: number
}

function tabHref(searchKey: string, tab: JourneyTab) {
  return journeyTabHrefPreservingSearch(JOURNEY_PAGE_PATH, searchKey, tab)
}

/**
 * Sticky right column: plan progress + money/readiness summary fed by the page
 * (tokens + `resolveSavingsProgress` + momentum factors). No duplicate HousingBudgetSketchTile math.
 */
export default function MissionControlAsidePlaceholder({
  searchKey,
  phaseProgressPct,
  accentColor,
  momentumScore,
  readinessScore,
  readinessHint,
  downPaymentFormatted,
  comfortableMaxFormatted,
  hasSnapshot,
  budgetSketchComplete,
  dpaEligibilityChecked,
  savings,
  streakDays,
}: MissionControlAsidePlaceholderProps) {
  const phasePct = Math.max(0, Math.min(100, Math.round(phaseProgressPct)))
  const momPct = Math.max(0, Math.min(100, Math.round(momentumScore)))
  const readinessPct =
    readinessScore == null ? 0 : Math.max(0, Math.min(100, Math.round(readinessScore)))
  const savingsPct =
    savings.goal > 0
      ? Math.max(0, Math.min(100, Math.round((savings.current / savings.goal) * 100)))
      : 0

  const nudge = (() => {
    if (!budgetSketchComplete) {
      return {
        title: 'Next: budget sketch',
        body: 'Open Money and line up your monthly housing number — it uses your existing quiz, not a second budget engine.',
        tab: 'money' as const,
      }
    }
    if (!dpaEligibilityChecked) {
      return {
        title: 'DPA & programs',
        body: 'When you are ready, run a down payment assistance check from the Money tab — same data you already saved.',
        tab: 'money' as const,
      }
    }
    return {
      title: 'Go deeper in Money',
      body: 'Ledgers, DPA scan, and program links live in one place — your profile, one tap away.',
      tab: 'money' as const,
    }
  })()

  return (
    <div className="mission-control-aside ns-mc-aside space-y-5 text-[var(--app-text)]">
      <div
        className="rounded-[28px] border border-[color-mix(in_srgb,var(--app-text)_8%,transparent)] p-5 shadow-[var(--app-shadow1,0_1px_2px_rgba(31,25,16,0.06))]"
        style={{
          background:
            'linear-gradient(165deg, color-mix(in srgb, var(--app-surface2, #fbfbf9) 96%, white) 0%, var(--app-surface, #f9f8f5) 50%, color-mix(in srgb, var(--app-surface3, #f3f0ec) 70%, white) 100%)',
        }}
      >
        <p
          className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--app-muted)]"
        >
          On your radar
        </p>
        <h2
          className="mt-2 text-xl font-semibold leading-snug tracking-tight text-[var(--app-text)]"
        >
          How you’re doing
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--app-muted)]">
          A live read on progress and the numbers we already have — nothing here is a second set of books.
        </p>

        <div className="mt-5 space-y-3.5">
          <div>
            <div className="flex items-center justify-between gap-2 text-xs font-medium text-[color-mix(in_srgb,var(--app-text)_58%,var(--app-muted))]">
              <span>Plan progress</span>
              <span className="tabular-nums text-[var(--app-text)]">{phasePct}%</span>
            </div>
            <div
              className="mt-2 h-2 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--primary,#2d6a4f)_12%,transparent)]"
              role="progressbar"
              aria-valuenow={phasePct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Plan progress ${phasePct} percent`}
            >
              <div
                className="h-full rounded-full transition-[width] duration-500 ease-out"
                style={{
                  width: `${phasePct}%`,
                  background: `linear-gradient(90deg, ${accentColor} 0%, #52b788 100%)`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-2 text-xs font-medium text-[color-mix(in_srgb,var(--app-text)_58%,var(--app-muted))]">
              <span>Activity momentum</span>
              <span className="text-right text-[10px] font-semibold text-[var(--app-text)]">
                {getMomentumLabel(momentumScore)} · {momPct}
              </span>
            </div>
            <div
              className="mt-2 h-1.5 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--primary,#2d6a4f)_10%,transparent)]"
              role="progressbar"
              aria-valuenow={momPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Activity momentum ${momPct} of 100`}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${momPct}%`,
                  background: `linear-gradient(90deg, ${accentColor} 0%, #52b788 100%)`,
                }}
              />
            </div>
          </div>
        </div>

        {hasSnapshot ? (
          <div className="mt-5 space-y-3.5 border-t border-[color-mix(in_srgb,var(--primary,#2d6a4f)_12%,transparent)] pt-5">
            {readinessScore != null ? (
              <div>
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[color-mix(in_srgb,var(--app-primary,#01696f)_75%,var(--app-muted))]">
                    Readiness
                  </p>
                  <span className="text-xs font-semibold tabular-nums text-[var(--app-text)]">
                    {readinessPct}/100
                  </span>
                </div>
                <div
                  className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--primary,#2d6a4f)_12%,transparent)]"
                  role="progressbar"
                  aria-valuenow={readinessPct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-full rounded-full bg-[var(--primary,#2d6a4f)]"
                    style={{ width: `${readinessPct}%` }}
                  />
                </div>
                {readinessHint ? (
                  <p className="mt-1.5 line-clamp-2 text-[11px] leading-snug text-[var(--app-muted)]">
                    {readinessHint}
                  </p>
                ) : null}
              </div>
            ) : null}

            {savings.showBar ? (
              <div>
                <div className="flex items-baseline justify-between gap-2 text-[11px] text-[color-mix(in_srgb,var(--app-text)_58%,var(--app-muted))]">
                  <span className="font-semibold text-[var(--app-text)]">Savings toward goal</span>
                  <span className="tabular-nums">
                    ${formatUsd(savings.current)} / ${formatUsd(savings.goal)}
                  </span>
                </div>
                <div
                  className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--primary,#2d6a4f)_12%,transparent)]"
                  role="progressbar"
                  aria-valuenow={savingsPct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Savings ${savingsPct} percent of goal`}
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[var(--primary,#2d6a4f)] to-[var(--success,#52b788)]"
                    style={{ width: `${savingsPct}%` }}
                  />
                </div>
              </div>
            ) : null}

            <ul className="space-y-1.5 text-[12px] leading-snug text-[color-mix(in_srgb,var(--app-text)_58%,var(--app-muted))]">
              {comfortableMaxFormatted ? (
                <li className="flex justify-between gap-2">
                  <span className="text-[var(--app-muted)]">Comfortable max (snapshot)</span>
                  <span className="shrink-0 font-semibold tabular-nums text-[var(--app-text)]">
                    {comfortableMaxFormatted}
                  </span>
                </li>
              ) : null}
              {downPaymentFormatted ? (
                <li className="flex justify-between gap-2">
                  <span className="text-[var(--app-muted)]">Saved toward down</span>
                  <span className="shrink-0 font-semibold tabular-nums text-[var(--app-text)]">
                    {downPaymentFormatted}
                  </span>
                </li>
              ) : null}
            </ul>
          </div>
        ) : (
          <p className="mt-4 border-t border-[color-mix(in_srgb,var(--primary,#2d6a4f)_12%,transparent)] pt-3 text-xs leading-snug text-[var(--app-muted)]">
            Complete the quiz or open Results to attach numbers — we&apos;ll show readiness and savings here without a
            second worksheet.
          </p>
        )}

        <div
          className="mt-5 flex items-center justify-between gap-2 rounded-xl border border-[color-mix(in_srgb,var(--primary,#2d6a4f)_12%,transparent)] bg-[color-mix(in_srgb,var(--app-surface2)_88%,transparent)] px-3 py-2.5 text-left"
        >
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--primary,#2d6a4f)_10%,transparent)]">
              {budgetSketchComplete ? (
                <Check className="h-4 w-4 text-[var(--primary,#2d6a4f)]" weight="bold" aria-hidden />
              ) : (
                <NotePencil className="h-4 w-4 text-amber-600" weight="duotone" aria-hidden />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[color-mix(in_srgb,var(--app-primary,#01696f)_65%,var(--app-muted))]">
                Budget sketch
              </p>
              <p className="text-xs font-semibold text-[var(--app-text)]">
                {budgetSketchComplete ? 'Saved in Money' : 'Not marked complete yet'}
              </p>
            </div>
          </div>
        </div>

        {streakDays >= 1 ? (
          <div
            className="mt-4 rounded-xl border border-[rgba(245,158,11,0.25)] bg-gradient-to-r from-amber-50/90 to-white/80 px-3 py-2.5"
            role="status"
            aria-label={`${streakDays} consecutive day${streakDays === 1 ? '' : 's'} on NestQuest`}
          >
            <p className="flex items-center gap-1.5 text-[11px] font-semibold text-[#78350f]">
              <Fire className="h-3.5 w-3.5 shrink-0 text-orange-500" weight="duotone" aria-hidden />
              <span>
                {streakDays} day{streakDays === 1 ? '' : 's'} in a row
              </span>
            </p>
            <p className="mt-1 text-[10px] leading-snug text-[var(--app-muted)]">
              {streakDays >= 7
                ? 'Strong weekly rhythm — small visits add up to calmer closings.'
                : 'Come back on a new calendar day to extend your streak — we count at most one visit per day.'}
            </p>
          </div>
        ) : null}

        <div className="mt-6 space-y-2.5">
          <Link
            href={tabHref(searchKey, 'money')}
            className="group flex w-full items-center justify-between gap-2 rounded-xl border border-[color-mix(in_srgb,var(--primary,#2d6a4f)_14%,transparent)] bg-[color-mix(in_srgb,var(--app-surface2)_92%,transparent)] px-3 py-3 text-sm font-semibold text-[var(--app-text)] shadow-sm transition hover:border-[color-mix(in_srgb,var(--primary,#2d6a4f)_28%,transparent)] hover:bg-[var(--app-surface2)]"
            scroll={false}
          >
            <span className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-[var(--primary,#2d6a4f)]" weight="duotone" aria-hidden />
              Money
            </span>
            <span className="text-xs font-medium text-[var(--primary,#2d6a4f)] opacity-80 group-hover:opacity-100">
              Open
            </span>
          </Link>
          <Link
            href={tabHref(searchKey, 'plan')}
            className="group flex w-full items-center justify-between gap-2 rounded-xl border border-[color-mix(in_srgb,var(--primary,#2d6a4f)_14%,transparent)] bg-[color-mix(in_srgb,var(--app-surface2)_92%,transparent)] px-3 py-3 text-sm font-semibold text-[var(--app-text)] shadow-sm transition hover:border-[color-mix(in_srgb,var(--primary,#2d6a4f)_28%,transparent)] hover:bg-[var(--app-surface2)]"
            scroll={false}
          >
            <span className="flex items-center gap-2">
              <MapTrifold className="h-4 w-4 text-[var(--primary,#2d6a4f)]" weight="duotone" aria-hidden />
              Roadmap
            </span>
            <span className="text-xs font-medium text-[var(--primary,#2d6a4f)] opacity-80 group-hover:opacity-100">
              Open
            </span>
          </Link>
        </div>
      </div>

      <div
        className="rounded-2xl border border-dashed border-[color-mix(in_srgb,var(--primary,#2d6a4f)_20%,transparent)] bg-[color-mix(in_srgb,var(--primary,#2d6a4f)_3%,transparent)] px-4 py-3.5"
        role="status"
      >
        <p className="text-[10px] font-bold uppercase tracking-wide text-[color-mix(in_srgb,var(--app-primary,#01696f)_65%,var(--app-muted))]">
          {nudge.title}
        </p>
        <p className="mt-1.5 flex gap-2 text-[11px] font-medium leading-relaxed text-[color-mix(in_srgb,var(--app-text)_55%,var(--app-muted))]">
          <TrendUp className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary,#2d6a4f)]" weight="duotone" aria-hidden />
          <span>
            {nudge.body}{' '}
          <Link
            href={tabHref(searchKey, nudge.tab)}
            className="font-semibold text-[var(--text,#1a2e25)] underline decoration-[color-mix(in_srgb,var(--primary,#2d6a4f)_35%,transparent)] underline-offset-2 hover:decoration-[var(--primary,#2d6a4f)]"
            scroll={false}
          >
            Open tab →
          </Link>
          </span>
        </p>
      </div>
    </div>
  )
}

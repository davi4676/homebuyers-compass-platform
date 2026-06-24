'use client'

import type { ReactNode } from 'react'
import {
  Calculator,
  FileText,
  Handshake,
  House,
  Key,
  MagnifyingGlass,
  SealCheck,
  Wrench,
} from '@phosphor-icons/react'
import clsx from 'clsx'
import { getJourneyPhaseByOrder } from '@/lib/journey-phases-data'
import { MISSION_CONTROL_PHASE_MEDIA } from '@/lib/mission-control-phase-media'
import type { JourneyTab } from '@/lib/journey-nav-tabs'

const ILLUSTRATION: Record<
  number,
  (p: { className?: string; 'aria-hidden'?: boolean }) => ReactNode
> = {
  1: (p) => <Calculator weight="duotone" size={40} {...p} />,
  2: (p) => <SealCheck weight="duotone" size={40} {...p} />,
  3: (p) => <MagnifyingGlass weight="duotone" size={40} {...p} />,
  4: (p) => <Handshake weight="duotone" size={40} {...p} />,
  5: (p) => <FileText weight="duotone" size={40} {...p} />,
  6: (p) => <Key weight="duotone" size={40} {...p} />,
  7: (p) => <Wrench weight="duotone" size={40} {...p} />,
  8: (p) => <House weight="duotone" size={40} {...p} />,
}

/** Phase strip: roadmap-adjacent tabs where “your chapter” adds orientation. */
const SHOW_TABS = new Set<JourneyTab>(['today', 'plan', 'money', 'learn'])

function clampOrder(o: number): number {
  if (!Number.isFinite(o) || o < 1) return 1
  if (o > 8) return 8
  return Math.floor(o)
}

export type MissionControlPhaseContextProps = {
  activeJourneyTab: JourneyTab
  /** From `getJourneyPhaseRingProgress().currentPhaseOrder` (same as roadmap). */
  currentPhaseOrder: number
  className?: string
}

/**
 * Mission Control — Batch 6: phase illustration, explainer, optional muted image.
 * Read-only; does not own step completion, tabs, or analytics.
 */
export default function MissionControlPhaseContext({
  activeJourneyTab,
  currentPhaseOrder,
  className,
}: MissionControlPhaseContextProps) {
  if (!SHOW_TABS.has(activeJourneyTab)) return null

  const order = clampOrder(currentPhaseOrder)
  const phase = getJourneyPhaseByOrder(order)
  if (!phase) return null

  const body = (phase.detailDescription ?? phase.description).trim()
  const media = MISSION_CONTROL_PHASE_MEDIA[order]
  const ill = ILLUSTRATION[order] ?? ILLUSTRATION[1]

  return (
    <section
      className={clsx(
        'mission-control-phase-context nq-card relative overflow-hidden rounded-2xl border border-[color-mix(in_srgb,var(--app-text,#28251d)_8%,transparent)] bg-gradient-to-br from-[var(--app-surface2,#fbfbf9)] via-[var(--app-surface,#f9f8f5)] to-[color-mix(in_srgb,var(--app-primary,#01696f)_6%,var(--app-surface3,#f3f0ec))] p-5 shadow-sm sm:p-6',
        className
      )}
      aria-labelledby="mission-control-phase-heading"
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full blur-2xl"
        style={{ background: 'color-mix(in srgb, var(--primary, #2d6a4f) 12%, transparent)' }}
        aria-hidden
      />
      <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_min(100%,12.5rem)] lg:items-center xl:grid-cols-[minmax(0,1fr)_14.5rem]">
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
          <div
            className="mx-auto flex h-[5.5rem] w-[5.5rem] shrink-0 items-center justify-center rounded-2xl border border-[color-mix(in_srgb,var(--primary,#2d6a4f)_22%,transparent)] sm:mx-0"
            style={{
              background:
                'linear-gradient(150deg, color-mix(in srgb, var(--app-surface2, #fbfbf9) 96%, white) 0%, color-mix(in srgb, var(--primary, #2d6a4f) 14%, var(--app-surface, #f9f8f5)) 55%, color-mix(in srgb, var(--primary, #2d6a4f) 8%, transparent) 100%)',
              color: 'var(--text, #1a2e25)',
              boxShadow: '0 8px 28px -12px color-mix(in srgb, var(--primary, #2d6a4f) 35%, transparent)',
            }}
            aria-hidden
          >
            {ill({ 'aria-hidden': true })}
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-[color-mix(in_srgb,var(--app-primary,#01696f)_92%,var(--app-muted,#6e6b63))]"
            >
              Your chapter
            </p>
            <h3
              id="mission-control-phase-heading"
              className="mt-1.5 font-display text-xl font-semibold leading-snug tracking-tight text-[var(--app-text,#28251d)] sm:text-2xl"
            >
              {phase.title}
            </h3>
            <p
              className="mt-2 text-sm leading-relaxed text-[var(--app-muted,#6e6b63)] sm:text-[0.95rem]"
            >
              {body}
            </p>
            <p
              className="mt-2 text-xs font-medium text-[var(--app-muted,#6e6b63)]"
            >
              Typical timing: {phase.estimatedTime}
            </p>
          </div>
        </div>

        {media ? (
          <div className="mission-control-phase-context__media relative aspect-[4/3] w-full min-h-[7.5rem] overflow-hidden rounded-xl border border-[color-mix(in_srgb,var(--app-text,#28251d)_8%,transparent)]">
            <img
              src={media.src}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-50"
              loading="lazy"
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--app-surface,#f9f8f5)] via-[color-mix(in_srgb,var(--app-surface,#f9f8f5)_40%,transparent)] to-transparent"
              aria-hidden
            />
            <p className="sr-only">Decorative: {media.alt}</p>
          </div>
        ) : null}
      </div>
    </section>
  )
}

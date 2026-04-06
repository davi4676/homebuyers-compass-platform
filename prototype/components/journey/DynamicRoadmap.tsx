'use client'

import type { CSSProperties } from 'react'
import { Lock } from 'lucide-react'
import type { UserTier } from '@/lib/tiers'
import { TIER_DEFINITIONS } from '@/lib/tiers'
import { getJourneyPhaseByOrder } from '@/lib/journey-phases-data'
import { useICP } from '@/lib/icp-context'

type DynamicRoadmapProps = {
  phaseOrders: readonly number[]
  currentPhaseOrder: number
  effectiveTier: UserTier
  canAccessPhase: (phaseOrder: number) => boolean
  onSelectPhase: (phaseOrder: number) => void
  /** Locked phase tapped (tier / access) — e.g. show trial CTA. */
  onLockedPhaseClick?: (phaseOrder: number) => void
  isPhaseComplete: (phaseOrder: number) => boolean
  /** Overrides ICP accent from context (rare). */
  accentColor?: string
  accentColorLight?: string
  /** When set, shown instead of the generic tier lock copy for locked phases. */
  getPhaseBlockedHint?: (phaseOrder: number) => string | undefined
}

export default function DynamicRoadmap({
  phaseOrders,
  currentPhaseOrder,
  effectiveTier,
  canAccessPhase,
  onSelectPhase,
  onLockedPhaseClick,
  isPhaseComplete,
  accentColor: accentOverride,
  accentColorLight: lightOverride,
  getPhaseBlockedHint,
}: DynamicRoadmapProps) {
  const { content } = useICP()
  const accentColor = accentOverride ?? content.accentColor
  const accentColorLight = lightOverride ?? content.accentColorLight

  const phaseCountLabel = `${phaseOrders.length}-phase roadmap`
  return (
    <div className="space-y-3 rounded-2xl border border-slate-200/90 bg-white/90 p-4 shadow-sm sm:p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-600">{phaseCountLabel}</p>
      <p className="text-sm text-slate-600">
        Tap a phase to jump ahead when it&apos;s unlocked for your tier.
      </p>
      <ul className="space-y-2" role="list">
        {phaseOrders.map((phaseOrder) => {
          const meta = getJourneyPhaseByOrder(phaseOrder)
          const title = meta?.title ?? `Phase ${phaseOrder}`
          const accessible = canAccessPhase(phaseOrder)
          const complete = isPhaseComplete(phaseOrder)
          const current = currentPhaseOrder === phaseOrder
          const lockedBeyondFoundations =
            !accessible && phaseOrder > 2 && effectiveTier === 'foundations'
          const blockedHint = getPhaseBlockedHint?.(phaseOrder)

          const badgeStyle: CSSProperties | undefined =
            complete || current ? { backgroundColor: accentColorLight, color: accentColor } : undefined

          const currentRingStyle: CSSProperties | undefined =
            current && accessible ? { boxShadow: `0 0 0 2px ${accentColor}` } : undefined

          const buttonStyle: CSSProperties = {
            ['--roadmap-accent' as string]: accentColor,
            ...currentRingStyle,
          }

          return (
            <li key={phaseOrder}>
              <button
                type="button"
                onClick={() =>
                  accessible ? onSelectPhase(phaseOrder) : onLockedPhaseClick?.(phaseOrder)
                }
                className={`flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--roadmap-accent)] focus-visible:ring-offset-1 ${
                  accessible
                    ? 'border-slate-200/90 bg-white hover:border-slate-300'
                    : 'cursor-pointer border-slate-100 bg-slate-50/80 opacity-90'
                }`}
                style={buttonStyle}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                    complete || current ? '' : 'bg-slate-100 text-slate-600'
                  }`}
                  style={badgeStyle}
                >
                  {phaseOrder}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-900">{title}</span>
                    {!accessible ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-200/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-700">
                        <Lock className="h-3 w-3" aria-hidden />
                        Locked
                      </span>
                    ) : null}
                  </span>
                  {!accessible ? (
                    <span className="mt-1 block text-xs leading-snug text-slate-600">
                      {blockedHint ? (
                        <>{blockedHint}</>
                      ) : lockedBeyondFoundations ? (
                        <>
                          Momentum is for buyers who want clarity beyond Phase 2.{' '}
                          <span className="italic">&ldquo;{TIER_DEFINITIONS.momentum.mindset}&rdquo;</span>
                        </>
                      ) : (
                        <>Upgrade your plan to unlock this phase.</>
                      )}
                    </span>
                  ) : meta?.description ? (
                    <span className="mt-0.5 block text-xs text-slate-500">{meta.description}</span>
                  ) : null}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

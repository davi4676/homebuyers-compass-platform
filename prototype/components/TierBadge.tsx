'use client'

import { Sparkles } from 'lucide-react'
import type { UserTier } from '@/lib/tiers'
import { TIER_DEFINITIONS, showConciergePlusChrome } from '@/lib/tiers'

type TierBadgeProps = {
  tier: UserTier
  /** Override mindset line (defaults to tier definition) */
  mindset?: string
  className?: string
  /** Shorter header variant */
  compact?: boolean
}

export default function TierBadge({ tier, mindset, className = '', compact = false }: TierBadgeProps) {
  const def = TIER_DEFINITIONS[tier]
  const mindsetLine = mindset ?? def.mindset
  const premium = showConciergePlusChrome(tier)

  return (
    <div
      className={`rounded-xl border border-slate-200/90 bg-white/95 px-3 py-2 shadow-sm ring-1 ring-slate-100/80 ${className}`}
    >
      <div className="flex items-start gap-2">
        <span
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
            premium ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-700'
          }`}
        >
          <Sparkles className="h-4 w-4" strokeWidth={2} aria-hidden />
        </span>
        <div className="min-w-0 text-left">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Your tier</p>
          <p className="truncate text-sm font-bold text-slate-900">{def.name}</p>
          {!compact ? (
            <p className="mt-0.5 text-xs leading-snug text-slate-600">&ldquo;{mindsetLine}&rdquo;</p>
          ) : null}
          {!compact ? (
            <p className="mt-0.5 text-[11px] leading-snug text-slate-500">
              Financial unlock: {def.differentiators.savings} and {def.differentiators.funds.toLowerCase()}.
            </p>
          ) : null}
          {premium ? (
            <span className="mt-1 inline-block rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              Concierge+
            </span>
          ) : null}
        </div>
      </div>
    </div>
  )
}

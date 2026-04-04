'use client'

import Link from 'next/link'
import { Lock } from 'lucide-react'
import type { UserTier } from '@/lib/tiers'
import { TIER_DEFINITIONS } from '@/lib/tiers'
import MindsetTag from '@/components/journey/MindsetTag'

type LockedFeatureCardProps = {
  title: string
  description: string
  /** Tier required to unlock; CTA uses next tier name from product ladder when omitted */
  nextTier?: UserTier
  upgradeHref?: string
  className?: string
  /** Show mindset line for the upgrade tier */
  showMindset?: boolean
  /** Custom mindset line (overrides structured MindsetTag block when set) */
  mindsetLine?: string
}

export default function LockedFeatureCard({
  title,
  description,
  nextTier,
  upgradeHref,
  className = '',
  showMindset = true,
  mindsetLine,
}: LockedFeatureCardProps) {
  const tier = nextTier ?? 'momentum'
  const def = TIER_DEFINITIONS[tier]
  const href =
    upgradeHref ?? `/upgrade?source=journey-lock&tier=${tier}`

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-br from-slate-100/90 to-slate-50/80 p-4 text-left shadow-inner ring-1 ring-slate-200/50 sm:p-5 ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-slate-200/10" aria-hidden />
      <div className="relative flex gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-200/80 text-slate-600">
          <Lock className="h-5 w-5" strokeWidth={2} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-800">{title}</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">{description}</p>
          {showMindset ? (
            mindsetLine ? (
              <p className="mt-2 text-xs italic text-slate-600">{mindsetLine}</p>
            ) : (
              <div className="mt-2 space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  For buyers who choose {def.name}
                </p>
                <MindsetTag compact mindset={def.mindset} className="max-w-full border-teal-100 bg-teal-50/50" />
              </div>
            )
          ) : null}
          <Link
            href={href}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[rgb(var(--navy))] px-3.5 py-2 text-sm font-bold text-white shadow-sm transition hover:opacity-95"
          >
            Unlock with {def.name}
          </Link>
        </div>
      </div>
    </div>
  )
}

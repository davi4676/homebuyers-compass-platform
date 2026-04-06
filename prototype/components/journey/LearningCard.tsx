'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { UserTier } from '@/lib/tiers'
import { TIER_DEFINITIONS } from '@/lib/tiers'
import { tierAtLeast } from '@/lib/tiers'
import UpgradeLockCallout from '@/components/monetization/UpgradeLockCallout'

type LearningCardProps = {
  userTier: UserTier
  href: string
  title: string
  sub: string
  tag: string
  minTier: UserTier
  /** Navigator+ premium styling */
  isPremiumDeepDive?: boolean
  className?: string
}

export default function LearningCard({
  userTier,
  href,
  title,
  sub,
  tag,
  minTier,
  isPremiumDeepDive = false,
  className = '',
}: LearningCardProps) {
  const unlocked = tierAtLeast(userTier, minTier)
  const def = TIER_DEFINITIONS[minTier]

  if (!unlocked) {
    return (
      <UpgradeLockCallout
        className={className}
        lockedLabel={`${title} · ${tag}`}
        reason={`${sub} Included in ${def.name}. “${def.mindset}”`}
        ctaLabel={`Upgrade to ${def.name}`}
        ctaHref={`/upgrade?source=learn-card&tier=${minTier}`}
      />
    )
  }

  return (
    <Link
      href={href}
      className={`group rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm ring-1 ring-slate-100/80 transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md ${
        isPremiumDeepDive ? 'border-amber-200/70 bg-gradient-to-br from-amber-50/40 to-white' : ''
      } ${className}`}
    >
      <span
        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
          isPremiumDeepDive ? 'bg-amber-100 text-amber-950' : 'bg-violet-100 text-violet-900'
        }`}
      >
        {tag}
      </span>
      <p className="mt-2 font-bold text-slate-900">{title}</p>
      <p className="mt-1 text-sm text-slate-600">{sub}</p>
      <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-teal-700">
        Open
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </span>
    </Link>
  )
}

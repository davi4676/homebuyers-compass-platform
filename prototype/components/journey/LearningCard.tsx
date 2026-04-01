'use client'

import Link from 'next/link'
import { ArrowRight, Lock } from 'lucide-react'
import type { UserTier } from '@/lib/tiers'
import { TIER_DEFINITIONS } from '@/lib/tiers'
import { tierAtLeast } from '@/lib/tiers'
import MindsetTag from '@/components/journey/MindsetTag'

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
      <div
        className={`relative overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-50/90 p-4 shadow-sm ring-1 ring-slate-100/80 ${className}`}
      >
        <div className="absolute inset-0 z-[1] flex flex-col items-center justify-center gap-2 rounded-2xl bg-slate-50/88 p-4 text-center backdrop-blur-[1px]">
          <Lock className="h-5 w-5 text-slate-500" aria-hidden />
          <p className="text-sm font-semibold text-slate-800">Included in {def.name}</p>
          <MindsetTag compact mindset={def.mindset} className="max-w-[95%]" />
          <Link
            href={`/upgrade?source=learn-card&tier=${minTier}`}
            className="mt-1 text-sm font-bold text-sky-700 underline underline-offset-2 hover:text-sky-900"
          >
            Upgrade to {def.name}
          </Link>
        </div>
        <span className="inline-block rounded-full bg-violet-100/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-900 opacity-60">
          {tag}
        </span>
        <p className="mt-2 font-bold text-slate-400">{title}</p>
        <p className="mt-1 text-sm text-slate-400">{sub}</p>
      </div>
    )
  }

  return (
    <Link
      href={href}
      className={`group rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm ring-1 ring-slate-100/80 transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md ${
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
      <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-sky-700">
        Open
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </span>
    </Link>
  )
}

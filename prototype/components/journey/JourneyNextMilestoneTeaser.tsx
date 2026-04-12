'use client'

import Link from 'next/link'
import { Lock } from '@phosphor-icons/react'
import { journeyTabHrefPreservingSearch, JOURNEY_PAGE_PATH } from '@/lib/journey-nav-tabs'

type Props = {
  searchKey: string
  currentAction: string
  nextFeatureTitle: string
  progressPct: number
}

export default function JourneyNextMilestoneTeaser({
  searchKey,
  currentAction,
  nextFeatureTitle,
  progressPct,
}: Props) {
  const pct = Math.max(0, Math.min(100, Math.round(progressPct)))
  const learnHref = journeyTabHrefPreservingSearch(JOURNEY_PAGE_PATH, searchKey, 'learn')

  return (
    <section
      className="rounded-[var(--radius)] border-[1.5px] border-dashed bg-white p-5 shadow-sm"
      style={{
        borderColor: 'var(--muted)',
        backgroundImage: 'linear-gradient(180deg, rgba(183,201,192,0.08) 0%, #fff 100%)',
      }}
      aria-labelledby="milestone-teaser-title"
    >
      <p id="milestone-teaser-title" className="text-sm font-semibold text-[color:var(--text)]">
        Complete <span className="font-bold">{currentAction}</span> to unlock:
      </p>
      <div className="mt-3 flex items-center gap-2">
        <Lock weight="duotone" size={20} className="shrink-0 text-slate-500" aria-hidden />
        <span className="text-base font-bold text-slate-900">{nextFeatureTitle}</span>
      </div>
      <div
        className="pointer-events-none relative mt-4 h-[120px] overflow-hidden rounded-xl bg-gradient-to-br from-slate-100 via-teal-50/40 to-slate-200/80"
        style={{ filter: 'blur(6px)' }}
        aria-hidden
      >
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-center text-xs font-medium text-slate-400">
          Preview
        </div>
      </div>
      <p className="mt-3 text-sm text-slate-600">
        <span className="font-semibold tabular-nums text-emerald-800">{pct}%</span> of the way there
      </p>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200/90">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#2D6A4F] to-[#52b788] transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <Link
        href={learnHref}
        className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[#2D6A4F] underline decoration-[#2D6A4F]/40 underline-offset-2 hover:text-[#1b4332]"
      >
        Keep going →
      </Link>
    </section>
  )
}

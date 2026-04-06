'use client'

import Link from 'next/link'
import { MapPinned, Calculator } from 'lucide-react'
import { journeyTabHrefPreservingSearch, JOURNEY_PAGE_PATH } from '@/lib/journey-nav-tabs'
import { recordSessionWin } from '@/lib/session-wins'

type Props = { searchKey: string }

/**
 * Primary “Today” loop: phase work + money work. Other tabs are secondary (see journey page copy).
 */
export default function JourneyTodayHero({ searchKey }: Props) {
  const phaseHref = journeyTabHrefPreservingSearch(JOURNEY_PAGE_PATH, searchKey, 'phase')
  const budgetHref = journeyTabHrefPreservingSearch(JOURNEY_PAGE_PATH, searchKey, 'budget')

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
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Link
          href={phaseHref}
          scroll={false}
          onClick={() => recordSessionWin('Opened Your Phase from Today')}
          className="group flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-teal-400 hover:shadow-md"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
            <MapPinned className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-slate-900">Your Phase</p>
            <p className="mt-0.5 text-sm text-slate-600">
              One concrete step on your roadmap — checklist, timing, and what matters now.
            </p>
            <span className="mt-2 inline-block text-sm font-bold text-teal-700 group-hover:underline">
              Go to phase →
            </span>
          </div>
        </Link>
        <Link
          href={budgetHref}
          scroll={false}
          onClick={() => recordSessionWin('Opened Budget Sketch from Today')}
          className="group flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-teal-400 hover:shadow-md"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
            <Calculator className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-slate-900">Budget Sketch</p>
            <p className="mt-0.5 text-sm text-slate-600">
              Stress-test payment, lines you control, and how it fits your real life.
            </p>
            <span className="mt-2 inline-block text-sm font-bold text-teal-700 group-hover:underline">
              Open budget →
            </span>
          </div>
        </Link>
      </div>
    </section>
  )
}

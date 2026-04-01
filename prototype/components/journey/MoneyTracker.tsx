'use client'

import { formatCurrency } from '@/lib/calculations'
import type { PersistedMoneyTrackers } from '@/lib/money-tracker-storage'

type MoneyTrackerProps = {
  totals: PersistedMoneyTrackers
  /** Smaller chips for header / dense rows */
  compact?: boolean
  className?: string
}

export default function MoneyTracker({ totals, compact = false, className = '' }: MoneyTrackerProps) {
  if (compact) {
    return (
      <div
        className={`flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] font-semibold text-slate-600 sm:justify-end sm:text-[11px] ${className}`}
        aria-label="Money trackers"
      >
        <span className="tabular-nums">
          <span className="text-emerald-700">Savings</span>{' '}
          <span className="text-slate-900">{formatCurrency(totals.savingsFoundSoFar)}</span>
        </span>
        <span className="hidden text-slate-300 sm:inline" aria-hidden>
          ·
        </span>
        <span className="tabular-nums">
          <span className="text-sky-800">Funds</span>{' '}
          <span className="text-slate-900">{formatCurrency(totals.fundsFoundSoFar)}</span>
        </span>
        <span className="hidden text-slate-300 sm:inline" aria-hidden>
          ·
        </span>
        <span className="tabular-nums">
          <span className="text-violet-800">Alt</span>{' '}
          <span className="text-slate-900">{totals.altSolutionsIdentified}</span>
        </span>
      </div>
    )
  }

  return (
    <div
      className={`grid grid-cols-1 gap-3 sm:grid-cols-3 ${className}`}
      aria-label="Savings, funds, and alternative solution trackers"
    >
      <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 px-4 py-3 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-900/90">Savings found so far</p>
        <p className="mt-1 text-xl font-bold tabular-nums text-emerald-950 sm:text-2xl">
          {formatCurrency(totals.savingsFoundSoFar)}
        </p>
      </div>
      <div className="rounded-2xl border border-sky-200/80 bg-sky-50/50 px-4 py-3 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-wide text-sky-900/90">Funds found so far</p>
        <p className="mt-1 text-xl font-bold tabular-nums text-sky-950 sm:text-2xl">
          {formatCurrency(totals.fundsFoundSoFar)}
        </p>
      </div>
      <div className="rounded-2xl border border-violet-200/80 bg-violet-50/50 px-4 py-3 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-wide text-violet-900/90">Alternative solutions</p>
        <p className="mt-1 text-xl font-bold tabular-nums text-violet-950 sm:text-2xl">
          {totals.altSolutionsIdentified} options
        </p>
      </div>
    </div>
  )
}

'use client'

import { formatCurrency } from '@/lib/calculations'

/** Savings intro — dollar total is large and high-contrast */
export function SavingsOpportunitiesHeadline({
  firstName,
  count,
  totalDollars,
}: {
  firstName: string | null
  count: number
  totalDollars: number
}) {
  if (count === 0) {
    return (
      <div className="space-y-2">
        <span className="text-base text-slate-800">Complete the quiz to see personalized opportunities.</span>
        <p className="text-[11px] leading-snug text-slate-500">
          Savings totals on this page are modeled from your inputs—not guarantees from lenders or agencies.
        </p>
      </div>
    )
  }
  const showMoney = totalDollars > 0
  const bigAmount = (
    <span className="inline-block align-baseline rounded-lg bg-emerald-50 px-2.5 py-1 text-2xl font-black tabular-nums tracking-tight text-emerald-700 shadow-sm ring-2 ring-emerald-200/90 sm:text-3xl sm:px-3 sm:py-1">
      {formatCurrency(totalDollars)}
    </span>
  )

  if (count === 1) {
    return (
      <div className="space-y-1.5 leading-snug">
        {showMoney ? (
          <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1.5 text-base text-slate-800 sm:text-[1.0625rem]">
            <span className="font-semibold">
              {firstName ? `${firstName}, we estimate you can gain up to` : 'We estimate you can gain up to'}
            </span>
            {bigAmount}
            <span className="font-semibold">in potential savings.</span>
          </div>
        ) : null}
        <p className="text-base font-semibold text-slate-700">Here&apos;s your top move.</p>
        <p className="text-[11px] leading-snug text-slate-500">
          Estimates use NestQuest rules of thumb from your quiz—confirm dollars and eligibility with lenders and housing
          programs.
        </p>
      </div>
    )
  }

  const top = Math.min(3, count)
  return (
    <div className="space-y-1.5 leading-snug">
      {showMoney ? (
        <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1.5 text-base text-slate-800 sm:text-[1.0625rem]">
          <span className="font-semibold">
            {firstName ? `${firstName}, we estimate you can gain up to` : 'We estimate you can gain up to'}
          </span>
          {bigAmount}
          <span className="font-semibold">in potential savings.</span>
        </div>
      ) : null}
      <p className="text-base font-semibold text-slate-700">
        Here are the top {top} of {count} moves.
      </p>
      <p className="text-[11px] leading-snug text-slate-500">
        Estimates use NestQuest rules of thumb from your quiz—confirm dollars and eligibility with lenders and housing
        programs.
      </p>
    </div>
  )
}

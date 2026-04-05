'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Lock, X } from 'lucide-react'
import { formatCurrency } from '@/lib/calculations'
import type { PersistedMoneyTrackers } from '@/lib/money-tracker-storage'

type InsightItem = {
  title: string
  description: string
  value?: number
}

type MoneyInsightsProps = {
  totals: PersistedMoneyTrackers
  savingsDetails: InsightItem[]
  fundingDetails: InsightItem[]
  alternativeDetails: InsightItem[]
  sticky?: boolean
  /** When false, detail modal shows totals but blurs full breakdown until Momentum+. */
  detailsUnlocked?: boolean
  upgradeHref?: string
}

export default function MoneyInsights({
  totals,
  savingsDetails,
  fundingDetails,
  alternativeDetails,
  sticky = true,
  detailsUnlocked = true,
  upgradeHref = '/upgrade?source=money-insights&tier=momentum',
}: MoneyInsightsProps) {
  const [open, setOpen] = useState(false)
  const totalDetailCount = useMemo(
    () => savingsDetails.length + fundingDetails.length + alternativeDetails.length,
    [savingsDetails, fundingDetails, alternativeDetails]
  )

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`${sticky ? 'sticky top-[4.5rem] z-20' : ''} block w-full text-left`}
      >
        <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-3 shadow-sm backdrop-blur sm:p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Money Insights</p>
          <div className="mt-2 space-y-1.5 text-sm">
            <p className="flex items-center justify-between gap-3 text-slate-700">
              <span>Savings Identified</span>
              <strong className="tabular-nums text-emerald-900">{formatCurrency(totals.savingsFoundSoFar)}</strong>
            </p>
            <p className="flex items-center justify-between gap-3 text-slate-700">
              <span>Funds You May Qualify For</span>
              <strong className="tabular-nums text-teal-900">{formatCurrency(totals.fundsFoundSoFar)}</strong>
            </p>
            <p className="flex items-center justify-between gap-3 text-slate-700">
              <span>Alternative Options Available</span>
              <strong className="tabular-nums text-violet-900">{totals.altSolutionsIdentified}</strong>
            </p>
          </div>
          <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
            View details
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          </span>
        </div>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-40 bg-slate-900/35 p-3 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.section
              className="mx-auto max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Money Insights</p>
                  <p className="text-sm text-slate-600">Here is what this means for you.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50"
                  aria-label="Close money insights"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="relative mt-4">
                <div
                  className={`grid gap-4 md:grid-cols-3 ${!detailsUnlocked ? 'pointer-events-none select-none blur-sm' : ''}`}
                >
                  <InsightCol title="Savings" accent="text-emerald-900" items={savingsDetails} />
                  <InsightCol title="Funds" accent="text-teal-900" items={fundingDetails} />
                  <InsightCol title="Alternative options" accent="text-violet-900" items={alternativeDetails} />
                </div>
                {!detailsUnlocked ? (
                  <div className="pointer-events-auto mt-4 rounded-2xl border border-teal-200/90 bg-gradient-to-br from-teal-50 to-emerald-50/80 p-4 shadow-md ring-1 ring-teal-100/80">
                    <p className="flex items-center gap-2 text-sm font-bold text-teal-950">
                      <Lock className="h-4 w-4 shrink-0 text-teal-700" aria-hidden />
                      Full HOSA-style breakdown is included with Momentum
                    </p>
                    <p className="mt-1.5 text-sm text-slate-700">
                      You can still see headline totals above — upgrade to unpack savings, funds, and alternatives line
                      by line.
                    </p>
                    <Link
                      href={upgradeHref}
                      className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-teal-900 underline decoration-teal-600/60 underline-offset-2 hover:text-teal-950"
                    >
                      Upgrade to Momentum
                      <ChevronRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </div>
                ) : null}
              </div>
              <p className="mt-4 text-xs text-slate-500">
                {totalDetailCount} opportunities surfaced. Estimates are directional and meant to guide your next move.
              </p>
            </motion.section>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}

function InsightCol({ title, accent, items }: { title: string; accent: string; items: InsightItem[] }) {
  return (
    <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3">
      <p className={`text-sm font-bold ${accent}`}>{title}</p>
      <ul className="mt-2 space-y-2 text-xs text-slate-700">
        {items.slice(0, 4).map((item) => (
          <li key={item.title} className="rounded-lg bg-white/90 p-2">
            <p className="font-semibold text-slate-900">{item.title}</p>
            <p className="mt-0.5">{item.description}</p>
            {item.value != null ? <p className="mt-1 font-semibold">{formatCurrency(item.value)}</p> : null}
          </li>
        ))}
      </ul>
    </div>
  )
}


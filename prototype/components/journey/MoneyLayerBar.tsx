'use client'

import { useEffect, useMemo, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { MoneyTrackerTotals } from '@/lib/money-engine'
import { formatCurrency } from '@/lib/calculations'

type MoneyLayerBarProps = {
  totals: MoneyTrackerTotals
  sticky?: boolean
}

export default function MoneyLayerBar({ totals, sticky = true }: MoneyLayerBarProps) {
  const reduceMotion = useReducedMotion()
  const prev = useRef(totals)
  const pulse = useMemo(
    () => ({
      savings: totals.savingsFoundSoFar > prev.current.savingsFoundSoFar,
      funds: totals.fundsFoundSoFar > prev.current.fundsFoundSoFar,
      alt: totals.alternativeCount > prev.current.alternativeCount,
    }),
    [totals]
  )

  useEffect(() => {
    prev.current = totals
  }, [totals])

  return (
    <div className={sticky ? 'sticky top-[4.5rem] z-20' : ''}>
      <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-3 shadow-sm backdrop-blur sm:p-4">
        <div className="grid gap-2 sm:grid-cols-3">
          <motion.div
            animate={pulse.savings && !reduceMotion ? { scale: [1, 1.02, 1] } : undefined}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="rounded-xl border border-emerald-200/80 bg-emerald-50/70 px-3 py-2"
          >
            <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-900">Savings Found So Far</p>
            <p className="mt-1 text-sm font-bold text-emerald-950 tabular-nums">{formatCurrency(totals.savingsFoundSoFar)}</p>
          </motion.div>
          <motion.div
            animate={pulse.funds && !reduceMotion ? { scale: [1, 1.02, 1] } : undefined}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="rounded-xl border border-sky-200/80 bg-sky-50/70 px-3 py-2"
          >
            <p className="text-[11px] font-bold uppercase tracking-wide text-sky-900">Funds Found So Far</p>
            <p className="mt-1 text-sm font-bold text-sky-950 tabular-nums">{formatCurrency(totals.fundsFoundSoFar)}</p>
          </motion.div>
          <motion.div
            animate={pulse.alt && !reduceMotion ? { scale: [1, 1.02, 1] } : undefined}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="rounded-xl border border-violet-200/80 bg-violet-50/70 px-3 py-2"
          >
            <p className="text-[11px] font-bold uppercase tracking-wide text-violet-900">Alternative Solutions Identified</p>
            <p className="mt-1 text-sm font-bold text-violet-950 tabular-nums">{totals.alternativeCount}</p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}


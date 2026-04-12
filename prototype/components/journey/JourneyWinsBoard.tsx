'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { CaretDown, CheckCircle } from '@phosphor-icons/react'
import {
  loadNqCompletedActions,
  formatWinLineDate,
  NQ_COMPLETED_ACTIONS_EVENT,
  type NqCompletedAction,
} from '@/lib/nq-completed-actions'

export default function JourneyWinsBoard() {
  const [open, setOpen] = useState(true)
  const [items, setItems] = useState<NqCompletedAction[]>([])
  const reduceMotion = useReducedMotion() ?? false

  const refresh = useCallback(() => {
    setItems(loadNqCompletedActions())
  }, [])

  useEffect(() => {
    refresh()
    if (typeof window === 'undefined') return
    const on = () => refresh()
    window.addEventListener('storage', on)
    window.addEventListener(NQ_COMPLETED_ACTIONS_EVENT, on)
    return () => {
      window.removeEventListener('storage', on)
      window.removeEventListener(NQ_COMPLETED_ACTIONS_EVENT, on)
    }
  }, [refresh])

  return (
    <section
      className="rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-sm sm:p-5"
      aria-labelledby="wins-board-heading"
    >
      <button
        type="button"
        id="wins-board-heading"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 text-left"
      >
        <span className="font-display text-lg font-bold text-slate-900">Your progress so far</span>
        <CaretDown
          weight="duotone"
          size={20}
          className={`shrink-0 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>
      <p className="mt-1 text-sm italic text-[color:var(--muted)]">
        Every step counts. Here&apos;s proof.
      </p>
      {open ? (
        <ul className="mt-4 list-none space-y-3 p-0" role="list">
          {items.length === 0 ? (
            <li className="rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-4 py-6 text-center text-sm text-slate-600">
              Complete your first action to start your wins board 🏁
            </li>
          ) : (
            items.map((item, i) => (
              <motion.li
                key={item.id}
                initial={reduceMotion ? false : { opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={
                  reduceMotion ? undefined : { duration: 0.35, delay: i * 0.08, ease: 'easeOut' }
                }
                className="flex items-start gap-3 rounded-lg border border-slate-100 bg-white px-3 py-2.5 shadow-sm"
              >
                <CheckCircle
                  weight="duotone"
                  size={20}
                  className="mt-0.5 shrink-0"
                  style={{ color: 'var(--success)' }}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900">{item.label}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{formatWinLineDate(item.completedAt)}</p>
                </div>
              </motion.li>
            ))
          )}
        </ul>
      ) : null}
    </section>
  )
}

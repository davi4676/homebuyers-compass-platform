'use client'

import { useCallback, useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  getMomentumTrialCalendarDay,
  getMomentumTrialInfo,
  isMomentumPaidLocal,
  NQ_TRIAL_START_DATE_LS,
} from '@/lib/user-tracking'
import { TIER_DEFINITIONS } from '@/lib/tiers'
import { getStoredQuizTransactionMeta } from '@/lib/user-snapshot'

const DISMISS_PREFIX = 'nq_trial_loss_modal_dismissed_'

const FIRST_TIME_LOSS_ITEMS = [
  'Your personalized DPA Match Report ($14,200 identified)',
  'Your lender match list',
  'Phase 2–7 roadmap access',
  'Your Momentum Score history',
  'Budget Sketch saved results',
]

const FIRST_GEN_LOSS_ITEMS = [
  'Your personalized DPA Match Report ($14,200 identified)',
  'Your lender match list & first-gen program matches',
  'Phase 2–7 roadmap access',
  'Your Momentum Score history',
  'Budget Sketch saved results',
]

const SOLO_LOSS_ITEMS = [
  'Your solo-buyer DPA and grant matches',
  'Your lender match list',
  'Phase 2–7 roadmap access',
  'Your Momentum Score history',
  'Budget Sketch saved results',
]

const MOVE_UP_LOSS_ITEMS = [
  'Your sell+buy equity & bridge strategy workspace',
  'Your lender match list',
  'Phase 2–7 roadmap access',
  'Your Momentum Score history',
  'Budget Sketch saved results',
]

const REFINANCE_LOSS_ITEMS = [
  'Your refinance rate & equity optimization tools',
  'Your lender match list',
  'Full refinance journey phases',
  'Your Momentum Score history',
  'Saved scenario comparisons',
]

const DEFAULT_LOSS_ITEMS = [
  'Your personalized DPA Match Report',
  'Your lender match list',
  'Phase 2–7 roadmap access',
  'Your Momentum Score history',
  'Budget Sketch saved results',
]

function lossItemsForIcp(icpType: string | null, transactionType: string | null): string[] {
  if (transactionType === 'refinance' || icpType === 'refinance') return REFINANCE_LOSS_ITEMS
  if (icpType === 'first-gen') return FIRST_GEN_LOSS_ITEMS
  if (icpType === 'first-time' || transactionType === 'first-time') return FIRST_TIME_LOSS_ITEMS
  if (icpType === 'solo') return SOLO_LOSS_ITEMS
  if (icpType === 'move-up' || icpType === 'repeat-buyer' || transactionType === 'repeat-buyer') {
    return MOVE_UP_LOSS_ITEMS
  }
  return DEFAULT_LOSS_ITEMS
}

export default function TrialLossAversionModal() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [trialSnap, setTrialSnap] = useState({
    endsAtIso: null as string | null,
    daysRemaining: 0,
    onTrial: false,
    calendarDay: 0,
    startIso: null as string | null,
  })

  const bump = useCallback(() => {
    const info = getMomentumTrialInfo()
    let startIso: string | null = null
    try {
      startIso = localStorage.getItem(NQ_TRIAL_START_DATE_LS)
    } catch {
      startIso = null
    }
    setTrialSnap({
      endsAtIso: info.endsAtIso,
      daysRemaining: info.daysRemaining,
      onTrial: info.onTrial,
      calendarDay: getMomentumTrialCalendarDay(),
      startIso,
    })
  }, [])

  useEffect(() => {
    bump()
    window.addEventListener('tierChanged', bump)
    window.addEventListener('storage', bump)
    const interval = window.setInterval(bump, 60_000)
    return () => {
      window.removeEventListener('tierChanged', bump)
      window.removeEventListener('storage', bump)
      window.clearInterval(interval)
    }
  }, [bump])

  const { endsAtIso, onTrial, calendarDay, startIso } = trialSnap

  const meta = getStoredQuizTransactionMeta()
  const lossItems = lossItemsForIcp(meta.icpType, meta.transactionType)

  const dismissKey = startIso ?? endsAtIso ?? ''

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (isMomentumPaidLocal()) return
    if (!onTrial || !dismissKey) return
    if (calendarDay !== 6) return
    try {
      if (localStorage.getItem(DISMISS_PREFIX + dismissKey) === '1') return
    } catch {
      /* ignore */
    }
    setOpen(true)
  }, [onTrial, dismissKey, calendarDay])

  const handleDismiss = useCallback(() => {
    try {
      if (dismissKey) localStorage.setItem(DISMISS_PREFIX + dismissKey, '1')
    } catch {
      /* ignore */
    }
    setOpen(false)
  }, [dismissKey])

  const handleUpgrade = useCallback(() => {
    try {
      if (dismissKey) localStorage.setItem(DISMISS_PREFIX + dismissKey, '1')
    } catch {
      /* ignore */
    }
    setOpen(false)
    router.push('/payment?tier=momentum&cycle=monthly')
  }, [router, dismissKey])

  if (!open) return null

  const priceLabel = TIER_DEFINITIONS.momentum.price.displayMonthly ?? 'Momentum'

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-slate-900/80 p-4 sm:items-center">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6">
        <h3 className="mb-1 text-lg font-bold text-slate-900">Your trial is on day 6 — don&apos;t lose momentum</h3>
        <p className="mb-4 text-sm text-slate-500">
          If you don&apos;t upgrade, you&apos;ll lose access to:
        </p>
        <ul className="mb-5 space-y-2">
          {lossItems.map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm text-slate-700">
              <X className="h-4 w-4 shrink-0 text-red-400" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={handleUpgrade}
          className="mb-2 w-full rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white"
        >
          Keep Momentum — {priceLabel}
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="w-full py-2 text-sm text-slate-400"
        >
          Let my access expire
        </button>
      </div>
    </div>
  )
}

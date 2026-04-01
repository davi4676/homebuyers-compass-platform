'use client'

import { useEffect, useState } from 'react'
import type { UserSnapshot } from '@/lib/user-snapshot'
import type { UserTier } from '@/lib/tiers'
import {
  loadPersistedMoneyTrackers,
  reconcileMoneyTrackers,
  type PersistedMoneyTrackers,
} from '@/lib/money-tracker-storage'

export function useMoneyTrackers(
  snapshot: UserSnapshot | null,
  userTier: UserTier,
  phaseOrder: number
): PersistedMoneyTrackers {
  // Keep first client render identical to SSR to avoid hydration mismatches.
  const [totals, setTotals] = useState<PersistedMoneyTrackers>({
    savingsFoundSoFar: 0,
    fundsFoundSoFar: 0,
    altSolutionsIdentified: 0,
  })

  useEffect(() => {
    const next = reconcileMoneyTrackers(snapshot, userTier, phaseOrder)
    setTotals(next)
  }, [snapshot, userTier, phaseOrder])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const onUpdate = () => setTotals(loadPersistedMoneyTrackers())
    window.addEventListener('moneyTrackersUpdated', onUpdate)
    return () => window.removeEventListener('moneyTrackersUpdated', onUpdate)
  }, [])

  return totals
}

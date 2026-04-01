/**
 * Persistent globally visible money trackers for Customized Journey.
 */

import type { UserSnapshot } from '@/lib/user-snapshot'
import type { UserTier } from '@/lib/tiers'
import { estimateTrackerTotals } from '@/lib/money-engine'

export const MONEY_TRACKERS_STORAGE_KEY = 'nq_money_trackers_v1'

export type PersistedMoneyTrackers = {
  savingsFoundSoFar: number
  fundsFoundSoFar: number
  altSolutionsIdentified: number
}

export function loadPersistedMoneyTrackers(): PersistedMoneyTrackers {
  if (typeof window === 'undefined') {
    return { savingsFoundSoFar: 0, fundsFoundSoFar: 0, altSolutionsIdentified: 0 }
  }
  try {
    const raw = localStorage.getItem(MONEY_TRACKERS_STORAGE_KEY)
    if (!raw) return { savingsFoundSoFar: 0, fundsFoundSoFar: 0, altSolutionsIdentified: 0 }
    const p = JSON.parse(raw) as Partial<PersistedMoneyTrackers>
    return {
      savingsFoundSoFar: Math.max(0, Number(p.savingsFoundSoFar) || 0),
      fundsFoundSoFar: Math.max(0, Number(p.fundsFoundSoFar) || 0),
      altSolutionsIdentified: Math.max(0, Math.floor(Number(p.altSolutionsIdentified) || 0)),
    }
  } catch {
    return { savingsFoundSoFar: 0, fundsFoundSoFar: 0, altSolutionsIdentified: 0 }
  }
}

export function savePersistedMoneyTrackers(next: PersistedMoneyTrackers): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(MONEY_TRACKERS_STORAGE_KEY, JSON.stringify(next))
    window.dispatchEvent(new CustomEvent('moneyTrackersUpdated', { detail: next }))
  } catch {
    // ignore
  }
}

/**
 * Display totals = max(persisted, current engine floor) so numbers rise as profile enriches
 * and never dip on reload.
 */
export function reconcileMoneyTrackers(
  snapshot: UserSnapshot | null,
  userTier: UserTier,
  phaseOrder: number,
  prev?: PersistedMoneyTrackers
): PersistedMoneyTrackers {
  const persisted = prev ?? loadPersistedMoneyTrackers()
  const floor = estimateTrackerTotals(snapshot, userTier, phaseOrder)
  const next = {
    savingsFoundSoFar: Math.max(persisted.savingsFoundSoFar, floor.savingsFoundSoFar),
    fundsFoundSoFar: Math.max(persisted.fundsFoundSoFar, floor.fundsFoundSoFar),
    altSolutionsIdentified: Math.max(persisted.altSolutionsIdentified, floor.altSolutionsIdentified),
  }
  if (
    next.savingsFoundSoFar !== persisted.savingsFoundSoFar ||
    next.fundsFoundSoFar !== persisted.fundsFoundSoFar ||
    next.altSolutionsIdentified !== persisted.altSolutionsIdentified
  ) {
    savePersistedMoneyTrackers(next)
  }
  return next
}

export function bumpMoneyTracker(partial: Partial<PersistedMoneyTrackers>): PersistedMoneyTrackers {
  const cur = loadPersistedMoneyTrackers()
  const next = {
    savingsFoundSoFar: cur.savingsFoundSoFar + Math.max(0, partial.savingsFoundSoFar ?? 0),
    fundsFoundSoFar: cur.fundsFoundSoFar + Math.max(0, partial.fundsFoundSoFar ?? 0),
    altSolutionsIdentified: cur.altSolutionsIdentified + Math.max(0, partial.altSolutionsIdentified ?? 0),
  }
  savePersistedMoneyTrackers(next)
  return next
}

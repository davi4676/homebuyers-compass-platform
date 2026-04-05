/**
 * Subscription pause (churn prevention) — prototype: localStorage + optional server mirror.
 * Production: map to Stripe subscription schedules or a dedicated “pause” price (50% of monthly).
 */

import type { UserTier } from '@/lib/tiers'

export const SUBSCRIPTION_PAUSE_STORAGE_KEY = 'hbc_subscription_pause'
export const SUBSCRIPTION_PAUSE_MAX_MONTHS = 3 as const

export type PauseMonths = 1 | 2 | 3

export type SubscriptionPauseState = {
  startedAt: string
  until: string
  tier: UserTier
}

function addCalendarMonths(from: Date, months: number): Date {
  const d = new Date(from.getTime())
  d.setMonth(d.getMonth() + months)
  return d
}

export function computePauseEndIso(months: PauseMonths, from: Date = new Date()): string {
  return addCalendarMonths(from, months).toISOString()
}

export function getSubscriptionPauseState(): SubscriptionPauseState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SUBSCRIPTION_PAUSE_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as SubscriptionPauseState
    if (!parsed?.until || !parsed?.startedAt || !parsed?.tier) return null
    if (Date.now() > new Date(parsed.until).getTime()) {
      clearSubscriptionPauseLocal()
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function isSubscriptionPaused(): boolean {
  return getSubscriptionPauseState() != null
}

export function startSubscriptionPauseLocal(months: PauseMonths, tier: UserTier): SubscriptionPauseState {
  if (typeof window === 'undefined') {
    throw new Error('startSubscriptionPauseLocal is client-only')
  }
  const startedAt = new Date().toISOString()
  const until = computePauseEndIso(months)
  const state: SubscriptionPauseState = { startedAt, until, tier }
  localStorage.setItem(SUBSCRIPTION_PAUSE_STORAGE_KEY, JSON.stringify(state))
  return state
}

export function clearSubscriptionPauseLocal(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(SUBSCRIPTION_PAUSE_STORAGE_KEY)
}

export function subscriptionPauseDaysRemaining(): number {
  const s = getSubscriptionPauseState()
  if (!s) return 0
  const ms = new Date(s.until).getTime() - Date.now()
  return Math.max(0, Math.ceil(ms / 86_400_000))
}

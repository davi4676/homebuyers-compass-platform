/**
 * User Tracking System
 * Manages user tier, progress, and gamification state
 * Uses localStorage for now (would use database/auth in production)
 */

import { UserTier, normalizeUserTier, hasFeature } from './tiers'
import {
  UserProgress,
  initializeProgress,
  awardXp,
  updateStreak,
  type Achievement,
  BADGES,
  checkBadgeEligibility,
  badgeEligibleForTier,
} from './gamification'

const STORAGE_KEYS = {
  TIER: 'userTier',
  TIER_PURCHASE_DATE: 'tierPurchaseDate',
  PROGRESS: 'userProgress',
  USER_ID: 'userId',
  JOURNEY_PHASE: 'journeyPhase',
}

/** Client-side Momentum trial (7 days, no card). Paid access uses `hbc_momentum_paid`. */
export const MOMENTUM_TRIAL_STORAGE = {
  TRIAL_ENDS_AT: 'hbc_momentum_trial_ends_at',
  PAID: 'hbc_momentum_paid',
} as const

/** Unified trial end for banners (no-card trial, Stripe Checkout trial, etc.). */
export const TRIAL_END_DATE_LS = 'trialEndDate'

export const MOMENTUM_TRIAL_DAYS = 7

function readTrialEndsAtIso(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(MOMENTUM_TRIAL_STORAGE.TRIAL_ENDS_AT)
}

function isMomentumPaidLocal(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(MOMENTUM_TRIAL_STORAGE.PAID) === '1'
}

/**
 * Remove trial flags (e.g. dev tier switcher). Does not change `userTier`.
 */
export function clearMomentumTrialLocalFlags(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(MOMENTUM_TRIAL_STORAGE.TRIAL_ENDS_AT)
  localStorage.removeItem(MOMENTUM_TRIAL_STORAGE.PAID)
  localStorage.removeItem(TRIAL_END_DATE_LS)
}

/**
 * After Stripe checkout verification — full Momentum access, no trial expiry.
 */
export function markMomentumPaidLocal(): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(MOMENTUM_TRIAL_STORAGE.PAID, '1')
  localStorage.removeItem(MOMENTUM_TRIAL_STORAGE.TRIAL_ENDS_AT)
  localStorage.removeItem(TRIAL_END_DATE_LS)
}

/**
 * Start 7-day Momentum trial locally (no card). Caller should POST /api/trial/momentum/start when signed in for lifecycle email.
 */
export function startMomentumTrialLocal(): void {
  if (typeof window === 'undefined') return
  const ends = new Date(Date.now() + MOMENTUM_TRIAL_DAYS * 86_400_000).toISOString()
  localStorage.setItem(MOMENTUM_TRIAL_STORAGE.TRIAL_ENDS_AT, ends)
  localStorage.setItem(TRIAL_END_DATE_LS, ends)
  localStorage.removeItem(MOMENTUM_TRIAL_STORAGE.PAID)
  setUserTierInternal('momentum', { recordPurchaseDate: false })
  window.dispatchEvent(new CustomEvent('tierChanged', { detail: { tier: 'momentum' as const } }))
}

export function getMomentumTrialInfo(): {
  onTrial: boolean
  paid: boolean
  endsAtIso: string | null
  daysRemaining: number
} {
  if (typeof window === 'undefined') {
    return { onTrial: false, paid: false, endsAtIso: null, daysRemaining: 0 }
  }
  const paid = isMomentumPaidLocal()
  const ends = readTrialEndsAtIso() ?? localStorage.getItem(TRIAL_END_DATE_LS)
  if (paid || !ends) {
    return { onTrial: false, paid, endsAtIso: ends, daysRemaining: 0 }
  }
  const endMs = new Date(ends).getTime()
  const msLeft = endMs - Date.now()
  if (msLeft <= 0) {
    return { onTrial: false, paid: false, endsAtIso: ends, daysRemaining: 0 }
  }
  return {
    onTrial: true,
    paid: false,
    endsAtIso: ends,
    daysRemaining: Math.max(1, Math.ceil(msLeft / 86_400_000)),
  }
}

/**
 * Downgrade expired trial to Foundations (localStorage + cookie + event).
 */
export function applyMomentumTrialExpiryIfNeeded(): void {
  if (typeof window === 'undefined') return
  const stored = normalizeUserTier(localStorage.getItem(STORAGE_KEYS.TIER))
  if (stored !== 'momentum') return
  if (isMomentumPaidLocal()) return
  const trialEnd = readTrialEndsAtIso() ?? localStorage.getItem(TRIAL_END_DATE_LS)
  if (!trialEnd) return
  if (Date.now() <= new Date(trialEnd).getTime()) return

  localStorage.setItem(STORAGE_KEYS.TIER, 'foundations')
  localStorage.removeItem(MOMENTUM_TRIAL_STORAGE.TRIAL_ENDS_AT)
  localStorage.removeItem(TRIAL_END_DATE_LS)
  setTierCookie('foundations')
  window.dispatchEvent(new CustomEvent('tierChanged', { detail: { tier: 'foundations' as const } }))
}

/** Banner when trial ends in 2 days or less (Momentum, not yet paid). */
export function getTrialEndingSoonBanner(): { days: number } | null {
  if (typeof window === 'undefined') return null
  applyMomentumTrialExpiryIfNeeded()
  if (isMomentumPaidLocal()) return null
  const tier = normalizeUserTier(localStorage.getItem(STORAGE_KEYS.TIER))
  if (tier !== 'momentum') return null
  const ends = readTrialEndsAtIso() ?? localStorage.getItem(TRIAL_END_DATE_LS)
  if (!ends) return null
  const ms = new Date(ends).getTime() - Date.now()
  if (ms <= 0) return null
  const days = Math.max(1, Math.ceil(ms / 86_400_000))
  if (days > 2) return null
  return { days }
}

const COOKIE_KEYS = {
  TIER: 'hbc_tier',
  JOURNEY: 'hbc_journey',
}
const COOKIE_MAX_AGE_DAYS = 365

/**
 * Get current user tier from storage (localStorage; cookie is for server/consistency)
 */
export function getUserTier(): UserTier {
  if (typeof window === 'undefined') return 'foundations'
  applyMomentumTrialExpiryIfNeeded()
  const stored = localStorage.getItem(STORAGE_KEYS.TIER)
  return normalizeUserTier(stored)
}

/**
 * Set cookie for tier (so app can track plan across requests/tabs)
 */
function setTierCookie(tier: UserTier): void {
  if (typeof document === 'undefined') return
  const maxAge = COOKIE_MAX_AGE_DAYS * 24 * 60 * 60
  document.cookie = `${COOKIE_KEYS.TIER}=${encodeURIComponent(tier)}; path=/; max-age=${maxAge}; SameSite=Lax`
}

function setUserTierInternal(tier: UserTier, options?: { recordPurchaseDate?: boolean }): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEYS.TIER, tier)
  if (options?.recordPurchaseDate !== false) {
    localStorage.setItem(STORAGE_KEYS.TIER_PURCHASE_DATE, new Date().toISOString())
  }
  setTierCookie(tier)
}

/**
 * Set user tier and persist to cookie so we remember their plan
 */
export function setUserTier(tier: UserTier, options?: { recordPurchaseDate?: boolean }): void {
  setUserTierInternal(tier, options)
}

/**
 * Set journey phase (e.g. quiz, results, customized-journey) for "where they are"
 */
export function setJourneyPhase(phase: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEYS.JOURNEY_PHASE, phase)
  const maxAge = COOKIE_MAX_AGE_DAYS * 24 * 60 * 60
  document.cookie = `${COOKIE_KEYS.JOURNEY}=${encodeURIComponent(phase)}; path=/; max-age=${maxAge}; SameSite=Lax`
}

/**
 * Get journey phase from storage
 */
export function getJourneyPhase(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(STORAGE_KEYS.JOURNEY_PHASE)
}

/**
 * Get user progress from storage
 */
export function getUserProgress(): UserProgress | null {
  if (typeof window === 'undefined') return null
  
  const stored = localStorage.getItem(STORAGE_KEYS.PROGRESS)
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as UserProgress
      if (parsed && typeof parsed === 'object') {
        parsed.tier = normalizeUserTier(parsed.tier as string)
      }
      return parsed
    } catch {
      return null
    }
  }

  // Initialize if doesn't exist
  const userId = getUserId()
  const tier = getUserTier()
  const progress = initializeProgress(userId, tier)
  saveUserProgress(progress)
  return progress
}

/**
 * Save user progress to storage
 */
export function saveUserProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress))
}

/**
 * Get or create user ID
 */
export function getUserId(): string {
  if (typeof window === 'undefined') return 'anonymous'
  
  let userId = localStorage.getItem(STORAGE_KEYS.USER_ID)
  if (!userId) {
    userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem(STORAGE_KEYS.USER_ID, userId)
  }
  return userId
}

/**
 * Award XP for completing an action
 */
export function awardXpForAction(actionId: string, xpAmount: number): {
  leveledUp: boolean
  newLevel?: number
  newProgress: UserProgress
  badgesUnlocked: string[]
} {
  const progress = getUserProgress()
  if (!progress) {
    throw new Error('User progress not initialized')
  }

  const tier = normalizeUserTier(progress.tier)
  // Streaks are a Momentum+ habit loop; Foundations still earns XP without daily streak mechanics.
  const progressWithStreak = hasFeature(tier, 'gamification.streaks') ? updateStreak(progress) : progress

  // Award XP
  const { newProgress, leveledUp, newLevel } = awardXp(progressWithStreak, xpAmount)

  // Update stats
  newProgress.stats.actionsCompleted += 1

  // Check for badge unlocks
  const { newBadges } = checkBadgeUnlocks(newProgress)
  if (newBadges.length > 0) {
    newProgress.badges = [...newProgress.badges, ...newBadges]
  }

  // Save
  saveUserProgress(newProgress)

  return { newProgress, leveledUp, newLevel, badgesUnlocked: newBadges }
}

/**
 * Record savings from an opportunity
 */
export function recordSavings(opportunityId: string, amount: number): void {
  const progress = getUserProgress()
  if (!progress) return

  progress.stats.totalSavings += amount
  progress.stats.opportunitiesCompleted += 1

  // Award XP based on savings (1 XP per $100 saved)
  const xpEarned = Math.floor(amount / 100)
  if (xpEarned > 0) {
    const { newProgress } = awardXp(progress, xpEarned)
    saveUserProgress(newProgress)
  } else {
    saveUserProgress(progress)
  }
}

/**
 * Check and unlock badges
 */
export function checkBadgeUnlocks(progress: UserProgress): { unlocked: string[]; newBadges: string[] } {
  const unlocked: string[] = []
  const newBadges: string[] = []

  // Check each badge (Foundations: starter badges only — see badgeEligibleForTier)
  for (const badge of BADGES) {
    // Skip if already unlocked
    if (progress.badges.includes(badge.id)) continue
    if (!badgeEligibleForTier(normalizeUserTier(progress.tier), badge)) continue

    // Check eligibility
    if (checkBadgeEligibility(progress, badge)) {
      unlocked.push(badge.id)
      if (!progress.badges.includes(badge.id)) {
        newBadges.push(badge.id)
        // Award XP for badge
        const { newProgress } = awardXp(progress, badge.xpReward)
        progress = newProgress
      }
    }
  }

  // Update progress with new badges
  if (newBadges.length > 0) {
    progress.badges = [...progress.badges, ...newBadges]
    saveUserProgress(progress)
  }

  return { unlocked: progress.badges, newBadges }
}

/**
 * Mark action as completed
 */
export function completeAction(actionId: string, xpReward: number): {
  leveledUp: boolean
  newLevel?: number
  badgesUnlocked: string[]
  newProgress: UserProgress
} {
  const { newProgress, leveledUp, newLevel } = awardXpForAction(actionId, xpReward)
  const { newBadges } = checkBadgeUnlocks(newProgress)

  return { leveledUp, newLevel, badgesUnlocked: newBadges, newProgress }
}

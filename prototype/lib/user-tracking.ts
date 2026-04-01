/**
 * User Tracking System
 * Manages user tier, progress, and gamification state
 * Uses localStorage for now (would use database/auth in production)
 */

import { UserTier, normalizeUserTier } from './tiers'
import { UserProgress, initializeProgress, awardXp, updateStreak, type Achievement, BADGES, checkBadgeEligibility } from './gamification'

const STORAGE_KEYS = {
  TIER: 'userTier',
  TIER_PURCHASE_DATE: 'tierPurchaseDate',
  PROGRESS: 'userProgress',
  USER_ID: 'userId',
  JOURNEY_PHASE: 'journeyPhase',
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

/**
 * Set user tier and persist to cookie so we remember their plan
 */
export function setUserTier(tier: UserTier): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEYS.TIER, tier)
  localStorage.setItem(STORAGE_KEYS.TIER_PURCHASE_DATE, new Date().toISOString())
  setTierCookie(tier)
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

  // Update streak
  const progressWithStreak = updateStreak(progress)

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

  // Check each badge
  for (const badge of BADGES) {
    // Skip if already unlocked
    if (progress.badges.includes(badge.id)) continue

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

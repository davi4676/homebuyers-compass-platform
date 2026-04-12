import type { User } from '@/lib/types/auth'
import type { UserSnapshot } from '@/lib/user-snapshot'

/** Calendar day index from journey start (inclusive), minimum 1. */
export function getJourneyDayNumber(journeyStartIso: string): number {
  const start = new Date(journeyStartIso)
  const today = new Date()
  if (Number.isNaN(start.getTime())) return 1
  start.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)
  const diff = Math.floor((today.getTime() - start.getTime()) / (86_400_000))
  return Math.max(1, diff + 1)
}

export const JOURNEY_CONFETTI_MILESTONE_DAYS = [7, 14, 30, 60] as const

export function isJourneyConfettiMilestoneDay(day: number): boolean {
  return JOURNEY_CONFETTI_MILESTONE_DAYS.includes(day as (typeof JOURNEY_CONFETTI_MILESTONE_DAYS)[number])
}

export function formatUsd(n: number): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

/**
 * Resolves savings bar values: profile first, then quiz snapshot.
 */
export function resolveSavingsProgress(
  user: User | null,
  snapshot: UserSnapshot | null
): { current: number; goal: number } {
  const fromQuiz = snapshot?.quiz
  const current = user?.currentSavings ?? fromQuiz?.downPayment ?? 20_000
  let goal = user?.savingsGoal
  if (goal == null || goal <= 0) {
    const aff = snapshot?.affordability
    if (aff && aff.realisticMax > 0) {
      goal = Math.round(aff.realisticMax * 0.2)
    } else {
      goal = 60_000
    }
  }
  const safeCurrent = Math.max(0, current)
  const safeGoal = Math.max(safeCurrent + 1, goal)
  return { current: safeCurrent, goal: safeGoal }
}

/**
 * Single source of truth for visit streak (localStorage `nq_streak` + `nq_last_visit`).
 * Phase 1 spec: same calendar day → unchanged; yesterday → +1; older gap → reset to 1.
 * Date keys use YYYY-MM-DD (stable across locales).
 */

const LS_STREAK = 'nq_streak'
const LS_LAST_VISIT = 'nq_last_visit'

export function todayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function yesterdayKey(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * Runs streak rules and persists. Safe to call multiple times per page load (idempotent same day).
 * @returns current streak count (minimum 1 after first visit).
 */
export function syncNqVisitStreak(): number {
  if (typeof window === 'undefined') return 1
  try {
    const last = localStorage.getItem(LS_LAST_VISIT)?.trim() ?? ''
    const prevStreak = parseInt(localStorage.getItem(LS_STREAK) ?? '1', 10)
    const safePrev = Number.isFinite(prevStreak) && prevStreak > 0 ? prevStreak : 1
    const today = todayKey()
    const yday = yesterdayKey()

    let next = safePrev
    if (!last) {
      next = 1
    } else if (last === today) {
      next = safePrev
    } else if (last === yday) {
      next = safePrev + 1
    } else {
      next = 1
    }

    localStorage.setItem(LS_STREAK, String(next))
    localStorage.setItem(LS_LAST_VISIT, today)
    return next
  } catch {
    return 1
  }
}

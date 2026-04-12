'use client'

import { useEffect, useState } from 'react'

const LS_STREAK = 'nq_streak'
const LS_LAST_VISIT = 'nq_last_visit'

function todayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function yesterdayKey(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * Consecutive days with activity. Updates localStorage on each app load.
 * Same calendar day: unchanged. Yesterday: +1. Older gap: reset to 1.
 */
export function useVisitStreak(): number {
  const [streak, setStreak] = useState(1)

  useEffect(() => {
    try {
      const last = localStorage.getItem(LS_LAST_VISIT)?.trim() ?? ''
      const prevStreak = parseInt(localStorage.getItem(LS_STREAK) ?? '1', 10)
      const safePrev = Number.isFinite(prevStreak) && prevStreak > 0 ? prevStreak : 1
      const today = todayKey()
      const yday = yesterdayKey()

      let next = safePrev
      if (!last || last === today) {
        next = safePrev
      } else if (last === yday) {
        next = safePrev + 1
      } else {
        next = 1
      }

      localStorage.setItem(LS_STREAK, String(next))
      localStorage.setItem(LS_LAST_VISIT, today)
      setStreak(next)
    } catch {
      setStreak(1)
    }
  }, [])

  return streak
}

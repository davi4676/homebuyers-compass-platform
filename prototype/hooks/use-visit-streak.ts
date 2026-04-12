'use client'

import { useEffect, useState } from 'react'
import { syncNqVisitStreak } from '@/lib/nq-visit-streak'

/**
 * Consecutive days with activity. Delegates to `syncNqVisitStreak` (shared with momentum header).
 */
export function useVisitStreak(): number {
  const [streak, setStreak] = useState(1)

  useEffect(() => {
    setStreak(syncNqVisitStreak())
  }, [])

  return streak
}

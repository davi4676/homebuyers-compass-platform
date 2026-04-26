'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { syncNqVisitStreak } from '@/lib/nq-visit-streak'

/**
 * Phase 8 — engagement LS keys for Compass + streak.
 * - `nq_session_count`: incremented once per calendar day (first route hit that day).
 * - Streak + `nq_last_visit` (calendar day): `syncNqVisitStreak`.
 * - `nq_last_page`: current pathname on every route change.
 */
export default function NqSessionTracking() {
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const today = new Date().toISOString().slice(0, 10)
      if (localStorage.getItem('nq_engagement_day') !== today) {
        localStorage.setItem('nq_engagement_day', today)
        const n = parseInt(localStorage.getItem('nq_session_count') || '0', 10) + 1
        localStorage.setItem('nq_session_count', String(n))
      }
      localStorage.setItem('nq_last_page', pathname)
    } catch {
      /* ignore */
    }
    syncNqVisitStreak()
  }, [pathname])

  return null
}

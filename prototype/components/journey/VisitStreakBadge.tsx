'use client'

import { useVisitStreak } from '@/hooks/use-visit-streak'

/**
 * Flame + streak count for nav (next to avatar). Amber accent, flame pulses every 5s.
 */
export default function VisitStreakBadge() {
  const streak = useVisitStreak()

  return (
    <div
      className="flex items-center gap-1"
      style={{ color: 'var(--accent)', fontSize: 13 }}
      title={`${streak}-day activity streak`}
    >
      <span className="nq-streak-flame inline-block select-none" aria-hidden>
        🔥
      </span>
      <span className="whitespace-nowrap font-medium tabular-nums">
        {streak} day streak
      </span>
    </div>
  )
}

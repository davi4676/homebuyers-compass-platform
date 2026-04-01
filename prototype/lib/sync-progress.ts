/**
 * Sync user progress to the API (when authenticated).
 * Call after awardXpForAction or any local progress update so the server has the latest.
 */

import type { UserProgress } from '@/lib/gamification'

export function syncProgressToApi(progress: UserProgress): void {
  if (typeof window === 'undefined') return
  fetch('/api/user/progress', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(progress),
  }).catch(() => {})
}

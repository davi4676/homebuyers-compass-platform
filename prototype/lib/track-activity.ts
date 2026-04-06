/**
 * Track productivity activity (when user is authenticated).
 * Call from pages/components when key actions happen.
 */

import { appendNqActivityLog } from '@/lib/nq-activity-log'

const VALID_ACTIONS = [
  'quiz_completed',
  'results_viewed',
  'journey_step_completed',
  'tool_used',
  'down_payment_calculator',
  'refinance_calculator',
  'affordability_viewed',
  'profile_updated',
  'first_login',
] as const

export type ActivityActionId = (typeof VALID_ACTIONS)[number]

const ACTIVITY_LOG_LABELS: Record<ActivityActionId, string> = {
  quiz_completed: 'Completed the savings quiz',
  results_viewed: 'Viewed your results',
  journey_step_completed: 'Completed a journey step',
  tool_used: 'Used a NestQuest tool',
  down_payment_calculator: 'Opened the down payment calculator',
  refinance_calculator: 'Used the refinance calculator',
  affordability_viewed: 'Viewed affordability details',
  profile_updated: 'Updated your profile',
  first_login: 'Signed in',
}

export function trackActivity(actionId: ActivityActionId, metadata?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return
  appendNqActivityLog(ACTIVITY_LOG_LABELS[actionId] ?? actionId)
  fetch('/api/user/activity', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ actionId, metadata }),
  }).catch(() => {})
}

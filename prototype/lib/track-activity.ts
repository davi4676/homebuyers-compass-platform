/**
 * Track productivity activity (when user is authenticated).
 * Call from pages/components when key actions happen.
 */

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

export function trackActivity(actionId: ActivityActionId, metadata?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return
  fetch('/api/user/activity', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ actionId, metadata }),
  }).catch(() => {})
}

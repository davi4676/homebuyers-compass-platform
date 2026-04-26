import { appendNqCompletedAction } from '@/lib/nq-completed-actions'

export type RecordCompletionInput = {
  id: string
  label: string
  /** ISO-8601 timestamp (Phase 8 contract). */
  completedAt: string
}

/**
 * Appends to `nq_completed_actions` and dispatches the wins-board event.
 * Prefer this over `appendNqCompletedAction` when wiring Phase 8 completion hooks.
 */
export function recordCompletion(entry: RecordCompletionInput): void {
  const ts = Date.parse(entry.completedAt)
  if (!Number.isFinite(ts)) return
  appendNqCompletedAction({
    id: entry.id,
    label: entry.label,
    completedAt: ts,
  })
}

/**
 * Marks when the user lands on the next guided step (for `nq_current_action_started` in journey context).
 */
export function setNextActionStartedNow(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('nq_current_action_started', new Date().toISOString())
  } catch {
    /* ignore */
  }
}

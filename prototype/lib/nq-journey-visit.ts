/**
 * Last visit timestamp (ms-epoch) for re-engagement / "what changed since your last visit" logic.
 *
 * Use this key (not legacy `nq_last_visit`) — the legacy key collided with the daily-streak
 * tracker, which writes a `YYYY-MM-DD` calendar string to the same slot. `parseInt("YYYY-MM-DD")`
 * returns just the year (e.g. 2026), which `new Date(2026)` then renders as "December 31, 1969".
 */
export const NQ_LAST_VISIT_KEY = 'nq_last_visit_ts'

/** Earliest plausible ms-epoch we'll accept as a real visit (2024-01-01). */
const MIN_VALID_VISIT_TS = 1_700_000_000_000

/**
 * Safely parse a raw localStorage value as a ms-epoch.
 * Returns null for anything that isn't a plausible recent timestamp — including the legacy
 * `"YYYY-MM-DD"` daily-streak string that caused the 1969 bug.
 */
export function parseVisitTimestamp(raw: string | null): number | null {
  if (!raw) return null
  // Reject the "YYYY-MM-DD" calendar-string format outright.
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null
  const n = Number(raw)
  if (!Number.isFinite(n) || n < MIN_VALID_VISIT_TS) return null
  return n
}

export function reengagementDismissedKey(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `nq_reengagement_dismissed_${y}-${m}-${day}`
}

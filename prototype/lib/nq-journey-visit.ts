/** Last visit timestamp (ms) for re-engagement logic */
export const NQ_LAST_VISIT_KEY = 'nq_last_visit'

export function reengagementDismissedKey(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `nq_reengagement_dismissed_${y}-${m}-${day}`
}

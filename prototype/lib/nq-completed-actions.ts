const LS_KEY = 'nq_completed_actions'

export type NqCompletedAction = {
  id: string
  label: string
  completedAt: number
}

export const NQ_COMPLETED_ACTIONS_EVENT = 'nq-completed-actions-updated'

export function loadNqCompletedActions(): NqCompletedAction[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return []
    const p = JSON.parse(raw) as unknown
    if (!Array.isArray(p)) return []
    return p
      .filter(
        (x): x is NqCompletedAction =>
          x != null &&
          typeof x === 'object' &&
          typeof (x as NqCompletedAction).id === 'string' &&
          typeof (x as NqCompletedAction).label === 'string' &&
          typeof (x as NqCompletedAction).completedAt === 'number'
      )
      .sort((a, b) => b.completedAt - a.completedAt)
  } catch {
    return []
  }
}

export function appendNqCompletedAction(entry: NqCompletedAction): void {
  if (typeof window === 'undefined') return
  try {
    const prev = loadNqCompletedActions()
    if (prev.some((e) => e.id === entry.id)) return
    const next = [entry, ...prev.filter((e) => e.id !== entry.id)].slice(0, 50)
    localStorage.setItem(LS_KEY, JSON.stringify(next))
    window.dispatchEvent(new Event(NQ_COMPLETED_ACTIONS_EVENT))
  } catch {
    /* ignore */
  }
}

export function formatWinLineDate(ts: number): string {
  const d = new Date(ts)
  const month = d.toLocaleString('en-US', { month: 'long' })
  const day = d.getDate()
  const saved = `Saved ${month} ${day}`
  const diffMs = Date.now() - ts
  const diffDays = Math.floor(diffMs / 86_400_000)
  let rel: string
  if (diffDays <= 0) rel = 'today'
  else if (diffDays === 1) rel = 'yesterday'
  else rel = `${diffDays} days ago`
  return `${saved} · ${rel}`
}

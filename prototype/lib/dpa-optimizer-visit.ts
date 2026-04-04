export const DPA_OPTIMIZER_VISITED_LS_KEY = 'nq_dpa_optimizer_visited'

export const DPA_OPTIMIZER_VISITED_EVENT = 'nq-dpa-optimizer-visited'

export function markDpaOptimizerVisited(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(DPA_OPTIMIZER_VISITED_LS_KEY, '1')
    window.dispatchEvent(new Event(DPA_OPTIMIZER_VISITED_EVENT))
  } catch {
    /* ignore quota / private mode */
  }
}

export function hasVisitedDpaOptimizer(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return localStorage.getItem(DPA_OPTIMIZER_VISITED_LS_KEY) === '1'
  } catch {
    return false
  }
}

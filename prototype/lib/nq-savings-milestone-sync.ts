/**
 * After savings numbers change, persist `nq_last_savings_pct` when crossing 25/50/75/100%
 * so `evaluateTriggers` can fire `savings_milestone` on the next Compass context build.
 */
export function syncNqSavingsMilestonePct(currentSavings: number, savingsGoal: number): void {
  if (typeof window === 'undefined' || !Number.isFinite(savingsGoal) || savingsGoal <= 0) return
  const pct = Math.min(100, Math.round((Math.max(0, currentSavings) / savingsGoal) * 100))
  let prevPct = 0
  try {
    const raw = localStorage.getItem('nq_last_savings_pct')
    if (raw != null && raw.trim() !== '') prevPct = Math.max(0, parseInt(raw, 10) || 0)
  } catch {
    /* ignore */
  }
  const milestones = [25, 50, 75, 100]
  const crossed = milestones.some((m) => prevPct < m && pct >= m)
  if (!crossed) return
  try {
    localStorage.setItem('nq_last_savings_pct', String(pct))
    window.dispatchEvent(new CustomEvent('nq-savings-milestone-sync'))
  } catch {
    /* ignore */
  }
}

import { getNqGuidedIndicesForPhaseOrder } from '@/lib/nq-guided-steps'

/** Same key as `app/homebuyer/buy-sell-journey/page.tsx` — for lifecycle / dashboards. */
export const BUY_SELL_JOURNEY_STORAGE_KEY = 'buy-sell-journey-v1'

/** Queued when the user finishes (or exits) the Buy & Sell wizard so `/customized-journey` can align the phase roadmap. */
export const NQ_MOVE_UP_WIZARD_SYNC_KEY = 'nq_move_up_wizard_sync_v1'

export type MoveUpWizardSyncPayload = {
  /** NQ roadmap phase order 1–8 (maps from buy-sell wizard step as stepIndex + 1 for steps 0–6). */
  phaseOrder: number
  requestedAt: number
}

/** Buy-sell wizard step index 0–6 → NQ `phaseOrder` 1–7. */
export function buySellWizardStepToPhaseOrder(stepIndex: number): number {
  const s = Math.max(0, Math.min(6, Math.floor(stepIndex)))
  return s + 1
}

export function queueMoveUpWizardJourneySync(phaseOrder: number): void {
  if (typeof window === 'undefined') return
  const po = Math.max(1, Math.min(8, Math.floor(phaseOrder)))
  try {
    localStorage.setItem(
      NQ_MOVE_UP_WIZARD_SYNC_KEY,
      JSON.stringify({ phaseOrder: po, requestedAt: Date.now() } satisfies MoveUpWizardSyncPayload)
    )
  } catch {
    /* ignore */
  }
}

/**
 * Reads and clears the sync queue. When `apply` is false, still removes a stale payload so keys do not linger.
 */
export function consumeMoveUpWizardJourneySync(apply: boolean): {
  targetStepIndex: number
  completedStepIndices: number[]
} | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(NQ_MOVE_UP_WIZARD_SYNC_KEY)
    if (!raw) return null
    localStorage.removeItem(NQ_MOVE_UP_WIZARD_SYNC_KEY)
    if (!apply) return null
    const p = JSON.parse(raw) as Partial<MoveUpWizardSyncPayload>
    const po = Math.max(1, Math.min(8, Math.floor(Number(p.phaseOrder)) || 7))
    const indices = getNqGuidedIndicesForPhaseOrder(po)
    const targetStepIndex = indices[0] ?? 0
    const completed = new Set<number>()
    for (let o = 1; o < po; o++) {
      for (const i of getNqGuidedIndicesForPhaseOrder(o)) completed.add(i)
    }
    return { targetStepIndex, completedStepIndices: [...completed] }
  } catch {
    return null
  }
}

import {
  NQ_GUIDED_PHASE_ORDERS,
  NQ_GUIDED_STEPS,
  countNqGuidedPhasesFullyComplete,
  isNqGuidedPhaseFullyComplete,
} from '@/lib/nq-guided-steps'
import { getStoredQuizTransactionMeta } from '@/lib/user-snapshot'

export type JourneyPhaseRingProgress = {
  /** 0–100, phases completed / total phases */
  pct: number
  completed: number
  total: number
}

/** Maps overall journey % (phases completed) to a short milestone label. */
export function getJourneyPhaseMilestoneLabel(pct: number): string {
  if (pct >= 100) return 'Ready to Close 🎉'
  if (pct >= 76) return 'Final Approach'
  if (pct >= 51) return 'Gaining Traction'
  if (pct >= 26) return 'Building Momentum'
  return 'Laying the Foundation'
}

/**
 * Ultra-short copy for tiny rings (e.g. 48px header) so text fits inside the circle.
 * Full phrases live in `getJourneyPhaseMilestoneLabel`.
 */
export function getJourneyPhaseMilestoneShortLabel(pct: number): string {
  if (pct >= 100) return 'Closing 🎉'
  if (pct >= 76) return 'Final stretch'
  if (pct >= 51) return 'Traction'
  if (pct >= 26) return 'Momentum'
  return 'Foundation'
}

/**
 * Derives phase completion from the same localStorage keys as NQGuidedRoadmap
 * (`nq_current_step`, `nq_completed_steps`) plus quiz meta for refi 5-phase mode.
 */
export function getJourneyPhaseRingProgress(): JourneyPhaseRingProgress {
  if (typeof window === 'undefined') {
    return { pct: 0, completed: 0, total: NQ_GUIDED_PHASE_ORDERS.length }
  }
  try {
    const meta = getStoredQuizTransactionMeta()
    const isRefi = meta.transactionType === 'refinance' || meta.icpType === 'refinance'
    const storedStep = JSON.parse(localStorage.getItem('nq_current_step') || '0')
    let idx = typeof storedStep === 'number' ? storedStep : Number(storedStep)
    if (!Number.isFinite(idx)) idx = 0
    idx = Math.max(0, Math.min(Math.floor(idx), NQ_GUIDED_STEPS.length - 1))
    const step = NQ_GUIDED_STEPS[idx]
    const displayPhaseOrder = Math.max(1, step.phaseOrder)
    const guidedPhaseTotal = NQ_GUIDED_PHASE_ORDERS.length
    const phaseTotalForDisplay =
      isRefi && displayPhaseOrder >= 1 && displayPhaseOrder <= 5 ? 5 : guidedPhaseTotal

    const done = JSON.parse(localStorage.getItem('nq_completed_steps') || '[]') as number[]
    const completedSteps = new Set(done.filter((i) => i >= 0 && i < NQ_GUIDED_STEPS.length))

    let completed: number
    if (isRefi && displayPhaseOrder >= 1 && displayPhaseOrder <= 5) {
      completed = ([1, 2, 3, 4, 5] as const).filter((o) =>
        isNqGuidedPhaseFullyComplete(o, completedSteps)
      ).length
    } else {
      completed = countNqGuidedPhasesFullyComplete(completedSteps)
    }

    const pct =
      phaseTotalForDisplay > 0
        ? Math.min(100, Math.round((completed / phaseTotalForDisplay) * 1000) / 10)
        : 0

    return { pct, completed, total: phaseTotalForDisplay }
  } catch {
    return { pct: 0, completed: 0, total: NQ_GUIDED_PHASE_ORDERS.length }
  }
}

import { calculateDTI } from '@/lib/calculations'
import { getNQStepByIndex, NQ_ROADMAP_PHASE_LINE } from '@/lib/nq-guided-steps'
import type { CompassUser } from '@/lib/ai/types'
import type { UserSnapshot } from '@/lib/user-snapshot'
import { loadPersistedMoneyTrackers } from '@/lib/money-tracker-storage'

type AuthLike = { firstName?: string | null; subscriptionTier?: string | null } | null

/**
 * Maps auth + quiz snapshot + journey localStorage into {@link CompassUser} for `useCompass`.
 */
export function buildCompassUserFromJourney(input: {
  authUser: AuthLike
  snapshot: UserSnapshot | null
  completionPercent: number
  budgetSketchComplete: boolean
}): CompassUser {
  const snapshot = input.snapshot
  const quiz = snapshot?.quiz

  const firstName =
    input.authUser?.firstName?.trim() || snapshot?.tokens.firstName?.trim() || undefined

  let currentPhase = 'Getting started'
  let phaseNumber = '1 of 8'
  if (typeof window !== 'undefined') {
    try {
      const raw = JSON.parse(localStorage.getItem('nq_current_step') || '0')
      const idx = typeof raw === 'number' ? raw : Number(raw)
      const step = getNQStepByIndex(Number.isFinite(idx) ? idx : 0)
      if (step) {
        const line = NQ_ROADMAP_PHASE_LINE[step.phaseOrder]
        currentPhase = line ?? step.title
        const po = Math.min(8, Math.max(1, step.phaseOrder))
        phaseNumber = `${po} of 8`
      }
    } catch {
      /* ignore */
    }
  }

  const monthlyIncome = quiz && quiz.income > 0 ? quiz.income / 12 : 0
  const estimatedDTI =
    quiz && monthlyIncome > 0 ? Math.round(calculateDTI(quiz.monthlyDebt, monthlyIncome) * 10) / 10 : 0

  const trackers = typeof window !== 'undefined' ? loadPersistedMoneyTrackers() : { savingsFoundSoFar: 0 }
  const down = quiz?.downPayment ?? 0
  const currentSavings = down + (trackers.savingsFoundSoFar || 0)

  const targetHome = quiz?.targetHomePrice ?? snapshot?.affordability?.realisticMax ?? 0
  const savingsGoal =
    targetHome > 0 ? Math.round(targetHome * 0.2) : Math.max(Math.round(down * 2), 20_000)
  const targetHomePrice =
    targetHome > 0 ? targetHome : (quiz?.targetHomePrice ?? snapshot?.affordability?.realisticMax ?? 0)

  if (typeof window !== 'undefined') {
    const missing: string[] = []
    if (!firstName) missing.push('firstName')
    if (!quiz?.income) missing.push('householdIncome')
    if (!targetHomePrice) missing.push('targetHomePrice')
    if (!snapshot?.asOf) missing.push('journeyStartDate')
    if (missing.length) {
      console.warn('[Compass] Optional profile fields missing — degrading gracefully:', missing.join(', '))
    }
  }

  return {
    firstName,
    currentPhase,
    phaseNumber,
    completionPercent: input.completionPercent,
    journeyStartDate: snapshot?.asOf ?? undefined,
    currentSavings,
    savingsGoal,
    targetHomePrice,
    creditScoreRange: quiz?.creditScore != null ? String(quiz.creditScore) : snapshot?.tokens.creditBand,
    householdIncome: quiz?.income,
    estimatedDTI,
    tier: input.authUser?.subscriptionTier ?? undefined,
    budgetSketchComplete: input.budgetSketchComplete,
    targetMarketMedianPrice: targetHome > 0 ? targetHome : undefined,
  }
}

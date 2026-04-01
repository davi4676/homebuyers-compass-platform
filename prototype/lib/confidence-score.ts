/**
 * Background confidence score engine. No UI, no gating, no modals, no flow changes.
 *
 * INPUTS:
 * - Journey step completions (how many steps completed)
 * - Reduced hesitation signals (back clicks, edits, slow completions)
 * - Budget clarity actions (calculator use, budget/down-payment actions)
 * - Repeat screen visits (revisits to same screen; can reduce confidence)
 *
 * RULES:
 * - Score 0–100. Conservative weighting; small deltas per signal.
 * - Result stored in UserProfile.confidenceScore only.
 *
 * CONSTRAINTS:
 * - Do NOT gate features. Do NOT trigger modals. Do NOT change flows.
 */

import { getUserProfile, setUserProfile } from './user-profile'
import type { JourneyStep } from './journey-framework'
import { JOURNEY_STEPS } from './journey-framework'

export interface HesitationSignals {
  /** Back button or previous-step navigations (reduces confidence). */
  backClicks?: number
  /** Quiz or form field edits after first entry (reduces confidence). */
  quizEdits?: number
  /** Completions that took longer than a threshold (optional dampener). */
  slowCompletions?: number
}

export interface ConfidenceSignals {
  /** Number of journey steps marked completed (0–7). */
  journeyStepsCompleted?: number
  /** Completed step ids; if not provided, journeyStepsCompleted is used. */
  completedStepIds?: JourneyStep[]
  /** Hesitation indicators; higher values reduce confidence. */
  hesitation?: HesitationSignals
  /** Count of budget/clarity actions (e.g. used calculator, set down payment). */
  budgetClarityActions?: number
  /** Count of repeat visits to the same screen (reduces confidence). */
  repeatScreenVisits?: number
}

const BASE_SCORE = 50
const MAX_DELTA = 25
const SMOOTHING = 0.75

/** Conservative weight per journey step completed (max 7 steps). */
const WEIGHT_JOURNEY_STEP = 4
/** Penalty per back click (capped). */
const WEIGHT_BACK_CLICK = -2
const CAP_BACK_CLICKS = 5
/** Penalty per quiz edit (capped). */
const WEIGHT_QUIZ_EDIT = -0.5
const CAP_QUIZ_EDITS = 10
/** Penalty per slow completion (capped). */
const WEIGHT_SLOW = -1
const CAP_SLOW = 3
/** Bonus per budget clarity action (capped). */
const WEIGHT_BUDGET_ACTION = 2
const CAP_BUDGET_ACTIONS = 8
/** Penalty per repeat screen visit (capped). */
const WEIGHT_REPEAT_VISIT = -1.5
const CAP_REPEAT_VISITS = 10

function clamp(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)))
}

/**
 * Compute raw confidence score (0–100) from signals. Conservative weighting.
 * Unit-testable; pure function.
 */
export function computeConfidenceScore(signals: ConfidenceSignals): number {
  let raw = BASE_SCORE

  const steps =
    signals.completedStepIds != null
      ? Math.min(7, signals.completedStepIds.length)
      : (signals.journeyStepsCompleted != null
          ? Math.min(7, Math.max(0, signals.journeyStepsCompleted))
          : 0)
  raw += steps * WEIGHT_JOURNEY_STEP

  const h = signals.hesitation
  if (h) {
    const back = Math.min(CAP_BACK_CLICKS, h.backClicks ?? 0)
    raw += back * WEIGHT_BACK_CLICK
    const edits = Math.min(CAP_QUIZ_EDITS, h.quizEdits ?? 0)
    raw += edits * WEIGHT_QUIZ_EDIT
    const slow = Math.min(CAP_SLOW, h.slowCompletions ?? 0)
    raw += slow * WEIGHT_SLOW
  }

  const budget = Math.min(CAP_BUDGET_ACTIONS, signals.budgetClarityActions ?? 0)
  raw += budget * WEIGHT_BUDGET_ACTION

  const repeat = Math.min(CAP_REPEAT_VISITS, signals.repeatScreenVisits ?? 0)
  raw += repeat * WEIGHT_REPEAT_VISIT

  return clamp(raw)
}

/**
 * Compute confidence with optional smoothing against previous score.
 * Unit-testable.
 */
export function computeConfidenceScoreWithSmoothing(
  signals: ConfidenceSignals,
  previousScore: number
): number {
  const computed = computeConfidenceScore(signals)
  const blended = SMOOTHING * previousScore + (1 - SMOOTHING) * computed
  return clamp(blended)
}

/**
 * Run confidence engine and store result in UserProfile.confidenceScore.
 * Call from background (e.g. on route change or after signals update). Does not gate features or change flows.
 */
export function updateConfidenceScore(signals: ConfidenceSignals): number {
  const profile = getUserProfile()
  const newScore = computeConfidenceScoreWithSmoothing(signals, profile.confidenceScore)
  setUserProfile({ confidenceScore: newScore })
  return newScore
}

/**
 * Build signals from journey framework completed steps count.
 * Helper for callers that have access to getCompletedSteps().
 */
export function signalsFromCompletedSteps(completedSteps: JourneyStep[]): Pick<
  ConfidenceSignals,
  'completedStepIds' | 'journeyStepsCompleted'
> {
  const ids = completedSteps.filter((s) => JOURNEY_STEPS.includes(s))
  return { completedStepIds: ids, journeyStepsCompleted: ids.length }
}

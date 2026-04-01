/**
 * Rules-based buyerType inference engine.
 *
 * INPUTS:
 * - BehaviorSignals: session/engagement signals (e.g. sections expanded, calculator uses).
 * - UserInputs: existing user inputs from quiz/form (sliders, toggles, choices).
 *
 * LOGIC:
 * - Weighted scoring per buyerType (cautious, optimistic, analyst, lifestyle).
 * - Resolve to the type with the highest score; ties default to 'analyst'.
 * - Re-evaluate at session start by calling recomputeAndPersistBuyerType(signals, inputs).
 *
 * CONSTRAINTS:
 * - No UI changes. No copy changes. No console logging in production.
 *
 * Unit-testable: scoreCautious, scoreOptimistic, scoreAnalyst, scoreLifestyle, inferBuyerType.
 */

import type { BuyerType } from './user-profile'
import { setUserProfile } from './user-profile'

// ---------------------------------------------------------------------------
// Input types (optional fields; missing = no contribution to score)
// ---------------------------------------------------------------------------

export interface BehaviorSignals {
  /** Number of expandable sections the user opened (e.g. loan programs, funding sources). */
  sectionsExpanded?: number
  /** Number of times user used a calculator or cost tool. */
  calculatorUses?: number
  /** Approximate seconds on results/journey pages (optional). */
  timeOnResultsSeconds?: number
  /** Number of journey steps completed (e.g. buy-sell or refinance steps). */
  journeyStepsCompleted?: number
  /** Whether user opened detailed breakdowns (e.g. lifetime costs, PMI). */
  openedDetailBreakdowns?: boolean
}

export interface UserInputs {
  /** Quiz: timeline for buying. */
  timeline?: string
  /** Quiz: biggest concern. */
  concern?: string
  /** Quiz: credit score band. */
  creditScore?: string
  /** Quiz: agent status. */
  agentStatus?: string
  /** Quiz: down payment amount (number). */
  downPayment?: number
  /** Quiz: income (number). */
  income?: number
  /** Quiz: target price or purchase price (for down %). */
  purchasePrice?: number
  /** Transaction type from quiz. */
  transactionType?: string
}

// ---------------------------------------------------------------------------
// Scoring weights and rules (all additive; higher = more likely that type)
// ---------------------------------------------------------------------------

/**
 * CAUTIOUS: Prefers safety, avoids risk, seeks reassurance.
 * Scoring: + for concern about hidden costs / getting ripped off / wrong choice;
 *          + for longer timeline (exploring); + for not yet having agent;
 *          + for higher down payment ratio; + for opening many sections (seeking info).
 */
export function scoreCautious(signals: BehaviorSignals, inputs: UserInputs): number {
  let score = 0
  const concern = (inputs.concern ?? '').toLowerCase()
  const timeline = (inputs.timeline ?? '').toLowerCase()
  const agent = (inputs.agentStatus ?? '').toLowerCase()

  if (concern === 'hidden-costs' || concern === 'ripped-off' || concern === 'wrong-choice') score += 25
  if (timeline === 'exploring' || timeline === '1-year') score += 15
  if (agent === 'not-yet' || agent === 'solo') score += 10
  if ((signals.sectionsExpanded ?? 0) >= 3) score += 15
  if (signals.openedDetailBreakdowns) score += 10

  const downPct = downPaymentPercent(inputs)
  if (downPct >= 15 && downPct <= 25) score += 10

  return score
}

/**
 * OPTIMISTIC: Moves quickly, trusts process, less detail-focused.
 * Scoring: + for short timeline (3–6 months); + for concern = market timing;
 *          + for already have agent; − for heavy calculator/section use.
 */
export function scoreOptimistic(signals: BehaviorSignals, inputs: UserInputs): number {
  let score = 0
  const timeline = (inputs.timeline ?? '').toLowerCase()
  const concern = (inputs.concern ?? '').toLowerCase()
  const agent = (inputs.agentStatus ?? '').toLowerCase()

  if (timeline === '3-months' || timeline === '6-months') score += 20
  if (concern === 'timing') score += 15
  if (agent === 'have-agent') score += 15
  if ((signals.calculatorUses ?? 0) <= 1 && (signals.sectionsExpanded ?? 0) <= 1) score += 10

  return score
}

/**
 * ANALYST: Data-driven, compares options, likes detail and numbers.
 * Scoring: + for calculator use; + for concern = affording / market timing;
 *          + for opening many sections; + for high credit score focus (750+);
 *          + for opened detail breakdowns.
 */
export function scoreAnalyst(signals: BehaviorSignals, inputs: UserInputs): number {
  let score = 0
  const concern = (inputs.concern ?? '').toLowerCase()
  const credit = (inputs.creditScore ?? '').toLowerCase()

  if ((signals.calculatorUses ?? 0) >= 2) score += 20
  if (concern === 'affording' || concern === 'timing') score += 15
  if ((signals.sectionsExpanded ?? 0) >= 2) score += 15
  if (credit === '750+') score += 10
  if (signals.openedDetailBreakdowns) score += 15

  return score
}

/**
 * LIFESTYLE: Values fit and feel over pure numbers; agent and choice matter.
 * Scoring: + for concern = wrong choice; + for have agent or interviewing;
 *          + for moderate section/calculator use (not minimal, not heavy).
 */
export function scoreLifestyle(signals: BehaviorSignals, inputs: UserInputs): number {
  let score = 0
  const concern = (inputs.concern ?? '').toLowerCase()
  const agent = (inputs.agentStatus ?? '').toLowerCase()

  if (concern === 'wrong-choice') score += 25
  if (agent === 'have-agent' || agent === 'interviewing') score += 20
  const expanded = signals.sectionsExpanded ?? 0
  const calc = signals.calculatorUses ?? 0
  if (expanded >= 1 && expanded <= 3 && calc <= 2) score += 10

  return score
}

// ---------------------------------------------------------------------------
// Helpers (unit-testable)
// ---------------------------------------------------------------------------

function downPaymentPercent(inputs: UserInputs): number {
  const down = inputs.downPayment ?? 0
  const price = inputs.purchasePrice ?? (inputs.income ? inputs.income * 4 : 0)
  if (price <= 0) return 0
  return (down / price) * 100
}

const BUYER_TYPES: BuyerType[] = ['cautious', 'optimistic', 'analyst', 'lifestyle']

const SCORERS: Record<BuyerType, (s: BehaviorSignals, i: UserInputs) => number> = {
  cautious: scoreCautious,
  optimistic: scoreOptimistic,
  analyst: scoreAnalyst,
  lifestyle: scoreLifestyle,
}

/**
 * Compute score for one buyerType (unit-testable).
 */
export function scoreBuyerType(
  signals: BehaviorSignals,
  inputs: UserInputs,
  type: BuyerType
): number {
  return SCORERS[type](signals, inputs)
}

/**
 * Resolve to the buyerType with the highest score. Ties default to 'analyst'.
 * Unit-testable; pure function.
 */
export function inferBuyerType(signals: BehaviorSignals, inputs: UserInputs): BuyerType {
  let best: BuyerType = 'analyst'
  let bestScore = -1

  for (const type of BUYER_TYPES) {
    const score = SCORERS[type](signals, inputs)
    if (score > bestScore) {
      bestScore = score
      best = type
    }
  }

  return best
}

/**
 * Re-evaluate buyerType from current signals and inputs, then persist to UserProfile.
 * Call at session start (e.g. in a layout or provider effect). No UI or copy changes.
 */
export function recomputeAndPersistBuyerType(
  signals: BehaviorSignals,
  inputs: UserInputs
): BuyerType {
  const inferred = inferBuyerType(signals, inputs)
  setUserProfile({ buyerType: inferred })
  return inferred
}

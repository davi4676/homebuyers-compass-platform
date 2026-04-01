/**
 * NextBestAction engine — suggests a single action internally. Inactive (no UI).
 *
 * INPUTS:
 * - Journey step (current step in journey framework)
 * - Confidence score (0–100 from UserProfile)
 * - Buyer type (from UserProfile)
 *
 * OUTPUT:
 * - Function returning recommended action + reason. Used nowhere yet (future hook).
 *
 * CONSTRAINTS:
 * - Do NOT surface suggestions. Do NOT change buttons. Do NOT add UI.
 */

import type { JourneyStep } from './journey-framework'
import type { BuyerType } from './user-profile'

/** Recommended action id; for future hook to map to copy or deep link. Not displayed in this module. */
export type NextBestActionId =
  | 'start-quiz'
  | 'complete-quiz'
  | 'view-results'
  | 'explore-journey'
  | 'use-calculator'
  | 'review-funding'
  | 'create-action-plan'
  | 'talk-to-agent'
  | 'complete-upgrade'
  | 'stay-on-step'

export interface NextBestAction {
  action: NextBestActionId
  reason: string
}

/**
 * Returns the single recommended next best action and a short reason.
 * Used nowhere yet; future hook can call this and optionally surface the suggestion.
 * This module does not surface suggestions, change buttons, or add UI.
 */
export function getNextBestAction(
  journeyStep: JourneyStep,
  confidenceScore: number,
  buyerType: BuyerType
): NextBestAction {
  const lowConfidence = confidenceScore < 40
  const highConfidence = confidenceScore >= 70

  switch (journeyStep) {
    case 'discover':
      if (lowConfidence && buyerType === 'cautious') {
        return { action: 'explore-journey', reason: 'Low confidence + cautious: explore journey first' }
      }
      return { action: 'start-quiz', reason: 'Next step: start assessment' }

    case 'assess':
      if (lowConfidence) {
        return { action: 'complete-quiz', reason: 'Complete quiz to get personalized results' }
      }
      return { action: 'complete-quiz', reason: 'Finish assessment to see results' }

    case 'results':
      if (buyerType === 'analyst') {
        return { action: 'use-calculator', reason: 'Analyst: dig into numbers' }
      }
      if (highConfidence) {
        return { action: 'explore-journey', reason: 'High confidence: move to plan' }
      }
      return { action: 'explore-journey', reason: 'Review your personalized journey' }

    case 'plan':
      if (buyerType === 'cautious') {
        return { action: 'review-funding', reason: 'Cautious: clarify funding options' }
      }
      if (lowConfidence) {
        return { action: 'review-funding', reason: 'Build confidence with funding clarity' }
      }
      return { action: 'review-funding', reason: 'Next: prepare funding and tools' }

    case 'prepare':
      if (highConfidence) {
        return { action: 'create-action-plan', reason: 'Ready to act' }
      }
      return { action: 'create-action-plan', reason: 'Next: create your action plan' }

    case 'act':
      if (lowConfidence) {
        return { action: 'talk-to-agent', reason: 'Low confidence: consider talking to an expert' }
      }
      return { action: 'complete-upgrade', reason: 'Consider upgrade for full toolkit' }

    case 'complete':
      return { action: 'stay-on-step', reason: 'You’re at the end of the flow' }

    default:
      return { action: 'explore-journey', reason: 'Continue your journey' }
  }
}

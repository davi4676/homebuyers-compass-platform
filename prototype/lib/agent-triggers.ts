/**
 * Agent-trigger detection — silent, internal flags only. Inactive (no UI/notifications).
 *
 * TRIGGERS DETECTED:
 * - Confidence score plateau (no meaningful increase over recent updates)
 * - First stretch/risk decision (caller records when user makes a high-stakes choice)
 * - Repeated hesitation on same step (multiple back/revisit on same journey step)
 * - Explicit help-related taps (caller records when user taps help/learn-more/support)
 *
 * CONSTRAINTS:
 * - Do NOT show agent UI. Do NOT send notifications. Do NOT alter existing help flows.
 *
 * OUTPUT:
 * - Internal flags only. Future activation: when agent UI is enabled, read getAgentTriggerFlags()
 *   to decide whether to show agent prompt. This module never triggers UI or flows.
 */

import type { JourneyStep } from './journey-framework'

const STORAGE_KEY = 'agentTriggersState'

/** Internal flags; for future agent activation only. Not displayed, not sent. */
export interface AgentTriggerFlags {
  /** Confidence score has not increased over the last N updates. */
  confidencePlateau: boolean
  /** User has made at least one stretch/risk decision (e.g. aggressive timeline, high DTI). */
  firstStretchRisk: boolean
  /** User hesitated repeatedly on the same journey step (back/revisit count above threshold). */
  repeatedHesitation: boolean
  /** User tapped a help-related element (help, learn more, FAQ, support). */
  explicitHelpTap: boolean
}

const DEFAULT_FLAGS: AgentTriggerFlags = {
  confidencePlateau: false,
  firstStretchRisk: false,
  repeatedHesitation: false,
  explicitHelpTap: false,
}

/** Number of recent confidence scores to keep for plateau detection. */
const CONFIDENCE_HISTORY_SIZE = 5
/** Plateau: no increase of at least this many points over the history window. */
const PLATEAU_MIN_INCREASE = 2
/** Hesitation threshold per step: flag when any step has at least this many hesitations. */
const HESITATION_THRESHOLD = 3

interface PersistedState {
  confidenceScores: number[]
  stretchRiskRecorded: boolean
  hesitationByStep: Record<string, number>
  helpTapCount: number
}

function loadState(): PersistedState {
  if (typeof window === 'undefined') {
    return {
      confidenceScores: [],
      stretchRiskRecorded: false,
      hesitationByStep: {},
      helpTapCount: 0,
    }
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultPersistedState()
    const parsed = JSON.parse(raw) as Partial<PersistedState>
    return {
      confidenceScores: Array.isArray(parsed.confidenceScores)
        ? parsed.confidenceScores.slice(-CONFIDENCE_HISTORY_SIZE)
        : [],
      stretchRiskRecorded: Boolean(parsed.stretchRiskRecorded),
      hesitationByStep:
        parsed.hesitationByStep && typeof parsed.hesitationByStep === 'object'
          ? parsed.hesitationByStep
          : {},
      helpTapCount: typeof parsed.helpTapCount === 'number' ? parsed.helpTapCount : 0,
    }
  } catch {
    return defaultPersistedState()
  }
}

function defaultPersistedState(): PersistedState {
  return {
    confidenceScores: [],
    stretchRiskRecorded: false,
    hesitationByStep: {},
    helpTapCount: 0,
  }
}

function saveState(state: PersistedState): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore
  }
}

function deriveFlags(state: PersistedState): AgentTriggerFlags {
  const scores = state.confidenceScores
  const plateau =
    scores.length >= CONFIDENCE_HISTORY_SIZE &&
    Math.max(...scores) - Math.min(...scores) < PLATEAU_MIN_INCREASE

  const repeatedHesitation = Object.values(state.hesitationByStep).some(
    (c) => c >= HESITATION_THRESHOLD
  )

  return {
    confidencePlateau: plateau,
    firstStretchRisk: state.stretchRiskRecorded,
    repeatedHesitation,
    explicitHelpTap: state.helpTapCount > 0,
  }
}

/**
 * Record a confidence score update. Used to detect plateau (no increase over recent updates).
 * Call from background when confidence score is updated (e.g. after updateConfidenceScore).
 */
export function recordConfidenceScore(score: number): void {
  const state = loadState()
  state.confidenceScores.push(Math.max(0, Math.min(100, score)))
  if (state.confidenceScores.length > CONFIDENCE_HISTORY_SIZE) {
    state.confidenceScores = state.confidenceScores.slice(-CONFIDENCE_HISTORY_SIZE)
  }
  saveState(state)
}

/**
 * Record that the user made a stretch/risk decision (e.g. aggressive timeline, high DTI, minimal down).
 * Call from quiz/results when such a choice is detected. First occurrence sets firstStretchRisk.
 */
export function recordStretchRiskDecision(): void {
  const state = loadState()
  state.stretchRiskRecorded = true
  saveState(state)
}

/**
 * Record hesitation on a step (e.g. back click or revisit to same step).
 * When count for any step reaches threshold, repeatedHesitation flag is set.
 */
export function recordStepHesitation(stepId: JourneyStep | string): void {
  const state = loadState()
  const key = String(stepId)
  state.hesitationByStep[key] = (state.hesitationByStep[key] ?? 0) + 1
  saveState(state)
}

/**
 * Record an explicit help-related tap (help, learn more, FAQ, support).
 * Does not alter existing help flows; caller invokes after existing handler runs.
 */
export function recordHelpTap(): void {
  const state = loadState()
  state.helpTapCount += 1
  saveState(state)
}

/**
 * Return current agent-trigger flags. Internal only; no UI, no notifications.
 * Future activation: when agent UI is enabled, check these flags to decide whether to show agent prompt.
 */
export function getAgentTriggerFlags(): AgentTriggerFlags {
  const state = loadState()
  return deriveFlags(state)
}

/**
 * Clear all triggers (e.g. after agent was shown or for testing). Does not change any flows.
 */
export function clearAgentTriggers(): void {
  saveState(defaultPersistedState())
}

/**
 * JourneyFramework — maps existing screens to journey steps. Non-blocking.
 *
 * REQUIREMENTS:
 * - Define 7 journey steps.
 * - Map current routes/screens to steps.
 * - Track currentStep from pathname; track completed steps internally.
 * - Do NOT block navigation. Do NOT reorder screens. Do NOT add progress UI yet.
 *
 * OUTPUT:
 * - JourneyStep type (7 steps)
 * - Screen-to-step mapping via getStepForPath(pathname)
 * - Internal step completion tracking (getCompletedSteps, markStepCompleted)
 */

/** Seven journey steps; order matches typical flow. */
export type JourneyStep =
  | 'discover'
  | 'assess'
  | 'results'
  | 'plan'
  | 'prepare'
  | 'act'
  | 'complete'

/** Ordered list of steps for indexing and iteration. */
export const JOURNEY_STEPS: readonly JourneyStep[] = [
  'discover',
  'assess',
  'results',
  'plan',
  'prepare',
  'act',
  'complete',
]

/** Step index (0–6). */
export function getStepIndex(step: JourneyStep): number {
  const i = JOURNEY_STEPS.indexOf(step)
  return i >= 0 ? i : 0
}

/**
 * Maps pathname to journey step. Does not block navigation; read-only mapping.
 * More specific paths are checked first.
 */
export function getStepForPath(pathname: string): JourneyStep {
  if (!pathname) return 'discover'
  const p = pathname.toLowerCase().replace(/^\/+|\/+$/g, '') || ''
  if (p === 'quiz') return 'assess'
  if (p === 'results') return 'results'
  if (p.startsWith('journey') || p === 'customized-journey') return 'plan'
  if (p === 'refinance-optimizer' || p === 'repeat-buyer-suite') return 'plan'
  if (p.startsWith('homebuyer/')) return 'plan'
  if (p === 'homebuyer') return 'discover'
  if (p === 'mortgage-shopping' || p === 'down-payment-optimizer') return 'prepare'
  if (p === 'action-plan' || p === 'payment') return 'act'
  if (p === 'upgrade') return 'complete'
  if (p === '' || p === 'homebuyer') return 'discover'
  return 'discover'
}

/** Current step derived from pathname (no mutable global; call with current path). */
export function getCurrentStep(pathname: string): JourneyStep {
  return getStepForPath(pathname)
}

// ---------------------------------------------------------------------------
// Internal step completion tracking (persisted locally; does not block nav)
// ---------------------------------------------------------------------------

const COMPLETED_STEPS_KEY = 'journeyFrameworkCompletedSteps'

function loadCompletedSteps(): Set<JourneyStep> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(COMPLETED_STEPS_KEY)
    if (!raw) return new Set()
    const arr = JSON.parse(raw) as string[]
    const valid = JOURNEY_STEPS as readonly string[]
    return new Set(arr.filter((s) => valid.includes(s)) as JourneyStep[])
  } catch {
    return new Set()
  }
}

function saveCompletedSteps(steps: Set<JourneyStep>): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(COMPLETED_STEPS_KEY, JSON.stringify(Array.from(steps)))
  } catch {
    // ignore
  }
}

/** Returns steps marked completed so far. Does not block navigation. */
export function getCompletedSteps(): JourneyStep[] {
  return Array.from(loadCompletedSteps())
}

/** Mark a step as completed (e.g. user visited that screen). Persisted locally only. */
export function markStepCompleted(step: JourneyStep): void {
  const set = loadCompletedSteps()
  set.add(step)
  saveCompletedSteps(set)
}

/** Check if a step has been completed. */
export function isStepCompleted(step: JourneyStep): boolean {
  return loadCompletedSteps().has(step)
}

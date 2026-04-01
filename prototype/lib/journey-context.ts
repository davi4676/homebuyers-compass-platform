/**
 * Journey-first, personalized framework — data model and helpers.
 * Layer on top of existing app: no UI/copy/route changes.
 * Use for conditional behavior, feature guards, and optional overlays.
 */

export type JourneyType = 'first-time' | 'refinance' | 'repeat-buyer'

export interface JourneyState {
  /** Resolved from pathname + stored quiz/transaction type */
  journeyType: JourneyType | null
  /** Optional phase/step id for conditional logic (e.g. "preparation", "rate-radar") */
  currentPhase: string | null
  /** When true, journey was inferred from URL path only (not yet from quiz) */
  inferredFromPath: boolean
}

const QUIZ_DATA_KEY = 'quizData'

/**
 * Derive journey type from pathname. Does not replace or rename routes.
 */
export function getJourneyTypeFromPath(pathname: string): JourneyType | null {
  if (!pathname) return null
  const p = pathname.toLowerCase()
  if (p.includes('refinance-optimizer') || p.includes('refinance')) return 'refinance'
  if (p.includes('repeat-buyer-suite') || p.includes('repeat-buyer') || p.includes('buy-sell-journey')) return 'repeat-buyer'
  if (p.includes('customized-journey') || p.includes('quiz') || p.includes('results') || p === '/' || p === '') return 'first-time'
  return null
}

function isNeutralJourneyPath(pathname: string): boolean {
  if (!pathname) return false
  const p = pathname.toLowerCase()
  return p.includes('results') || p.includes('customized-journey') || p === '/' || p === ''
}

/**
 * Get stored transaction type from quizData in localStorage (if present).
 * Used to personalize without changing existing screens.
 */
export function getStoredJourneyType(): JourneyType | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(QUIZ_DATA_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as { transactionType?: string }
    const t = data?.transactionType
    if (t === 'first-time' || t === 'refinance' || t === 'repeat-buyer') return t as JourneyType
    return null
  } catch {
    return null
  }
}

/**
 * Build initial journey state from pathname and optional stored data.
 * Prefer stored transaction type when on a neutral path (e.g. results, customized-journey).
 */
export function getInitialJourneyState(pathname: string): JourneyState {
  const fromPath = getJourneyTypeFromPath(pathname)
  const fromStorage = getStoredJourneyType()
  const journeyType = isNeutralJourneyPath(pathname)
    ? fromStorage ?? fromPath ?? null
    : fromPath ?? fromStorage ?? null
  const inferredFromPath = fromPath !== null && fromStorage === null
  return {
    journeyType,
    currentPhase: null,
    inferredFromPath,
  }
}

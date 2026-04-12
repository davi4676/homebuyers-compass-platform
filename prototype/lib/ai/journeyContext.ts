import type { CompassUser, JourneyContext } from '@/lib/ai/types'

/**
 * Integer days between two dates (absolute difference, calendar-agnostic).
 */
export function diffDays(dateA: Date | string | number | null | undefined, dateB: Date): number {
  if (dateA == null || dateA === '') return 9999
  let a: Date
  if (typeof dateA === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateA.trim())) {
    a = new Date(`${dateA.trim()}T12:00:00`)
  } else {
    a = new Date(dateA)
  }
  if (Number.isNaN(a.getTime())) return 9999
  const ms = Math.abs(dateB.getTime() - a.getTime())
  return Math.floor(ms / 86_400_000)
}

/**
 * Parsed localStorage value, or null if missing / invalid.
 * Supports JSON arrays/objects and plain strings.
 */
export function getFromStorage(key: string): unknown {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(key)
    if (raw == null || raw === '') return null
    const t = raw.trim()
    if (t.startsWith('[') || t.startsWith('{')) {
      return JSON.parse(t) as unknown
    }
    if (/^-?\d+(\.\d+)?$/.test(t)) return Number(t)
    return raw
  } catch {
    return null
  }
}

function num(v: unknown, fallback: number): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v)
    if (Number.isFinite(n)) return n
  }
  return fallback
}

function str(v: unknown, fallback: string): string {
  if (v == null) return fallback
  if (typeof v === 'string') return v || fallback
  if (typeof v === 'number' && Number.isFinite(v)) return String(v)
  return fallback
}

/**
 * Builds structured context for Compass from a normalized user object + local behavior keys.
 */
export function buildJourneyContext(user: CompassUser | null | undefined): JourneyContext {
  const now = new Date()
  const u = user ?? {}

  const sessionRaw = getFromStorage('nq_session_count')
  /** 0 = unset / first instrumentation — aligns with FIRST_VISIT (sessionCount <= 1). */
  const sessionCount = sessionRaw == null ? 0 : num(sessionRaw, 0)

  const lastVisitRaw = getFromStorage('nq_last_visit')
  const lastVisitStr =
    typeof lastVisitRaw === 'string'
      ? lastVisitRaw
      : lastVisitRaw != null
        ? String(lastVisitRaw)
        : null

  let lastVisitForDiff: Date | string | null = lastVisitStr
  if (lastVisitStr && /^\d+$/.test(lastVisitStr.trim())) {
    const ms = Number(lastVisitStr)
    if (Number.isFinite(ms)) lastVisitForDiff = new Date(ms)
  }

  const daysSinceLastVisit = diffDays(lastVisitForDiff, now)

  const streakRaw = getFromStorage('nq_streak')
  const streak = streakRaw == null ? null : num(streakRaw, 0)

  const completedActions = getFromStorage('nq_completed_actions')

  const rawActionStarted = getFromStorage('nq_current_action_started')
  const currentActionStarted =
    typeof rawActionStarted === 'string' ? rawActionStarted : null

  const phaseStartedRaw = getFromStorage('nq_phase_started')
  let phaseStarted: Date | string | null = null
  if (typeof phaseStartedRaw === 'string' && phaseStartedRaw.trim() !== '') {
    phaseStarted = /^\d+$/.test(phaseStartedRaw.trim())
      ? new Date(Number(phaseStartedRaw))
      : phaseStartedRaw
  } else if (typeof phaseStartedRaw === 'number' && Number.isFinite(phaseStartedRaw)) {
    phaseStarted = new Date(phaseStartedRaw)
  }

  const stuckOnCurrentPhase = phaseStarted != null && diffDays(phaseStarted, now) > 7

  const lastPage = getFromStorage('nq_last_page')
  const lastPageViewed = typeof lastPage === 'string' ? lastPage : lastPage != null ? String(lastPage) : null

  const start = u.journeyStartDate ?? null
  const daysSinceStart = diffDays(start, now)

  const savings = u.currentSavings ?? 0
  const savingsGoal = u.savingsGoal ?? 0
  const targetHome = u.targetHomePrice ?? 0

  return {
    profile: {
      firstName: str(u.firstName, 'there'),
      currentPhase: str(u.currentPhase, 'Getting started'),
      phaseNumber: str(u.phaseNumber, '1 of 8'),
      completionPercent: num(u.completionPercent, 0),
      daysSinceStart,
      savings,
      savingsGoal,
      targetHomePrice: targetHome,
      creditScoreRange: str(u.creditScoreRange, 'Not provided'),
      householdIncome: num(u.householdIncome, 0),
      dti: num(u.estimatedDTI, 0),
      tier: str(u.tier, 'foundations'),
    },
    behavior: {
      sessionCount,
      lastVisit: lastVisitStr,
      daysSinceLastVisit,
      streak,
      completedActions,
      currentActionStarted,
      stuckOnCurrentPhase,
      budgetSketchComplete: Boolean(u.budgetSketchComplete),
      lastPageViewed,
    },
    market: {
      thirtyYearRate: 6.85,
      rateChangeSinceLastVisit: -0.12,
      localMedianPrice: u.targetMarketMedianPrice ?? (targetHome || 385_000),
    },
  }
}

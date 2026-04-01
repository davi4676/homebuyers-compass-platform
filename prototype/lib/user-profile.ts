/**
 * UserProfile — personalization state layer (not connected to UI).
 *
 * INTENDED FUTURE USAGE:
 * - Drive copy variants (e.g. tone, length) based on buyerType and detailPreference.
 * - Adjust recommendations and nudges using confidenceScore and riskTolerance.
 * - Filter or order content by timeHorizon (e.g. "ready soon" vs "planning ahead").
 * - Feature guards or optional overlays (e.g. show extra reassurance for cautious buyers).
 *
 * This module only defines the model, defaults, and local persistence. No screens
 * or components are modified; no profile data is displayed to the user yet.
 */

export type BuyerType = 'cautious' | 'optimistic' | 'analyst' | 'lifestyle'

export type RiskTolerance = 'low' | 'medium' | 'high'

export type TimeHorizon = 'short' | 'medium' | 'long'

export type DetailPreference = 'minimal' | 'moderate' | 'high'

export interface UserProfile {
  /** How the user approaches decisions; influences tone and recommendation style. */
  buyerType: BuyerType
  /** 0–100; self-reported or inferred confidence in the homebuying process. */
  confidenceScore: number
  /** Willingness to take financial/process risk; affects suggested strategies. */
  riskTolerance: RiskTolerance
  /** Planning timeline (e.g. short = buying soon, long = early research). */
  timeHorizon: TimeHorizon
  /** How much detail the user prefers in explanations and steps. */
  detailPreference: DetailPreference
}

const STORAGE_KEY = 'userProfile'

/** Safe defaults; used when no profile exists or on first load. */
export const DEFAULT_USER_PROFILE: UserProfile = {
  buyerType: 'analyst',
  confidenceScore: 50,
  riskTolerance: 'medium',
  timeHorizon: 'medium',
  detailPreference: 'moderate',
}

function clampConfidence(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)))
}

/**
 * Load UserProfile from localStorage. Returns defaults if missing or invalid.
 */
export function getUserProfile(): UserProfile {
  if (typeof window === 'undefined') return DEFAULT_USER_PROFILE
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_USER_PROFILE
    const parsed = JSON.parse(raw) as Partial<UserProfile>
    return {
      buyerType:
        ['cautious', 'optimistic', 'analyst', 'lifestyle'].includes(parsed.buyerType ?? '')
          ? (parsed.buyerType as BuyerType)
          : DEFAULT_USER_PROFILE.buyerType,
      confidenceScore: clampConfidence(
        typeof parsed.confidenceScore === 'number' ? parsed.confidenceScore : DEFAULT_USER_PROFILE.confidenceScore
      ),
      riskTolerance:
        ['low', 'medium', 'high'].includes(parsed.riskTolerance ?? '')
          ? (parsed.riskTolerance as RiskTolerance)
          : DEFAULT_USER_PROFILE.riskTolerance,
      timeHorizon:
        ['short', 'medium', 'long'].includes(parsed.timeHorizon ?? '')
          ? (parsed.timeHorizon as TimeHorizon)
          : DEFAULT_USER_PROFILE.timeHorizon,
      detailPreference:
        ['minimal', 'moderate', 'high'].includes(parsed.detailPreference ?? '')
          ? (parsed.detailPreference as DetailPreference)
          : DEFAULT_USER_PROFILE.detailPreference,
    }
  } catch {
    return DEFAULT_USER_PROFILE
  }
}

/**
 * Persist UserProfile to localStorage only. Does not touch UI or any screens.
 */
export function setUserProfile(profile: Partial<UserProfile>): void {
  if (typeof window === 'undefined') return
  try {
    const current = getUserProfile()
    const next: UserProfile = {
      buyerType: profile.buyerType ?? current.buyerType,
      confidenceScore: clampConfidence(
        profile.confidenceScore !== undefined ? profile.confidenceScore : current.confidenceScore
      ),
      riskTolerance: profile.riskTolerance ?? current.riskTolerance,
      timeHorizon: profile.timeHorizon ?? current.timeHorizon,
      detailPreference: profile.detailPreference ?? current.detailPreference,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // ignore persistence errors
  }
}

/**
 * Copy variant infrastructure — scaffolding only. No text replacements yet.
 *
 * DATA STRUCTURE:
 * - Keyed by screenId (e.g. "results-hero", "quiz-cta") and buyerType.
 * - Values are optional; missing entry = use existing (fallback) copy.
 *
 * DEFAULT BEHAVIOR:
 * - Always fall back to existing copy. Existing copy is the source-of-truth.
 *
 * HELPER:
 * - getCopy(screenId, buyerType, fallbackCopy) → returns variant if one exists
 *   for that screen + buyerType, else fallbackCopy.
 *
 * CONSTRAINTS:
 * - No text replacements in this commit. No visual changes.
 * - Enables future copy swaps safely when variants are added.
 */

import type { BuyerType } from './user-profile'

/** Screen identifier for copy lookup (e.g. "home-hero", "results-summary"). */
export type ScreenId = string

/**
 * Copy variant map: screenId → buyerType → copy string.
 * Empty by default so all lookups fall back to existing copy.
 */
export type CopyVariantMap = Partial<Record<ScreenId, Partial<Record<BuyerType, string>>>>

/**
 * Feature flag: when true, copy personalization is active on the single enabled screen only.
 * Set to false to disable all personalization immediately.
 */
export const COPY_PERSONALIZATION_ENABLED = true

/** No variants by default; only the one activated screen has entries below. */
export const COPY_VARIANTS: CopyVariantMap = {
  // Single low-risk screen: homebuyer hero helper text only (not headline).
  'homebuyer-hero-helper': {
    cautious:
      'Step-by-step guides that take the stress out. No jargon—just clear next steps.',
    optimistic:
      'Simple guides so you can move fast. No confusing jargon—just what you need.',
    analyst:
      'Clear, step-by-step guides with the details you need. No fluff.',
    lifestyle:
      'Guides that fit how you live. Simple steps, no confusing jargon.',
  },
}

/**
 * Returns copy for (screenId, buyerType) if a variant exists; otherwise returns fallbackCopy.
 * Existing copy remains source-of-truth: pass current copy as fallbackCopy and use return value as display.
 *
 * @param screenId - Screen/section identifier
 * @param buyerType - User's buyer type (null = always use fallback)
 * @param fallbackCopy - Existing copy; used when no variant is defined
 * @returns Variant string or fallbackCopy
 */
/**
 * Returns personalized copy when feature flag is on and a variant exists; otherwise fallback.
 * When COPY_PERSONALIZATION_ENABLED is false, always returns fallbackCopy.
 */
export function getCopy(
  screenId: ScreenId,
  buyerType: BuyerType | null,
  fallbackCopy: string
): string {
  if (!COPY_PERSONALIZATION_ENABLED || buyerType == null) return fallbackCopy
  const screenVariants = COPY_VARIANTS[screenId]
  if (screenVariants == null) return fallbackCopy
  const variant = screenVariants[buyerType]
  if (variant == null || variant === '') return fallbackCopy
  return variant
}

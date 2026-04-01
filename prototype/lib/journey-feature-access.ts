/**
 * Compatibility wrapper for journey feature gating.
 * Canonical implementation lives in `lib/journey-features.ts`.
 */

export {
  hasJourneyFeature,
  hasFeature,
  getMinimumTierForJourneyFeature,
  type JourneyFeatureKey,
} from '@/lib/journey-features'


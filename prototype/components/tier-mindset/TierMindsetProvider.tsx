'use client'

/**
 * Product-language provider wrapper for tier + mindset context.
 * Canonical implementation lives in `components/JourneyTierContext.tsx`.
 */

export {
  JourneyTierProvider as TierMindsetProvider,
  useJourneyTier as useTierMindset,
  useJourneyTierOptional as useTierMindsetOptional,
} from '@/components/JourneyTierContext'


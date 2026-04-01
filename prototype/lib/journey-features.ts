/**
 * Journey-specific feature gates for Customized Journey (NestQuest tiers).
 * Use `hasJourneyFeature(tier, key)` in UI; tiers inherit everything from lower levels.
 */

import type { UserTier } from './tiers'
import { tierAtLeast } from './tiers'

export type JourneyFeatureKey =
  | 'readiness_score'
  | 'savings_snapshot'
  | 'budget_sketch'
  | 'phase_guidance_1_2'
  | 'phase_roadmap_full'
  | 'basic_myths_learning'
  | 'learning_library_full'
  | 'premium_deep_dives'
  | 'scripts_limited'
  | 'scripts_full'
  | 'inbox_tasks'
  | 'email_reminders'
  | 'weekly_action_plan'
  | 'smart_nudges'
  | 'inbox_priority_sort'
  | 'early_learning_modules'
  | 'onboarding_call'
  | 'affordability_review'
  | 'credit_improvement_plan'
  | 'document_readiness_review'
  | 'offer_readiness_checklist'
  | 'priority_support'
  | 'human_qa'
  | 'lender_prep_package'
  | 'journey_concierge'
  | 'strategy_sessions'
  | 'offer_writing_prep'
  | 'deep_financial_modeling'
  | 'market_insights'
  | 'unlimited_qa'
  | 'custom_scripts'
  | 'weekly_checkins'
  | 'concierge_plus_badge'

const JOURNEY_FEATURE_MIN_TIER: Record<JourneyFeatureKey, UserTier> = {
  readiness_score: 'foundations',
  savings_snapshot: 'foundations',
  budget_sketch: 'foundations',
  phase_guidance_1_2: 'foundations',
  phase_roadmap_full: 'momentum',
  basic_myths_learning: 'foundations',
  learning_library_full: 'momentum',
  premium_deep_dives: 'navigator_plus',
  scripts_limited: 'foundations',
  scripts_full: 'momentum',
  inbox_tasks: 'foundations',
  email_reminders: 'foundations',
  weekly_action_plan: 'momentum',
  smart_nudges: 'momentum',
  inbox_priority_sort: 'momentum',
  early_learning_modules: 'momentum',
  onboarding_call: 'navigator',
  affordability_review: 'navigator',
  credit_improvement_plan: 'navigator',
  document_readiness_review: 'navigator',
  offer_readiness_checklist: 'navigator',
  priority_support: 'navigator',
  human_qa: 'navigator',
  lender_prep_package: 'navigator',
  journey_concierge: 'navigator_plus',
  strategy_sessions: 'navigator_plus',
  offer_writing_prep: 'navigator_plus',
  deep_financial_modeling: 'navigator_plus',
  market_insights: 'navigator_plus',
  unlimited_qa: 'navigator_plus',
  custom_scripts: 'navigator_plus',
  weekly_checkins: 'navigator_plus',
  concierge_plus_badge: 'navigator_plus',
}

export function hasJourneyFeature(userTier: UserTier, featureKey: JourneyFeatureKey): boolean {
  const min = JOURNEY_FEATURE_MIN_TIER[featureKey]
  return tierAtLeast(userTier, min)
}

/** Alias for `hasJourneyFeature` (NestQuest journey UI convention). */
export const hasFeature = hasJourneyFeature

export function getMinimumTierForJourneyFeature(key: JourneyFeatureKey): UserTier {
  return JOURNEY_FEATURE_MIN_TIER[key]
}

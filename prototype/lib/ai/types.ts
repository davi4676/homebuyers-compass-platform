/**
 * Normalized buyer shape for Compass / proactive AI.
 * Map from quiz snapshot, auth user, or journey state at the call site.
 */
export type CompassUser = {
  firstName?: string | null
  currentPhase?: string | null
  phaseNumber?: string | null
  completionPercent?: number | null
  journeyStartDate?: string | Date | null
  currentSavings?: number | null
  savingsGoal?: number | null
  targetHomePrice?: number | null
  creditScoreRange?: string | null
  householdIncome?: number | null
  estimatedDTI?: number | null
  tier?: string | null
  budgetSketchComplete?: boolean | null
  targetMarketMedianPrice?: number | null
}

export type JourneyProfile = {
  firstName: string
  currentPhase: string
  phaseNumber: string
  completionPercent: number
  daysSinceStart: number
  savings: number
  savingsGoal: number
  targetHomePrice: number
  creditScoreRange: string
  householdIncome: number
  dti: number
  tier: string
}

export type JourneyBehavior = {
  sessionCount: number
  lastVisit: string | null
  daysSinceLastVisit: number
  streak: number | null
  completedActions: unknown
  currentActionStarted: string | null
  stuckOnCurrentPhase: boolean
  budgetSketchComplete: boolean
  lastPageViewed: string | null
}

export type JourneyMarket = {
  thirtyYearRate: number
  rateChangeSinceLastVisit: number
  localMedianPrice: number
}

export type JourneyContext = {
  profile: JourneyProfile
  behavior: JourneyBehavior
  market: JourneyMarket
}

export type TriggerResult =
  | { shouldShow: true; triggerType: string; suggestedPrompt: string }
  | { shouldShow: false; triggerType: 'none'; suggestedPrompt: '' }

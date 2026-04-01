/**
 * Tier- and context-aware suggested next actions for Customized Journey.
 */

import type { UserTier } from '@/lib/tiers'
import { TIER_DEFINITIONS, getNextTier } from '@/lib/tiers'
import type { JourneyTab } from '@/lib/journey-nav-tabs'
import { hasJourneyFeature } from '@/lib/journey-features'

export type NextStepPillar = 'savings' | 'funds' | 'alternative' | 'neutral'

export type NextStepAction = {
  id: string
  label: string
  hint?: JourneyTab
  pillar?: NextStepPillar
}

export interface NextStepEngineInput {
  userTier: UserTier
  effectiveTier: UserTier
  currentPhaseOrder: number
  snapshotExists: boolean
  budgetSketchDirty: boolean
  currentTab?: JourneyTab | null
  completedPhasesApprox: number
}

export interface NextStepUpsell {
  message: string
  nextTier: UserTier
  nextTierName: string
  mindset: string
}

export interface NextStepEngineResult {
  steps: { id: string; label: string; tab?: JourneyTab }[]
  upsell: NextStepUpsell | null
}

export type NextStepEngineBundle = {
  actions: NextStepAction[]
  upsell: { targetTier: UserTier; label: string } | null
}

function tierLine(t: UserTier): NextStepUpsell | null {
  const next = getNextTier(t)
  if (!next) return null
  const def = TIER_DEFINITIONS[next]
  const messages: Record<UserTier, string> = {
    foundations: 'Momentum unlocks your full roadmap.',
    momentum: 'Navigator is for buyers who want expert review and guidance.',
    navigator: 'Navigator+ is for buyers who want a partner every step of the way.',
    navigator_plus: '',
  }
  const m = messages[t]
  if (!m) return null
  return {
    message: m,
    nextTier: next,
    nextTierName: def.name,
    mindset: def.mindset,
  }
}

export function getNextStepSuggestions(input: NextStepEngineInput): NextStepEngineResult {
  const t = input.effectiveTier
  const steps: NextStepEngineResult['steps'] = []

  if (t === 'foundations') {
    steps.push({
      id: 'snapshot',
      label: input.snapshotExists ? 'Review your snapshot' : 'Run your savings snapshot',
      tab: 'overview',
    })
    steps.push({ id: 'budget', label: 'Edit your budget sketch', tab: 'budget' })
    steps.push({ id: 'learn', label: 'Learn the basics', tab: 'learn' })
    return {
      steps: steps.slice(0, 3),
      upsell: tierLine('foundations'),
    }
  }

  if (t === 'momentum') {
    if (hasJourneyFeature(t, 'weekly_action_plan')) {
      steps.push({ id: 'weekly', label: 'Complete your weekly action plan', tab: 'phase' })
    }
    steps.push({ id: 'scripts', label: 'Review scripts for your current phase', tab: 'library' })
    if (hasJourneyFeature(t, 'smart_nudges')) {
      steps.push({ id: 'nudges', label: 'Check your smart nudges', tab: 'inbox' })
    }
    if (steps.length < 2) {
      steps.push({ id: 'phase', label: 'Advance your current phase', tab: 'phase' })
    }
    return {
      steps: steps.slice(0, 3),
      upsell: tierLine('momentum'),
    }
  }

  if (t === 'navigator') {
    steps.push({ id: 'onboarding', label: 'Schedule your onboarding call', tab: 'upgrades' })
    steps.push({ id: 'docs', label: 'Upload documents for review', tab: 'inbox' })
    steps.push({ id: 'afford', label: 'Get your affordability analysis', tab: 'budget' })
    return {
      steps: steps.slice(0, 3),
      upsell: tierLine('navigator'),
    }
  }

  steps.push({ id: 'checkin', label: 'Book your weekly check-in', tab: 'upgrades' })
  steps.push({ id: 'script', label: 'Request a custom script', tab: 'library' })
  steps.push({ id: 'qa', label: 'Ask anything — unlimited Q&A', tab: 'inbox' })
  return { steps: steps.slice(0, 3), upsell: null }
}

/** Deprioritize suggestions for the tab the user is already on. */
export function prioritizeNextSteps(
  result: NextStepEngineResult,
  currentTab: JourneyTab | null | undefined
): NextStepEngineResult {
  if (!currentTab || result.steps.length < 2) return result
  const other = result.steps.filter((s) => s.tab !== currentTab)
  const here = result.steps.filter((s) => s.tab === currentTab)
  return { ...result, steps: [...other, ...here].slice(0, 3) }
}

export function buildNextStepsForJourney(input: NextStepEngineInput): NextStepEngineResult {
  const base = getNextStepSuggestions(input)
  return prioritizeNextSteps(base, input.currentTab)
}

/**
 * Contextual engine used across Overview, Phase, and Inbox.
 * Uses `effectiveTier` when set (preview), else `userTier`.
 */
export function runNextStepEngineWithContext(ctx: {
  userTier: UserTier
  effectiveTier?: UserTier
  currentPhaseOrder: number
  mindset: string
  snapshot: unknown | null
  recentActivity: {
    budgetSketchEdited: boolean
    docRelatedTaskChecked: boolean
    lastTab: JourneyTab
  }
}): NextStepEngineBundle {
  const effective = ctx.effectiveTier ?? ctx.userTier
  const base = buildNextStepsForJourney({
    userTier: ctx.userTier,
    effectiveTier: effective,
    currentPhaseOrder: ctx.currentPhaseOrder,
    snapshotExists: ctx.snapshot != null,
    budgetSketchDirty: ctx.recentActivity.budgetSketchEdited,
    currentTab: ctx.recentActivity.lastTab,
    completedPhasesApprox: 0,
  })

  const estByTier: Record<UserTier, { savings: number; funds: number; alt: number }> = {
    foundations: { savings: 42, funds: 1500, alt: 65 },
    momentum: { savings: 125, funds: 8000, alt: 180 },
    navigator: { savings: 210, funds: 12500, alt: 260 },
    navigator_plus: { savings: 320, funds: 18000, alt: 340 },
  }
  const est = estByTier[effective]

  const actions: NextStepAction[] = [
    {
      id: 'savings-action',
      label: ctx.recentActivity.budgetSketchEdited
        ? `Lock your budget sketch edits to keep roughly $${est.savings}/mo in cash-flow room`
        : `Tune one budget line item to target about $${est.savings}/mo in monthly savings`,
      hint: 'budget',
      pillar: 'savings',
    },
    {
      id: 'funding-action',
      label: `Run funding matches and check eligibility for up to ~$${est.funds.toLocaleString()} in programs`,
      hint: 'library',
      pillar: 'funds',
    },
    {
      id: 'alternative-action',
      label:
        effective === 'foundations'
          ? `Preview one alternative structure (ARM or buydown) that may save about $${est.alt}/mo`
          : `Compare ARM, buydown, and concession scenarios to target about $${est.alt}/mo improvement`,
      hint: 'learn',
      pillar: 'alternative',
    },
  ]

  if (ctx.recentActivity.docRelatedTaskChecked && effective !== 'navigator_plus') {
    actions[1] = {
      id: 'funding-doc-review',
      label: 'Have a specialist review your funding docs before submission to avoid missed assistance',
      hint: 'upgrades',
      pillar: 'funds',
    }
  }

  const upsell = base.upsell
    ? {
        targetTier: base.upsell.nextTier,
        label: base.upsell.message,
      }
    : null

  return { actions, upsell }
}

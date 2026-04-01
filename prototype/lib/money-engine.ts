/**
 * NestQuest MoneyEngine — savings-forward, funds-finding, alternative-solutions modeling.
 * Estimates are illustrative placeholders for UX; not financial advice.
 */

import { formatCurrency } from '@/lib/calculations'
import type { UserSnapshot } from '@/lib/user-snapshot'
import type { UserTier } from '@/lib/tiers'
import { TIER_DEFINITIONS, tierAtLeast } from '@/lib/tiers'

export type MoneyCategory = 'savings' | 'funds' | 'alternative'

export type MoneyOpportunity = {
  id: string
  title: string
  description: string
  category: MoneyCategory
  estimatedValue: number
  minTier?: UserTier
}

export type PhaseMoneyTriple = {
  savings: MoneyOpportunity
  funding: MoneyOpportunity
  alternative: MoneyOpportunity
}

const tierDepth = (t: UserTier) => (t === 'foundations' ? 1 : t === 'momentum' ? 2 : t === 'navigator' ? 3 : 4)

export function formatMoneyLabel(n: number): string {
  return formatCurrency(n)
}

export function getSavingsOpportunities(userTier: UserTier): MoneyOpportunity[] {
  const d = tierDepth(userTier)
  const base: MoneyOpportunity[] = [
    {
      id: 'lower-pmi',
      title: 'Lower PMI',
      description: 'Optimize down payment and loan structure to reduce or drop PMI sooner.',
      category: 'savings',
      estimatedValue: Math.round(1_200 + d * 800),
    },
    {
      id: 'lower-payment',
      title: 'Lower monthly payment',
      description: 'Tune PITI + reserves so your payment matches sustainable cash flow.',
      category: 'savings',
      estimatedValue: Math.round(2_400 + d * 1_200),
      minTier: 'momentum',
    },
    {
      id: 'closing-costs',
      title: 'Lower closing costs',
      description: 'Compare LE line items and negotiate lender fees and third-party services.',
      category: 'savings',
      estimatedValue: Math.round(1_800 + d * 600),
    },
    {
      id: 'negotiation',
      title: 'Negotiation wins',
      description: 'Inspection credits, price adjustments, and seller-paid costs.',
      category: 'savings',
      estimatedValue: Math.round(3_500 + d * 1_500),
      minTier: 'momentum',
    },
    {
      id: 'credit-score',
      title: 'Credit score improvements',
      description: 'Small score moves can materially change rate and approval.',
      category: 'savings',
      estimatedValue: Math.round(900 + d * 400),
    },
    {
      id: 'budget-opt',
      title: 'Budget optimization',
      description: 'Align lender max with your real-life comfortable max.',
      category: 'savings',
      estimatedValue: Math.round(1_100 + d * 500),
    },
  ]
  return base.filter((o) => !o.minTier || tierAtLeast(userTier, o.minTier))
}

export function getFundingOpportunities(userTier: UserTier): MoneyOpportunity[] {
  const d = tierDepth(userTier)
  return [
    {
      id: 'grants',
      title: 'Grants & down payment assistance',
      description: 'Local, state, and nonprofit programs matched to your situation.',
      category: 'funds',
      estimatedValue: Math.round(8_000 + d * 4_000),
    },
    {
      id: 'credits',
      title: 'Tax credits & lender credits',
      description: 'Credits that reduce cash-to-close when structured correctly.',
      category: 'funds',
      estimatedValue: Math.round(2_000 + d * 1_500),
      minTier: 'momentum',
    },
    {
      id: 'employer',
      title: 'Employer programs',
      description: 'Relocation, EAP, and employer-assisted homeownership benefits.',
      category: 'funds',
      estimatedValue: Math.round(3_500 + d * 2_000),
      minTier: 'navigator',
    },
    {
      id: 'gift',
      title: 'Gift funds & documented gifts',
      description: 'Properly sourced gifts that satisfy underwriting.',
      category: 'funds',
      estimatedValue: Math.round(5_000 + d * 2_500),
    },
    {
      id: 'incentives',
      title: 'Lender incentives',
      description: 'Rate buydowns or credits in exchange for relationship pricing.',
      category: 'funds',
      estimatedValue: Math.round(1_500 + d * 1_000),
      minTier: 'momentum',
    },
  ].filter((o) => !o.minTier || tierAtLeast(userTier, o.minTier))
}

export function getAlternativeSolutions(userTier: UserTier): MoneyOpportunity[] {
  const d = tierDepth(userTier)
  return [
    {
      id: 'buydown',
      title: 'Permanent rate buydown',
      description: 'Points and seller concessions to buy a lower rate.',
      category: 'alternative',
      estimatedValue: Math.round(2_200 + d * 900),
    },
    {
      id: 'temp-buydown',
      title: 'Temporary buydown',
      description: 'Lower payments in early years while income ramps.',
      category: 'alternative',
      estimatedValue: Math.round(1_800 + d * 700),
      minTier: 'momentum',
    },
    {
      id: 'arm',
      title: 'ARM options',
      description: 'Shorter fixed period when you have a clear exit plan.',
      category: 'alternative',
      estimatedValue: Math.round(1_400 + d * 600),
      minTier: 'momentum',
    },
    {
      id: 'co-buy',
      title: 'Co-buying',
      description: 'Shared ownership models that split payment and equity.',
      category: 'alternative',
      estimatedValue: Math.round(4_000 + d * 2_000),
      minTier: 'navigator',
    },
    {
      id: 'house-hack',
      title: 'House hacking',
      description: 'Rent part of the property to offset housing cost.',
      category: 'alternative',
      estimatedValue: Math.round(6_000 + d * 3_000),
    },
    {
      id: 'seller-conc',
      title: 'Seller concessions',
      description: 'Closing cost contributions and temporary buydowns from seller.',
      category: 'alternative',
      estimatedValue: Math.round(5_500 + d * 2_500),
    },
    {
      id: 'reno-loan',
      title: 'Renovation loans',
      description: 'Roll repairs into purchase when appraisal supports it.',
      category: 'alternative',
      estimatedValue: Math.round(3_000 + d * 1_500),
      minTier: 'navigator',
    },
  ].filter((o) => !o.minTier || tierAtLeast(userTier, o.minTier))
}

export function aggregateCategoryTotals(userTier: UserTier): Record<
  MoneyCategory,
  { items: MoneyOpportunity[]; totalValue: number }
> {
  const savings = getSavingsOpportunities(userTier)
  const funds = getFundingOpportunities(userTier)
  const alt = getAlternativeSolutions(userTier)
  return {
    savings: {
      items: savings,
      totalValue: savings.reduce((s, i) => s + i.estimatedValue, 0),
    },
    funds: {
      items: funds,
      totalValue: funds.reduce((s, i) => s + i.estimatedValue, 0),
    },
    alternative: {
      items: alt,
      totalValue: alt.length * 2_500,
    },
  }
}

export function estimateTrackerTotals(
  snapshot: UserSnapshot | null,
  userTier: UserTier,
  phaseOrder: number
): {
  savingsFoundSoFar: number
  fundsFoundSoFar: number
  altSolutionsIdentified: number
} {
  const readiness = snapshot ? snapshot.readiness.total / 100 : 0.45
  const incomeFactor = snapshot ? Math.min(1.4, Math.max(0.85, snapshot.quiz.income / 75_000)) : 1
  const phaseBoost = 1 + phaseOrder * 0.04

  const savingsFoundSoFar = Math.round(
    (4_500 + readiness * 22_000) * incomeFactor * phaseBoost * (0.85 + tierDepth(userTier) * 0.06)
  )
  const tierFunds: Record<UserTier, number> = {
    foundations: 7_500,
    momentum: 14_000,
    navigator: 22_000,
    navigator_plus: 32_000,
  }
  const fundsFoundSoFar = Math.round(tierFunds[userTier] * (0.9 + readiness * 0.35) * phaseBoost)
  const altSolutionsIdentified =
    3 +
    phaseOrder +
    (tierAtLeast(userTier, 'momentum') ? 2 : 0) +
    (tierAtLeast(userTier, 'navigator') ? 2 : 0) +
    (tierAtLeast(userTier, 'navigator_plus') ? 3 : 0) +
    (snapshot && snapshot.readiness.total >= 55 ? 1 : 0)

  return { savingsFoundSoFar, fundsFoundSoFar, altSolutionsIdentified }
}

function phaseTriple(
  phaseOrder: number,
  userTier: UserTier
): PhaseMoneyTriple {
  const d = tierDepth(userTier)
  const map: Record<number, PhaseMoneyTriple> = {
    1: {
      savings: {
        id: 'ph1-sav',
        title: 'Credit & debt tuning',
        description: 'Score and DTI fixes that typically lower rate and PMI.',
        category: 'savings',
        estimatedValue: Math.round(3_200 + d * 900),
      },
      funding: {
        id: 'ph1-fund',
        title: 'First-time buyer grants',
        description: 'Programs in your city and state you may not know about yet.',
        category: 'funds',
        estimatedValue: Math.round(12_000 + d * 3_000),
      },
      alternative: {
        id: 'ph1-alt',
        title: 'Timing your purchase',
        description: 'Seasonality and rate windows that stretch affordability.',
        category: 'alternative',
        estimatedValue: Math.round(2_100 + d * 500),
      },
    },
    2: {
      savings: {
        id: 'ph2-sav',
        title: 'Budget tuning vs. lender max',
        description: 'Close the gap between “approved” and “comfortable.”',
        category: 'savings',
        estimatedValue: Math.round(4_100 + d * 1_100),
      },
      funding: {
        id: 'ph2-fund',
        title: 'Employer & local programs',
        description: 'Workplace benefits and municipal assistance.',
        category: 'funds',
        estimatedValue: Math.round(9_000 + d * 2_500),
        minTier: 'momentum',
      },
      alternative: {
        id: 'ph2-alt',
        title: 'Co-buying structures',
        description: 'Pair buying with a partner or family to split costs.',
        category: 'alternative',
        estimatedValue: Math.round(5_500 + d * 1_500),
        minTier: 'navigator',
      },
    },
    3: {
      savings: {
        id: 'ph3-sav',
        title: 'Lender shopping',
        description: 'Apples-to-apples LE comparisons — often the biggest single save.',
        category: 'savings',
        estimatedValue: Math.round(6_000 + d * 2_000),
      },
      funding: {
        id: 'ph3-fund',
        title: 'Lender credits',
        description: 'Trading slightly higher rate for closing help when it nets out.',
        category: 'funds',
        estimatedValue: Math.round(4_200 + d * 1_200),
      },
      alternative: {
        id: 'ph3-alt',
        title: 'ARM & temporary buydown',
        description: 'Structure-first options when you have a clear 3–7 year plan.',
        category: 'alternative',
        estimatedValue: Math.round(3_800 + d * 1_000),
        minTier: 'momentum',
      },
    },
    4: {
      savings: {
        id: 'ph4-sav',
        title: 'Offer & inspection strategy',
        description: 'Price, credits, and repair rounds that protect cash.',
        category: 'savings',
        estimatedValue: Math.round(8_500 + d * 2_500),
      },
      funding: {
        id: 'ph4-fund',
        title: 'Seller concessions',
        description: 'Seller-paid closing costs and buydowns within limits.',
        category: 'funds',
        estimatedValue: Math.round(7_000 + d * 2_000),
      },
      alternative: {
        id: 'ph4-alt',
        title: 'Permanent buydown',
        description: 'Seller or lender buydown that lowers P&I long term.',
        category: 'alternative',
        estimatedValue: Math.round(4_400 + d * 1_200),
      },
    },
    5: {
      savings: {
        id: 'ph5-sav',
        title: 'Underwriting efficiency',
        description: 'Clean conditions to avoid costly delays or float-down misses.',
        category: 'savings',
        estimatedValue: Math.round(2_800 + d * 900),
      },
      funding: {
        id: 'ph5-fund',
        title: 'Late-stage credits',
        description: 'Small credits that can still move before funding.',
        category: 'funds',
        estimatedValue: Math.round(2_200 + d * 800),
        minTier: 'momentum',
      },
      alternative: {
        id: 'ph5-alt',
        title: 'Float management',
        description: 'Extension vs. re-lock decisions tied to your close date.',
        category: 'alternative',
        estimatedValue: Math.round(3_100 + d * 1_100),
        minTier: 'navigator',
      },
    },
    6: {
      savings: {
        id: 'ph6-sav',
        title: 'Closing fee checks',
        description: 'Catch duplicate or incorrect fees on the CD.',
        category: 'savings',
        estimatedValue: Math.round(1_900 + d * 700),
      },
      funding: {
        id: 'ph6-fund',
        title: 'Seller repair credits → closing',
        description: 'Apply agreed credits correctly at closing.',
        category: 'funds',
        estimatedValue: Math.round(4_500 + d * 1_500),
      },
      alternative: {
        id: 'ph6-alt',
        title: 'Possession timing',
        description: 'Rent-backs or early occupancy that reduce move friction.',
        category: 'alternative',
        estimatedValue: Math.round(2_600 + d * 900),
      },
    },
    7: {
      savings: {
        id: 'ph7-sav',
        title: 'Refi watch',
        description: 'Future rate drops that could reduce payment post-close.',
        category: 'savings',
        estimatedValue: Math.round(5_000 + d * 2_000),
      },
      funding: {
        id: 'ph7-fund',
        title: 'Utility & move rebates',
        description: 'Local rebates and employer perks after move-in.',
        category: 'funds',
        estimatedValue: Math.round(1_200 + d * 400),
      },
      alternative: {
        id: 'ph7-alt',
        title: 'Accessory income',
        description: 'Renting a room or ADU within HOA/rules.',
        category: 'alternative',
        estimatedValue: Math.round(7_500 + d * 3_000),
        minTier: 'momentum',
      },
    },
  }
  return map[phaseOrder] ?? map[1]
}

export function getPhaseMoneyOpportunities(phaseOrder: number, userTier: UserTier): PhaseMoneyTriple {
  const t = phaseTriple(Math.max(1, Math.min(7, phaseOrder)), userTier)
  return {
    savings: t.savings,
    funding: {
      ...t.funding,
      estimatedValue:
        t.funding.minTier && !tierAtLeast(userTier, t.funding.minTier) ? 0 : t.funding.estimatedValue,
    },
    alternative: {
      ...t.alternative,
      estimatedValue:
        t.alternative.minTier && !tierAtLeast(userTier, t.alternative.minTier)
          ? 0
          : t.alternative.estimatedValue,
    },
  }
}

/** Full-value phase row (Navigator+ depth) for lock/upsell copy. */
export function getPhaseMoneyBlueprint(phaseOrder: number): PhaseMoneyTriple {
  return phaseTriple(Math.max(1, Math.min(7, phaseOrder)), 'navigator_plus')
}

export function isMoneyOppLockedForTier(opp: MoneyOpportunity, userTier: UserTier): boolean {
  return Boolean(opp.minTier && !tierAtLeast(userTier, opp.minTier))
}

export type NextMoneyPick = {
  category: MoneyCategory
  title: string
  description: string
  estimatedValue: number
}

export function getNextMoneyOpportunity(
  userTier: UserTier,
  phaseOrder: number,
  snapshot: UserSnapshot | null
): NextMoneyPick {
  const triple = getPhaseMoneyOpportunities(phaseOrder, userTier)
  const rot = (phaseOrder + (snapshot ? Math.round(snapshot.readiness.total / 20) : 0)) % 3
  const picks: NextMoneyPick[] = [
    {
      category: 'savings',
      title: triple.savings.title,
      description: triple.savings.description,
      estimatedValue: triple.savings.estimatedValue,
    },
    {
      category: 'funds',
      title: triple.funding.title,
      description: triple.funding.description,
      estimatedValue: triple.funding.estimatedValue,
    },
    {
      category: 'alternative',
      title: triple.alternative.title,
      description: triple.alternative.description,
      estimatedValue: triple.alternative.estimatedValue,
    },
  ]
  return picks[rot] ?? picks[0]
}

/** Comparison table: Money Power row labels per tier. */
export function getMoneyPowerLabel(tier: UserTier): string {
  if (tier === 'foundations') return 'Basic'
  if (tier === 'momentum') return 'Expanded'
  if (tier === 'navigator') return 'Expert'
  return 'Maximum'
}

export function getTierMoneyUnlockCopy(tier: UserTier): {
  savings: string
  funds: string
  alternative: string
} {
  if (tier === 'foundations') {
    return {
      savings: 'Early savings scan and budget-aligned opportunities',
      funds: 'Core grant and DPA awareness',
      alternative: 'Intro to creative structures (read-only previews)',
    }
  }
  if (tier === 'momentum') {
    return {
      savings: 'Full savings playbook tied to each phase',
      funds: 'Matched funding programs and lender incentives',
      alternative: 'ARM, buydown, and timing strategies unlocked',
    }
  }
  if (tier === 'navigator') {
    return {
      savings: 'Expert review of every major savings lever',
      funds: 'Hands-on funding sourcing and document alignment',
      alternative: 'Custom alternative paths with human Q&A',
    }
  }
  return {
    savings: 'Concierge maximization across negotiations and fees',
    funds: 'Pursue every source — gifts, rebates, employer, locality',
    alternative: 'Bespoke affordability architecture and weekly check-ins',
  }
}

/** Budget sketch: illustrative monthly savings if user trims lines (placeholder). */
export function estimateMonthlySavingsFromSketchTuning(snapshot: UserSnapshot | null): number {
  if (!snapshot) return 85
  const r = snapshot.readiness.total
  return Math.round(65 + (r / 100) * 160)
}

export function buildMoneyUpsellLine(nextTier: UserTier, category: MoneyCategory, fundsHighlight: number): string {
  const def = TIER_DEFINITIONS[nextTier]
  const mindset = def.mindset.replace(/^I'm /, 'buyers who ').replace(/\.$/, '')
  if (category === 'savings') {
    return `${def.name} is for ${mindset} — unlock deeper savings reviews and phase-by-phase saves.`
  }
  if (category === 'funds') {
    return `${def.name} is for ${mindset} and access to about ${formatCurrency(fundsHighlight)} in funding programs (illustrative).`
  }
  return `${def.name} is for ${mindset} — unlock creative affordability strategies with guided support.`
}

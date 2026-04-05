/**
 * NestQuest tier system (Option A): Foundations → Momentum → Navigator → Navigator+
 */

export type UserTier = 'foundations' | 'momentum' | 'navigator' | 'navigator_plus'

export const TIER_ORDER: UserTier[] = ['foundations', 'momentum', 'navigator', 'navigator_plus']

export const TIER_ORDER_ACCESS: UserTier[] = TIER_ORDER

export function normalizeUserTier(raw: string | null | undefined): UserTier {
  if (!raw) return 'foundations'
  if (raw in TIER_DEFINITIONS) return raw as UserTier
  return 'foundations'
}

export function tierIndex(tier: UserTier): number {
  const i = TIER_ORDER.indexOf(tier)
  return i === -1 ? 0 : i
}

export function tierAtLeast(userTier: UserTier, minimum: UserTier): boolean {
  return tierIndex(userTier) >= tierIndex(minimum)
}

export interface TierFeatures {
  quiz: {
    questionCount: number
    conditionalQuestions: boolean
    detailedBreakdown: boolean
  }
  costBreakdown: {
    lineByLine: boolean
    explanations: boolean
    tooltips: boolean
    exportPDF: boolean
    watermark: boolean
  }
  hosa: {
    version: 'basic' | 'standard' | 'pro'
    optimizationScore: boolean
    /** Foundations: show headline score only; full factor breakdown requires Momentum+. */
    savingsScorePreview?: boolean
    savingsOpportunities: number
    actionPlan: boolean
    weekByWeekPlan: boolean
    predictions: boolean
    monteCarlo: boolean
  }
  /** Assistance tab & DPA list: max programs shown before upgrade (Foundations = 3). */
  assistancePrograms: {
    maxMatchedInJourney: number
  }
  /** Budget Sketch: count of editable housing lines (Foundations = 3 core lines). */
  budgetSketch: {
    maxEditableLineItems: number
  }
  tools: {
    calculators: string[]
    lenderComparison: boolean
    dealAnalyzer: boolean
    documentVault: boolean
    timelineOrchestrator: boolean
  }
  gamification: {
    xp: boolean
    badges: boolean
    streaks: boolean
    leaderboard: boolean
    levels: boolean
  }
  support: {
    email: boolean
    chat: boolean
    phone: boolean
    expertAccess: boolean
    responseTime: number
  }
  content: {
    blog: boolean
    guides: boolean
    scripts: number
    templates: boolean
  }
  aiAssistant: {
    enabled: boolean
    tier: 'none' | 'basic' | 'standard' | 'pro' | 'unlimited'
    dailyMessageLimit: number
    contextAwareness: boolean
    stepByStepGuidance: boolean
    riskWarnings: boolean
    financialAdvice: boolean
    documentChecklist: boolean
    expertEscalation: boolean
    proactiveNotifications: boolean
  }
  personalizedJourney: boolean
  mortgageShopping: boolean
  downPaymentOptimizer: {
    enabled: boolean
    tier: 'basic' | 'premium' | 'pro'
    aiOptimization: boolean
    automatedNegotiation: boolean
    documentAutomation: boolean
  }
  crowdsourcedDownPayment: {
    enabled: boolean
    accessLevel: 'none' | 'basic' | 'extended' | 'professional'
    maxFundingAmount: number
    regulatoryCompliance: boolean
    campaignManagement: boolean
    communityActivation: boolean
  }
}

export type TierCardBadge = 'most_popular' | 'premium'

export interface TierDefinition {
  id: UserTier
  name: string
  positioning: string
  mindset: string
  differentiators: {
    savings: string
    funds: string
    alternatives: string
    serviceLevel: string
  }
  microcopy: string
  badge: TierCardBadge | null
  price: {
    oneTime?: number
    monthly?: number
    /** Placeholder range label for marketing, e.g. "$9–$19/mo" */
    displayMonthly?: string
    /** Shown on upgrade page when One-Time billing is selected (e.g. "$119"). */
    displayOneTime?: string
    /** Annual prepay in cents (typically 20% off 12× monthly). */
    annual?: number
    /** e.g. "$278/yr" */
    displayAnnual?: string
    /** Buyer context line for one-time offer (vs monthly on the same card). */
    oneTimeBlurb?: string
    /** Shown when Annual billing is selected. */
    annualBlurb?: string
  }
  description: string
  features: TierFeatures
  limitations: string[]
  upgradePrompts: string[]
  /** Human-facing bullets for pricing / comparison tables */
  journeyHighlights: string[]
}

export const TIER_DEFINITIONS: Record<UserTier, TierDefinition> = {
  foundations: {
    id: 'foundations',
    name: 'Foundations',
    positioning: 'Get Grounded',
    mindset: "I'm exploring and getting grounded.",
    differentiators: {
      savings: 'Basic early savings',
      funds: 'Basic eligibility checks',
      alternatives: 'High-level overview',
      serviceLevel: 'Self-guided',
    },
    microcopy:
      'Start your journey with confidence. Get your readiness score, savings snapshot, and the tools to begin.',
    badge: null,
    price: { displayMonthly: 'Free', displayOneTime: 'Free' },
    description: 'Explore your options and see where you can save.',
    journeyHighlights: [
      'HOSA Savings Score (preview — full breakdown with Momentum)',
      '3 matched DPA programs (full list with Momentum)',
      'Affordability calculator via your savings snapshot',
      'Closing cost estimate & savings snapshot',
      'PDF export (watermarked)',
      'Blog & starter learning',
      'XP, starter badges & streaks (levels & leaderboard with Momentum)',
    ],
    features: {
      quiz: { questionCount: 8, conditionalQuestions: false, detailedBreakdown: false },
      costBreakdown: {
        lineByLine: false,
        explanations: false,
        tooltips: false,
        exportPDF: true,
        watermark: true,
      },
      hosa: {
        version: 'basic',
        optimizationScore: false,
        savingsScorePreview: true,
        savingsOpportunities: 3,
        actionPlan: false,
        weekByWeekPlan: false,
        predictions: false,
        monteCarlo: false,
      },
      assistancePrograms: {
        maxMatchedInJourney: 3,
      },
      budgetSketch: {
        /** Line-by-line Budget Sketch is a Momentum+ tool; free tier uses snapshot affordability only. */
        maxEditableLineItems: 0,
      },
      tools: {
        calculators: ['affordability'],
        lenderComparison: false,
        dealAnalyzer: false,
        documentVault: false,
        timelineOrchestrator: false,
      },
      gamification: { xp: true, badges: true, streaks: true, leaderboard: false, levels: false },
      support: { email: false, chat: false, phone: false, expertAccess: false, responseTime: Infinity },
      content: { blog: true, guides: false, scripts: 0, templates: false },
      aiAssistant: {
        enabled: false,
        tier: 'none',
        dailyMessageLimit: 0,
        contextAwareness: false,
        stepByStepGuidance: false,
        riskWarnings: false,
        financialAdvice: false,
        documentChecklist: false,
        expertEscalation: false,
        proactiveNotifications: false,
      },
      personalizedJourney: false,
      mortgageShopping: false,
      downPaymentOptimizer: {
        enabled: true,
        tier: 'basic',
        aiOptimization: false,
        automatedNegotiation: false,
        documentAutomation: false,
      },
      crowdsourcedDownPayment: {
        enabled: false,
        accessLevel: 'none',
        maxFundingAmount: 0,
        regulatoryCompliance: false,
        campaignManagement: false,
        communityActivation: false,
      },
    },
    limitations: [
      'Results expire after 30 days',
      'No action plan',
      'HOSA: preview only (no factor breakdown)',
      'DPA: 3 programs shown (full list requires Momentum)',
      'Budget Sketch line editor requires Momentum (affordability snapshot is free)',
      'Watermarked PDFs',
      'No full 7-phase roadmap',
      'No AI assistant access',
    ],
    upgradePrompts: [
      'Buyers who unlock the full roadmap before pre-approval save an average of $2,400 more — get your weekly plan and scripts now. [See My Roadmap →]',
      'Stop guessing which step matters this week — Momentum prioritizes your inbox and nudges so you don’t miss deadlines that cost real money. [Get My Plan →]',
    ],
  },
  momentum: {
    id: 'momentum',
    name: 'Momentum',
    positioning: 'Get Clarity & Structure',
    mindset: "I'm making real progress and want clarity.",
    differentiators: {
      savings: 'Full roadmap savings',
      funds: 'Full funding match engine',
      alternatives: 'Full strategy library',
      serviceLevel: 'Structured guidance',
    },
    microcopy:
      'Move forward with clarity. Unlock the full roadmap, scripts, checklists, and weekly action plans.',
    badge: 'most_popular',
    price: {
      monthly: 2900,
      displayMonthly: '$29/mo',
      oneTime: 11900,
      displayOneTime: '$119',
      annual: 27800,
      displayAnnual: '$278/yr',
      oneTimeBlurb:
        'Roughly 4–5 months of value at the monthly rate — best if you’re closing within 90 days',
      annualBlurb: '$23/mo, billed annually — save $70/yr',
    },
    description: 'Actively preparing to buy in 3–12 months.',
    journeyHighlights: [
      'Everything in Foundations',
      'Full 7-phase roadmap',
      'All scripts & checklists',
      'Weekly action plan',
      'Smart nudges',
      'Priority inbox sorting',
      'Early access to new learning modules',
    ],
    features: {
      quiz: { questionCount: 12, conditionalQuestions: true, detailedBreakdown: true },
      costBreakdown: {
        lineByLine: true,
        explanations: true,
        tooltips: true,
        exportPDF: true,
        watermark: false,
      },
      hosa: {
        version: 'standard',
        optimizationScore: true,
        savingsScorePreview: false,
        savingsOpportunities: 10,
        actionPlan: true,
        weekByWeekPlan: true,
        predictions: true,
        monteCarlo: false,
      },
      assistancePrograms: {
        maxMatchedInJourney: Number.POSITIVE_INFINITY,
      },
      budgetSketch: {
        maxEditableLineItems: 6,
      },
      tools: {
        calculators: ['affordability', 'dti', 'down-payment', 'pmi', 'rent-vs-buy'],
        lenderComparison: true,
        dealAnalyzer: false,
        documentVault: false,
        timelineOrchestrator: false,
      },
      gamification: { xp: true, badges: true, streaks: false, leaderboard: false, levels: true },
      support: { email: true, chat: false, phone: false, expertAccess: false, responseTime: 48 },
      content: { blog: true, guides: true, scripts: 12, templates: true },
      aiAssistant: {
        enabled: true,
        tier: 'basic',
        dailyMessageLimit: 20,
        contextAwareness: true,
        stepByStepGuidance: true,
        riskWarnings: true,
        financialAdvice: false,
        documentChecklist: false,
        expertEscalation: false,
        proactiveNotifications: false,
      },
      personalizedJourney: true,
      mortgageShopping: true,
      downPaymentOptimizer: {
        enabled: true,
        tier: 'premium',
        aiOptimization: false,
        automatedNegotiation: true,
        documentAutomation: true,
      },
      crowdsourcedDownPayment: {
        enabled: false,
        accessLevel: 'none',
        maxFundingAmount: 0,
        regulatoryCompliance: false,
        campaignManagement: false,
        communityActivation: false,
      },
    },
    limitations: [
      'No deal analyzer',
      'No document vault',
      'Limited AI assistant (20 messages/day)',
      'No 1:1 human onboarding',
    ],
    upgradePrompts: [
      'A real person will review your finances and tell you exactly what to fix — most buyers improve their offer strength by $8,000–$15,000. [Get Expert Review →]',
      'Fix your credit score before applying — buyers who improve 50+ points save an average of $4,200 in interest. [Get My Credit Plan →]',
    ],
  },
  navigator: {
    id: 'navigator',
    name: 'Navigator+',
    positioning: 'Get Expert Eyes',
    mindset: 'Guide me through the complexity with expert support.',
    differentiators: {
      savings: 'Expert-verified savings',
      funds: 'Expert-verified funding matches',
      alternatives: 'Expert-recommended strategies',
      serviceLevel: 'Human review + priority support',
    },
    microcopy:
      'Expert guidance to help you get offer-ready faster. Personalized reviews, plans, and human support.',
    badge: null,
    price: {
      monthly: 5900,
      displayMonthly: '$59/mo',
      oneTime: 22900,
      displayOneTime: '$229',
      annual: 56600,
      displayAnnual: '$566/yr',
      oneTimeBlurb:
        'Roughly 4–5 months of value at the monthly rate — best if you’re closing within 60 days',
      annualBlurb: '$47/mo, billed annually — save $142/yr',
    },
    description: 'Ready to make offers and close.',
    journeyHighlights: [
      'Everything in Momentum',
      '1:1 onboarding call',
      'Human-reviewed finances (what to fix before you apply)',
      'Credit improvement plan',
      'Document readiness review',
      'Offer-readiness checklist',
      'Priority support',
      'Human-assisted Q&A',
      'Personalized lender-prep package',
    ],
    features: {
      quiz: { questionCount: 15, conditionalQuestions: true, detailedBreakdown: true },
      costBreakdown: {
        lineByLine: true,
        explanations: true,
        tooltips: true,
        exportPDF: true,
        watermark: false,
      },
      hosa: {
        version: 'pro',
        optimizationScore: true,
        savingsScorePreview: false,
        savingsOpportunities: Infinity,
        actionPlan: true,
        weekByWeekPlan: true,
        predictions: true,
        monteCarlo: true,
      },
      assistancePrograms: {
        maxMatchedInJourney: Number.POSITIVE_INFINITY,
      },
      budgetSketch: {
        maxEditableLineItems: 6,
      },
      tools: {
        calculators: [
          'affordability',
          'dti',
          'down-payment',
          'pmi',
          'rent-vs-buy',
          'bi-weekly',
          'arm-vs-fixed',
          'points',
          'closing-cost-negotiation',
          'appreciation',
          'equity',
          'refinance',
          'investment-roi',
          '1031-exchange',
          'gift-vs-loan',
        ],
        lenderComparison: true,
        dealAnalyzer: true,
        documentVault: true,
        timelineOrchestrator: true,
      },
      gamification: { xp: true, badges: true, streaks: true, leaderboard: true, levels: true },
      support: { email: true, chat: true, phone: false, expertAccess: false, responseTime: 24 },
      content: { blog: true, guides: true, scripts: 12, templates: true },
      aiAssistant: {
        enabled: true,
        tier: 'standard',
        dailyMessageLimit: 50,
        contextAwareness: true,
        stepByStepGuidance: true,
        riskWarnings: true,
        financialAdvice: true,
        documentChecklist: true,
        expertEscalation: false,
        proactiveNotifications: true,
      },
      personalizedJourney: true,
      mortgageShopping: true,
      downPaymentOptimizer: {
        enabled: true,
        tier: 'pro',
        aiOptimization: true,
        automatedNegotiation: true,
        documentAutomation: true,
      },
      crowdsourcedDownPayment: {
        enabled: false,
        accessLevel: 'none',
        maxFundingAmount: 0,
        regulatoryCompliance: false,
        campaignManagement: false,
        communityActivation: false,
      },
    },
    limitations: [],
    upgradePrompts: [
      'Most buyers who add expert review before offers improve their position by $8,000–$15,000. [Get Expert Review →]',
      'Investment property refinancing can generate $10,000–$100,000 in returns when structured correctly. [Unlock Investment Tools →]',
    ],
  },
  navigator_plus: {
    id: 'navigator_plus',
    name: 'Concierge+',
    positioning: 'Get a Partner',
    mindset: 'Walk with me every step — I want a partner.',
    differentiators: {
      savings: 'Maximum savings optimization',
      funds: 'Concierge-level funding strategy',
      alternatives: 'Custom affordability strategy',
      serviceLevel: 'Full concierge partnership',
    },
    microcopy:
      'Your home buying partner. Full concierge support, strategy sessions, and unlimited expert access.',
    badge: 'premium',
    price: {
      monthly: 14900,
      displayMonthly: '$149/mo',
      oneTime: 54900,
      displayOneTime: '$549',
      annual: 143000,
      displayAnnual: '$1,430/yr',
      oneTimeBlurb: 'Roughly 4–5 months of value at the monthly rate — full concierge support',
      annualBlurb: '$119/mo, billed annually — save $358/yr',
    },
    description: 'Full-service, hands-on guidance to close.',
    journeyHighlights: [
      'Everything in Navigator',
      'Full journey concierge',
      'Personalized strategy sessions',
      'Offer-writing prep',
      'Deep financial modeling',
      'Market-specific insights',
      'Unlimited Q&A',
      'Custom scripts',
      'Weekly check-ins',
      'Concierge+ badge across the app',
    ],
    features: {
      quiz: { questionCount: 20, conditionalQuestions: true, detailedBreakdown: true },
      costBreakdown: {
        lineByLine: true,
        explanations: true,
        tooltips: true,
        exportPDF: true,
        watermark: false,
      },
      hosa: {
        version: 'pro',
        optimizationScore: true,
        savingsScorePreview: false,
        savingsOpportunities: Infinity,
        actionPlan: true,
        weekByWeekPlan: true,
        predictions: true,
        monteCarlo: true,
      },
      assistancePrograms: {
        maxMatchedInJourney: Number.POSITIVE_INFINITY,
      },
      budgetSketch: {
        maxEditableLineItems: 6,
      },
      tools: {
        calculators: [
          'affordability',
          'dti',
          'down-payment',
          'pmi',
          'rent-vs-buy',
          'bi-weekly',
          'arm-vs-fixed',
          'points',
          'closing-cost-negotiation',
          'appreciation',
          'equity',
          'refinance',
          'investment-roi',
          '1031-exchange',
          'gift-vs-loan',
          'csdp-funding',
          'community-investment',
        ],
        lenderComparison: true,
        dealAnalyzer: true,
        documentVault: true,
        timelineOrchestrator: true,
      },
      gamification: { xp: true, badges: true, streaks: true, leaderboard: true, levels: true },
      support: { email: true, chat: true, phone: true, expertAccess: true, responseTime: 2 },
      content: { blog: true, guides: true, scripts: 20, templates: true },
      aiAssistant: {
        enabled: true,
        tier: 'pro',
        dailyMessageLimit: Infinity,
        contextAwareness: true,
        stepByStepGuidance: true,
        riskWarnings: true,
        financialAdvice: true,
        documentChecklist: true,
        expertEscalation: true,
        proactiveNotifications: true,
      },
      personalizedJourney: true,
      mortgageShopping: true,
      downPaymentOptimizer: {
        enabled: true,
        tier: 'pro',
        aiOptimization: true,
        automatedNegotiation: true,
        documentAutomation: true,
      },
      crowdsourcedDownPayment: {
        enabled: true,
        accessLevel: 'basic',
        maxFundingAmount: 15000,
        regulatoryCompliance: true,
        campaignManagement: true,
        communityActivation: true,
      },
    },
    limitations: [],
    upgradePrompts: [
      'Your dedicated home buying partner — available every step of the way. Concierge+ buyers close an average of 23% faster. [Get My Partner →]',
    ],
  },
}

export function formatTierPrice(def: TierDefinition): string {
  if (def.price.displayMonthly) return def.price.displayMonthly
  const { oneTime, monthly } = def.price
  if (oneTime != null && monthly != null)
    return `$${(oneTime / 100).toFixed(0)} once · or $${(monthly / 100).toFixed(0)}/mo`
  if (oneTime != null) return `$${(oneTime / 100).toFixed(0)} one-time`
  if (monthly != null) return `$${(monthly / 100).toFixed(0)}/mo`
  return 'Free'
}

export type TierBillingDisplayCycle = 'monthly' | 'one-time' | 'annual'

/** Price string for upgrade/checkout UI for the selected billing toggle. */
export function formatTierPriceForCycle(def: TierDefinition, cycle: TierBillingDisplayCycle): string {
  if (cycle === 'one-time') {
    if (def.price.displayOneTime != null) return def.price.displayOneTime
    if (def.price.oneTime != null) return `$${Math.round(def.price.oneTime / 100)}`
    return formatTierPrice(def)
  }
  if (cycle === 'annual') {
    if (def.price.displayAnnual != null) return def.price.displayAnnual
    if (def.price.annual != null) {
      const n = Math.round(def.price.annual / 100)
      return `$${n.toLocaleString('en-US')}/yr`
    }
    return formatTierPrice(def)
  }
  return formatTierPrice(def)
}

/**
 * Human-readable half of the advertised monthly price (pause / retention offers).
 * Falls back to generic copy when parsing fails or plan is free.
 */
export function estimateHalfMonthlyFromDisplay(displayMonthly?: string): string {
  if (!displayMonthly || displayMonthly.toLowerCase().includes('free')) {
    return '50% of your plan’s monthly rate'
  }
  const match = displayMonthly.match(/([\d,.]+)/)
  if (!match) return '50% of your plan’s monthly rate'
  const n = parseFloat(match[1].replace(/,/g, ''))
  if (!Number.isFinite(n) || n <= 0) return '50% of your plan’s monthly rate'
  const half = n / 2
  const formatted = Number.isInteger(half) ? String(half) : half.toFixed(2)
  return `$${formatted}/mo`
}

export function hasFeature(tier: UserTier, featurePath: string): boolean {
  const tierDef = TIER_DEFINITIONS[tier]
  if (!tierDef?.features) return false

  const features = tierDef.features
  const parts = featurePath.split('.')
  let current: unknown = features
  for (const part of parts) {
    if (current === undefined || current === null || typeof current !== 'object') return false
    const rec = current as Record<string, unknown>
    if (rec[part] === undefined) return false
    current = rec[part]
  }

  if (typeof current === 'boolean') return current
  if (typeof current === 'number') return current > 0
  if (Array.isArray(current)) return current.length > 0

  return true
}

export function getUpgradePrompt(tier: UserTier, feature: string): string | null {
  const definition = TIER_DEFINITIONS[tier]
  if (!definition?.upgradePrompts?.length) return null
  return definition.upgradePrompts[0]
}

/** Momentum → Navigator+ pitch; solo and first-gen buyers get ICP-specific copy. */
export function getMomentumToNavigatorUpgradeCopy(icpType: string | null | undefined): string {
  if (icpType === 'solo') {
    return 'Have an expert check your offer before you submit it — solo buyers who use expert review save an average of $4,200 more.'
  }
  if (icpType === 'first-gen') {
    return 'Talk to a real person who will review your finances and tell you exactly what to fix — no jargon, no judgment.'
  }
  return TIER_DEFINITIONS.momentum.upgradePrompts[0]
}

export function getNextTier(tier: UserTier): UserTier | null {
  const currentIndex = TIER_ORDER.indexOf(tier)
  if (currentIndex === -1 || currentIndex === TIER_ORDER.length - 1) return null
  return TIER_ORDER[currentIndex + 1]
}

/** Whether this tier may use a named calculator id (see `tools.calculators`). */
export function tierHasCalculator(tier: UserTier, calculatorId: string): boolean {
  const ids = TIER_DEFINITIONS[tier]?.features?.tools?.calculators ?? []
  return ids.includes(calculatorId)
}

export function showConciergePlusChrome(tier: UserTier): boolean {
  return tier === 'navigator_plus'
}

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
    savingsOpportunities: number
    actionPlan: boolean
    weekByWeekPlan: boolean
    predictions: boolean
    monteCarlo: boolean
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
    price: { displayMonthly: 'Free' },
    description: 'Explore and get grounded with core readiness tools.',
    journeyHighlights: [
      'Readiness score',
      'Savings snapshot',
      'Monthly budget sketch',
      'Phase 1–2 guidance',
      'Basic myths + learning',
      'Limited scripts',
      'Inbox for tasks',
      'Email reminders',
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
        savingsOpportunities: 0,
        actionPlan: false,
        weekByWeekPlan: false,
        predictions: false,
        monteCarlo: false,
      },
      tools: {
        calculators: [],
        lenderComparison: false,
        dealAnalyzer: false,
        documentVault: false,
        timelineOrchestrator: false,
      },
      gamification: { xp: false, badges: false, streaks: false, leaderboard: false, levels: false },
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
      'Limited savings opportunities shown',
      'Watermarked PDFs',
      'No full 7-phase roadmap',
      'No AI assistant access',
    ],
    upgradePrompts: [
      'Unlock Momentum for the full roadmap, scripts, and weekly plans →',
      'Get smart nudges and priority inbox sorting →',
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
    price: { monthly: 1900, displayMonthly: '$19/mo' },
    description: 'Full roadmap and weekly rhythm.',
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
        savingsOpportunities: 10,
        actionPlan: true,
        weekByWeekPlan: true,
        predictions: true,
        monteCarlo: false,
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
      'Navigator adds personalized affordability review and human-assisted Q&A →',
      'Get credit improvement and document readiness plans →',
    ],
  },
  navigator: {
    id: 'navigator',
    name: 'Navigator',
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
    price: { monthly: 9900, displayMonthly: '$99/mo' },
    description: 'Expert support and personalized prep.',
    journeyHighlights: [
      'Everything in Momentum',
      '1:1 onboarding call',
      'Personalized affordability review',
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
        savingsOpportunities: Infinity,
        actionPlan: true,
        weekByWeekPlan: true,
        predictions: true,
        monteCarlo: true,
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
    upgradePrompts: ['Navigator+ adds concierge, unlimited Q&A, and weekly check-ins →'],
  },
  navigator_plus: {
    id: 'navigator_plus',
    name: 'Navigator+',
    positioning: 'Get a Partner',
    mindset: 'Walk with me every step — I want a partner.',
    differentiators: {
      savings: 'Maximum savings optimization',
      funds: 'Concierge-level funding strategy',
      alternatives: 'Custom affordability strategy',
      serviceLevel: 'Full concierge partnership',
    },
    microcopy:
      'Your homebuying partner. Full concierge support, strategy sessions, and unlimited expert access.',
    badge: 'premium',
    price: { monthly: 29900, displayMonthly: '$299/mo' },
    description: 'Full concierge and unlimited expert access.',
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
        savingsOpportunities: Infinity,
        actionPlan: true,
        weekByWeekPlan: true,
        predictions: true,
        monteCarlo: true,
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
    upgradePrompts: [],
  },
}

export function formatTierPrice(def: TierDefinition): string {
  if (def.price.displayMonthly) return def.price.displayMonthly
  const { oneTime, monthly } = def.price
  if (oneTime != null && monthly != null) return `$${oneTime} once · or $${monthly}/mo`
  if (oneTime != null) return `$${oneTime} one-time`
  if (monthly != null) return `$${monthly}/mo`
  return 'Free'
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

export function getNextTier(tier: UserTier): UserTier | null {
  const currentIndex = TIER_ORDER.indexOf(tier)
  if (currentIndex === -1 || currentIndex === TIER_ORDER.length - 1) return null
  return TIER_ORDER[currentIndex + 1]
}

export function showConciergePlusChrome(tier: UserTier): boolean {
  return tier === 'navigator_plus'
}

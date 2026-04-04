/**
 * Phase and feature metadata for the customized journey.
 * `description` = short copy for tiles and lists. `detailDescription` = fuller copy on the feature detail screen.
 */

export interface FeatureData {
  id: string
  title: string
  /** One line for tiles (~≤140 chars). */
  description: string
  /** Optional expanded copy on `/customized-journey/detail/...` */
  detailDescription?: string
  link?: string
  tierRequired?: string
}

export interface PhaseData {
  id: string
  title: string
  description: string
  /** Optional longer phase blurb on feature detail page only. */
  detailDescription?: string
  estimatedTime: string
  order: number
  features: FeatureData[]
}

export const JOURNEY_PHASES_DATA: PhaseData[] = [
  {
    id: 'preparation',
    title: 'Preparation & Credit',
    description: 'Credit, budget, and documents—before you shop.',
    detailDescription:
      'Budget realistically (PITI + HOA + maintenance), build credit, and gather documents—the same beats as Phase 1 in your NQ action roadmap.',
    estimatedTime: '2-4 weeks',
    order: 1,
    features: [
      {
        id: 'credit-check',
        title: 'Credit analysis',
        description: 'See where you stand and how to improve.',
        detailDescription: 'Understand your credit and how to improve it before lenders pull your file.',
        tierRequired: 'momentum',
      },
      {
        id: 'budget-dti',
        title: 'Budget & monthly cost',
        description: 'A payment you can live with—not just the lender max.',
        detailDescription:
          'Sketch an affordable payment vs. the lender’s ceiling. Know your debt-to-income picture and realistic cash for closing plus reserves.',
        link: '/results',
      },
      {
        id: 'down-payment-optimizer',
        title: 'Down Payment Optimizer',
        description: 'Stack grants, gifts, and savings smartly.',
        detailDescription: 'Find all funding sources and maximize savings toward down payment and closing.',
        link: '/down-payment-optimizer',
      },
      {
        id: 'fair-housing-basics',
        title: 'Fair housing',
        description: 'Equal treatment from lenders and agents.',
        detailDescription:
          'Protected classes and your right to equal professional service when working with lenders and agents.',
      },
      {
        id: 'document-checklist',
        title: 'Document checklist',
        description: 'Taxes, pay stubs, banks, ID—ready to verify.',
        detailDescription:
          'Tax returns, pay stubs, bank statements, government ID—everything lenders typically verify in underwriting.',
      },
      {
        id: 'readiness-score',
        title: 'Readiness Score',
        description: 'How mortgage-ready you are today.',
        detailDescription: 'See how ready you are to buy and what to improve next.',
        link: '/results',
      },
    ],
  },
  {
    id: 'pre-approval',
    title: 'Get Pre-Approved',
    description: 'Verified numbers and lender shopping—done right.',
    detailDescription:
      'Verified pre-approval and smart shopping: loan types, APR vs. note rate, PMI, points vs. credits (Phase 2 milestones).',
    estimatedTime: '1-2 weeks',
    order: 2,
    features: [
      {
        id: 'mortgage-shopping',
        title: 'Mortgage Savings Roadmap',
        description: 'Compare lenders side by side.',
        detailDescription: 'Compare lenders and find the best rates and fees for your situation.',
        tierRequired: 'momentum',
        link: '/mortgage-shopping',
      },
      {
        id: 'rate-comparison',
        title: 'Rate comparison',
        description: 'Line up real quotes—not ads.',
        detailDescription: 'Compare quotes from multiple lenders with comparable assumptions.',
        tierRequired: 'momentum',
      },
      {
        id: 'loan-types-pmi',
        title: 'Mortgage basics',
        description: 'Loan types, APR vs rate, PMI, points vs credits.',
        detailDescription:
          'Conventional vs. government-backed loans, fixed vs. ARM, PMI/MIP, APR vs. note rate, discount points vs. lender credits.',
      },
      {
        id: 'pre-approval-guide',
        title: 'Pre-approval guide',
        description: 'Pre-approval vs pre-qual—what’s real.',
        detailDescription: 'Step-by-step: pre-approval vs. pre-qualification and what sellers expect.',
      },
    ],
  },
  {
    id: 'house-hunting',
    title: 'Find Your Home',
    description: 'Must-haves, agent, and your wider team.',
    detailDescription:
      'Non-negotiables, a strong local agent, and the wider team—inspector, appraiser, title/closing (Phase 3).',
    estimatedTime: '4-12 weeks',
    order: 3,
    features: [
      {
        id: 'affordability-calculator',
        title: 'Affordability',
        description: 'Price isn’t the whole bill—taxes, HOA, insurance.',
        detailDescription: 'Stress-test payment plus taxes, insurance, and HOA—not list price alone.',
        link: '/results',
      },
      {
        id: 'agent-finder',
        title: 'Find an agent',
        description: 'Local experience in your target area.',
        detailDescription: 'Get matched with an agent who knows your neighborhoods and offer norms.',
        tierRequired: 'momentum',
      },
      {
        id: 'home-buying-team',
        title: 'Your home buying team',
        description: 'Who runs inspection, appraisal, and title.',
        detailDescription:
          'How your agent, lender, inspector, appraiser, and title/escrow coordinate—and what to expect when.',
      },
      {
        id: 'offer-strategy',
        title: 'Offer strategy',
        description: 'Win without waiving everything that protects you.',
        detailDescription: 'Make competitive offers that still fit your risk tolerance.',
        tierRequired: 'navigator',
      },
    ],
  },
  {
    id: 'negotiation',
    title: 'Negotiation & Inspection',
    description: 'Contingencies, inspection, coverage, and title.',
    detailDescription:
      'Offer strategy, contingencies, inspection, appraisal timing, homeowners insurance, and title basics (Phase 4).',
    estimatedTime: '2-4 weeks',
    order: 4,
    features: [
      {
        id: 'negotiation-scripts',
        title: 'Negotiation scripts',
        description: 'What to say when thousands are on the line.',
        detailDescription: 'Scripts and framing to negotiate price, credits, and repairs.',
        tierRequired: 'navigator',
      },
      {
        id: 'inspection-guide',
        title: 'Inspection guide',
        description: 'Find problems before they’re your problems.',
        detailDescription: 'Inspection window, red flags, and how to negotiate outcomes.',
        tierRequired: 'momentum',
      },
      {
        id: 'appraisal-contingency',
        title: 'Appraisal gaps',
        description: 'Low value? Renegotiate, bridge, or exit.',
        detailDescription:
          'What a low appraisal means for price, bringing cash to close, or leaving under your contract terms.',
      },
      {
        id: 'homeowners-insurance-timeline',
        title: 'Insurance before closing',
        description: 'Bind coverage early—underwriting needs proof.',
        detailDescription: 'Proof of homeowners insurance your lender requires; shopping early avoids closing delays.',
      },
      {
        id: 'title-escrow-101',
        title: 'Title & escrow',
        description: 'Who clears liens and issues policies.',
        detailDescription:
          'Lender’s vs. owner’s title insurance, escrow’s role, and how to read the preliminary title report.',
      },
      {
        id: 'cost-negotiation',
        title: 'Closing cost negotiation',
        description: 'Trim lender and third-party fees where you can.',
        detailDescription: 'Reduce fees and save money at the closing table when the market allows.',
        tierRequired: 'momentum',
      },
    ],
  },
  {
    id: 'underwriting',
    title: 'Underwriting & Final Approval',
    description: 'Fast answers, steady job, no surprise debt.',
    detailDescription:
      'Respond quickly and keep your profile stable—new debt can change your DTI mid-file (Phase 5).',
    estimatedTime: '3-6 weeks',
    order: 5,
    features: [
      {
        id: 'document-tracking',
        title: 'Document tracker',
        description: 'Every upload in one checklist.',
        detailDescription: 'Track all required documents and lender requests in one place.',
        tierRequired: 'momentum',
      },
      {
        id: 'underwriting-timeline',
        title: 'Underwriting timeline',
        description: 'What happens week by week.',
        detailDescription: 'Know what to expect and when from processor and underwriter.',
        tierRequired: 'momentum',
      },
      {
        id: 'approval-checklist',
        title: 'Final approval checklist',
        description: 'Last sign-offs before clear to close.',
        detailDescription: 'Ensure everything is ready for final approval and scheduling.',
      },
    ],
  },
  {
    id: 'closing',
    title: 'Closing & Move-In',
    description: 'Disclosure, walk-through, wires, keys.',
    detailDescription:
      'Closing Disclosure review, final walk-through, wire safety, signing, and funding—then keys (Phase 6).',
    estimatedTime: '1-2 weeks',
    order: 6,
    features: [
      {
        id: 'closing-costs',
        title: 'Closing cost breakdown',
        description: 'Cash to close vs your Loan Estimate.',
        detailDescription: 'Cash to close, escrows, and title—line by line against your Loan Estimate.',
        link: '/results',
      },
      {
        id: 'final-walkthrough',
        title: 'Final walk-through',
        description: 'Confirm fixes and condition match the contract.',
        detailDescription: 'Walk the home shortly before closing to confirm repairs and condition match the contract.',
      },
      {
        id: 'wire-fraud-safety',
        title: 'Wire safety',
        description: 'Verify instructions by phone—never email alone.',
        detailDescription:
          'Always confirm wiring instructions by calling your closing agent on a number you trust—not links or email.',
      },
      {
        id: 'closing-day-guide',
        title: 'Closing day',
        description: 'ID, funds, signing—plan about two hours.',
        detailDescription: 'What to expect, what to bring, and how long signing usually takes.',
      },
      {
        id: 'move-in-checklist',
        title: 'Move-in checklist',
        description: 'First weeks after you own it.',
        detailDescription: 'Utilities, locks, smoke alarms, and the first tasks after closing.',
        tierRequired: 'momentum',
      },
    ],
  },
  {
    id: 'post-closing',
    title: 'Post-Closing & Beyond',
    description: 'Maintain, renew coverage, avoid scams—act early if money gets tight.',
    detailDescription:
      'Maintenance budget, insurance renewals, scam awareness, and where to get help before you miss a payment (Phase 7).',
    estimatedTime: 'Ongoing',
    order: 7,
    features: [
      {
        id: 'ownership-budget',
        title: 'Maintenance & reserves',
        description: 'Plan for repairs and tax/insurance bills.',
        detailDescription:
          'Rule of thumb: set aside for ongoing upkeep and watch escrow/tax/insurance notices so nothing sneaks up on you.',
      },
      {
        id: 'scam-predatory-red-flags',
        title: 'Scam red flags',
        description: 'Too-good refis, equity theft, storm hustlers.',
        detailDescription:
          'Predatory pitches, equity-theft schemes, and pushy contractors—when to pause and verify before you sign or wire.',
      },
      {
        id: 'hardship-help-early',
        title: 'Hardship help—early',
        description: 'HUD counseling and your servicer—before you miss pay.',
        detailDescription:
          'HUD-approved housing counseling (hud.gov) and your loan servicer’s loss-mitigation options—earlier is better.',
      },
      {
        id: 'lifecycle-dashboard',
        title: 'Mortgage lifecycle',
        description: 'Refi or next purchase—see the full arc.',
        detailDescription: 'Track your homeownership journey including refinance or repeat-buyer next steps.',
        link: '/refinance-optimizer',
      },
      {
        id: 'refinance-optimizer',
        title: 'Refinance Optimizer',
        description: 'When a refi actually pays off.',
        detailDescription: 'Know when refinancing beats staying put on your current loan.',
        tierRequired: 'momentum',
      },
      {
        id: 'home-maintenance',
        title: 'Maintenance tracker',
        description: 'Seasonal and system checks in one place.',
        detailDescription: 'Keep your home in shape with reminders for systems and seasonal tasks.',
        tierRequired: 'navigator',
      },
    ],
  },
]

/** Resolve a phase from the full library (ids match `NQGuidedStep.phaseId`). */
export function getJourneyPhaseById(phaseId: string): PhaseData | undefined {
  return JOURNEY_PHASES_DATA.find((p) => p.id === phaseId)
}

export function getJourneyPhaseByOrder(order: number): PhaseData | undefined {
  return JOURNEY_PHASES_DATA.find((p) => p.order === order)
}

export const JOURNEY_PHASE_COUNT = JOURNEY_PHASES_DATA.length

export function getPhaseAndFeature(
  phaseId: string,
  featureId: string
): { phase: PhaseData; feature: FeatureData } | null {
  const phase = JOURNEY_PHASES_DATA.find((p) => p.id === phaseId)
  if (!phase) return null
  const feature = phase.features.find((f) => f.id === featureId)
  if (!feature) return null
  return { phase, feature }
}

/**
 * Marketplace MVP — vetted educational and official resources (no referral fees).
 * Future: buyer-rated service providers with transparent quotes.
 */

export type MarketplacePartner = {
  id: string
  category: 'counseling' | 'credit' | 'insurance' | 'closing' | 'inspection'
  name: string
  tagline: string
  primaryStat: string
  primaryStatLabel: string
  ctaText: string
  ctaHref: string
  /** External official resource */
  external?: boolean
  note?: string
}

export const MARKETPLACE_PARTNERS: MarketplacePartner[] = [
  {
    id: 'hud-counselors',
    category: 'counseling',
    name: 'HUD Housing Counselors',
    tagline: 'Free, one-on-one help with budgets, credit, and loan programs.',
    primaryStat: 'Free',
    primaryStatLabel: 'Typical cost',
    ctaText: 'Find a counselor',
    ctaHref: 'https://www.hud.gov/findhousingcounselors',
    external: true,
    note: 'Official U.S. HUD directory — NestQuest is not a HUD-certified agency.',
  },
  {
    id: 'cfpb-mortgage',
    category: 'counseling',
    name: 'CFPB Mortgage Toolkit',
    tagline: 'Plain-English checklists for shopping lenders and closing.',
    primaryStat: 'Official',
    primaryStatLabel: 'Source',
    ctaText: 'Open toolkit',
    ctaHref: 'https://www.consumerfinance.gov/owning-a-home/',
    external: true,
  },
  {
    id: 'annual-credit',
    category: 'credit',
    name: 'Annual Credit Report',
    tagline: 'Free reports from Equifax, Experian, and TransUnion — the authorized site.',
    primaryStat: 'Free',
    primaryStatLabel: 'Annual access',
    ctaText: 'Get your reports',
    ctaHref: 'https://www.annualcreditreport.com',
    external: true,
  },
  {
    id: 'title-guide',
    category: 'closing',
    name: 'Title & closing cost guide',
    tagline: 'Understand owner vs lender title insurance before you shop.',
    primaryStat: 'In-app',
    primaryStatLabel: 'NestQuest guide',
    ctaText: 'Read guide',
    ctaHref: '/resources#resource-title-insurance-explained',
  },
  {
    id: 'inspection-guide',
    category: 'inspection',
    name: 'Home inspection playbook',
    tagline: 'What to check, red flags, and how to negotiate outcomes.',
    primaryStat: 'In-app',
    primaryStatLabel: 'NestQuest guide',
    ctaText: 'Read guide',
    ctaHref: '/resources#resource-inspection-guide',
  },
  {
    id: 'closing-costs',
    category: 'closing',
    name: 'Closing cost breakdown',
    tagline: 'Compare Loan Estimate sections A, B, and C before you sign.',
    primaryStat: 'In-app',
    primaryStatLabel: 'NestQuest guide',
    ctaText: 'Read guide',
    ctaHref: '/resources#resource-closing-cost-guide',
  },
  {
    id: 'homeowners-insurance',
    category: 'insurance',
    name: 'Insurance before closing',
    tagline: 'Bind coverage early — lenders need proof before funding.',
    primaryStat: 'In-app',
    primaryStatLabel: 'NestQuest guide',
    ctaText: 'Read guide',
    ctaHref: '/resources#resource-homeowners-insurance-primer',
  },
  {
    id: 'wire-safety',
    category: 'closing',
    name: 'Wire verification script',
    tagline: 'Confirm wiring instructions by phone — never email links alone.',
    primaryStat: 'Premium',
    primaryStatLabel: 'Momentum script',
    ctaText: 'View script',
    ctaHref: '/resources#resource-closing-script',
  },
]

export const MARKETPLACE_CATEGORY_LABELS: Record<MarketplacePartner['category'], string> = {
  counseling: 'Counseling & education',
  credit: 'Credit & readiness',
  insurance: 'Insurance',
  closing: 'Title & closing',
  inspection: 'Inspection',
}

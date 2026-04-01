/** Curated library entries for the journey Library tab (links into /resources). */

import type { UserTier } from './tiers'

export type LibraryCategoryId =
  | 'scripts'
  | 'checklists'
  | 'guides'
  | 'money_finder'
  | 'savings_strategies'
  | 'alternative_solutions'

export type JourneyLibraryItem = {
  id: string
  title: string
  summary: string
  readMin: number
  category: LibraryCategoryId
  href: string
  /** Minimum tier to read without a soft lock / upsell. */
  minTier?: UserTier
}

export const JOURNEY_LIBRARY_ITEMS: JourneyLibraryItem[] = [
  {
    id: 'offer-script',
    title: 'Balanced offer talking points',
    summary: 'Phrases to stay firm on price while sounding collaborative.',
    readMin: 3,
    category: 'scripts',
    href: '/resources',
  },
  {
    id: 'inspection-checklist',
    title: 'Inspection day checklist',
    summary: 'Room-by-room signals worth noting before you waive or negotiate.',
    readMin: 5,
    category: 'checklists',
    href: '/resources',
    minTier: 'momentum',
  },
  {
    id: 'closing-costs-guide',
    title: 'Closing costs in plain English',
    summary: 'Which fees move, which rarely do, and what to compare across lenders.',
    readMin: 8,
    category: 'guides',
    href: '/resources',
  },
  {
    id: 'lender-shop-script',
    title: 'Shopping three lenders (14-day window)',
    summary: 'How to ask for LE apples-to-apples without sounding confrontational.',
    readMin: 4,
    category: 'scripts',
    href: '/resources',
    minTier: 'momentum',
  },
  {
    id: 'walkthrough-checklist',
    title: 'Final walk-through checklist',
    summary: 'Confirm repairs, appliances, and utilities before signing.',
    readMin: 4,
    category: 'checklists',
    href: '/resources',
    minTier: 'momentum',
  },
  {
    id: 'dti-deep-dive',
    title: 'DTI: front-end vs back-end',
    summary: 'How lenders weigh housing vs total debt — and why your sketch matters.',
    readMin: 7,
    category: 'guides',
    href: '/resources',
    minTier: 'navigator_plus',
  },
  {
    id: 'wire-fraud-safety',
    title: 'Wire instructions verification script',
    summary: 'A short call script to confirm wiring details on a known number.',
    readMin: 2,
    category: 'scripts',
    href: '/resources',
    minTier: 'momentum',
  },
  {
    id: 'docs-starter-pack',
    title: 'Lender document starter list',
    summary: 'The core paperwork bundle most buyers gather in early phases.',
    readMin: 5,
    category: 'checklists',
    href: '/resources',
  },
  {
    id: 'dpa-match',
    title: 'Down payment assistance matcher (checklist)',
    summary: 'Eligibility signals by geography, income band, and first-time status.',
    readMin: 6,
    category: 'money_finder',
    href: '/resources',
  },
  {
    id: 'state-programs',
    title: 'State & local homebuyer credits',
    summary: 'Where to look for bond programs and siloed municipal funds.',
    readMin: 7,
    category: 'money_finder',
    href: '/resources',
    minTier: 'momentum',
  },
  {
    id: 'lender-credit-tradeoff',
    title: 'Lender credits vs. rate — break-even math',
    summary: 'When a slightly higher rate pays for closing help you need now.',
    readMin: 6,
    category: 'savings_strategies',
    href: '/resources',
  },
  {
    id: 'pmi-optimization',
    title: 'PMI optimization playbook',
    summary: 'Down payment tiers that drop PMI sooner or shrink the monthly line.',
    readMin: 8,
    category: 'savings_strategies',
    href: '/resources',
    minTier: 'momentum',
  },
  {
    id: 'fee-negotiation',
    title: 'Negotiating lender & title fees',
    summary: 'Which line items have flex and how to ask without blowing up the deal.',
    readMin: 5,
    category: 'savings_strategies',
    href: '/resources',
    minTier: 'navigator',
  },
  {
    id: 'arm-scenarios',
    title: 'ARM scenarios with exit plans',
    summary: 'Fixed periods, caps, and when ARM beats fixed for 3–7 year holds.',
    readMin: 9,
    category: 'alternative_solutions',
    href: '/resources',
    minTier: 'momentum',
  },
  {
    id: 'buydown-structures',
    title: 'Permanent vs temporary buydowns',
    summary: 'Seller concessions, upfront costs, and how payments step down.',
    readMin: 7,
    category: 'alternative_solutions',
    href: '/resources',
    minTier: 'momentum',
  },
  {
    id: 'reno-loan-primer',
    title: 'Renovation loan primer',
    summary: 'Rolling repairs into purchase when appraisal and contractor scope align.',
    readMin: 8,
    category: 'alternative_solutions',
    href: '/resources',
    minTier: 'navigator',
  },
]

export const JOURNEY_LIBRARY_CATEGORY_LABEL: Record<LibraryCategoryId, string> = {
  scripts: 'Scripts',
  checklists: 'Checklists',
  guides: 'Deep Guides',
  money_finder: 'Money Finder',
  savings_strategies: 'Savings Strategies',
  alternative_solutions: 'Alternative Solutions',
}

export type LeadStatus = 'new' | 'qualified' | 'pipeline' | 'closed'

export interface MockLead {
  id: string
  name: string
  score: number
  buyerType: 'First-Time' | 'Move-Up' | 'Refinance' | 'Investor'
  location: string
  incomeRange: string
  timeline: string
  lastActivity: string
  status: LeadStatus
  creditRange: string
  quizAnswers: Record<string, string>
  readiness: { credit: number; savings: number; timeline: number; motivation: number }
  journeyPhase: string
  tabsVisited: string[]
}

/** Small trend series for stats bar sparklines (0–100 relative). */
export const PIPELINE_SPARKLINES = {
  newLeads: [8, 9, 10, 11, 10, 11, 12],
  qualified: [5, 6, 7, 7, 8, 8, 8],
  pipeline: [3, 4, 4, 5, 5, 5, 5],
  closed: [18, 19, 20, 21, 22, 23, 24],
} as const

export const MOCK_LEADS: MockLead[] = [
  {
    id: 'lead-1',
    name: 'Sarah Johnson',
    score: 87,
    buyerType: 'Move-Up',
    location: 'Seattle, WA',
    incomeRange: '$118k–$135k',
    timeline: '3–6 months',
    lastActivity: '2026-04-02',
    status: 'qualified',
    creditRange: '700–750',
    quizAnswers: {
      'Primary goal': 'Sell current home and buy larger for growing family',
      'Down payment source': 'Equity from sale + savings',
      'Biggest concern': 'Coordinating two closings',
      'Has agent?': 'Yes — referral from NestQuest',
    },
    readiness: { credit: 22, savings: 21, timeline: 23, motivation: 21 },
    journeyPhase: 'Phase 3 — House hunting',
    tabsVisited: ['Overview', 'Your Phase', 'Budget Sketch', 'Library'],
  },
  {
    id: 'lead-2',
    name: 'Marcus Chen',
    score: 72,
    buyerType: 'First-Time',
    location: 'Austin, TX',
    incomeRange: '$82k–$95k',
    timeline: '6–12 months',
    lastActivity: '2026-04-01',
    status: 'new',
    creditRange: '650–700',
    quizAnswers: {
      'Primary goal': 'Build equity vs. renting',
      'Down payment source': 'FHSA + savings',
      'Biggest concern': 'Hidden costs at closing',
      'Has agent?': 'Not yet',
    },
    readiness: { credit: 18, savings: 17, timeline: 19, motivation: 18 },
    journeyPhase: 'Phase 2 — Pre-approval',
    tabsVisited: ['Overview', 'Learn', 'Assistance'],
  },
  {
    id: 'lead-3',
    name: 'Elena Ruiz',
    score: 91,
    buyerType: 'Move-Up',
    location: 'Denver, CO',
    incomeRange: '$140k–$165k',
    timeline: '1–3 months',
    lastActivity: '2026-04-03',
    status: 'pipeline',
    creditRange: '750+',
    quizAnswers: {
      'Primary goal': 'Upgrade school district',
      'Down payment source': 'Sale proceeds + stock vest',
      'Biggest concern': 'Appraisal gap in hot market',
      'Has agent?': 'Yes',
    },
    readiness: { credit: 24, savings: 23, timeline: 22, motivation: 22 },
    journeyPhase: 'Phase 4 — Offer & negotiation',
    tabsVisited: ['Overview', 'Phase', 'Inbox', 'Library', 'Upgrades'],
  },
  {
    id: 'lead-4',
    name: 'James Okonkwo',
    score: 58,
    buyerType: 'First-Time',
    location: 'Atlanta, GA',
    incomeRange: '$58k–$68k',
    timeline: '12+ months',
    lastActivity: '2026-03-28',
    status: 'new',
    creditRange: '600–650',
    quizAnswers: {
      'Primary goal': 'Stabilize credit then buy',
      'Down payment source': 'DPA programs + savings',
      'Biggest concern': 'DTI and approval amount',
      'Has agent?': 'No',
    },
    readiness: { credit: 12, savings: 14, timeline: 16, motivation: 16 },
    journeyPhase: 'Phase 1 — Preparation',
    tabsVisited: ['Overview', 'Learn'],
  },
  {
    id: 'lead-5',
    name: 'Priya Patel',
    score: 79,
    buyerType: 'Refinance',
    location: 'Phoenix, AZ',
    incomeRange: '$95k–$110k',
    timeline: '3–6 months',
    lastActivity: '2026-03-30',
    status: 'qualified',
    creditRange: '700–750',
    quizAnswers: {
      'Primary goal': 'Lower rate and drop PMI',
      'Current loan type': '30-yr conventional @ 7.1%',
      'Biggest concern': 'Break-even timeline',
      'Has agent?': 'N/A — refi',
    },
    readiness: { credit: 20, savings: 19, timeline: 20, motivation: 20 },
    journeyPhase: 'Refinance — Rate comparison',
    tabsVisited: ['Overview', 'Budget Sketch', 'Library'],
  },
  {
    id: 'lead-6',
    name: 'Olivia Hart',
    score: 84,
    buyerType: 'First-Time',
    location: 'Portland, OR',
    incomeRange: '$92k–$105k',
    timeline: '6 months',
    lastActivity: '2026-04-02',
    status: 'pipeline',
    creditRange: '700–750',
    quizAnswers: {
      'Primary goal': 'First home with partner',
      'Down payment source': 'Gift + savings',
      'Biggest concern': 'Offer competitiveness',
      'Has agent?': 'Interviewing',
    },
    readiness: { credit: 21, savings: 22, timeline: 20, motivation: 21 },
    journeyPhase: 'Phase 3 — House hunting',
    tabsVisited: ['Overview', 'Phase', 'Assistance', 'Inbox'],
  },
  {
    id: 'lead-7',
    name: 'David Kim',
    score: 66,
    buyerType: 'Investor',
    location: 'Tampa, FL',
    incomeRange: '$110k–$130k',
    timeline: '6–12 months',
    lastActivity: '2026-03-25',
    status: 'new',
    creditRange: '650–700',
    quizAnswers: {
      'Primary goal': 'First rental property',
      'Down payment source': 'Liquid savings',
      'Biggest concern': 'Reserve requirements',
      'Has agent?': 'Investor-focused agent',
    },
    readiness: { credit: 16, savings: 17, timeline: 16, motivation: 17 },
    journeyPhase: 'Phase 2 — Pre-approval',
    tabsVisited: ['Overview', 'Learn', 'Library'],
  },
  {
    id: 'lead-8',
    name: 'Amanda Foster',
    score: 93,
    buyerType: 'Move-Up',
    location: 'Boston, MA',
    incomeRange: '$175k–$195k',
    timeline: '1–3 months',
    lastActivity: '2026-04-03',
    status: 'closed',
    creditRange: '750+',
    quizAnswers: {
      'Primary goal': 'Closed — relocation',
      'Down payment source': 'Equity + RSUs',
      'Outcome': 'Under contract, closing scheduled',
      'Has agent?': 'Yes',
    },
    readiness: { credit: 24, savings: 24, timeline: 23, motivation: 22 },
    journeyPhase: 'Phase 6 — Closing',
    tabsVisited: ['Overview', 'Phase', 'Budget', 'Inbox', 'Library', 'Upgrades'],
  },
  {
    id: 'lead-9',
    name: 'Ryan Mitchell',
    score: 74,
    buyerType: 'First-Time',
    location: 'Nashville, TN',
    incomeRange: '$78k–$88k',
    timeline: '6–12 months',
    lastActivity: '2026-03-31',
    status: 'qualified',
    creditRange: '650–700',
    quizAnswers: {
      'Primary goal': 'Stop renting in 12 months',
      'Down payment source': 'First-time buyer programs',
      'Biggest concern': 'Affordability vs. commute',
      'Has agent?': 'Not yet',
    },
    readiness: { credit: 17, savings: 18, timeline: 20, motivation: 19 },
    journeyPhase: 'Phase 2 — Pre-approval',
    tabsVisited: ['Overview', 'Assistance', 'Learn'],
  },
  {
    id: 'lead-10',
    name: 'Nina Abboud',
    score: 81,
    buyerType: 'Refinance',
    location: 'San Diego, CA',
    incomeRange: '$125k–$145k',
    timeline: '3 months',
    lastActivity: '2026-04-01',
    status: 'pipeline',
    creditRange: '700–750',
    quizAnswers: {
      'Primary goal': 'Cash-out for remodel',
      'Current loan type': '30-yr FHA',
      'Biggest concern': 'Equity and LTV',
      'Has agent?': 'N/A',
    },
    readiness: { credit: 21, savings: 20, timeline: 20, motivation: 20 },
    journeyPhase: 'Refinance — Application',
    tabsVisited: ['Overview', 'Budget Sketch', 'Inbox'],
  },
]

export function getLeadById(id: string): MockLead | undefined {
  return MOCK_LEADS.find((l) => l.id === id)
}

export function scoreBadgeClass(score: number): string {
  if (score >= 80) return 'bg-emerald-100 text-emerald-900 ring-emerald-200'
  if (score >= 60) return 'bg-amber-100 text-amber-900 ring-amber-200'
  return 'bg-slate-100 text-slate-600 ring-slate-200'
}

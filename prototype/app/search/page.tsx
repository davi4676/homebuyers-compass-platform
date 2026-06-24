'use client'



import { useMemo, useState } from 'react'

import Link from 'next/link'

import { Search, ArrowRight } from 'lucide-react'

import BackToMyJourneyLink from '@/components/BackToMyJourneyLink'



const DESTINATIONS: { title: string; href: string; description: string; terms: string }[] = [

  { title: 'Playbooks', href: '/resources', description: 'Guides, scripts, and checklists', terms: 'resources playbook guide learn education' },

  { title: 'Learn topic hub', href: '/learn', description: 'Browse homebuying topics by category', terms: 'learn topics hub education index' },
  { title: 'Pre-purchase workbook', href: '/workbook', description: 'Printable checklists and worksheets', terms: 'workbook pdf checklist worksheet print' },
  { title: 'Homebuying FAQ', href: '/learn/faq', description: 'Questions by topic with links to guides', terms: 'faq questions help answers' },

  { title: 'Homebuying glossary', href: '/glossary', description: 'Plain-English mortgage terms', terms: 'glossary terms dti pmi escrow definition' },

  { title: 'FHA loans guide', href: '/resources#resource-fha-guide', description: '3.5% down and MIP explained', terms: 'fha mip government first-time' },

  { title: 'VA loans guide', href: '/resources#resource-va-guide', description: 'Veteran benefits and funding fee', terms: 'va veteran military funding fee' },

  { title: 'USDA loans guide', href: '/resources#resource-usda-guide', description: 'Zero down in eligible areas', terms: 'usda rural zero down' },

  { title: 'Loan program comparison', href: '/resources#resource-loan-program-comparison', description: 'FHA vs conventional vs VA vs USDA', terms: 'compare loan programs conventional' },
  { title: 'Lender credits vs rate', href: '/resources#resource-lender-credit-tradeoff', description: 'Break-even on credits and rate trade-offs', terms: 'lender credits rate tradeoff' },
  { title: 'ARM loan scenarios', href: '/resources#resource-arm-scenarios', description: 'Fixed period, caps, exit plans', terms: 'arm adjustable rate mortgage' },
  { title: 'Seller buydowns', href: '/resources#resource-buydown-structures', description: 'Temporary vs permanent payment help', terms: 'buydown seller concession 2-1' },
  { title: 'Renovation loans', href: '/resources#resource-reno-loan-primer', description: 'Financing purchase plus repairs', terms: 'renovation 203k rehab loan' },
  { title: 'Credit score guide', href: '/resources#resource-credit-score-guide', description: 'How scores affect your rate', terms: 'credit score rate improve' },

  { title: 'DTI explained', href: '/resources#resource-dti-deep-dive', description: 'Front-end vs back-end debt-to-income', terms: 'dti debt income ratio' },

  { title: 'Choose a buyer\'s agent', href: '/resources#resource-choose-buyers-agent', description: 'Interview questions and red flags', terms: 'agent realtor buyer agent' },

  { title: 'Home search without burnout', href: '/resources#resource-search-without-burnout', description: 'Pacing and must-haves', terms: 'search tour open house' },

  { title: 'Listing red flags', href: '/resources#resource-listing-red-flags', description: 'Price history and disclosure gaps', terms: 'red flags listing as-is' },

  { title: 'Neighborhood checklist', href: '/resources#resource-neighborhood-checklist', description: 'Commute, schools, flood risk', terms: 'neighborhood commute schools' },

  { title: 'Escrow explained', href: '/resources#resource-escrow-accounts-explained', description: 'Taxes and insurance in your payment', terms: 'escrow impound piti' },

  { title: 'Title insurance explained', href: '/resources#resource-title-insurance-explained', description: 'Owner vs lender policy', terms: 'title insurance deed' },

  { title: 'Closing day checklist', href: '/resources#resource-closing-day-checklist', description: 'What to bring and wire safety', terms: 'closing day walk-through wire' },

  { title: 'First-year maintenance', href: '/resources#resource-first-year-maintenance-budget', description: '1–3% upkeep rule', terms: 'maintenance post-closing budget' },

  { title: 'Homeowner scams & help', href: '/resources#resource-homeowner-scams-and-help', description: 'Red flags and HUD counselors', terms: 'scam fraud predatory hud' },

  { title: 'Fair housing rights', href: '/resources#resource-fair-housing-guide', description: 'Protected classes and complaints', terms: 'fair housing discrimination rights' },

  { title: 'First-time buyer mistakes', href: '/resources#resource-first-time-mistakes', description: 'Ten common missteps to avoid', terms: 'mistakes first time buyer tips' },

  { title: 'Appraisal guide', href: '/resources#resource-appraisal-basics', description: 'What happens during appraisal', terms: 'appraisal value comps' },

  { title: 'PMI and MIP guide', href: '/resources#resource-pmi-optimization', description: 'When mortgage insurance drops off', terms: 'pmi mip insurance' },

  { title: 'My Journey', href: '/customized-journey', description: 'Your personalized roadmap', terms: 'journey roadmap customized phases' },

  { title: 'Quiz & savings snapshot', href: '/quiz', description: 'Assessment and results', terms: 'quiz assessment results savings' },

  { title: 'Inbox', href: '/inbox', description: 'Actions and reminders', terms: 'inbox notifications tasks' },

  { title: 'Upgrade & plans', href: '/upgrade', description: 'Momentum, Navigator, pricing', terms: 'upgrade pricing plan subscription trial momentum' },

  { title: 'Refinance Optimizer', href: '/refinance-optimizer', description: 'Rates, break-even, cash-out', terms: 'refinance refi rate radar' },

  { title: 'Find funds', href: '/down-payment-optimizer', description: 'Down payment help', terms: 'down payment dpa assistance grants' },

  { title: 'Marketplace', href: '/marketplace', description: 'Partner tools and offers', terms: 'marketplace partners' },

  { title: 'Homebuyer hub', href: '/homebuyer', description: 'Paths for buyers and owners', terms: 'homebuyer home buyer start' },

  { title: 'For organizations', href: '/for-professionals', description: 'B2B: HUD agencies, CUs, CDFIs', terms: 'professionals organizations enterprise b2b hud cdfi credit union counseling procurement' },

]



function matchesQuery(q: string, row: (typeof DESTINATIONS)[0]): boolean {

  if (!q.trim()) return true

  const n = q.trim().toLowerCase()

  const hay = `${row.title} ${row.description} ${row.terms}`.toLowerCase()

  return hay.includes(n)

}



export default function SearchPage() {

  const [query, setQuery] = useState('')



  const filtered = useMemo(() => DESTINATIONS.filter((d) => matchesQuery(query, d)), [query])



  return (

    <div className="app-page-shell">

      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">

        <div className="mb-6">

          <BackToMyJourneyLink />

        </div>

        <h1 className="font-display text-3xl font-bold text-millennial-text">Search</h1>

        <p className="mt-2 text-sm text-millennial-text-muted">Jump to a page or tool — results filter as you type.</p>



        <div className="relative mt-6">

          <Search

            className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-millennial-text-muted"

            aria-hidden

          />

          <input

            type="search"

            value={query}

            onChange={(e) => setQuery(e.target.value)}

            placeholder="Search pages and tools…"

            className="w-full rounded-xl border border-millennial-border bg-white py-3 pl-11 pr-4 text-millennial-text shadow-sm outline-none ring-millennial-cta-primary/20 placeholder:text-millennial-text-muted focus:border-millennial-cta-primary focus:ring-2"

            autoComplete="off"

            autoFocus

            aria-label="Search NestQuest"

          />

        </div>



        <ul className="mt-8 divide-y divide-millennial-border rounded-xl border border-millennial-border bg-white">

          {filtered.length === 0 ? (

            <li className="px-4 py-8 text-center text-sm text-millennial-text-muted">No matches. Try “journey”, “quiz”, or “refinance”.</li>

          ) : (

            filtered.map((d) => (

              <li key={d.href + d.title}>

                <Link

                  href={d.href}

                  className="flex items-center justify-between gap-3 px-4 py-4 transition-colors hover:bg-millennial-primary-light/20"

                >

                  <div>

                    <p className="font-semibold text-millennial-text">{d.title}</p>

                    <p className="text-sm text-millennial-text-muted">{d.description}</p>

                  </div>

                  <ArrowRight className="h-5 w-5 shrink-0 text-millennial-cta-primary" aria-hidden />

                </Link>

              </li>

            ))

          )}

        </ul>

      </div>

    </div>

  )

}



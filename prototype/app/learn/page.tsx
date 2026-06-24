'use client'

import Link from 'next/link'
import { ArrowRight, BookOpen, Lock } from 'lucide-react'
import BackToMyJourneyLink from '@/components/BackToMyJourneyLink'
import PlainEnglishToggleBar from '@/components/learn/PlainEnglishToggleBar'
import GuideProgressSummary from '@/components/learn/GuideProgressSummary'
import WeeklyLessonCard from '@/components/journey/WeeklyLessonCard'
import PlainEnglishText from '@/components/PlainEnglishText'

type TopicLink = {
  title: string
  description: string
  href: string
  premium?: boolean
}

type TopicSection = {
  id: string
  title: string
  description: string
  links: TopicLink[]
}

const LEARN_SECTIONS: TopicSection[] = [
  {
    id: 'money-loans',
    title: 'Money & Loans',
    description: 'Credit, DTI, loan programs, and pre-approval.',
    links: [
      { title: 'DTI explained', description: 'Front-end vs back-end ratios', href: '/resources#resource-dti-deep-dive' },
      { title: 'FHA loans', description: '3.5% down and MIP', href: '/resources#resource-fha-guide' },
      { title: 'VA loans', description: 'Zero down for eligible veterans', href: '/resources#resource-va-guide' },
      { title: 'USDA loans', description: 'Zero down in eligible areas', href: '/resources#resource-usda-guide' },
      { title: 'Compare loan programs', description: 'FHA vs conventional vs VA vs USDA', href: '/resources#resource-loan-program-comparison' },
      { title: 'PMI & MIP guide', description: 'When insurance drops off', href: '/resources#resource-pmi-optimization' },
      { title: 'Shop lenders', description: 'Pre-approval and comparing quotes', href: '/resources#resource-shop-lenders' },
      { title: 'Glossary', description: '42 plain-English mortgage terms', href: '/glossary' },
    ],
  },
  {
    id: 'shopping',
    title: 'Shopping for a Home',
    description: 'Search pacing, red flags, and neighborhoods.',
    links: [
      { title: 'Search without burnout', description: 'Must-haves and tour limits', href: '/resources#resource-search-without-burnout' },
      { title: 'Listing red flags', description: 'Price history and disclosure gaps', href: '/resources#resource-listing-red-flags' },
      { title: 'Neighborhood checklist', description: 'Commute, schools, flood risk', href: '/resources#resource-neighborhood-checklist' },
      { title: "Choose a buyer's agent", description: 'Interview questions', href: '/resources#resource-choose-buyers-agent' },
      { title: 'Neighborhood map', description: 'Explore areas on the map', href: '/map' },
    ],
  },
  {
    id: 'offers',
    title: 'Offers & Negotiation',
    description: 'Offer strategy, inspection, and premium scripts.',
    links: [
      { title: 'Offer guardrails', description: 'Walk-away number and contingencies', href: '/resources#resource-offer-guardrails' },
      { title: 'Home inspection guide', description: 'What to check and negotiate', href: '/resources#resource-inspection-guide' },
      { title: 'Appraisal basics', description: 'What happens during appraisal', href: '/resources#resource-appraisal-basics' },
      { title: 'Low appraisal options', description: 'Four paths if value comes in low', href: '/resources#resource-appraisal-low-guide' },
      { title: 'Offer script', description: 'Talking points for your offer', href: '/resources#resource-offer-script', premium: true },
      { title: 'Lender negotiation script', description: 'Compare Loan Estimates', href: '/resources#resource-negotiation-script-lender', premium: true },
    ],
  },
  {
    id: 'closing',
    title: 'Closing',
    description: 'Costs, escrow, title, and closing day.',
    links: [
      { title: 'Closing costs guide', description: 'Sections A, B, and C explained', href: '/resources#resource-closing-cost-guide' },
      { title: 'Escrow explained', description: 'Taxes and insurance in your payment', href: '/resources#resource-escrow-accounts-explained' },
      { title: 'Title insurance', description: 'Owner vs lender policy', href: '/resources#resource-title-insurance-explained' },
      { title: 'Closing day checklist', description: 'What to bring and wire safety', href: '/resources#resource-closing-day-checklist' },
      { title: 'Wire verification script', description: 'Confirm wiring by phone', href: '/resources#resource-closing-script', premium: true },
    ],
  },
  {
    id: 'after-move-in',
    title: 'After You Move In',
    description: 'Maintenance, scams, and where to get help.',
    links: [
      { title: 'First-year maintenance budget', description: '1–3% upkeep rule', href: '/resources#resource-first-year-maintenance-budget' },
      { title: 'Homeowner scams & help', description: 'Red flags and HUD counselors', href: '/resources#resource-homeowner-scams-and-help' },
      { title: 'Fair housing rights', description: 'Protected classes and complaints', href: '/resources#resource-fair-housing-guide' },
      { title: 'Buying solo', description: 'Guides for one-income buyers', href: '/learn/buying-solo' },
    ],
  },
  {
    id: 'tools',
    title: 'Tools & Planning',
    description: 'Calculators, quiz, workbook, and your roadmap.',
    links: [
      { title: 'Savings snapshot quiz', description: 'Personalized affordability', href: '/quiz' },
      { title: 'Down Payment Optimizer', description: 'Grants and assistance', href: '/down-payment-optimizer' },
      { title: 'Pre-purchase workbook', description: 'Printable checklists & worksheets', href: '/workbook' },
      { title: 'Homebuying FAQ', description: '31 questions by topic', href: '/learn/faq' },
      { title: 'Action Roadmap', description: 'Your step-by-step journey', href: '/customized-journey' },
      { title: 'All Playbooks', description: 'Full guide library', href: '/resources' },
    ],
  },
]

const START_PATHS = [
  {
    id: 'brand-new',
    title: 'Brand new to buying',
    steps: ['Take the quiz', 'Read DTI guide', 'Shop lenders'],
    hrefs: ['/quiz', '/resources#resource-dti-deep-dive', '/resources#resource-shop-lenders'],
  },
  {
    id: 'pre-approved',
    title: 'Already pre-approved',
    steps: ['Search pacing', 'Neighborhood checklist', 'Offer guardrails'],
    hrefs: [
      '/resources#resource-search-without-burnout',
      '/resources#resource-neighborhood-checklist',
      '/resources#resource-offer-guardrails',
    ],
  },
  {
    id: 'under-contract',
    title: 'Under contract',
    steps: ['Inspection guide', 'Appraisal options', 'Closing costs'],
    hrefs: [
      '/resources#resource-inspection-guide',
      '/resources#resource-appraisal-low-guide',
      '/resources#resource-closing-cost-guide',
    ],
  },
]

export default function LearnHubPage() {
  return (
    <div className="app-page-shell">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <BackToMyJourneyLink />
        <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-teal-800">Learn</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-[var(--nq-ed-text)]">Homebuying topics</h1>
        <p className="mt-3 max-w-2xl text-[var(--nq-ed-muted)]">
          <PlainEnglishText text="Browse by topic — each card links to a free guide, tool, or reference. Premium scripts are marked with a lock." />
        </p>

        <div className="mt-6 space-y-4">
          <PlainEnglishToggleBar />
          <GuideProgressSummary />
          <WeeklyLessonCard />
        </div>

        <section className="mt-10" aria-labelledby="start-here-heading">
          <h2 id="start-here-heading" className="font-display text-xl font-bold text-[var(--nq-ed-text)]">
            Start here
          </h2>
          <p className="mt-1 text-sm text-[var(--nq-ed-muted)]">Pick the path that matches where you are today.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {START_PATHS.map((path) => (
              <div
                key={path.id}
                className="rounded-xl border border-[var(--nq-ed-line-soft)] bg-white p-4 shadow-sm"
              >
                <h3 className="font-semibold text-[var(--nq-ed-text)]">{path.title}</h3>
                <ol className="mt-3 space-y-2 text-sm text-[var(--nq-ed-muted)]">
                  {path.steps.map((step, i) => (
                    <li key={step}>
                      <Link
                        href={path.hrefs[i]}
                        className="inline-flex items-center gap-1 font-medium text-teal-800 hover:underline"
                      >
                        {i + 1}. {step}
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-10 space-y-10">
          {LEARN_SECTIONS.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <h2 className="font-display text-xl font-bold text-[var(--nq-ed-text)]">{section.title}</h2>
              <p className="mt-1 text-sm text-[var(--nq-ed-muted)]">{section.description}</p>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {section.links.map((link) => (
                  <li key={link.href + link.title}>
                    <Link
                      href={link.href}
                      className="group flex h-full flex-col rounded-xl border border-[var(--nq-ed-line)] bg-white p-4 shadow-sm transition hover:border-[var(--nq-ed-accent)]/40 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-[var(--nq-ed-text)] group-hover:text-[var(--nq-ed-accent)]">
                          {link.title}
                        </span>
                        {link.premium ? (
                          <Lock className="h-4 w-4 shrink-0 text-amber-600" aria-label="Momentum premium" />
                        ) : (
                          <ArrowRight className="h-4 w-4 shrink-0 text-[var(--nq-ed-accent)] opacity-0 transition group-hover:opacity-100" aria-hidden />
                        )}
                      </div>
                      <span className="mt-1 text-sm text-[var(--nq-ed-muted)]">{link.description}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-12 flex items-start gap-3 rounded-xl border border-teal-200/80 bg-teal-50/50 p-5">
          <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-teal-700" aria-hidden />
          <div>
            <p className="font-semibold text-[var(--nq-ed-text)]">Prefer a guided path?</p>
            <p className="mt-1 text-sm text-[var(--nq-ed-muted)]">
              Start with the{' '}
              <Link href="/quiz" className="font-semibold text-[var(--nq-ed-accent)] hover:underline">
                savings snapshot quiz
              </Link>{' '}
              or open your{' '}
              <Link href="/customized-journey" className="font-semibold text-[var(--nq-ed-accent)] hover:underline">
                Action Roadmap
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

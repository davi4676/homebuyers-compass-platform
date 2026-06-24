'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import BackToMyJourneyLink from '@/components/BackToMyJourneyLink'

type FaqCategory = {
  id: string
  title: string
  items: { q: string; a: string; href?: string }[]
}

const FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: 'readiness',
    title: 'Am I ready to buy?',
    items: [
      {
        q: 'How much should I save before buying?',
        a: 'Plan for down payment plus closing costs (often 2–5% of price). Many buyers also keep reserves after closing. Use the quiz and Down Payment Optimizer for a personalized range.',
        href: '/down-payment-optimizer',
      },
      {
        q: 'What credit score do I need?',
        a: 'Many programs start around 620+. Stronger scores unlock better rates. Check your report free at AnnualCreditReport.com and see our credit guide in Playbooks.',
        href: '/resources#resource-credit-score-guide',
      },
      {
        q: 'What is DTI and why does it matter?',
        a: 'Debt-to-income compares your monthly debts (including the new housing payment) to gross income. Lenders use it to decide approval amounts.',
        href: '/resources#resource-dti-deep-dive',
      },
      {
        q: 'How much emergency fund should I keep after closing?',
        a: 'Many buyers keep 3–6 months of expenses plus a home repair buffer. Do not drain every dollar for the down payment.',
        href: '/resources#resource-first-year-maintenance-budget',
      },
      {
        q: 'Can I use gift money for my down payment?',
        a: 'Yes, with documentation. Lenders usually need a gift letter and proof the donor is not expecting repayment.',
        href: '/down-payment-optimizer',
      },
    ],
  },
  {
    id: 'programs',
    title: 'Loan types & programs',
    items: [
      {
        q: 'FHA vs conventional — which is better?',
        a: 'FHA often fits lower down payments and flexible credit. Conventional may cost less long-term if you have strong credit and 10–20% down. Compare both with your lender.',
        href: '/resources#resource-loan-program-comparison',
      },
      {
        q: 'Do I qualify for a VA loan?',
        a: 'Eligible veterans and service members may buy with no down payment and no monthly PMI. You need a Certificate of Eligibility and must occupy the home.',
        href: '/resources#resource-va-guide',
      },
      {
        q: 'What is a USDA loan?',
        a: 'USDA offers zero down in eligible rural/suburban areas with income limits. Check the official USDA eligibility map for your target address.',
        href: '/resources#resource-usda-guide',
      },
      {
        q: 'What is down payment assistance (DPA)?',
        a: 'Grants or secondary loans that help cover down payment or closing costs. Eligibility depends on location, income, and first-time status.',
        href: '/down-payment-optimizer',
      },
      {
        q: 'What is PMI and when does it go away?',
        a: 'Private mortgage insurance protects the lender when you put down less than 20%. On conventional loans it often drops at 78–80% LTV.',
        href: '/resources#resource-pmi-optimization',
      },
      {
        q: 'What is an ARM loan?',
        a: 'An adjustable-rate mortgage starts fixed, then adjusts. It can work if you plan to move or refinance before the fixed period ends.',
        href: '/resources#resource-arm-scenarios',
      },
    ],
  },
  {
    id: 'shopping',
    title: 'Shopping & offers',
    items: [
      {
        q: 'Do I need a real estate agent?',
        a: 'Not legally required, but most first-time buyers benefit from a buyer\'s agent. Interview at least two before signing.',
        href: '/resources#resource-choose-buyers-agent',
      },
      {
        q: 'Pre-qualification vs pre-approval?',
        a: 'Pre-qualification is a quick estimate. Pre-approval means the lender verified documents — sellers take it more seriously.',
        href: '/resources#resource-shop-lenders',
      },
      {
        q: 'Should I waive inspection to win a bid?',
        a: 'Rarely worth the risk. Inspections cost a few hundred dollars and can uncover issues worth thousands.',
        href: '/resources#resource-inspection-guide',
      },
      {
        q: 'What is earnest money?',
        a: 'A good-faith deposit with your offer. It shows seriousness and may be forfeited if you walk away outside your contingencies.',
        href: '/resources#resource-offer-guardrails',
      },
      {
        q: 'How long does closing usually take?',
        a: 'From accepted offer to keys often takes 30–45 days, depending on loan type, appraisal, and underwriting speed.',
        href: '/resources#resource-underwriting-checklist',
      },
    ],
  },
  {
    id: 'closing',
    title: 'Appraisal, underwriting & closing',
    items: [
      {
        q: 'What if my appraisal comes in low?',
        a: 'You can negotiate price, split the gap, bring cash, or challenge the appraisal. Your contingency may let you exit.',
        href: '/resources#resource-appraisal-low-guide',
      },
      {
        q: 'What should I not do during underwriting?',
        a: 'Avoid new debt, large unexplained deposits, and job changes without telling your loan officer.',
        href: '/resources#resource-underwriting-checklist',
      },
      {
        q: 'What is escrow?',
        a: 'An account where the lender holds money for property taxes and insurance, paid as part of many monthly payments.',
        href: '/resources#resource-escrow-accounts-explained',
      },
      {
        q: 'What do I bring on closing day?',
        a: 'Photo ID, verified funds for cash to close, and time for 1–2 hours of signing. Do a final walk-through first.',
        href: '/resources#resource-closing-day-checklist',
      },
      {
        q: 'How do I avoid wire fraud at closing?',
        a: 'Verify wiring instructions by calling your title company on a number from your contract — never trust email links alone.',
        href: '/resources#resource-closing-script',
      },
    ],
  },
  {
    id: 'after',
    title: 'After you move in',
    items: [
      {
        q: 'How much should I budget for maintenance?',
        a: 'Many owners plan 1–3% of home value per year for upkeep plus an emergency fund.',
        href: '/resources#resource-first-year-maintenance-budget',
      },
      {
        q: 'What scams should new homeowners watch for?',
        a: 'Wire fraud, predatory refi pitches, and storm-chasing contractors. Verify wires by phone on a known number.',
        href: '/resources#resource-homeowner-scams-and-help',
      },
      {
        q: 'When should I consider a refinance?',
        a: 'When lower rates, shorter term, or cash-out needs beat your break-even timeline after closing costs.',
        href: '/resources#resource-heloc-vs-refi',
      },
    ],
  },
  {
    id: 'rights',
    title: 'Fair housing & rights',
    items: [
      {
        q: 'What is fair housing discrimination?',
        a: 'Unequal treatment based on protected classes in renting or buying. Steering, different terms, or refusal to serve you may be signs.',
        href: '/resources#resource-fair-housing-guide',
      },
      {
        q: 'Where can I get free housing counseling?',
        a: 'HUD-approved counselors offer free help with budgets, credit, and programs. NestQuest is not a HUD-certified agency.',
        href: 'https://www.hud.gov/findhousingcounselors',
      },
    ],
  },
  {
    id: 'nestquest',
    title: 'About NestQuest',
    items: [
      {
        q: 'Is NestQuest free?',
        a: 'The assessment and core guides are free. Premium plans unlock scripts, deeper tools, and action plans.',
        href: '/upgrade',
      },
      {
        q: 'Does NestQuest earn referral fees?',
        a: 'No. We do not take kickbacks from lenders, agents, or title companies on your transaction.',
        href: '/resources#phase-methodology',
      },
    ],
  },
]

export default function LearnFaqPage() {
  const [openKey, setOpenKey] = useState<string | null>('readiness-0')

  return (
    <div className="app-page-shell">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <BackToMyJourneyLink />
        <h1 className="mt-6 font-display text-3xl font-bold text-[#1c1917]">Homebuying FAQ</h1>
        <p className="mt-2 text-sm leading-relaxed text-[#57534e]">
          31 plain-English answers by topic. For deeper guides see{' '}
          <Link href="/resources" className="font-semibold text-[#0d9488] hover:underline">
            Playbooks
          </Link>{' '}
          or the{' '}
          <Link href="/glossary" className="font-semibold text-[#0d9488] hover:underline">
            glossary
          </Link>
          .
        </p>

        <div className="mt-10 space-y-10">
          {FAQ_CATEGORIES.map((cat) => (
            <section key={cat.id} id={cat.id}>
              <h2 className="font-display text-xl font-bold text-[#1c1917]">{cat.title}</h2>
              <div className="mt-4 divide-y divide-[#e7e5e4] rounded-xl border border-[#e7e5e4] bg-white">
                {cat.items.map((item, i) => {
                  const key = `${cat.id}-${i}`
                  const isOpen = openKey === key
                  return (
                    <div key={key} className="px-4">
                      <button
                        type="button"
                        className="flex w-full items-start justify-between gap-3 py-4 text-left"
                        aria-expanded={isOpen}
                        onClick={() => setOpenKey(isOpen ? null : key)}
                      >
                        <span className="font-semibold text-[#1c1917]">{item.q}</span>
                        <ChevronDown
                          className={`mt-0.5 h-4 w-4 shrink-0 text-[#78716c] transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        />
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen ? (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <p className="pb-4 text-sm leading-relaxed text-[#57534e]">{item.a}</p>
                            {item.href ? (
                              <Link
                                href={item.href}
                                className="mb-4 inline-block text-sm font-semibold text-[#0d9488] hover:underline"
                              >
                                Read more →
                              </Link>
                            ) : null}
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-10 text-sm text-[#78716c]">
          Still exploring?{' '}
          <Link href="/quiz" className="font-semibold text-[#0d9488] hover:underline">
            Take the 90-second quiz
          </Link>
        </p>
      </div>
    </div>
  )
}

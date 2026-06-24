'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

const FAQS = [
  {
    q: 'What is NestQuest?',
    a: 'An independent homebuying advocate that matches you to grants, surfaces fee savings, and gives you scripts for every conversation.',
  },
  {
    q: 'How does it work?',
    a: 'Take a 90-second assessment, get a personalized savings snapshot, then follow clear steps from pre-approval to closing.',
  },
  {
    q: 'Is this really free?',
    a: 'The assessment and core guidance are free. Optional premium plans unlock deeper calculators and action plans.',
  },
  {
    q: 'Do you earn commissions from lenders?',
    a: 'No. We never take referral fees from lenders, agents, or title companies on your transaction.',
  },
  {
    q: 'How much can I save?',
    a: 'Buyers often surface opportunities in the $8,000–$15,000 range depending on location, eligibility, and deal details — not a guarantee. See our methodology for how we estimate.',
  },
  {
    q: 'Am I ready to buy a home?',
    a: 'You are likely ready to start when you have stable income, manageable debt, some savings for down payment and closing costs, and a timeline of at least several months. Take the free quiz at /quiz for a personalized readiness snapshot — it is a starting point, not a final verdict.',
  },
  {
    q: 'What if my loan gets denied?',
    a: 'A denial is not the end. Ask your lender exactly why — credit, DTI, employment, or property issues. Many buyers improve one factor and re-apply in 3–6 months. HUD-approved housing counselors can help you make a plan at no cost.',
  },
  {
    q: 'What if my appraisal comes in low?',
    a: 'You can ask the seller to lower the price, split the difference, bring extra cash, or challenge the appraisal with better comps. If none of those work, your appraisal contingency may let you walk away. See Playbooks for the full guide at /resources.',
  },
  {
    q: 'How much do I really need for closing?',
    a: 'Plan for your down payment plus closing costs — typically 2–5% of the purchase price on top of down payment. Programs and seller credits can reduce what you bring. Your savings snapshot breaks this down after the quiz.',
  },
  {
    q: 'Do I need a real estate agent?',
    a: 'You can buy without one, but most first-time buyers benefit from a buyer\'s agent who knows local norms and negotiates on your behalf. Interview at least two agents before signing. See /resources for our interview guide.',
  },
  {
    q: 'What\'s the difference between pre-qualification and pre-approval?',
    a: 'Pre-qualification is a quick estimate based on what you tell the lender. Pre-approval means they verified your documents — sellers take it more seriously. Get pre-approved before you make offers in competitive markets.',
  },
]

export default function NqFaqAccordion() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div>
      {FAQS.map((item, i) => {
        const isOpen = open === i
        const num = String(i + 1).padStart(2, '0')
        return (
          <div key={item.q} className="nq-sl-faq-item">
            <button
              type="button"
              className="nq-sl-faq-trigger"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : i)}
            >
              <span className="nq-sl-faq-num">{num}</span>
              <span className="flex-1">{item.q}</span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-[var(--nq-ed-muted)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="overflow-hidden"
                >
                  <p className="pb-4 pl-10 text-sm leading-relaxed text-[var(--nq-ed-muted)]">{item.a}</p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}

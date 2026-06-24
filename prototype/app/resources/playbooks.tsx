'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { CheckCircle, AlertTriangle } from 'lucide-react'
import GlossaryTooltip from '@/components/GlossaryTooltip'
import type { UserTier } from '@/lib/tiers'
import {
  LOAN_PROGRAMS_CATEGORY,
  FAIR_HOUSING_GUIDE,
  HOUSE_HUNTING_PHASE2,
  CLOSING_PHASE2,
  POST_CLOSING_CATEGORY,
} from '@/app/resources/phase2-content'
import { LOAN_ALTERNATIVES_GUIDES, ADVANCED_HOMEOWNER_GUIDES } from '@/app/resources/alternative-content'

export type PlaybookResource = {
  id: string
  title: string
  summary: string
  tierRequired?: UserTier
  type: 'guide' | 'script' | 'checklist' | 'tip'
  /** Shown on locked script cards for free users */
  teaser?: string
  content: ReactNode
}

export type PlaybookCategory = {
  id: string
  title: string
  resources: PlaybookResource[]
}

export const PLAYBOOK_CATEGORIES: PlaybookCategory[] = [
  {
    id: 'preparation',
    title: 'Phase 1 — Preparation & Credit',
    resources: [
      {
        id: 'credit-score-guide',
        title: 'How Your Credit Score Affects Your Mortgage Rate',
        summary: 'Small rate differences add up over 30 years — here is how to avoid overpaying.',
        type: 'guide',
        content: (
          <div className="space-y-4 text-sm text-slate-700">
            <p>
              Lenders use your credit score to set your interest rate. On a typical loan, even a 0.5% rate
              difference can mean tens of thousands in extra interest over 30 years.
            </p>
            <div className="rounded-xl border bg-slate-50 p-4">
              <p className="mb-2 font-semibold">Rate tiers by credit score (illustrative):</p>
              <ul className="space-y-1">
                <li>760+ → Best rates</li>
                <li>740–759 → Slightly higher</li>
                <li>720–739 → Moderate bump</li>
                <li>700–719 → Noticeable bump</li>
                <li>Below 700 → Highest rates on many programs</li>
              </ul>
            </div>
            <p className="font-semibold">Quick wins in 30–60 days:</p>
            <ul className="list-inside list-disc space-y-1">
              <li>
                Pay credit cards below 30% <GlossaryTooltip term="Utilization">utilization</GlossaryTooltip>
              </li>
              <li>Do not close old accounts (shortens your history)</li>
              <li>Dispute errors on your report at AnnualCreditReport.com</li>
              <li>Avoid opening new credit lines before you apply</li>
            </ul>
          </div>
        ),
      },
      {
        id: 'dti-deep-dive',
        title: 'DTI Explained: Front-End vs Back-End (With Examples)',
        summary: 'How lenders weigh housing vs total debt — and why your budget sketch matters.',
        type: 'guide',
        content: (
          <div className="space-y-4 text-sm text-slate-700">
            <p>
              <GlossaryTooltip term="DTI">DTI</GlossaryTooltip> is one of the first numbers lenders check. It
              answers: &ldquo;Can this payment fit your income alongside your other bills?&rdquo;
            </p>
            <div className="rounded-xl border bg-slate-50 p-4 space-y-3">
              <p>
                <strong><GlossaryTooltip term="Front-End DTI">Front-end DTI</GlossaryTooltip></strong> — housing
                payment only ÷ gross monthly income. Example: $2,000 payment on $8,000 income = 25%.
              </p>
              <p>
                <strong><GlossaryTooltip term="Back-End DTI">Back-end DTI</GlossaryTooltip></strong> — housing +
                all monthly debts ÷ gross income. Example: $2,000 housing + $600 car + $200 cards on $8,000 =
                35%.
              </p>
            </div>
            <p>
              Many programs look for back-end DTI around 43% or lower, but rules vary by loan type. A payment you
              can live with may be lower than the lender max — that is intentional.
            </p>
            <p className="font-semibold">What to do next:</p>
            <ul className="list-inside list-disc space-y-1">
              <li>Sketch your comfortable payment in your savings snapshot</li>
              <li>Pay down small debts before applying if back-end DTI is tight</li>
              <li>Ask lenders which DTI limit applies to your program</li>
            </ul>
          </div>
        ),
      },
      {
        id: 'pmi-optimization',
        title: 'PMI and MIP: When They Drop Off and How to Plan Ahead',
        summary: 'Mortgage insurance is not forever on most conventional loans — plan your down payment tier.',
        type: 'guide',
        content: (
          <div className="space-y-4 text-sm text-slate-700">
            <p>
              If you put down less than 20%, you may pay <GlossaryTooltip term="PMI">PMI</GlossaryTooltip> on
              conventional loans. FHA loans use <GlossaryTooltip term="MIP">MIP</GlossaryTooltip> instead — rules
              differ, so compare both paths.
            </p>
            <p className="font-semibold">Conventional PMI — typical milestones:</p>
            <ul className="list-inside list-disc space-y-1">
              <li>PMI usually required below 20% down</li>
              <li>Many loans allow removal near 78–80% <GlossaryTooltip term="LTV">LTV</GlossaryTooltip></li>
              <li>Extra $5k–$10k down upfront can eliminate years of monthly PMI</li>
            </ul>
            <p className="font-semibold">FHA MIP — know the difference:</p>
            <ul className="list-inside list-disc space-y-1">
              <li>Upfront premium at closing plus monthly MIP on many FHA loans</li>
              <li>MIP may last for the life of the loan depending on down payment and term</li>
              <li>Refinancing to conventional later is a common exit strategy once you have equity</li>
            </ul>
            <p>Run scenarios in the Down Payment Optimizer before you fix your down payment amount.</p>
          </div>
        ),
      },
      {
        id: 'first-time-mistakes',
        title: '10 Mistakes First-Time Buyers Make (and How to Avoid Them)',
        summary: 'Common missteps that cost money, time, or peace of mind — and what to do instead.',
        type: 'guide',
        content: (
          <div className="space-y-4 text-sm text-slate-700">
            <ol className="list-decimal list-inside space-y-3">
              <li><strong>Shopping only one lender</strong> — Get at least three <GlossaryTooltip term="Loan Estimate">Loan Estimates</GlossaryTooltip> within 14 days.</li>
              <li><strong>Budgeting to the lender max</strong> — Set your own walk-away number below approval.</li>
              <li><strong>Skipping pre-approval</strong> — <GlossaryTooltip term="Pre-approval">Pre-approval</GlossaryTooltip> beats pre-qualification in competitive markets.</li>
              <li><strong>Waiving inspection</strong> — A $400 inspection can save thousands in surprises.</li>
              <li><strong>Ignoring closing costs</strong> — Plan 2–5% beyond down payment for <GlossaryTooltip term="Closing Costs">closing costs</GlossaryTooltip>.</li>
              <li><strong>New debt before closing</strong> — No cars, cards, or furniture financing during <GlossaryTooltip term="Underwriting">underwriting</GlossaryTooltip>.</li>
              <li><strong>Trusting wire instructions by email</strong> — Verify by phone on a known number.</li>
              <li><strong>Emotional bidding wars</strong> — Use offer guardrails and backup properties.</li>
              <li><strong>Not reading the Closing Disclosure</strong> — You have three business days to review.</li>
              <li><strong>No post-closing budget</strong> — Plan 1–3% of home value yearly for maintenance.</li>
            </ol>
          </div>
        ),
      },
      FAIR_HOUSING_GUIDE,
      {
        id: 'doc-checklist',
        title: 'Document Checklist: Everything Lenders Ask For',
        summary: 'Have these ready before you apply.',
        type: 'checklist',
        content: (
          <div className="space-y-3 text-sm text-slate-700">
            <p>Gather these before starting pre-approval to avoid delays:</p>
            {[
              { group: 'Identity', items: ['Government-issued photo ID', 'Social Security number'] },
              {
                group: 'Income',
                items: ['2 years W-2s or 1099s', '2 recent pay stubs', '2 years tax returns (federal)', 'Profit & loss if self-employed'],
              },
              {
                group: 'Assets',
                items: ['2 months bank statements (all accounts)', '401(k) / investment statements', 'Gift letter if receiving family funds'],
              },
              { group: 'Debts', items: ['List of monthly debt payments', 'Rental history / landlord contact'] },
            ].map((g) => (
              <div key={g.group} className="rounded-xl border bg-slate-50 p-3">
                <p className="mb-2 font-semibold">{g.group}</p>
                <ul className="space-y-1">
                  {g.items.map((i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ),
      },
    ],
  },
  {
    id: 'pre-approval',
    title: 'Phase 2 — Getting Pre-Approved',
    resources: [
      {
        id: 'shop-lenders',
        title: 'Why You Must Shop At Least 3 Lenders',
        summary: 'Rates and fees vary — comparing saves money on day one.',
        type: 'guide',
        content: (
          <div className="space-y-4 text-sm text-slate-700">
            <p>
              Buyers who compare multiple lenders often find meaningfully different fees and rates. Yet many
              people contact only one lender.
            </p>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="mb-1 font-semibold text-amber-800">The credit check myth</p>
              <p className="text-amber-700">
                Multiple mortgage inquiries within a 14-day window usually count as one hard pull. Shop freely.
              </p>
            </div>
            <p className="font-semibold">Compare line-by-line on the Loan Estimate:</p>
            <ul className="list-inside list-disc space-y-1">
              <li>Interest rate (not just <GlossaryTooltip term="APR">APR</GlossaryTooltip>)</li>
              <li><GlossaryTooltip term="Origination">Origination</GlossaryTooltip> fees (Section A)</li>
              <li><GlossaryTooltip term="Discount Points">Discount points</GlossaryTooltip></li>
              <li><GlossaryTooltip term="Lender Credits">Lender credits</GlossaryTooltip></li>
              <li>Total cash to close</li>
            </ul>
          </div>
        ),
      },
      {
        id: 'negotiation-script-lender',
        title: 'Script: Negotiating With Your Lender',
        summary: 'Use this when you have a competing offer.',
        type: 'script',
        tierRequired: 'momentum',
        teaser:
          'Use this when you have a competing Loan Estimate in hand. It creates urgency without sounding hostile.',
        content: (
          <div className="space-y-4 text-sm text-slate-700">
            <div className="rounded-xl border-2 border-slate-300 bg-slate-50 p-4 italic">
              <p>
                &ldquo;I&apos;ve received a competing Loan Estimate from [Bank Name] offering [rate]% with [X] in
                origination fees. I&apos;d prefer to work with you — can you match or improve on that? I&apos;m ready
                to move forward today if so.&rdquo;
              </p>
            </div>
            <p className="font-semibold">What is negotiable in most cases:</p>
            <ul className="list-inside list-disc space-y-1">
              <li>Origination / processing fees</li>
              <li>Application fees</li>
              <li>Rate lock fees</li>
              <li>Title insurance (Section C — shop separately)</li>
            </ul>
          </div>
        ),
      },
      {
        id: 'readiness-score-script',
        title: 'Script: Using Your Preparedness as Leverage',
        summary: 'Plain-language script when your readiness score is 70+ and you have competing offers.',
        type: 'script',
        tierRequired: 'momentum',
        teaser:
          'Use after comparing at least two Loan Estimates when your NestQuest readiness score is 70+. Asks for specific fee improvements.',
        content: (
          <div className="space-y-4 text-sm text-slate-700">
            <p className="font-semibold">When to use this:</p>
            <p>
              After you have at least two <GlossaryTooltip term="Loan Estimate">Loan Estimates</GlossaryTooltip>{' '}
              and your readiness score is 70 or higher.
            </p>
            <div className="rounded-xl border-2 border-slate-300 bg-slate-50 p-4 italic">
              <p>
                &ldquo;I&apos;ve done my homework — my credit is in good shape, my documents are ready, and I&apos;m
                shopping multiple lenders. I&apos;d like to work with you if you can match [competitor rate]% with
                lower origination fees. What can you do on Section A fees or lender credits?&rdquo;
              </p>
            </div>
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-blue-800">
              <p>
                Prepared buyers get better responses. Ask for something specific — rate plus Section A fees — not
                vague &ldquo;best deal&rdquo; language.
              </p>
            </div>
          </div>
        ),
      },
    ],
  },
  {
    ...LOAN_PROGRAMS_CATEGORY,
    resources: [...LOAN_PROGRAMS_CATEGORY.resources, ...LOAN_ALTERNATIVES_GUIDES],
  },
  {
    id: 'house-hunting',
    title: 'Phase 3 — House Hunting & Offer Strategy',
    resources: [
      {
        id: 'choose-buyers-agent',
        title: "How to Choose a Buyer's Agent: 10 Questions and Red Flags",
        summary: 'Your agent should advocate for you — interview before you commit.',
        type: 'guide',
        content: (
          <div className="space-y-4 text-sm text-slate-700">
            <p>
              A <GlossaryTooltip term="Buyer's Agent">buyer&apos;s agent</GlossaryTooltip> works for you, not the
              seller. A good fit saves money and stress; a poor fit costs both.
            </p>
            <p className="font-semibold">10 questions to ask:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>How many buyers did you help close in my target area last year?</li>
              <li>How do you handle multiple offers?</li>
              <li>Will you preview homes before we tour?</li>
              <li>How do you recommend setting our max offer?</li>
              <li>How do you negotiate inspection results?</li>
              <li>Can you explain your commission and who pays it?</li>
              <li>Do you have recommended lenders — and do you receive referral fees?</li>
              <li>How quickly do you respond after hours?</li>
              <li>What is your contract length and cancellation policy?</li>
              <li>Can I speak with two recent buyer clients?</li>
            </ol>
            <p className="font-semibold">Red flags:</p>
            <ul className="list-inside list-disc space-y-1">
              <li>Pressure to skip inspection or waive contingencies by default</li>
              <li>Vague answers about experience in your neighborhoods</li>
              <li>Dual agency without clear disclosure of conflicts</li>
            </ul>
          </div>
        ),
      },
      ...HOUSE_HUNTING_PHASE2,
      {
        id: 'offer-guardrails',
        title: 'Offer Guardrails: Stay Competitive Without Overpaying',
        summary: 'How to set a hard cap and avoid emotional overbidding.',
        type: 'guide',
        content: (
          <div className="space-y-4 text-sm text-slate-700">
            <p>
              Before touring, set a walk-away number based on your comfortable budget — not the lender&apos;s max
              approval. That protects cash flow and reduces panic bidding.
            </p>
            <div className="rounded-xl border bg-slate-50 p-4">
              <p className="mb-2 font-semibold">Offer rules that reduce regret:</p>
              <ul className="list-inside list-disc space-y-1">
                <li>Set max offer before your first bid</li>
                <li>Use recent <GlossaryTooltip term="Comps">comps</GlossaryTooltip>, not listing hype</li>
                <li>Keep inspection and financing <GlossaryTooltip term="Contingency">contingencies</GlossaryTooltip></li>
                <li>Plan two backup properties</li>
              </ul>
            </div>
          </div>
        ),
      },
      {
        id: 'offer-script',
        title: 'Script: Presenting a Strong Offer Without Overcommitting',
        summary: 'Use this with your agent to stay assertive and disciplined.',
        type: 'script',
        tierRequired: 'momentum',
        teaser:
          'Keeps urgency high while preserving inspection and financing contingencies — use when you are ready to bid.',
        content: (
          <div className="space-y-4 text-sm text-slate-700">
            <div className="rounded-xl border-2 border-slate-300 bg-slate-50 p-4 italic">
              <p>
                &ldquo;We love the property and are prepared to move quickly. Our strongest offer today is $[X], with
                financing and inspection contingencies in place. If terms align, we can proceed immediately.&rdquo;
              </p>
            </div>
            <p>Preserves protections and budget discipline while showing seriousness.</p>
          </div>
        ),
      },
    ],
  },
  {
    id: 'negotiation',
    title: 'Phase 4 — Negotiation & Inspection',
    resources: [
      {
        id: 'inspection-guide',
        title: 'Home Inspection: What to Look For and Negotiate',
        summary: 'Never waive the inspection, even in a hot market.',
        type: 'guide',
        content: (
          <div className="space-y-4 text-sm text-slate-700">
            <p>
              A home inspection typically costs a few hundred dollars and can uncover issues worth thousands. The
              report gives you leverage — or a clear reason to walk away under your{' '}
              <GlossaryTooltip term="Contingency">contingency</GlossaryTooltip>.
            </p>
            <p className="font-semibold">Focus areas:</p>
            <ul className="list-inside list-disc space-y-1">
              <li>Foundation cracks or settling</li>
              <li>Roof age and condition</li>
              <li>HVAC age and condition</li>
              <li>Electrical panel (knob-and-tube or aluminum wiring = red flag)</li>
              <li>Water damage / mold in basement and attic</li>
              <li>Plumbing — polybutylene pipe</li>
            </ul>
            <div className="rounded-xl border bg-slate-50 p-4">
              <p className="mb-2 font-semibold">After inspection: how to negotiate</p>
              <ul className="list-inside list-disc space-y-1">
                <li>Ask for repairs on major items (roof, HVAC, foundation)</li>
                <li>Or ask for a price reduction / closing cost credit</li>
                <li>Do not nickel-and-dime cosmetic items</li>
              </ul>
            </div>
          </div>
        ),
      },
    ],
  },
  {
    id: 'underwriting',
    title: 'Phase 5 — Underwriting & Appraisal',
    resources: [
      {
        id: 'appraisal-basics',
        title: 'What Happens During a Home Appraisal',
        summary: 'The lender’s value check — what to expect and how it affects your loan.',
        type: 'guide',
        content: (
          <div className="space-y-4 text-sm text-slate-700">
            <p>
              An <GlossaryTooltip term="Appraisal">appraisal</GlossaryTooltip> is an independent opinion of your
              home&apos;s value. The lender uses it to confirm the property supports the loan amount.
            </p>
            <p className="font-semibold">Typical timeline:</p>
            <ul className="list-inside list-disc space-y-1">
              <li>Ordered by the lender after your offer is accepted</li>
              <li>Appraiser visits the property (often 30–60 minutes)</li>
              <li>Report compares your home to recent <GlossaryTooltip term="Comps">comps</GlossaryTooltip></li>
              <li>Results arrive in about a week — timing varies</li>
            </ul>
            <p>
              If value comes in at or above your contract price, you proceed as planned. If it comes in low, see
              our guide on your four options — you are not stuck without choices.
            </p>
          </div>
        ),
      },
      {
        id: 'underwriting-checklist',
        title: 'Underwriting Checklist: What to Do (and Not Do) Before Closing',
        summary: 'Avoid last-minute denials and delays.',
        type: 'checklist',
        content: (
          <div className="space-y-4 text-sm text-slate-700">
            <p>
              You are in the home stretch. <GlossaryTooltip term="Underwriting">Underwriting</GlossaryTooltip> is
              when the lender verifies everything one last time. Small moves can delay — or derail — your loan.
            </p>
            <p className="font-semibold">Do this:</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                Reply to document requests within 24 hours — missing paperwork is the top delay cause.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                Keep finances steady. Tell your loan officer before job changes or large transfers.
              </li>
            </ul>
            <p className="font-semibold">Do not do this:</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                Do not open new credit (cards, car loans, furniture financing). New debt changes approval math.
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                Do not deposit unexplained cash — lenders need a paper trail and gift letters where required.
              </li>
            </ul>
            <p>
              If something changes — job loss, medical bill, family gift — call your loan officer the same day.
            </p>
          </div>
        ),
      },
      {
        id: 'appraisal-low-guide',
        title: 'If Appraisal Comes in Low: Your 4 Options',
        summary: 'Action plan for one of the most stressful moments.',
        type: 'guide',
        content: (
          <div className="space-y-4 text-sm text-slate-700">
            <p>
              <strong>What happened:</strong> The appraised value came in below your offer price. That is stressful
              — but common, and you have options.
            </p>
            <p className="font-semibold">Your 4 paths forward:</p>
            <ol className="list-decimal list-inside space-y-2">
              <li>
                <strong>Ask the seller to lower the price</strong> — Best when the gap is small and the seller is
                motivated.
              </li>
              <li>
                <strong>Meet in the middle</strong> — You and the seller each give a little when both want to close.
              </li>
              <li>
                <strong>Bring extra cash to closing</strong> — Only if the payment still fits your budget at the
                appraised value.
              </li>
              <li>
                <strong>Challenge the appraisal</strong> — Request reconsideration with stronger{' '}
                <GlossaryTooltip term="Comps">comps</GlossaryTooltip> if you believe errors exist.
              </li>
            </ol>
            <p>
              <strong>How to decide:</strong> Ignore sunk-cost emotion. Run the numbers on monthly payment and cash
              reserves. If it no longer fits, your appraisal contingency protects you.
            </p>
          </div>
        ),
      },
    ],
  },
  {
    id: 'closing',
    title: 'Phase 6 — Closing Costs Demystified',
    resources: [
      {
        id: 'closing-cost-guide',
        title: 'Every Closing Fee Explained (and Which Ones to Negotiate)',
        summary: 'Most buyers see this for the first time at the closing table.',
        type: 'guide',
        content: (
          <div className="space-y-4 text-sm text-slate-700">
            <p>
              <GlossaryTooltip term="Closing Costs">Closing costs</GlossaryTooltip> are typically 2–5% of the
              purchase price. On a $350,000 home that is roughly $7,000–$17,500.
            </p>
            {[
              {
                section: 'Section A: Origination (negotiable)',
                items: ['Origination / underwriting fee', 'Discount points', 'Application fee'],
              },
              {
                section: 'Section B: Required services',
                items: ['Appraisal fee', 'Credit report', 'Flood determination'],
              },
              {
                section: 'Section C: Services you can shop',
                items: ['Title insurance', 'Settlement fee', 'Escrow fee'],
              },
              {
                section: 'Prepaids',
                items: ['First-year homeowners insurance', 'Property tax escrow', 'Prepaid daily interest'],
              },
            ].map((g) => (
              <div key={g.section} className="rounded-xl border bg-slate-50 p-4">
                <p className="mb-2 font-semibold">{g.section}</p>
                <ul className="list-inside list-disc space-y-1">
                  {g.items.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ),
      },
      ...CLOSING_PHASE2,
      {
        id: 'closing-script',
        title: 'Script: Negotiating Closing Costs at the Table',
        summary: 'Works best when you review the Closing Disclosure 3+ days before closing.',
        type: 'script',
        tierRequired: 'momentum',
        teaser:
          'Use during your three-day Closing Disclosure review window to negotiate specific fees or credits.',
        content: (
          <div className="space-y-4 text-sm text-slate-700">
            <div className="rounded-xl border-2 border-slate-300 bg-slate-50 p-4 italic">
              <p>
                &ldquo;I&apos;ve reviewed my Closing Disclosure and noticed [fee name] is $X. I found a competing
                quote for $Y. Can you match that, or credit me $Z toward closing costs? I&apos;m ready to proceed
                today if so.&rdquo;
              </p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="text-amber-800">
                You have three business days to review the{' '}
                <GlossaryTooltip term="Closing Disclosure">Closing Disclosure</GlossaryTooltip> before signing.
              </p>
            </div>
          </div>
        ),
      },
    ],
  },
  {
    ...POST_CLOSING_CATEGORY,
    resources: [...POST_CLOSING_CATEGORY.resources, ...ADVANCED_HOMEOWNER_GUIDES],
  },
  {
    id: 'methodology',
    title: 'Bias-Free Methodology',
    resources: [
      {
        id: 'why-unbiased',
        title: 'How NestQuest Recommendations Stay Unbiased',
        summary: 'What data we use and what incentives we intentionally avoid.',
        type: 'tip',
        content: (
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              Recommendations come from your quiz inputs, affordability math, closing-cost assumptions, and risk
              heuristics — not referral fees.
            </p>
            <div className="rounded-xl border bg-slate-50 p-4">
              <p className="mb-2 font-semibold">In practice:</p>
              <ul className="list-inside list-disc space-y-1">
                <li>We prioritize your comfort zone over lender max approvals</li>
                <li>We surface negotiable fees even when providers prefer you not to ask</li>
                <li>Scripts improve your position — not ours</li>
              </ul>
            </div>
            <p>
              Typical savings opportunities fall in the $8k–$15k range depending on location, eligibility, and deal
              details — not a guaranteed amount for every buyer.
            </p>
          </div>
        ),
      },
    ],
  },
]

export function ScriptUpgradeTeaser({ resourceId, teaser }: { resourceId: string; teaser: string }) {
  return (
    <div className="mb-3 rounded-lg border border-[var(--nq-ed-line-soft)] bg-slate-50/80 px-3 py-2 text-xs leading-relaxed text-[var(--nq-ed-muted)]">
      <p>{teaser}</p>
      <Link
        href={`/upgrade?source=resources-${resourceId}`}
        className="mt-1 inline-flex font-semibold text-[var(--nq-ed-accent)] hover:underline"
      >
        Unlock the full script with Momentum →
      </Link>
    </div>
  )
}

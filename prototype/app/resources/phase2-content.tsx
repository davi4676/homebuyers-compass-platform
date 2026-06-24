'use client'

import Link from 'next/link'
import { CheckCircle, AlertTriangle } from 'lucide-react'
import GlossaryTooltip from '@/components/GlossaryTooltip'
import type { PlaybookCategory, PlaybookResource } from '@/app/resources/playbooks'

export const LOAN_PROGRAMS_CATEGORY: PlaybookCategory = {
  id: 'loan-programs',
  title: 'Loan Programs — FHA, VA, USDA & Conventional',
  resources: [
    {
      id: 'fha-guide',
      title: 'FHA Loans Explained: Who They Fit and What to Expect',
      summary: '3.5% down, flexible credit — plus MIP rules you should know upfront.',
      type: 'guide',
      content: (
        <div className="space-y-4 text-sm text-slate-700">
          <p>
            An <GlossaryTooltip term="FHA Loan">FHA loan</GlossaryTooltip> is government-backed — not issued by FHA
            directly, but insured through approved lenders. It is popular with first-time buyers who need a lower down
            payment or more flexible credit guidelines.
          </p>
          <p className="font-semibold">Who FHA often fits:</p>
          <ul className="list-inside list-disc space-y-1">
            <li>Credit scores often starting around 580+ for 3.5% down (lender overlays vary)</li>
            <li>Buyers with limited savings for down payment and closing</li>
            <li>Primary residence purchases that meet FHA property standards</li>
          </ul>
          <p className="font-semibold">Costs to plan for:</p>
          <ul className="list-inside list-disc space-y-1">
            <li>Minimum 3.5% down on many purchases</li>
            <li>
              <GlossaryTooltip term="MIP">MIP</GlossaryTooltip> — upfront premium at closing plus monthly MIP on most
              FHA loans
            </li>
            <li>FHA appraisal may flag property condition issues conventional loans might allow</li>
          </ul>
          <p className="font-semibold">FHA vs conventional — quick check:</p>
          <ul className="list-inside list-disc space-y-1">
            <li>Need lowest down payment and credit is still building? FHA may win.</li>
            <li>Have 10–20% down and strong credit? Conventional may have lower long-term insurance cost.</li>
          </ul>
          <p>
            Run both scenarios in the{' '}
            <Link href="/down-payment-optimizer" className="font-semibold text-[var(--nq-ed-accent)] hover:underline">
              Down Payment Optimizer
            </Link>
            .
          </p>
        </div>
      ),
    },
    {
      id: 'va-guide',
      title: 'VA Loans Explained: Eligibility, Benefits, and the Funding Fee',
      summary: 'Zero down and no monthly PMI for many eligible veterans — know the funding fee rules.',
      type: 'guide',
      content: (
        <div className="space-y-4 text-sm text-slate-700">
          <p>
            A <GlossaryTooltip term="VA Loan">VA loan</GlossaryTooltip> is a benefit for eligible veterans, active-duty
            service members, and some surviving spouses. It is one of the strongest programs for qualified buyers.
          </p>
          <p className="font-semibold">Key benefits:</p>
          <ul className="list-inside list-disc space-y-1">
            <li>Often no down payment required</li>
            <li>No monthly PMI on VA loans</li>
            <li>Competitive rates from VA-approved lenders</li>
          </ul>
          <p className="font-semibold">Eligibility basics:</p>
          <ul className="list-inside list-disc space-y-1">
            <li>Meet minimum service requirements (varies by era and duty type)</li>
            <li>Obtain a Certificate of Eligibility (COE) from VA or through your lender</li>
            <li>Occupy the home as your primary residence</li>
          </ul>
          <p className="font-semibold">
            <GlossaryTooltip term="Funding Fee">Funding fee</GlossaryTooltip>:
          </p>
          <p>
            Most VA loans include a one-time funding fee at closing (unless exempt due to disability or other criteria).
            The fee varies by down payment, prior VA use, and service type. You can often finance it into the loan.
          </p>
          <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-900">
            Ask a VA-savvy lender to quote VA vs conventional side-by-side — do not assume VA always wins on total cost.
          </p>
        </div>
      ),
    },
    {
      id: 'usda-guide',
      title: 'USDA Rural Development Loans: Zero Down in Eligible Areas',
      summary: 'No down payment for qualifying buyers in eligible locations — income limits apply.',
      type: 'guide',
      content: (
        <div className="space-y-4 text-sm text-slate-700">
          <p>
            A <GlossaryTooltip term="USDA Loan">USDA loan</GlossaryTooltip> helps moderate-income buyers in eligible
            rural and suburban areas buy with no down payment. &ldquo;Rural&rdquo; includes many areas outside major
            city cores — check the map before you assume you do not qualify.
          </p>
          <p className="font-semibold">Who USDA often fits:</p>
          <ul className="list-inside list-disc space-y-1">
            <li>Property in a USDA-eligible area</li>
            <li>Household income at or below local limits (often tied to <GlossaryTooltip term="AMI">AMI</GlossaryTooltip>)</li>
            <li>Primary residence, modest home for the area</li>
          </ul>
          <p className="font-semibold">Costs to plan for:</p>
          <ul className="list-inside list-disc space-y-1">
            <li>0% down on qualifying purchases</li>
            <li>Upfront and annual guarantee fees (similar role to FHA MIP)</li>
            <li>Closing costs still apply — programs may help</li>
          </ul>
          <p>
            Check address eligibility:{' '}
            <a
              href="https://eligibility.sc.egov.usda.gov/eligibility/welcomeAction.do"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[var(--nq-ed-accent)] hover:underline"
            >
              USDA eligibility map (official)
            </a>
          </p>
        </div>
      ),
    },
    {
      id: 'loan-program-comparison',
      title: 'FHA vs Conventional vs VA vs USDA: Which Loan Fits You?',
      summary: 'Side-by-side comparison and a 5-question self-check.',
      type: 'guide',
      content: (
        <div className="space-y-4 text-sm text-slate-700">
          <div className="overflow-x-auto rounded-xl border">
            <table className="min-w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-3 font-semibold">Program</th>
                  <th className="p-3 font-semibold">Typical down</th>
                  <th className="p-3 font-semibold">Mortgage insurance</th>
                  <th className="p-3 font-semibold">Best for</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="p-3">Conventional</td>
                  <td className="p-3">3–20%+</td>
                  <td className="p-3">PMI if under 20%</td>
                  <td className="p-3">Strong credit, flexible property types</td>
                </tr>
                <tr>
                  <td className="p-3">FHA</td>
                  <td className="p-3">3.5%+</td>
                  <td className="p-3">MIP (often long-term)</td>
                  <td className="p-3">Lower down, credit rebuilding</td>
                </tr>
                <tr>
                  <td className="p-3">VA</td>
                  <td className="p-3">0%</td>
                  <td className="p-3">No monthly PMI</td>
                  <td className="p-3">Eligible veterans & service members</td>
                </tr>
                <tr>
                  <td className="p-3">USDA</td>
                  <td className="p-3">0%</td>
                  <td className="p-3">Guarantee fee</td>
                  <td className="p-3">Eligible area + income limits</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="font-semibold">5-question self-check:</p>
          <ol className="list-decimal list-inside space-y-2">
            <li>Are you eligible for VA? If yes, get a VA quote first.</li>
            <li>Is the property in a USDA-eligible area with income within limits?</li>
            <li>Is your down payment under 10% with credit below 680? Compare FHA vs conventional PMI/MIP.</li>
            <li>Is the property a fixer-upper? FHA may have stricter condition rules.</li>
            <li>Will you stay 7+ years? Upfront fees and MIP matter more if you move soon.</li>
          </ol>
          <p>Ask your lender to model two programs on the same home price — numbers beat marketing.</p>
        </div>
      ),
    },
  ],
}

export const FAIR_HOUSING_GUIDE: PlaybookResource = {
  id: 'fair-housing-guide',
  title: 'Fair Housing: Your Rights When Buying a Home',
  summary: 'Protected classes, warning signs, and how to get help — educational overview only.',
  type: 'guide',
  content: (
    <div className="space-y-4 text-sm text-slate-700">
      <p>
        The Fair Housing Act protects buyers from discrimination in housing-related transactions. Everyone deserves
        equal professional treatment from lenders, agents, and sellers.
      </p>
      <p className="font-semibold">Protected classes include (federal):</p>
      <ul className="list-inside list-disc space-y-1">
        <li>Race, color, national origin</li>
        <li>Religion, sex (including gender identity and sexual orientation under current HUD interpretation)</li>
        <li>Familial status and disability</li>
      </ul>
      <p className="font-semibold">Warning signs:</p>
      <ul className="list-inside list-disc space-y-1">
        <li>Steering — pushed toward or away from neighborhoods based on who you are</li>
        <li>Different loan terms offered without a clear financial reason</li>
        <li>Refusal to show homes or accept offers in your qualified range</li>
        <li>Discouraging questions or rushing you to waive protections</li>
      </ul>
      <p className="font-semibold">If you experience discrimination:</p>
      <ul className="list-inside list-disc space-y-1">
        <li>Document dates, names, and what was said or done</li>
        <li>
          File a complaint with HUD:{' '}
          <a
            href="https://www.hud.gov/program_offices/fair_housing_equal_opp/online-complaint"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[var(--nq-ed-accent)] hover:underline"
          >
            HUD fair housing complaint (official)
          </a>
        </li>
        <li>Consider state or local fair housing agencies for additional support</li>
      </ul>
      <p className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-600">
        <strong>Not legal advice.</strong> This guide is educational. For specific situations, consult a qualified
        attorney or HUD-approved housing counselor.
      </p>
    </div>
  ),
}

export const HOUSE_HUNTING_PHASE2: PlaybookResource[] = [
  {
    id: 'search-without-burnout',
    title: 'How to Search for a Home Without Burning Out',
    summary: 'Pace yourself, define must-haves, and use comps — not listing hype.',
    type: 'guide',
    content: (
      <div className="space-y-4 text-sm text-slate-700">
        <p>House hunting is a marathon. Burnout leads to rushed offers and regret.</p>
        <p className="font-semibold">Before you tour:</p>
        <ul className="list-inside list-disc space-y-1">
          <li>List 5 must-haves vs 5 nice-to-haves — stick to must-haves in week one</li>
          <li>Set a weekly tour limit (e.g., 3–5 homes)</li>
          <li>Research <GlossaryTooltip term="Comps">comps</GlossaryTooltip> before you fall in love with a listing price</li>
        </ul>
        <p className="font-semibold">During open houses:</p>
        <ul className="list-inside list-disc space-y-1">
          <li>Take photos and notes — memory fades fast</li>
          <li>Visit neighborhoods at different times (commute, noise, parking)</li>
          <li>Ask about utility costs, HOA rules, and recent special assessments</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'listing-red-flags',
    title: 'Listing Red Flags: What to Watch Before You Fall in Love',
    summary: 'Price history, photos vs reality, and disclosure gaps.',
    type: 'guide',
    content: (
      <div className="space-y-4 text-sm text-slate-700">
        <p className="font-semibold">Listing signals worth a closer look:</p>
        <ul className="list-inside list-disc space-y-1">
          <li>Multiple price drops in 60 days — why?</li>
          <li>Long days on market in a hot area — hidden condition issues?</li>
          <li>Photos that skip rooms (no basement, no garage interior)</li>
          <li>&ldquo;As-is&rdquo; without a corresponding discount</li>
          <li>Vague disclosure answers or delayed seller documents</li>
        </ul>
        <p>
          Red flags are not automatic noes — they are prompts to inspect thoroughly and adjust your offer price or
          contingencies.
        </p>
      </div>
    ),
  },
  {
    id: 'neighborhood-checklist',
    title: 'Neighborhood Checklist Before You Make an Offer',
    summary: 'Commute, schools, flood risk, and future development.',
    type: 'guide',
    content: (
      <div className="space-y-4 text-sm text-slate-700">
        <p>You are buying the neighborhood too — not just the house.</p>
        <ul className="space-y-2">
          {[
            'Commute at rush hour (drive or transit the real route)',
            'Schools and ratings if that matters to resale',
            'Crime and walkability — use third-party tools as starting points',
            'Flood zone and insurance quotes (not all maps tell the full story)',
            'Planned development, noise sources, flight paths',
            'Property tax trend and special assessments',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              {item}
            </li>
          ))}
        </ul>
        <p>
          Explore walkability tools on{' '}
          <Link href="/map" className="font-semibold text-[var(--nq-ed-accent)] hover:underline">
            Neighborhood map
          </Link>
          .
        </p>
      </div>
    ),
  },
]

export const CLOSING_PHASE2: PlaybookResource[] = [
  {
    id: 'escrow-accounts-explained',
    title: 'Escrow Accounts Explained: Taxes, Insurance, and Your Monthly Payment',
    summary: 'Why part of your payment sits in escrow and how to avoid surprises.',
    type: 'guide',
    content: (
      <div className="space-y-4 text-sm text-slate-700">
        <p>
          <GlossaryTooltip term="Escrow">Escrow</GlossaryTooltip> (also called impounds) is an account your lender
          uses to pay property taxes and homeowners insurance on your behalf. It is part of many{' '}
          <GlossaryTooltip term="PITI">PITI</GlossaryTooltip> payments.
        </p>
        <p className="font-semibold">What to expect:</p>
        <ul className="list-inside list-disc space-y-1">
          <li>Upfront escrow funding at closing (often 2–3 months of taxes/insurance)</li>
          <li>Annual escrow analysis — payment may adjust when taxes or premiums change</li>
          <li>Shortage notices if costs rise — you may owe a lump sum or higher monthly payment</li>
        </ul>
        <p>Escrow is not junk fees — but buyers are often surprised the first time taxes or insurance jump.</p>
      </div>
    ),
  },
  {
    id: 'title-insurance-explained',
    title: 'Title Insurance Explained: Owner’s vs Lender’s Policy',
    summary: 'What title search finds and why shopping Section C saves money.',
    type: 'guide',
    content: (
      <div className="space-y-4 text-sm text-slate-700">
        <p>
          <GlossaryTooltip term="Title">Title</GlossaryTooltip> is the legal ownership record.{' '}
          <GlossaryTooltip term="Title Insurance">Title insurance</GlossaryTooltip> protects against defects — liens,
          boundary disputes, recording errors — that existed before you bought.
        </p>
        <p className="font-semibold">Two policies:</p>
        <ul className="list-inside list-disc space-y-1">
          <li><strong>Lender&apos;s policy</strong> — required by your mortgage; protects the lender</li>
          <li><strong>Owner&apos;s policy</strong> — protects you; often recommended in many states</li>
        </ul>
        <p>
          Title fees appear in Section C of your Loan Estimate — you can shop providers. Comparing three quotes may
          save hundreds.
        </p>
      </div>
    ),
  },
  {
    id: 'closing-day-checklist',
    title: 'Closing Day Checklist: What to Bring and What to Expect',
    summary: 'ID, verified wires, final walk-through — plan 1–2 hours for signing.',
    type: 'checklist',
    content: (
      <div className="space-y-4 text-sm text-slate-700">
        <p>Closing day is paperwork-heavy but manageable with a short checklist.</p>
        <p className="font-semibold">Before closing day:</p>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
            Final walk-through — confirm repairs and condition match the contract
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
            Review Closing Disclosure — compare to your last Loan Estimate
          </li>
          <li className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            Verify wire instructions by phone on a number you look up — never trust email alone
          </li>
        </ul>
        <p className="font-semibold">Bring:</p>
        <ul className="list-inside list-disc space-y-1">
          <li>Government-issued photo ID</li>
          <li>Cashier&apos;s check or confirmed wire for cash to close (per closing agent instructions)</li>
          <li>Proof of homeowners insurance if requested</li>
        </ul>
        <p>Plan 1–2 hours for signing. Read before you sign — especially fee lines that changed.</p>
      </div>
    ),
  },
]

export const POST_CLOSING_CATEGORY: PlaybookCategory = {
  id: 'post-closing',
  title: 'Phase 7 — Post-Closing & Homeownership',
  resources: [
    {
      id: 'first-year-maintenance-budget',
      title: 'First-Year Maintenance Budget: Plan Before the First Repair Bill',
      summary: '1–3% rule, emergency fund, and seasonal checklist.',
      type: 'guide',
      content: (
        <div className="space-y-4 text-sm text-slate-700">
          <p>Closing is the starting line for ownership costs — not the finish.</p>
          <p className="font-semibold">Budget rule of thumb:</p>
          <ul className="list-inside list-disc space-y-1">
            <li>Set aside 1–3% of home value per year for maintenance and repairs</li>
            <li>Keep 3–6 months of expenses in an emergency fund if you can</li>
            <li>Watch escrow/tax notices — premiums and property taxes change</li>
          </ul>
          <p className="font-semibold">Seasonal basics:</p>
          <ul className="list-inside list-disc space-y-1">
            <li>HVAC filters, gutter cleaning, smoke/CO detectors</li>
            <li>Review homeowners insurance at renewal — rebuild cost coverage</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'homeowner-scams-and-help',
      title: 'Homeowner Scams and Where to Get Help',
      summary: 'Wire fraud, predatory refi, storm chasers — plus trusted resources.',
      type: 'guide',
      content: (
        <div className="space-y-4 text-sm text-slate-700">
          <p>Scammers target new homeowners when public records update after closing.</p>
          <p className="font-semibold">Red flags:</p>
          <ul className="list-inside list-disc space-y-1">
            <li>Too-good refinance offers demanding upfront fees</li>
            <li>Equity theft or deed fraud schemes</li>
            <li>Contractors knocking after storms with pressure to sign today</li>
            <li>Any wire instruction change by email only</li>
          </ul>
          <p className="font-semibold">Trusted help:</p>
          <ul className="list-inside list-disc space-y-1">
            <li>
              <a href="https://www.hud.gov/findacounselor" target="_blank" rel="noopener noreferrer" className="font-semibold text-[var(--nq-ed-accent)] hover:underline">
                HUD-approved housing counselors
              </a>
            </li>
            <li>Your loan servicer&apos;s loss mitigation line if you fall behind on payments</li>
            <li>State attorney general or consumer protection for fraud reports</li>
          </ul>
          <p>Act early if money gets tight — options shrink the longer you wait.</p>
        </div>
      ),
    },
  ],
}

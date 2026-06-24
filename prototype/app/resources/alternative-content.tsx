'use client'

import GlossaryTooltip from '@/components/GlossaryTooltip'
import type { PlaybookResource } from '@/app/resources/playbooks'

/** Alternative loan & pricing strategies — linked from journey Library. */
export const LOAN_ALTERNATIVES_GUIDES: PlaybookResource[] = [
  {
    id: 'lender-credit-tradeoff',
    title: 'Lender Credits vs. Rate: When the Trade-Off Helps',
    summary: 'A slightly higher rate may buy closing help you need now — know the break-even.',
    type: 'guide',
    content: (
      <div className="space-y-4 text-sm text-slate-700">
        <p>
          <GlossaryTooltip term="Lender Credits">Lender credits</GlossaryTooltip> reduce your cash to close in exchange
          for a slightly higher note rate. They appear on your{' '}
          <GlossaryTooltip term="Loan Estimate">Loan Estimate</GlossaryTooltip> as negative fees or a credit line.
        </p>
        <p className="font-semibold">When credits often make sense:</p>
        <ul className="list-inside list-disc space-y-1">
          <li>You are short on cash for closing but can afford the monthly payment</li>
          <li>You plan to refinance or sell within a few years (short hold time)</li>
          <li>You need to preserve emergency savings after closing</li>
        </ul>
        <p className="font-semibold">Break-even check:</p>
        <p>
          Compare monthly payment with and without credits. Divide the credit amount by the monthly difference to see
          how many months until the higher payment &ldquo;costs&rdquo; more than the upfront help.
        </p>
        <p>Ask your lender to show both options on the same Loan Estimate — side-by-side numbers beat guessing.</p>
      </div>
    ),
  },
  {
    id: 'arm-scenarios',
    title: 'ARM Loans: Fixed Period, Caps, and Exit Plans',
    summary: 'When an adjustable rate fits a 3–7 year hold — and when it does not.',
    type: 'guide',
    content: (
      <div className="space-y-4 text-sm text-slate-700">
        <p>
          An <GlossaryTooltip term="ARM">ARM</GlossaryTooltip> starts with a fixed rate for a set period (often 5, 7,
          or 10 years), then adjusts based on market indexes. It can beat a 30-year fixed if you will move or refinance
          before the fixed period ends.
        </p>
        <p className="font-semibold">Ask your lender:</p>
        <ul className="list-inside list-disc space-y-1">
          <li>How long is the initial fixed period?</li>
          <li>What are the annual and lifetime rate caps?</li>
          <li>What is the worst-case payment after adjustments?</li>
        </ul>
        <p className="font-semibold">Red flags:</p>
        <ul className="list-inside list-disc space-y-1">
          <li>No clear exit plan if you stay past the fixed period</li>
          <li>Payment shock you cannot absorb if rates rise</li>
          <li>ARM chosen only for a lower teaser rate without comparing fixed options</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'buydown-structures',
    title: 'Seller Buydowns: Temporary vs. Permanent Payment Help',
    summary: 'How seller concessions can lower your early payments — and what they cost the seller.',
    type: 'guide',
    content: (
      <div className="space-y-4 text-sm text-slate-700">
        <p>
          A buydown uses upfront money (often from the seller) to reduce your interest rate for a period or for the life
          of the loan. It can make your offer more affordable early without lowering the purchase price.
        </p>
        <p className="font-semibold">Common structures:</p>
        <ul className="list-inside list-disc space-y-1">
          <li>
            <strong>2-1 buydown:</strong> Year 1 rate −2%, year 2 −1%, then standard rate
          </li>
          <li>
            <strong>Permanent buydown:</strong> Pay <GlossaryTooltip term="Discount Points">discount points</GlossaryTooltip>{' '}
            at closing for a lower rate long-term
          </li>
        </ul>
        <p>
          Seller concessions must fit loan program limits and your contract terms. Compare total cost over 5–7 years,
          not just year-one payment.
        </p>
      </div>
    ),
  },
  {
    id: 'reno-loan-primer',
    title: 'Renovation Loans: Rolling Repairs Into Your Mortgage',
    summary: 'When FHA 203(k) or similar programs fit — and when a separate rehab loan is safer.',
    type: 'guide',
    content: (
      <div className="space-y-4 text-sm text-slate-700">
        <p>
          Renovation loans let you finance purchase plus qualified repairs in one mortgage. They help when the home needs
          work but the price reflects that — if the numbers and contractor plan align.
        </p>
        <p className="font-semibold">Typical requirements:</p>
        <ul className="list-inside list-disc space-y-1">
          <li>Licensed contractor bids and lender-approved scope of work</li>
          <li>Appraisal that supports &ldquo;as-completed&rdquo; value</li>
          <li>Draw schedule — funds released as work is verified</li>
          <li>More paperwork and timeline than a standard purchase</li>
        </ul>
        <p className="font-semibold">When to pause:</p>
        <ul className="list-inside list-disc space-y-1">
          <li>Open-ended DIY scope with no contractor bid</li>
          <li>Major structural unknowns before inspection</li>
          <li>Timeline pressure that cannot absorb rehab delays</li>
        </ul>
        <p>Ask lenders experienced with renovation products — not every loan officer handles them regularly.</p>
      </div>
    ),
  },
]

/** Advanced homeowner guides — post-closing & lifecycle. */
export const ADVANCED_HOMEOWNER_GUIDES: PlaybookResource[] = [
  {
    id: 'heloc-vs-refi',
    title: 'HELOC vs. Cash-Out Refi: When Each Fits',
    summary: 'Tap equity for repairs or debt — compare cost, rate, and timeline.',
    type: 'guide',
    content: (
      <div className="space-y-4 text-sm text-slate-700">
        <p>
          A <strong>HELOC</strong> is a line of credit secured by your home — draw as needed, pay interest only on what
          you use. A <strong>cash-out refinance</strong> replaces your mortgage with a larger loan and gives you the
          difference in cash at closing.
        </p>
        <p className="font-semibold">HELOC often fits when:</p>
        <ul className="list-inside list-disc space-y-1">
          <li>You need flexible access over months for phased projects</li>
          <li>Your first mortgage rate is lower than today&apos;s refi rates</li>
          <li>You can repay the line within a few years</li>
        </ul>
        <p className="font-semibold">Cash-out refi often fits when:</p>
        <ul className="list-inside list-disc space-y-1">
          <li>You want one fixed payment and a lump sum now</li>
          <li>Current rates beat your existing note rate</li>
          <li>You will stay in the home long enough to recoup closing costs</li>
        </ul>
        <p>Both put your home on the line — compare total cost, not just the teaser rate.</p>
      </div>
    ),
  },
  {
    id: 'homeowners-insurance-primer',
    title: 'Homeowners Insurance Before Closing',
    summary: 'Bind coverage early — lenders need proof before funding.',
    type: 'guide',
    content: (
      <div className="space-y-4 text-sm text-slate-700">
        <p>
          Your lender requires proof of <GlossaryTooltip term="Homeowners Insurance">homeowners insurance</GlossaryTooltip>{' '}
          before closing. Start shopping as soon as you are under contract — underwriting can take a week or more.
        </p>
        <p className="font-semibold">Compare at least three quotes on:</p>
        <ul className="list-inside list-disc space-y-1">
          <li>Dwelling coverage (rebuild cost — not always equal to purchase price)</li>
          <li>Deductible and wind/hail exclusions in your area</li>
          <li>Personal liability and loss-of-use limits</li>
        </ul>
        <p>
          You may need flood or earthquake coverage separately depending on zone. Ask your agent what the lender&apos;s
          minimum requirements are before you bind.
        </p>
      </div>
    ),
  },
]

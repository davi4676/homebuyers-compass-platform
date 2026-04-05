/**
 * NQ-Guided Action Roadmap — single source of truth for step-by-step flow.
 * Each step is shown one at a time with NQ as the guide.
 * Tier gating: phaseOrder 1–2 = Foundations; phase 3+ needs Momentum+.
 */

import type { UserTier } from './tiers'

export type NQStepPhaseId =
  | 'preparation'
  | 'pre-approval'
  | 'house-hunting'
  | 'negotiation'
  | 'underwriting'
  | 'closing'
  | 'post-closing'
  | 'homeowner-hub'

export interface NqWhyItMattersCard {
  title: string
  /** Plain language; supports `**bold**` tokens like other NQ fields. */
  detail: string
}

export interface NQGuidedStep {
  id: string
  order: number
  /** Must match `JOURNEY_PHASES_DATA[].id` in journey-phases-data. */
  phaseId: NQStepPhaseId
  /** Library journey `order` (1–7). Tier gating: phaseOrder <= 2 = free. */
  phaseOrder: number
  title: string
  /**
   * Why we're doing this (NQ speaks first).
   * Emphasis: `**text**` → bold blue; `[[y:text]]` → bold amber; `[[g:text]]` → bold green.
 * Personalization: `[[s: ... {{token}} ...]]` expands when a savings snapshot exists (see `lib/user-snapshot.ts`).
   */
  nqContext: string
  nqWhatToDo: string // The action
  /** Default “why it matters” paragraph when `nqWhyItMattersCards` is not set. */
  nqWhatItMeans?: string
  /** When set, renders as mini cards instead of a single `nqWhatItMeans` block. */
  nqWhyItMattersCards?: NqWhyItMattersCard[]
  nqEncouragement?: string // Optional encouragement
  toolLink?: string // e.g. /results, /down-payment-optimizer
  toolLabel?: string
  /** Minimum tier to use linked tool (step still visible on Foundations where allowed). */
  tierRequired?: UserTier
  /** Optional short bullets shown in Your Phase (checkboxes, persisted per user). */
  nqPhaseChecklist?: string[]
}

/** Colored second line under the milestone title in the action roadmap (`Phase n — …`). */
export const NQ_ROADMAP_PHASE_LINE: Record<number, string> = {
  1: 'Preparation & Credit',
  2: 'Get Pre-Approved',
  3: 'Find Your Home',
  4: 'Negotiation & Inspection',
  5: 'Underwriting & Final Approval',
  6: 'Closing & Move-In',
  7: 'Post-Closing & Beyond',
  8: 'Homeowner Hub',
}

/** Tailwind text color classes for `NQ_ROADMAP_PHASE_LINE` (one distinct hue per phase). */
export const NQ_ROADMAP_PHASE_LINE_COLOR: Record<number, string> = {
  1: 'text-teal-600',
  2: 'text-emerald-600',
  3: 'text-amber-700',
  4: 'text-orange-600',
  5: 'text-violet-600',
  6: 'text-teal-600',
  7: 'text-green-700',
  8: 'text-teal-700',
}

export const NQ_GUIDED_STEPS: NQGuidedStep[] = [
  {
    id: 'welcome',
    order: 1,
    phaseId: 'preparation',
    phaseOrder: 1,
    title: 'Welcome to your home buying journey',
    nqContext:
      "Hi{{greetingName}}! I'm **NQ**, your **home buying guide**. We'll take this **one step at a time** — no overwhelm, just **clear next moves** — and I'll help you **find savings** at every step along the way.[[s: From your **savings snapshot**, you're focused on **{{city}}** on a **{{timeline}}** timeline.]]",
    nqWhatToDo:
      "Let's start with the foundation: your **credit score** and **documents**. Most buyers spend **2–4 weeks** here.",
    nqPhaseChecklist: [
      'Check your credit score (free at AnnualCreditReport.com)',
      'Gather your 4 core documents (tax returns, pay stubs, bank statements, ID)',
    ],
    nqWhyItMattersCards: [
      {
        title: 'Closing costs matter',
        detail:
          'You need cash for **closing**, not just the down payment. Having tax returns, pay stubs, and bank statements lined up early makes **pre-approval** much faster.',
      },
      {
        title: 'Rent vs buy depends on time horizon',
        detail:
          'How long you plan to stay usually matters more than the monthly payment alone. Build a budget with **room after closing**—not only the payment lenders quote.',
      },
      {
        title: 'DTI drives your approval',
        detail:
          'Lenders weight **debt-to-income** heavily—often around **43%** back-end on many loans (programs vary). **620+** credit opens more doors; **740+** helps unlock better rates.',
      },
    ],
  },
  {
    id: 'credit-score',
    order: 2,
    phaseId: 'preparation',
    phaseOrder: 1,
    title: 'Check your credit score',
    nqContext:
      "Before anything else, let's see where you stand. Your **credit score** tells lenders how **risky** you are, and it's **free** to check.",
    nqWhatToDo:
      'Check your credit at AnnualCreditReport.com (free, no credit card). Aim for at least 620+ on many loans; 740+ for the best rates.[[s: You indicated the **{{creditBand}}** range—confirm it matches what lenders will pull.]]',
    nqWhatItMeans:
      'Lenders use this number to set your mortgage rate. A 0.5% rate difference can mean $50–100/month on a $300K loan. Paying cards below **30% utilization** can boost your score in 30–60 days. **Dispute errors** on your reports promptly — mistakes can cost you approval or rate. You\'re entitled to **free weekly** reports through **AnnualCreditReport.com** (verify all three bureaus over time).',
    nqEncouragement: 'Knowledge is power. Checking is the first step.',
    nqPhaseChecklist: [
      'Pull your free reports from all three bureaus (or start with one)',
      'Confirm the score band matches what you shared with NQ',
      'Note any errors to dispute before you apply',
    ],
    toolLink: 'https://www.annualcreditreport.com',
    toolLabel: 'Check your credit',
  },
  {
    id: 'gather-docs',
    order: 3,
    phaseId: 'preparation',
    phaseOrder: 1,
    title: 'Gather your 4 core documents',
    nqContext:
      "**Lenders** will ask for these sooner or later. Having them ready means **faster pre-approval** and **fewer delays**.[[s: Your snapshot shows about **{{incomeAnnual}}**/year income and **{{downPayment}}** toward the buy—line up docs that prove both.]]",
    nqWhatToDo: 'Collect: 2 years of tax returns, 2 months of pay stubs, 2 months of bank statements, and a government ID.',
    nqWhatItMeans:
      "These prove your income and assets. Without them, you can't get pre-approved. While you gather them, note **large deposits** (source may need explaining) and start thinking about **down payment + reserves** so you're not surprised at underwriting.",
    nqEncouragement: 'A little prep now saves a lot of stress later.',
    nqPhaseChecklist: [
      '2 years of tax returns',
      '2 months of pay stubs',
      '2 months of bank statements',
      'Government-issued ID',
    ],
  },
  {
    id: 'pre-approved',
    order: 4,
    phaseId: 'pre-approval',
    phaseOrder: 2,
    title: 'Get pre-approved, not pre-qualified',
    nqContext:
      "**Pre-qualified** is a quick estimate. **Pre-approved** means the lender verified everything — **sellers take you seriously**.",
    nqWhatToDo:
      'Apply for pre-approval (not just pre-qualification) so you have a real commitment letter from a lender.[[s: Bring **{{downPayment}}** available and the **{{creditBand}}** credit story; your comfortable max is near **{{realisticMax}}**.]]',
    nqWhatItMeans:
      "Pre-approval requires the lender to verify your income, assets, and credit. It's the gold standard. Sellers and agents treat pre-approved buyers as ready to close. You're getting **mortgage-ready**: stable income, documented assets, and credit that matches the **loan channel** you want (conventional, FHA, VA, USDA — your loan officer can match you).",
    nqEncouragement: "You're moving from 'maybe' to 'ready.'",
  },
  {
    id: 'shop-lenders',
    order: 5,
    phaseId: 'pre-approval',
    phaseOrder: 2,
    title: 'Shop 3+ lenders in 14 days',
    nqContext:
      "**Rates vary** by lender. Shopping around can save you **$50–100/month** — and multiple pulls within **14 days** count as **one credit check**.",
    nqWhatToDo:
      'Get quotes from at least 3 lenders within a 14-day window. Compare **note rate and APR** (APR reflects the cost of credit including fees), **discount points vs lender credits**, and **PMI/MIP** if your down payment is below ~20% on conventional. Ask **fixed vs ARM** tradeoffs if offered an ARM.',
    nqWhatItMeans:
      "Every **0.125%** matters on the rate, but **fees** matter too — compare **Loan Estimates** apples-to-apples. Ask about **rate locks** and use competing offers: 'I've received [X] — can you match or improve?' Watch for **pressure** to pick the first quote or hide fees — you choose your lender.[[s: Around a **{{realisticMax}}** buy, small rate changes move **{{monthlyPayment}}**/mo-style payments more than on a smaller loan.]]",
    nqEncouragement: 'A little comparison goes a long way.',
    toolLink: '/mortgage-shopping',
    toolLabel: 'Mortgage Savings Roadmap',
    tierRequired: 'momentum',
  },
  {
    id: 'non-negotiables',
    order: 6,
    phaseId: 'house-hunting',
    phaseOrder: 3,
    title: 'Define your non-negotiables',
    nqContext:
      "Before you start touring, know what you won't compromise on. It saves **time** and prevents **buyer's remorse**.[[s: {{targetComfortNote}}]]",
    nqWhatToDo: 'List your must-haves (schools, commute, bedrooms) and your walk-away budget. Stick to it.',
    nqWhatItMeans:
      "Buyers who define this before touring make faster, better decisions. In a hot market, emotions run high — having non-negotiables keeps you grounded. Tie your **max comfortable payment** to **PITI + HOA + maintenance**, not just the lender's max — **fair housing**: you have the right to equal professional service regardless of race, religion, family status, disability, and other protected classes.",
    nqEncouragement: 'Clarity now = confidence later.',
  },
  {
    id: 'find-agent',
    order: 7,
    phaseId: 'house-hunting',
    phaseOrder: 3,
    title: 'Find an agent with local experience',
    nqContext:
      "Your agent is your **advocate**. Find someone with **5+ years** in **YOUR area** — they know the market and can spot **red flags**.",
    nqWhatToDo: 'Interview at least 3 agents. Look for someone who has closed deals in your target ZIP in the last 6 months.',
    nqWhatItMeans:
      "Local knowledge = gold. They know which neighborhoods are up-and-coming, which have foundation issues, and what offers typically win. You'll also lean on a **loan officer** (your lender), **home inspector** (condition), **appraiser** (value for the lender), and **title/closing** (ownership history and settlement). Ask your agent who typically coordinates **what** and **when**.",
    nqEncouragement: 'The right agent makes all the difference.',
  },
  {
    id: 'make-offer',
    order: 8,
    phaseId: 'negotiation',
    phaseOrder: 4,
    title: 'Make competitive offers',
    nqContext:
      "In a balanced market, **3–5%** below asking can be reasonable. But check **days on market** and recent **comps** first.",
    nqWhatToDo:
      'Prepare your offer strategy. Consider earnest money, escalation clauses, and contingencies. Confirm how you\'ll get **proof of homeowners insurance** before closing — lenders require it.',
    nqWhatItMeans:
      "Multiple offers? Try an escalation clause: 'I'll pay $X above the highest bid up to $Y max.' Larger earnest money shows you're serious. **Title/escrow** will open once you're under contract; that's normal — they're clearing liens and preparing to record your deed.",
    nqEncouragement: 'Strategy beats emotion.',
  },
  {
    id: 'contingencies',
    order: 9,
    phaseId: 'negotiation',
    phaseOrder: 4,
    title: 'Always include these contingencies',
    nqContext:
      "**Protect yourself.** **Never waive inspection** — even in hot markets. **Financing** and **appraisal** contingencies give you an **out** if things go wrong.",
    nqWhatToDo:
      'Include inspection (7–10 days), financing, and appraisal contingencies in your offer. Line up **homeowners insurance** early — your lender will require proof before closing. You typically get **title insurance** (lender\'s + optional owner\'s) through the title company.',
    nqWhatItMeans:
      "If you waive inspection, you're buying as-is. **Inspection** flags safety/cost issues to negotiate or walk away. **Appraisal** is the lender's value check — if it's low, you may need to renegotiate price, bridge the gap with cash, or exit if your contract allows. **Escrow/title** clears liens and records the deed — don't skip questions if something looks off.",
    nqEncouragement: 'Protection first, speed second.',
  },
  {
    id: 'underwriting-docs',
    order: 10,
    phaseId: 'underwriting',
    phaseOrder: 5,
    title: 'Respond to doc requests within 24 hours',
    nqContext:
      "**Underwriting** = the lender verifies everything. Expect **2–4 weeks**. Don't make **big purchases** or **change jobs** during this time.",
    nqWhatToDo: 'Upload requested documents within 24 hours. Set phone notifications so you don\'t miss anything.',
    nqWhatItMeans:
      "The faster you respond, the faster you close. Document requests are normal — bank statements, pay stubs, letters of explanation, maybe an **appraisal review** or **updated insurance** binder. Just send them quickly. Big new debt can change your **DTI** and derail approval.[[s: Your snapshot readiness is **{{readiness}}/100**—answer underwriting faster than the **{{timeline}}** clock is ticking.]]",
    nqEncouragement: 'Speed here = keys sooner.',
  },
  {
    id: 'closing-disclosure',
    order: 11,
    phaseId: 'closing',
    phaseOrder: 6,
    title: 'Review your Closing Disclosure',
    nqContext:
      "You'll get this **3 days before closing**. Compare it to your **Loan Estimate** — numbers **shouldn't change** much.",
    nqWhatToDo: 'Review your Closing Disclosure line by line. Compare to your Loan Estimate. Question any unexpected changes.',
    nqWhatItMeans:
      "Closing costs are often **2–5%** of the loan depending on market and taxes/insurance escrows. Watch **Estimated Cash to Close** and compare to your Loan Estimate — **loan origination**, **title**, and some **third-party** fees may still be negotiable. **Lender's title insurance** is standard; **owner's title** policy is often a smart add in many states.[[s: For a **{{targetHomeOrRealistic}}** buy, escrows and prepaids often move cash-to-close more than people expect—question big swings vs your Loan Estimate.]]",
    nqEncouragement: 'Almost there.',
  },
  {
    id: 'closing-day',
    order: 12,
    phaseId: 'closing',
    phaseOrder: 6,
    title: 'Close and celebrate',
    nqContext:
      "Bring your **ID**. Plan **1–2 hours** for signing. Then — you're a **homeowner**.",
    nqWhatToDo:
      'Do a **final walk-through** shortly before closing to confirm repairs and condition match the contract. Bring **government ID** and **cashier\'s check or wire** instructions from your closing agent — **verify wire instructions by phone** to a known number (wire fraud is real). Sign, fund, get keys, celebrate.',
    nqWhatItMeans:
      "You've made it. Plan **1–2 hours** signing. After closing, set aside **~3% of price** (rule of thumb) for first-year maintenance, furniture, and surprises — ownership has ongoing costs beyond the mortgage.[[s: Around **{{targetHomeOrRealistic}}**, many owners use **{{maintainLow}}–{{maintainHigh}}**/year as a starting maintenance band.]]",
    nqEncouragement: "You did it! 🎉🔑",
  },
  {
    id: 'preserve-homeownership',
    order: 13,
    phaseId: 'post-closing',
    phaseOrder: 7,
    title: 'Budget for ownership — maintenance and emergencies',
    nqContext:
      "Closing isn't the finish line — it's the **start** of **protecting** what you bought. A little planning now avoids **panic** later.",
    nqWhatToDo:
      'Set aside **1–3% of home value per year** for maintenance (rule of thumb), keep **3–6 months** of expenses in an emergency fund if you can, and schedule seasonal checklists (HVAC filters, gutters, smoke/CO detectors). Review **homeowners insurance** at renewal — coverage should match rebuild cost.[[s: If your place is near **{{targetHomeOrRealistic}}**, **{{maintainLow}}–{{maintainHigh}}**/year is a practical starting rhythm before the first big repair bill hits.]]',
    nqWhatItMeans:
      "Homes **consume cash**: roofs, appliances, and systems age. **Escrow** pays taxes/insurance if you chose that — watch notices so premiums and tax bills don't shock you. If income drops or a big bill hits, **talk to your lender or a HUD-approved housing counselor early** — options get worse if you wait.",
    nqEncouragement: 'Small habits now = fewer crises later.',
  },
  {
    id: 'stay-safe-homeowner',
    order: 14,
    phaseId: 'post-closing',
    phaseOrder: 7,
    title: 'Avoid scams and know where to get help',
    nqContext:
      "**Scammers** love homeowners — especially right after closing when public records are fresh. **Smart habits** beat regret.",
    nqWhatToDo:
      'Know the red flags: **too-good refi offers**, anyone demanding **upfront fees** for a "guaranteed" modification, **wire fraud** (always verify instructions), and **contractor** door-knockers after storms. For trusted help: **HUD housing counseling** (hud.gov), your **loan servicer\'s loss-mitigation** line if you fall behind, and state/local **homeowner legal aid** for serious disputes.',
    nqWhatItMeans:
      "**Predatory** lenders and **equity theft** scams target stress and urgency — if it feels rushed or secret, pause and verify. You have rights under **fair lending** and **servicing** rules; document everything. Preserving homeownership is about **early action** and **trusted sources**, not shame.",
    nqEncouragement: 'You earned the keys — protect them wisely.',
  },
  {
    id: 'homeowner-hub-intro',
    order: 15,
    phaseId: 'homeowner-hub',
    phaseOrder: 8,
    title: 'Welcome to your Homeowner Hub',
    nqContext:
      'You\'ve **closed** — huge milestone. This hub helps you **protect** your investment and **stay ahead** on refi and equity.',
    nqWhatToDo:
      'Use **Refinance Monitor** for rate-drop alerts, check **Equity Tracker** for a quick estimate, and **Refer a Friend** if someone else is buying.',
    nqWhatItMeans:
      'Homeownership is an ongoing journey: rates move, equity builds, and plans change. NestQuest keeps lightweight tools here so you don\'t have to hunt for updates.',
    nqEncouragement: '🏡 You made it — now make it work for you.',
  },
]

/** Last step index (0-based) that Foundations users can access. Steps 0 through this index are Foundations. */
export const NQ_FOUNDATIONS_LAST_STEP_INDEX = 4 // Steps 0-4: welcome through shop-lenders (phases 1-2)

/** v2 = readiness-score step removed; v3 = post-closing milestones appended; v4 = Homeowner Hub (phase 8). */
export const NQ_GUIDED_SCHEMA_VERSION = 4

/**
 * v0→v1: indices at or after removed readiness step shift down by 1.
 * v2→v3: steps appended only — clamp current/completed indices into new length.
 */
export function migrateNQGuidedLocalStorageIfNeeded(): void {
  if (typeof window === 'undefined') return
  try {
    let v = Number(localStorage.getItem('nq_guided_schema_version') || '0')
    if (v >= NQ_GUIDED_SCHEMA_VERSION) return

    if (v < 2) {
      const rawStep = JSON.parse(localStorage.getItem('nq_current_step') || '0')
      let idx = Math.max(0, Number(rawStep))
      if (idx >= 4) idx -= 1
      idx = Math.min(idx, NQ_GUIDED_STEPS.length - 1)
      localStorage.setItem('nq_current_step', String(idx))

      const doneRaw = JSON.parse(localStorage.getItem('nq_completed_steps') || '[]') as number[]
      const nextDone = new Set<number>()
      for (const i of doneRaw) {
        if (typeof i !== 'number' || i < 0) continue
        nextDone.add(i >= 4 ? i - 1 : i)
      }
      localStorage.setItem('nq_completed_steps', JSON.stringify([...nextDone]))
      v = 2
    }

    if (v < 3) {
      const rawStep = JSON.parse(localStorage.getItem('nq_current_step') || '0')
      let idx = Math.max(0, Number(rawStep))
      idx = Math.min(idx, NQ_GUIDED_STEPS.length - 1)
      localStorage.setItem('nq_current_step', String(idx))

      const doneRaw = JSON.parse(localStorage.getItem('nq_completed_steps') || '[]') as number[]
      const nextDone = new Set<number>()
      for (const i of doneRaw) {
        if (typeof i !== 'number' || i < 0 || i >= NQ_GUIDED_STEPS.length) continue
        nextDone.add(i)
      }
      localStorage.setItem('nq_completed_steps', JSON.stringify([...nextDone]))
    }

    if (v < 4) {
      const rawStep = JSON.parse(localStorage.getItem('nq_current_step') || '0')
      let idx = Math.max(0, Number(rawStep))
      idx = Math.min(idx, NQ_GUIDED_STEPS.length - 1)
      localStorage.setItem('nq_current_step', String(idx))
      const doneRaw = JSON.parse(localStorage.getItem('nq_completed_steps') || '[]') as number[]
      const nextDone = new Set<number>()
      for (const i of doneRaw) {
        if (typeof i !== 'number' || i < 0 || i >= NQ_GUIDED_STEPS.length) continue
        nextDone.add(i)
      }
      localStorage.setItem('nq_completed_steps', JSON.stringify([...nextDone]))
    }

    localStorage.setItem('nq_guided_schema_version', String(NQ_GUIDED_SCHEMA_VERSION))
  } catch {
    // ignore
  }
}

/** Phase orders on the action roadmap (aligned with `JOURNEY_PHASES_DATA[].order`). */
export const NQ_GUIDED_PHASE_ORDERS = [1, 2, 3, 4, 5, 6, 7, 8] as const

/** Homeowner Hub (phase 8) unlocks only after all post-closing (phase 7) steps are complete. */
export function isHomeownerHubPhaseUnlocked(completedSteps: Set<number>): boolean {
  return isNqGuidedPhaseFullyComplete(7, completedSteps)
}

export function getNqGuidedIndicesForPhaseOrder(phaseOrder: number): number[] {
  const out: number[] = []
  NQ_GUIDED_STEPS.forEach((s, i) => {
    if (s.phaseOrder === phaseOrder) out.push(i)
  })
  return out
}

export function isNqGuidedPhaseFullyComplete(phaseOrder: number, completedSteps: Set<number>): boolean {
  const indices = getNqGuidedIndicesForPhaseOrder(phaseOrder)
  return indices.length > 0 && indices.every((i) => completedSteps.has(i))
}

export function countNqGuidedPhasesFullyComplete(completedSteps: Set<number>): number {
  return NQ_GUIDED_PHASE_ORDERS.filter((o) => isNqGuidedPhaseFullyComplete(o, completedSteps)).length
}

export function getNqGuidedFirstAccessibleIndexInPhase(
  phaseOrder: number,
  canAccessIndex: (idx: number) => boolean
): number | null {
  for (const i of getNqGuidedIndicesForPhaseOrder(phaseOrder)) {
    if (canAccessIndex(i)) return i
  }
  return null
}

export function getNQStepByIndex(index: number): NQGuidedStep | undefined {
  return NQ_GUIDED_STEPS[index]
}

/** True when the step is in phases 1–2 (Foundations access without Momentum). */
export function isStepFree(stepIndex: number): boolean {
  const step = NQ_GUIDED_STEPS[stepIndex]
  return step ? step.phaseOrder <= 2 : false
}

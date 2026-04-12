/**
 * Rotating daily insights for the Customized Journey (index = getDate() % length).
 */

export type DailyInsightIconId =
  | 'TrendingUp'
  | 'Percent'
  | 'PiggyBank'
  | 'Landmark'
  | 'Scale'
  | 'ShieldCheck'
  | 'Timer'
  | 'Calculator'
  | 'Home'
  | 'FileText'
  | 'Wallet'
  | 'BadgePercent'
  | 'CircleDollarSign'
  | 'Building2'
  | 'ScrollText'

export type DailyInsight = {
  icon: DailyInsightIconId
  stat: string
  explanation: string
}

export const DAILY_INSIGHTS: DailyInsight[] = [
  {
    icon: 'TrendingUp',
    stat: 'Buyers who compare 3+ lenders save an average of $3,200',
    explanation: 'Rate shopping within a 45-day window typically counts as one credit inquiry.',
  },
  {
    icon: 'Percent',
    stat: 'A 1% rate difference on a $350K loan ≈ $210/month',
    explanation: 'On a 30-year fixed loan, that can mean roughly $75,600 over the life of the loan.',
  },
  {
    icon: 'PiggyBank',
    stat: 'Every 1% of purchase price in down payment can lower your monthly payment',
    explanation: 'Smaller loan amounts and often better PMI terms when you put more down.',
  },
  {
    icon: 'Landmark',
    stat: 'DTI limits are often around 43% back-end for many conventional loans',
    explanation: 'Programs vary — your lender confirms what applies to your specific file.',
  },
  {
    icon: 'Scale',
    stat: 'APR includes lender fees and points, not just the note rate',
    explanation: 'Comparing APR helps you see total cost, not just the advertised rate.',
  },
  {
    icon: 'ShieldCheck',
    stat: 'Earnest money is usually 1–3% of offer price in competitive markets',
    explanation: 'It shows sellers you are serious; it is applied at closing when the deal funds.',
  },
  {
    icon: 'Timer',
    stat: 'Pre-approval letters are strongest when based on verified documents',
    explanation: 'Sellers prefer offers backed by real numbers, not quick online estimates.',
  },
  {
    icon: 'Calculator',
    stat: 'PMI often drops off at ~78% LTV on conventional loans with scheduled amortization',
    explanation: 'Rules depend on loan program — ask your servicer about automatic removal.',
  },
  {
    icon: 'Home',
    stat: 'Closing costs often run 2–5% of the loan amount (not counting down payment)',
    explanation: 'Get a Loan Estimate early so cash-to-close does not surprise you.',
  },
  {
    icon: 'FileText',
    stat: 'Underwriters may re-verify employment within days of closing',
    explanation: 'Avoid new job changes or large undisclosed deposits right before signing.',
  },
  {
    icon: 'Wallet',
    stat: 'Reserves are extra months of PITI some programs require in the bank',
    explanation: 'They protect you and reassure the lender you can weather a short disruption.',
  },
  {
    icon: 'BadgePercent',
    stat: 'Discount points = prepaid interest: 1 point ≈ 1% of loan to buy down rate',
    explanation: 'Whether it pays off depends on how long you keep the loan.',
  },
  {
    icon: 'CircleDollarSign',
    stat: 'Sellers sometimes help with closing costs via a seller credit',
    explanation: 'Your lender caps how much can be credited — it must fit program rules.',
  },
  {
    icon: 'Building2',
    stat: 'HOA dues affect DTI the same way principal and interest do',
    explanation: 'Always include HOA when stress-testing what you can afford.',
  },
  {
    icon: 'ScrollText',
    stat: 'The Closing Disclosure must be received 3 business days before signing (TRID)',
    explanation: 'Certain changes can reset that clock — track timing with your closer.',
  },
  {
    icon: 'TrendingUp',
    stat: 'Credit scores of 740+ often unlock better pricing tiers with many lenders',
    explanation: 'Small score moves near cutoff points can change your quoted rate.',
  },
  {
    icon: 'Percent',
    stat: 'ARM caps limit how much your rate can change at each adjustment',
    explanation: 'Read the margin, index, and periodic/lifetime caps before choosing an ARM.',
  },
  {
    icon: 'PiggyBank',
    stat: 'First-time buyer programs may combine grants with favorable loan terms',
    explanation: 'Income and purchase-price limits apply — check local agency rules.',
  },
  {
    icon: 'ShieldCheck',
    stat: 'Title insurance protects against hidden liens and ownership disputes',
    explanation: 'Lender’s policy is required; owner’s policy is often a smart add-on.',
  },
  {
    icon: 'Timer',
    stat: 'Appraisal timelines vary by market — plan extra time in hot seasons',
    explanation: 'Low appraisals can trigger renegotiation or bringing cash to close.',
  },
  {
    icon: 'Calculator',
    stat: 'Property taxes are often escrowed monthly with your mortgage payment',
    explanation: 'Your monthly “PITI” includes principal, interest, taxes, and insurance.',
  },
  {
    icon: 'Home',
    stat: 'Inspection is for your information — it is not a pass/fail on the loan',
    explanation: 'Use findings to negotiate repairs or credits, or to walk away if severe.',
  },
  {
    icon: 'Landmark',
    stat: 'FHA loans allow lower down payments but include upfront and annual MIP',
    explanation: 'Compare total monthly cost vs conventional with PMI for your scenario.',
  },
  {
    icon: 'Scale',
    stat: 'Contingencies (financing, inspection, appraisal) protect your deposit',
    explanation: 'Waiving them can strengthen offers but increases your risk.',
  },
  {
    icon: 'FileText',
    stat: 'Gift funds need a paper trail: donor letter + transfer documentation',
    explanation: 'Lenders verify the money is really a gift, not a hidden loan.',
  },
  {
    icon: 'Wallet',
    stat: 'Rate locks protect you if rates rise before closing',
    explanation: 'Longer locks may cost more — align lock length with your closing date.',
  },
  {
    icon: 'BadgePercent',
    stat: 'Refinancing breakeven = closing costs ÷ monthly savings',
    explanation: 'If you will move before breakeven, a refi may not be worth the fees.',
  },
  {
    icon: 'CircleDollarSign',
    stat: 'Wire fraud at closing is real — always verify wiring instructions by phone',
    explanation: 'Call your title company on a known number — never trust email alone.',
  },
  {
    icon: 'Building2',
    stat: 'Condos may need HOA budget reserves reviewed for conventional financing',
    explanation: '“Non-warrantable” projects can limit loan options — ask early.',
  },
  {
    icon: 'ScrollText',
    stat: 'Rate shopping in a short window minimizes duplicate inquiry impact',
    explanation: 'Credit models often treat multiple mortgage inquiries as one event.',
  },
  {
    icon: 'TrendingUp',
    stat: 'Paying down revolving balances can lift scores faster than paying installment debt',
    explanation: 'Credit utilization is a major factor months before you apply.',
  },
]

export function getDailyInsightIndex(): number {
  if (typeof Date === 'undefined') return 0
  return new Date().getDate() % DAILY_INSIGHTS.length
}

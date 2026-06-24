/**
 * Rotating "lesson of the week" — one topic per calendar week (ISO week index).
 */

export type WeeklyLesson = {
  id: string
  title: string
  summary: string
  href: string
  /** Plain-English tip shown in cards and emails */
  tip: string
}

export const WEEKLY_LESSONS: WeeklyLesson[] = [
  {
    id: 'dti-basics',
    title: 'Know your DTI before you shop',
    summary: 'Lenders compare your debts to income — stay under your comfort zone, not just their max.',
    href: '/resources#resource-dti-deep-dive',
    tip: 'Add your new housing payment to existing debts, then divide by gross monthly income.',
  },
  {
    id: 'shop-lenders',
    title: 'Compare at least three Loan Estimates',
    summary: 'Same-day quotes with matching assumptions reveal fee differences worth thousands.',
    href: '/resources#resource-shop-lenders',
    tip: 'Ask each lender for a Loan Estimate on the same day with the same loan type and down payment.',
  },
  {
    id: 'pmi-drop',
    title: 'Plan when PMI drops off',
    summary: 'Conventional PMI often ends at 78% LTV — FHA MIP usually stays for the life of the loan.',
    href: '/resources#resource-pmi-optimization',
    tip: 'Request removal at 80% LTV if your servicer allows — you may need a new appraisal.',
  },
  {
    id: 'inspection-window',
    title: 'Use your inspection window fully',
    summary: 'Schedule early, attend in person, and negotiate repairs before contingencies expire.',
    href: '/resources#resource-inspection-guide',
    tip: 'Bring a checklist and photos — sellers fix more when issues are documented clearly.',
  },
  {
    id: 'appraisal-gap',
    title: 'Have a plan if appraisal comes in low',
    summary: 'Renegotiate, split the gap, bring cash, or exit — decide before you need to.',
    href: '/resources#resource-appraisal-low-guide',
    tip: 'Your appraisal contingency may let you walk away and recover earnest money.',
  },
  {
    id: 'closing-disclosure',
    title: 'Line up Closing Disclosure vs Loan Estimate',
    summary: 'You get at least three business days to review fees before signing.',
    href: '/resources#resource-closing-cost-guide',
    tip: 'Compare Section A lender fees and Section C third-party fees line by line.',
  },
  {
    id: 'wire-safety',
    title: 'Verify wiring instructions by phone',
    summary: 'Wire fraud targets buyers at closing — never trust email links alone.',
    href: '/resources#resource-closing-script',
    tip: 'Call your title company on a number from your original contract, not from the email.',
  },
  {
    id: 'dpa-stack',
    title: 'Stack down payment help carefully',
    summary: 'Grants and secondary loans have rules — verify stacking before you count on them.',
    href: '/down-payment-optimizer',
    tip: 'Ask each program administrator whether you can combine their help with other assistance.',
  },
  {
    id: 'fair-housing',
    title: 'Know your fair housing rights',
    summary: 'Unequal treatment based on protected classes is illegal in renting and buying.',
    href: '/resources#resource-fair-housing-guide',
    tip: 'Document steering, different terms, or refusals — file with HUD if needed.',
  },
  {
    id: 'maintenance-fund',
    title: 'Start a first-year maintenance fund',
    summary: 'Many owners budget 1–3% of home value annually for upkeep and surprises.',
    href: '/resources#resource-first-year-maintenance-budget',
    tip: 'Set a separate savings bucket before move-in so HVAC or roof repairs do not derail you.',
  },
  {
    id: 'underwriting-steady',
    title: 'Stay steady during underwriting',
    summary: 'No new debt, no large unexplained deposits, no job changes without telling your LO.',
    href: '/resources#resource-underwriting-checklist',
    tip: 'Respond to document requests within 24–48 hours to keep your file moving.',
  },
  {
    id: 'offer-guardrails',
    title: 'Set offer guardrails before you tour',
    summary: 'Walk-away price, max escalation, and non-negotiable contingencies protect you.',
    href: '/resources#resource-offer-guardrails',
    tip: 'Write your max monthly payment and max cash to close before you fall in love with a listing.',
  },
]

/** ISO week number (1–53) for rotation. */
export function getIsoWeekNumber(date = new Date()): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const day = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7)
}

export function getWeeklyLesson(date = new Date()): WeeklyLesson {
  const week = getIsoWeekNumber(date)
  const idx = (week - 1) % WEEKLY_LESSONS.length
  return WEEKLY_LESSONS[idx] ?? WEEKLY_LESSONS[0]
}

/**
 * Replace common jargon in UI copy when "Plain English mode" is on.
 * Used with usePlainEnglish / profile toggle.
 */
/** Longer phrases first so shorter tokens don’t split them incorrectly. */
const REPLACEMENTS: [string, string][] = [
  ['Debt-to-Income Ratio', 'How much of your paycheck goes to debt payments'],
  ['Debt-to-income ratio', 'How much of your paycheck goes to debt payments'],
  ['debt-to-income ratio', 'how much of your paycheck goes to debt payments'],
  ['debt-to-income', 'debt compared to income'],
  ['Debt-to-income', 'Debt compared to income'],
  ['Loan-to-Value', 'Loan size compared to the home price'],
  ['loan-to-value', 'loan size compared to the home price'],
  ['Loan-to-value ratio', 'Loan size compared to the home price'],
  ['Private Mortgage Insurance', 'Insurance the lender requires when you put down less than 20%'],
  ['private mortgage insurance', 'insurance the lender requires when you put down less than 20%'],
  ['Annual Percentage Rate', 'The full yearly cost of the loan including some fees'],
  ['PITI', 'Payment including loan, taxes, and insurance'],
  ['DTI', 'Debt compared to income'],
  ['LTV', 'Loan vs. home price'],
  ['PMI', 'Mortgage insurance (under 20% down)'],
  ['APR', 'Full loan cost per year'],
  ['HUD', 'U.S. Housing Department'],
  ['CFPB', 'U.S. consumer finance watchdog'],
  ['closing costs', 'one-time fees when you close on the home'],
  ['Closing costs', 'One-time fees when you close on the home'],
  ['Closing Disclosure', 'Final loan and fee form you get before closing'],
  ['Loan Estimate', 'Early estimate of your loan and fees from a lender'],
  ['Pre-approval', 'A lender checked your documents and said how much you can likely borrow'],
  ['pre-approval', 'lender-backed budget letter'],
  ['Pre-qualification', 'A quick estimate from a lender — not as strong as pre-approval'],
  ['Earnest money', 'A good-faith deposit with your offer'],
  ['Contingency', 'A condition that lets you back out if something goes wrong'],
  ['Appraisal', 'The lender’s check on whether the home is worth the price'],
  ['Title insurance', 'Protection if someone disputes who owns the home'],
  ['Escrow', 'An account that holds money for taxes and insurance until they’re due'],
  ['Down payment', 'Up-front money toward the home'],
  ['down payment', 'up-front money toward the home'],
  ['Underwriting', 'The lender’s final review of your loan'],
  ['readiness, numbers, next step', 'how ready you are, your numbers, and your next step'],
  ['readiness, numbers', 'how ready you are and your numbers'],
  ['Affordability', 'What you can realistically pay'],
  ['affordability', 'what you can realistically pay'],
  ['Amortization', 'How each payment splits between principal and interest'],
]

export function applyPlainEnglishCopy(text: string, enabled: boolean): string {
  if (!enabled || !text) return text
  let out = text
  for (const [from, to] of REPLACEMENTS) {
    if (out.includes(from)) out = out.split(from).join(to)
  }
  return out
}

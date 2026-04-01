/** Plain-English glossary for GlossaryTooltip and future “plain English mode”. */
export const GLOSSARY = {
  DTI: 'Debt-to-income: how much of your monthly income goes to all debt payments, including the new mortgage.',
  LTV: 'Loan-to-value: your loan size divided by the home price. Higher LTV often means PMI and higher rates.',
  PMI: 'Private mortgage insurance: protects the lender when you put down less than 20%. It is usually removable later.',
  APR: 'Annual percentage rate: the yearly cost of credit including some fees — not the same as the note rate alone.',
  Escrow: 'A holding account for taxes and insurance collected with your payment so they are paid when due.',
  'Closing Costs': 'One-time fees at closing: lender fees, title, recording, prepaid items, and more.',
  'Pre-approval': 'A lender review with documents — stronger than pre-qualification for making offers.',
  'Pre-qualification': 'A quick estimate based on what you say — not verified like pre-approval.',
  'Earnest Money': 'A deposit showing you are serious when your offer is accepted; it usually applies toward closing.',
  Contingency: 'A condition that lets you exit the contract if something fails (inspection, appraisal, financing).',
  Appraisal: 'An independent opinion of value the lender uses to decide how much they will lend.',
  'Title Insurance': 'Protects against ownership disputes and defects in the title chain.',
  HOA: 'Homeowners association: fees and rules for shared communities.',
  AMI: 'Area median income: a local benchmark many down-payment and affordable-housing programs use for income limits.',
  DPA: 'Down payment assistance: grants or secondary loans that help cover your down payment or sometimes closing costs.',
} as const

/** Short inline label when Plain English mode replaces the jargon link text. */
export const GLOSSARY_PLAIN_LABEL: { [K in keyof typeof GLOSSARY]: string } = {
  DTI: 'Debt vs. income',
  LTV: 'Loan vs. home price',
  PMI: 'Mortgage insurance (if under 20% down)',
  APR: 'Full loan cost per year',
  Escrow: 'Tax & insurance account',
  'Closing Costs': 'Fees at closing',
  'Pre-approval': 'Lender-backed budget letter',
  'Pre-qualification': 'Quick lender estimate',
  'Earnest Money': 'Good-faith deposit',
  Contingency: 'Backup plan in the contract',
  Appraisal: 'Value check for the lender',
  'Title Insurance': 'Ownership protection',
  HOA: 'Community fees & rules',
  AMI: 'Typical local income level',
  DPA: 'Help with your down payment',
}

export type GlossaryTermId = keyof typeof GLOSSARY

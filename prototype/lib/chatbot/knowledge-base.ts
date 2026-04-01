/**
 * Static knowledge base extracted from NestQuest playbook content.
 * Used for RAG retrieval — bot answers only from these chunks when available.
 */

export interface KnowledgeChunk {
  id: string
  phase?: string
  source: string
  text: string
  keywords: string[]
}

const CHUNKS: KnowledgeChunk[] = [
  {
    id: 'kb-1',
    phase: 'preparation',
    source: 'Credit Score Guide',
    text: 'Lenders use your credit score to determine your interest rate. Even a 0.5% rate difference on a $350,000 loan adds up to $33,000 in extra interest over 30 years. Rate tiers by credit score: 760+ best rates, 740-759 +0.125%, 720-739 +0.25%, 700-719 +0.5%, below 700 +1% or more. Quick wins to raise score in 30-60 days: pay credit cards below 30% utilization, do not close old accounts, dispute errors on your report, avoid opening new credit lines. Check your credit at AnnualCreditReport.com (free, no credit card). Aim for at least 620+ on many loans; 740+ for the best rates.',
    keywords: ['credit', 'score', 'rate', 'interest', 'utilization', 'improve', 'lender'],
  },
  {
    id: 'kb-2',
    phase: 'preparation',
    source: 'Document Checklist',
    text: 'Gather these before starting pre-approval: Identity: Government-issued photo ID, Social Security number. Income: 2 years W-2s or 1099s, 2 recent pay stubs, 2 years tax returns, profit and loss if self-employed. Assets: 2 months bank statements for all accounts, 401k and investment statements, gift letter if receiving money from family. Debts: list of all monthly debt payments, rental history and landlord contact.',
    keywords: ['documents', 'checklist', 'pre-approval', 'W-2', 'tax', 'bank', 'statements'],
  },
  {
    id: 'kb-3',
    phase: 'pre-approval',
    source: 'Shop Lenders Guide',
    text: 'Studies show buyers who get 5+ quotes save an average of $1,500 in the first year. Most buyers only contact one lender. Multiple mortgage inquiries within a 14-day window count as a single hard pull on your credit — shop freely. What to compare: interest rate not just APR, origination fees Section A of Loan Estimate, discount points, lender credits, total cash to close. Get pre-approved not just pre-qualified. Pre-approval means the lender verified your income and credit — sellers take you seriously.',
    keywords: ['lenders', 'quotes', 'compare', 'pre-approval', 'credit', 'inquiry', 'loan estimate'],
  },
  {
    id: 'kb-4',
    phase: 'pre-approval',
    source: 'Lender Negotiation Script',
    text: 'Script when you have a competing offer: I have received a competing Loan Estimate from [Bank Name] offering [rate]% with [X] in origination fees. I would prefer to work with you — can you match or improve on that? I am ready to move forward today if so. Negotiable: origination and processing fees, application fees, rate lock fees, title insurance Section C. Less negotiable: government fees, property taxes, recording fees.',
    keywords: ['negotiate', 'lender', 'script', 'competing', 'offer', 'origination', 'fees'],
  },
  {
    id: 'kb-5',
    phase: 'pre-approval',
    source: 'Readiness Score Script',
    text: 'Use your readiness score as leverage when 70 or higher: My readiness score is [X], which demonstrates strong financial preparedness across credit, DTI, down payment, and timeline. This positions me as a low-risk borrower. How can we translate this into better rates or reduced fees? Lenders value low-risk borrowers and will often negotiate.',
    keywords: ['readiness', 'score', 'leverage', 'negotiate', 'lender', 'DTI'],
  },
  {
    id: 'kb-6',
    phase: 'house-hunting',
    source: 'Offer Guardrails',
    text: 'Before touring homes, set a hard walk-away number based on your comfortable budget, not lender max approval. Offer rules: set max offer before first bid, use recent comparable sales not listing hype, keep inspection and financing contingencies, plan two backup properties to avoid scarcity panic. Do not fall in love with the first house. Visit neighborhoods at different times.',
    keywords: ['offer', 'budget', 'walk-away', 'contingency', 'comparable', 'house hunting'],
  },
  {
    id: 'kb-7',
    phase: 'house-hunting',
    source: 'Offer Script',
    text: 'Script for presenting a strong offer: We love the property and are prepared to move quickly. Our strongest offer today is $[X], with financing and inspection contingencies in place. If terms align, we can proceed immediately. Keeps urgency high while preserving protections and budget discipline.',
    keywords: ['offer', 'script', 'contingency', 'inspection', 'financing'],
  },
  {
    id: 'kb-8',
    phase: 'negotiation',
    source: 'Home Inspection Guide',
    text: 'Home inspection costs $300-$500 and can uncover $5,000-$50,000+ in repairs. Never waive inspection even in hot markets. Focus areas: foundation cracks or settling, roof age and condition 15-20 year lifespan, HVAC, electrical panel, water damage or mold, plumbing polybutylene pipe. After inspection: ask for repairs on major items roof HVAC foundation, or price reduction or closing cost credit. Do not nickel-and-dime cosmetic items.',
    keywords: ['inspection', 'home', 'negotiate', 'repairs', 'foundation', 'roof', 'HVAC'],
  },
  {
    id: 'kb-9',
    phase: 'underwriting',
    source: 'Underwriting Checklist',
    text: 'Underwriting: respond to lender document requests within 24 hours. Keep pay stubs and account balances stable. Do not open new credit cards or auto loans. Do not move large unexplained cash deposits. Expect 2-4 weeks. Underwriting means the lender verifies everything. Do not make big purchases or change jobs during this time.',
    keywords: ['underwriting', 'documents', 'credit', 'lender', 'approval'],
  },
  {
    id: 'kb-10',
    phase: 'underwriting',
    source: 'Low Appraisal Options',
    text: 'If appraisal comes in low, four options: request seller price reduction, split difference with seller, bring additional cash to close, challenge appraisal with stronger comparables. Choose based on cash reserves and long-term affordability, not sunk-cost emotion.',
    keywords: ['appraisal', 'low', 'options', 'negotiate', 'seller', 'price'],
  },
  {
    id: 'kb-11',
    phase: 'closing',
    source: 'Closing Costs Guide',
    text: 'Closing costs typically 2-5% of purchase price. On $350,000 that is $7,000-$17,500. Section A Origination Charges negotiable: origination fee, underwriting fee, discount points, application fee. Section B cannot shop: appraisal, credit report, flood determination. Section C can shop: title insurance shop 3+ companies, settlement fee, escrow fee. Prepaids: first year homeowners insurance, property tax escrow 2-3 months, prepaid daily interest. Shopping title insurance alone can save $500-$1,000. Close mid-month to reduce prepaid interest.',
    keywords: ['closing', 'costs', 'fees', 'title', 'insurance', 'escrow', 'prepaid'],
  },
  {
    id: 'kb-12',
    phase: 'closing',
    source: 'Closing Script',
    text: 'Script for negotiating closing costs: I have reviewed my Closing Disclosure and noticed [fee name] is $X. I found a competing quote for $Y. Can you match that or credit me $Z toward closing costs? I am ready to proceed today if so. You have 3 business days to review Closing Disclosure before signing. Use this window to negotiate.',
    keywords: ['closing', 'negotiate', 'disclosure', 'fees', 'script'],
  },
  {
    id: 'kb-13',
    source: 'General',
    text: 'NestQuest recommendations are generated from quiz inputs, affordability math, closing-cost assumptions, and risk heuristics. We do not optimize for lender referrals, commissions, title partnerships, or affiliate payouts. We prioritize your affordability comfort zone over lender max approvals. We surface negotiable fees and provide scripts that improve your bargaining position.',
    keywords: ['unbiased', 'recommendation', 'affordability', 'negotiate'],
  },
  {
    id: 'kb-14',
    source: 'Mortgage Rates',
    text: 'Mortgage rates change daily and vary by credit profile, loan type, and lender. Do not give live rate figures. Direct users to in-app rate tool or lender connection for accurate current rates. Can explain what affects rate and how to compare offers.',
    keywords: ['rates', 'mortgage', 'interest', 'lender', 'current'],
  },
  {
    id: 'kb-15',
    source: 'Journey Overview',
    text: 'Homebuying journey steps: Preparation and Planning 2-4 weeks, Pre-Approval 1-3 days, House Hunting 2-12 weeks, Make an Offer 1-3 days, Inspection 1-2 weeks, Appraisal 1-2 weeks, Underwriting 2-4 weeks, Closing 1 day. Preparation: check credit, gather documents. Pre-approval: shop at least 3 lenders within 14 days. House hunting: define must-haves and walk-away budget. Never waive inspection. Include financing and inspection contingencies.',
    keywords: ['journey', 'steps', 'overview', 'preparation', 'pre-approval', 'closing'],
  },
]

export function getAllChunks(): KnowledgeChunk[] {
  return CHUNKS
}

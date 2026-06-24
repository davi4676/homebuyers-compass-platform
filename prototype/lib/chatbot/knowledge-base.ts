/**
 * Static knowledge base synced to /resources playbooks (one chunk per resource id).
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
    id: 'kb-credit-score-guide',
    phase: 'preparation',
    source: 'Credit Score Guide',
    text: 'Lenders use credit score for interest rate. Quick wins in 30-60 days: pay cards below 30% utilization, do not close old accounts, dispute errors, avoid new credit lines. Check free at AnnualCreditReport.com. Aim 620+ for many loans; 740+ for best rates. Even 0.5% rate difference on $350k adds significant interest over 30 years.',
    keywords: ['credit', 'score', 'rate', 'utilization', 'improve'],
  },
  {
    id: 'kb-dti-deep-dive',
    phase: 'preparation',
    source: 'DTI Deep Dive',
    text: 'DTI debt-to-income: front-end is housing payment divided by gross monthly income. Back-end is housing plus all monthly debts divided by gross income. Example back-end 35 percent on $8000 income. Many programs use back-end around 43 percent or lower. Sketch comfortable payment below lender max.',
    keywords: ['dti', 'front-end', 'back-end', 'debt', 'income'],
  },
  {
    id: 'kb-pmi-optimization',
    phase: 'preparation',
    source: 'PMI and MIP Guide',
    text: 'PMI on conventional loans when down under 20 percent — often removable near 78-80 LTV. FHA uses MIP with upfront and monthly costs. Compare both in Down Payment Optimizer. Extra down upfront can eliminate years of monthly PMI.',
    keywords: ['pmi', 'mip', 'fha', 'conventional', 'insurance'],
  },
  {
    id: 'kb-first-time-mistakes',
    phase: 'preparation',
    source: 'First-Time Buyer Mistakes',
    text: 'Ten mistakes: one lender only, budgeting to lender max, skipping pre-approval, waiving inspection, ignoring closing costs 2-5 percent, new debt before closing, trusting wire email, emotional bidding, not reading Closing Disclosure, no maintenance budget 1-3 percent yearly.',
    keywords: ['mistakes', 'first-time', 'buyer', 'tips'],
  },
  {
    id: 'kb-doc-checklist',
    phase: 'preparation',
    source: 'Document Checklist',
    text: 'Pre-approval documents: photo ID, SSN, 2 years W-2s or 1099s, 2 pay stubs, 2 years tax returns, 2 months bank statements, investment statements, gift letter if applicable, debt list, rental history.',
    keywords: ['documents', 'checklist', 'pre-approval', 'W-2', 'bank'],
  },
  {
    id: 'kb-fair-housing-guide',
    phase: 'preparation',
    source: 'Fair Housing Guide',
    text: 'Fair Housing Act protects race color national origin religion sex familial status disability. Warning signs: steering, different loan terms, refusal to show homes. Document incidents file HUD complaint at hud.gov. Educational not legal advice.',
    keywords: ['fair housing', 'discrimination', 'rights', 'hud'],
  },
  {
    id: 'kb-shop-lenders',
    phase: 'pre-approval',
    source: 'Shop Lenders Guide',
    text: 'Buyers with 5+ quotes save more in first year. Multiple inquiries within 14 days count as one hard pull. Compare rate not just APR, Section A origination, points, lender credits, cash to close. Pre-approval verified beats pre-qualification.',
    keywords: ['lenders', 'quotes', 'pre-approval', 'loan estimate'],
  },
  {
    id: 'kb-negotiation-script-lender',
    phase: 'pre-approval',
    source: 'Lender Negotiation Script',
    text: 'Script with competing Loan Estimate: prefer to work with you if you match rate and lower origination fees ready to move today. Negotiable: origination processing application rate lock fees title Section C. Less negotiable: government fees recording taxes.',
    keywords: ['negotiate', 'lender', 'script', 'origination'],
  },
  {
    id: 'kb-readiness-score-script',
    phase: 'pre-approval',
    source: 'Readiness Score Script',
    text: 'When readiness 70+ and two Loan Estimates: done homework credit documents ready shopping multiple lenders. Match competitor rate with lower Section A fees or lender credits. Use when prepared not as first contact.',
    keywords: ['readiness', 'score', 'leverage', 'lender'],
  },
  {
    id: 'kb-fha-guide',
    phase: 'loan-programs',
    source: 'FHA Guide',
    text: 'FHA government-backed through approved lenders. Often credit 580+ for 3.5% down overlays vary. MIP upfront and monthly. FHA appraisal may flag property condition. Compare FHA vs conventional in Down Payment Optimizer.',
    keywords: ['fha', 'mip', '3.5', 'down payment'],
  },
  {
    id: 'kb-va-guide',
    phase: 'loan-programs',
    source: 'VA Guide',
    text: 'VA for eligible veterans active duty surviving spouses. Zero down no monthly PMI competitive rates. Need COE certificate of eligibility primary residence. Funding fee at closing unless exempt often financed.',
    keywords: ['va', 'veteran', 'funding fee', 'zero down'],
  },
  {
    id: 'kb-usda-guide',
    phase: 'loan-programs',
    source: 'USDA Guide',
    text: 'USDA zero down eligible rural suburban areas household income limits AMI. Upfront and annual guarantee fees. Check USDA eligibility map. Primary residence modest home.',
    keywords: ['usda', 'rural', 'zero down', 'ami'],
  },
  {
    id: 'kb-loan-program-comparison',
    phase: 'loan-programs',
    source: 'Loan Program Comparison',
    text: 'Conventional 3-20% down PMI under 20%. FHA 3.5% down MIP. VA 0% down no PMI veterans. USDA 0% down guarantee fee income limits. Self-check VA first USDA address income under 10% down compare FHA conventional.',
    keywords: ['compare', 'fha', 'va', 'usda', 'conventional'],
  },
  {
    id: 'kb-choose-buyers-agent',
    phase: 'house-hunting',
    source: 'Choose Buyers Agent',
    text: 'Interview buyers agent before committing. Ask local experience offer strategy inspection negotiation commission response time contract length references. Red flags: pressure waive inspection vague experience dual agency conflicts.',
    keywords: ['agent', 'realtor', 'buyers agent', 'interview'],
  },
  {
    id: 'kb-search-without-burnout',
    phase: 'house-hunting',
    source: 'Search Without Burnout',
    text: 'List 5 must-haves vs nice-to-haves limit tours 3-5 per week research comps before loving price. Open houses take photos notes visit neighborhoods different times ask utilities HOA.',
    keywords: ['search', 'burnout', 'tour', 'must-haves'],
  },
  {
    id: 'kb-listing-red-flags',
    phase: 'house-hunting',
    source: 'Listing Red Flags',
    text: 'Red flags: multiple price drops long DOM hot market photos skip rooms as-is without discount vague disclosures. Prompt inspection and negotiation not automatic pass.',
    keywords: ['red flags', 'listing', 'as-is', 'disclosure'],
  },
  {
    id: 'kb-neighborhood-checklist',
    phase: 'house-hunting',
    source: 'Neighborhood Checklist',
    text: 'Before offer: commute rush hour schools flood zone insurance walkability crime property tax trend planned development. Use NestQuest map tool.',
    keywords: ['neighborhood', 'commute', 'schools', 'flood'],
  },
  {
    id: 'kb-offer-guardrails',
    phase: 'house-hunting',
    source: 'Offer Guardrails',
    text: 'Set walk-away before touring based on comfortable budget not lender max. Use recent comps keep inspection and financing contingencies plan two backup properties avoid scarcity panic.',
    keywords: ['offer', 'budget', 'walk-away', 'contingency'],
  },
  {
    id: 'kb-offer-script',
    phase: 'house-hunting',
    source: 'Offer Script',
    text: 'Strong offer script: love property prepared to move quickly strongest offer with financing and inspection contingencies proceed immediately if terms align. Momentum premium script.',
    keywords: ['offer', 'script', 'contingency'],
  },
  {
    id: 'kb-inspection-guide',
    phase: 'negotiation',
    source: 'Home Inspection Guide',
    text: 'Inspection $300-500 can uncover major repairs. Never waive in hot markets. Check foundation roof HVAC electrical plumbing mold. Negotiate major items not cosmetics.',
    keywords: ['inspection', 'repairs', 'foundation', 'roof'],
  },
  {
    id: 'kb-appraisal-basics',
    phase: 'underwriting',
    source: 'Appraisal Basics',
    text: 'Appraisal independent value for lender ordered after offer. Appraiser visits compares comps. At or above price proceed. If low see appraisal-low-guide options.',
    keywords: ['appraisal', 'value', 'comps', 'process'],
  },
  {
    id: 'kb-underwriting-checklist',
    phase: 'underwriting',
    source: 'Underwriting Checklist',
    text: 'Underwriting final lender review. Do reply documents within 24 hours keep finances stable tell loan officer before job changes large transfers. Do not open new credit or unexplained cash deposits. Call same day if something changes.',
    keywords: ['underwriting', 'documents', 'credit', 'lender'],
  },
  {
    id: 'kb-appraisal-low-guide',
    phase: 'underwriting',
    source: 'Low Appraisal Options',
    text: 'Low appraisal options: seller lower price meet middle bring extra cash if affordable challenge with stronger comps walk if contingency allows. Decide on cash reserves and payment not emotion.',
    keywords: ['appraisal', 'low', 'options', 'negotiate'],
  },
  {
    id: 'kb-closing-cost-guide',
    phase: 'closing',
    source: 'Closing Costs Guide',
    text: 'Closing costs 2-5% of price. Section A origination negotiable. Section B appraisal credit less shoppable. Section C title shop 3 providers saves hundreds. Prepaids insurance taxes interest. Close mid-month reduces prepaid interest.',
    keywords: ['closing', 'costs', 'fees', 'title'],
  },
  {
    id: 'kb-escrow-accounts-explained',
    phase: 'closing',
    source: 'Escrow Accounts Explained',
    text: 'Escrow impounds hold taxes insurance in PITI. Upfront 2-3 months at closing. Annual escrow analysis may raise payment. Watch shortage notices.',
    keywords: ['escrow', 'impound', 'piti', 'taxes'],
  },
  {
    id: 'kb-title-insurance-explained',
    phase: 'closing',
    source: 'Title Insurance Explained',
    text: 'Title insurance protects ownership defects liens disputes. Lender policy required owner policy recommended. Shop Section C compare three quotes.',
    keywords: ['title', 'insurance', 'owner', 'lender'],
  },
  {
    id: 'kb-closing-day-checklist',
    phase: 'closing',
    source: 'Closing Day Checklist',
    text: 'Closing day: final walk-through review Closing Disclosure vs Loan Estimate verify wire by phone never email only. Bring ID cashier check or wire proof insurance. Plan 1-2 hours signing.',
    keywords: ['closing day', 'walk-through', 'wire', 'signing'],
  },
  {
    id: 'kb-closing-script',
    phase: 'closing',
    source: 'Closing Script',
    text: 'Closing cost negotiation script: reviewed Closing Disclosure fee name is X competing quote Y match or credit Z ready proceed today. Three business days to review before signing. Momentum premium.',
    keywords: ['closing', 'negotiate', 'script', 'disclosure'],
  },
  {
    id: 'kb-first-year-maintenance-budget',
    phase: 'post-closing',
    source: 'First Year Maintenance Budget',
    text: 'Budget 1-3% home value per year maintenance plus emergency fund 3-6 months expenses. Seasonal HVAC filters gutters detectors. Review insurance renewal. Watch escrow tax notices.',
    keywords: ['maintenance', 'budget', 'post-closing'],
  },
  {
    id: 'kb-homeowner-scams-and-help',
    phase: 'post-closing',
    source: 'Homeowner Scams and Help',
    text: 'Scams: predatory refi equity theft storm contractors wire fraud. Help HUD counselors hud.gov findhousingcounselors loan servicer loss mitigation state AG. Act early if payment trouble.',
    keywords: ['scam', 'fraud', 'hud', 'help'],
  },
  {
    id: 'kb-why-unbiased',
    source: 'Methodology',
    text: 'NestQuest from quiz affordability closing-cost heuristics not lender referrals commissions or kickbacks. Prioritize affordability comfort over lender max. Surface negotiable fees and scripts.',
    keywords: ['unbiased', 'methodology', 'affordability'],
  },
  {
    id: 'kb-glossary',
    source: 'Glossary',
    text: 'Glossary at /glossary: DTI LTV PMI MIP escrow pre-approval contingency appraisal comps Loan Estimate Closing Disclosure and 40+ terms plain English.',
    keywords: ['glossary', 'terms', 'define'],
  },
  {
    id: 'kb-faq-hub',
    source: 'Homebuying FAQ Hub',
    text: 'FAQ hub /learn/faq covers readiness credit DTI loan types FHA VA USDA agents pre-approval inspection appraisal escrow closing post-closing fair housing NestQuest pricing.',
    keywords: ['faq', 'questions', 'help'],
  },
  {
    id: 'kb-learn-hub',
    source: 'Learn Topic Hub',
    text: 'Learn hub /learn indexes topics: money loans shopping offers negotiation closing after move-in tools quiz workbook glossary FAQ playbooks.',
    keywords: ['learn', 'topics', 'hub', 'browse'],
  },
  {
    id: 'kb-workbook',
    source: 'Pre-Purchase Workbook',
    text: 'Printable workbook at /workbook: document checklist lender comparison worksheet inspection closing day maintenance planners. Email via pre-purchase-workbook template. Full workbook phases 3+ with Momentum tier.',
    keywords: ['workbook', 'pdf', 'print', 'checklist'],
  },
  {
    id: 'kb-hud-counselor',
    source: 'HUD Counselor Handoff',
    text: 'Free HUD-approved housing counselors at hud.gov findhousingcounselors help budgets credit loan programs before offers. NestQuest is not HUD-certified counseling agency. Recommended when readiness score under 60 or during pre-approval phase.',
    keywords: ['hud', 'counselor', 'housing counseling', 'free help'],
  },
  {
    id: 'kb-phase-certificates',
    source: 'Phase Certificates',
    text: 'Phase completion certificates at /certificate/[phase] for personal progress tracking when journey phase complete. Not HUD counseling certificate or lender approval. Print from certificate page.',
    keywords: ['certificate', 'phase complete', 'progress'],
  },
  {
    id: 'kb-lender-credit-tradeoff',
    phase: 'loan-programs',
    source: 'Lender Credits vs Rate',
    text: 'Lender credits reduce cash to close for slightly higher rate. Compare monthly payment with and without credits divide credit by monthly difference for break-even months. Good when short on closing cash short hold time need reserves.',
    keywords: ['lender credits', 'rate', 'tradeoff', 'break-even'],
  },
  {
    id: 'kb-arm-scenarios',
    phase: 'loan-programs',
    source: 'ARM Scenarios',
    text: 'ARM fixed period then adjusts. Ask fixed period length rate caps worst-case payment. Fits 3-7 year hold with exit plan. Red flag no exit plan payment shock.',
    keywords: ['arm', 'adjustable', 'fixed period', 'caps'],
  },
  {
    id: 'kb-buydown-structures',
    phase: 'loan-programs',
    source: 'Seller Buydowns',
    text: 'Buydown lowers early payments via seller concessions or points. 2-1 buydown year1 -2% year2 -1%. Permanent buydown uses discount points. Must fit concession limits compare 5-7 year cost.',
    keywords: ['buydown', 'seller concession', '2-1', 'points'],
  },
  {
    id: 'kb-reno-loan-primer',
    phase: 'loan-programs',
    source: 'Renovation Loan Primer',
    text: 'Renovation loans finance purchase plus repairs one mortgage. Need contractor bids as-completed appraisal draw schedule. Pause on DIY scope structural unknowns timeline pressure. Use experienced renovation lenders.',
    keywords: ['renovation', '203k', 'rehab', 'contractor'],
  },
  {
    id: 'kb-heloc-vs-refi',
    phase: 'post-closing',
    source: 'HELOC vs Cash-Out Refi',
    text: 'HELOC is a credit line secured by home draw as needed. Cash-out refi replaces mortgage with larger loan lump sum at closing. HELOC fits phased projects keeping low first mortgage rate short repayment. Refi fits one fixed payment when rates beat existing note and long enough hold to recoup costs.',
    keywords: ['heloc', 'refinance', 'equity', 'cash-out'],
  },
  {
    id: 'kb-homeowners-insurance-primer',
    phase: 'negotiation',
    source: 'Homeowners Insurance Before Closing',
    text: 'Lender requires proof of homeowners insurance before closing. Shop early compare dwelling deductible liability loss-of-use. Flood earthquake may be separate. Bind coverage before funding deadline.',
    keywords: ['insurance', 'homeowners', 'hazard', 'closing'],
  },
  {
    id: 'kb-weekly-lesson',
    source: 'Lesson of the Week',
    text: 'NestQuest rotates a weekly lesson on journey and learn hub covering DTI lender shopping PMI inspection appraisal closing wire safety DPA fair housing maintenance underwriting offer guardrails. See /learn or Action Roadmap.',
    keywords: ['lesson', 'weekly', 'tip'],
  },
  {
    id: 'kb-marketplace',
    source: 'Marketplace',
    text: 'Marketplace at /marketplace lists official HUD counselors CFPB toolkit AnnualCreditReport and in-app guides for title inspection closing insurance. No referral fees educational links only rated providers planned later.',
    keywords: ['marketplace', 'providers', 'counselor', 'directory'],
  },
  {
    id: 'kb-mortgage-rates',
    source: 'Mortgage Rates',
    text: 'Mortgage rates change daily vary by credit loan type lender. Do not give live rates. Direct to in-app tools or lenders. Explain what affects rate and how to compare offers.',
    keywords: ['rates', 'mortgage', 'interest', 'current'],
  },
  {
    id: 'kb-journey-overview',
    source: 'Journey Overview',
    text: 'Journey phases: Preparation 2-4 weeks Pre-Approval 1-2 weeks House Hunting 4-12 weeks Negotiation 2-4 weeks Underwriting 3-6 weeks Closing 1-2 weeks Post-Closing ongoing. Action Roadmap at /customized-journey.',
    keywords: ['journey', 'steps', 'roadmap', 'phases'],
  },
  {
    id: 'kb-educational-videos',
    source: 'Educational Videos',
    text: 'Phase overview videos embed on Playbooks /resources when YouTube IDs set in lib/educational-videos.ts. Placeholder shown until video IDs provided. One video per phase preparation through post-closing.',
    keywords: ['video', 'watch', 'overview', 'youtube'],
  },
]

export function getAllChunks(): KnowledgeChunk[] {
  return CHUNKS
}

/** Count of playbook-aligned resource chunks (kb-{resource-id}). */
export function getPlaybookChunkCount(): number {
  return CHUNKS.filter((c) => c.id.startsWith('kb-') && !c.id.startsWith('kb-platform')).length
}

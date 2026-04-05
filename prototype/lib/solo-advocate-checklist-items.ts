/** Shared solo-buyer advocate checklist rows (results + /learn/buying-solo). */

export const SOLO_ADVOCATE_CHECKLIST_LS_KEY = 'nq_solo_advocate_checklist_v1'

export type SoloAdvocateChecklistRow = { id: string; title: string; detail: string }

export const SOLO_ADVOCATE_CHECKLIST_ITEMS: SoloAdvocateChecklistRow[] = [
  {
    id: 'preapprove',
    title: 'Get pre-approved before touring',
    detail:
      'A pre-approval letter shows sellers you can close and helps you set a real budget — so you don’t fall in love with homes above what lenders will support.',
  },
  {
    id: 'inspection',
    title: 'Always get an independent inspection',
    detail:
      'An inspector works for you, not the seller. They catch expensive issues early so you can negotiate repairs or walk away before you’re committed.',
  },
  {
    id: 'closing',
    title: 'Negotiate closing costs separately',
    detail:
      'Lender fees, title, and third-party charges aren’t fixed. Comparing at least three lenders and asking line-by-line often saves thousands.',
  },
  {
    id: 'dti',
    title: 'Understand your DTI ceiling',
    detail:
      'Debt-to-income caps how much payment lenders allow. Knowing yours stops you from stretching into a payment that breaks your monthly budget.',
  },
  {
    id: 'walkaway',
    title: 'Know your walk-away number',
    detail:
      'Decide the max price and monthly payment you’ll accept before you bid. A clear ceiling protects you from emotional overspending.',
  },
]

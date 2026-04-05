export const DPA_REPORT_PURCHASED_LS_KEY = 'dpa_report_purchased'

export type DpaReportProgramType = 'Grant' | 'Forgivable Loan' | 'Deferred Loan'

export type DpaReportProgram = {
  name: string
  awardAmount: string
  programType: DpaReportProgramType
  /** Full sentence, e.g. "Household income up to $92,400" */
  incomeDescription: string
  /** Full sentence, e.g. "Available in Texas (statewide)" */
  locationDescription: string
  applyUrl: string
  howToApplySteps: [string, string, string]
}

/** Sample report rows for the full report & PDF (prototype data). */
export const DPA_MATCH_REPORT_PROGRAMS: DpaReportProgram[] = [
  {
    name: 'HomeFirst DPA Program',
    awardAmount: '$40,000',
    programType: 'Grant',
    incomeDescription: 'Household income up to $92,400',
    locationDescription: 'Available in Texas (statewide)',
    applyUrl: 'https://www.tdhca.state.tx.us/homeownership/fh-programs/index.htm',
    howToApplySteps: [
      'Confirm you meet income and first-time buyer requirements on the program site.',
      'Gather pay stubs, tax returns, and a lender pre-approval letter.',
      'Submit the online intake form and schedule a counseling session if required.',
    ],
  },
  {
    name: 'State HFA Grant',
    awardAmount: '$15,000',
    programType: 'Forgivable Loan',
    incomeDescription: 'Household income up to $108,000',
    locationDescription: 'Available through your state Housing Finance Agency',
    applyUrl: 'https://www.hud.gov/topics/buying_a_home',
    howToApplySteps: [
      'Find your state Housing Finance Agency portal and create an account.',
      'Complete the eligibility questionnaire and upload household income docs.',
      'Work with an approved lender to reserve funds before you go under contract.',
    ],
  },
  {
    name: 'CSDP Community Fund',
    awardAmount: '$24,500',
    programType: 'Deferred Loan',
    incomeDescription: 'Household income up to $96,000',
    locationDescription: 'Available in eligible census tracts in your metro',
    applyUrl: 'https://downpaymentresource.com/',
    howToApplySteps: [
      'Verify the property address falls inside an eligible area map.',
      'Apply through the community partner listed on the fund page.',
      'Keep your loan estimate handy — funds are often stacked with first-lien financing.',
    ],
  },
  {
    name: 'Workforce Housing Initiative',
    awardAmount: '$8,500',
    programType: 'Grant',
    incomeDescription: 'Household income up to 115% of area median income',
    locationDescription: 'Available in participating city and county workforce corridors',
    applyUrl: 'https://www.hud.gov/topics/buying_a_home',
    howToApplySteps: [
      'Check employer or occupation eligibility (teacher, nurse, municipal, etc.).',
      'Attend a short homebuyer education module if the program requires it.',
      'Submit your application within 30 days of your purchase contract date.',
    ],
  },
  {
    name: 'Neighborhood Revitalization Loan',
    awardAmount: '$12,000',
    programType: 'Forgivable Loan',
    incomeDescription: 'Household income up to $88,000',
    locationDescription: 'Available in targeted neighborhood revitalization zones',
    applyUrl: 'https://singlefamily.fanniemae.com/',
    howToApplySteps: [
      'Confirm the listing is in a participating revitalization zone.',
      'Request the program disclosure packet from your loan officer.',
      'Sign the affordability rider and complete any local compliance checks.',
    ],
  },
]

export function programTypeBadgeClass(t: DpaReportProgramType): string {
  switch (t) {
    case 'Grant':
      return 'bg-emerald-100 text-emerald-800'
    case 'Forgivable Loan':
      return 'bg-teal-100 text-teal-800'
    case 'Deferred Loan':
      return 'bg-sky-100 text-sky-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

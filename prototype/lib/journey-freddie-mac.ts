/**
 * Personalized Journey System
 * Step-by-Step Mortgage Guide
 */

export interface FreddieMacJourneyStep {
  id: string
  phase: 'preparation' | 'application' | 'processing' | 'closing' | 'post-closing'
  title: string
  description: string
  estimatedDays: number
  order: number
  freddieMacSection: string // Reference to guide section
  freddieMacPage?: number
  checklist: JourneyChecklistItem[]
  resources: JourneyResource[]
  tips: string[]
  redFlags: string[]
  personalizedNote?: string
}

export interface JourneyChecklistItem {
  id: string
  task: string
  description: string
  required: boolean
  xpReward: number
  freddieMacReference?: string
}

export interface JourneyResource {
  title: string
  type: 'document' | 'calculator' | 'guide' | 'video' | 'external'
  url?: string
  freddieMacReference?: string
}

/**
 * Generate personalized journey steps
 * Aligned with: "Your Step-by-Step Mortgage Guide: From Application to Closing"
 */
export function generateFreddieMacJourney(
  transactionType: 'first-time' | 'repeat-buyer' | 'refinance',
  readinessScore: number,
  timeline: '3-months' | '6-months' | '1-year' | 'exploring'
): FreddieMacJourneyStep[] {
  const baseSteps: FreddieMacJourneyStep[] = [
    {
      id: 'step-1',
      phase: 'preparation',
      title: 'Get Started: Determine Affordability & Educate Yourself',
      description: 'Before shopping for a home, determine how much you can afford and educate yourself about the mortgage process.',
      estimatedDays: timeline === '3-months' ? 7 : timeline === '6-months' ? 14 : 21,
      order: 1,
      freddieMacSection: 'Section 1: Overview of the Mortgage Process',
      freddieMacPage: 1,
      checklist: [
        {
          id: 'c1-1',
          task: 'Talk to a homeownership education counselor',
          description: 'Contact HUD-approved housing counseling agency (800-569-4287) or borrower help centers.',
          required: true,
          xpReward: 100,
          freddieMacReference: 'Section 1: "Getting Started" - Housing Counseling Resources'
        },
        {
          id: 'c1-2',
          task: 'Review your spending plan and comfort level',
          description: 'Calculate realistic monthly payment you can afford (not just what lenders approve). Determine affordability based on your spending plan and comfort level.',
          required: true,
          xpReward: 50,
          freddieMacReference: 'Section 1: "Getting Started" - Determine Affordability'
        },
        {
          id: 'c1-3',
          task: 'Check and improve your credit history',
          description: 'Review credit report, dispute errors, and take steps to improve credit score. Having a good credit history is an important beginning step.',
          required: true,
          xpReward: 75,
          freddieMacReference: 'Section 1: "Getting Started" - Credit History'
        },
        {
          id: 'c1-4',
          task: 'Talk to a loan officer for pre-qualification',
          description: 'Get initial assessment of loan amount and type you qualify for. Talk to a loan officer to review your income and expenses.',
          required: false,
          xpReward: 50,
          freddieMacReference: 'Section 1: "Getting Started" - Loan Officer Consultation'
        }
      ],
      resources: [
        {
          title: 'HUD Housing Counseling Agencies',
          type: 'external',
          url: 'https://www.hud.gov/offices/hsg/sfh/hcc/hcs.cfm',
          freddieMacReference: 'Section 1: Housing Counseling Resources'
        },
        {
          title: 'Borrower Help Centers',
          type: 'external',
          url: 'http://myhome.freddiemac.com/resources/borrower-helpcenters.html',
          freddieMacReference: 'Section 1: Borrower Help Centers'
        },
        {
          title: 'Step-by-Step Mortgage Guide',
          type: 'guide',
          url: 'https://sf.freddiemac.com/docs/pdf/update/step_by_step_mortgage_guide_english.pdf',
          freddieMacReference: 'Complete Guide Reference'
        }
      ],
      tips: [
        'Say NO to "easy money" offers that seem too good to be true',
        'Shop around and talk to several lenders',
        'Find out about prepayment penalties before committing',
        'Never falsify information on loan documents'
      ],
      redFlags: [
        'Someone claims "credit problems won\'t affect the interest rate"',
        'Offers to falsify income information',
        'Documents with blank fields or incorrect dates',
        'Pressure to sign without understanding terms'
      ],
      personalizedNote: readinessScore < 40
        ? 'Your readiness score indicates you need to focus on building your financial foundation first. Take time with preparation steps before shopping for a home.'
        : readinessScore < 70
        ? 'You\'re making good progress! Complete these preparation steps to strengthen your position.'
        : 'You\'re well-prepared! Use this step to fine-tune your approach and shop for the best rates.'
    },
    {
      id: 'step-2',
      phase: 'preparation',
      title: 'Understand the People and Their Services',
      description: 'Learn about the key professionals involved in the mortgage process and what they do for you.',
      estimatedDays: 7,
      order: 2,
      freddieMacSection: 'Section 2: Understanding the People and Their Services',
      freddieMacPage: 3,
      checklist: [
        {
          id: 'c2-1',
          task: 'Research and interview loan officers',
          description: 'Find a loan officer who understands your situation and offers competitive rates. Loan officers are mortgage specialists who will use your credit, financial and employment information to see if you qualify for a mortgage.',
          required: true,
          xpReward: 75,
          freddieMacReference: 'Section 2: "Loan Officer"'
        },
        {
          id: 'c2-2',
          task: 'Find a qualified real estate professional',
          description: 'Work with a Realtor® who has experience in your target area and transaction type. A real estate professional will help you find the right home for you and your family.',
          required: true,
          xpReward: 75,
          freddieMacReference: 'Section 2: "Real Estate Professional"'
        },
        {
          id: 'c2-3',
          task: 'Understand roles: appraiser, inspector, closing agent',
          description: 'Learn what each professional does and when they\'re involved in the process, including real estate appraiser, home inspector and closing representative.',
          required: false,
          xpReward: 25,
          freddieMacReference: 'Section 2: "Who\'s Who and What\'s What"'
        }
      ],
      resources: [
        {
          title: 'Understanding Your Homebuying Team',
          type: 'guide',
          freddieMacReference: 'Section 2: Complete section on professionals'
        },
        {
          title: 'Questions to Ask Your Loan Officer',
          type: 'guide',
          freddieMacReference: 'Section 2: Loan Officer section'
        },
        {
          title: 'Questions to Ask Your Realtor',
          type: 'guide',
          freddieMacReference: 'Section 2: Real Estate Professional section'
        }
      ],
      tips: [
        'Interview at least 3 loan officers before choosing',
        'Ask about their experience with your transaction type',
        'Verify credentials and check references',
        'Understand how each professional gets paid'
      ],
      redFlags: [
        'Loan officer pushes their "preferred" services (potential kickback)',
        'Real estate professional won\'t provide references',
        'Pressure to use specific vendors without shopping',
        'Hidden fees or kickback arrangements'
      ]
    },
    {
      id: 'step-3',
      phase: 'application',
      title: 'Complete Your Mortgage Loan Application',
      description: 'Submit your Uniform Residential Loan Application with all required documentation.',
      estimatedDays: 3,
      order: 3,
      freddieMacSection: 'Section 3: What You Should Know About Your Mortgage Loan Application',
      freddieMacPage: 5,
      checklist: [
        {
          id: 'c3-1',
          task: 'Gather required documents',
          description: 'W-2s, pay stubs, tax returns, bank statements, asset documentation.',
          required: true,
          xpReward: 50,
          freddieMacReference: 'Section 3: Required Documentation'
        },
        {
          id: 'c3-2',
          task: 'Complete Uniform Residential Loan Application',
          description: 'Provide accurate information about income, assets, debts, and employment. The Uniform Residential Loan Application is a standard mortgage loan application form on which you provide the lender with information required to assess your ability to repay the loan amount.',
          required: true,
          xpReward: 100,
          freddieMacReference: 'Section 3: Uniform Residential Loan Application'
        },
        {
          id: 'c3-3',
          task: 'Review and verify all information',
          description: 'Double-check all numbers, dates, and personal information for accuracy.  "Make sure documents are correct" and "Make sure documents are complete".',
          required: true,
          xpReward: 50,
          freddieMacReference: 'Section 1: "Make sure documents are correct"'
        },
        {
          id: 'c3-4',
          task: 'Submit application to lender',
          description: 'Submit complete application package. mortgage guide emphasizes submitting complete applications.',
          required: true,
          xpReward: 75,
          freddieMacReference: 'Section 3: Application Submission'
        }
      ],
      resources: [
        {
          title: 'Document Checklist',
          type: 'document',
          freddieMacReference: 'Section 3: Required Documentation'
        },
        {
          title: 'Uniform Residential Loan Application Guide',
          type: 'guide',
          freddieMacReference: 'Section 3: Complete section'
        },
        {
          title: 'Common Application Mistakes',
          type: 'guide',
          freddieMacReference: 'Section 1: Red Flags section'
        }
      ],
      tips: [
        'Never leave blank fields - use "N/A" if not applicable ( "Do not sign documents that have incorrect dates or blank fields")',
        'Ensure all dates are correct',
        'Don\'t sign documents you don\'t understand ( "If you\'re not sure, don\'t sign!")',
        'Keep copies of everything you submit'
      ],
      redFlags: [
        'Blank fields in application (warning)',
        'Incorrect dates or information ( "Do not sign documents that have incorrect dates")',
        'Pressure to sign incomplete documents ( "Be wary of promises that a professional will \'fix it later\'")',
        'Promises to "fix it later" (Important warning against this)'
      ]
    },
    {
      id: 'step-4',
      phase: 'application',
      title: 'Review Loan Estimate and Understand Your Costs',
      description: 'Within 3 business days, you\'ll receive a Loan Estimate. Review it carefully to understand all costs. This corresponds to Section 4 of the mortgage guide: "Understanding Your Costs Through Estimates, Disclosures and More".',
      estimatedDays: 7,
      order: 4,
      freddieMacSection: 'Section 4: Understanding Your Costs Through Estimates, Disclosures and More',
      freddieMacPage: 8,
      checklist: [
        {
          id: 'c4-1',
          task: 'Receive Loan Estimate from lender',
          description: 'Must be provided within 3 business days of application.  "Loan Estimate: A document that provides you with an estimate of the costs associated with your mortgage loan... Your loan officer must provide you with a Loan Estimate within three business days of submitting the loan application."',
          required: true,
          xpReward: 25,
          freddieMacReference: 'Section 4: Loan Estimate'
        },
        {
          id: 'c4-2',
          task: 'Compare Loan Estimates from multiple lenders',
          description: 'Get at least 3 Loan Estimates to compare rates, fees, and terms.  "Shop around. Always talk to several lenders."',
          required: true,
          xpReward: 150,
          freddieMacReference: 'Section 1: "Shop around"'
        },
        {
          id: 'c4-3',
          task: 'Understand all fees and charges',
          description: 'Review origination fees, points, title insurance, prepaid costs, and other charges.  "Ask about additional fees. Make sure you understand all of the fees that are part of your mortgage process."',
          required: true,
          xpReward: 75,
          freddieMacReference: 'Section 1: "Ask about additional fees"'
        },
        {
          id: 'c4-4',
          task: 'Compare Annual Percentage Rate (APR)',
          description: 'APR includes interest rate plus fees - use this to compare total loan costs.  "Understand the total package. Ask for written estimates that include all points and fees. Compare the annual percentage rate (APR), which combines a loan\'s interest rate with certain other fees charged by the lender at closing and over the life of the loan."',
          required: true,
          xpReward: 50,
          freddieMacReference: 'Section 4: Annual Percentage Rate (APR)'
        },
        {
          id: 'c4-5',
          task: 'Negotiate fees and rates',
          description: 'Use competing offers to negotiate better terms with your preferred lender. It\'s important to shop around for best terms.',
          required: false,
          xpReward: 100,
          freddieMacReference: 'Section 1: "Shop around"'
        }
      ],
      resources: [
        {
          title: 'Loan Estimate Explained',
          type: 'guide',
          freddieMacReference: 'Section 4: Loan Estimate section'
        },
        {
          title: 'Understanding APR vs Interest Rate',
          type: 'guide',
          freddieMacReference: 'Section 4: Annual Percentage Rate (APR)'
        },
        {
          title: 'Lender Comparison Tool',
          type: 'calculator',
          freddieMacReference: 'Section 1: "Shop around"'
        }
      ],
      tips: [
        'Compare APR, not just interest rate ( "Compare the annual percentage rate (APR)")',
        'Question any fees you didn\'t request ( "Question any items you didn\'t request or know about")',
        'Shop for title insurance separately ( "Shop around")',
        'Negotiate origination fees and points ( "Understand the total package")'
      ],
      redFlags: [
        'Origination fees >1% (0.5-1% is standard)',
        'Junk fees with vague names ( "Question any items you didn\'t request")',
        'Lender requires specific vendors ( "Shop around")',
        'Rate lock fees >$200 (often free or <$100)'
      ]
    },
    {
      id: 'step-5',
      phase: 'processing',
      title: 'Processing & Underwriting',
      description: 'Your lender will process your application, order an appraisal, and underwrite your loan. This phase involves property evaluation and risk assessment.',
      estimatedDays: 21,
      order: 5,
      freddieMacSection: 'Section 3 & 4: Processing and Underwriting',
      checklist: [
        {
          id: 'c5-1',
          task: 'Property appraisal ordered',
          description: 'Lender orders appraisal to verify property value.  "Real Estate Appraiser: A professional who estimates the value of a property."',
          required: true,
          xpReward: 25,
          freddieMacReference: 'Section 2: Real Estate Appraiser'
        },
        {
          id: 'c5-2',
          task: 'Home inspection scheduled',
          description: 'Schedule and attend home inspection.  "Home Inspector: A professional who examines the physical condition of a property."',
          required: true,
          xpReward: 50,
          freddieMacReference: 'Section 2: Home Inspector'
        },
        {
          id: 'c5-3',
          task: 'Underwriting review',
          description: 'Lender evaluates your application.  "Underwriting: The process that your lender uses to assess your eligibility to receive a mortgage loan. Underwriting involves the evaluation of your ability to repay the mortgage loan."',
          required: true,
          xpReward: 25,
          freddieMacReference: 'Section 7: Glossary - Underwriting'
        },
        {
          id: 'c5-4',
          task: 'Rate lock decision',
          description: 'Decide whether to lock your interest rate.  "Lock-In Agreement: A written agreement from your lender guaranteeing a specific mortgage interest rate for a certain amount of time."',
          required: false,
          xpReward: 50,
          freddieMacReference: 'Section 7: Glossary - Lock-In Agreement'
        }
      ],
      resources: [
        {
          title: 'Underwriting Process Explained',
          type: 'guide',
          freddieMacReference: 'Section 7: Glossary - Underwriting'
        },
        {
          title: 'Home Inspection Checklist',
          type: 'document',
          freddieMacReference: 'Section 2: Home Inspector'
        },
        {
          title: 'Rate Lock Strategy Guide',
          type: 'guide',
          freddieMacReference: 'Section 7: Glossary - Lock-In Agreement'
        }
      ],
      tips: [
        'Don\'t make major purchases during this phase',
        'Don\'t change jobs if possible',
        'Keep credit card balances low',
        'Respond to requests within 24-48 hours'
      ],
      redFlags: [
        'Appraisal comes in below purchase price',
        'Underwriter requests unusual documentation',
        'Delays without explanation',
        'Terms change from Loan Estimate ( "Understand the total package")'
      ]
    },
    {
      id: 'step-6',
      phase: 'closing',
      title: 'Prepare for Closing',
      description: 'Review Closing Disclosure, arrange funds, and prepare for final closing meeting. This aligns with Section 5 of the mortgage guide: "What You Should Know About Your Closing".',
      estimatedDays: 3,
      order: 6,
      freddieMacSection: 'Section 5: What You Should Know About Your Closing',
      freddieMacPage: 11,
      checklist: [
        {
          id: 'c6-1',
          task: 'Receive Closing Disclosure',
          description: 'Review at least 3 business days before closing (required by law).  "Closing Disclosure: A standard form required by Federal law that discloses the fees and services associated with closing your mortgage loan... It discloses the mortgage loan amount being financed, closing fees and charges, the payment schedule, the interest rate, the annual percentage rate and any other costs associated with the mortgage loan."',
          required: true,
          xpReward: 75,
          freddieMacReference: 'Section 5: Closing Disclosure'
        },
        {
          id: 'c6-2',
          task: 'Compare Closing Disclosure to Loan Estimate',
          description: 'Verify fees haven\'t increased unexpectedly (tolerance rules apply). It\'s important to compare documents.',
          required: true,
          xpReward: 100,
          freddieMacReference: 'Section 4: Comparing Estimates'
        },
        {
          id: 'c6-3',
          task: 'Arrange closing funds',
          description: 'Get cashier\'s check or wire transfer ready for closing costs and down payment. mortgage guide covers closing costs.',
          required: true,
          xpReward: 50,
          freddieMacReference: 'Section 4: Closing Costs'
        },
        {
          id: 'c6-4',
          task: 'Schedule final walkthrough',
          description: 'Inspect property one last time before closing.',
          required: true,
          xpReward: 50,
          freddieMacReference: 'Section 5: Closing Process'
        },
        {
          id: 'c6-5',
          task: 'Review all closing documents',
          description: 'Read mortgage note, deed, and all closing documents carefully.  "Don\'t sign documents you don\'t understand" and "If you\'re not sure, don\'t sign!"',
          required: true,
          xpReward: 75,
          freddieMacReference: 'Section 1: Document Review'
        }
      ],
      resources: [
        {
          title: 'Closing Disclosure Explained',
          type: 'guide',
          freddieMacReference: 'Section 5: Closing Disclosure'
        },
        {
          title: 'Closing Document Checklist',
          type: 'document',
          freddieMacReference: 'Section 5: Closing Documents'
        },
        {
          title: 'What to Bring to Closing',
          type: 'guide',
          freddieMacReference: 'Section 5: Closing Day'
        }
      ],
      tips: [
        'Review Closing Disclosure carefully - compare to Loan Estimate ( "Understand the total package")',
        'Question any fees that increased significantly ( "Question any items you didn\'t request")',
        'Bring valid ID and proof of insurance',
        'Allow 2-3 hours for closing meeting'
      ],
      redFlags: [
        'Fees increased beyond tolerance limits ( "Question any items you didn\'t request")',
        'Documents with blank fields ( "Do not sign documents that have incorrect dates or blank fields")',
        'Pressure to sign without reading ( "If you\'re not sure, don\'t sign!")',
        'Changes from commitment letter'
      ]
    },
    {
      id: 'step-7',
      phase: 'closing',
      title: 'Closing Day',
      description: 'Sign all documents, transfer ownership, and receive keys to your new home. This is the culmination of Section 5: "What You Should Know About Your Closing".',
      estimatedDays: 1,
      order: 7,
      freddieMacSection: 'Section 5: What You Should Know About Your Closing',
      freddieMacPage: 11,
      checklist: [
        {
          id: 'c7-1',
          task: 'Attend closing meeting',
          description: 'Meet with closing agent, seller, and real estate professionals. mortgage guide covers closing process.',
          required: true,
          xpReward: 200,
          freddieMacReference: 'Section 5: Closing Day'
        },
        {
          id: 'c7-2',
          task: 'Sign all closing documents',
          description: 'Mortgage note, deed, closing disclosure, and other required documents.  "Mortgage Note: A legal document that provides evidence of your indebtedness and your formal promise to repay the mortgage loan."',
          required: true,
          xpReward: 100,
          freddieMacReference: 'Section 5: Closing Documents & Section 7: Glossary - Mortgage Note'
        },
        {
          id: 'c7-3',
          task: 'Provide closing funds',
          description: 'Pay down payment and closing costs as specified.  "Closing Costs: The costs to complete the real estate transaction. These costs are in addition to the price of the home and are paid at closing."',
          required: true,
          xpReward: 50,
          freddieMacReference: 'Section 4: Closing Costs'
        },
        {
          id: 'c7-4',
          task: 'Receive keys and ownership documents',
          description: 'Get keys to your new home and copies of all signed documents. mortgage guide emphasizes keeping copies.',
          required: true,
          xpReward: 150,
          freddieMacReference: 'Section 5: Post-Closing'
        }
      ],
      resources: [
        {
          title: 'Closing Day Checklist',
          type: 'document',
          freddieMacReference: 'Section 5: Complete section'
        },
        {
          title: 'Understanding Your Mortgage Note',
          type: 'guide',
          freddieMacReference: 'Section 7: Glossary - Mortgage Note'
        },
        {
          title: 'Post-Closing Guide',
          type: 'guide',
          freddieMacReference: 'Section 6: Owning and Keeping Your Home'
        }
      ],
      tips: [
        'Read every document before signing ( "Don\'t sign documents you don\'t understand")',
        'Ask questions if anything is unclear ( "If you\'re not sure, don\'t sign!")',
        'Keep copies of all documents (It\'s important to document retention)',
        'Verify all numbers match your expectations ( "Make sure documents are correct")'
      ],
      redFlags: [
        'Documents you haven\'t seen before ( "Make sure documents are complete")',
        'Numbers that don\'t match commitment ( "Understand the total package")',
        'Pressure to sign quickly ( "If you\'re not sure, don\'t sign!")',
        'Blank spaces in documents ( "Do not sign documents that have incorrect dates or blank fields")'
      ]
    },
    {
      id: 'step-8',
      phase: 'post-closing',
      title: 'Owning and Keeping Your Home',
      description: 'Manage your mortgage, maintain your home, and protect your investment. This corresponds to Section 6 of the mortgage guide: "Owning and Keeping Your Home".',
      estimatedDays: 365,
      order: 8,
      freddieMacSection: 'Section 6: Owning and Keeping Your Home',
      freddieMacPage: 13,
      checklist: [
        {
          id: 'c8-1',
          task: 'Set up automatic mortgage payments',
          description: 'Ensure timely payments to protect your credit and avoid late fees. mortgage guide emphasizes maintaining your mortgage.',
          required: true,
          xpReward: 50,
          freddieMacReference: 'Section 6: Mortgage Management'
        },
        {
          id: 'c8-2',
          task: 'Understand your mortgage statement',
          description: 'Learn to read and understand your monthly mortgage statement. mortgage guide covers mortgage statements.',
          required: true,
          xpReward: 75,
          freddieMacReference: 'Section 6: Understanding Your Mortgage'
        },
        {
          id: 'c8-3',
          task: 'Maintain your home',
          description: 'Regular maintenance to protect your investment.  "Owning and Keeping Your Home" section.',
          required: true,
          xpReward: 25,
          freddieMacReference: 'Section 6: Home Maintenance'
        },
        {
          id: 'c8-4',
          task: 'Monitor escrow account',
          description: 'Review escrow statements and understand how property taxes and insurance are handled.  "Escrow: A deposit by a borrower to the lender of funds to pay property taxes, insurance premiums and similar expenses when they become due."',
          required: false,
          xpReward: 50,
          freddieMacReference: 'Section 6: Escrow Management & Section 7: Glossary - Escrow'
        },
        {
          id: 'c8-5',
          task: 'Plan for long-term homeownership',
          description: 'Consider refinancing opportunities, home improvements, and long-term financial planning. mortgage guide addresses long-term homeownership.',
          required: false,
          xpReward: 100,
          freddieMacReference: 'Section 6: Long-Term Planning'
        }
      ],
      resources: [
        {
          title: 'Understanding Your Mortgage Statement',
          type: 'guide',
          freddieMacReference: 'Section 6: Mortgage Statements'
        },
        {
          title: 'Home Maintenance Guide',
          type: 'guide',
          freddieMacReference: 'Section 6: Home Maintenance'
        },
        {
          title: 'Escrow Account Management',
          type: 'guide',
          freddieMacReference: 'Section 7: Glossary - Escrow'
        }
      ],
      tips: [
        'Make payments on time to protect your credit ( "Owning and Keeping Your Home")',
        'Review mortgage statements monthly',
        'Keep records of all home improvements',
        'Monitor your escrow account for changes ( Escrow section)'
      ],
      redFlags: [
        'Unexpected escrow increases without explanation',
        'Mortgage servicer changes without notice',
        'Payment processing errors',
        'Missing or incorrect statements'
      ]
    }
  ]

  // Filter and personalize based on transaction type
  let filteredSteps = baseSteps

  if (transactionType === 'repeat-buyer') {
    // Skip steps 1-2, start at step 3
    filteredSteps = baseSteps.filter(step => parseInt(step.id.split('-')[1]) >= 3)
    // Adjust step 3 to focus on new application
    filteredSteps[0].personalizedNote = 'As a repeat buyer, you can leverage your previous homeownership experience. Focus on equity utilization and timing optimization.'
  }

  if (transactionType === 'refinance') {
    // Only steps 3-6, modified for refinance
    filteredSteps = baseSteps.filter(step => {
      const stepNum = parseInt(step.id.split('-')[1])
      return stepNum >= 3 && stepNum <= 6
    })
    filteredSteps[0].personalizedNote = 'For refinancing, focus on break-even analysis and rate optimization. Compare your current loan terms with new offers.'
  }

  // Adjust timeline based on readiness score
  if (readinessScore < 40) {
    filteredSteps.forEach(step => {
      step.estimatedDays = Math.ceil(step.estimatedDays * 1.5) // Extend timeline
      step.personalizedNote = 'Your readiness score suggests taking extra time with each step. Don\'t rush the process.'
    })
  } else if (readinessScore >= 70) {
    filteredSteps.forEach(step => {
      step.estimatedDays = Math.ceil(step.estimatedDays * 0.8) // Accelerate timeline
    })
  }

  return filteredSteps
}

/**
 * Get mortgage guide reference URL
 */
export function getFreddieMacGuideUrl(section?: string, page?: number): string {
  const baseUrl = 'https://sf.freddiemac.com/docs/pdf/update/step_by_step_mortgage_guide_english.pdf'
  if (page) {
    return `${baseUrl}#page=${page}`
  }
  return baseUrl
}

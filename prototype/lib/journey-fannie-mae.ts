/**
 * Journey System - 7 Steps to Homeownership
 * Based on industry-standard home buying process
 */

export interface FannieMaeJourneyStep {
  id: string
  stepNumber: number
  title: string
  shortTitle: string
  description: string
  estimatedDays: number
  checklist: JourneyChecklistItem[]
  resources: JourneyResource[]
  tips: string[]
  redFlags: string[]
  xpReward: number // Total XP for completing this step
  badgeUnlock?: string // Badge ID unlocked when step is completed
  personalizedNote?: string
}

export interface JourneyChecklistItem {
  id: string
  task: string
  description: string
  required: boolean
  xpReward: number
  fannieMaeReference?: string
}

export interface JourneyResource {
  title: string
  type: 'calculator' | 'guide' | 'tool' | 'course' | 'external'
  url?: string
  fannieMaeReference?: string
}

/**
 * Generate personalized journey steps based on the 7-step homeownership process
 */
export function generateFannieMaeJourney(
  transactionType: 'first-time' | 'repeat-buyer' | 'refinance',
  readinessScore: number,
  timeline: '3-months' | '6-months' | '1-year' | 'exploring'
): FannieMaeJourneyStep[] {
  const baseSteps: FannieMaeJourneyStep[] = [
    {
      id: 'step-1-ready',
      stepNumber: 1,
      title: 'Know when you\'re ready',
      shortTitle: 'Know when you\'re ready',
      description: 'A home is likely the largest purchase you\'ll ever make, so it\'s important that you\'re well prepared.',
      estimatedDays: timeline === '3-months' ? 7 : timeline === '6-months' ? 14 : 21,
      xpReward: 300,
      badgeUnlock: 'first-steps',
      checklist: [
        {
          id: 'c1-1',
          task: 'Decide whether to rent or buy',
          description: 'Start by determining if either buying or renting makes the most sense for you right now. There are costs and benefits associated with each.',
          required: true,
          xpReward: 75,
          fannieMaeReference: 'Step 1: Decide whether to rent or buy'
        },
        {
          id: 'c1-2',
          task: 'Determine what you can afford',
          description: 'Use the mortgage affordability calculator to estimate how a mortgage could fit into your financial situation.',
          required: true,
          xpReward: 100,
          fannieMaeReference: 'Step 1: Determine what you can afford'
        },
        {
          id: 'c1-3',
          task: 'Build and manage your credit',
          description: 'Your credit plays a crucial role in the mortgage lending process. Brush up on the basics and be sure you\'re making the most of your credit.',
          required: true,
          xpReward: 100,
          fannieMaeReference: 'Step 1: Build and manage your credit'
        },
        {
          id: 'c1-4',
          task: 'Put your rent payments to work',
          description: 'If you consistently pay your rent each month, you\'re likely to keep up with mortgage payments too. A solid record of rent payments can now help you qualify for a mortgage.',
          required: false,
          xpReward: 50,
          fannieMaeReference: 'Step 1: Put your rent payments to work'
        }
      ],
      resources: [
        {
          title: 'Mortgage Affordability Calculator',
          type: 'calculator',
          url: 'https://yourhome.fanniemae.com/buy/calculators-tools/mortgage-affordability-calculator',
          fannieMaeReference: 'Step 1: Mortgage affordability calculator'
        },
        {
          title: 'Credit Basics',
          type: 'guide',
          url: 'https://yourhome.fanniemae.com/buy/credit-basics',
          fannieMaeReference: 'Step 1: Credit basics'
        }
      ],
      tips: [
        'Start by determining if buying or renting makes the most sense for you right now',
        'Use the mortgage affordability calculator to estimate how a mortgage could fit into your financial situation',
        'Your credit plays a crucial role in the mortgage lending process',
        'A solid record of rent payments can help you qualify for a mortgage'
      ],
      redFlags: [
        'Someone claims "credit problems won\'t affect the interest rate"',
        'Offers to falsify income information',
        'Pressure to make a decision before you\'re ready'
      ],
      personalizedNote: readinessScore < 40
        ? 'Your readiness score indicates you need to focus on building your financial foundation first. Take time with this step.'
        : readinessScore < 70
        ? 'You\'re making good progress! Complete these preparation steps to strengthen your position.'
        : 'You\'re well-prepared! Use this step to fine-tune your approach.'
    },
    {
      id: 'step-2-save',
      stepNumber: 2,
      title: 'Save for homeownership',
      shortTitle: 'Save for homeownership',
      description: 'Saving is essential to pay for required home buying costs. In addition to a down payment, there are closing costs, other fees, and unexpected expenses to keep in mind.',
      estimatedDays: timeline === '3-months' ? 14 : timeline === '6-months' ? 30 : 60,
      xpReward: 400,
      badgeUnlock: 'savings-champion',
      checklist: [
        {
          id: 'c2-1',
          task: 'Calculate how much house you can afford',
          description: 'One of the first questions you may ask when starting the process is, "Can I afford a home?"',
          required: true,
          xpReward: 100,
          fannieMaeReference: 'Step 2: How much house can you afford?'
        },
        {
          id: 'c2-2',
          task: 'Prepare for upfront and ongoing costs',
          description: 'From your down payment and mortgage loan closing costs to homeowners\' insurance and ongoing maintenance, don\'t let these expenses catch you off guard.',
          required: true,
          xpReward: 150,
          fannieMaeReference: 'Step 2: Prepare for upfront and ongoing costs'
        },
        {
          id: 'c2-3',
          task: 'Budget for closing costs',
          description: 'Closing costs typically range from 2% to 5% of the value of your mortgage. Use the closing costs calculator to see ranges of common closing fees.',
          required: true,
          xpReward: 100,
          fannieMaeReference: 'Step 2: Budget for closing costs'
        },
        {
          id: 'c2-4',
          task: 'Understand your debt-to-income ratio',
          description: 'Lenders consider your debt-to-income (DTI) ratio when determining what mortgage loans are available to you.',
          required: true,
          xpReward: 100,
          fannieMaeReference: 'Step 2: Understand your debt-to-income ratio'
        }
      ],
      resources: [
        {
          title: 'Closing Costs Calculator',
          type: 'calculator',
          url: 'https://yourhome.fanniemae.com/buy/calculators-tools/closing-costs-calculator',
          fannieMaeReference: 'Step 2: Closing costs calculator'
        },
        {
          title: 'Down Payment Assistance Search Tool',
          type: 'tool',
          url: 'https://yourhome.fanniemae.com/buy/calculators-tools/downpayment-assistance-search-tool',
          fannieMaeReference: 'Step 2: Down payment assistance search tool'
        }
      ],
      tips: [
        'Closing costs typically range from 2% to 5% of the value of your mortgage',
        'Lenders consider your debt-to-income (DTI) ratio when determining loan availability',
        'Don\'t forget about homeowners\' insurance and ongoing maintenance costs',
        'Use down payment assistance programs if you qualify'
      ],
      redFlags: [
        'Lender doesn\'t explain all costs upfront',
        'Pressure to commit before understanding all expenses',
        'Hidden fees that weren\'t disclosed initially'
      ],
      personalizedNote: readinessScore < 40
        ? 'Focus on building your savings and understanding all the costs involved. This is a critical step.'
        : readinessScore < 70
        ? 'You\'re on the right track! Make sure you understand all upfront and ongoing costs.'
        : 'Great preparation! Ensure you have a solid savings plan in place.'
    },
    {
      id: 'step-3-lender',
      stepNumber: 3,
      title: 'Work with a mortgage lender',
      shortTitle: 'Work with a mortgage lender',
      description: 'There are many different mortgage lenders. When you find the right one for you, they\'ll evaluate your finances and explain your mortgage options.',
      estimatedDays: 14,
      xpReward: 350,
      checklist: [
        {
          id: 'c3-1',
          task: 'Choose a lender',
          description: 'Different lenders may offer different mortgage products, require different fees, and use different processes. Use our checklist to help select a lender that meets your specific needs.',
          required: true,
          xpReward: 150,
          fannieMaeReference: 'Step 3: Choose a lender'
        },
        {
          id: 'c3-2',
          task: 'Understand loan basics',
          description: 'Get an overview of mortgage loan definitions and processes. Find out how mortgages work and what factors may impact your loan terms.',
          required: true,
          xpReward: 100,
          fannieMaeReference: 'Step 3: Understand loan basics'
        },
        {
          id: 'c3-3',
          task: 'Learn about types of mortgage loans',
          description: 'Mortgage loans aren\'t one-size-fits-all. Before deciding which one works for you, get to know the different kinds available.',
          required: true,
          xpReward: 100,
          fannieMaeReference: 'Step 3: Types of mortgage loans'
        }
      ],
      resources: [
        {
          title: 'Lender Selection Checklist',
          type: 'guide',
          url: 'https://yourhome.fanniemae.com/buy',
          fannieMaeReference: 'Step 3: Choose a lender'
        },
        {
          title: 'Loan Basics Guide',
          type: 'guide',
          url: 'https://yourhome.fanniemae.com/buy',
          fannieMaeReference: 'Step 3: Understand loan basics'
        }
      ],
      tips: [
        'Different lenders may offer different mortgage products and fees',
        'Shop around and compare multiple lenders',
        'Ask questions about loan terms and fees',
        'Get pre-approved to understand your buying power'
      ],
      redFlags: [
        'Lender pressures you to make a quick decision',
        'Fees that seem unusually high',
        'Lender won\'t provide written estimates',
        'Promises that seem too good to be true'
      ],
      personalizedNote: readinessScore < 40
        ? 'Take your time choosing a lender. Ask lots of questions and compare options.'
        : readinessScore < 70
        ? 'You\'re ready to work with lenders. Make sure to compare multiple options.'
        : 'You\'re well-prepared! Use this step to find the best lender for your needs.'
    },
    {
      id: 'step-4-shop',
      stepNumber: 4,
      title: 'Shop for a home',
      shortTitle: 'Shop for a home',
      description: 'Before you begin shopping for a home, it\'s important to know what you\'re looking for and what\'s within your budget. Defining what your top priorities are can make your home search more enjoyable.',
      estimatedDays: timeline === '3-months' ? 30 : timeline === '6-months' ? 60 : 90,
      xpReward: 300,
      checklist: [
        {
          id: 'c4-1',
          task: 'Find the right agent',
          description: 'A real estate agent can help you find and view homes. Consider multiple agents before choosing one: Ask friends for recommendations, read online reviews, and meet with the agents directly.',
          required: true,
          xpReward: 100,
          fannieMaeReference: 'Step 4: Find the right agent'
        },
        {
          id: 'c4-2',
          task: 'Decide what you need and want in a home',
          description: 'Many factors and features can influence a home\'s purchase price and the ongoing costs of homeownership. Learn about the major considerations beforehand.',
          required: true,
          xpReward: 100,
          fannieMaeReference: 'Step 4: Decide what you need and want in a home'
        }
      ],
      resources: [
        {
          title: 'Home Shopping Guide',
          type: 'guide',
          url: 'https://yourhome.fanniemae.com/buy',
          fannieMaeReference: 'Step 4: Shop for a home'
        }
      ],
      tips: [
        'Consider multiple agents before choosing one',
        'Ask friends for recommendations and read online reviews',
        'Define your top priorities before you start looking',
        'Stay within your budget - don\'t let emotions override your financial plan'
      ],
      redFlags: [
        'Agent pressures you to make an offer quickly',
        'Agent won\'t show you homes in your price range',
        'Agent has conflicts of interest',
        'Pressure to waive inspections or contingencies'
      ],
      personalizedNote: readinessScore < 40
        ? 'Take your time with this step. Don\'t rush into a decision.'
        : readinessScore < 70
        ? 'You\'re ready to start shopping! Work with a good agent and stay within your budget.'
        : 'You\'re well-prepared! Enjoy the home shopping process while staying focused on your priorities.'
    },
    {
      id: 'step-5-offer',
      stepNumber: 5,
      title: 'Make an offer on a home',
      shortTitle: 'Make an offer',
      description: 'When you decide to purchase a particular home, you\'ll submit an offer to the seller. If they accept your offer, you\'ll both sign a sales contract.',
      estimatedDays: 21,
      xpReward: 400,
      checklist: [
        {
          id: 'c5-1',
          task: 'Make an offer',
          description: 'Submitting an offer on a home can be an emotional experience, particularly for first-time buyers. Familiarizing yourself with the process can boost your confidence.',
          required: true,
          xpReward: 150,
          fannieMaeReference: 'Step 5: Making an offer'
        },
        {
          id: 'c5-2',
          task: 'Provide documentation to your lender',
          description: 'At this point your lender will request additional documentation. Our documentation checklist can help you make sure you provide them with everything they will need.',
          required: true,
          xpReward: 100,
          fannieMaeReference: 'Step 5: Provide documentation to your lender'
        },
        {
          id: 'c5-3',
          task: 'Get a home inspection',
          description: 'A home inspection is a great — and valuable — way to discover the true health of the home you want to purchase.',
          required: true,
          xpReward: 100,
          fannieMaeReference: 'Step 5: Getting a Home Inspection'
        },
        {
          id: 'c5-4',
          task: 'Understand home appraisals',
          description: 'A home appraisal is an independent assessment of the value of the property by a trained professional.',
          required: true,
          xpReward: 100,
          fannieMaeReference: 'Step 5: Understanding home appraisals'
        }
      ],
      resources: [
        {
          title: 'Documentation Checklist',
          type: 'guide',
          url: 'https://yourhome.fanniemae.com/buy',
          fannieMaeReference: 'Step 5: Provide documentation to your lender'
        }
      ],
      tips: [
        'Familiarize yourself with the offer process before submitting',
        'Don\'t skip the home inspection - it\'s valuable protection',
        'Understand that appraisals protect both you and the lender',
        'Be prepared to provide additional documentation quickly'
      ],
      redFlags: [
        'Pressure to waive the home inspection',
        'Seller won\'t allow inspections',
        'Appraisal comes in significantly below offer price',
        'Lender requests unusual documentation'
      ],
      personalizedNote: readinessScore < 40
        ? 'Take your time with this step. Don\'t skip inspections or rush the process.'
        : readinessScore < 70
        ? 'You\'re ready to make an offer! Make sure to get a thorough inspection.'
        : 'You\'re well-prepared! Follow the process carefully and protect your interests.'
    },
    {
      id: 'step-6-close',
      stepNumber: 6,
      title: 'Get ready to close your loan',
      shortTitle: 'Get ready to close',
      description: 'You\'ll work with your mortgage lender to finish up remaining paperwork, finalize your loan, and transfer ownership. And when it\'s done, you own your home.',
      estimatedDays: 14,
      xpReward: 500,
      badgeUnlock: 'homeowner-ready',
      checklist: [
        {
          id: 'c6-1',
          task: 'Understand what to expect when closing',
          description: 'You\'ll set a closing date and location with your lender, real estate agent, and closing agent. They\'ll help you finish remaining paperwork, finalize the loan, and make sure that all funds for closing get transferred.',
          required: true,
          xpReward: 150,
          fannieMaeReference: 'Step 6: What to expect when closing'
        },
        {
          id: 'c6-2',
          task: 'Understand the title process',
          description: 'There are a few things to know about transferring the legal ownership of your home from the seller to you during the closing process.',
          required: true,
          xpReward: 100,
          fannieMaeReference: 'Step 6: Understanding the title process'
        },
        {
          id: 'c6-3',
          task: 'Review closing checklist',
          description: 'There will be a lot going on and many papers to sign, but you\'ll have your real estate agent for guidance along the way.',
          required: true,
          xpReward: 100,
          fannieMaeReference: 'Step 6: Closing checklist'
        },
        {
          id: 'c6-4',
          task: 'Complete closing on your loan',
          description: 'Now is the time to tie up any loose ends and complete any remaining paperwork. Having a good understanding of the loan closing process will help make the home buying experience smoother.',
          required: true,
          xpReward: 150,
          fannieMaeReference: 'Step 6: Closing on a loan'
        }
      ],
      resources: [
        {
          title: 'Closing Checklist',
          type: 'guide',
          url: 'https://yourhome.fanniemae.com/buy',
          fannieMaeReference: 'Step 6: Closing checklist'
        }
      ],
      tips: [
        'Review all closing documents carefully before signing',
        'Bring a cashier\'s check or arrange wire transfer for closing costs',
        'Ask questions if anything is unclear',
        'Keep copies of all closing documents'
      ],
      redFlags: [
        'Documents with blank fields or incorrect information',
        'Pressure to sign without reading documents',
        'Fees that increased significantly from Loan Estimate',
        'Numbers that don\'t match your expectations'
      ],
      personalizedNote: readinessScore < 40
        ? 'Take your time reviewing all closing documents. Don\'t sign anything you don\'t understand.'
        : readinessScore < 70
        ? 'You\'re almost there! Review everything carefully before closing.'
        : 'You\'re well-prepared! Complete the closing process with confidence.'
    },
    {
      id: 'step-7-homeowner',
      stepNumber: 7,
      title: 'Welcome to homeownership',
      shortTitle: 'Welcome to homeownership',
      description: 'Congratulations, homeowner! Although this is the last step, it\'s just the beginning of your journey as a homeowner.',
      estimatedDays: 0,
      xpReward: 600,
      badgeUnlock: 'homeowner',
      checklist: [
        {
          id: 'c7-1',
          task: 'Learn about homeownership responsibilities',
          description: 'You\'ll have a lot of new responsibilities, like paying your mortgage on time and maintaining your home — plus ongoing expenses, like property taxes and insurance.',
          required: true,
          xpReward: 200,
          fannieMaeReference: 'Step 7: Learn about homeownership'
        },
        {
          id: 'c7-2',
          task: 'Set up automatic mortgage payments',
          description: 'Ensure timely payments to protect your credit and avoid late fees.',
          required: true,
          xpReward: 150,
          fannieMaeReference: 'Step 7: Paying your mortgage'
        },
        {
          id: 'c7-3',
          task: 'Understand your monthly mortgage statement',
          description: 'Learn to read and understand your monthly mortgage statement.',
          required: true,
          xpReward: 100,
          fannieMaeReference: 'Step 7: Understanding mortgage statements'
        },
        {
          id: 'c7-4',
          task: 'Plan for ongoing maintenance',
          description: 'Regular maintenance to protect your investment. Budget for repairs and improvements.',
          required: true,
          xpReward: 100,
          fannieMaeReference: 'Step 7: Maintaining your home'
        },
        {
          id: 'c7-5',
          task: 'Review escrow statements',
          description: 'Review escrow statements and understand how property taxes and insurance are handled.',
          required: false,
          xpReward: 50,
          fannieMaeReference: 'Step 7: Escrow management'
        }
      ],
      resources: [
        {
          title: 'Homeowner Resources',
          type: 'guide',
          url: 'https://yourhome.fanniemae.com/own',
          fannieMaeReference: 'Step 7: Homeowner resources'
        },
        {
          title: 'HomeView® Homeownership Education Course',
          type: 'course',
          url: 'https://yourhome.fanniemae.com/buy/homeview-homeownership-education-course',
          fannieMaeReference: 'Step 7: HomeView course'
        }
      ],
      tips: [
        'Make payments on time to protect your credit',
        'Budget for ongoing maintenance and repairs',
        'Review your escrow statements regularly',
        'Keep all important documents in a safe place',
        'Consider refinancing opportunities when rates are favorable'
      ],
      redFlags: [
        'Missing mortgage payments',
        'Ignoring maintenance issues',
        'Not reviewing escrow statements',
        'Not understanding your mortgage terms'
      ],
      personalizedNote: 'Congratulations on becoming a homeowner! This is just the beginning of your journey. Stay organized and proactive with your mortgage and home maintenance.'
    }
  ]

  // Personalize based on transaction type and readiness
  return baseSteps.map(step => {
    let personalizedNote = step.personalizedNote

    if (transactionType === 'repeat-buyer') {
      if (step.stepNumber === 1) {
        personalizedNote = 'As a repeat buyer, you have experience with the process. Use this step to refresh your knowledge and ensure you\'re making the best decision.'
      } else if (step.stepNumber === 4) {
        personalizedNote = 'You know what to look for! Use your previous experience to find the perfect next home.'
      }
    } else if (transactionType === 'refinance') {
      if (step.stepNumber <= 3) {
        personalizedNote = 'Since you\'re refinancing, focus on steps 3-6. Steps 1-2 may be less relevant, but reviewing them can help ensure you\'re making the right decision.'
      }
    }

    return {
      ...step,
      personalizedNote: personalizedNote || step.personalizedNote
    }
  })
}

/**
 * Get resource URL for a specific step
 */
export function getFannieMaeStepUrl(stepNumber: number): string {
  return `https://yourhome.fanniemae.com/buy`
}

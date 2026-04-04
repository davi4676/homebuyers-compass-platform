/**
 * Fannie Mae Resources Integration
 * Compliments data across outputs with official Fannie Mae resources
 * Source: https://yourhome.fanniemae.com/
 */

export interface FannieMaeResource {
  id: string
  title: string
  description: string
  url: string
  category: 'education' | 'calculator' | 'tool' | 'guide' | 'course' | 'program'
  icon?: string
  applicableTo?: ('first-time' | 'repeat-buyer' | 'refinance')[]
}

export const FANNIE_MAE_RESOURCES: Record<string, FannieMaeResource[]> = {
  // Education & Courses
  education: [
    {
      id: 'homeview-course',
      title: 'HomeView® Homeownership Education Course',
      description: 'Free online course for first-time homebuyers. Completing may help you qualify for assistance programs.',
      url: 'https://yourhome.fanniemae.com/buy/homeview-homeownership-education-course',
      category: 'course',
      applicableTo: ['first-time', 'repeat-buyer']
    },
    {
      id: '7-steps',
      title: '7 Steps to Homeownership',
      description: 'Comprehensive guide covering each step of the home buying process from preparation to closing.',
      url: 'https://yourhome.fanniemae.com/buy/all-homebuyer-resources',
      category: 'guide',
      applicableTo: ['first-time', 'repeat-buyer']
    },
    {
      id: 'credit-basics',
      title: 'Credit Basics',
      description: 'Learn how to improve your credit score and understand how it affects your mortgage options.',
      url: 'https://yourhome.fanniemae.com/calculators-tools/credit-basics',
      category: 'education',
      applicableTo: ['first-time', 'repeat-buyer', 'refinance']
    }
  ],

  // Calculators & Tools
  calculators: [
    {
      id: 'mortgage-calculator',
      title: 'Mortgage Calculator',
      description: 'Calculate your monthly payment, see how much home you can afford, and understand total costs.',
      url: 'https://yourhome.fanniemae.com/calculators-tools/mortgage-calculator',
      category: 'calculator',
      applicableTo: ['first-time', 'repeat-buyer', 'refinance']
    },
    {
      id: 'downpayment-assistance',
      title: 'Downpayment Assistance Search Tool',
      description: 'Find downpayment assistance programs available in your area.',
      url: 'https://yourhome.fanniemae.com/calculators-tools/downpayment-assistance-search-tool',
      category: 'tool',
      applicableTo: ['first-time', 'repeat-buyer']
    },
    {
      id: 'loan-lookup',
      title: 'Loan Lookup Tool',
      description: 'Check if your mortgage is owned by Fannie Mae and access resources specific to your loan.',
      url: 'https://yourhome.fanniemae.com/calculators-tools/loan-lookup-tool',
      category: 'tool',
      applicableTo: ['repeat-buyer', 'refinance']
    }
  ],

  // Special Programs
  programs: [
    {
      id: 'make-rent-count',
      title: 'Make Your Rent Count',
      description: 'If you consistently pay rent on time, you may be able to use that payment history to qualify for a mortgage, even with limited credit history.',
      url: 'https://yourhome.fanniemae.com/rent/make-your-rent-count',
      category: 'program',
      applicableTo: ['first-time']
    },
    {
      id: 'affordable-mortgage-options',
      title: 'Affordable Mortgage Options',
      description: 'Learn about mortgage loan options available, including programs designed for first-time and low-to-moderate income homebuyers.',
      url: 'https://yourhome.fanniemae.com/buy/affordable-mortgage-options',
      category: 'guide',
      applicableTo: ['first-time', 'repeat-buyer']
    }
  ],

  // Help & Support
  support: [
    {
      id: 'housing-counselor',
      title: 'Contact a Housing Counselor',
      description: 'Get free, expert guidance from HUD-approved housing counselors to help with your home buying journey.',
      url: 'https://yourhome.fanniemae.com/calculators-tools/contact-housing-counselor',
      category: 'tool',
      applicableTo: ['first-time', 'repeat-buyer', 'refinance']
    },
    {
      id: 'financial-uncertainty',
      title: 'Help for Financial Uncertainty',
      description: 'Resources and assistance available if you\'re experiencing financial hardship or uncertainty.',
      url: 'https://yourhome.fanniemae.com/get-relief/manage-financial-uncertainty',
      category: 'guide',
      applicableTo: ['first-time', 'repeat-buyer', 'refinance']
    }
  ],

  // Homeowner Resources
  homeowner: [
    {
      id: 'refinancing-guide',
      title: 'Refinancing Your Mortgage',
      description: 'Learn when refinancing makes sense, how to compare options, and what to expect during the process.',
      url: 'https://yourhome.fanniemae.com/own/refinancing-your-mortgage',
      category: 'guide',
      applicableTo: ['refinance']
    },
    {
      id: 'mortgage-statement',
      title: 'Understand Your Mortgage Statement',
      description: 'Learn what all the numbers, acronyms, and terms on your monthly mortgage statement mean.',
      url: 'https://yourhome.fanniemae.com/own/understand-your-mortgage-statement',
      category: 'guide',
      applicableTo: ['repeat-buyer', 'refinance']
    }
  ]
}

/**
 * Get Fannie Mae resources relevant to a specific transaction type
 */
export function getFannieMaeResources(
  transactionType: 'first-time' | 'repeat-buyer' | 'refinance',
  category?: keyof typeof FANNIE_MAE_RESOURCES
): FannieMaeResource[] {
  const allResources = Object.values(FANNIE_MAE_RESOURCES).flat()
  
  let filtered = allResources.filter(resource => 
    !resource.applicableTo || resource.applicableTo.includes(transactionType)
  )

  if (category) {
    filtered = filtered.filter(resource => {
      const categoryResources = FANNIE_MAE_RESOURCES[category] || []
      return categoryResources.some(catRes => catRes.id === resource.id)
    })
  }

  return filtered
}

/**
 * Get resources for a specific journey step
 */
export function getResourcesForJourneyStep(stepId: string): FannieMaeResource[] {
  const stepResourceMap: Record<string, string[]> = {
    'step-1': ['credit-basics', 'make-rent-count', 'downpayment-assistance'],
    'step-2': ['housing-counselor', 'affordable-mortgage-options'],
    'step-3': ['mortgage-calculator', 'loan-lookup'],
    'step-4': ['mortgage-calculator'],
    'step-5': ['housing-counselor'],
    'step-6': ['loan-lookup'],
    'step-7': ['mortgage-statement'],
    'step-8': ['refinancing-guide']
  }

  const resourceIds = stepResourceMap[stepId] || []
  const allResources = Object.values(FANNIE_MAE_RESOURCES).flat()
  
  return allResources.filter(resource => resourceIds.includes(resource.id))
}

/**
 * Get resources based on readiness score
 */
export function getResourcesForReadinessScore(score: number): FannieMaeResource[] {
  if (score < 40) {
    // Low readiness - focus on education and credit improvement
    return [
      FANNIE_MAE_RESOURCES.education.find(r => r.id === 'homeview-course')!,
      FANNIE_MAE_RESOURCES.education.find(r => r.id === 'credit-basics')!,
      FANNIE_MAE_RESOURCES.programs.find(r => r.id === 'make-rent-count')!,
    ].filter(Boolean) as FannieMaeResource[]
  } else if (score < 70) {
    // Medium readiness - focus on tools and calculators
    return [
      FANNIE_MAE_RESOURCES.calculators.find(r => r.id === 'mortgage-calculator')!,
      FANNIE_MAE_RESOURCES.calculators.find(r => r.id === 'downpayment-assistance')!,
      FANNIE_MAE_RESOURCES.education.find(r => r.id === '7-steps')!,
    ].filter(Boolean) as FannieMaeResource[]
  } else {
    // High readiness - focus on advanced tools
    return [
      FANNIE_MAE_RESOURCES.calculators.find(r => r.id === 'mortgage-calculator')!,
      FANNIE_MAE_RESOURCES.support.find(r => r.id === 'housing-counselor')!,
    ].filter(Boolean) as FannieMaeResource[]
  }
}

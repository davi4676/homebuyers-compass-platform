/**
 * Question configurations for different transaction types
 */

import { Home, TrendingUp, RefreshCw } from 'lucide-react'
import type { CreditScoreRange, Timeline } from '../../lib/calculations'
import { formatCurrency, getCityData, calculateDTI } from '../../lib/calculations'

// Helper function to map zip codes to cities (simplified for MVP)
function getCityFromZip(zip: string): string | null {
  // Common zip code ranges for major cities (simplified mapping)
  const zipRanges: Record<string, { start: number; end: number; city: string }> = {
    'New York': { start: 10001, end: 10299, city: 'New York' },
    'Los Angeles': { start: 90001, end: 90899, city: 'Los Angeles' },
    'Chicago': { start: 60601, end: 60699, city: 'Chicago' },
    'Houston': { start: 77001, end: 77099, city: 'Houston' },
    'Phoenix': { start: 85001, end: 85099, city: 'Phoenix' },
    'Philadelphia': { start: 19101, end: 19199, city: 'Philadelphia' },
    'San Antonio': { start: 78201, end: 78299, city: 'San Antonio' },
    'San Diego': { start: 92101, end: 92199, city: 'San Diego' },
    'Dallas': { start: 75201, end: 75299, city: 'Dallas' },
    'San Jose': { start: 95101, end: 95199, city: 'San Jose' },
    'Austin': { start: 78701, end: 78799, city: 'Austin' },
    'Jacksonville': { start: 32201, end: 32299, city: 'Jacksonville' },
    'San Francisco': { start: 94101, end: 94199, city: 'San Francisco' },
    'Columbus': { start: 43201, end: 43299, city: 'Columbus' },
    'Charlotte': { start: 28201, end: 28299, city: 'Charlotte' },
    'Indianapolis': { start: 46201, end: 46299, city: 'Indianapolis' },
    'Seattle': { start: 98101, end: 98199, city: 'Seattle' },
    'Denver': { start: 80201, end: 80299, city: 'Denver' },
    'Boston': { start: 2101, end: 2199, city: 'Boston' },
    'Nashville': { start: 37201, end: 37299, city: 'Nashville' },
    'Miami': { start: 33101, end: 33199, city: 'Miami' },
    'Tampa': { start: 33601, end: 33699, city: 'Tampa' },
  }

  const zipNum = parseInt(zip, 10)
  if (isNaN(zipNum)) return null

  for (const range of Object.values(zipRanges)) {
    if (zipNum >= range.start && zipNum <= range.end) {
      return range.city
    }
  }

  return null
}

export type QuestionType = 
  | 'transaction-type'
  | 'income'
  | 'currency'
  | 'rate'
  | 'number'
  | 'slider'
  | 'location'
  | 'radio'
  | 'checkbox'
  | 'multi-input'

export interface QuestionConfig {
  id: string
  title: string
  tooltip: string
  type: QuestionType
  helper?: string
  min?: number
  max?: number
  step?: number
  placeholder?: string
  options?: Array<{ value: string; label: string }>
  getInsight?: (value: any, allValues?: any) => string | null
}

// Transaction Type Question (Question 0)
export const transactionTypeQuestion: QuestionConfig = {
  id: 'transactionType',
  title: 'What type of transaction are you planning?',
  tooltip: 'Your transaction type determines the questions we ask and the analysis we provide.',
  type: 'transaction-type',
  getInsight: (value: string) => {
    const insights: Record<string, string> = {
      'first-time': "We'll focus on building your foundation and maximizing first-time buyer benefits.",
      'repeat-buyer': "We'll calculate your equity position and show you optimal use of sale proceeds.",
      'refinance': "We'll analyze if refinancing makes sense and identify break-even points.",
    }
    return insights[value] || null
  },
}

// ============================================================================
// FIRST-TIME BUYER QUESTIONS
// ============================================================================

export function getFirstTimeQuestions(): QuestionConfig[] {
  return [
    {
      id: 'income',
      title: "What's your annual household income?",
      tooltip: "Lenders approve you for more than you can afford. We'll show you a realistic budget based on the 28/36 rule, not their maximums.",
      type: 'income',
      min: 30000,
      max: 1000000,
      placeholder: '$60,000',
      getInsight: undefined,
    },
    {
      id: 'monthlyDebt',
      title: 'What are your total monthly debt payments?',
      tooltip: "Your debt-to-income ratio determines your rate. A 1% rate difference costs $50,000+ over 30 years.",
      type: 'currency',
      placeholder: '$0',
      getInsight: undefined,
    },
    {
      id: 'downPayment',
      title: 'How much have you saved for a down payment?',
      tooltip: "We'll show you the true cost of different down payment amounts, including PMI that most people don't factor in.",
      type: 'slider',
      min: 0,
      max: 100000,
      step: 1000,
      getInsight: (value: number, allValues?: any) => {
        const cityData = getCityData(allValues?.city || 'Austin')
        const percent = (value / cityData.medianPrice) * 100
        const pmiEstimate = value < cityData.medianPrice * 0.2 
          ? Math.round((cityData.medianPrice - value) * 0.0075 / 12)
          : 0
        return `With ${percent.toFixed(1)}% down, you'll pay approximately $${pmiEstimate}/month in PMI. We'll show you the math and when it makes sense to wait vs. buy now.`
      },
    },
    {
      id: 'city',
      title: "Where are you looking to buy?",
      tooltip: "Closing costs vary wildly by state ($2,000-$8,000). We'll show you what's normal vs. inflated in your market.",
      type: 'location',
      getInsight: (value: string) => {
        const cityName = value.length === 5 && /^\d+$/.test(value) 
          ? getCityFromZip(value) || 'your area'
          : value
        const cityData = getCityData(cityName)
        return `Average closing costs in ${cityName}: ${formatCurrency(cityData.closingCostAvg)}. Typical price range: ${formatCurrency(cityData.priceMin)}-${formatCurrency(cityData.priceMax)}. We'll show you line by line what to expect.`
      },
    },
    {
      id: 'timeline',
      title: "What's your timeline for buying?",
      tooltip: "Rushed buyers overpay by 8% on average. We'll show you what you can do in your timeline to save money.",
      type: 'radio',
      options: [
        { value: '3-months', label: '3 months or less' },
        { value: '6-months', label: '6 months' },
        { value: '1-year', label: '1 year' },
        { value: 'exploring', label: 'Just exploring (1+ years)' },
      ],
      getInsight: (value: Timeline) => {
        if (value === '3-months') {
          return "Buying in 3 months is aggressive. Rushing increases mistakes. We'll show you the highest-priority items to focus on."
        }
        if (value === 'exploring') {
          return "✓ Smart! More time = more savings opportunities. We'll give you a comprehensive plan."
        }
        return `With ${value === '6-months' ? '6 months' : '1 year'}, you have time to improve your position and save money.`
      },
    },
    {
      id: 'creditScore',
      title: "What's your estimated credit score?",
      tooltip: "Your score determines everything. A 50-point difference can cost you $50,000 over the life of your loan.",
      type: 'radio',
      options: [
        { value: 'under-600', label: 'Under 600' },
        { value: '600-650', label: '600-650' },
        { value: '650-700', label: '650-700' },
        { value: '700-750', label: '700-750' },
        { value: '750+', label: '750+' },
      ],
      helper: "Don't know? A rough guess is fine.",
      getInsight: (value: CreditScoreRange) => {
        const rates: Record<CreditScoreRange, number> = {
          'under-600': 8.5,
          '600-650': 7.5,
          '650-700': 7.0,
          '700-750': 6.5,
          '750+': 6.0,
        }
        const currentRate = rates[value]
        const bestRate = 6.0
        const extraCost = ((currentRate - bestRate) / 100) * 300000
        return `With a ${value} score, you'll pay approximately $${Math.round(extraCost)} more per year in interest than someone with 760+. We'll show you how to improve.`
      },
    },
    {
      id: 'agentStatus',
      title: 'Are you working with a real estate agent yet?',
      tooltip: "89% of buyers use the first agent they meet. We'll show you questions to ask and red flags to watch for.",
      type: 'radio',
      options: [
        { value: 'have-agent', label: 'Yes, already have one' },
        { value: 'interviewing', label: 'Interviewing agents' },
        { value: 'not-yet', label: "Not yet, but planning to" },
        { value: 'solo', label: 'Considering going solo' },
      ],
      getInsight: undefined,
    },
    {
      id: 'concern',
      title: "What's your biggest concern about buying?",
      tooltip: "We'll prioritize our analysis based on your biggest worry.",
      type: 'radio',
      options: [
        { value: 'affording', label: 'Affording it / Monthly payments' },
        { value: 'hidden-costs', label: 'Hidden costs / Unexpected fees' },
        { value: 'ripped-off', label: 'Getting ripped off' },
        { value: 'wrong-choice', label: 'Making the wrong choice' },
        { value: 'timing', label: 'Market timing' },
        { value: 'other', label: 'Other / Multiple concerns' },
      ],
      getInsight: undefined,
    },
  ]
}

// ============================================================================
// REPEAT BUYER QUESTIONS
// ============================================================================

export function getRepeatBuyerQuestions(): QuestionConfig[] {
  return [
    {
      id: 'income',
      title: "What's your annual household income?",
      tooltip: "Lenders approve you for more than you can afford. We'll show you a realistic budget based on the 28/36 rule, not their maximums.",
      type: 'income',
      min: 30000,
      max: 1000000,
      placeholder: '$60,000',
      getInsight: undefined, // Removed inaccurate quick insight - will show accurate numbers on results page
    },
    {
      id: 'monthlyDebt',
      title: 'What are your total monthly debt payments?',
      tooltip: "Your debt-to-income ratio determines your rate. A 1% rate difference costs $50,000+ over 30 years.",
      type: 'currency',
      placeholder: '$0',
      getInsight: undefined,
    },
    {
      id: 'currentHomeValue',
      title: 'What is your current home worth?',
      tooltip: "We'll calculate your equity position and determine your effective down payment for the next home.",
      type: 'slider',
      min: 100000,
      max: 2000000,
      step: 10000,
      getInsight: (value: number, allValues?: any) => {
        const balance = allValues?.currentMortgageBalance || 0
        const equity = value - balance
        const equityPercent = value > 0 ? (equity / value) * 100 : 0
        return `Your equity: ${formatCurrency(equity)} (${equityPercent.toFixed(1)}%). This is your down payment power for your next home.`
      },
    },
    {
      id: 'currentMortgageBalance',
      title: 'What is your current mortgage balance?',
      tooltip: "We'll calculate your equity position and determine your effective down payment for the next home.",
      type: 'slider',
      min: 20000,
      max: 1500000,
      step: 10000,
      getInsight: (value: number, allValues?: any) => {
        const homeValue = allValues?.currentHomeValue || 0
        const equity = homeValue - value
        const equityPercent = homeValue > 0 ? (equity / homeValue) * 100 : 0
        return `Your equity: ${formatCurrency(equity)} (${equityPercent.toFixed(1)}%). This is your down payment power for your next home.`
      },
    },
    {
      id: 'ownedYears',
      title: 'When did you buy your current home?',
      tooltip: "This affects capital gains tax calculations. You may qualify for tax exclusion if you've owned 2+ years.",
      type: 'radio',
      options: [
        { value: '<1', label: 'Less than 1 year' },
        { value: '1-2', label: '1-2 years' },
        { value: '2-5', label: '2-5 years' },
        { value: '5-10', label: '5-10 years' },
        { value: '10+', label: '10+ years' },
      ],
      getInsight: undefined,
    },
    {
      id: 'saleStatus',
      title: 'What is your home sale status?',
      tooltip: "This helps us understand your timeline and coordinate both transactions.",
      type: 'radio',
      options: [
        { value: 'not-listed', label: 'Not listed yet' },
        { value: 'listed', label: 'Listed for sale' },
        { value: 'under-contract', label: 'Under contract' },
        { value: 'closed', label: 'Sale closed' },
      ],
      getInsight: undefined,
    },
    {
      id: 'expectedSalePrice',
      title: 'What do you expect to sell your home for?',
      tooltip: "We'll calculate your net proceeds after all selling costs.",
      type: 'currency',
      min: 100000,
      max: 2000000,
      placeholder: '$500,000',
      getInsight: (value: number, allValues?: any) => {
        const commission = value * 0.055 // 5.5% default
        const closingCosts = value * 0.02 // 2% estimate
        const balance = allValues?.currentMortgageBalance || 0
        const net = value - balance - commission - closingCosts
        return `Estimated net proceeds: ${formatCurrency(net)} (after mortgage payoff, commission, and closing costs).`
      },
    },
    {
      id: 'agentCommission',
      title: 'What commission rate are you paying?',
      tooltip: "Typical is 5-6%, but this is negotiable. We'll show you how to save here.",
      type: 'rate',
      min: 0,
      max: 6,
      step: 0.1,
      placeholder: '5.5',
      getInsight: (value: number, allValues?: any) => {
        const salePrice = allValues?.expectedSalePrice || 0
        const commission = salePrice * (value / 100)
        return `Commission cost: ${formatCurrency(commission)}. You can negotiate this down to 4.5-5% in many markets.`
      },
    },
    {
      id: 'sellingClosingCosts',
      title: 'Expected seller closing costs?',
      tooltip: "Seller closing costs typically include title fees, transfer taxes, and other fees. Usually 1-3% of sale price.",
      type: 'currency',
      min: 0,
      max: 100000,
      placeholder: '$10,000',
      getInsight: (value: number, allValues?: any) => {
        const salePrice = allValues?.expectedSalePrice || 0
        const percent = salePrice > 0 ? (value / salePrice) * 100 : 0
        return `Seller closing costs: ${formatCurrency(value)} (${percent.toFixed(1)}% of sale price). Typical range is 1-3%.`
      },
    },
    {
      id: 'repairsAndConcessions',
      title: 'Expected repairs/concessions for sale?',
      tooltip: "Most sellers pay for some repairs or give concessions. Budget for this.",
      type: 'currency',
      min: 0,
      max: 50000,
      placeholder: '$5,000',
      getInsight: undefined,
    },
    {
      id: 'debtPayoff',
      title: 'Will you pay off other debts with sale proceeds?',
      tooltip: "Paying off debt can improve your DTI and buying power for the next home.",
      type: 'currency',
      min: 0,
      max: 500000,
      placeholder: '$0',
      getInsight: undefined,
    },
    {
      id: 'additionalSavings',
      title: 'Additional savings beyond home equity?',
      tooltip: "How much cash will you have beyond your sale proceeds?",
      type: 'currency',
      min: 0,
      max: 200000,
      placeholder: '$0',
      getInsight: undefined,
    },
    {
      id: 'city',
      title: "Where are you looking to buy?",
      tooltip: "Closing costs vary by location. We'll show you what's normal in your market.",
      type: 'location',
      getInsight: (value: string) => {
        const cityName = value.length === 5 && /^\d+$/.test(value) 
          ? getCityFromZip(value) || 'your area'
          : value
        const cityData = getCityData(cityName)
        return `Average closing costs in ${cityName}: ${formatCurrency(cityData.closingCostAvg)}.`
      },
    },
    {
      id: 'timeline',
      title: "What's your timeline for buying?",
      tooltip: "Coordinating two closings requires careful timing. We'll show you bridge loan options if needed.",
      type: 'radio',
      options: [
        { value: '3-months', label: '3 months or less' },
        { value: '6-months', label: '6 months' },
        { value: '1-year', label: '1 year' },
        { value: 'exploring', label: 'Just exploring (1+ years)' },
      ],
      getInsight: (value: Timeline) => {
        if (value === '3-months') {
          return "Coordinating two closings in 3 months is tight. We'll show you simultaneous closing strategies."
        }
        return `With ${value === '6-months' ? '6 months' : '1 year'}, you have time to coordinate both transactions optimally.`
      },
    },
    {
      id: 'creditScore',
      title: "What's your estimated credit score?",
      tooltip: "Your score determines your rate for the new mortgage.",
      type: 'radio',
      options: [
        { value: 'under-600', label: 'Under 600' },
        { value: '600-650', label: '600-650' },
        { value: '650-700', label: '650-700' },
        { value: '700-750', label: '700-750' },
        { value: '750+', label: '750+' },
      ],
      helper: "Don't know? A rough guess is fine.",
      getInsight: undefined,
    },
    {
      id: 'currentRate',
      title: 'What is your current mortgage rate?',
      tooltip: "We'll compare your current rate to what you'll get on the new home.",
      type: 'rate',
      min: 2,
      max: 8,
      step: 0.1,
      placeholder: '6.5',
      getInsight: undefined,
    },
    {
      id: 'currentYearsRemaining',
      title: 'Years remaining on current mortgage?',
      tooltip: "This helps us compare your current situation to the new mortgage.",
      type: 'number',
      min: 1,
      max: 30,
      step: 1,
      placeholder: '30',
      getInsight: undefined,
    },
    {
      id: 'currentMonthlyPayment',
      title: 'Current monthly payment (PITI)?',
      tooltip: "We'll compare this to your new payment to show the cash flow impact.",
      type: 'currency',
      placeholder: '$2,000',
      getInsight: undefined,
    },
    {
      id: 'agentStatus',
      title: 'Are you working with a real estate agent yet?',
      tooltip: "Having an agent helps coordinate both transactions.",
      type: 'radio',
      options: [
        { value: 'have-agent', label: 'Yes, already have one' },
        { value: 'interviewing', label: 'Interviewing agents' },
        { value: 'not-yet', label: "Not yet, but planning to" },
        { value: 'solo', label: 'Considering going solo' },
      ],
      getInsight: undefined,
    },
    {
      id: 'concern',
      title: "What's your biggest concern?",
      tooltip: "We'll prioritize our analysis based on your biggest worry.",
      type: 'radio',
      options: [
        { value: 'sale-timing', label: 'Timing the sale and purchase' },
        { value: 'bridge-financing', label: 'Bridge financing if closings don\'t align' },
        { value: 'tax-implications', label: 'Tax implications (capital gains)' },
        { value: 'upgrade-strategy', label: 'Upgrading vs. downgrading strategy' },
        { value: 'equity-optimization', label: 'Using equity optimally' },
        { value: 'other', label: 'Other / Multiple concerns' },
      ],
      getInsight: undefined,
    },
  ]
}

// ============================================================================
// REFINANCE QUESTIONS
// ============================================================================

export function getRefinanceQuestions(): QuestionConfig[] {
  return [
    {
      id: 'currentHomeValue',
      title: 'What is your current home worth?',
      tooltip: "We'll use this to calculate your loan-to-value ratio and available equity for cash-out options.",
      type: 'currency',
      min: 100000,
      max: 2000000,
      placeholder: '$500,000',
      getInsight: undefined,
    },
    {
      id: 'currentMortgageBalance',
      title: 'What is your current mortgage balance?',
      tooltip: "We'll calculate your LTV and available equity.",
      type: 'currency',
      placeholder: '$200,000',
      min: 20000,
      max: 1500000,
      getInsight: undefined,
    },
    {
      id: 'currentRate',
      title: 'What is your current interest rate?',
      tooltip: "We'll compare this to current market rates and calculate your savings.",
      type: 'rate',
      min: 2,
      max: 10,
      step: 0.1,
      placeholder: '6.5',
      getInsight: (value: number) => {
        return `Current rate: ${Number(value).toFixed(1)}%. We'll show you if refinancing makes sense based on current market rates.`
      },
    },
    {
      id: 'currentMonthlyPayment',
      title: 'Current monthly payment (P&I only)?',
      tooltip: "This helps us calculate your break-even and savings.",
      type: 'currency',
      placeholder: '$2,000',
      getInsight: undefined,
    },
    {
      id: 'yearsRemaining',
      title: 'Years remaining on current mortgage?',
      tooltip: "This affects whether refinancing makes financial sense.",
      type: 'number',
      min: 1,
      max: 30,
      step: 1,
      placeholder: '30',
      getInsight: (value: number) => {
        if (value < 5) {
          return "With less than 5 years remaining, refinancing may not make sense unless the rate drop is significant."
        }
        return `With ${value} years remaining, we'll analyze if refinancing saves you money.`
      },
    },
    {
      id: 'refinanceGoals',
      title: 'What are your refinance goals? (Select all that apply)',
      tooltip: "Your goals determine the best refinance strategy. We'll show you options for each.",
      type: 'checkbox',
      options: [
        { value: 'lower-payment', label: 'Lower my monthly payment' },
        { value: 'lower-rate', label: 'Lower my interest rate' },
        { value: 'shorter-term', label: 'Shorten my loan term (pay off faster)' },
        { value: 'cashout-improvements', label: 'Cash out equity for home improvements' },
        { value: 'cashout-debt', label: 'Cash out equity for debt consolidation' },
        { value: 'cashout-investment', label: 'Cash out equity for investment/other' },
        { value: 'remove-pmi', label: 'Remove PMI' },
        { value: 'arm-to-fixed', label: 'Switch from ARM to fixed rate' },
      ],
      getInsight: undefined,
    },
    {
      id: 'cashoutAmount',
      title: 'How much cash do you need? (If cash-out selected)',
      tooltip: "We'll calculate the maximum available and show you the true cost of cashing out.",
      type: 'currency',
      placeholder: '$0',
      min: 0,
      max: 500000,
      getInsight: undefined,
    },
    {
      id: 'creditScore',
      title: "What's your estimated credit score?",
      tooltip: "Your score determines your new rate.",
      type: 'radio',
      options: [
        { value: 'under-600', label: 'Under 600' },
        { value: '600-650', label: '600-650' },
        { value: '650-700', label: '650-700' },
        { value: '700-750', label: '700-750' },
        { value: '750+', label: '750+' },
      ],
      helper: "Don't know? A rough guess is fine.",
      getInsight: undefined,
    },
    {
      id: 'propertyType',
      title: 'Property type & occupancy?',
      tooltip: "Rates and terms vary by property type. Investment properties have higher rates and stricter requirements.",
      type: 'radio',
      options: [
        { value: 'primary', label: 'Primary residence' },
        { value: 'second-home', label: 'Second home' },
        { value: 'investment', label: 'Investment property (rental)' },
      ],
      getInsight: undefined,
    },
    {
      id: 'previousRefinances',
      title: 'Have you refinanced before?',
      tooltip: "Recent refinances affect costs and whether it makes sense to refi again.",
      type: 'radio',
      options: [
        { value: 'never', label: 'Never refinanced' },
        { value: 'once', label: 'Once (1-3 years ago)' },
        { value: 'multiple', label: 'Multiple times' },
        { value: 'recent', label: 'Refinanced within last 12 months' },
      ],
      getInsight: undefined,
    },
    {
      id: 'concern',
      title: "What's your biggest concern?",
      tooltip: "We'll address your specific concerns in our analysis.",
      type: 'radio',
      options: [
        { value: 'break-even', label: 'Break-even timeline (how long to recoup closing costs)' },
        { value: 'actual-savings', label: 'Whether I\'ll actually save money' },
        { value: 'extending-term', label: 'Extending my loan term' },
        { value: 'cashout-rate', label: 'Cash-out impacting my rate' },
        { value: 'closing-costs', label: 'Closing costs too high' },
        { value: 'low-appraisal', label: 'Appraisal coming in low' },
        { value: 'other', label: 'Other' },
      ],
      getInsight: undefined,
    },
  ]
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getQuestionsForTransactionType(
  transactionType: 'first-time' | 'repeat-buyer' | 'refinance'
): QuestionConfig[] {
  switch (transactionType) {
    case 'first-time':
      return getFirstTimeQuestions()
    case 'repeat-buyer':
      return getRepeatBuyerQuestions()
    case 'refinance':
      return getRefinanceQuestions()
    default:
      return getFirstTimeQuestions()
  }
}

export function getQuestionCount(
  transactionType: 'first-time' | 'repeat-buyer' | 'refinance'
): number {
  // +1 for transaction type question
  switch (transactionType) {
    case 'first-time':
      return 1 + getFirstTimeQuestions().length // 9 total
    case 'repeat-buyer':
      return 1 + getRepeatBuyerQuestions().length // 20 total
    case 'refinance':
      return 1 + getRefinanceQuestions().length // 12 total
    default:
      return 1 + getFirstTimeQuestions().length
  }
}


/**
 * Quiz question definitions for all transaction types
 * Supports: First-time buyer, Repeat buyer, Refinance
 */

import { formatCurrency, calculateDTI, getCityData, getZipCodeData, getCityDataWithZillow, getZipCodeDataWithZillow } from './calculations'

export type TransactionType = 'first-time' | 'repeat-buyer' | 'refinance'

export interface Question {
  id: string
  title: string
  tooltip: string
  type: 'slider' | 'currency' | 'select' | 'radio' | 'location' | 'transaction-type' | 'multi-input' | 'percentage' | 'number' | 'rate' | 'knowledge-check'
  options?: { value: string; label: string }[]
  min?: number
  max?: number
  step?: number
  placeholder?: string
  helper?: string
  conditional?: (values: Record<string, any>) => boolean
  getInsight?: (value: any, allValues: Record<string, any>) => string | null
  /** For knowledge-check: 0-based index of correct option (for scoring) */
  correctIndex?: number
  explain?: string
}

// Transaction Type Selection (Question 0)
export const transactionTypeQuestion: Question = {
  id: 'transactionType',
  title: "What type of transaction are you planning?",
  tooltip: "Each transaction type has unique considerations. We'll customize your analysis accordingly.",
  type: 'transaction-type',
  getInsight: (value: TransactionType) => {
    if (value === 'first-time') {
      return "We'll focus on building your foundation and maximizing first-time buyer benefits."
    }
    if (value === 'repeat-buyer') {
      return "We'll calculate your equity position and show you optimal use of sale proceeds."
    }
    if (value === 'refinance') {
      return "We'll analyze if refinancing makes sense and identify break-even points."
    }
    return null
  },
}

// First-Time Buyer Questions
export const firstTimeQuestions: Question[] = [
  {
    id: 'firstGenFamilyOwned',
    title: 'Has anyone in your immediate family (parents or siblings) owned a home?',
    tooltip: 'First-generation buyers may qualify for targeted local and state programs.',
    type: 'radio',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no-first', label: "No — I'm the first" },
      { value: 'unsure', label: 'Not sure' },
    ],
    getInsight: (value: string) =>
      value === 'no-first'
        ? "Great news — first-generation buyers qualify for additional grant programs. We'll find them for you."
        : null,
    conditional: (values) =>
      values.transactionType === 'first-time' && values.icpType === 'first-gen',
  },
  {
    id: 'soloPurchaseIncome',
    title: 'Are you purchasing this home entirely on your own income?',
    tooltip: 'Some programs prioritize single-income or solo buyers.',
    type: 'radio',
    options: [
      { value: 'solo', label: 'Yes, solo income' },
      { value: 'coborrower', label: 'With a co-borrower (not a spouse)' },
      { value: 'other', label: 'Other' },
    ],
    getInsight: (value: string) =>
      value === 'solo'
        ? "Solo buyers often qualify for special programs. We'll factor this into your plan."
        : null,
    conditional: (values) => values.transactionType === 'first-time' && values.icpType === 'solo',
  },
  {
    id: 'income',
    title: "What's your annual household income?",
    tooltip: "Lenders approve you for more than you can afford. We'll show you a realistic budget based on the 28/36 rule, not their maximums.",
    type: 'currency',
    min: 30000,
    max: 2000000,
    placeholder: '$60,000',
    getInsight: (value: number) => {
      const maxApproval = value * 4.5
      const realistic = value * 3.5
      return `📊 Quick insight: Most first-time buyers with ${formatCurrency(value)} income get approved for ${formatCurrency(maxApproval)}, but can comfortably afford ${formatCurrency(realistic)}. We'll explain why.`
    },
  },
  {
    id: 'monthlyDebt',
    title: "What are your total monthly debt payments?",
    tooltip: "Your debt-to-income ratio determines your rate. A 1% rate difference costs $50,000+ over 30 years.",
    type: 'currency',
    min: 0,
    max: 5000,
    placeholder: '$0',
    helper: 'Include car loans, student loans, credit cards, personal loans',
    getInsight: (value: number, allValues: Record<string, any>) => {
      if (!allValues.income) return null
      const dti = calculateDTI(value, allValues.income / 12)
      return `Your DTI is ${dti.toFixed(1)}%. Each percentage point over 30% typically adds 0.125% to your rate (about $2,800 over the life of a loan).`
    },
  },
  {
    id: 'downPayment',
    title: "How much have you saved for a down payment?",
    tooltip: "We'll show you the true cost of different down payment amounts, including PMI that most people don't factor in.",
    type: 'currency',
    min: 0,
    max: 100000,
    step: 1000,
    placeholder: '$20,000',
    getInsight: (value: number, allValues: Record<string, any>) => {
      if (!allValues.city) return null
      // Note: Zillow data is fetched and displayed in the quiz UI above
      // This insight uses static data for synchronous calculation
      const cityData = getCityData(allValues.city)
      const typicalPrice = cityData.medianPrice || 300000
      const downPaymentPercent = (value / typicalPrice) * 100
      const loanAmount = typicalPrice - value
      const pmiEstimate = downPaymentPercent < 20 ? (loanAmount * 0.0075) / 12 : 0
      return `With ${downPaymentPercent.toFixed(1)}% down, you'll pay approximately ${formatCurrency(pmiEstimate)}/month in PMI. We'll show you the math and when it makes sense to wait vs. buy now.`
    },
  },
  {
    id: 'targetHomePrice',
    title: "What's the price range of the home you want to buy?",
    tooltip: "This lets us calculate your real LTV, whether you'll pay PMI, and exactly how ready your finances are for this specific purchase — not just an estimate.",
    type: 'slider',
    min: 100000,
    max: 2000000,
    step: 5000,
    placeholder: '$350,000',
    helper: 'Use your best estimate — you can adjust it on the results page',
    getInsight: (value: number, allValues: Record<string, any>) => {
      const down = Number(allValues.downPayment ?? 0)
      const loan = Math.max(0, value - down)
      const ltv = value > 0 ? (loan / value) * 100 : 0
      const downPct = value > 0 ? (down / value) * 100 : 0
      const pmiNote = ltv > 80
        ? `You'll pay PMI (~${formatCurrency((loan * 0.0075) / 12)}/mo) until you reach 20% equity.`
        : 'No PMI required — you\'re putting 20%+ down.'
      const incomeCheck = allValues.income
        ? (() => {
            const comfortableMax = Number(allValues.income) * 3.5
            if (value > comfortableMax * 1.2) return ` ⚠️ This is above your comfortable range (${formatCurrency(comfortableMax)}).`
            if (value <= comfortableMax) return ` ✓ This fits within your comfortable range.`
            return ''
          })()
        : ''
      return `LTV: ${ltv.toFixed(1)}% · Down: ${downPct.toFixed(1)}% · Loan: ${formatCurrency(loan)}. ${pmiNote}${incomeCheck}`
    },
  },
  {
    id: 'city',
    title: "Where are you looking to buy?",
    tooltip: "Closing costs vary wildly by state ($2,000-$8,000). We'll show you what's normal vs. inflated in your market.",
    type: 'location',
    getInsight: (value: string, allValues: Record<string, any>) => {
      if (allValues.locationType === 'zip' && allValues.zipCode) {
        const zipData = getZipCodeData(allValues.zipCode)
        if (zipData) {
          const cityData = getCityData(zipData.city)
          const avgClosingCosts = cityData.closingCostAvg || 5000
          const priceMin = zipData.averageHomePrice * 0.7
          const priceMax = zipData.averageHomePrice * 1.3
          return `Average closing costs in ${zipData.city}, ${zipData.state} (${allValues.zipCode}): ${formatCurrency(avgClosingCosts)}. Typical price range: ${formatCurrency(priceMin)}-${formatCurrency(priceMax)}. We'll show you line by line what to expect.`
        }
      }
      const cityData = getCityData(value)
      const avgClosingCosts = cityData.closingCostAvg || 5000
      const priceMin = cityData.priceMin || 200000
      const priceMax = cityData.priceMax || 400000
      return `Average closing costs in ${value}: ${formatCurrency(avgClosingCosts)}. Typical price range: ${formatCurrency(priceMin)}-${formatCurrency(priceMax)}. We'll show you line by line what to expect.`
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
    getInsight: (value: string) => {
      if (value === '3-months') {
        return '⚠️ Buying in 3 months is aggressive. Rushing increases mistakes. We\'ll show you the highest-priority items to focus on.'
      }
      if (value === 'exploring') {
        return '✓ Smart! More time = more savings opportunities. We\'ll give you a comprehensive plan.'
      }
      return null
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
    getInsight: (value: string, allValues: Record<string, any>) => {
      if (!allValues.income) return null
      const rateMap: Record<string, number> = {
        '750+': 0.06,
        '700-750': 0.065,
        '650-700': 0.07,
        '600-650': 0.075,
        'under-600': 0.085,
      }
      const baseRate = rateMap[value] || 0.07
      const excellentRate = 0.06
      const loanAmount = (allValues.income || 60000) * 3.5 - (allValues.downPayment || 20000)
      const monthlyPayment = (loanAmount * baseRate / 12) / (1 - Math.pow(1 + baseRate / 12, -360))
      const excellentPayment = (loanAmount * excellentRate / 12) / (1 - Math.pow(1 + excellentRate / 12, -360))
      const extraCost = (monthlyPayment - excellentPayment) * 12
      return `With a ${value} score, you'll pay approximately ${formatCurrency(extraCost)} more per year in interest than someone with 760+. We'll show you how to improve.`
    },
  },
  {
    id: 'agentStatus',
    title: "Are you working with a real estate agent yet?",
    tooltip: "89% of buyers use the first agent they meet. We'll show you questions to ask and red flags to watch for.",
    type: 'radio',
    options: [
      { value: 'have-agent', label: 'Yes, already have one' },
      { value: 'interviewing', label: 'Interviewing agents' },
      { value: 'not-yet', label: 'Not yet, but planning to' },
      { value: 'solo', label: 'Considering going solo' },
    ],
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
  },
  // Educational preparedness quiz (knowledge check)
  {
    id: 'soloNeighborhoodPriority',
    title: 'What matters most to you in a neighborhood?',
    tooltip: "We'll use this to tailor safety and lifestyle tips in your action plan.",
    type: 'radio',
    options: [
      { value: 'safety', label: 'Safety ratings' },
      { value: 'schools', label: 'School quality' },
      { value: 'walkability', label: 'Walkability' },
      { value: 'commute', label: 'Commute time' },
      { value: 'community', label: 'Community feel' },
    ],
    conditional: (values) => values.transactionType === 'first-time' && values.icpType === 'solo',
  },
  {
    id: 'eduQuiz_1',
    title: 'Which step typically comes BEFORE making an offer on a home?',
    tooltip: 'The order of steps matters in the homebuying process.',
    type: 'knowledge-check',
    options: [
      { value: '0', label: 'Home inspection' },
      { value: '1', label: 'Final walkthrough' },
      { value: '2', label: 'Getting a mortgage pre-approval' },
      { value: '3', label: 'Title search' },
    ],
    correctIndex: 2,
    explain: 'A pre-approval letter tells sellers you can actually afford the home — it dramatically strengthens your offer in a competitive market.',
  },
  {
    id: 'eduQuiz_3',
    title: '"Cash to close" includes:',
    tooltip: 'Understanding cash to close helps you budget accurately.',
    type: 'knowledge-check',
    options: [
      { value: '0', label: 'Just your down payment' },
      { value: '1', label: 'Only lender origination fees' },
      { value: '2', label: 'Down payment + closing costs + prepaid items (escrow, insurance)' },
      { value: '3', label: "First month's mortgage payment only" },
    ],
    correctIndex: 2,
    explain: 'Cash to close is the full amount you bring to the closing table: down payment, lender fees, title costs, prepaid homeowners insurance, and initial escrow.',
  },
  {
    id: 'eduQuiz_4',
    title: 'What is an earnest money deposit?',
    tooltip: 'Earnest money is a key part of making a strong offer.',
    type: 'knowledge-check',
    options: [
      { value: '0', label: 'A fee paid to your real estate agent at closing' },
      { value: '1', label: 'A good-faith payment made when your offer is accepted' },
      { value: '2', label: 'The first mortgage payment due at closing' },
      { value: '3', label: 'A non-refundable application fee paid to the lender' },
    ],
    correctIndex: 1,
    explain: "Earnest money (typically 1–3% of price) signals you're serious. It counts toward your down payment or closing costs — and can be at risk if you back out without a contingency.",
  },
]

// Repeat Buyer Questions
export const repeatBuyerQuestions: Question[] = [
  {
    id: 'moveUpSellFirst',
    title: 'Do you need to sell your current home before purchasing the new one?',
    tooltip: 'Sell-first vs buy-first changes financing and timing risk.',
    type: 'radio',
    options: [
      { value: 'sell-first', label: 'Yes — sell first' },
      { value: 'carry-both', label: 'No — I can carry both' },
      { value: 'unsure', label: 'Not sure yet' },
    ],
    conditional: (values) => values.transactionType === 'repeat-buyer' && values.icpType === 'move-up',
  },
  {
    id: 'moveUpEquityApprox',
    title: "Do you know your current home's approximate equity?",
    tooltip: 'Equity helps estimate how much you can put toward the next purchase.',
    type: 'slider',
    min: 0,
    max: 800000,
    step: 5000,
    conditional: (values) =>
      values.transactionType === 'repeat-buyer' &&
      values.icpType === 'move-up' &&
      values.moveUpSellFirst === 'sell-first',
  },
  {
    id: 'income',
    title: "What's your annual household income?",
    tooltip: "Lenders approve you for more than you can afford. We'll show you a realistic budget based on the 28/36 rule, not their maximums.",
    type: 'currency',
    min: 30000,
    max: 2000000,
    placeholder: '$60,000',
  },
  {
    id: 'monthlyDebt',
    title: "What are your total monthly debt payments?",
    tooltip: "Your debt-to-income ratio determines your rate. A 1% rate difference costs $50,000+ over 30 years.",
    type: 'currency',
    min: 0,
    max: 5000,
    placeholder: '$0',
    helper: 'Include car loans, student loans, credit cards, personal loans',
  },
  {
    id: 'currentHomeValue',
    title: "What's your current home worth?",
    tooltip: "We'll calculate your equity position and determine your effective down payment for the next home.",
    type: 'slider',
    min: 100000,
    max: 2000000,
    step: 10000,
    getInsight: (value: number, allValues: Record<string, any>) => {
      const balance = allValues.currentMortgageBalance || 0
      const equity = value - balance
      const equityPercent = value > 0 ? (equity / value) * 100 : 0
      return `Your equity: ${formatCurrency(equity)} (${equityPercent.toFixed(1)}%). This gives you a significant advantage over first-time buyers.`
    },
  },
  {
    id: 'currentMortgageBalance',
    title: "What's your current mortgage balance?",
    tooltip: "We'll calculate your net proceeds after paying off your current loan.",
    type: 'slider',
    min: 0,
    max: 1500000,
    step: 10000,
  },
  {
    id: 'ownedYears',
    title: "How long have you owned your current home?",
    tooltip: "This affects capital gains tax eligibility. Owned 2+ years as primary residence = $250K/$500K exclusion.",
    type: 'radio',
    options: [
      { value: '<1', label: 'Less than 1 year' },
      { value: '1-2', label: '1-2 years' },
      { value: '2-5', label: '2-5 years' },
      { value: '5-10', label: '5-10 years' },
      { value: '10+', label: '10+ years' },
    ],
  },
  {
    id: 'saleStatus',
    title: "What's the status of selling your current home?",
    tooltip: "This affects timing strategy and whether you'll need bridge financing.",
    type: 'radio',
    options: [
      { value: 'not-listed', label: 'Not listed yet' },
      { value: 'listed', label: 'Listed for sale' },
      { value: 'under-contract', label: 'Under contract' },
      { value: 'closed', label: 'Already closed' },
    ],
  },
  {
    id: 'expectedSalePrice',
    title: "What do you expect to sell your home for?",
    tooltip: "We'll calculate your net proceeds after all selling costs (typically 8-10% of sale price).",
    type: 'slider',
    min: 100000,
    max: 2000000,
    step: 10000,
  },
  {
    id: 'agentCommission',
    title: "What's your agent commission rate?",
    tooltip: "Typical is 5-6%. You can negotiate this. Every 0.5% saved = thousands in your pocket.",
    type: 'percentage',
    min: 0,
    max: 10,
    step: 0.1,
    placeholder: '5.0',
  },
  {
    id: 'repairsAndConcessions',
    title: "Expected repairs/concessions for sale?",
    tooltip: "Typical sellers pay 1-3% of sale price for repairs, staging, and concessions.",
    type: 'currency',
    min: 0,
    max: 50000,
    placeholder: '$0',
  },
  {
    id: 'debtPayoff',
    title: "Will you pay off other debts with sale proceeds?",
    tooltip: "This reduces your available down payment but may improve your DTI and rate.",
    type: 'currency',
    min: 0,
    max: 200000,
    placeholder: '$0',
  },
  {
    id: 'additionalSavings',
    title: "Additional savings beyond home equity?",
    tooltip: "How much cash will you have beyond your sale proceeds?",
    type: 'currency',
    min: 0,
    max: 200000,
    placeholder: '$0',
  },
  {
    id: 'city',
    title: "Where are you looking to buy?",
    tooltip: "Closing costs vary wildly by state ($2,000-$8,000). We'll show you what's normal vs. inflated in your market.",
    type: 'location',
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
  },
  {
    id: 'currentRate',
    title: "What's your current mortgage interest rate?",
    tooltip: "We'll compare your current situation to what you'll have next and show the true cost/savings of moving.",
    type: 'percentage',
    min: 2,
    max: 10,
    step: 0.125,
    placeholder: '6.5',
  },
  {
    id: 'currentYearsRemaining',
    title: "How many years remaining on your current mortgage?",
    tooltip: "This affects whether refinancing your current loan makes more sense than buying new.",
    type: 'number',
    min: 1,
    max: 30,
    step: 1,
    placeholder: '25',
  },
  {
    id: 'currentMonthlyPayment',
    title: "What's your current monthly payment (PITI)?",
    tooltip: "We'll compare this to your new payment to show cash flow impact.",
    type: 'currency',
    min: 500,
    max: 10000,
    placeholder: '$2,000',
  },
  {
    id: 'agentStatus',
    title: "Are you working with a real estate agent yet?",
    tooltip: "89% of buyers use the first agent they meet. We'll show you questions to ask and red flags to watch for.",
    type: 'radio',
    options: [
      { value: 'have-agent', label: 'Yes, already have one' },
      { value: 'interviewing', label: 'Interviewing agents' },
      { value: 'not-yet', label: 'Not yet, but planning to' },
      { value: 'solo', label: 'Considering going solo' },
    ],
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
      { value: 'sale-timing', label: 'Timing the sale and purchase' },
      { value: 'bridge-financing', label: 'Bridge financing if closings don\'t align' },
      { value: 'tax-implications', label: 'Tax implications (capital gains)' },
      { value: 'other', label: 'Other / Multiple concerns' },
    ],
  },
]

// Refinance Questions
export const refinanceQuestions: Question[] = [
  {
    id: 'currentHomeValue',
    title: "What's your current home value?",
    tooltip: "We'll use this to calculate your loan-to-value ratio and available equity for cash-out options.",
    type: 'slider',
    min: 100000,
    max: 2000000,
    step: 10000,
    getInsight: (value: number, allValues: Record<string, any>) => {
      const balance = allValues.currentMortgageBalance || 0
      const ltv = value > 0 ? (balance / value) * 100 : 0
      return `Current LTV: ${ltv.toFixed(1)}%. Lower LTV = better rates. 80% or less avoids PMI and gets best rates.`
    },
  },
  {
    id: 'currentMortgageBalance',
    title: "What's your current mortgage balance?",
    tooltip: "We'll calculate your loan-to-value ratio and available equity.",
    type: 'slider',
    min: 0,
    max: 1500000,
    step: 10000,
  },
  {
    id: 'currentRate',
    title: "What's your current interest rate?",
    tooltip: "We'll compare this to current market rates and calculate your savings.",
    type: 'rate',
    min: 2,
    max: 10,
    step: 0.1,
    placeholder: '6.5',
  },
  {
    id: 'currentMonthlyPayment',
    title: "What's your current monthly payment (P&I only)?",
    tooltip: "We'll compare this to your new payment to show savings.",
    type: 'currency',
    min: 500,
    max: 10000,
    placeholder: '$2,000',
  },
  {
    id: 'yearsRemaining',
    title: "How many years remaining on your current mortgage?",
    tooltip: "This affects whether refinancing makes financial sense.",
    type: 'number',
    min: 1,
    max: 30,
    step: 1,
    placeholder: '25',
  },
  {
    id: 'refinanceGoals',
    title: "What are your refinance goals? (Select all that apply)",
    tooltip: "Your goals determine the best refinance strategy. We'll show you options for each.",
    type: 'radio',
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
  },
  {
    id: 'cashoutAmount',
    title: "How much cash do you need?",
    tooltip: "Maximum available is typically 80% of home value minus current balance.",
    type: 'currency',
    min: 0,
    max: 500000,
    placeholder: '$0',
    conditional: (values) => {
      const goals = values.refinanceGoals || []
      return Array.isArray(goals) && goals.some((g: string) => g.includes('cashout'))
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
  },
  {
    id: 'propertyType',
    title: "Property type & occupancy?",
    tooltip: "Rates and terms vary by property type. Investment properties have higher rates and stricter requirements.",
    type: 'radio',
    options: [
      { value: 'primary', label: 'Primary residence' },
      { value: 'second-home', label: 'Second home' },
      { value: 'investment', label: 'Investment property (rental)' },
    ],
  },
  {
    id: 'previousRefinances',
    title: "Have you refinanced before?",
    tooltip: "Recent refinances affect costs and whether it makes sense to refi again.",
    type: 'radio',
    options: [
      { value: 'never', label: 'Never refinanced' },
      { value: 'once', label: 'Once (1-3 years ago)' },
      { value: 'multiple', label: 'Multiple times' },
      { value: 'recent', label: 'Refinanced within last 12 months' },
    ],
  },
  {
    id: 'concern',
    title: "What's your biggest concern about refinancing?",
    tooltip: "We'll prioritize our analysis based on your biggest worry.",
    type: 'radio',
    options: [
      { value: 'break-even', label: 'Break-even timeline (how long to recoup closing costs)' },
      { value: 'savings', label: 'Whether I\'ll actually save money' },
      { value: 'extending-term', label: 'Extending my loan term' },
      { value: 'cashout-impact', label: 'Cash-out impacting my rate' },
      { value: 'closing-costs', label: 'Closing costs too high' },
      { value: 'appraisal', label: 'Appraisal coming in low' },
      { value: 'other', label: 'Other' },
    ],
  },
]

/**
 * Get all questions for a transaction type
 */
export function getQuestionsForTransactionType(transactionType: TransactionType | null): Question[] {
  if (!transactionType) {
    return [transactionTypeQuestion]
  }

  const baseQuestions = [transactionTypeQuestion]
  
  switch (transactionType) {
    case 'first-time':
      return [...baseQuestions, ...firstTimeQuestions]
    case 'repeat-buyer':
      return [...baseQuestions, ...repeatBuyerQuestions]
    case 'refinance':
      return [...baseQuestions, ...refinanceQuestions]
    default:
      return baseQuestions
  }
}

/**
 * Filter questions based on conditional logic
 */
export function getFilteredQuestions(questions: Question[], values: Record<string, any>): Question[] {
  return questions.filter(q => {
    if (q.conditional) {
      return q.conditional(values)
    }
    return true
  })
}

/**
 * Compute educational preparedness score from main quiz eduQuiz answers.
 * Returns 0-100 or null if not enough answers.
 */
export function computeEducationScoreFromQuiz(answers: Record<string, string | undefined>): number | null {
  const eduQuestions = firstTimeQuestions.filter(q => q.type === 'knowledge-check')
  if (eduQuestions.length === 0) return null
  let correct = 0
  let answered = 0
  eduQuestions.forEach((q, i) => {
    const ans = answers[q.id]
    if (ans !== undefined && ans !== '') {
      answered++
      if (q.correctIndex !== undefined && String(q.correctIndex) === String(ans)) {
        correct++
      }
    }
  })
  if (answered === 0) return null
  return Math.round((correct / eduQuestions.length) * 100)
}
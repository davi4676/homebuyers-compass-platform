/**
 * Question configurations for different transaction types
 * Centralized question definitions
 */

import type { CreditScoreRange, Timeline } from '@/lib/calculations';
import { formatCurrency, calculateDTI, getCityData } from '@/lib/calculations';

export interface QuestionConfig {
  id: string;
  title: string;
  tooltip: string;
  type: 'transaction-type' | 'income' | 'currency' | 'slider' | 'location' | 'radio' | 'multi-input' | 'checkbox';
  helper?: string;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  getInsight?: (value: any, watchedValues?: any) => string;
  conditional?: (watchedValues: any) => boolean;
}

// Transaction Type Question (Question 0)
export const transactionTypeQuestion: QuestionConfig = {
  id: 'transactionType',
  title: 'What type of transaction are you planning?',
  tooltip: 'Different transaction types have unique considerations, costs, and strategies. We\'ll tailor your analysis accordingly.',
  type: 'transaction-type',
  getInsight: (value: string) => {
    const insights: Record<string, string> = {
      'first-time': 'We\'ll focus on building your foundation and maximizing first-time buyer benefits.',
      'repeat-buyer': 'We\'ll calculate your equity position and show you optimal use of sale proceeds.',
      'refinance': 'We\'ll analyze if refinancing makes sense and identify break-even points.',
    };
    return insights[value] || '';
  },
};

// First-Time Buyer Questions
export const firstTimeQuestions: QuestionConfig[] = [
  {
    id: 'income',
    title: "What's your annual household income?",
    tooltip: "Lenders approve you for more than you can afford. We'll show you a realistic budget based on the 28/36 rule, not their maximums.",
    type: 'income',
    min: 30000,
    max: 1000000,
    placeholder: '$60,000',
    getInsight: (value: number) => {
      const maxApproval = value * 4.5;
      const realistic = value * 3.5;
      return `Quick insight: Most first-time buyers with ${formatCurrency(value)} income get approved for ${formatCurrency(maxApproval)}, but can comfortably afford ${formatCurrency(realistic)}. We'll explain why.`;
    },
  },
  {
    id: 'monthlyDebt',
    title: 'What are your total monthly debt payments?',
    tooltip: "Your debt-to-income ratio determines your rate. A 1% rate difference costs $50,000+ over 30 years.",
    type: 'currency',
    placeholder: '$0',
    getInsight: (value: number, watchedValues: any) => {
      const monthlyIncome = (watchedValues?.income || 60000) / 12;
      const dti = calculateDTI(value, monthlyIncome);
      return `Your DTI is ${dti.toFixed(1)}%. Each percentage point over 30% typically adds 0.125% to your rate (about $2,800 over the life of a loan).`;
    },
  },
  {
    id: 'downPayment',
    title: 'How much have you saved for a down payment?',
    tooltip: "We'll show you the true cost of different down payment amounts, including PMI that most people don't factor in.",
    type: 'slider',
    min: 0,
    max: 100000,
    step: 1000,
    getInsight: (value: number, watchedValues: any) => {
      const cityData = getCityData(watchedValues?.city || 'Austin');
      const percent = (value / cityData.medianPrice) * 100;
      const pmiEstimate = value < cityData.medianPrice * 0.2 
        ? Math.round((cityData.medianPrice - value) * 0.0075 / 12)
        : 0;
      return `With ${percent.toFixed(1)}% down, you'll pay approximately $${pmiEstimate}/month in PMI. We'll show you the math and when it makes sense to wait vs. buy now.`;
    },
  },
  {
    id: 'city',
    title: "Where are you looking to buy?",
    tooltip: "Closing costs vary wildly by state ($2,000-$8,000). We'll show you what's normal vs. inflated in your market.",
    type: 'location',
    getInsight: (value: string) => {
      const cityName = value.length === 5 && /^\d+$/.test(value) 
        ? value // zip code
        : value;
      const cityData = getCityData(cityName);
      return `Average closing costs in ${cityName}: ${formatCurrency(cityData.closingCostAvg)}. Typical price range: ${formatCurrency(cityData.priceMin)}-${formatCurrency(cityData.priceMax)}. We'll show you line by line what to expect.`;
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
        return "Buying in 3 months is aggressive. Rushing increases mistakes. We'll show you the highest-priority items to focus on.";
      }
      if (value === 'exploring') {
        return "✓ Smart! More time = more savings opportunities. We'll give you a comprehensive plan.";
      }
      return `With ${value === '6-months' ? '6 months' : '1 year'}, you have time to improve your position and save money.`;
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
      };
      const currentRate = rates[value];
      const bestRate = 6.0;
      const extraCost = ((currentRate - bestRate) / 100) * 300000;
      return `With a ${value} score, you'll pay approximately $${Math.round(extraCost)} more per year in interest than someone with 760+. We'll show you how to improve.`;
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
];

// Repeat Buyer Questions (additional questions after standard ones)
export const repeatBuyerQuestions: QuestionConfig[] = [
  // Questions 1-2 same as first-time (income, monthlyDebt)
  // Question 2B: Current Home Details
  {
    id: 'currentHomeValue',
    title: 'What is your current home worth?',
    tooltip: 'We\'ll calculate your equity position and determine your effective down payment for the next home.',
    type: 'slider',
    min: 100000,
    max: 2000000,
    step: 10000,
    getInsight: (value: number, watchedValues: any) => {
      const balance = watchedValues?.currentMortgageBalance || 0;
      const equity = value - balance;
      const equityPercent = value > 0 ? (equity / value) * 100 : 0;
      return `Your equity: ${formatCurrency(equity)} (${equityPercent.toFixed(1)}%). This is your down payment power for your next home.`;
    },
  },
  {
    id: 'currentMortgageBalance',
    title: 'What is your current mortgage balance?',
    tooltip: 'We\'ll calculate your net proceeds after paying off your current mortgage.',
    type: 'slider',
    min: 0,
    max: 1500000,
    step: 10000,
  },
  {
    id: 'ownedYears',
    title: 'When did you buy your current home?',
    tooltip: 'This affects capital gains tax eligibility. Owned 2+ years as primary residence qualifies for exclusion.',
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
    title: 'What is your home sale status?',
    tooltip: 'This helps us understand your timeline and coordination needs.',
    type: 'radio',
    options: [
      { value: 'not-listed', label: 'Not listed yet' },
      { value: 'listed', label: 'Listed for sale' },
      { value: 'under-contract', label: 'Under contract' },
      { value: 'closed', label: 'Already closed' },
    ],
  },
  // Question 2C: Sale Expectations
  {
    id: 'expectedSalePrice',
    title: 'What do you expect to sell your home for?',
    tooltip: 'Selling costs average 8-10% of sale price. We\'ll show you the true cash you\'ll have for your next purchase.',
    type: 'slider',
    min: 100000,
    max: 2000000,
    step: 10000,
  },
  {
    id: 'agentCommission',
    title: 'What is your agent commission rate?',
    tooltip: 'Typical is 5-6%, but this is negotiable. We\'ll show you how to save here.',
    type: 'slider',
    min: 0,
    max: 6,
    step: 0.1,
  },
  {
    id: 'repairsAndConcessions',
    title: 'Expected repairs/concessions to buyer?',
    tooltip: 'Typical repairs and concessions range from $0-$50K depending on home condition.',
    type: 'slider',
    min: 0,
    max: 50000,
    step: 1000,
  },
  {
    id: 'debtPayoff',
    title: 'Will you pay off other debts with sale proceeds?',
    tooltip: 'This reduces your available down payment but may improve your loan terms.',
    type: 'slider',
    min: 0,
    max: 500000,
    step: 1000,
  },
  {
    id: 'additionalSavings',
    title: 'Additional savings beyond home equity?',
    tooltip: 'How much cash will you have beyond what you get from selling your home?',
    type: 'slider',
    min: 0,
    max: 200000,
    step: 1000,
  },
  // Current mortgage details
  {
    id: 'currentRate',
    title: 'What is your current mortgage interest rate?',
    tooltip: 'We\'ll compare your current situation to what you\'ll have next and show the true cost/savings of moving.',
    type: 'slider',
    min: 2,
    max: 8,
    step: 0.125,
  },
  {
    id: 'currentYearsRemaining',
    title: 'How many years remaining on your current mortgage?',
    tooltip: 'This helps us calculate your current equity position and remaining interest.',
    type: 'slider',
    min: 1,
    max: 30,
    step: 1,
  },
  {
    id: 'currentMonthlyPayment',
    title: 'What is your current monthly payment (PITI)?',
    tooltip: 'Principal, Interest, Taxes, and Insurance combined.',
    type: 'currency',
    placeholder: '$2,000',
  },
];

// Refinance Questions
export const refinanceQuestions: QuestionConfig[] = [
  {
    id: 'currentHomeValue',
    title: 'What is your current home value?',
    tooltip: 'We\'ll use this to calculate your loan-to-value ratio and available equity for cash-out options.',
    type: 'slider',
    min: 100000,
    max: 2000000,
    step: 10000,
    getInsight: (value: number, watchedValues: any) => {
      const balance = watchedValues?.currentMortgageBalance || 0;
      const ltv = value > 0 ? (balance / value) * 100 : 0;
      return `Current LTV: ${ltv.toFixed(1)}%. Lower LTV = better rates and more cash-out options.`;
    },
  },
  {
    id: 'currentMortgageBalance',
    title: 'What is your current mortgage balance?',
    tooltip: 'We\'ll calculate your loan-to-value ratio and refinance options.',
    type: 'slider',
    min: 0,
    max: 1500000,
    step: 10000,
  },
  {
    id: 'currentRate',
    title: 'What is your current interest rate?',
    tooltip: 'We\'ll compare this to current market rates and calculate your savings.',
    type: 'slider',
    min: 2,
    max: 10,
    step: 0.125,
  },
  {
    id: 'currentMonthlyPayment',
    title: 'What is your current monthly payment (Principal & Interest only)?',
    tooltip: 'We\'ll use this to calculate your savings with different refinance options.',
    type: 'currency',
    placeholder: '$1,500',
  },
  {
    id: 'yearsRemaining',
    title: 'How many years remaining on your current mortgage?',
    tooltip: 'This affects whether refinancing makes financial sense.',
    type: 'slider',
    min: 1,
    max: 30,
    step: 1,
  },
  {
    id: 'refinanceGoals',
    title: 'What are your refinance goals? (Select all that apply)',
    tooltip: 'Your goals determine the best refinance strategy. We\'ll show you options for each.',
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
  },
  {
    id: 'cashoutAmount',
    title: 'How much cash do you need?',
    tooltip: 'Maximum available is typically 80% of home value minus current balance.',
    type: 'slider',
    min: 10000,
    max: 500000,
    step: 10000,
    conditional: (watchedValues: any) => {
      const goals = watchedValues?.refinanceGoals || [];
      return goals.some((g: string) => g.includes('cashout'));
    },
    getInsight: (value: number, watchedValues: any) => {
      const homeValue = watchedValues?.currentHomeValue || 0;
      const balance = watchedValues?.currentMortgageBalance || 0;
      const maxCashout = (homeValue * 0.8) - balance;
      return `Maximum available: ${formatCurrency(maxCashout)} (80% LTV). Requesting ${formatCurrency(value)}.`;
    },
  },
  {
    id: 'creditScore',
    title: "What's your estimated credit score?",
    tooltip: "Your score determines your refinance rate. We'll show you the impact.",
    type: 'radio',
    options: [
      { value: 'under-600', label: 'Under 600' },
      { value: '600-650', label: '600-650' },
      { value: '650-700', label: '650-700' },
      { value: '700-750', label: '700-750' },
      { value: '750+', label: '750+' },
    ],
  },
  {
    id: 'propertyType',
    title: 'Property type & occupancy?',
    tooltip: 'Rates and terms vary by property type. Investment properties have higher rates and stricter requirements.',
    type: 'radio',
    options: [
      { value: 'primary', label: 'Primary residence' },
      { value: 'second-home', label: 'Second home' },
      { value: 'investment', label: 'Investment property (rental)' },
    ],
  },
  {
    id: 'previousRefinances',
    title: 'Have you refinanced before?',
    tooltip: 'Recent refinances affect costs and whether it makes sense to refi again.',
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
    tooltip: "We'll address your specific concerns in the analysis.",
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
  },
];

/**
 * Get questions for a transaction type
 */
export function getQuestionsForTransactionType(
  transactionType: 'first-time' | 'repeat-buyer' | 'refinance' | null
): QuestionConfig[] {
  if (!transactionType) return [];

  if (transactionType === 'first-time') {
    return firstTimeQuestions;
  } else if (transactionType === 'repeat-buyer') {
    // Combine standard questions with repeat buyer specific
    return [
      firstTimeQuestions[0], // income
      firstTimeQuestions[1], // monthlyDebt
      ...repeatBuyerQuestions,
      firstTimeQuestions[3], // city
      firstTimeQuestions[4], // timeline
      firstTimeQuestions[5], // creditScore
      firstTimeQuestions[6], // agentStatus
      // Modified concern with repeat buyer options
      {
        ...firstTimeQuestions[7],
        options: [
          ...(firstTimeQuestions[7].options || []),
          { value: 'sale-timing', label: 'Timing the sale and purchase' },
          { value: 'bridge-financing', label: 'Bridge financing if closings don\'t align' },
          { value: 'tax-implications', label: 'Tax implications (capital gains)' },
          { value: 'upgrade-strategy', label: 'Upgrading vs. downgrading strategy' },
          { value: 'equity-optimization', label: 'Using equity optimally' },
        ],
      },
    ];
  } else {
    // refinance
    return refinanceQuestions;
  }
}

/**
 * Get total question count for transaction type
 */
export function getQuestionCount(transactionType: 'first-time' | 'repeat-buyer' | 'refinance' | null): number {
  if (!transactionType) return 1; // Just transaction type question
  
  if (transactionType === 'first-time') {
    return 1 + firstTimeQuestions.length; // +1 for transaction type
  } else if (transactionType === 'repeat-buyer') {
    return 1 + 2 + repeatBuyerQuestions.length + 4; // +1 transaction, +2 standard, +repeat buyer, +4 more standard
  } else {
    return 1 + refinanceQuestions.length; // +1 for transaction type
  }
}


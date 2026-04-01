/**
 * Refinance Calculations
 * Expert-level analysis for mortgage refinancing
 */

import type { CreditScoreRange } from './calculations';
import { calculateMonthlyPayment, getInterestRate, formatCurrency } from './calculations';
import { getAdjustedRateForCreditScore } from './freddie-mac-rates';

// ============================================================================
// TYPES
// ============================================================================

export interface RefinanceData {
  transactionType: 'refinance';
  currentHomeValue: number;
  currentMortgageBalance: number;
  currentRate: number;
  currentMonthlyPayment: number;
  yearsRemaining: number;
  refinanceGoals: string[]; // array of selected goals
  cashoutAmount?: number;
  creditScore: CreditScoreRange;
  propertyType: 'primary' | 'second-home' | 'investment';
  previousRefinances: 'never' | 'once' | 'multiple' | 'recent';
  concern: string;
}

export interface RefinanceAnalysis {
  currentSituation: {
    homeValue: number;
    loanBalance: number;
    ltv: number;
    rate: number;
    monthlyPayment: number;
    yearsRemaining: number;
    totalInterestRemaining: number;
    totalPaymentsRemaining: number;
  };
  newLoanOptions: {
    rateAndTerm: RefinanceOption;
    shorterTerm?: RefinanceOption; // 15-year option
    lowerPayment?: RefinanceOption; // extend term
    cashOut?: RefinanceOption; // if requested
  };
  recommendation: {
    bestOption: 'rate-and-term' | 'shorter-term' | 'lower-payment' | 'cash-out' | 'dont-refinance';
    reasoning: string;
    confidence: 'high' | 'medium' | 'low';
  };
  breakEvenAnalysis: {
    closingCosts: number;
    monthlySavings: number;
    breakEvenMonths: number;
    breakEvenDate: string; // formatted date
    worthIt: boolean;
    reasoning: string;
  };
  lifetimeAnalysis: {
    currentPath: {
      totalInterest: number;
      totalPaid: number;
      payoffDate: string;
    };
    refinancePath: {
      totalInterest: number;
      totalPaid: number;
      payoffDate: string;
      closingCosts: number;
    };
    netSavings: number; // can be negative
    savingsPercent: number;
  };
}

export interface RefinanceOption {
  type: 'rate-and-term' | '15-year' | 'extended' | 'cash-out';
  newRate: number;
  newTerm: number; // years
  newMonthlyPayment: number;
  newLoanAmount: number;
  closingCosts: number;
  cashout?: number;
  totalInterest: number;
  totalCost: number; // including closing costs
  vsCurrentSavings: number;
  pros: string[];
  cons: string[];
}

export interface RateQuote {
  baseRate: number;
  adjustments: {
    refinance: number; // +0.125% typically
    investment: number; // +0.5% to +1%
    cashout: number; // +0.25% to +0.5%
    highLTV: number; // +0.25% per 5% over 80%
  };
  finalRate: number;
  rateRange: {
    best: number;
    typical: number;
    worst: number;
  };
}

// ============================================================================
// FUNCTIONS
// ============================================================================

/**
 * Analyze refinance situation
 */
export async function analyzeRefinance(data: RefinanceData): Promise<RefinanceAnalysis> {
  // Calculate current situation
  const ltv = (data.currentMortgageBalance / data.currentHomeValue) * 100;
  const monthsRemaining = data.yearsRemaining * 12;
  const totalInterestRemaining = calculateRemainingInterest(
    data.currentMortgageBalance,
    data.currentRate,
    monthsRemaining,
    data.currentMonthlyPayment
  );
  const totalPaymentsRemaining = data.currentMonthlyPayment * monthsRemaining;

  // Get market rates from Freddie Mac (now async)
  const rateQuote = await getMarketRates(data.creditScore, 'refinance', data.propertyType, ltv, data.cashoutAmount);

  // Calculate different refinance options
  const rateAndTerm = calculateRateAndTermRefinance(data, rateQuote);
  const shorterTerm = data.yearsRemaining > 15 ? calculate15YearRefinance(data, rateQuote) : undefined;
  const lowerPayment = calculateLowerPaymentRefinance(data, rateQuote);
  const cashOut = data.cashoutAmount ? calculateCashOutRefinance(data, rateQuote) : undefined;

  // Determine best option
  const recommendation = determineBestOption(data, {
    rateAndTerm,
    shorterTerm,
    lowerPayment,
    cashOut,
  });

  // Break-even analysis
  const breakEven = calculateBreakEven(rateAndTerm, data.currentMonthlyPayment);

  // Lifetime analysis
  const lifetime = calculateLifetimeAnalysis(data, rateAndTerm, monthsRemaining);

  return {
    currentSituation: {
      homeValue: data.currentHomeValue,
      loanBalance: data.currentMortgageBalance,
      ltv,
      rate: data.currentRate,
      monthlyPayment: data.currentMonthlyPayment,
      yearsRemaining: data.yearsRemaining,
      totalInterestRemaining,
      totalPaymentsRemaining,
    },
    newLoanOptions: {
      rateAndTerm,
      shorterTerm,
      lowerPayment,
      cashOut,
    },
    recommendation,
    breakEvenAnalysis: breakEven,
    lifetimeAnalysis: lifetime,
  };
}

/**
 * Get market rates using Freddie Mac data
 * Now uses real-time mortgage rates from Freddie Mac's PMMS
 */
export async function getMarketRates(
  creditScore: CreditScoreRange,
  loanType: 'purchase' | 'refinance',
  propertyType?: string,
  ltv?: number,
  cashoutAmount?: number
): Promise<RateQuote> {
  // Get base rate from Freddie Mac data, adjusted for credit score
  const baseRate = await getAdjustedRateForCreditScore(creditScore, 30);
  
  let adjustments = {
    refinance: loanType === 'refinance' ? 0.125 : 0,
    investment: propertyType === 'investment' ? 0.75 : 0,
    cashout: cashoutAmount && cashoutAmount > 0 ? 0.375 : 0,
    highLTV: ltv && ltv > 80 ? ((ltv - 80) / 5) * 0.25 : 0,
  };

  const finalRate = baseRate + 
    adjustments.refinance + 
    adjustments.investment + 
    adjustments.cashout + 
    adjustments.highLTV;

  return {
    baseRate,
    adjustments,
    finalRate,
    rateRange: {
      best: finalRate - 0.25,
      typical: finalRate,
      worst: finalRate + 0.5,
    },
  };
}

/**
 * Calculate rate-and-term refinance
 */
function calculateRateAndTermRefinance(
  data: RefinanceData,
  rateQuote: RateQuote
): RefinanceOption {
  const newRate = rateQuote.finalRate;
  const newTerm = Math.max(data.yearsRemaining, 30); // Keep same or extend to 30
  const newLoanAmount = data.currentMortgageBalance;
  const newMonthlyPayment = calculateMonthlyPayment(newLoanAmount, newRate, newTerm);
  const closingCosts = newLoanAmount * 0.03; // 3% estimate
  const totalInterest = calculateTotalInterest(newLoanAmount, newRate, newTerm);
  const totalCost = totalInterest + closingCosts;
  
  const currentTotalInterest = calculateRemainingInterest(
    data.currentMortgageBalance,
    data.currentRate,
    data.yearsRemaining * 12,
    data.currentMonthlyPayment
  );
  const vsCurrentSavings = currentTotalInterest - totalInterest - closingCosts;

  return {
    type: 'rate-and-term',
    newRate,
    newTerm,
    newMonthlyPayment,
    newLoanAmount,
    closingCosts,
    totalInterest,
    totalCost,
    vsCurrentSavings,
    pros: [
      `Lower rate: ${data.currentRate}% → ${newRate}%`,
      `Monthly savings: ${formatCurrency(data.currentMonthlyPayment - newMonthlyPayment)}`,
      `Total savings: ${formatCurrency(vsCurrentSavings)}`,
    ],
    cons: [
      `Closing costs: ${formatCurrency(closingCosts)}`,
      `Break-even: ${Math.ceil(closingCosts / (data.currentMonthlyPayment - newMonthlyPayment))} months`,
    ],
  };
}

/**
 * Calculate 15-year refinance
 */
function calculate15YearRefinance(
  data: RefinanceData,
  rateQuote: RateQuote
): RefinanceOption {
  const newRate = rateQuote.finalRate - 0.5; // Typically 0.5% lower
  const newTerm = 15;
  const newLoanAmount = data.currentMortgageBalance;
  const newMonthlyPayment = calculateMonthlyPayment(newLoanAmount, newRate, newTerm);
  const closingCosts = newLoanAmount * 0.03;
  const totalInterest = calculateTotalInterest(newLoanAmount, newRate, newTerm);
  const totalCost = totalInterest + closingCosts;
  
  const currentTotalInterest = calculateRemainingInterest(
    data.currentMortgageBalance,
    data.currentRate,
    data.yearsRemaining * 12,
    data.currentMonthlyPayment
  );
  const vsCurrentSavings = currentTotalInterest - totalInterest - closingCosts;

  return {
    type: '15-year',
    newRate,
    newTerm,
    newMonthlyPayment,
    newLoanAmount,
    closingCosts,
    totalInterest,
    totalCost,
    vsCurrentSavings,
    pros: [
      `Pay off 15 years faster`,
      `Massive interest savings: ${formatCurrency(vsCurrentSavings)}`,
      `Lower rate: ${newRate}%`,
    ],
    cons: [
      `Higher monthly payment: +${formatCurrency(newMonthlyPayment - data.currentMonthlyPayment)}`,
      `Reduced cash flow`,
    ],
  };
}

/**
 * Calculate lower payment (extended term) refinance
 */
function calculateLowerPaymentRefinance(
  data: RefinanceData,
  rateQuote: RateQuote
): RefinanceOption {
  const newRate = rateQuote.finalRate;
  const newTerm = 30; // Extend to full 30 years
  const newLoanAmount = data.currentMortgageBalance;
  const newMonthlyPayment = calculateMonthlyPayment(newLoanAmount, newRate, newTerm);
  const closingCosts = newLoanAmount * 0.03;
  const totalInterest = calculateTotalInterest(newLoanAmount, newRate, newTerm);
  const totalCost = totalInterest + closingCosts;
  
  const currentTotalInterest = calculateRemainingInterest(
    data.currentMortgageBalance,
    data.currentRate,
    data.yearsRemaining * 12,
    data.currentMonthlyPayment
  );
  const vsCurrentSavings = currentTotalInterest - totalInterest - closingCosts; // Usually negative

  return {
    type: 'extended',
    newRate,
    newTerm,
    newMonthlyPayment,
    newLoanAmount,
    closingCosts,
    totalInterest,
    totalCost,
    vsCurrentSavings,
    pros: [
      `Lower monthly payment: ${formatCurrency(data.currentMonthlyPayment - newMonthlyPayment)}`,
      `Immediate cash flow relief`,
      `Lower rate: ${newRate}%`,
    ],
    cons: [
      `More interest over time: ${formatCurrency(Math.abs(vsCurrentSavings))}`,
      `Extends loan term`,
      `Slower equity building`,
    ],
  };
}

/**
 * Calculate cash-out refinance
 */
function calculateCashOutRefinance(
  data: RefinanceData,
  rateQuote: RateQuote
): RefinanceOption {
  const maxLTV = 0.8; // 80% max
  const maxLoanAmount = data.currentHomeValue * maxLTV;
  const cashoutAmount = Math.min(data.cashoutAmount || 0, maxLoanAmount - data.currentMortgageBalance);
  const newLoanAmount = data.currentMortgageBalance + cashoutAmount;
  const newRate = rateQuote.finalRate; // Already includes cash-out adjustment
  const newTerm = 30;
  const newMonthlyPayment = calculateMonthlyPayment(newLoanAmount, newRate, newTerm);
  const closingCosts = newLoanAmount * 0.03;
  const totalInterest = calculateTotalInterest(newLoanAmount, newRate, newTerm);
  const totalCost = totalInterest + closingCosts;
  
  const currentTotalInterest = calculateRemainingInterest(
    data.currentMortgageBalance,
    data.currentRate,
    data.yearsRemaining * 12,
    data.currentMonthlyPayment
  );
  const vsCurrentSavings = currentTotalInterest - totalInterest - closingCosts - cashoutAmount; // Cash-out is a cost

  return {
    type: 'cash-out',
    newRate,
    newTerm,
    newMonthlyPayment,
    newLoanAmount,
    closingCosts,
    cashout: cashoutAmount,
    totalInterest,
    totalCost,
    vsCurrentSavings,
    pros: [
      `Access ${formatCurrency(cashoutAmount)} in cash`,
      `Lower rate: ${newRate}%`,
      `Consolidate debt or fund improvements`,
    ],
    cons: [
      `Higher loan balance: +${formatCurrency(cashoutAmount)}`,
      `Higher monthly payment: +${formatCurrency(newMonthlyPayment - data.currentMonthlyPayment)}`,
      `Cash-out is not free money - you're borrowing it`,
    ],
  };
}

/**
 * Calculate break-even analysis
 */
function calculateBreakEven(
  option: RefinanceOption,
  currentPayment: number
): RefinanceAnalysis['breakEvenAnalysis'] {
  const monthlySavings = currentPayment - option.newMonthlyPayment;
  const breakEvenMonths = monthlySavings > 0 
    ? Math.ceil(option.closingCosts / monthlySavings)
    : Infinity;
  
  const breakEvenDate = new Date();
  breakEvenDate.setMonth(breakEvenDate.getMonth() + breakEvenMonths);

  const worthIt = breakEvenMonths < 24; // Generally worth it if < 24 months
  const reasoning = worthIt
    ? `Break-even in ${breakEvenMonths} months. Refinancing makes sense if you plan to stay in the home longer.`
    : `Break-even in ${breakEvenMonths} months. Only makes sense if you plan to stay in the home for many years.`;

  return {
    closingCosts: option.closingCosts,
    monthlySavings,
    breakEvenMonths,
    breakEvenDate: breakEvenDate.toLocaleDateString(),
    worthIt,
    reasoning,
  };
}

/**
 * Calculate lifetime analysis
 */
function calculateLifetimeAnalysis(
  data: RefinanceData,
  option: RefinanceOption,
  currentMonthsRemaining: number
): RefinanceAnalysis['lifetimeAnalysis'] {
  const currentTotalInterest = calculateRemainingInterest(
    data.currentMortgageBalance,
    data.currentRate,
    currentMonthsRemaining,
    data.currentMonthlyPayment
  );
  const currentTotalPaid = (data.currentMonthlyPayment * currentMonthsRemaining) + data.currentMortgageBalance;

  const refinanceTotalInterest = option.totalInterest;
  const refinanceTotalPaid = (option.newMonthlyPayment * (option.newTerm * 12)) + option.newLoanAmount;
  const refinancePayoffDate = new Date();
  refinancePayoffDate.setFullYear(refinancePayoffDate.getFullYear() + option.newTerm);

  const currentPayoffDate = new Date();
  currentPayoffDate.setMonth(currentPayoffDate.getMonth() + currentMonthsRemaining);

  const netSavings = (currentTotalPaid) - (refinanceTotalPaid + option.closingCosts);
  const savingsPercent = (netSavings / currentTotalPaid) * 100;

  return {
    currentPath: {
      totalInterest: currentTotalInterest,
      totalPaid: currentTotalPaid,
      payoffDate: currentPayoffDate.toLocaleDateString(),
    },
    refinancePath: {
      totalInterest: refinanceTotalInterest,
      totalPaid: refinanceTotalPaid,
      payoffDate: refinancePayoffDate.toLocaleDateString(),
      closingCosts: option.closingCosts,
    },
    netSavings,
    savingsPercent,
  };
}

/**
 * Determine best refinance option
 */
function determineBestOption(
  data: RefinanceData,
  options: {
    rateAndTerm: RefinanceOption;
    shorterTerm?: RefinanceOption;
    lowerPayment?: RefinanceOption;
    cashOut?: RefinanceOption;
  }
): RefinanceAnalysis['recommendation'] {
  // Check if cash-out is primary goal
  if (data.cashoutAmount && data.cashoutAmount > 0) {
    return {
      bestOption: 'cash-out',
      reasoning: 'Cash-out refinance meets your goal of accessing equity. Consider if the cost is worth it.',
      confidence: 'medium',
    };
  }

  // Check if lower payment is primary goal
  if (data.refinanceGoals.includes('lower-payment') && options.lowerPayment) {
    const breakEven = calculateBreakEven(options.lowerPayment, data.currentMonthlyPayment);
    if (breakEven.worthIt) {
      return {
        bestOption: 'lower-payment',
        reasoning: 'Lower payment option provides immediate cash flow relief with reasonable break-even.',
        confidence: 'high',
      };
    }
  }

  // Check if shorter term is primary goal
  if (data.refinanceGoals.includes('shorter-term') && options.shorterTerm) {
    return {
      bestOption: 'shorter-term',
      reasoning: '15-year refinance saves significant interest and pays off faster.',
      confidence: 'high',
    };
  }

  // Default to rate-and-term
  const breakEven = calculateBreakEven(options.rateAndTerm, data.currentMonthlyPayment);
  if (breakEven.worthIt) {
    return {
      bestOption: 'rate-and-term',
      reasoning: `Rate-and-term refinance saves money with break-even in ${breakEven.breakEvenMonths} months.`,
      confidence: 'high',
    };
  }

  return {
    bestOption: 'dont-refinance',
    reasoning: `Break-even is ${breakEven.breakEvenMonths} months. Only refinance if you plan to stay in the home long-term.`,
    confidence: 'medium',
  };
}

/**
 * Calculate remaining interest on current loan
 */
function calculateRemainingInterest(
  balance: number,
  rate: number,
  monthsRemaining: number,
  monthlyPayment: number
): number {
  let remainingBalance = balance;
  let totalInterest = 0;

  for (let i = 0; i < monthsRemaining; i++) {
    const monthlyInterest = (remainingBalance * rate) / 12 / 100;
    totalInterest += monthlyInterest;
    remainingBalance = remainingBalance - (monthlyPayment - monthlyInterest);
    if (remainingBalance <= 0) break;
  }

  return totalInterest;
}

/**
 * Calculate total interest over loan term
 */
function calculateTotalInterest(loanAmount: number, rate: number, years: number): number {
  const monthlyPayment = calculateMonthlyPayment(loanAmount, rate, years);
  const totalPaid = monthlyPayment * 12 * years;
  return totalPaid - loanAmount;
}


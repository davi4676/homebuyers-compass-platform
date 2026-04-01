/**
 * Repeat Buyer Calculations
 * Expert-level analysis for buyers selling current home to buy next one
 */

import type { CreditScoreRange, Timeline, AgentStatus } from './calculations';
import { formatCurrency, calculateMonthlyPayment, getInterestRate } from './calculations';

// ============================================================================
// TYPES
// ============================================================================

export type TransactionType = 'first-time' | 'repeat-buyer' | 'refinance';

export interface RepeatBuyerData {
  transactionType: 'repeat-buyer';
  income: number;
  monthlyDebt: number;
  // Current home details
  currentHomeValue: number;
  currentMortgageBalance: number;
  ownedYears: string; // '<1' | '1-2' | '2-5' | '5-10' | '10+'
  saleStatus: 'not-listed' | 'listed' | 'under-contract' | 'closed';
  // Sale expectations
  expectedSalePrice: number;
  sellingClosingCosts: number;
  agentCommission: number; // percentage
  repairsAndConcessions: number;
  debtPayoff: number;
  // Additional savings
  additionalSavings: number;
  // Current mortgage details
  currentRate: number;
  currentYearsRemaining: number;
  currentMonthlyPayment: number;
  // Standard questions
  city: string;
  timeline: Timeline;
  creditScore: CreditScoreRange;
  agentStatus: AgentStatus;
  concern: string;
}

export interface RepeatBuyerAnalysis {
  equityPosition: {
    currentHomeValue: number;
    mortgageBalance: number;
    grossEquity: number;
    equityPercent: number;
  };
  saleProceeds: {
    salePrice: number;
    mortgagePayoff: number;
    agentCommission: number; // calculated from data.agentCommission (converted from 'NA' if needed)
    sellerClosingCosts: number;
    repairsAndConcessions: number;
    debtPayoff: number;
    netProceeds: number;
    taxes: {
      capitalGains: number;
      capitalGainsExclusion: number; // $250K single, $500K married
      taxLiability: number;
    };
  };
  newPurchase: {
    totalDownPayment: number; // net proceeds + additional savings
    downPaymentPercent: number;
    newLoanAmount: number;
    avoidsPMI: boolean;
    comparedToFirstTime: {
      advantageAmount: number;
      advantagePercent: number;
    };
  };
  timing: {
    recommendation: 'simultaneous-closing' | 'sell-first' | 'buy-first' | 'bridge-loan';
    reasoning: string;
    riskLevel: 'low' | 'medium' | 'high';
    bridgeLoanCost?: number; // if applicable
  };
  comparison: {
    oldHome: {
      value: number;
      payment: number;
      rate: number;
      remainingBalance: number;
      equityBuilt: number;
    };
    newHome: {
      targetPrice: number;
      payment: number;
      rate: number;
      equityDay1: number;
    };
    cashFlowChange: number; // monthly difference
    lifetimeSavingsOrCost: number; // over 30 years
  };
}

export interface CapitalGainsResult {
  purchasePrice: number;
  salePrice: number;
  improvements: number;
  basis: number;
  grossGain: number;
  excludedAmount: number;
  taxableGain: number;
  federalTax: number;
  stateTax: number;
  totalTax: number;
  netProceedsAfterTax: number;
  qualifiesForExclusion: boolean;
  strategies: string[];
}

// ============================================================================
// FUNCTIONS
// ============================================================================

/**
 * Analyze repeat buyer situation
 */
export function analyzeRepeatBuyer(data: RepeatBuyerData): RepeatBuyerAnalysis {
  try {
    // Validate required data
    if (!data.currentHomeValue || !data.currentMortgageBalance) {
      throw new Error('Missing required home value or mortgage balance data')
    }
    
    // Calculate equity position
    const grossEquity = data.currentHomeValue - data.currentMortgageBalance;
    if (grossEquity < 0) {
      throw new Error('Mortgage balance exceeds home value')
    }
    const equityPercent = (grossEquity / data.currentHomeValue) * 100;

    // Calculate sale proceeds
    const agentCommission = (data.expectedSalePrice * data.agentCommission) / 100;
    const mortgagePayoff = data.currentMortgageBalance;
    const netProceedsBeforeTax = 
      data.expectedSalePrice - 
      mortgagePayoff - 
      agentCommission - 
      data.sellingClosingCosts - 
      data.repairsAndConcessions - 
      data.debtPayoff;

    // Calculate capital gains tax
    const capitalGains = calculateCapitalGainsTax(
      data.currentHomeValue * 0.8, // Estimate original purchase price (80% of current)
      data.expectedSalePrice,
      parseOwnedYears(data.ownedYears),
      0, // improvements - would need user input
      'single' // default - would need user input
    );

    const netProceeds = netProceedsBeforeTax - capitalGains.totalTax;

    // Calculate new purchase details
    const totalDownPayment = netProceeds + data.additionalSavings;
    const targetHomePrice = totalDownPayment / 0.2; // Assume 20% down
    const newLoanAmount = targetHomePrice - totalDownPayment;
    const downPaymentPercent = (totalDownPayment / targetHomePrice) * 100;
    const avoidsPMI = downPaymentPercent >= 20;

    // Get new interest rate
    const newRate = getInterestRate(data.creditScore);
    const newMonthlyPayment = calculateMonthlyPayment(newLoanAmount, newRate, 30);

    // Calculate timing recommendation
    const timing = calculateTimingStrategy(data, netProceeds, newLoanAmount);

    // Compare old vs new
    const cashFlowChange = newMonthlyPayment - data.currentMonthlyPayment;
    const lifetimeDifference = cashFlowChange * 12 * 30; // 30 years

    return {
    equityPosition: {
      currentHomeValue: data.currentHomeValue,
      mortgageBalance: data.currentMortgageBalance,
      grossEquity,
      equityPercent,
    },
    saleProceeds: {
      salePrice: data.expectedSalePrice,
      mortgagePayoff,
      agentCommission,
      sellerClosingCosts: data.sellingClosingCosts,
      repairsAndConcessions: data.repairsAndConcessions,
      debtPayoff: data.debtPayoff,
      netProceeds,
      taxes: {
        capitalGains: capitalGains.grossGain,
        capitalGainsExclusion: capitalGains.excludedAmount,
        taxLiability: capitalGains.totalTax,
      },
    },
    newPurchase: {
      totalDownPayment,
      downPaymentPercent,
      newLoanAmount,
      avoidsPMI,
      comparedToFirstTime: {
        advantageAmount: totalDownPayment - (data.income * 0.1), // vs typical 10% first-time
        advantagePercent: ((totalDownPayment - (data.income * 0.1)) / (data.income * 0.1)) * 100,
      },
    },
    timing,
    comparison: {
      oldHome: {
        value: data.currentHomeValue,
        payment: data.currentMonthlyPayment,
        rate: data.currentRate,
        remainingBalance: data.currentMortgageBalance,
        equityBuilt: grossEquity,
      },
      newHome: {
        targetPrice: targetHomePrice,
        payment: newMonthlyPayment,
        rate: newRate,
        equityDay1: totalDownPayment,
      },
      cashFlowChange,
      lifetimeSavingsOrCost: lifetimeDifference,
    },
    }
  } catch (error) {
    console.error('Error in analyzeRepeatBuyer:', error)
    if (error instanceof Error) {
      throw new Error(`Repeat buyer analysis failed: ${error.message}`)
    }
    throw error
  }
}

/**
 * Calculate capital gains tax
 */
export function calculateCapitalGainsTax(
  purchasePrice: number,
  salePrice: number,
  yearsOwned: number,
  improvements: number,
  filingStatus: 'single' | 'married'
): CapitalGainsResult {
  const basis = purchasePrice + improvements;
  const grossGain = salePrice - basis;

  // Check if qualifies for exclusion (owned 2+ years, primary residence)
  const qualifiesForExclusion = yearsOwned >= 2;
  const exclusionAmount = filingStatus === 'married' ? 500000 : 250000;
  const excludedAmount = qualifiesForExclusion ? Math.min(grossGain, exclusionAmount) : 0;
  const taxableGain = Math.max(0, grossGain - excludedAmount);

  // Calculate tax (simplified - would need actual tax brackets)
  const federalRate = taxableGain > 0 ? 0.15 : 0; // 15% long-term capital gains
  const federalTax = taxableGain * federalRate;
  const stateTax = taxableGain * 0.05; // Estimate 5% state tax (varies)
  const totalTax = federalTax + stateTax;

  const netProceedsAfterTax = salePrice - totalTax;

  const strategies: string[] = [];
  if (!qualifiesForExclusion) {
    strategies.push('Consider waiting until 2-year ownership mark to qualify for exclusion');
  }
  if (taxableGain > 0) {
    strategies.push('Document all improvements to increase cost basis');
    strategies.push('Include eligible closing costs in basis calculation');
  }

  return {
    purchasePrice,
    salePrice,
    improvements,
    basis,
    grossGain,
    excludedAmount,
    taxableGain,
    federalTax,
    stateTax,
    totalTax,
    netProceedsAfterTax,
    qualifiesForExclusion,
    strategies,
  };
}

/**
 * Calculate timing strategy recommendation
 */
function calculateTimingStrategy(
  data: RepeatBuyerData,
  netProceeds: number,
  newLoanAmount: number
): RepeatBuyerAnalysis['timing'] {
  // Simplified logic - would be more sophisticated in production
  const canCarryTwoMortgages = data.income / 12 * 0.36 > (data.currentMonthlyPayment + (newLoanAmount * 0.005));
  const hasCushion = netProceeds > newLoanAmount * 0.25; // 25% down + cushion

  if (hasCushion && canCarryTwoMortgages) {
    return {
      recommendation: 'simultaneous-closing',
      reasoning: 'You have sufficient equity and income to coordinate both closings on the same day, minimizing costs and risk.',
      riskLevel: 'medium',
    };
  } else if (hasCushion && !canCarryTwoMortgages) {
    return {
      recommendation: 'sell-first',
      reasoning: 'Sell first to know exact proceeds, then buy. Avoids carrying two mortgages.',
      riskLevel: 'low',
    };
  } else if (!hasCushion && canCarryTwoMortgages) {
    const bridgeLoanCost = calculateBridgeLoanCost(
      data.currentHomeValue,
      data.currentMortgageBalance,
      6 // months
    );
    return {
      recommendation: 'bridge-loan',
      reasoning: 'Bridge loan allows you to buy first with stronger offer, then sell current home.',
      riskLevel: 'medium',
      bridgeLoanCost: bridgeLoanCost.totalCost,
    };
  } else {
    return {
      recommendation: 'sell-first',
      reasoning: 'Selling first provides financial clarity and avoids risk of carrying two mortgages.',
      riskLevel: 'low',
    };
  }
}

/**
 * Calculate bridge loan costs
 */
export function calculateBridgeLoanCost(
  currentHomeValue: number,
  existingMortgage: number,
  monthsNeeded: number
): {
  maxBridgeAmount: number;
  rate: number;
  monthlyInterest: number;
  totalCost: number;
  closingCosts: number;
  riskAssessment: string;
} {
  const maxBridgeAmount = (currentHomeValue * 0.8) - existingMortgage;
  const rate = 0.09; // Prime + 3% (typical)
  const monthlyInterest = (maxBridgeAmount * rate) / 12;
  const closingCosts = 3000; // Typical
  const totalCost = (monthlyInterest * monthsNeeded) + closingCosts;

  return {
    maxBridgeAmount,
    rate: rate * 100,
    monthlyInterest,
    totalCost,
    closingCosts,
    riskAssessment: monthsNeeded > 6 ? 'High - Bridge loans are expensive and risky if sale is delayed' : 'Medium - Manageable if sale closes within 6 months',
  };
}

/**
 * Helper to parse owned years string to number
 */
function parseOwnedYears(ownedYears: string): number {
  const map: Record<string, number> = {
    '<1': 0.5,
    '1-2': 1.5,
    '2-5': 3.5,
    '5-10': 7.5,
    '10+': 12,
  };
  return map[ownedYears] || 1;
}


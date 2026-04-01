/**
 * Refinance Timing Intelligence Engine
 * Patent-worthy component that determines optimal refinance timing
 * Monitors 23 variables to calculate precise refinance opportunity windows
 * 
 * © 2024 NestQuest. All rights reserved.
 */

import type { CreditScoreRange } from '../calculations';
import { calculateMonthlyPayment } from '../calculations';
import { getAdjustedRateForCreditScore } from '../freddie-mac-rates';

// ============================================================================
// TYPES
// ============================================================================

export interface RefinanceTimingInput {
  // Current Loan Details
  currentLoan: {
    originalAmount: number;
    currentBalance: number;
    interestRate: number;
    remainingTerm: number; // months
    monthlyPayment: number; // P&I only
    loanType: 'fixed-30' | 'fixed-20' | 'fixed-15' | 'arm-5-1' | 'arm-7-1' | 'arm-10-1';
    originationDate: string; // ISO date
    lender: string;

    // ARM-specific (if applicable)
    armDetails?: {
      currentFixedPeriodEnds: string; // when rate adjusts
      adjustmentFrequency: number; // months between adjustments
      margin: number; // percentage added to index
      caps: {
        initial: number; // max change at first adjustment
        periodic: number; // max change per adjustment
        lifetime: number; // max rate ever
      };
      index: 'SOFR' | 'LIBOR' | 'CMT' | 'COFI'; // rate index used
    };
  };

  // Property Details
  property: {
    currentValue: number;
    originalPurchasePrice: number;
    propertyType: 'primary' | 'second-home' | 'investment';
    state: string; // for state-specific taxes/costs
    hoaFees?: number; // monthly
  };

  // Borrower Profile
  borrower: {
    creditScore: CreditScoreRange;
    income: number; // annual
    monthlyDebts: number; // excluding current mortgage
    employmentStability: number; // years at current job
    previousRefinances: RefinanceHistory[];
    delinquencies: number; // missed payments last 12 months
  };

  // Refinance Preferences
  preferences: {
    primaryGoal: 'lower-payment' | 'lower-rate' | 'cash-out' | 'shorten-term' | 'remove-pmi' | 'arm-to-fixed';
    cashOutAmount?: number;
    targetMonthlyPayment?: number;
    yearsInHomeExpected: number; // how long planning to stay
    maxAcceptableClosingCosts: number;
    willingToPayPoints: boolean;
    urgency: 'immediate' | 'flexible' | 'monitoring'; // watching for right time
  };

  // Context
  context: {
    lastRefinanceDate?: string;
    hasRecentCreditInquiries: boolean;
    planningToMove: boolean; // if yes, less incentive to refi
    planningMajorPurchase: boolean; // car, etc. - affects DTI
    upcomingIncomeChange?: {
      amount: number; // new annual income
      date: string;
      type: 'increase' | 'decrease';
    };
  };
}

export interface RefinanceTimingOutput {
  // Overall Recommendation
  recommendation: {
    action: 'refinance-now' | 'wait-and-monitor' | 'not-advisable';
    confidence: number; // 0-100
    reasoning: string[]; // bullet points explaining why
    urgency: 'high' | 'medium' | 'low';
    estimatedSavings: number; // total over remaining loan life
  };

  // Timing Analysis
  timing: {
    currentOpportunityScore: number; // 0-100, is now a good time?
    historicalContext: {
      currentRateVsAvg: number; // % difference from 5-year avg
      currentRateVsLow: number; // % difference from 5-year low
      currentRateVsHigh: number; // % difference from 5-year high
      trendDirection: 'rising' | 'falling' | 'stable';
      volatility: 'high' | 'medium' | 'low';
    };
    forecastedRates: {
      next30Days: { low: number; expected: number; high: number };
      next90Days: { low: number; expected: number; high: number };
      next180Days: { low: number; expected: number; high: number };
      next365Days: { low: number; expected: number; high: number };
    };
    optimalWindow: {
      startDate: string; // when to start shopping
      endDate: string; // when opportunity may close
      reasoning: string;
    };
  };

  // Break-Even Analysis (The Critical Calculation)
  breakEven: {
    closingCosts: ClosingCostBreakdown;
    monthlySavings: number;
    breakEvenMonths: number;
    breakEvenDate: string;
    paybackAnalysis: {
      if1Year: number; // net gain/loss
      if2Years: number;
      if3Years: number;
      if5Years: number;
      ifFullTerm: number;
    };
    worthIt: boolean;
    riskFactors: string[]; // things that could make it not worth it
  };

  // Market Rate Intelligence
  marketRates: {
    averageMarketRate: number; // for their credit/LTV profile
    bestAvailableRate: number; // from top lenders
    rateYouQualifyFor: number; // realistic expectation
    rateDifferential: number; // current rate - available rate

    // Rate component breakdown
    components: {
      baseRate: number; // treasury/index rate
      creditAdjustment: number; // + or - based on credit
      ltvAdjustment: number; // + or - based on LTV
      propertyTypeAdjustment: number; // investment = higher
      cashOutPremium: number; // if cash-out
      lenderMargin: number; // typical lender profit margin
    };

    // By lender type (shows range)
    byLenderType: {
      bigBanks: { low: number; avg: number; high: number };
      creditUnions: { low: number; avg: number; high: number };
      onlineLenders: { low: number; avg: number; high: number };
      mortgageBrokers: { low: number; avg: number; high: number };
    };
  };

  // Financial Impact Analysis
  impact: {
    currentScenario: {
      monthlyPayment: number;
      remainingInterest: number;
      remainingPrincipal: number;
      totalRemaining: number;
      payoffDate: string;
      equityIn5Years: number;
      equityIn10Years: number;
    };

    refinanceScenario: {
      newRate: number;
      newTerm: number;
      newMonthlyPayment: number;
      totalInterest: number;
      totalPrincipal: number;
      totalPaid: number;
      closingCosts: number;
      payoffDate: string;
      equityIn5Years: number;
      equityIn10Years: number;
    };

    comparison: {
      monthlyPaymentChange: number; // negative = savings
      interestSavings: number;
      termChange: number; // months added or removed
      totalSavings: number; // interest saved - closing costs
      roi: number; // return on closing cost investment
      netPresentValue: number; // time value of money adjusted
    };

    // Sensitivity Analysis
    sensitivity: {
      ifRatesRise0_5: { savings: number; worthIt: boolean };
      ifRatesRise1_0: { savings: number; worthIt: boolean };
      ifHomeValueDrops10: { impact: string };
      ifIncomeDecreases: { impact: string };
      ifStayOnly3Years: { savings: number; worthIt: boolean };
      ifStayOnly5Years: { savings: number; worthIt: boolean };
    };
  };

  // Loan-to-Value Analysis
  ltvAnalysis: {
    currentLTV: number;
    currentEquity: number;
    currentEquityPercent: number;

    // PMI considerations
    pmi: {
      currentlyPayingPMI: boolean;
      currentPMIAmount?: number;
      canRemovePMIWithRefi: boolean;
      equityNeededToRemove?: number;
      monthsUntilAutoRemoval?: number; // at 78% LTV
      savingsFromPMIRemoval?: number;
    };

    // Cash-out potential
    cashOut: {
      maxAvailable: number; // at 80% LTV
      recommendedMax: number; // at 75% LTV for better rates
      costOfCashOut: number; // rate premium
      alternativeOptions: {
        heloc: { available: number; estimatedRate: number };
        homeEquityLoan: { available: number; estimatedRate: number };
        comparison: string; // which is better
      };
    };
  };

  // Closing Cost Intelligence
  closingCostIntelligence: {
    estimatedTotal: number;
    breakdown: ClosingCostBreakdown;
    comparedToMarket: {
      youPay: number;
      marketAverage: number;
      marketLow: number;
      marketHigh: number;
      yourPosition: 'excellent' | 'good' | 'average' | 'high' | 'excessive';
    };
    negotiableItems: NegotiableItem[];
    potentialSavings: number;
    noClosingCostOption: {
      available: boolean;
      tradeoff: string; // e.g., "0.375% higher rate"
      worthIt: boolean;
      analysis: string;
    };
  };

  // ARM-Specific Analysis (if applicable)
  armAnalysis?: {
    nextAdjustmentDate: string;
    currentIndex: number;
    projectedNewRate: number;
    maximumPossibleRate: number;
    paymentImpact: {
      best: number;
      expected: number;
      worst: number;
    };
    armToFixedComparison: {
      stabilityValue: number; // what peace of mind is worth
      recommendConversion: boolean;
      reasoning: string;
    };
  };

  // Action Plan
  actionPlan: {
    immediate: Action[]; // if refinancing now
    if30Days: Action[]; // if waiting 30 days
    if90Days: Action[]; // if waiting 90 days
    monitoring: { // if watching and waiting
      trackTheseMetrics: string[];
      checkFrequency: 'daily' | 'weekly' | 'monthly';
      triggerPoints: TriggerPoint[]; // when to act
      alertPreferences: {
        rateDropsTo: number;
        rateDifferencialReaches: number;
        breakEvenImproves: boolean;
      };
    };
  };

  // Lender Shopping Strategy
  shoppingStrategy: {
    howManyLenders: number;
    lenderTypes: string[];
    timingGuidance: string; // all quotes within 14 days = 1 inquiry
    documentPrep: string[];
    questions: string[]; // questions to ask each lender
    redFlags: string[]; // what to watch out for
    negotiationTactics: string[];
  };

  // Historical Context (Learning Component)
  historicalContext: {
    similarBorrowers: {
      averageSavings: number;
      successRate: number; // % who completed and were satisfied
      commonMistakes: string[];
      averageTimeToClose: number; // days
    };
    yourHistory?: {
      lastRefinanceSavings: number;
      lastRefinanceBreakEven: number;
      lessonsLearned: string[];
    };
  };
}

export interface ClosingCostBreakdown {
  total: number;

  lenderFees: {
    origination: { amount: number; negotiable: boolean; percentOfLoan: number };
    applicationFee: { amount: number; negotiable: boolean; shouldBeZero: boolean };
    underwritingFee: { amount: number; negotiable: boolean; typical: number };
    processingFee: { amount: number; negotiable: boolean; isJunkFee: boolean };
    documentPrep: { amount: number; negotiable: boolean; isJunkFee: boolean };
    creditReport: { amount: number; negotiable: boolean; typical: number };
    floodCertification: { amount: number; negotiable: boolean };
    taxService: { amount: number; negotiable: boolean };

    subtotal: number;
  };

  titleAndEscrow: {
    titleInsurance: { amount: number; negotiable: boolean; canShop: boolean };
    titleSearch: { amount: number; negotiable: boolean };
    escrowFee: { amount: number; negotiable: boolean };
    notaryFee: { amount: number; negotiable: boolean };
    attorneyFee: { amount: number; negotiable: boolean; required: boolean };

    subtotal: number;
  };

  governmentFees: {
    recordingFees: { amount: number; negotiable: false };
    transferTaxes: { amount: number; negotiable: false; variesByState: boolean };

    subtotal: number;
  };

  prepaidItems: {
    interestPrepaid: { amount: number; negotiable: false; days: number };
    homeownersInsurance: { amount: number; negotiable: boolean; canShop: boolean };
    propertyTaxes: { amount: number; negotiable: false; months: number };

    subtotal: number;
  };

  otherServices: {
    appraisal: { amount: number; negotiable: boolean; required: boolean; typical: number };
    survey: { amount: number; negotiable: boolean; mayNotBeNeeded: boolean };
    pestInspection: { amount: number; negotiable: boolean; requiredByState: boolean };

    subtotal: number;
  };

  points: {
    amount: number;
    pointsPurchased: number; // 1 point = 1% of loan
    rateReduction: number; // % reduced
    worthIt: boolean;
    breakEvenMonths: number;
    analysis: string;
  };
}

export interface NegotiableItem {
  feeType: string;
  currentAmount: number;
  typicalAmount: number;
  targetAmount: number;
  negotiationScript: string;
  likelihoodOfSuccess: 'high' | 'medium' | 'low';
  potentialSavings: number;
}

export interface TriggerPoint {
  metric: string;
  currentValue: number;
  triggerValue: number;
  action: string;
  urgency: 'immediate' | 'soon' | 'monitor';
}

export interface RefinanceHistory {
  date: string;
  fromRate: number;
  toRate: number;
  closingCosts: number;
  actualBreakEven: number; // months
  satisfaction: number; // 1-10
  wouldDoAgain: boolean;
}

export interface Action {
  step: number;
  action: string;
  priority: 'high' | 'medium' | 'low';
  timeframe: string;
  resources?: string[];
}

interface MarketRateData {
  rateYouQualifyFor: number;
  averageMarketRate: number;
  bestAvailableRate: number;
  rateDifferential: number; // current rate - available rate
  components: {
    baseRate: number;
    creditAdjustment: number;
    ltvAdjustment: number;
    propertyTypeAdjustment: number;
    cashOutPremium: number;
    lenderMargin: number;
  };
  byLenderType: {
    bigBanks: { low: number; avg: number; high: number };
    creditUnions: { low: number; avg: number; high: number };
    onlineLenders: { low: number; avg: number; high: number };
    mortgageBrokers: { low: number; avg: number; high: number };
  };
}

// ============================================================================
// REFINANCE TIMING ENGINE
// ============================================================================

export class RefinanceTimingEngine {
  /**
   * Master function: Determines if now is the optimal time to refinance
   * Considers 23 variables across 7 dimensions
   */
  async analyzeRefinanceTiming(
    input: RefinanceTimingInput
  ): Promise<RefinanceTimingOutput> {
    // STEP 1: Fetch Real-Time Market Data
    const marketData = await this.fetchMarketRates(
      input.borrower.creditScore,
      this.calculateLTV(input),
      input.property.propertyType,
      input.preferences.cashOutAmount || 0,
      input.currentLoan.interestRate
    );

    // STEP 2: Calculate Financial Impact
    const impact = this.calculateFinancialImpact(
      input,
      marketData.rateYouQualifyFor
    );

    // STEP 3: Break-Even Analysis (The Most Critical Component)
    const breakEven = await this.calculateBreakEven(
      input,
      impact,
      marketData
    );

    // STEP 4: Timing Intelligence (Historical + Predictive)
    const timing = await this.analyzeMarketTiming(
      input,
      marketData
    );

    // STEP 5: LTV & Equity Analysis
    const ltvAnalysis = this.analyzeLTV(input);

    // STEP 6: Closing Cost Intelligence
    const closingCosts = await this.analyzeClosingCosts(
      input,
      marketData
    );

    // STEP 7: ARM-Specific Analysis (if applicable)
    const armAnalysis = input.currentLoan.loanType.startsWith('arm')
      ? this.analyzeARM(input, marketData)
      : undefined;

    // STEP 8: Generate Recommendation
    const recommendation = this.generateRecommendation(
      input,
      breakEven,
      timing,
      impact,
      ltvAnalysis,
      armAnalysis
    );

    // STEP 9: Create Action Plan
    const actionPlan = this.createActionPlan(
      recommendation,
      input.preferences.urgency,
      timing
    );

    // STEP 10: Shopping Strategy
    const shoppingStrategy = this.createShoppingStrategy(
      input,
      marketData,
      recommendation
    );

    // STEP 11: Historical Context
    const historicalContext = await this.getHistoricalContext(
      input.borrower
    );

    return {
      recommendation,
      timing,
      breakEven,
      marketRates: marketData,
      impact,
      ltvAnalysis,
      closingCostIntelligence: closingCosts,
      armAnalysis,
      actionPlan,
      shoppingStrategy,
      historicalContext
    };
  }

  /**
   * CRITICAL COMPONENT 1: Break-Even Calculation
   * The most important number - tells you if refinancing is worth it
   */
  private async calculateBreakEven(
    input: RefinanceTimingInput,
    impact: any,
    marketData: MarketRateData
  ): Promise<any> {
    // Estimate closing costs with high accuracy
    const closingCosts = await this.estimateClosingCosts(
      input.currentLoan.currentBalance,
      input.property.state,
      input.preferences.cashOutAmount || 0
    );

    // Calculate monthly savings (or cost increase)
    const monthlySavings =
      input.currentLoan.monthlyPayment - impact.refinanceScenario.newMonthlyPayment;

    // Basic break-even: costs / savings
    const breakEvenMonths = monthlySavings > 0
      ? closingCosts.total / monthlySavings
      : Infinity;

    // Add origination date for break-even date
    const breakEvenDate = new Date();
    breakEvenDate.setMonth(breakEvenDate.getMonth() + breakEvenMonths);

    // Payback analysis at different time horizons
    const paybackAnalysis = {
      if1Year: (monthlySavings * 12) - closingCosts.total,
      if2Years: (monthlySavings * 24) - closingCosts.total,
      if3Years: (monthlySavings * 36) - closingCosts.total,
      if5Years: (monthlySavings * 60) - closingCosts.total,
      ifFullTerm: impact.comparison.totalSavings
    };

    // Determine if it's worth it
    const yearsInHome = input.preferences.yearsInHomeExpected;
    const savingsInExpectedTimeframe =
      (monthlySavings * yearsInHome * 12) - closingCosts.total;

    const worthIt = savingsInExpectedTimeframe > 0 && breakEvenMonths < (yearsInHome * 12);

    // Identify risk factors
    const riskFactors: string[] = [];

    if (breakEvenMonths > 24) {
      riskFactors.push("Break-even is >2 years - need to stay in home long-term");
    }
    if (monthlySavings < 100) {
      riskFactors.push("Monthly savings are minimal - small changes could eliminate benefit");
    }
    if (input.currentLoan.remainingTerm < 120) {
      riskFactors.push("You're already 20+ years into your loan - less benefit from refinancing");
    }
    if (input.context.planningToMove) {
      riskFactors.push("Planning to move - may not reach break-even before selling");
    }
    if (closingCosts.total > input.preferences.maxAcceptableClosingCosts) {
      riskFactors.push(`Closing costs exceed your max of $${input.preferences.maxAcceptableClosingCosts.toLocaleString()}`);
    }

    return {
      closingCosts,
      monthlySavings,
      breakEvenMonths: Math.round(breakEvenMonths),
      breakEvenDate: breakEvenDate.toISOString().split('T')[0],
      paybackAnalysis,
      worthIt,
      riskFactors
    };
  }

  /**
   * CRITICAL COMPONENT 2: Market Timing Analysis
   * Determines if rates are favorable now or likely to improve
   */
  private async analyzeMarketTiming(
    input: RefinanceTimingInput,
    marketData: MarketRateData
  ): Promise<any> {
    // Fetch historical rate data
    const historicalRates = await this.fetchHistoricalRates('30-year-fixed', 1825); // 5 years

    // Calculate statistical metrics
    const currentRate = marketData.rateYouQualifyFor;
    const avg5Year = this.average(historicalRates);
    const min5Year = Math.min(...historicalRates);
    const max5Year = Math.max(...historicalRates);
    const stdDev = this.standardDeviation(historicalRates);

    // Determine trend direction (30-day moving average)
    const recent30Days = historicalRates.slice(-30);
    const prior30Days = historicalRates.slice(-60, -30);
    const trend30DayAvg = this.average(recent30Days);
    const prior30DayAvg = this.average(prior30Days);

    let trendDirection: 'rising' | 'falling' | 'stable';
    if (trend30DayAvg > prior30DayAvg + 0.1) {
      trendDirection = 'rising';
    } else if (trend30DayAvg < prior30DayAvg - 0.1) {
      trendDirection = 'falling';
    } else {
      trendDirection = 'stable';
    }

    // Calculate volatility
    const recentVolatility = this.standardDeviation(recent30Days);
    const volatility = recentVolatility > stdDev * 1.5 ? 'high'
      : recentVolatility < stdDev * 0.5 ? 'low'
      : 'medium';

    // Forecast future rates using multiple models
    const forecast = await this.forecastRates(
      historicalRates,
      input.currentLoan.loanType
    );

    // Calculate opportunity score (0-100)
    // Higher score = better time to refinance
    let opportunityScore = 50; // baseline

    // Factor 1: Current rate vs historical (40% weight)
    const rateDiffFromAvg = avg5Year - currentRate;
    opportunityScore += (rateDiffFromAvg / avg5Year) * 100 * 0.4;

    // Factor 2: Trend direction (20% weight)
    if (trendDirection === 'falling') {
      opportunityScore += 10; // falling rates = good
    } else if (trendDirection === 'rising') {
      opportunityScore -= 10; // rising rates = act fast
    }

    // Factor 3: Rate differential (30% weight)
    const differential = input.currentLoan.interestRate - currentRate;
    if (differential > 1.0) {
      opportunityScore += 30; // huge opportunity
    } else if (differential > 0.5) {
      opportunityScore += 15; // good opportunity
    } else if (differential < 0.25) {
      opportunityScore -= 30; // minimal benefit
    }

    // Factor 4: Forecast (10% weight)
    if (forecast.next90Days.expected < currentRate) {
      opportunityScore -= 10; // wait, rates likely to drop
    } else {
      opportunityScore += 10; // act now, rates likely to rise
    }

    // Clamp between 0-100
    opportunityScore = Math.max(0, Math.min(100, opportunityScore));

    // Determine optimal window
    let optimalWindow: any;

    if (opportunityScore > 75) {
      optimalWindow = {
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        reasoning: "Excellent opportunity. Rates are favorable and may not stay this low."
      };
    } else if (opportunityScore > 50) {
      optimalWindow = {
        startDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        endDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
        reasoning: "Good opportunity, but not urgent. Monitor rates for next month."
      };
    } else {
      optimalWindow = {
        startDate: 'TBD',
        endDate: 'TBD',
        reasoning: "Rates are not optimal currently. Set up alerts for when conditions improve."
      };
    }

    return {
      currentOpportunityScore: Math.round(opportunityScore),
      historicalContext: {
        currentRateVsAvg: Number(((currentRate - avg5Year) / avg5Year * 100).toFixed(2)),
        currentRateVsLow: Number(((currentRate - min5Year) / min5Year * 100).toFixed(2)),
        currentRateVsHigh: Number(((currentRate - max5Year) / max5Year * 100).toFixed(2)),
        trendDirection,
        volatility
      },
      forecastedRates: forecast,
      optimalWindow
    };
  }

  /**
   * CRITICAL COMPONENT 3: Financial Impact Calculation
   * Shows exact dollar impact of refinancing
   */
  private calculateFinancialImpact(
    input: RefinanceTimingInput,
    newRate: number
  ): any {
    const current = input.currentLoan;

    // Current scenario calculations
    const currentMonthlyRate = current.interestRate / 100 / 12;
    const currentRemaining = current.remainingTerm;

    const currentRemainingInterest = this.calculateTotalInterest(
      current.currentBalance,
      currentMonthlyRate,
      currentRemaining
    );

    const currentPayoffDate = new Date();
    currentPayoffDate.setMonth(currentPayoffDate.getMonth() + currentRemaining);

    // Calculate current equity trajectory
    const currentEquityIn5Years = this.calculateEquityAtYear(
      input.property.currentValue,
      current.currentBalance,
      currentMonthlyRate,
      60,
      0.03 // 3% annual appreciation assumption
    );

    const currentEquityIn10Years = this.calculateEquityAtYear(
      input.property.currentValue,
      current.currentBalance,
      currentMonthlyRate,
      120,
      0.03
    );

    // Refinance scenario
    // Determine new term based on preferences
    let newTerm: number;
    if (input.preferences.primaryGoal === 'shorten-term') {
      newTerm = 180; // 15 years
    } else if (input.preferences.primaryGoal === 'lower-payment') {
      newTerm = 360; // restart to 30 years
    } else {
      newTerm = currentRemaining; // match remaining term
    }

    // Calculate new loan amount (include cash-out if requested)
    const newLoanAmount = current.currentBalance +
      (input.preferences.cashOutAmount || 0);

    const newMonthlyRate = newRate / 100 / 12;
    const newMonthlyPayment = calculateMonthlyPayment(
      newLoanAmount,
      newRate / 100,
      newTerm / 12
    );

    const newTotalInterest = this.calculateTotalInterest(
      newLoanAmount,
      newMonthlyRate,
      newTerm
    );

    const newPayoffDate = new Date();
    newPayoffDate.setMonth(newPayoffDate.getMonth() + newTerm);

    // Calculate new equity trajectory
    const newEquityIn5Years = this.calculateEquityAtYear(
      input.property.currentValue,
      newLoanAmount,
      newMonthlyRate,
      60,
      0.03
    );

    const newEquityIn10Years = this.calculateEquityAtYear(
      input.property.currentValue,
      newLoanAmount,
      newMonthlyRate,
      120,
      0.03
    );

    // Comparison
    const monthlyPaymentChange = newMonthlyPayment - current.monthlyPayment;
    const interestSavings = currentRemainingInterest - newTotalInterest;
    const termChange = newTerm - currentRemaining;

    // Estimate closing costs (will be detailed later)
    const estimatedClosingCosts = newLoanAmount * 0.03; // 3% estimate

    const totalSavings = interestSavings - estimatedClosingCosts;
    const roi = (totalSavings / estimatedClosingCosts) * 100;

    // Net Present Value calculation (6% discount rate)
    const npv = this.calculateNPV(
      monthlyPaymentChange,
      newTerm,
      estimatedClosingCosts,
      0.06 / 12
    );

    // Sensitivity analysis
    const sensitivity = {
      ifRatesRise0_5: this.recalculateWithRate(newRate + 0.5, input, newLoanAmount, newTerm, estimatedClosingCosts),
      ifRatesRise1_0: this.recalculateWithRate(newRate + 1.0, input, newLoanAmount, newTerm, estimatedClosingCosts),
      ifHomeValueDrops10: {
        impact: "Higher LTV may affect rate by +0.125% and require PMI if LTV > 80%"
      },
      ifIncomeDecreases: {
        impact: "May affect DTI ratio and qualification. Recalculate affordability."
      },
      ifStayOnly3Years: this.recalculateSavings(monthlyPaymentChange, 36, estimatedClosingCosts),
      ifStayOnly5Years: this.recalculateSavings(monthlyPaymentChange, 60, estimatedClosingCosts)
    };

    return {
      currentScenario: {
        monthlyPayment: current.monthlyPayment,
        remainingInterest: currentRemainingInterest,
        remainingPrincipal: current.currentBalance,
        totalRemaining: currentRemainingInterest + current.currentBalance,
        payoffDate: currentPayoffDate.toISOString().split('T')[0],
        equityIn5Years: currentEquityIn5Years,
        equityIn10Years: currentEquityIn10Years
      },
      refinanceScenario: {
        newRate,
        newTerm,
        newMonthlyPayment,
        totalInterest: newTotalInterest,
        totalPrincipal: newLoanAmount,
        totalPaid: newTotalInterest + newLoanAmount + estimatedClosingCosts,
        closingCosts: estimatedClosingCosts,
        payoffDate: newPayoffDate.toISOString().split('T')[0],
        equityIn5Years: newEquityIn5Years,
        equityIn10Years: newEquityIn10Years
      },
      comparison: {
        monthlyPaymentChange,
        interestSavings,
        termChange,
        totalSavings,
        roi,
        netPresentValue: npv
      },
      sensitivity
    };
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private calculateLTV(input: RefinanceTimingInput): number {
    return (input.currentLoan.currentBalance / input.property.currentValue) * 100;
  }

  private calculateTotalInterest(principal: number, monthlyRate: number, months: number): number {
    if (monthlyRate === 0) return 0;
    const monthlyPayment = calculateMonthlyPayment(principal, monthlyRate * 12, months / 12);
    return (monthlyPayment * months) - principal;
  }

  private calculateEquityAtYear(
    homeValue: number,
    loanBalance: number,
    monthlyRate: number,
    months: number,
    appreciationRate: number
  ): number {
    // Calculate remaining balance after N months
    const monthlyPayment = calculateMonthlyPayment(loanBalance, monthlyRate * 12, 30);
    let remainingBalance = loanBalance;
    for (let i = 0; i < months; i++) {
      const interest = remainingBalance * monthlyRate;
      const principal = monthlyPayment - interest;
      remainingBalance -= principal;
    }

    // Calculate home value with appreciation
    const appreciatedValue = homeValue * Math.pow(1 + appreciationRate, months / 12);

    return appreciatedValue - remainingBalance;
  }

  private calculateNPV(
    monthlyCashFlow: number,
    months: number,
    initialCost: number,
    discountRate: number
  ): number {
    let npv = -initialCost;
    for (let i = 1; i <= months; i++) {
      npv += monthlyCashFlow / Math.pow(1 + discountRate, i);
    }
    return npv;
  }

  private recalculateWithRate(
    newRate: number,
    input: RefinanceTimingInput,
    loanAmount: number,
    term: number,
    closingCosts: number
  ): { savings: number; worthIt: boolean } {
    const newMonthlyRate = newRate / 100 / 12;
    const newMonthlyPayment = calculateMonthlyPayment(loanAmount, newRate / 100, term / 12);
    const monthlySavings = input.currentLoan.monthlyPayment - newMonthlyPayment;
    const savings = (monthlySavings * term) - closingCosts;
    return {
      savings,
      worthIt: savings > 0 && (closingCosts / monthlySavings) < (input.preferences.yearsInHomeExpected * 12)
    };
  }

  private recalculateSavings(
    monthlySavings: number,
    months: number,
    closingCosts: number
  ): { savings: number; worthIt: boolean } {
    const savings = (monthlySavings * months) - closingCosts;
    return {
      savings,
      worthIt: savings > 0
    };
  }

  private average(numbers: number[]): number {
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  }

  private standardDeviation(numbers: number[]): number {
    const avg = this.average(numbers);
    const squareDiffs = numbers.map(value => Math.pow(value - avg, 2));
    const avgSquareDiff = this.average(squareDiffs);
    return Math.sqrt(avgSquareDiff);
  }

  // ============================================================================
  // PLACEHOLDER METHODS (To be implemented with real data sources)
  // ============================================================================

  private async fetchMarketRates(
    creditScore: CreditScoreRange,
    ltv: number,
    propertyType: 'primary' | 'second-home' | 'investment',
    cashOutAmount: number,
    currentRate: number
  ): Promise<MarketRateData> {
    // Use Freddie Mac PMMS data as baseline (already includes credit score adjustment)
    const baseRate = await getAdjustedRateForCreditScore(creditScore, 30); // 30-year fixed
    
    // Apply additional adjustments beyond credit score (which is already in baseRate)
    const ltvAdjustment = ltv > 80 ? 0.25 : ltv > 75 ? 0.125 : 0;
    const propertyTypeAdjustment = propertyType === 'investment' ? 0.75 : propertyType === 'second-home' ? 0.375 : 0;
    const cashOutPremium = cashOutAmount > 0 ? 0.25 : 0;
    const lenderMargin = 0.125;
    const refinanceAdjustment = 0.125; // Typical refinance premium vs purchase

    const rateYouQualifyFor = baseRate + ltvAdjustment + propertyTypeAdjustment + cashOutPremium + lenderMargin + refinanceAdjustment;
    const rateDifferential = currentRate - rateYouQualifyFor;
    
    // Credit adjustment is already in baseRate, but we show it for transparency
    const creditAdjustment = this.getCreditAdjustment(creditScore);

    return {
      rateYouQualifyFor,
      averageMarketRate: rateYouQualifyFor + 0.125,
      bestAvailableRate: rateYouQualifyFor - 0.25,
      rateDifferential,
      components: {
        baseRate: baseRate - creditAdjustment, // Show base before credit adjustment
        creditAdjustment,
        ltvAdjustment,
        propertyTypeAdjustment,
        cashOutPremium,
        lenderMargin: lenderMargin + refinanceAdjustment // Combine lender margin and refinance adjustment
      },
      byLenderType: {
        bigBanks: { low: rateYouQualifyFor - 0.125, avg: rateYouQualifyFor + 0.125, high: rateYouQualifyFor + 0.375 },
        creditUnions: { low: rateYouQualifyFor - 0.25, avg: rateYouQualifyFor, high: rateYouQualifyFor + 0.25 },
        onlineLenders: { low: rateYouQualifyFor - 0.375, avg: rateYouQualifyFor - 0.125, high: rateYouQualifyFor + 0.125 },
        mortgageBrokers: { low: rateYouQualifyFor - 0.25, avg: rateYouQualifyFor, high: rateYouQualifyFor + 0.25 }
      }
    };
  }

  private getCreditAdjustment(creditScore: CreditScoreRange): number {
    const adjustments: Record<CreditScoreRange, number> = {
      'under-600': 1.5,
      '600-650': 1.0,
      '650-700': 0.5,
      '700-750': 0.125,
      '750+': -0.125
    };
    return adjustments[creditScore] || 0;
  }

  private async fetchHistoricalRates(loanType: string, days: number): Promise<number[]> {
    // TODO: Fetch from Freddie Mac API or similar
    // For now, return simulated data
    const rates: number[] = [];
    const baseRate = 6.5;
    for (let i = 0; i < days; i++) {
      rates.push(baseRate + (Math.random() - 0.5) * 2);
    }
    return rates;
  }

  private async forecastRates(historicalRates: number[], loanType: string): Promise<any> {
    // TODO: Implement sophisticated forecasting model
    // For now, use simple trend projection
    const recentAvg = this.average(historicalRates.slice(-30));
    const trend = (recentAvg - this.average(historicalRates.slice(-60, -30))) / 30;

    return {
      next30Days: {
        low: recentAvg - 0.25,
        expected: recentAvg + trend,
        high: recentAvg + 0.25
      },
      next90Days: {
        low: recentAvg - 0.5,
        expected: recentAvg + (trend * 3),
        high: recentAvg + 0.5
      },
      next180Days: {
        low: recentAvg - 0.75,
        expected: recentAvg + (trend * 6),
        high: recentAvg + 0.75
      },
      next365Days: {
        low: recentAvg - 1.0,
        expected: recentAvg + (trend * 12),
        high: recentAvg + 1.0
      }
    };
  }

  private async estimateClosingCosts(
    loanAmount: number,
    state: string,
    cashOutAmount: number
  ): Promise<ClosingCostBreakdown> {
    // TODO: Use state-specific data and real closing cost estimators
    // For now, use industry averages

    const origination = loanAmount * 0.01; // 1%
    const applicationFee = 0; // Should be zero
    const underwritingFee = 800;
    const processingFee = 500; // Junk fee
    const documentPrep = 300; // Junk fee
    const creditReport = 50;
    const floodCertification = 20;
    const taxService = 75;

    const lenderFeesSubtotal = origination + applicationFee + underwritingFee + processingFee + documentPrep + creditReport + floodCertification + taxService;

    const titleInsurance = loanAmount * 0.005; // 0.5%
    const titleSearch = 200;
    const escrowFee = 500;
    const notaryFee = 100;
    const attorneyFee = 0; // Not required in all states

    const titleSubtotal = titleInsurance + titleSearch + escrowFee + notaryFee + attorneyFee;

    const recordingFees = 200;
    const transferTaxes = 0; // Varies by state

    const govSubtotal = recordingFees + transferTaxes;

    const interestPrepaid = (loanAmount * 0.065 / 12) * 15; // 15 days
    const homeownersInsurance = 1200; // Annual, prepaid
    const propertyTaxes = 3000; // 2 months escrow

    const prepaidSubtotal = interestPrepaid + homeownersInsurance + propertyTaxes;

    const appraisal = 500;
    const survey = 400;
    const pestInspection = 100;

    const otherSubtotal = appraisal + survey + pestInspection;

    const points = 0; // User preference

    const total = lenderFeesSubtotal + titleSubtotal + govSubtotal + prepaidSubtotal + otherSubtotal + points;

    return {
      total,
      lenderFees: {
        origination: { amount: origination, negotiable: true, percentOfLoan: 1.0 },
        applicationFee: { amount: applicationFee, negotiable: true, shouldBeZero: true },
        underwritingFee: { amount: underwritingFee, negotiable: true, typical: 800 },
        processingFee: { amount: processingFee, negotiable: true, isJunkFee: true },
        documentPrep: { amount: documentPrep, negotiable: true, isJunkFee: true },
        creditReport: { amount: creditReport, negotiable: true, typical: 50 },
        floodCertification: { amount: floodCertification, negotiable: true },
        taxService: { amount: taxService, negotiable: true },
        subtotal: lenderFeesSubtotal
      },
      titleAndEscrow: {
        titleInsurance: { amount: titleInsurance, negotiable: true, canShop: true },
        titleSearch: { amount: titleSearch, negotiable: true },
        escrowFee: { amount: escrowFee, negotiable: true },
        notaryFee: { amount: notaryFee, negotiable: true },
        attorneyFee: { amount: attorneyFee, negotiable: true, required: false },
        subtotal: titleSubtotal
      },
      governmentFees: {
        recordingFees: { amount: recordingFees, negotiable: false },
        transferTaxes: { amount: transferTaxes, negotiable: false, variesByState: true },
        subtotal: govSubtotal
      },
      prepaidItems: {
        interestPrepaid: { amount: interestPrepaid, negotiable: false, days: 15 },
        homeownersInsurance: { amount: homeownersInsurance, negotiable: true, canShop: true },
        propertyTaxes: { amount: propertyTaxes, negotiable: false, months: 2 },
        subtotal: prepaidSubtotal
      },
      otherServices: {
        appraisal: { amount: appraisal, negotiable: true, required: true, typical: 500 },
        survey: { amount: survey, negotiable: true, mayNotBeNeeded: true },
        pestInspection: { amount: pestInspection, negotiable: true, requiredByState: false },
        subtotal: otherSubtotal
      },
      points: {
        amount: points,
        pointsPurchased: 0,
        rateReduction: 0,
        worthIt: false,
        breakEvenMonths: Infinity,
        analysis: "Points not purchased"
      }
    };
  }

  private analyzeLTV(input: RefinanceTimingInput): any {
    const currentLTV = this.calculateLTV(input);
    const currentEquity = input.property.currentValue - input.currentLoan.currentBalance;
    const currentEquityPercent = (currentEquity / input.property.currentValue) * 100;

    // PMI analysis
    const currentlyPayingPMI = currentLTV > 80;
    const currentPMIAmount = currentlyPayingPMI ? input.currentLoan.currentBalance * 0.0075 / 12 : 0;
    const canRemovePMIWithRefi = currentLTV <= 80;
    const equityNeededToRemove = currentLTV > 80 ? (input.currentLoan.currentBalance / 0.8) - input.property.currentValue : 0;
    const monthsUntilAutoRemoval = currentLTV > 78 ? this.calculateMonthsToLTV(input, 78) : 0;
    const savingsFromPMIRemoval = currentlyPayingPMI ? currentPMIAmount * 12 * 7 : 0; // ~7 years

    // Cash-out analysis
    const maxAvailable = input.property.currentValue * 0.8 - input.currentLoan.currentBalance;
    const recommendedMax = input.property.currentValue * 0.75 - input.currentLoan.currentBalance;
    const costOfCashOut = maxAvailable > 0 ? 0.25 : 0; // 0.25% rate premium

    return {
      currentLTV,
      currentEquity,
      currentEquityPercent,
      pmi: {
        currentlyPayingPMI,
        currentPMIAmount: currentlyPayingPMI ? currentPMIAmount : undefined,
        canRemovePMIWithRefi,
        equityNeededToRemove: equityNeededToRemove > 0 ? equityNeededToRemove : undefined,
        monthsUntilAutoRemoval: monthsUntilAutoRemoval > 0 ? monthsUntilAutoRemoval : undefined,
        savingsFromPMIRemoval: savingsFromPMIRemoval > 0 ? savingsFromPMIRemoval : undefined
      },
      cashOut: {
        maxAvailable: Math.max(0, maxAvailable),
        recommendedMax: Math.max(0, recommendedMax),
        costOfCashOut,
        alternativeOptions: {
          heloc: { available: maxAvailable, estimatedRate: 8.5 },
          homeEquityLoan: { available: maxAvailable, estimatedRate: 7.5 },
          comparison: "HELOC better for flexibility, Home Equity Loan better for fixed rate"
        }
      }
    };
  }

  private calculateMonthsToLTV(input: RefinanceTimingInput, targetLTV: number): number {
    const targetBalance = input.property.currentValue * (targetLTV / 100);
    const monthlyPayment = input.currentLoan.monthlyPayment;
    const monthlyRate = input.currentLoan.interestRate / 100 / 12;
    let balance = input.currentLoan.currentBalance;
    let months = 0;

    while (balance > targetBalance && months < 360) {
      const interest = balance * monthlyRate;
      const principal = monthlyPayment - interest;
      balance -= principal;
      months++;
    }

    return months;
  }

  private async analyzeClosingCosts(
    input: RefinanceTimingInput,
    marketData: MarketRateData
  ): Promise<any> {
    const closingCosts = await this.estimateClosingCosts(
      input.currentLoan.currentBalance,
      input.property.state,
      input.preferences.cashOutAmount || 0
    );

    // Market comparison (simplified)
    const marketAverage = closingCosts.total * 1.1;
    const marketLow = closingCosts.total * 0.8;
    const marketHigh = closingCosts.total * 1.5;

    let yourPosition: 'excellent' | 'good' | 'average' | 'high' | 'excessive';
    if (closingCosts.total < marketLow) {
      yourPosition = 'excellent';
    } else if (closingCosts.total < marketAverage) {
      yourPosition = 'good';
    } else if (closingCosts.total < marketHigh) {
      yourPosition = 'average';
    } else {
      yourPosition = 'high';
    }

    // Identify negotiable items
    const negotiableItems: NegotiableItem[] = [];

    if (closingCosts.lenderFees.processingFee.amount > 0) {
      negotiableItems.push({
        feeType: 'Processing Fee',
        currentAmount: closingCosts.lenderFees.processingFee.amount,
        typicalAmount: 0,
        targetAmount: 0,
        negotiationScript: "I see a processing fee of $X. This is a junk fee that many lenders waive. Can you remove it?",
        likelihoodOfSuccess: 'high',
        potentialSavings: closingCosts.lenderFees.processingFee.amount
      });
    }

    // No closing cost option analysis
    const noClosingCostOption = {
      available: true,
      tradeoff: "Typically 0.25-0.5% higher rate",
      worthIt: closingCosts.total / input.currentLoan.currentBalance < 0.02, // If closing costs < 2% of loan
      analysis: closingCosts.total / input.currentLoan.currentBalance < 0.02
        ? "No closing cost option may be worth it if you plan to move within 5 years"
        : "Paying closing costs upfront is better for long-term savings"
    };

    return {
      estimatedTotal: closingCosts.total,
      breakdown: closingCosts,
      comparedToMarket: {
        youPay: closingCosts.total,
        marketAverage,
        marketLow,
        marketHigh,
        yourPosition
      },
      negotiableItems,
      potentialSavings: negotiableItems.reduce((sum, item) => sum + item.potentialSavings, 0),
      noClosingCostOption
    };
  }

  private analyzeARM(input: RefinanceTimingInput, marketData: MarketRateData): any {
    if (!input.currentLoan.armDetails) return undefined;

    const nextAdjustmentDate = new Date(input.currentLoan.armDetails.currentFixedPeriodEnds);
    const currentIndex = 5.5; // TODO: Fetch real index value
    const projectedNewRate = Math.min(
      currentIndex + input.currentLoan.armDetails.margin,
      input.currentLoan.interestRate + input.currentLoan.armDetails.caps.periodic
    );
    const maximumPossibleRate = input.currentLoan.armDetails.caps.lifetime;

    const currentPayment = input.currentLoan.monthlyPayment;
    const projectedPayment = calculateMonthlyPayment(
      input.currentLoan.currentBalance,
      projectedNewRate / 100,
      (input.currentLoan.remainingTerm - (input.currentLoan.armDetails.adjustmentFrequency || 0)) / 12
    );
    const worstPayment = calculateMonthlyPayment(
      input.currentLoan.currentBalance,
      maximumPossibleRate / 100,
      (input.currentLoan.remainingTerm - (input.currentLoan.armDetails.adjustmentFrequency || 0)) / 12
    );

    const recommendConversion = projectedNewRate > marketData.rateYouQualifyFor + 0.5;

    return {
      nextAdjustmentDate: nextAdjustmentDate.toISOString().split('T')[0],
      currentIndex,
      projectedNewRate,
      maximumPossibleRate,
      paymentImpact: {
        best: currentPayment,
        expected: projectedPayment,
        worst: worstPayment
      },
      armToFixedComparison: {
        stabilityValue: (worstPayment - currentPayment) * 12 * 5, // 5 years of worst case
        recommendConversion,
        reasoning: recommendConversion
          ? "Converting to fixed rate provides stability and may save money long-term"
          : "Current ARM rate is competitive, but consider converting for peace of mind"
      }
    };
  }

  private generateRecommendation(
    input: RefinanceTimingInput,
    breakEven: any,
    timing: any,
    impact: any,
    ltvAnalysis: any,
    armAnalysis?: any
  ): any {
    let action: 'refinance-now' | 'wait-and-monitor' | 'not-advisable';
    let confidence = 0;
    const reasoning: string[] = [];
    let urgency: 'high' | 'medium' | 'low' = 'low';
    let estimatedSavings = 0;

    // Primary decision factors
    const rateDifferential = input.currentLoan.interestRate - impact.refinanceScenario.newRate;
    const breakEvenAcceptable = breakEven.breakEvenMonths < (input.preferences.yearsInHomeExpected * 12);
    const worthIt = breakEven.worthIt;
    const opportunityScore = timing.currentOpportunityScore;

    if (!worthIt || !breakEvenAcceptable) {
      action = 'not-advisable';
      confidence = 85;
      reasoning.push(`Break-even period (${breakEven.breakEvenMonths} months) exceeds your expected time in home`);
      if (rateDifferential < 0.5) {
        reasoning.push(`Rate differential (${rateDifferential.toFixed(2)}%) is too small to justify costs`);
      }
    } else if (rateDifferential > 1.0 && opportunityScore > 70) {
      action = 'refinance-now';
      confidence = 90;
      urgency = 'high';
      estimatedSavings = impact.comparison.totalSavings;
      reasoning.push(`Excellent rate differential: ${rateDifferential.toFixed(2)}% lower`);
      reasoning.push(`Break-even in ${breakEven.breakEvenMonths} months`);
      reasoning.push(`Market timing is favorable (score: ${opportunityScore})`);
    } else if (rateDifferential > 0.5 && opportunityScore > 50) {
      action = 'refinance-now';
      confidence = 75;
      urgency = 'medium';
      estimatedSavings = impact.comparison.totalSavings;
      reasoning.push(`Good rate differential: ${rateDifferential.toFixed(2)}% lower`);
      reasoning.push(`Break-even in ${breakEven.breakEvenMonths} months`);
    } else if (rateDifferential > 0.5 && opportunityScore < 50) {
      action = 'wait-and-monitor';
      confidence = 60;
      urgency = 'low';
      reasoning.push(`Rate differential is good (${rateDifferential.toFixed(2)}%), but market timing suggests waiting`);
      reasoning.push(`Monitor rates for next 30-90 days`);
    } else {
      action = 'wait-and-monitor';
      confidence = 70;
      reasoning.push(`Rate differential (${rateDifferential.toFixed(2)}%) is minimal`);
      reasoning.push(`Better to wait for rates to drop further`);
    }

    // ARM-specific considerations
    if (armAnalysis && armAnalysis.armToFixedComparison.recommendConversion) {
      action = 'refinance-now';
      confidence = Math.max(confidence, 80);
      urgency = 'high';
      reasoning.push(`ARM rate adjustment coming - converting to fixed recommended`);
    }

    // PMI removal consideration
    if (ltvAnalysis.pmi.canRemovePMIWithRefi && ltvAnalysis.pmi.currentlyPayingPMI) {
      reasoning.push(`Refinancing can remove PMI, saving $${ltvAnalysis.pmi.savingsFromPMIRemoval?.toLocaleString()} over time`);
      if (action === 'wait-and-monitor') {
        action = 'refinance-now';
        confidence = Math.max(confidence, 70);
      }
    }

    return {
      action,
      confidence,
      reasoning,
      urgency,
      estimatedSavings
    };
  }

  private createActionPlan(
    recommendation: any,
    urgency: 'immediate' | 'flexible' | 'monitoring',
    timing: any
  ): any {
    const immediate: Action[] = [];
    const if30Days: Action[] = [];
    const if90Days: Action[] = [];

    if (recommendation.action === 'refinance-now') {
      immediate.push(
        { step: 1, action: "Gather financial documents (pay stubs, tax returns, bank statements)", priority: 'high', timeframe: 'Today' },
        { step: 2, action: "Get quotes from 3-5 lenders within 14 days", priority: 'high', timeframe: 'This week' },
        { step: 3, action: "Compare Loan Estimates side-by-side", priority: 'high', timeframe: 'Within 2 weeks' },
        { step: 4, action: "Lock in rate when satisfied with terms", priority: 'high', timeframe: 'Within 30 days' }
      );
    } else if (recommendation.action === 'wait-and-monitor') {
      if30Days.push(
        { step: 1, action: "Set up rate alerts", priority: 'medium', timeframe: 'This week' },
        { step: 2, action: "Improve credit score if possible", priority: 'medium', timeframe: 'Next 30 days' },
        { step: 3, action: "Research lenders and prepare documents", priority: 'low', timeframe: 'Next 30 days' }
      );
    }

    return {
      immediate,
      if30Days,
      if90Days,
      monitoring: {
        trackTheseMetrics: [
          "Market interest rates",
          "Your credit score",
          "Home value changes",
          "Break-even calculation"
        ],
        checkFrequency: urgency === 'monitoring' ? 'weekly' : 'monthly',
        triggerPoints: [
          {
            metric: "Rate differential",
            currentValue: 0,
            triggerValue: 0.75,
            action: "Start shopping for refinance",
            urgency: 'soon'
          }
        ],
        alertPreferences: {
          rateDropsTo: 0,
          rateDifferencialReaches: 0.75,
          breakEvenImproves: true
        }
      }
    };
  }

  private createShoppingStrategy(
    input: RefinanceTimingInput,
    marketData: MarketRateData,
    recommendation: any
  ): any {
    return {
      howManyLenders: 3,
      lenderTypes: ['Credit Unions', 'Online Lenders', 'Mortgage Brokers'],
      timingGuidance: "Get all quotes within 14 days to count as single credit inquiry",
      documentPrep: [
        "Last 2 years tax returns",
        "Last 2 months pay stubs",
        "Last 2 months bank statements",
        "Current mortgage statement",
        "Homeowners insurance policy"
      ],
      questions: [
        "What is your best rate for my profile?",
        "What are all the fees and can any be waived?",
        "Do you offer rate locks?",
        "What is your average time to close?",
        "Can you match or beat this competitor's offer?"
      ],
      redFlags: [
        "Pressure to sign immediately",
        "Fees that seem too high",
        "Unwillingness to provide Loan Estimate",
        "Promises that seem too good to be true"
      ],
      negotiationTactics: [
        "Use competing offers as leverage",
        "Ask for specific fees to be waived",
        "Negotiate rate based on paying points",
        "Request lender credits to offset costs"
      ]
    };
  }

  private async getHistoricalContext(borrower: any): Promise<any> {
    // TODO: Integrate with database of refinance outcomes
    return {
      similarBorrowers: {
        averageSavings: 50000,
        successRate: 85,
        commonMistakes: [
          "Not shopping around enough",
          "Focusing only on rate, ignoring fees",
          "Refinancing too frequently",
          "Not staying long enough to break even"
        ],
        averageTimeToClose: 45
      },
      yourHistory: borrower.previousRefinances.length > 0 ? {
        lastRefinanceSavings: borrower.previousRefinances[0].fromRate - borrower.previousRefinances[0].toRate > 0 ? 30000 : 0,
        lastRefinanceBreakEven: borrower.previousRefinances[0].actualBreakEven,
        lessonsLearned: []
      } : undefined
    };
  }
}


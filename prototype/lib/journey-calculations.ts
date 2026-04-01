/**
 * Journey-specific financial calculations for Refinance and Buy & Sell modules.
 * Uses lib/calculations for shared helpers (formatCurrency, calculateMonthlyPayment, etc.)
 */

import {
  calculateMonthlyPayment,
  calculatePMI,
  getInterestRate,
  type CreditScoreRange,
} from './calculations'

// ============================================================================
// REFINANCE JOURNEY TYPES & HELPERS
// ============================================================================

export type RefiCreditScoreRange = 'under-600' | '600-650' | '650-700' | '700-750' | '750+'

export interface RefiCurrentSituation {
  mortgageBalance: number
  currentRate: number
  monthlyPayment: number
  yearsRemaining: number
  homeValue: number
  creditScore: RefiCreditScoreRange
}

export interface RefiGoal {
  id: string
  label: string
  selected: boolean
}

export interface RefiScenario {
  id: 'best-rate' | 'most-savings' | 'fastest-payoff'
  label: string
  newRate: number
  newMonthlyPayment: number
  loanTermYears: number
  closingCostsEstimate: number
  breakEvenMonths: number
  totalInterestNew: number
  monthlySavings: number
}

/** Refinance closing cost estimate: typically 2–5% of loan amount */
export function estimateRefiClosingCosts(loanAmount: number): number {
  return Math.round(loanAmount * 0.025) // ~2.5%
}

/** Total interest over life of loan (P&I only for simplicity) */
export function totalInterestOverLife(
  principal: number,
  annualRate: number,
  years: number
): number {
  const monthly = calculateMonthlyPayment(principal, annualRate / 100, years)
  const totalPaid = monthly * 12 * years
  return Math.max(0, totalPaid - principal)
}

/** Break-even months: closing costs / monthly savings */
export function breakEvenMonths(
  closingCosts: number,
  currentMonthly: number,
  newMonthly: number
): number {
  const savings = currentMonthly - newMonthly
  if (savings <= 0) return Infinity
  return Math.ceil(closingCosts / savings)
}

/** Get refinance rate by credit (slightly better than purchase for refi in some models) */
export function getRefiRate(creditScore: RefiCreditScoreRange): number {
  const purchaseRate = getInterestRate(creditScore as CreditScoreRange)
  return Math.max(0.01, purchaseRate - 0.0025) // e.g. 0.25% lower for refi
}

/** Build three refi scenarios from current situation and goals */
export function buildRefiScenarios(
  current: RefiCurrentSituation,
  goals: RefiGoal[]
): RefiScenario[] {
  const baseRefiRate = getRefiRate(current.creditScore)
  const closingCosts = estimateRefiClosingCosts(current.mortgageBalance)
  const currentTotalInterest = totalInterestOverLife(
    current.mortgageBalance,
    current.currentRate,
    current.yearsRemaining
  )

  const wantLowerPayment = goals.some((g) => g.id === 'lower-payment' && g.selected)
  const wantShorterTerm = goals.some((g) => g.id === 'reduce-term' && g.selected)

  // Best rate: same term, lowest rate (already using best rate for credit)
  const bestRateRate = baseRefiRate
  const bestRateTerm = current.yearsRemaining
  const bestRateMonthly = calculateMonthlyPayment(
    current.mortgageBalance,
    bestRateRate / 100,
    bestRateTerm
  )
  const bestRateInterest = totalInterestOverLife(
    current.mortgageBalance,
    bestRateRate * 100,
    bestRateTerm
  )
  const bestRateBreakEven = breakEvenMonths(
    closingCosts,
    current.monthlyPayment,
    bestRateMonthly
  )

  // Most savings: maximize monthly reduction (often 30-year at best rate)
  const savingsTerm = wantLowerPayment ? 30 : current.yearsRemaining
  const savingsRate = baseRefiRate
  const savingsMonthly = calculateMonthlyPayment(
    current.mortgageBalance,
    savingsRate / 100,
    savingsTerm
  )
  const savingsInterest = totalInterestOverLife(
    current.mortgageBalance,
    savingsRate,
    savingsTerm
  )
  const savingsBreakEven = breakEvenMonths(closingCosts, current.monthlyPayment, savingsMonthly)

  // Fastest payoff: 15 or 20 year
  const payoffTerm = wantShorterTerm ? 15 : Math.min(20, current.yearsRemaining)
  const payoffRate = baseRefiRate - 0.0025 // slightly lower for shorter term
  const payoffMonthly = calculateMonthlyPayment(
    current.mortgageBalance,
    Math.max(0.02, payoffRate) / 100,
    payoffTerm
  )
  const payoffInterest = totalInterestOverLife(
    current.mortgageBalance,
    Math.max(2, payoffRate * 100),
    payoffTerm
  )
  const payoffBreakEven = breakEvenMonths(closingCosts, current.monthlyPayment, payoffMonthly)

  return [
    {
      id: 'best-rate',
      label: 'Best Rate',
      newRate: bestRateRate * 100,
      newMonthlyPayment: bestRateMonthly,
      loanTermYears: bestRateTerm,
      closingCostsEstimate: closingCosts,
      breakEvenMonths: bestRateBreakEven,
      totalInterestNew: bestRateInterest,
      monthlySavings: current.monthlyPayment - bestRateMonthly,
    },
    {
      id: 'most-savings',
      label: 'Most Savings',
      newRate: savingsRate * 100,
      newMonthlyPayment: savingsMonthly,
      loanTermYears: savingsTerm,
      closingCostsEstimate: closingCosts,
      breakEvenMonths: savingsBreakEven,
      totalInterestNew: savingsInterest,
      monthlySavings: current.monthlyPayment - savingsMonthly,
    },
    {
      id: 'fastest-payoff',
      label: 'Fastest Payoff',
      newRate: Math.max(0.02, payoffRate) * 100,
      newMonthlyPayment: payoffMonthly,
      loanTermYears: payoffTerm,
      closingCostsEstimate: closingCosts,
      breakEvenMonths: payoffBreakEven,
      totalInterestNew: payoffInterest,
      monthlySavings: current.monthlyPayment - payoffMonthly,
    },
  ]
}

/** Lifetime interest savings vs current loan */
export function lifetimeInterestSavings(
  currentTotalInterest: number,
  newTotalInterest: number,
  closingCosts: number
): number {
  return Math.max(0, currentTotalInterest - newTotalInterest - closingCosts)
}

// ============================================================================
// BUY & SELL JOURNEY TYPES & HELPERS
// ============================================================================

export interface BuySellCurrentHome {
  homeValue: number
  mortgageBalance: number
  sellingCostsPercent: number
  sellingCostsFixed: number
  timelineToSell: '1-3' | '3-6' | '6-12' | '12+'
}

export interface BuySellNewHome {
  targetPriceMin: number
  targetPriceMax: number
  location: string
  downPaymentSource: 'proceeds' | 'savings' | 'both'
  additionalSavings: number
  creditScore: RefiCreditScoreRange
}

export type BridgeScenario = 'buy-first' | 'sell-first' | 'contingent'

export interface WaterfallStep {
  label: string
  value: number
  type: 'start' | 'minus' | 'plus' | 'equals'
}

/** Net proceeds from sale: value - mortgage - costs */
export function netProceedsFromSale(
  homeValue: number,
  mortgageBalance: number,
  sellingCostsPercent: number,
  sellingCostsFixed: number
): number {
  const costPercent = (homeValue * sellingCostsPercent) / 100
  return Math.max(0, homeValue - mortgageBalance - costPercent - sellingCostsFixed)
}

/** Buying power: down payment + max loan (simplified DTI not applied here) */
export function buyingPower(
  downPayment: number,
  maxLoanMultiplier: number
): number {
  return downPayment + downPayment * (maxLoanMultiplier - 1)
}

/** Waterfall steps for buy-sell */
export function getBuySellWaterfall(
  currentHome: BuySellCurrentHome,
  additionalSavings: number,
  downPaymentPercent: number
): WaterfallStep[] {
  const netProceeds = netProceedsFromSale(
    currentHome.homeValue,
    currentHome.mortgageBalance,
    currentHome.sellingCostsPercent,
    currentHome.sellingCostsFixed
  )
  const sellingCostsTotal =
    (currentHome.homeValue * currentHome.sellingCostsPercent) / 100 +
    currentHome.sellingCostsFixed
  const totalDown = netProceeds + additionalSavings
  const maxPurchase = totalDown / (downPaymentPercent / 100)
  const loanAmount = maxPurchase - totalDown

  return [
    { label: 'Home value (current)', value: currentHome.homeValue, type: 'start' },
    { label: 'Minus: Mortgage payoff', value: -currentHome.mortgageBalance, type: 'minus' },
    { label: 'Minus: Selling costs', value: -sellingCostsTotal, type: 'minus' },
    { label: 'Plus: Additional savings', value: additionalSavings, type: 'plus' },
    { label: 'Equals: Available for down payment', value: totalDown, type: 'equals' },
    { label: 'Plus: New loan amount', value: loanAmount, type: 'plus' },
    { label: 'Equals: Buying power', value: maxPurchase, type: 'equals' },
  ]
}

/** Purchase scenario: monthly payment, PMI, reserves */
export interface PurchaseScenarioResult {
  id: 'conservative' | 'balanced' | 'aggressive'
  label: string
  downPaymentPercent: number
  purchasePrice: number
  loanAmount: number
  monthlyPayment: number
  pmiMonthly: number
  cashReservesAfter: number
  emergencyFundMonths: number
  recommended?: boolean
}

export function buildPurchaseScenarios(
  availableDown: number,
  additionalSavings: number,
  targetPrice: number,
  creditScore: RefiCreditScoreRange,
  monthlyExpenses: number
): PurchaseScenarioResult[] {
  const rate = getRefiRate(creditScore) * 100
  const conservativeDown = 0.2
  const balancedDown = 0.15
  const aggressiveDown = 0.1

  const totalCash = availableDown + additionalSavings
  const conservativePrice = Math.min(
    totalCash / conservativeDown,
    targetPrice * 1.1
  )
  const balancedPrice = targetPrice
  const aggressivePrice = Math.min(
    totalCash / aggressiveDown,
    targetPrice * 1.2
  )

  const buildOne = (
    id: PurchaseScenarioResult['id'],
    label: string,
    downPct: number,
    price: number,
    recommended: boolean
  ): PurchaseScenarioResult => {
    const loanAmount = price * (1 - downPct)
    const monthly = calculateMonthlyPayment(price * (1 - downPct), rate / 100, 30)
    const pmi = calculatePMI(loanAmount, downPct * 100)
    const cashUsed = price * downPct
    const reserves = totalCash - cashUsed
    const emergencyMonths = monthlyExpenses > 0 ? reserves / monthlyExpenses : 0
    return {
      id,
      label,
      downPaymentPercent: downPct * 100,
      purchasePrice: price,
      loanAmount,
      monthlyPayment: monthly + pmi,
      pmiMonthly: pmi,
      cashReservesAfter: Math.max(0, reserves),
      emergencyFundMonths: Math.floor(emergencyMonths),
      recommended,
    }
  }

  return [
    buildOne('conservative', 'Conservative (20% down)', conservativeDown, conservativePrice, false),
    buildOne('balanced', 'Balanced (15% down)', balancedDown, balancedPrice, true),
    buildOne('aggressive', 'Aggressive (10% down)', aggressiveDown, aggressivePrice, false),
  ]
}

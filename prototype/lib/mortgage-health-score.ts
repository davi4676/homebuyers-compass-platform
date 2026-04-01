/**
 * Mortgage Health Score Calculator
 * Cross-ecosystem metric that considers multiple factors
 */

export interface MortgageHealthFactors {
  rateCompetitiveness: number // 0-100: How competitive is current rate vs market
  equityUtilization: number // 0-100: How efficiently equity is being used
  paymentToIncome: number // 0-100: Payment as % of income (lower is better)
  refinanceEligibility: number // 0-100: Likelihood refinance makes sense
  upgradeReadiness: number // 0-100: Ready to upgrade based on equity/income
  creditHealth: number // 0-100: Credit score and credit utilization
  savingsBuffer: number // 0-100: Emergency fund and reserves
  debtToIncome: number // 0-100: DTI ratio (lower is better)
}

export interface MortgageHealthScore {
  overall: number // 0-100
  factors: MortgageHealthFactors
  recommendations: string[]
  nextActions: {
    priority: 'high' | 'medium' | 'low'
    action: string
    impact: string
    link?: string
  }[]
}

export function calculateMortgageHealthScore(
  factors: Partial<MortgageHealthFactors>
): MortgageHealthScore {
  // Default values if not provided
  const completeFactors: MortgageHealthFactors = {
    rateCompetitiveness: factors.rateCompetitiveness ?? 50,
    equityUtilization: factors.equityUtilization ?? 50,
    paymentToIncome: factors.paymentToIncome ?? 50,
    refinanceEligibility: factors.refinanceEligibility ?? 50,
    upgradeReadiness: factors.upgradeReadiness ?? 50,
    creditHealth: factors.creditHealth ?? 50,
    savingsBuffer: factors.savingsBuffer ?? 50,
    debtToIncome: factors.debtToIncome ?? 50,
  }

  // Weighted calculation
  const weights = {
    rateCompetitiveness: 0.2,
    equityUtilization: 0.15,
    paymentToIncome: 0.15,
    refinanceEligibility: 0.1,
    upgradeReadiness: 0.1,
    creditHealth: 0.15,
    savingsBuffer: 0.1,
    debtToIncome: 0.05,
  }

  const overall =
    completeFactors.rateCompetitiveness * weights.rateCompetitiveness +
    completeFactors.equityUtilization * weights.equityUtilization +
    (100 - completeFactors.paymentToIncome) * weights.paymentToIncome + // Inverted (lower is better)
    completeFactors.refinanceEligibility * weights.refinanceEligibility +
    completeFactors.upgradeReadiness * weights.upgradeReadiness +
    completeFactors.creditHealth * weights.creditHealth +
    completeFactors.savingsBuffer * weights.savingsBuffer +
    (100 - completeFactors.debtToIncome) * weights.debtToIncome // Inverted (lower is better)

  // Generate recommendations
  const recommendations: string[] = []
  const nextActions: MortgageHealthScore['nextActions'] = []

  if (completeFactors.rateCompetitiveness < 60) {
    recommendations.push('Your current rate may be higher than market rates')
    nextActions.push({
      priority: 'high',
      action: 'Check refinance opportunities',
      impact: 'Could save $200-500/month',
      link: '/refinance-optimizer',
    })
  }

  if (completeFactors.equityUtilization > 80) {
    recommendations.push('You have significant equity that could be leveraged')
    nextActions.push({
      priority: 'medium',
      action: 'Explore cash-out refinance or upgrade options',
      impact: 'Access $50,000-$200,000+ in equity',
      link: '/repeat-buyer-suite',
    })
  }

  if (completeFactors.paymentToIncome > 40) {
    recommendations.push('Your payment-to-income ratio is high')
    nextActions.push({
      priority: 'high',
      action: 'Review your budget and consider refinancing',
      impact: 'Reduce monthly payment burden',
      link: '/refinance-optimizer',
    })
  }

  if (completeFactors.refinanceEligibility > 70) {
    recommendations.push('Refinancing could significantly improve your mortgage')
    nextActions.push({
      priority: 'high',
      action: 'Start refinance analysis',
      impact: 'Potential savings of $10,000-$50,000',
      link: '/refinance-optimizer',
    })
  }

  if (completeFactors.upgradeReadiness > 70) {
    recommendations.push('You may be ready to upgrade to a larger home')
    nextActions.push({
      priority: 'medium',
      action: 'Explore upgrade options',
      impact: 'Leverage equity for better home',
      link: '/repeat-buyer-suite',
    })
  }

  if (completeFactors.creditHealth < 60) {
    recommendations.push('Improving your credit score could unlock better rates')
    nextActions.push({
      priority: 'medium',
      action: 'View credit improvement tips',
      impact: '5-10 point improvement = 0.125-0.25% rate reduction',
      link: '/mortgage-shopping?phase=preparation',
    })
  }

  return {
    overall: Math.round(overall),
    factors: completeFactors,
    recommendations,
    nextActions,
  }
}

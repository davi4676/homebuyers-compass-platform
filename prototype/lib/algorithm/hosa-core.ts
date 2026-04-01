/**
 * HOSA - Homebuyer Optimization & Savings Algorithm
 * Patent-pending multi-dimensional optimization engine
 * © 2024 NestQuest. All rights reserved.
 */

import { CreditScoreRange, Timeline, Concern } from '../calculations'

// ============================================================================
// TYPES
// ============================================================================

export interface HOSAInput {
  // Financial Profile (Domain 1)
  income: number
  monthlyDebt: number
  creditScore: CreditScoreRange
  downPayment: number
  additionalSavings: number
  employmentStability: number // 1-10 score
  incomeGrowthProjection: number // % expected annual growth

  // Market Context (Domain 2)
  targetCity: string
  propertyType: 'sfh' | 'condo' | 'townhouse' | 'multi-family'
  marketVelocity: number // days on market
  seasonality: number // time of year adjustment factor
  competitionIndex: number // buyer competition in market
  priceAppreciationRate: number // historical + predicted

  // Transaction Context (Domain 3)
  transactionType: 'first-time' | 'repeat-buyer' | 'refinance'
  timeline: Timeline
  urgency: 'low' | 'medium' | 'high'
  flexibility: number // 1-10, how flexible on location/features

  // Behavioral Profile (Domain 4)
  riskTolerance: 'conservative' | 'moderate' | 'aggressive'
  negotiationComfort: number // 1-10 self-assessment
  decisionMakingSpeed: 'slow' | 'medium' | 'fast'
  primaryConcern: Concern
  mustHaveFeatures: string[]
  niceToHaveFeatures: string[]

  // Network Effect (Domain 5)
  hasRealtor: boolean
  realtorQuality: number // 1-10 based on vetting
  hasLender: boolean
  lenderRelationship: 'none' | 'prequalified' | 'preapproved'
  familySupport: 'none' | 'advice' | 'financial' | 'cosigner'

  // Historical Context (Domain 6 - for repeat buyers)
  previousHomeOwnership?: {
    yearsPriorOwnership: number
    priorHomeSuccess: number // 1-10 satisfaction
    lessonsLearned: string[]
  }
}

export interface DomainScore {
  domain: string
  score: number // 0-100
  strengths: string[]
  weaknesses: string[]
  improvementPotential: number
}

export interface DomainScores {
  financial: DomainScore
  market: DomainScore
  transaction: DomainScore
  behavioral: DomainScore
  network: DomainScore
  experience: DomainScore
}

export interface OptimizationOpportunity {
  id: string
  category: 'credit' | 'debt' | 'savings' | 'negotiation' | 'timing' | 'strategy'
  title: string
  description: string

  // Multi-dimensional scoring
  savingsPotential: {
    min: number
    expected: number
    max: number
    confidence: number // 0-1
  }

  effort: {
    timeRequired: number // hours
    complexity: 'low' | 'medium' | 'high'
    skillRequired: string[]
  }

  impact: {
    financialImpact: number // $ saved
    riskReduction: number // 0-100 points
    speedIncrease: number // days saved
    stressReduction: number // 0-100 points
  }

  dependencies: string[] // IDs of prerequisites
  blockers: string[] // Things that prevent this

  // Optimization scoring
  roiScore: number // Return on effort (savings / time)
  priorityScore: number // Algorithm-calculated priority
  urgencyScore: number // Time-sensitivity

  actionSteps: ActionStep[]
  resources: Resource[]

  // Tracking
  status: 'suggested' | 'in-progress' | 'completed' | 'skipped'
  completionDate?: string
  actualSavings?: number // For learning
}

export interface ActionStep {
  id: string
  title: string
  description: string
  order: number
}

export interface Resource {
  type: 'article' | 'calculator' | 'script' | 'video' | 'tool'
  title: string
  url: string
  description: string
}

export interface ActionSequence {
  sequenceId: string
  phase: 'preparation' | 'execution' | 'closing' | 'post-purchase'
  weekNumber: number

  actions: Action[]

  // Optimization
  parallelizable: boolean // Can be done simultaneously
  criticalPath: boolean // Blocking other actions
  optimalStartDate: string
  deadline?: string

  // Dependencies
  requires: string[] // Action IDs
  enables: string[] // Action IDs

  // Tracking
  estimatedCompletion: number // 0-100%
  actualCompletion: number
  status: 'pending' | 'active' | 'completed' | 'blocked'
}

export interface Action {
  id: string
  title: string
  description: string
  category: string

  // Execution details
  timeEstimate: number // minutes
  difficulty: number // 1-10
  resources: Resource[]
  script?: string // Pre-written communication

  // Gamification
  xpReward: number
  badgeUnlock?: string
  streakEligible: boolean

  // Validation
  verificationMethod: 'self-report' | 'document-upload' | 'integration' | 'manual-review'
  proof?: string // What constitutes completion
}

export interface Predictions {
  successProbability: number // Likelihood of achieving goals
  estimatedClosingDate: string
  dealRiskScore: number // 0-100, higher = riskier
  marketTimingScore: number // Is now a good time?
  negotiationPowerScore: number // Their leverage
}

export interface TimelineStrategy {
  preparationWeeks: number
  executionWeeks: number
  closingWeeks: number
  totalWeeks: number
  milestones: string[]
}

export interface Checkpoint {
  id: string
  weekNumber: number
  trigger: string
  action: 're-run-algorithm' | 'update-predictions' | 'adjust-strategy'
  conditions: string[]
}

export interface HOSAOutput {
  // Overall Optimization Score
  optimizationScore: number // 0-100, how optimized their approach is

  // Savings Opportunities (Ranked)
  savingsOpportunities: OptimizationOpportunity[]
  totalSavingsPotential: {
    conservative: number // 80% confidence
    expected: number // 50% confidence
    optimistic: number // 20% confidence
  }

  // Action Sequence (Time-Optimized)
  actionPlan: ActionSequence[]
  criticalPath: string[] // IDs of must-do actions

  // Predictive Insights
  predictions: Predictions

  // Personalized Strategy
  strategy: {
    primaryApproach: string
    fallbackApproach: string
    redFlags: string[]
    advantages: string[]
    timeline: TimelineStrategy
  }

  // Continuous Optimization
  checkpoints: Checkpoint[] // When to re-run algorithm
  adaptiveThresholds: { [key: string]: number } // Dynamic adjustments
}

interface SimulationResult {
  success: boolean
  savings: number
  daysToClose: number
}

// ============================================================================
// HOSA ENGINE
// ============================================================================

export class HOSAEngine {
  /**
   * Main optimization function
   * Runs multi-dimensional analysis and generates optimal strategy
   */
  async optimize(input: HOSAInput): Promise<HOSAOutput> {
    // STEP 1: Domain Scoring (6 domains, 0-100 each)
    const domainScores: DomainScores = {
      financial: this.scoreFinancialProfile(input),
      market: await this.scoreMarketContext(input),
      transaction: this.scoreTransactionReadiness(input),
      behavioral: this.scoreBehavioralProfile(input),
      network: this.scoreNetworkStrength(input),
      experience: this.scoreExperience(input),
    }

    // STEP 2: Identify Opportunity Space
    const opportunities = this.identifyOpportunities(input, domainScores)

    // STEP 3: Multi-Objective Optimization
    const rankedOpportunities = this.rankOpportunities(
      opportunities,
      input.riskTolerance,
      input.timeline,
      input.primaryConcern
    )

    // STEP 4: Generate Optimal Action Sequence
    const actionPlan = this.generateActionSequence(
      rankedOpportunities,
      input.timeline,
      domainScores
    )

    // STEP 5: Predictive Modeling
    const predictions = await this.runPredictions(input, actionPlan)

    // STEP 6: Strategy Synthesis
    const strategy = this.synthesizeStrategy(input, domainScores, predictions)

    // STEP 7: Continuous Optimization Checkpoints
    const checkpoints = this.defineCheckpoints(input.timeline, actionPlan)

    // Calculate overall optimization score
    const optimizationScore = this.calculateOptimizationScore(
      domainScores,
      rankedOpportunities,
      predictions
    )

    return {
      optimizationScore,
      savingsOpportunities: rankedOpportunities,
      totalSavingsPotential: this.calculateTotalSavings(rankedOpportunities),
      actionPlan,
      criticalPath: this.identifyCriticalPath(actionPlan),
      predictions,
      strategy,
      checkpoints,
      adaptiveThresholds: this.calculateThresholds(input, domainScores),
    }
  }

  /**
   * PATENT-WORTHY COMPONENT 1: Multi-Domain Scoring
   * Proprietary scoring across 6 interconnected domains
   */
  private scoreFinancialProfile(input: HOSAInput): DomainScore {
    const creditWeight = 0.3
    const dtiWeight = 0.25
    const downPaymentWeight = 0.2
    const savingsBufferWeight = 0.15
    const incomeStabilityWeight = 0.1

    const creditScore = this.normalizeCreditScore(input.creditScore)
    const dtiScore = this.scoreDTI(input.income, input.monthlyDebt)
    const downPaymentScore = this.scoreDownPayment(input.downPayment, input.targetCity)
    const savingsScore = this.scoreSavingsBuffer(input.additionalSavings, input.income)
    const stabilityScore = input.employmentStability * 10

    const totalScore =
      creditScore * creditWeight +
      dtiScore * dtiWeight +
      downPaymentScore * downPaymentWeight +
      savingsScore * savingsBufferWeight +
      stabilityScore * incomeStabilityWeight

    const strengths: string[] = []
    const weaknesses: string[] = []

    if (creditScore > 80) strengths.push('credit')
    else if (creditScore < 60) weaknesses.push('credit')

    if (dtiScore > 80) strengths.push('dti')
    else if (dtiScore < 60) weaknesses.push('dti')

    if (downPaymentScore > 80) strengths.push('downPayment')
    else if (downPaymentScore < 60) weaknesses.push('downPayment')

    return {
      domain: 'financial',
      score: Math.min(100, Math.max(0, totalScore)),
      strengths,
      weaknesses,
      improvementPotential: 100 - totalScore,
    }
  }

  private normalizeCreditScore(creditScore: CreditScoreRange): number {
    const scoreMap: Record<CreditScoreRange, number> = {
      'under-600': 40,
      '600-650': 55,
      '650-700': 70,
      '700-750': 85,
      '750+': 100,
    }
    return scoreMap[creditScore] || 70
  }

  private scoreDTI(income: number, monthlyDebt: number): number {
    const monthlyIncome = income / 12
    const dti = (monthlyDebt / monthlyIncome) * 100

    if (dti < 20) return 100
    if (dti < 28) return 90
    if (dti < 36) return 75
    if (dti < 43) return 60
    if (dti < 50) return 40
    return 20
  }

  private scoreDownPayment(downPayment: number, city: string): number {
    // Estimate typical home price for city (simplified)
    const typicalPrice = 300000 // Would use city data
    const percent = (downPayment / typicalPrice) * 100

    if (percent >= 20) return 100
    if (percent >= 15) return 85
    if (percent >= 10) return 70
    if (percent >= 5) return 55
    if (percent >= 3) return 40
    return 25
  }

  private scoreSavingsBuffer(additionalSavings: number, income: number): number {
    const monthlyExpenses = income / 12 * 0.7 // Estimate expenses
    const monthsBuffer = additionalSavings / monthlyExpenses

    if (monthsBuffer >= 6) return 100
    if (monthsBuffer >= 3) return 75
    if (monthsBuffer >= 1) return 50
    return 25
  }

  private async scoreMarketContext(input: HOSAInput): Promise<DomainScore> {
    // Simplified market scoring
    const marketScore = 70 // Would use real market data
    return {
      domain: 'market',
      score: marketScore,
      strengths: ['stable-market'],
      weaknesses: [],
      improvementPotential: 30,
    }
  }

  private scoreTransactionReadiness(input: HOSAInput): DomainScore {
    const timelineScores: Record<Timeline, number> = {
      exploring: 100,
      '1-year': 85,
      '6-months': 70,
      '3-months': 50,
    }

    const score = timelineScores[input.timeline] || 70

    return {
      domain: 'transaction',
      score,
      strengths: input.timeline === 'exploring' ? ['time-advantage'] : [],
      weaknesses: input.timeline === '3-months' ? ['rushed-timeline'] : [],
      improvementPotential: 100 - score,
    }
  }

  private scoreBehavioralProfile(input: HOSAInput): DomainScore {
    const negotiationScore = input.negotiationComfort * 10
    const riskScore = input.riskTolerance === 'aggressive' ? 60 : input.riskTolerance === 'moderate' ? 80 : 90

    const score = (negotiationScore + riskScore) / 2

    return {
      domain: 'behavioral',
      score,
      strengths: [],
      weaknesses: [],
      improvementPotential: 100 - score,
    }
  }

  private scoreNetworkStrength(input: HOSAInput): DomainScore {
    let score = 50

    if (input.hasRealtor) score += input.realtorQuality * 3
    if (input.hasLender) {
      if (input.lenderRelationship === 'preapproved') score += 20
      else if (input.lenderRelationship === 'prequalified') score += 10
    }
    if (input.familySupport === 'financial') score += 15
    else if (input.familySupport === 'advice') score += 5

    return {
      domain: 'network',
      score: Math.min(100, score),
      strengths: [],
      weaknesses: [],
      improvementPotential: 100 - score,
    }
  }

  private scoreExperience(input: HOSAInput): DomainScore {
    if (input.previousHomeOwnership) {
      const experienceScore = Math.min(100, input.previousHomeOwnership.yearsPriorOwnership * 10 + input.previousHomeOwnership.priorHomeSuccess * 5)
      return {
        domain: 'experience',
        score: experienceScore,
        strengths: ['prior-ownership'],
        weaknesses: [],
        improvementPotential: 100 - experienceScore,
      }
    }

    return {
      domain: 'experience',
      score: 30, // First-time buyer
      strengths: [],
      weaknesses: ['first-time'],
      improvementPotential: 70,
    }
  }

  /**
   * PATENT-WORTHY COMPONENT 2: Opportunity Identification
   */
  private identifyOpportunities(
    input: HOSAInput,
    scores: DomainScores
  ): OptimizationOpportunity[] {
    const opportunities: OptimizationOpportunity[] = []

    // Credit optimization
    if (scores.financial.weaknesses.includes('credit')) {
      opportunities.push(...this.generateCreditOpportunities(input, scores))
    }

    // Debt reduction
    if (scores.financial.weaknesses.includes('dti')) {
      opportunities.push(...this.generateDebtOpportunities(input, scores))
    }

    // Savings optimization
    if (scores.financial.weaknesses.includes('downPayment')) {
      opportunities.push(...this.generateSavingsOpportunities(input, scores))
    }

    // Negotiation opportunities (always applicable)
    opportunities.push(...this.generateNegotiationOpportunities(input, scores))

    // Market timing
    opportunities.push(...this.generateTimingOpportunities(input, scores))

    // Strategic opportunities
    opportunities.push(...this.generateStrategicOpportunities(input, scores))

    // Validate all opportunities before returning
    return opportunities.map(opp => this.validateOpportunity(opp))
  }

  private generateCreditOpportunities(input: HOSAInput, scores: DomainScores): OptimizationOpportunity[] {
    return [
      {
        id: 'credit-improvement',
        category: 'credit',
        title: 'Improve Credit Score',
        description: 'Increase your credit score to qualify for better rates',
        savingsPotential: {
          min: 5000,
          expected: 15000,
          max: 30000,
          confidence: 0.7,
        },
        effort: {
          timeRequired: 20,
          complexity: 'medium',
          skillRequired: [],
        },
        impact: {
          financialImpact: 15000,
          riskReduction: 20,
          speedIncrease: 0,
          stressReduction: 10,
        },
        dependencies: [],
        blockers: [],
        roiScore: 750, // 15000 / 20
        priorityScore: 80,
        urgencyScore: 60,
        actionSteps: [
          { id: '1', title: 'Check credit report', description: 'Review for errors', order: 1 },
          { id: '2', title: 'Pay down balances', description: 'Reduce credit utilization', order: 2 },
        ],
        resources: [],
        status: 'suggested',
      },
    ]
  }

  private generateDebtOpportunities(input: HOSAInput, scores: DomainScores): OptimizationOpportunity[] {
    return [
      {
        id: 'debt-reduction',
        category: 'debt',
        title: 'Reduce Monthly Debt',
        description: 'Lower your DTI ratio to improve loan terms',
        savingsPotential: {
          min: 3000,
          expected: 8000,
          max: 15000,
          confidence: 0.6,
        },
        effort: {
          timeRequired: 10,
          complexity: 'low',
          skillRequired: [],
        },
        impact: {
          financialImpact: 8000,
          riskReduction: 15,
          speedIncrease: 0,
          stressReduction: 20,
        },
        dependencies: [],
        blockers: [],
        roiScore: 800,
        priorityScore: 75,
        urgencyScore: 70,
        actionSteps: [],
        resources: [],
        status: 'suggested',
      },
    ]
  }

  private generateSavingsOpportunities(input: HOSAInput, scores: DomainScores): OptimizationOpportunity[] {
    return [
      {
        id: 'increase-down-payment',
        category: 'savings',
        title: 'Increase Down Payment',
        description: 'Save more to avoid PMI and get better rates',
        savingsPotential: {
          min: 2000,
          expected: 5000,
          max: 10000,
          confidence: 0.5,
        },
        effort: {
          timeRequired: 40,
          complexity: 'medium',
          skillRequired: [],
        },
        impact: {
          financialImpact: 5000,
          riskReduction: 10,
          speedIncrease: 0,
          stressReduction: 15,
        },
        dependencies: [],
        blockers: [],
        roiScore: 125,
        priorityScore: 60,
        urgencyScore: 50,
        actionSteps: [],
        resources: [],
        status: 'suggested',
      },
    ]
  }

  private generateNegotiationOpportunities(input: HOSAInput, scores: DomainScores): OptimizationOpportunity[] {
    return [
      {
        id: 'shop-lenders',
        category: 'negotiation',
        title: 'Shop Multiple Lenders',
        description: 'Compare offers from 3+ lenders to save on fees and rates',
        savingsPotential: {
          min: 2000,
          expected: 5000,
          max: 10000,
          confidence: 0.8,
        },
        effort: {
          timeRequired: 5,
          complexity: 'low',
          skillRequired: [],
        },
        impact: {
          financialImpact: 5000,
          riskReduction: 5,
          speedIncrease: 0,
          stressReduction: 5,
        },
        dependencies: [],
        blockers: [],
        roiScore: 1000,
        priorityScore: 90,
        urgencyScore: 80,
        actionSteps: [],
        resources: [],
        status: 'suggested',
      },
      {
        id: 'negotiate-closing-costs',
        category: 'negotiation',
        title: 'Negotiate Closing Costs',
        description: 'Many closing costs are negotiable - push back on junk fees',
        savingsPotential: {
          min: 1000,
          expected: 3000,
          max: 6000,
          confidence: 0.7,
        },
        effort: {
          timeRequired: 3,
          complexity: 'low',
          skillRequired: [],
        },
        impact: {
          financialImpact: 3000,
          riskReduction: 0,
          speedIncrease: 0,
          stressReduction: 10,
        },
        dependencies: ['shop-lenders'],
        blockers: [],
        roiScore: 1000,
        priorityScore: 85,
        urgencyScore: 70,
        actionSteps: [],
        resources: [],
        status: 'suggested',
      },
    ]
  }

  private generateTimingOpportunities(input: HOSAInput, scores: DomainScores): OptimizationOpportunity[] {
    return [
      {
        id: 'optimal-timing',
        category: 'timing',
        title: 'Optimize Purchase Timing',
        description: 'Time your purchase for better market conditions',
        savingsPotential: {
          min: 0,
          expected: 5000,
          max: 20000,
          confidence: 0.4,
        },
        effort: {
          timeRequired: 2,
          complexity: 'low',
          skillRequired: [],
        },
        impact: {
          financialImpact: 5000,
          riskReduction: 10,
          speedIncrease: -30, // May delay purchase
          stressReduction: 5,
        },
        dependencies: [],
        blockers: [],
        roiScore: 2500,
        priorityScore: 50,
        urgencyScore: 30,
        actionSteps: [],
        resources: [],
        status: 'suggested',
      },
    ]
  }

  private generateStrategicOpportunities(input: HOSAInput, scores: DomainScores): OptimizationOpportunity[] {
    // Return empty array - no strategic opportunities for now
    // All opportunities should have effort property if added here
    return []
  }
  
  /**
   * Validate and fix opportunity structure
   */
  private validateOpportunity(opp: OptimizationOpportunity): OptimizationOpportunity {
    // Ensure effort exists
    if (!opp.effort || typeof opp.effort.timeRequired !== 'number') {
      opp.effort = {
        timeRequired: 1,
        complexity: 'medium',
        skillRequired: [],
      }
    }
    
    // Ensure savingsPotential exists
    if (!opp.savingsPotential) {
      opp.savingsPotential = {
        min: 0,
        expected: 0,
        max: 0,
        confidence: 0,
      }
    }
    
    // Ensure impact exists
    if (!opp.impact) {
      opp.impact = {
        financialImpact: 0,
        riskReduction: 0,
        speedIncrease: 0,
        stressReduction: 0,
      }
    }
    
    // Ensure arrays exist
    if (!opp.dependencies) opp.dependencies = []
    if (!opp.blockers) opp.blockers = []
    if (!opp.actionSteps) opp.actionSteps = []
    if (!opp.resources) opp.resources = []
    
    // Initialize scores if missing
    if (typeof opp.roiScore !== 'number') opp.roiScore = 0
    if (typeof opp.priorityScore !== 'number') opp.priorityScore = 0
    if (typeof opp.urgencyScore !== 'number') opp.urgencyScore = 0
    
    // Ensure status
    if (!opp.status) opp.status = 'suggested'
    
    return opp
  }

  /**
   * PATENT-WORTHY COMPONENT 3: Multi-Objective Ranking
   */
  private rankOpportunities(
    opportunities: OptimizationOpportunity[],
    riskTolerance: string,
    timeline: Timeline,
    concern: Concern
  ): OptimizationOpportunity[] {
    // Validate all opportunities first using the dedicated validation function
    // This ensures all required properties exist before we try to access them
    const validatedOpportunities = opportunities.map(opp => this.validateOpportunity(opp))
    
    // Calculate multi-dimensional scores (all properties are now guaranteed to exist)
    validatedOpportunities.forEach((opp) => {
      // ROI Score
      opp.roiScore = opp.savingsPotential.expected / Math.max(opp.effort.timeRequired, 0.1)

      // Priority Score (weighted by concern)
      const weights = this.getWeightsForConcern(concern)
      opp.priorityScore =
        opp.impact.financialImpact * weights.financial +
        opp.impact.riskReduction * weights.risk +
        opp.impact.speedIncrease * weights.speed +
        opp.impact.stressReduction * weights.stress

      // Urgency Score
      opp.urgencyScore = this.calculateUrgency(opp, timeline)
    })

    // Normalize scores to 0-100 range
    const maxRoi = Math.max(...validatedOpportunities.map((o) => o.roiScore), 1)
    const maxPriority = Math.max(...validatedOpportunities.map((o) => o.priorityScore), 1)
    const maxUrgency = Math.max(...validatedOpportunities.map((o) => o.urgencyScore), 1)

    validatedOpportunities.forEach((opp) => {
      opp.roiScore = (opp.roiScore / maxRoi) * 100
      opp.priorityScore = (opp.priorityScore / maxPriority) * 100
      opp.urgencyScore = (opp.urgencyScore / maxUrgency) * 100
    })

    // Sort by composite score
    return validatedOpportunities.sort((a, b) => {
      const scoreA = a.roiScore * 0.4 + a.priorityScore * 0.4 + a.urgencyScore * 0.2
      const scoreB = b.roiScore * 0.4 + b.priorityScore * 0.4 + b.urgencyScore * 0.2
      return scoreB - scoreA
    })
  }

  private getWeightsForConcern(concern: Concern): { financial: number; risk: number; speed: number; stress: number } {
    const weightMap: Record<Concern, { financial: number; risk: number; speed: number; stress: number }> = {
      affording: { financial: 0.5, risk: 0.2, speed: 0.1, stress: 0.2 },
      'hidden-costs': { financial: 0.4, risk: 0.3, speed: 0.1, stress: 0.2 },
      'ripped-off': { financial: 0.3, risk: 0.4, speed: 0.1, stress: 0.2 },
      'wrong-choice': { financial: 0.2, risk: 0.5, speed: 0.1, stress: 0.2 },
      timing: { financial: 0.2, risk: 0.2, speed: 0.4, stress: 0.2 },
      other: { financial: 0.3, risk: 0.3, speed: 0.2, stress: 0.2 },
    }
    return weightMap[concern] || { financial: 0.3, risk: 0.3, speed: 0.2, stress: 0.2 }
  }

  private calculateUrgency(opp: OptimizationOpportunity, timeline: Timeline): number {
    const timelineUrgency: Record<Timeline, number> = {
      '3-months': 90,
      '6-months': 70,
      '1-year': 50,
      exploring: 30,
    }

    const baseUrgency = timelineUrgency[timeline] || 50

    // Adjust based on opportunity type
    if (opp.category === 'credit' && timeline === '3-months') return 95 // Very urgent
    if (opp.category === 'negotiation') return Math.max(baseUrgency, 70) // Always somewhat urgent

    return baseUrgency
  }

  /**
   * PATENT-WORTHY COMPONENT 4: Temporal Optimization
   */
  private generateActionSequence(
    opportunities: OptimizationOpportunity[],
    timeline: Timeline,
    scores: DomainScores
  ): ActionSequence[] {
    const sequences: ActionSequence[] = []
    const timelineWeeks = this.getTimelineWeeks(timeline)

    // Build dependency graph
    const graph = this.buildDependencyGraph(opportunities)
    const sorted = this.topologicalSort(graph)

    let currentWeek = 0
    const processed = new Set<string>()

    while (sorted.length > 0 && currentWeek < timelineWeeks) {
      const available = sorted.filter(
        (opp) => !processed.has(opp.id) && this.allDependenciesMet(opp, sequences, processed)
      )

      const weeklyActions = this.selectOptimalWeeklyActions(available, currentWeek, 3)

      if (weeklyActions.length > 0) {
        const actions: Action[] = weeklyActions.map((opp) => this.convertToAction(opp))

        sequences.push({
          sequenceId: `week-${currentWeek}`,
          phase: this.determinePhase(currentWeek, timelineWeeks),
          weekNumber: currentWeek,
          actions,
          parallelizable: weeklyActions.length > 1,
          criticalPath: weeklyActions.some((a) => a.urgencyScore > 80),
          optimalStartDate: this.calculateOptimalStart(currentWeek),
          deadline: this.calculateDeadline(weeklyActions, currentWeek, timelineWeeks),
          requires: [],
          enables: weeklyActions.map((a) => a.id),
          estimatedCompletion: 0,
          actualCompletion: 0,
          status: 'pending',
        })

        weeklyActions.forEach((opp) => {
          processed.add(opp.id)
          const index = sorted.indexOf(opp)
          if (index > -1) sorted.splice(index, 1)
        })
      }

      currentWeek++
    }

    return sequences
  }

  private buildDependencyGraph(opportunities: OptimizationOpportunity[]): Map<string, string[]> {
    const graph = new Map<string, string[]>()
    opportunities.forEach((opp) => {
      graph.set(opp.id, opp.dependencies || [])
    })
    return graph
  }

  private topologicalSort(graph: Map<string, string[]>): OptimizationOpportunity[] {
    // Simplified topological sort - in production would be more sophisticated
    const opportunities: OptimizationOpportunity[] = []
    graph.forEach((_, id) => {
      // Would look up opportunity by id
      opportunities.push({ id } as OptimizationOpportunity)
    })
    return opportunities
  }

  private allDependenciesMet(
    opp: OptimizationOpportunity,
    sequences: ActionSequence[],
    processed: Set<string>
  ): boolean {
    if (!opp.dependencies || opp.dependencies.length === 0) return true
    return opp.dependencies.every((depId) => processed.has(depId))
  }

  private selectOptimalWeeklyActions(
    available: OptimizationOpportunity[],
    week: number,
    maxActions: number
  ): OptimizationOpportunity[] {
    // Sort by priority and select top N
    return available
      .sort((a, b) => {
        const scoreA = a.roiScore * 0.4 + a.priorityScore * 0.4 + a.urgencyScore * 0.2
        const scoreB = b.roiScore * 0.4 + b.priorityScore * 0.4 + b.urgencyScore * 0.2
        return scoreB - scoreA
      })
      .slice(0, maxActions)
  }

  private convertToAction(opp: OptimizationOpportunity): Action {
    // Validate all required properties (should already be validated, but double-check)
    const validatedOpp = this.validateOpportunity(opp)
    
    return {
      id: validatedOpp.id,
      title: validatedOpp.title,
      description: validatedOpp.description,
      category: validatedOpp.category,
      timeEstimate: validatedOpp.effort.timeRequired * 60, // Convert hours to minutes
      difficulty: validatedOpp.effort.complexity === 'low' ? 3 : validatedOpp.effort.complexity === 'medium' ? 6 : 9,
      resources: validatedOpp.resources || [],
      xpReward: Math.floor(validatedOpp.savingsPotential.expected / 100), // 1 XP per $100 saved
      badgeUnlock: undefined,
      streakEligible: false,
      verificationMethod: 'self-report',
    }
  }

  private determinePhase(week: number, totalWeeks: number): 'preparation' | 'execution' | 'closing' | 'post-purchase' {
    if (week < totalWeeks * 0.3) return 'preparation'
    if (week < totalWeeks * 0.8) return 'execution'
    if (week < totalWeeks) return 'closing'
    return 'post-purchase'
  }

  private calculateOptimalStart(week: number): string {
    const date = new Date()
    date.setDate(date.getDate() + week * 7)
    return date.toISOString().split('T')[0]
  }

  private calculateDeadline(actions: OptimizationOpportunity[], week: number, totalWeeks: number): string {
    const validActions = actions.filter(a => a.effort && typeof a.effort.timeRequired === 'number')
    if (validActions.length === 0) {
      // Default to 1 week if no valid actions
      const date = new Date()
      date.setDate(date.getDate() + (week + 1) * 7)
      return date.toISOString().split('T')[0]
    }
    const avgTime = validActions.reduce((sum, a) => sum + a.effort.timeRequired, 0) / validActions.length
    const deadlineWeek = Math.min(week + Math.ceil(avgTime / 40), totalWeeks) // Assume 40 hours/week available
    const date = new Date()
    date.setDate(date.getDate() + deadlineWeek * 7)
    return date.toISOString().split('T')[0]
  }

  private getTimelineWeeks(timeline: Timeline): number {
    const weekMap: Record<Timeline, number> = {
      '3-months': 12,
      '6-months': 24,
      '1-year': 52,
      exploring: 78, // 18 months
    }
    return weekMap[timeline] || 24
  }

  /**
   * PATENT-WORTHY COMPONENT 5: Predictive Modeling
   */
  private async runPredictions(input: HOSAInput, actionPlan: ActionSequence[]): Promise<Predictions> {
    // Simplified Monte Carlo simulation (would run 10,000 in production)
    const simulations = 100 // Reduced for performance
    const results: SimulationResult[] = []

    for (let i = 0; i < simulations; i++) {
      const scenario = this.generateScenario(input, i)
      const outcome = this.simulateExecution(scenario, actionPlan)
      results.push(outcome)
    }

    const successCount = results.filter((r) => r.success).length
    const avgSavings = results.reduce((sum, r) => sum + r.savings, 0) / simulations
    const avgDays = results.reduce((sum, r) => sum + r.daysToClose, 0) / simulations

    const dealRiskScore = await this.predictDealRisk(input, actionPlan)
    const marketTimingScore = await this.assessMarketTiming(input.targetCity)
    const negotiationPowerScore = this.calculateNegotiationPower(input)

    return {
      successProbability: successCount / simulations,
      estimatedClosingDate: this.formatDate(Date.now() + avgDays * 86400000),
      dealRiskScore,
      marketTimingScore,
      negotiationPowerScore,
    }
  }

  private generateScenario(input: HOSAInput, seed: number): HOSAInput {
    // Simplified scenario generation
    return { ...input }
  }

  private simulateExecution(scenario: HOSAInput, actionPlan: ActionSequence[]): SimulationResult {
    // Simplified simulation
    const baseSuccess = 0.7
    const success = Math.random() > 1 - baseSuccess
    const savings = success ? 5000 + Math.random() * 15000 : 0
    const daysToClose = 30 + Math.random() * 60

    return {
      success,
      savings,
      daysToClose,
    }
  }

  private async predictDealRisk(input: HOSAInput, actionPlan: ActionSequence[]): Promise<number> {
    // Simplified risk prediction
    let risk = 50

    if (input.timeline === '3-months') risk += 20
    if (input.creditScore === 'under-600') risk += 15
    if (!input.hasLender) risk += 10
    if (!input.hasRealtor) risk += 5

    return Math.min(100, Math.max(0, risk))
  }

  private async assessMarketTiming(city: string): Promise<number> {
    // Simplified market timing (would use real data)
    return 70
  }

  private calculateNegotiationPower(input: HOSAInput): number {
    let power = 50

    if (input.downPayment > 50000) power += 15
    if (input.creditScore === '750+') power += 10
    if (input.hasLender && input.lenderRelationship === 'preapproved') power += 10
    if (input.timeline === 'exploring') power += 10 // Not in a rush

    return Math.min(100, Math.max(0, power))
  }

  private formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  /**
   * Strategy Synthesis
   */
  private synthesizeStrategy(
    input: HOSAInput,
    scores: DomainScores,
    predictions: Predictions
  ): {
    primaryApproach: string
    fallbackApproach: string
    redFlags: string[]
    advantages: string[]
    timeline: TimelineStrategy
  } {
    const primaryApproach = this.determinePrimaryApproach(input, scores, predictions)
    const fallbackApproach = this.determineFallbackApproach(input, scores)
    const redFlags = this.identifyRedFlags(input, scores, predictions)
    const advantages = this.identifyAdvantages(input, scores)
    const timeline = this.calculateTimelineStrategy(input)

    return {
      primaryApproach,
      fallbackApproach,
      redFlags,
      advantages,
      timeline,
    }
  }

  private determinePrimaryApproach(input: HOSAInput, scores: DomainScores, predictions: Predictions): string {
    if (scores.financial.score < 60) {
      return 'Focus on improving financial foundation before purchasing. Prioritize credit improvement and debt reduction.'
    }
    if (predictions.dealRiskScore > 70) {
      return 'High-risk scenario. Consider extending timeline or adjusting expectations to reduce risk.'
    }
    if (input.timeline === '3-months') {
      return 'Aggressive timeline. Focus on quick wins: shop lenders, negotiate fees, secure pre-approval immediately.'
    }
    return 'Standard approach. Follow week-by-week action plan to maximize savings and minimize risk.'
  }

  private determineFallbackApproach(input: HOSAInput, scores: DomainScores): string {
    return 'If primary approach fails, extend timeline by 3-6 months and focus on financial improvements.'
  }

  private identifyRedFlags(input: HOSAInput, scores: DomainScores, predictions: Predictions): string[] {
    const flags: string[] = []

    if (scores.financial.score < 50) flags.push('Weak financial profile - high risk of loan denial')
    if (predictions.dealRiskScore > 75) flags.push('High deal risk - consider delaying purchase')
    if (input.timeline === '3-months' && scores.financial.score < 70) flags.push('Rushed timeline with weak finances')
    if (!input.hasLender && input.timeline === '3-months') flags.push('No lender relationship with tight timeline')

    return flags
  }

  private identifyAdvantages(input: HOSAInput, scores: DomainScores): string[] {
    const advantages: string[] = []

    if (scores.financial.score > 80) advantages.push('Strong financial position')
    if (input.timeline === 'exploring') advantages.push('Time advantage - can optimize before buying')
    if (input.hasLender && input.lenderRelationship === 'preapproved') advantages.push('Pre-approved - stronger negotiating position')
    if (input.downPayment > 50000) advantages.push('Strong down payment - better loan terms')

    return advantages
  }

  private calculateTimelineStrategy(input: HOSAInput): TimelineStrategy {
    const totalWeeks = this.getTimelineWeeks(input.timeline)
    const preparationWeeks = Math.floor(totalWeeks * 0.3)
    const executionWeeks = Math.floor(totalWeeks * 0.5)
    const closingWeeks = totalWeeks - preparationWeeks - executionWeeks

    return {
      preparationWeeks,
      executionWeeks,
      closingWeeks,
      totalWeeks,
      milestones: [
        'Week 0: Complete assessment',
        `Week ${preparationWeeks}: Financial improvements complete`,
        `Week ${preparationWeeks + executionWeeks}: Home search complete`,
        `Week ${totalWeeks}: Closing`,
      ],
    }
  }

  private defineCheckpoints(timeline: Timeline, actionPlan: ActionSequence[]): Checkpoint[] {
    const checkpoints: Checkpoint[] = [
      {
        id: 'mid-point',
        weekNumber: Math.floor(this.getTimelineWeeks(timeline) / 2),
        trigger: 'Progress update',
        action: 're-run-algorithm',
        conditions: ['financial-changes', 'market-changes'],
      },
    ]
    return checkpoints
  }

  private calculateOptimizationScore(
    scores: DomainScores,
    opportunities: OptimizationOpportunity[],
    predictions: Predictions
  ): number {
    const avgDomainScore =
      (scores.financial.score +
        scores.market.score +
        scores.transaction.score +
        scores.behavioral.score +
        scores.network.score +
        scores.experience.score) /
      6

    const opportunityScore = Math.min(100, (opportunities.length / 10) * 100)
    const predictionScore = predictions.successProbability * 100

    return (avgDomainScore * 0.5 + opportunityScore * 0.3 + predictionScore * 0.2)
  }

  private calculateTotalSavings(opportunities: OptimizationOpportunity[]): {
    conservative: number
    expected: number
    optimistic: number
  } {
    // Filter and validate opportunities
    const validOpportunities = opportunities.filter(opp => {
      if (!opp || !opp.savingsPotential) {
        console.warn('Invalid opportunity in calculateTotalSavings:', opp)
        return false
      }
      return true
    })
    
    if (validOpportunities.length === 0) {
      return { conservative: 0, expected: 0, optimistic: 0 }
    }
    
    const conservative = validOpportunities.reduce((sum, opp) => {
      const min = opp.savingsPotential?.min || 0
      return sum + min
    }, 0)
    
    const expected = validOpportunities.reduce((sum, opp) => {
      const exp = opp.savingsPotential?.expected || 0
      return sum + exp
    }, 0)
    
    const optimistic = validOpportunities.reduce((sum, opp) => {
      const max = opp.savingsPotential?.max || 0
      return sum + max
    }, 0)

    return { conservative, expected, optimistic }
  }

  private identifyCriticalPath(actionPlan: ActionSequence[]): string[] {
    return actionPlan.filter((seq) => seq.criticalPath).flatMap((seq) => seq.actions.map((a) => a.id))
  }

  private calculateThresholds(input: HOSAInput, scores: DomainScores): { [key: string]: number } {
    return {
      minCreditScore: 650,
      maxDTI: 43,
      minDownPayment: input.downPayment * 0.8,
      riskThreshold: 70,
    }
  }

  /**
   * PATENT-WORTHY COMPONENT 6: Continuous Learning
   */
  async recordOutcome(
    userId: string,
    opportunityId: string,
    actualSavings: number,
    completionTime: number,
    difficulty: number
  ): Promise<void> {
    // Store outcome for learning (would use database in production)
    console.log('Recording outcome:', { userId, opportunityId, actualSavings, completionTime, difficulty })
    // In production: await database.storeOutcome({ ... })
  }
}

// Export singleton instance
export const HOSA = new HOSAEngine()

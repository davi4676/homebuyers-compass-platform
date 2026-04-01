/**
 * Utilities for converting quiz data to HOSA input
 */

import type { QuizData } from './calculations';
import type { HOSAInput } from './algorithm/hosa-core';

/**
 * Convert basic quiz data to HOSA input with defaults
 */
export function quizDataToHOSAInput(quizData: QuizData, additionalData?: Partial<HOSAInput>): HOSAInput {
  // Determine transaction type from agent status
  const transactionType: HOSAInput['transactionType'] = 
    quizData.agentStatus === 'have-agent' ? 'repeat-buyer' : 'first-time';

  return {
    // Financial Profile
    income: quizData.income,
    monthlyDebt: quizData.monthlyDebt,
    creditScore: quizData.creditScore,
    downPayment: quizData.downPayment,
    additionalSavings: quizData.downPayment * 0.5, // Estimate
    employmentStability: 7, // Default
    incomeGrowthProjection: 3, // Default 3% annual

    // Market Context
    targetCity: quizData.city,
    propertyType: 'sfh', // Default
    marketVelocity: 45, // Default days on market
    seasonality: 0.5, // Default
    competitionIndex: 5, // Default moderate
    priceAppreciationRate: 3, // Default 3% annual

    // Transaction Context
    transactionType,
    timeline: quizData.timeline,
    urgency: quizData.timeline === '3-months' ? 'high' : quizData.timeline === '6-months' ? 'medium' : 'low',
    flexibility: 5, // Default moderate

    // Behavioral Profile
    riskTolerance: 'moderate', // Default
    negotiationComfort: 5, // Default
    decisionMakingSpeed: 'medium', // Default
    primaryConcern: quizData.concern,
    mustHaveFeatures: [],
    niceToHaveFeatures: [],

    // Network Effect
    hasRealtor: quizData.agentStatus === 'have-agent',
    realtorQuality: quizData.agentStatus === 'have-agent' ? 7 : 0,
    hasLender: false, // Default
    lenderRelationship: 'none',
    familySupport: 'none', // Default

    // Override with additional data if provided
    ...additionalData,
  };
}


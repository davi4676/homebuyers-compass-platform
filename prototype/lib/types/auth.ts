/**
 * Authentication & User Types
 * Defines types for user authentication, profiles, and data collection
 */

import type { UserTier } from '../tiers'

/** Same ids as `UserTier` in `lib/tiers` (Foundations, Momentum, Navigator, Navigator+). */
export type SubscriptionTier = UserTier
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'trialing';
export type TransactionType = 'first-time' | 'repeat-buyer' | 'refinance';

export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;

  // Account
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  onboardingCompleted: boolean;
  profileCompletionPercent: number;

  // Subscription
  subscriptionTier: SubscriptionTier;
  subscriptionStatus: SubscriptionStatus;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;

  // Demographics
  dateOfBirth?: string;
  ageRange?: string;
  gender?: string;
  maritalStatus?: string;

  // Location
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country: string;

  // Employment
  employmentStatus?: string;
  occupation?: string;
  employerName?: string;
  yearsAtCurrentJob?: number;

  // Financial
  annualIncomeRange?: string;

  // Co-borrower
  hasCoBorrower: boolean;
  coBorrowerRelationship?: string;

  // Preferences
  preferredContactMethod?: string;
  marketingEmailsOptIn: boolean;
  smsOptIn: boolean;
  timezone: string;

  // Compliance
  termsAcceptedAt?: string;
  privacyPolicyAcceptedAt?: string;
  dataSharingConsent: boolean;

  // Attribution
  referralSource?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referredByUserId?: string;
}

export interface CoBorrower {
  id: string;
  primaryUserId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  relationship: string;
  isOnTitle: boolean;
  isOnLoan: boolean;
  dateOfBirth?: string;
  employmentStatus?: string;
  employerName?: string;
  occupation?: string;
  yearsAtCurrentJob?: number;
  annualIncome?: number;
  monthlyDebtPayments?: number;
  creditScoreRange?: string;
  hasSeparateAssets: boolean;
  status: 'active' | 'removed' | 'declined-to-participate';
  invitedAt: string;
  acceptedAt?: string;
}

export interface QuizResult {
  id: string;
  userId?: string;
  transactionType: TransactionType;
  quizVersion: string;

  // Inputs
  annualIncome?: number;
  monthlyDebt?: number;
  downPaymentSaved?: number;
  additionalSavings?: number;
  currentHomeValue?: number;
  currentMortgageBalance?: number;
  yearsOwned?: number;
  currentInterestRate?: number;
  remainingTermMonths?: number;
  currentMonthlyPayment?: number;
  targetCity?: string;
  targetState?: string;
  timeline?: string;
  creditScoreRange?: string;
  agentStatus?: string;
  primaryConcern?: string;
  hasCoBorrower: boolean;

  // Results
  readinessScore?: number;
  affordabilityResults?: any;
  optimizationResults?: any;
  scenarioComparisons?: any;
  savingsOpportunities?: any;
  actionPlan?: any;

  // Metadata
  completedAt: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  referralSource?: string;
}

export interface UserProgress {
  id: string;
  userId: string;
  totalXp: number;
  currentLevel: number;
  badgesEarned: string[];
  achievements: any[];
  currentStreakDays: number;
  longestStreakDays: number;
  lastActivityDate?: string;
  milestonesCompleted: string[];
  currentMilestone?: string;
  milestoneProgress: number;
  actionsCompleted: number;
  actionsTotal?: number;
}

export interface RegistrationData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  acceptedTerms: boolean;
  acceptedPrivacy: boolean;
  marketingOptIn?: boolean;
  referralSource?: string;
  utmParams?: {
    source?: string;
    medium?: string;
    campaign?: string;
  };
}

export interface DemographicData {
  dateOfBirth?: string;
  ageRange?: string;
  gender?: string;
  maritalStatus?: string;
  hasCoBorrower?: boolean;
  coBorrowerRelationship?: string;
  employmentStatus?: string;
  occupation?: string;
  employerName?: string;
  yearsAtCurrentJob?: number;
  annualIncomeRange?: string;
}

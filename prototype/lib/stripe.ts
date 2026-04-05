/**
 * Stripe integration for tier-based monetization.
 * Foundations: no Stripe. Paid: Momentum, Navigator+, Concierge+.
 */

import type { UserTier } from './tiers'

export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  secretKey: process.env.STRIPE_SECRET_KEY || '',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
}

/** True when server can create checkout sessions. */
export function isStripeSecretConfigured(): boolean {
  return Boolean(STRIPE_CONFIG.secretKey?.trim())
}

export type BillingCycle = 'monthly' | 'yearly' | 'one-time'

export type SubscriptionPlan = {
  id: string
  tier: UserTier
  name: string
  priceId: string | null
  amount: number
  currency: string
  interval: 'month' | 'year' | 'one-time'
}

function momentumMonthlyId(): string {
  return (
    process.env.STRIPE_PRICE_MOMENTUM_MONTHLY ||
    process.env.STRIPE_PRICE_ID_MONTHLY ||
    process.env.STRIPE_PRICE_PREMIUM_MONTHLY ||
    ''
  )
}

function momentumAnnualId(): string {
  return (
    process.env.STRIPE_PRICE_MOMENTUM_ANNUAL ||
    process.env.STRIPE_PRICE_MOMENTUM_YEARLY ||
    process.env.STRIPE_PRICE_ID_YEARLY ||
    process.env.STRIPE_PRICE_PREMIUM_YEARLY ||
    ''
  )
}

function navigatorMonthlyId(): string {
  return process.env.STRIPE_PRICE_NAVIGATOR_MONTHLY || process.env.STRIPE_PRICE_PRO_MONTHLY || ''
}

function navigatorAnnualId(): string {
  return (
    process.env.STRIPE_PRICE_NAVIGATOR_ANNUAL ||
    process.env.STRIPE_PRICE_NAVIGATOR_YEARLY ||
    process.env.STRIPE_PRICE_PRO_YEARLY ||
    ''
  )
}

function conciergeMonthlyId(): string {
  return (
    process.env.STRIPE_PRICE_CONCIERGE_MONTHLY ||
    process.env.STRIPE_PRICE_NAVIGATOR_PLUS_MONTHLY ||
    process.env.STRIPE_PRICE_PROPLUS_MONTHLY ||
    ''
  )
}

function conciergeAnnualId(): string {
  return (
    process.env.STRIPE_PRICE_CONCIERGE_ANNUAL ||
    process.env.STRIPE_PRICE_NAVIGATOR_PLUS_ANNUAL ||
    process.env.STRIPE_PRICE_NAVIGATOR_PLUS_YEARLY ||
    process.env.STRIPE_PRICE_PROPLUS_YEARLY ||
    ''
  )
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'momentum-monthly',
    tier: 'momentum',
    name: 'Momentum Monthly',
    priceId: momentumMonthlyId() || null,
    amount: 2900,
    currency: 'usd',
    interval: 'month',
  },
  {
    id: 'momentum-annual',
    tier: 'momentum',
    name: 'Momentum Annual',
    priceId: momentumAnnualId() || null,
    amount: 27800,
    currency: 'usd',
    interval: 'year',
  },
  {
    id: 'navigator-monthly',
    tier: 'navigator',
    name: 'Navigator+ Monthly',
    priceId: navigatorMonthlyId() || null,
    amount: 5900,
    currency: 'usd',
    interval: 'month',
  },
  {
    id: 'navigator-annual',
    tier: 'navigator',
    name: 'Navigator+ Annual',
    priceId: navigatorAnnualId() || null,
    amount: 56600,
    currency: 'usd',
    interval: 'year',
  },
  {
    id: 'concierge-monthly',
    tier: 'navigator_plus',
    name: 'Concierge+ Monthly',
    priceId: conciergeMonthlyId() || null,
    amount: 14900,
    currency: 'usd',
    interval: 'month',
  },
  {
    id: 'concierge-annual',
    tier: 'navigator_plus',
    name: 'Concierge+ Annual',
    priceId: conciergeAnnualId() || null,
    amount: 143000,
    currency: 'usd',
    interval: 'year',
  },
]

const TIER_PRICE_IDS: Record<UserTier, Record<BillingCycle, string>> = {
  foundations: { monthly: '', yearly: '', 'one-time': '' },
  momentum: {
    monthly:
      process.env.STRIPE_PRICE_MOMENTUM_MONTHLY ||
      process.env.STRIPE_PRICE_PREMIUM_MONTHLY ||
      process.env.STRIPE_PRICE_ID_MONTHLY ||
      '',
    yearly:
      process.env.STRIPE_PRICE_MOMENTUM_ANNUAL ||
      process.env.STRIPE_PRICE_MOMENTUM_YEARLY ||
      process.env.STRIPE_PRICE_PREMIUM_YEARLY ||
      process.env.STRIPE_PRICE_ID_YEARLY ||
      '',
    'one-time': process.env.STRIPE_PRICE_MOMENTUM_ONETIME || process.env.STRIPE_PRICE_PREMIUM_ONETIME || '',
  },
  navigator: {
    monthly: process.env.STRIPE_PRICE_NAVIGATOR_MONTHLY || process.env.STRIPE_PRICE_PRO_MONTHLY || '',
    yearly:
      process.env.STRIPE_PRICE_NAVIGATOR_ANNUAL ||
      process.env.STRIPE_PRICE_NAVIGATOR_YEARLY ||
      process.env.STRIPE_PRICE_PRO_YEARLY ||
      '',
    'one-time': process.env.STRIPE_PRICE_NAVIGATOR_ONETIME || process.env.STRIPE_PRICE_PRO_ONETIME || '',
  },
  navigator_plus: {
    monthly:
      process.env.STRIPE_PRICE_CONCIERGE_MONTHLY ||
      process.env.STRIPE_PRICE_NAVIGATOR_PLUS_MONTHLY ||
      process.env.STRIPE_PRICE_PROPLUS_MONTHLY ||
      '',
    yearly:
      process.env.STRIPE_PRICE_CONCIERGE_ANNUAL ||
      process.env.STRIPE_PRICE_NAVIGATOR_PLUS_ANNUAL ||
      process.env.STRIPE_PRICE_NAVIGATOR_PLUS_YEARLY ||
      process.env.STRIPE_PRICE_PROPLUS_YEARLY ||
      '',
    'one-time':
      process.env.STRIPE_PRICE_CONCIERGE_ONETIME ||
      process.env.STRIPE_PRICE_NAVIGATOR_PLUS_ONETIME ||
      process.env.STRIPE_PRICE_PROPLUS_ONETIME ||
      '',
  },
}

/** Cents — aligned with `lib/tiers.ts` (monthly list, yearly = 20% off 12× monthly, one-time). */
export const TIER_AMOUNTS: Record<UserTier, Record<BillingCycle, number>> = {
  foundations: { monthly: 0, yearly: 0, 'one-time': 0 },
  momentum: { monthly: 2900, yearly: 27800, 'one-time': 11900 },
  navigator: { monthly: 5900, yearly: 56600, 'one-time': 22900 },
  navigator_plus: { monthly: 14900, yearly: 143000, 'one-time': 54900 },
}

export function getPriceIdForTier(tier: UserTier, cycle: BillingCycle): string | null {
  const id = TIER_PRICE_IDS[tier]?.[cycle]
  return id || null
}

export function getPlanForCheckout(tier: UserTier, cycle: BillingCycle): SubscriptionPlan | null {
  if (tier === 'foundations') return null
  const priceId = getPriceIdForTier(tier, cycle)
  const amounts = TIER_AMOUNTS[tier]
  const amount = amounts?.[cycle] ?? 0
  const interval = cycle === 'one-time' ? 'one-time' : cycle === 'monthly' ? 'month' : 'year'
  const defName = tier === 'navigator_plus' ? 'Concierge+' : tier === 'navigator' ? 'Navigator+' : 'Momentum'
  const name = `${defName} ${cycle === 'one-time' ? 'One-time' : cycle === 'monthly' ? 'Monthly' : 'Yearly'}`
  return {
    id: `${tier}-${cycle}`,
    tier,
    name,
    priceId,
    amount,
    currency: 'usd',
    interval,
  }
}

export function formatStripeAmount(amount: number): string {
  return (amount / 100).toFixed(2)
}

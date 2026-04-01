/**
 * Stripe integration for tier-based monetization.
 * Foundations: no Stripe. Paid: Momentum, Navigator, Navigator+.
 */

import type { UserTier } from './tiers'

export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  secretKey: process.env.STRIPE_SECRET_KEY || '',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
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

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'monthly',
    tier: 'momentum',
    name: 'Momentum Monthly',
    priceId:
      process.env.STRIPE_PRICE_MOMENTUM_MONTHLY ||
      process.env.STRIPE_PRICE_ID_MONTHLY ||
      process.env.STRIPE_PRICE_PREMIUM_MONTHLY ||
      null,
    amount: 1400,
    currency: 'usd',
    interval: 'month',
  },
  {
    id: 'yearly',
    tier: 'momentum',
    name: 'Momentum Yearly',
    priceId:
      process.env.STRIPE_PRICE_MOMENTUM_YEARLY ||
      process.env.STRIPE_PRICE_ID_YEARLY ||
      process.env.STRIPE_PRICE_PREMIUM_YEARLY ||
      null,
    amount: 14000,
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
      process.env.STRIPE_PRICE_MOMENTUM_YEARLY ||
      process.env.STRIPE_PRICE_PREMIUM_YEARLY ||
      process.env.STRIPE_PRICE_ID_YEARLY ||
      '',
    'one-time': process.env.STRIPE_PRICE_MOMENTUM_ONETIME || process.env.STRIPE_PRICE_PREMIUM_ONETIME || '',
  },
  navigator: {
    monthly: process.env.STRIPE_PRICE_NAVIGATOR_MONTHLY || process.env.STRIPE_PRICE_PRO_MONTHLY || '',
    yearly: process.env.STRIPE_PRICE_NAVIGATOR_YEARLY || process.env.STRIPE_PRICE_PRO_YEARLY || '',
    'one-time': process.env.STRIPE_PRICE_NAVIGATOR_ONETIME || process.env.STRIPE_PRICE_PRO_ONETIME || '',
  },
  navigator_plus: {
    monthly: process.env.STRIPE_PRICE_NAVIGATOR_PLUS_MONTHLY || process.env.STRIPE_PRICE_PROPLUS_MONTHLY || '',
    yearly: process.env.STRIPE_PRICE_NAVIGATOR_PLUS_YEARLY || process.env.STRIPE_PRICE_PROPLUS_YEARLY || '',
    'one-time': process.env.STRIPE_PRICE_NAVIGATOR_PLUS_ONETIME || process.env.STRIPE_PRICE_PROPLUS_ONETIME || '',
  },
}

export const TIER_AMOUNTS: Record<UserTier, Record<BillingCycle, number>> = {
  foundations: { monthly: 0, yearly: 0, 'one-time': 0 },
  momentum: { monthly: 1400, yearly: 14000, 'one-time': 2900 },
  navigator: { monthly: 7400, yearly: 74000, 'one-time': 14900 },
  navigator_plus: { monthly: 29900, yearly: 299000, 'one-time': 29900 },
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
  const defName = tier === 'navigator_plus' ? 'Navigator+' : tier.charAt(0).toUpperCase() + tier.slice(1)
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

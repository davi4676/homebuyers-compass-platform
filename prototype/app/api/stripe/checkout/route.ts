import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import {
  STRIPE_CONFIG,
  SUBSCRIPTION_PLANS,
  getPlanForCheckout,
  isStripeSecretConfigured,
  type BillingCycle,
} from '@/lib/stripe'
import type { UserTier } from '@/lib/tiers'

function getStripe(): Stripe | null {
  if (!isStripeSecretConfigured()) return null
  return new Stripe(STRIPE_CONFIG.secretKey, { apiVersion: '2026-01-28.clover' })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      planId,
      tier,
      billingCycle,
      successUrl,
      cancelUrl,
      customerId,
      customerEmail,
    } = body

    let plan = null
    let resolvedTier: UserTier = 'momentum'

    if (tier && billingCycle) {
      const cycle = billingCycle as BillingCycle
      plan = getPlanForCheckout(tier as UserTier, cycle)
      resolvedTier = (tier as UserTier) || 'momentum'
    } else if (planId) {
      plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId)
      resolvedTier = plan?.tier || 'momentum'
    }

    if (!plan || plan.tier === 'foundations') {
      return NextResponse.json({ error: 'Invalid plan or tier' }, { status: 400 })
    }

    const stripe = getStripe()
    if (!stripe) {
      return NextResponse.json(
        {
          error:
            'Stripe not configured. Set `STRIPE_SECRET_KEY` and price IDs in `.env.local` (see `.env.local.example`).',
        },
        { status: 503 }
      )
    }

    const baseUrl = request.nextUrl.origin
    const success = successUrl || `${baseUrl}/payment?success=stripe&session_id={CHECKOUT_SESSION_ID}`
    const cancel = cancelUrl || `${baseUrl}/upgrade`

    if (plan.interval === 'one-time') {
      if (!plan.priceId) {
        return NextResponse.json(
          {
            error: `One-time Price ID not set for tier: ${resolvedTier}. Set STRIPE_PRICE_${resolvedTier.toUpperCase()}_ONETIME.`,
          },
          { status: 400 }
        )
      }
      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [{ price: plan.priceId, quantity: 1 }],
        success_url: success,
        cancel_url: cancel,
        metadata: { tier: resolvedTier, planId: plan.id },
      }
      if (customerId) sessionParams.customer = customerId
      else if (customerEmail) sessionParams.customer_email = customerEmail
      const session = await stripe.checkout.sessions.create(sessionParams)
      return NextResponse.json({ url: session.url, sessionId: session.id, tier: resolvedTier })
    }

    if (!plan.priceId) {
      return NextResponse.json(
        {
          error: `Price ID not set for ${resolvedTier} ${plan.interval}. Set STRIPE_PRICE_${resolvedTier.toUpperCase()}_MONTHLY or _YEARLY.`,
        },
        { status: 400 }
      )
    }

    const momentumTrialDays = resolvedTier === 'momentum' ? 7 : undefined

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: plan.priceId, quantity: 1 }],
      success_url: success,
      cancel_url: cancel,
      metadata: { tier: resolvedTier, planId: plan.id },
      subscription_data: {
        metadata: { tier: resolvedTier, planId: plan.id },
        ...(momentumTrialDays != null ? { trial_period_days: momentumTrialDays } : {}),
      },
    }
    if (customerId) sessionParams.customer = customerId
    else if (customerEmail) sessionParams.customer_email = customerEmail

    const session = await stripe.checkout.sessions.create(sessionParams)

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
      tier: resolvedTier,
    })
  } catch (e) {
    console.error('Stripe checkout error:', e)
    const message = e instanceof Error ? e.message : 'Checkout failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

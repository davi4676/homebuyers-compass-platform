import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { STRIPE_CONFIG, isStripeSecretConfigured } from '@/lib/stripe'
import type { UserTier } from '@/lib/tiers'

function getStripe(): Stripe | null {
  if (!isStripeSecretConfigured()) return null
  return new Stripe(STRIPE_CONFIG.secretKey, { apiVersion: '2026-01-28.clover' })
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()
    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
    }

    const stripe = getStripe()
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    })

    const isPaid =
      session.payment_status === 'paid' || session.payment_status === 'no_payment_required'

    if (session.status !== 'complete' || !isPaid) {
      return NextResponse.json({ verified: true, paid: false })
    }

    let subscription: Stripe.Subscription | null = null
    if (session.subscription) {
      subscription =
        typeof session.subscription === 'string'
          ? await stripe.subscriptions.retrieve(session.subscription)
          : session.subscription
    }

    const tier = (session.metadata?.tier ||
      subscription?.metadata?.tier ||
      null) as UserTier | null

    if (!tier || !['foundations', 'momentum', 'navigator', 'navigator_plus'].includes(tier)) {
      return NextResponse.json({ error: 'Tier metadata missing on session' }, { status: 400 })
    }

    const trialEndIso =
      subscription?.trial_end != null
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null

    return NextResponse.json({
      verified: true,
      paid: true,
      tier,
      mode: session.mode,
      trialEndIso,
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Session verification failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

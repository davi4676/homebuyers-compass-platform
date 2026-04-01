import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { STRIPE_CONFIG } from '@/lib/stripe'
import type { UserTier } from '@/lib/tiers'

function getStripe(): Stripe | null {
  if (!STRIPE_CONFIG.secretKey) return null
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

    const isComplete = session.status === 'complete'
    const isPaid = session.payment_status === 'paid' || session.payment_status === 'no_payment_required'
    if (!isComplete || !isPaid) {
      return NextResponse.json({ verified: true, paid: false })
    }

    const subscription = session.subscription && typeof session.subscription !== 'string'
      ? session.subscription
      : null

    const tier = (session.metadata?.tier ||
      subscription?.metadata?.tier ||
      null) as UserTier | null

    if (!tier || !['foundations', 'momentum', 'navigator', 'navigator_plus'].includes(tier)) {
      return NextResponse.json({ error: 'Tier metadata missing on session' }, { status: 400 })
    }

    return NextResponse.json({
      verified: true,
      paid: true,
      tier,
      mode: session.mode,
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Session verification failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getSessionFromRequest } from '@/lib/auth-server'
import { findUserById } from '@/lib/user-store'
import { STRIPE_CONFIG } from '@/lib/stripe'

function getStripe(): Stripe | null {
  if (!STRIPE_CONFIG.secretKey) return null
  return new Stripe(STRIPE_CONFIG.secretKey, { apiVersion: '2026-01-28.clover' })
}

/**
 * Stripe Customer Portal — cancel, update payment method, etc.
 * Pair with in-app pause at /account/billing; configure a 50% pause price or schedule in Stripe to match copy.
 */
export async function POST() {
  const session = await getSessionFromRequest()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = findUserById(session.userId)
  if (!user?.stripeCustomerId) {
    return NextResponse.json(
      {
        error: 'No subscription billing profile yet. Subscribe once, then manage billing here.',
        needsSubscription: true,
      },
      { status: 400 }
    )
  }

  const stripe = getStripe()
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  const base = (process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || '').replace(/\/$/, '') || 'http://localhost:3002'

  const portal = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${base}/account/billing`,
  })

  return NextResponse.json({ url: portal.url })
}

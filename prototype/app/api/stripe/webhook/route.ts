import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { STRIPE_CONFIG } from '@/lib/stripe'
import { findUserByEmail, updateUser } from '@/lib/user-store'
import type { UserTier } from '@/lib/tiers'

function getStripe(): Stripe | null {
  if (!STRIPE_CONFIG.secretKey) return null
  return new Stripe(STRIPE_CONFIG.secretKey, { apiVersion: '2026-01-28.clover' })
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature') || ''

  if (!STRIPE_CONFIG.webhookSecret) {
    return NextResponse.json({ received: true })
  }

  const stripe = getStripe()
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, STRIPE_CONFIG.webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Webhook signature verification failed:', message)
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const subscriptionId =
          typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription?.id ?? null
        const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id ?? null
        const customerEmail = session.customer_email || session.customer_details?.email || null

        if (customerId && customerEmail) {
          const user = findUserByEmail(customerEmail)
          if (user) {
            const tierMeta = session.metadata?.tier as UserTier | undefined
            const tierOk =
              tierMeta &&
              ['foundations', 'momentum', 'navigator', 'navigator_plus'].includes(tierMeta)
            updateUser(user.id, {
              stripeCustomerId: customerId,
              ...(subscriptionId ? { stripeSubscriptionId: subscriptionId } : {}),
              ...(tierOk ? { subscriptionTier: tierMeta } : {}),
              momentumTrial: undefined,
              subscriptionPause: undefined,
            })
          }
        }

        console.log('[Stripe] checkout.session.completed', {
          sessionId: session.id,
          subscriptionId,
          customerId,
          customerEmail,
        })
        break
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const status = subscription.status
        // Update user's subscription status (active, past_due, canceled, etc.)
        console.log('[Stripe] customer.subscription.updated', {
          id: subscription.id,
          status,
          start_date: subscription.start_date,
          ended_at: subscription.ended_at,
        })
        break
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        // Revoke access, downgrade user tier
        console.log('[Stripe] customer.subscription.deleted', { id: subscription.id })
        break
      }
      case 'invoice.paid':
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = invoice.parent?.subscription_details?.subscription ?? null
        console.log(`[Stripe] ${event.type}`, { id: invoice.id, subscription: subscriptionId })
        break
      }
      default:
        console.log(`[Stripe] Unhandled event type: ${event.type}`)
    }
  } catch (e) {
    console.error('Webhook handler error:', e)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

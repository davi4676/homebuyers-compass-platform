import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { STRIPE_CONFIG, isStripeSecretConfigured } from '@/lib/stripe'

function getStripe(): Stripe | null {
  if (!isStripeSecretConfigured()) return null
  return new Stripe(STRIPE_CONFIG.secretKey, { apiVersion: '2026-01-28.clover' })
}

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe()
    if (!stripe) {
      return NextResponse.json(
        {
          error:
            'Stripe not configured. Set `STRIPE_SECRET_KEY` in `.env.local` (see `.env.example`).',
        },
        { status: 503 }
      )
    }

    const baseUrl = request.nextUrl.origin
    const successUrl = `${baseUrl}/customized-journey?tab=assistance&dpa_report=success`
    const cancelUrl = `${baseUrl}/customized-journey?tab=assistance`

    const priceId = process.env.STRIPE_PRICE_DPA_REPORT?.trim()

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = priceId
      ? [{ price: priceId, quantity: 1 }]
      : [
          {
            price_data: {
              currency: 'usd',
              unit_amount: 1900,
              product_data: {
                name: 'DPA Match Report',
                description: 'Personalized down payment assistance match report (one-time)',
              },
            },
            quantity: 1,
          },
        ]

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { product: 'dpa_match_report' },
    })

    if (!session.url) {
      return NextResponse.json({ error: 'Checkout session missing URL' }, { status: 500 })
    }

    return NextResponse.json({ url: session.url, sessionId: session.id })
  } catch (e) {
    console.error('DPA report checkout error:', e)
    const message = e instanceof Error ? e.message : 'Checkout failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

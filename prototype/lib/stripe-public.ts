/**
 * Client-safe Stripe hints (no secret key). Used for upgrade / waitlist UI.
 */
export function isStripePublishableConfigured(): boolean {
  return Boolean(
    typeof process !== 'undefined' && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim()
  )
}

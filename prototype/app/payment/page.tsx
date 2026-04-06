'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Lock,
  AlertCircle,
  ArrowLeft,
  Shield,
} from 'lucide-react'
import Link from 'next/link'
import {
  TIER_DEFINITIONS,
  type UserTier,
  formatTierPriceForCycle,
  type TierBillingDisplayCycle,
} from '@/lib/tiers'
import {
  markMomentumPaidLocal,
  setUserTier,
  TRIAL_END_DATE_LS,
  isMomentumPaidLocal,
  MOMENTUM_TRIAL_STORAGE,
  NQ_TRIAL_START_DATE_LS,
  MOMENTUM_TRIAL_DAYS,
} from '@/lib/user-tracking'
import { track } from '@/lib/analytics'
import { trackActivity } from '@/lib/track-activity'
import BackToMyJourneyLink from '@/components/BackToMyJourneyLink'
import PaidWelcomePanel from '@/components/payment/PaidWelcomePanel'

const SUPPORT_MAIL = 'mailto:support@nestquest.com'

function approxTierMrrUsd(tier: UserTier, cycle: string | null): number {
  const def = TIER_DEFINITIONS[tier]
  const monthlyCents = def.price.monthly
  if (monthlyCents == null) return 0
  if (cycle === 'yearly' && def.price.annual != null) {
    return Math.round(def.price.annual / 100 / 12)
  }
  return monthlyCents / 100
}

function isStripeUnavailableError(res: Response, message: string): boolean {
  return (
    res.status === 503 ||
    /not configured|stripe not configured/i.test(message) ||
    /STRIPE_SECRET_KEY/i.test(message)
  )
}

export default function PaymentPage() {
  const searchParams = useSearchParams()
  const tierParam = searchParams.get('tier') as UserTier
  const billingCycle = (searchParams.get('cycle') || 'monthly') as 'one-time' | 'monthly' | 'yearly'

  const [selectedTier, setSelectedTier] = useState<UserTier>(tierParam || 'momentum')
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stripeRedirecting, setStripeRedirecting] = useState(false)
  const [customerEmail, setCustomerEmail] = useState('')

  const tierDef = TIER_DEFINITIONS[selectedTier]
  const displayCycle: TierBillingDisplayCycle =
    billingCycle === 'yearly' ? 'annual' : billingCycle === 'monthly' ? 'monthly' : 'one-time'
  const priceLabel = formatTierPriceForCycle(tierDef, displayCycle)

  const trialAlreadyScheduled =
    typeof window !== 'undefined' && Boolean(localStorage.getItem(TRIAL_END_DATE_LS))
  const momentumStripeTrial =
    selectedTier === 'momentum' &&
    (billingCycle === 'monthly' || billingCycle === 'yearly') &&
    !isMomentumPaidLocal() &&
    !trialAlreadyScheduled

  const trialChargeDateLabel = (() => {
    if (!momentumStripeTrial) return ''
    const d = new Date(Date.now() + 7 * 86_400_000)
    return d.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  })()

  useEffect(() => {
    const stripeSuccess = searchParams.get('success') === 'stripe'
    if (!stripeSuccess) return

    const sessionId = searchParams.get('session_id')
    if (!sessionId) {
      setError('We could not verify your payment session. Please contact support if you were charged.')
      return
    }

    let cancelled = false
    fetch('/api/stripe/verify-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    })
      .then(async (res) => ({ ok: res.ok, body: await res.json() }))
      .then(({ ok, body }) => {
        if (cancelled) return
        if (!ok || !body?.paid || !body?.tier) {
          setError(body?.error || 'Payment could not be verified yet. Please refresh in a moment.')
          return
        }
        const tier = body.tier as UserTier
        const trialEndIso = typeof body.trialEndIso === 'string' ? body.trialEndIso : null
        if (tier === 'momentum' && trialEndIso) {
          setUserTier(tier, { recordPurchaseDate: false })
          localStorage.setItem(TRIAL_END_DATE_LS, trialEndIso)
          localStorage.setItem(MOMENTUM_TRIAL_STORAGE.TRIAL_ENDS_AT, trialEndIso)
          const endMs = new Date(trialEndIso).getTime()
          localStorage.setItem(
            NQ_TRIAL_START_DATE_LS,
            new Date(endMs - MOMENTUM_TRIAL_DAYS * 86_400_000).toISOString()
          )
        } else {
          if (tier === 'momentum') markMomentumPaidLocal()
          setUserTier(tier)
        }
        setSelectedTier(tier)
        localStorage.setItem('tierPurchaseDate', new Date().toISOString())
        localStorage.setItem('tierBillingCycle', searchParams.get('cycle') || 'monthly')
        setSuccess(true)
        track.subscriptionConverted(tier, approxTierMrrUsd(tier, searchParams.get('cycle')))
      })
      .catch(() => {
        if (!cancelled) setError('Payment verification failed. Please try refreshing this page.')
      })

    return () => {
      cancelled = true
    }
  }, [searchParams])

  const handleStripeCheckout = async (planId: 'monthly' | 'yearly' | 'one-time') => {
    setStripeRedirecting(true)
    setError(null)
    trackActivity('tool_used', { tool: 'stripe_checkout_start', tier: selectedTier, planId })
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      const cycle = planId === 'one-time' ? 'one-time' : planId === 'monthly' ? 'monthly' : 'yearly'
      const successUrl = `${baseUrl}/payment?success=stripe&cycle=${cycle}&session_id={CHECKOUT_SESSION_ID}`
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: selectedTier,
          billingCycle: cycle,
          successUrl,
          cancelUrl: `${baseUrl}/payment?tier=${selectedTier}&cycle=${billingCycle}`,
          customerEmail: customerEmail || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        const raw = typeof data.error === 'string' ? data.error : 'Checkout failed'
        setError(
          isStripeUnavailableError(res, raw)
            ? 'SETUP_PENDING'
            : raw
        )
        setStripeRedirecting(false)
        return
      }
      if (data.url) {
        window.location.href = data.url
        return
      }
      setError('No checkout URL returned')
    } catch (e) {
      console.error(e)
      setError('Could not start checkout')
    }
    setStripeRedirecting(false)
  }

  if (success) {
    return (
      <div className="app-page-shell flex flex-col items-center justify-center px-4 py-10">
        <div className="mb-6 w-full max-w-lg">
          <BackToMyJourneyLink />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 22 }}
        >
          <PaidWelcomePanel tier={selectedTier} />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="app-page-shell">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4">
          <BackToMyJourneyLink />
        </div>
        <Link
          href="/upgrade"
          className="inline-flex items-center gap-2 text-sm text-[#57534e] hover:text-[#1c1917] mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to plans
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-4xl font-bold mb-2 text-[#1c1917]">Complete secure checkout</h1>
          <p className="text-[#57534e]">Upgrading to {tierDef.name}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 border border-[#e7e5e4] shadow-sm mb-6"
        >
          <h2 className="font-display text-xl font-bold mb-4">Order summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-[#57534e]">{tierDef.name} plan</span>
              <span className="font-semibold">{priceLabel}</span>
            </div>
            <div className="text-sm text-[#78716c]">
              Price reflects the billing cycle you selected; taxes may be added at checkout where applicable.
            </div>
            <div className="border-t border-[#e7e5e4] pt-3 mt-3">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{priceLabel}</span>
              </div>
            </div>
            {momentumStripeTrial ? (
              <div className="mt-4 space-y-2 rounded-xl border border-teal-200 bg-[#f0fdfa] p-4 text-sm text-[#134e4a]">
                <p>
                  Your <strong className="font-semibold">7-day free trial</strong> starts today. You won&apos;t be
                  charged until <strong className="font-semibold">{trialChargeDateLabel}</strong>.
                </p>
                <p>
                  Cancel anytime before <strong className="font-semibold">{trialChargeDateLabel}</strong> and you
                  won&apos;t be charged.
                </p>
              </div>
            ) : null}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 border border-[#e7e5e4] shadow-sm"
        >
          <h2 className="font-display text-xl font-bold mb-4">Stripe checkout</h2>
          <div className="mb-6 p-4 rounded-xl border border-[#0d9488]/30 bg-[#f0fdfa]">
            <h3 className="font-semibold text-[#1c1917] mb-2">Choose billing option</h3>
            <p className="text-sm text-[#57534e] mb-3">
              Secure checkout with card support. Subscriptions can be cancelled anytime — or pause for up to 3 months at
              half the monthly rate from{' '}
              <Link href="/account/billing" className="font-semibold text-[#0d9488] underline">
                Billing &amp; subscription
              </Link>
              .
            </p>
            <input
              type="email"
              placeholder="Email (optional)"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="w-full mb-3 px-4 py-2 rounded-lg border border-[#e7e5e4] bg-white text-[#1c1917] placeholder:text-[#a8a29e]"
            />
            <div className="flex flex-wrap gap-2">
              {billingCycle === 'monthly' && (
                <>
                  <button
                    type="button"
                    onClick={() => handleStripeCheckout('monthly')}
                    disabled={stripeRedirecting}
                    className="px-4 py-2 rounded-lg bg-[#0d9488] text-white hover:bg-[#0f766e] disabled:opacity-50"
                  >
                    {stripeRedirecting ? 'Redirecting...' : 'Stripe — Monthly'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStripeCheckout('yearly')}
                    disabled={stripeRedirecting}
                    className="px-4 py-2 rounded-lg border-2 border-[#0d9488] text-[#0d9488] hover:bg-[#0d9488]/10 disabled:opacity-50"
                  >
                    {stripeRedirecting ? 'Redirecting...' : 'Stripe — Annual (20% off)'}
                  </button>
                </>
              )}
              {billingCycle === 'yearly' && (
                <button
                  type="button"
                  onClick={() => handleStripeCheckout('yearly')}
                  disabled={stripeRedirecting}
                  className="px-4 py-2 rounded-lg bg-[#0d9488] text-white hover:bg-[#0f766e] disabled:opacity-50"
                >
                  {stripeRedirecting ? 'Redirecting...' : 'Stripe — Annual (20% off)'}
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800">
              <div className="flex items-start gap-2">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <div className="min-w-0 space-y-2">
                  {error === 'SETUP_PENDING' ? (
                    <>
                      <p>
                        Payment processing is being set up. Please check back shortly or contact support.
                      </p>
                      <a
                        href={SUPPORT_MAIL}
                        className="inline-block font-semibold text-red-900 underline hover:no-underline"
                      >
                        Contact Support
                      </a>
                    </>
                  ) : (
                    <span>{error}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex items-start gap-3 p-4 bg-[#fafaf9] rounded-xl border border-[#e7e5e4]">
            <Shield className="text-[#0d9488] flex-shrink-0 mt-0.5" size={20} />
            <div className="text-sm text-[#57534e]">
              <p className="font-semibold text-[#1c1917] mb-1">Secure payment</p>
              <p>Your payment information is encrypted. We never store your full card details.</p>
            </div>
          </div>

          <div className="w-full mt-6 px-6 py-4 bg-[#ecfdf5] border border-[#0d9488]/30 text-[#134e4a] rounded-xl font-semibold flex items-center justify-center gap-2">
            <Lock size={18} />
            Payments are processed through Stripe secure checkout.
          </div>

          <p className="text-center text-sm text-[#78716c] mt-4">
            30-day money-back guarantee • Cancel anytime
          </p>
        </motion.div>
      </div>
    </div>
  )
}

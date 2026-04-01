'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Lock,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Shield,
} from 'lucide-react'
import Link from 'next/link'
import { TIER_DEFINITIONS, type UserTier, formatTierPrice } from '@/lib/tiers'
import { setUserTier } from '@/lib/user-tracking'
import { trackActivity } from '@/lib/track-activity'

export default function PaymentPage() {
  const searchParams = useSearchParams()
  const tierParam = searchParams.get('tier') as UserTier
  const billingCycle = (searchParams.get('cycle') || 'one-time') as 'one-time' | 'monthly'

  const [selectedTier, setSelectedTier] = useState<UserTier>(tierParam || 'momentum')
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stripeRedirecting, setStripeRedirecting] = useState(false)
  const [customerEmail, setCustomerEmail] = useState('')

  const tierDef = TIER_DEFINITIONS[selectedTier]
  const priceLabel = formatTierPrice(tierDef)

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
        setUserTier(tier)
        setSelectedTier(tier)
        localStorage.setItem('tierPurchaseDate', new Date().toISOString())
        localStorage.setItem('tierBillingCycle', searchParams.get('cycle') || 'monthly')
        setSuccess(true)
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
        setError(data.error || 'Checkout failed')
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
      <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto px-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="mb-6"
          >
            <CheckCircle className="text-green-400 mx-auto" size={64} />
          </motion.div>
          <h2 className="text-3xl font-bold mb-4">Payment Successful!</h2>
          <p className="text-lg text-gray-400 mb-6">
            Welcome to {tierDef.name}! Your plan access is now active.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to your journey...
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <Link
          href="/upgrade"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Plans
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">Complete Secure Checkout</h1>
          <p className="text-gray-400">Upgrading to {tierDef.name}</p>
        </motion.div>

        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-600 mb-6"
        >
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">{tierDef.name} Plan</span>
              <span className="font-semibold">{priceLabel}</span>
            </div>
            <div className="text-sm text-gray-500">Placeholder pricing range</div>
            <div className="border-t border-gray-800 pt-3 mt-3">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{priceLabel}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stripe Checkout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-600"
        >
          <h2 className="text-xl font-bold mb-4">Stripe Checkout</h2>
          <div className="mb-6 p-4 rounded-lg border border-cyan-500/30 bg-gray-700/50">
            <h3 className="font-semibold text-gray-100 mb-2">Choose billing option</h3>
            <p className="text-sm text-gray-400 mb-3">
              Secure checkout with card support. Subscriptions can be cancelled anytime.
            </p>
            <input
              type="email"
              placeholder="Email (optional)"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="w-full mb-3 px-4 py-2 rounded-lg border border-gray-600 bg-gray-800 text-gray-100 placeholder-gray-400"
            />
            <div className="flex flex-wrap gap-2">
              {billingCycle === 'monthly' && (
                <>
                  <button
                    type="button"
                    onClick={() => handleStripeCheckout('monthly')}
                    disabled={stripeRedirecting}
                    className="px-4 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 disabled:opacity-50"
                  >
                    {stripeRedirecting ? 'Redirecting...' : 'Stripe — Monthly'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStripeCheckout('yearly')}
                    disabled={stripeRedirecting}
                    className="px-4 py-2 rounded-lg border-2 border-cyan-600 text-cyan-400 hover:bg-cyan-600/20 disabled:opacity-50"
                  >
                    Stripe — Yearly
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => handleStripeCheckout('one-time')}
                disabled={stripeRedirecting}
                className="px-4 py-2 rounded-lg border-2 border-cyan-600 text-cyan-400 hover:bg-cyan-600/20 disabled:opacity-50"
              >
                Stripe — One-time
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-400">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {/* Security Notice */}
          <div className="mt-6 flex items-start gap-3 p-4 bg-gray-800/50 rounded-lg">
            <Shield className="text-[#06b6d4] flex-shrink-0 mt-0.5" size={20} />
            <div className="text-sm text-gray-400">
              <p className="font-semibold text-white mb-1">Secure Payment</p>
              <p>Your payment information is encrypted and secure. We never store your full card details.</p>
            </div>
          </div>

          <div className="w-full mt-6 px-6 py-4 bg-cyan-600/15 border border-cyan-500/30 text-cyan-200 rounded-lg font-semibold flex items-center justify-center gap-2">
            <Lock size={18} />
            Payments are processed through Stripe secure checkout.
          </div>

          {/* Money Back Guarantee */}
          <p className="text-center text-sm text-gray-500 mt-4">
            30-day money-back guarantee • Cancel anytime
          </p>
        </motion.div>
      </div>
    </div>
  )
}

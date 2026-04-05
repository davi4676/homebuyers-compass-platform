'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, PauseCircle, CreditCard, X, CalendarClock } from 'lucide-react'
import BackToMyJourneyLink from '@/components/BackToMyJourneyLink'
import { TIER_DEFINITIONS, type TierDefinition, type UserTier, estimateHalfMonthlyFromDisplay } from '@/lib/tiers'
import { getUserTier } from '@/lib/user-tracking'
import {
  SUBSCRIPTION_PAUSE_MAX_MONTHS,
  type PauseMonths,
  clearSubscriptionPauseLocal,
  getSubscriptionPauseState,
  startSubscriptionPauseLocal,
  subscriptionPauseDaysRemaining,
} from '@/lib/subscription-pause'
import { trackActivity } from '@/lib/track-activity'

export default function BillingPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tier, setTier] = useState<UserTier>('foundations')
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [pauseMonths, setPauseMonths] = useState<PauseMonths>(2)
  const [pauseBusy, setPauseBusy] = useState(false)
  const [pauseState, setPauseState] = useState<ReturnType<typeof getSubscriptionPauseState>>(null)

  const bumpPause = useCallback(() => {
    setPauseState(getSubscriptionPauseState())
    setTier(getUserTier())
  }, [])

  useEffect(() => {
    bumpPause()
    const onTier = () => bumpPause()
    window.addEventListener('tierChanged', onTier)
    return () => window.removeEventListener('tierChanged', onTier)
  }, [bumpPause])

  const tierDef = TIER_DEFINITIONS[tier]
  const halfMonthlyLabel = estimateHalfMonthlyFromDisplay(tierDef.price.displayMonthly)
  const fullMonthlyLabel = tierDef.price.displayMonthly || formatTierMonthly(tierDef)
  const isPaidTier = tier !== 'foundations'
  const paused = pauseState != null
  const pauseDaysLeft = subscriptionPauseDaysRemaining()

  const openPortal = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/stripe/billing-portal', { method: 'POST', credentials: 'include' })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Could not open billing portal')
        return
      }
      if (data.url) {
        window.location.href = data.url
        return
      }
      setError('No portal URL returned')
    } catch {
      setError('Request failed')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmPause = async () => {
    setPauseBusy(true)
    setError(null)
    try {
      startSubscriptionPauseLocal(pauseMonths, tier)
      trackActivity('tool_used', {
        tool: 'subscription_pause_started',
        months: pauseMonths,
        tier,
      })
      try {
        await fetch('/api/subscription/pause', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ months: pauseMonths }),
        })
      } catch {
        /* anonymous or offline — local pause still applies */
      }
      bumpPause()
      setCancelModalOpen(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start pause')
    } finally {
      setPauseBusy(false)
    }
  }

  const handleResume = async () => {
    setPauseBusy(true)
    setError(null)
    try {
      clearSubscriptionPauseLocal()
      trackActivity('tool_used', { tool: 'subscription_pause_resumed', tier })
      try {
        await fetch('/api/subscription/resume', { method: 'POST', credentials: 'include' })
      } catch {
        /* ignore */
      }
      bumpPause()
    } finally {
      setPauseBusy(false)
    }
  }

  return (
    <div className="app-page-shell">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <div className="mb-4">
          <BackToMyJourneyLink />
        </div>
        <Link
          href="/upgrade"
          className="mb-6 inline-flex items-center gap-2 text-sm text-[#57534e] transition hover:text-[#1c1917]"
        >
          <ArrowLeft size={18} />
          Plans & pricing
        </Link>

        <h1 className="font-display text-3xl font-bold text-[#1c1917]">Subscription & billing</h1>
        <p className="mt-2 text-[#57534e]">
          Update your card, view invoices, or take a break without losing your roadmap — full cancellation stays in
          Stripe.
        </p>

        {paused ? (
          <div
            className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5 shadow-sm"
            role="status"
          >
            <div className="flex items-start gap-3">
              <CalendarClock className="mt-0.5 h-8 w-8 shrink-0 text-amber-700" aria-hidden />
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-lg font-bold text-amber-950">Plan paused</h2>
                <p className="mt-2 text-sm text-amber-950/90">
                  Your progress and data stay saved. You&apos;re in a reduced-rate pause window (
                  <strong>about {halfMonthlyLabel}</strong> vs {fullMonthlyLabel} — confirm charges in Stripe or your
                  statement).{' '}
                  <span className="whitespace-nowrap font-semibold">
                    ~{pauseDaysLeft} day{pauseDaysLeft === 1 ? '' : 's'} left
                  </span>{' '}
                  in this pause period.
                </p>
                <button
                  type="button"
                  onClick={() => void handleResume()}
                  disabled={pauseBusy}
                  className="mt-4 inline-flex rounded-lg bg-amber-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-900 disabled:opacity-50"
                >
                  {pauseBusy ? 'Updating…' : 'Resume full plan now'}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-8 rounded-xl border border-[#e7e5e4] bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <PauseCircle className="mt-0.5 h-8 w-8 shrink-0 text-[#0d9488]" aria-hidden />
            <div>
              <h2 className="font-display text-lg font-bold text-[#1c1917]">Waiting on rates or saving up?</h2>
              <p className="mt-2 text-sm text-[#57534e]">
                Instead of cancelling, you can <strong>pause your plan for up to {SUBSCRIPTION_PAUSE_MAX_MONTHS} months</strong>{' '}
                — your progress and data are saved, and you can resume anytime. During the pause, billing is designed to
                run at <strong>50% of the regular monthly rate</strong> (about <strong>{halfMonthlyLabel}</strong> for{' '}
                {tierDef.name}) so we keep supporting your file while you&apos;re on standby.
              </p>
              {isPaidTier && !paused ? (
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(true)}
                  className="mt-4 inline-flex rounded-lg border-2 border-[#0d9488] bg-white px-4 py-2.5 text-sm font-semibold text-[#0f766e] transition hover:bg-[#ecfdf5]"
                >
                  Pause or cancel subscription
                </button>
              ) : null}
              {!isPaidTier ? (
                <p className="mt-3 text-sm text-[#57534e]">
                  You&apos;re on {tierDef.name}.{' '}
                  <Link href="/upgrade" className="font-semibold text-[#0d9488] underline">
                    Upgrade
                  </Link>{' '}
                  to unlock member billing and pause options.
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-[#0d9488]/25 bg-[#ecfdf5] p-6">
          <div className="flex items-center gap-2 font-semibold text-[#134e4a]">
            <CreditCard className="h-5 w-5" aria-hidden />
            Stripe Customer Portal
          </div>
          <p className="mt-2 text-sm text-[#57534e]">
            Update payment method, download invoices, or complete cancellation. Connect a{' '}
            <strong>50% pause price</strong> or subscription schedule in Stripe so portal charges match the in-app pause
            offer.
          </p>
          <button
            type="button"
            onClick={() => void openPortal()}
            disabled={loading}
            className="mt-4 inline-flex items-center justify-center rounded-lg bg-[#0d9488] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0f766e] disabled:opacity-50"
          >
            {loading ? 'Opening…' : 'Manage billing in Stripe'}
          </button>
          {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
        </div>

        <p className="mt-6 text-xs text-[#78716c]">
          Pause here records your intent and dates in the app (and your account when signed in). Your payments team
          should mirror the 50% rate in Stripe products or schedules so statements match this experience.
        </p>
      </div>

      {cancelModalOpen ? (
        <div
          className="fixed inset-0 z-[200] flex items-end justify-center bg-black/50 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pause-cancel-title"
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <h2 id="pause-cancel-title" className="font-display text-xl font-bold text-[#1c1917]">
                Before you cancel…
              </h2>
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="rounded-lg p-1 text-[#57534e] hover:bg-[#f5f5f4]"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-3 text-sm text-[#57534e]">
              Pause your plan for up to {SUBSCRIPTION_PAUSE_MAX_MONTHS} months — your progress and data are saved.
              Resume anytime. During pause, you pay about <strong>{halfMonthlyLabel}</strong> (50% of{' '}
              {fullMonthlyLabel}) instead of cancelling and starting over later.
            </p>

            <fieldset className="mt-5">
              <legend className="text-sm font-semibold text-[#1c1917]">Pause length</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {([1, 2, 3] as const).map((m) => (
                  <label
                    key={m}
                    className={`cursor-pointer rounded-lg border-2 px-3 py-2 text-sm font-medium transition ${
                      pauseMonths === m
                        ? 'border-[#0d9488] bg-[#ecfdf5] text-[#0f766e]'
                        : 'border-[#e7e5e4] text-[#44403c] hover:border-[#a8a29e]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="pause-months"
                      className="sr-only"
                      checked={pauseMonths === m}
                      onChange={() => setPauseMonths(m)}
                    />
                    {m} month{m === 1 ? '' : 's'}
                  </label>
                ))}
              </div>
            </fieldset>

            <button
              type="button"
              onClick={() => void handleConfirmPause()}
              disabled={pauseBusy}
              className="mt-6 w-full rounded-xl bg-[#0d9488] py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#0f766e] disabled:opacity-50"
            >
              {pauseBusy ? 'Saving…' : `Pause for ${pauseMonths} month${pauseMonths === 1 ? '' : 's'}`}
            </button>

            <button
              type="button"
              onClick={() => {
                setCancelModalOpen(false)
                void openPortal()
              }}
              disabled={loading}
              className="mt-3 w-full rounded-xl border border-[#e7e5e4] py-3 text-sm font-semibold text-[#44403c] transition hover:bg-[#fafaf9] disabled:opacity-50"
            >
              No thanks — open Stripe to cancel
            </button>
            <button
              type="button"
              onClick={() => setCancelModalOpen(false)}
              className="mt-2 w-full py-2 text-sm text-[#57534e] underline"
            >
              Keep my plan
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function formatTierMonthly(def: TierDefinition): string {
  if (def.price.displayMonthly) return def.price.displayMonthly
  if (def.price.monthly != null) return `$${Math.round(def.price.monthly / 100)}/mo`
  return 'your monthly rate'
}

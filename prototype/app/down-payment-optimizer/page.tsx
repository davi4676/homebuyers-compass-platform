'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import BackToMyJourneyLink from '@/components/BackToMyJourneyLink'
import NqHubTabLayout from '@/components/hub/NqHubTabLayout'
import { markDpaOptimizerVisited } from '@/lib/dpa-optimizer-visit'
import { useAuth } from '@/lib/hooks/useAuth'
import { tierHasCalculator } from '@/lib/tiers'

const TIMELINE_MONTHS: Record<string, number> = {
  '6': 6,
  '12': 12,
  '24': 24,
  '36': 36,
}

function formatMoney(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

export default function DownPaymentOptimizerPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const tier = user?.subscriptionTier ?? 'foundations'
  const canUseOptimizer =
    !isAuthenticated || tierHasCalculator(tier, 'down-payment')

  useEffect(() => {
    markDpaOptimizerVisited()
  }, [])

  const [homePrice, setHomePrice] = useState(400_000)
  const [savings, setSavings] = useState(25_000)
  const [monthly, setMonthly] = useState(800)
  const [timeline, setTimeline] = useState('12')

  const months = TIMELINE_MONTHS[timeline] ?? 12

  const scenarios = useMemo(() => {
    const fha = homePrice * 0.035
    const conv5 = homePrice * 0.05
    const conv20 = homePrice * 0.2
    return { fha, conv5, conv20 }
  }, [homePrice])

  const gapFha = Math.max(0, scenarios.fha - savings)
  const _gap5 = Math.max(0, scenarios.conv5 - savings)
  const _gap20 = Math.max(0, scenarios.conv20 - savings)

  const monthsToFha = monthly > 0 ? Math.ceil(gapFha / monthly) : gapFha > 0 ? Infinity : 0

  const projected = savings + monthly * months
  const gapAfterTimeline = Math.max(0, scenarios.conv5 - projected)

  const dpaCount = gapFha > 0 ? Math.min(12, 3 + Math.floor(gapFha / 15_000)) : 2
  const dpaCover = Math.min(gapFha, Math.round(gapFha * 0.35))

  return (
    <NqHubTabLayout
      tab="find-funds"
      backLink={<BackToMyJourneyLink />}
      maxWidth="3xl"
      glassCard={
        <div className="nq-glass nq-savings-glass">
          <p className="nq-savings-glass-label">Programs that may apply</p>
          <p className="nq-savings-glass-amount tabular-nums">~{dpaCount}</p>
          <p className="mt-2 text-sm text-[var(--nq-ed-muted)]">
            Up to {formatMoney(dpaCover)} in potential DPA coverage toward your FHA gap.
          </p>
        </div>
      }
    >
        {isLoading ? (
          <p className="text-sm text-[var(--nq-ed-muted)]">Loading…</p>
        ) : null}

        {!isLoading && !canUseOptimizer ? (
          <div className="nq-hub-panel p-6 text-center sm:p-8">
            <h2 className="font-display text-xl font-bold text-[var(--nq-ed-text)]">Included with Momentum</h2>
            <p className="mt-2 text-sm text-[var(--nq-ed-muted)]">
              Foundations includes the affordability calculator on your results snapshot and in My Journey. Upgrade
              to unlock this down payment optimizer and the rest of the calculator suite.
            </p>
            <Link
              href="/upgrade?source=down-payment-optimizer&tier=momentum"
              className="nq-ed-btn-primary mt-5 inline-flex"
            >
              Upgrade to Momentum
            </Link>
            <Link
              href="/results"
              className="mt-4 block text-sm font-semibold text-[var(--nq-ed-accent)] hover:underline"
            >
              Open your free affordability snapshot →
            </Link>
          </div>
        ) : null}

        {!isLoading && canUseOptimizer ? (
          <>
        <div className="nq-hub-panel p-6">
          <label className="block text-sm font-semibold text-[var(--nq-ed-muted)]">
            Home price target: {formatMoney(homePrice)}
            <input
              type="range"
              min={100_000}
              max={800_000}
              step={5000}
              value={homePrice}
              onChange={(e) => setHomePrice(Number(e.target.value))}
              className="mt-2 w-full cursor-pointer accent-[var(--nq-ed-accent)]"
            />
            <span className="mt-1 block text-xs text-[var(--nq-ed-faint)]">$100K – $800K</span>
          </label>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-[var(--nq-ed-muted)]">
              Current savings
              <input
                type="number"
                min={0}
                value={savings || ''}
                onChange={(e) => setSavings(Number(e.target.value) || 0)}
                className="mt-1 w-full cursor-text rounded-xl border border-[var(--nq-ed-line)] bg-white/90 px-3 py-2 text-[var(--nq-ed-text)] focus:border-[var(--nq-ed-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--nq-ed-accent-soft)]"
              />
            </label>
            <label className="block text-sm font-semibold text-[var(--nq-ed-muted)]">
              Monthly savings goal
              <input
                type="number"
                min={0}
                value={monthly || ''}
                onChange={(e) => setMonthly(Number(e.target.value) || 0)}
                className="mt-1 w-full cursor-text rounded-xl border border-[var(--nq-ed-line)] bg-white/90 px-3 py-2 text-[var(--nq-ed-text)] focus:border-[var(--nq-ed-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--nq-ed-accent-soft)]"
              />
            </label>
          </div>

          <label className="mt-6 block text-sm font-semibold text-[var(--nq-ed-muted)]">
            Timeline
            <select
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
              className="mt-1 w-full cursor-pointer rounded-xl border border-[var(--nq-ed-line)] bg-white/90 px-3 py-2 text-[var(--nq-ed-text)] focus:border-[var(--nq-ed-accent)] focus:outline-none"
            >
              <option value="6">6 months</option>
              <option value="12">12 months</option>
              <option value="24">24 months</option>
              <option value="36">36 months</option>
            </select>
          </label>
        </div>

        <div className="nq-bento-grid mt-6">
          <div className="nq-bento-card">
            <span className="nq-ed-eyebrow">FHA 3.5%</span>
            <h3>{formatMoney(scenarios.fha)}</h3>
            <p>Gap: {formatMoney(gapFha)} · ~{monthsToFha === Infinity ? '—' : `${monthsToFha} mo`} at current pace</p>
          </div>
          <div className="nq-bento-card">
            <span className="nq-ed-eyebrow">Conventional 5%</span>
            <h3>{formatMoney(scenarios.conv5)}</h3>
            <p>Gap after {months} mo: {formatMoney(gapAfterTimeline)}</p>
          </div>
          <div className="nq-bento-card nq-bento-card--span-2">
            <span className="nq-ed-eyebrow">Programs</span>
            <h3>~{dpaCount} assistance programs may apply</h3>
            <p>Potential DPA coverage up to {formatMoney(dpaCover)} toward your FHA gap.</p>
            <Link
              href="/customized-journey?tab=money"
              className="mt-4 inline-flex cursor-pointer text-sm font-semibold text-[var(--nq-ed-accent)] hover:underline"
            >
              Open Assistance tab in My Journey →
            </Link>
          </div>
        </div>
          </>
        ) : null}
    </NqHubTabLayout>
  )
}

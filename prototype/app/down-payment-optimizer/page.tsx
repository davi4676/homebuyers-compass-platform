'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import BackToMyJourneyLink from '@/components/BackToMyJourneyLink'
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
  const gap5 = Math.max(0, scenarios.conv5 - savings)
  const gap20 = Math.max(0, scenarios.conv20 - savings)

  const monthsToFha = monthly > 0 ? Math.ceil(gapFha / monthly) : gapFha > 0 ? Infinity : 0

  const projected = savings + monthly * months
  const gapAfterTimeline = Math.max(0, scenarios.conv5 - projected)

  const dpaCount = gapFha > 0 ? Math.min(12, 3 + Math.floor(gapFha / 15_000)) : 2
  const dpaCover = Math.min(gapFha, Math.round(gapFha * 0.35))

  return (
    <div className="app-page-shell">
      <header className="sticky top-0 z-10 border-b border-[#e7e5e4] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center px-4 py-3">
          <BackToMyJourneyLink />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="font-display text-3xl font-bold text-[#1c1917]">Down Payment Optimizer</h1>
        <p className="mt-2 text-[#57534e]">
          Estimate how much you need to save for common loan types and how long it could take at your current pace.
        </p>

        {isLoading ? (
          <p className="mt-8 text-sm text-[#78716c]">Loading…</p>
        ) : null}

        {!isLoading && !canUseOptimizer ? (
          <div className="mt-8 rounded-xl border border-amber-200/90 bg-amber-50/90 p-6 text-center shadow-sm sm:p-8">
            <h2 className="font-display text-xl font-bold text-[#1c1917]">Included with Momentum</h2>
            <p className="mt-2 text-sm text-[#57534e]">
              Foundations includes the affordability calculator on your results snapshot and in My Journey. Upgrade
              to unlock this down payment optimizer and the rest of the calculator suite.
            </p>
            <Link
              href="/upgrade?source=down-payment-optimizer&tier=momentum"
              className="mt-5 inline-flex items-center justify-center rounded-lg bg-[#0d9488] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0f766e]"
            >
              Upgrade to Momentum
            </Link>
            <Link
              href="/results"
              className="mt-4 block text-sm font-semibold text-[#0d9488] hover:underline"
            >
              Open your free affordability snapshot →
            </Link>
          </div>
        ) : null}

        {!isLoading && canUseOptimizer ? (
          <>
        <div className="mt-8 rounded-xl border border-[#e7e5e4] bg-white p-6 shadow-sm">
          <label className="block text-sm font-semibold text-[#57534e]">
            Home price target: {formatMoney(homePrice)}
            <input
              type="range"
              min={100_000}
              max={800_000}
              step={5000}
              value={homePrice}
              onChange={(e) => setHomePrice(Number(e.target.value))}
              className="mt-2 w-full accent-[#1a6b3c]"
            />
            <span className="mt-1 block text-xs text-[#78716c]">$100K – $800K</span>
          </label>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-[#57534e]">
              Current savings
              <input
                type="number"
                min={0}
                value={savings || ''}
                onChange={(e) => setSavings(Number(e.target.value) || 0)}
                className="mt-1 w-full rounded-lg border border-[#e7e5e4] px-3 py-2 text-[#1c1917] outline-none focus:ring-2 focus:ring-[#0d9488]/40"
              />
            </label>
            <label className="block text-sm font-semibold text-[#57534e]">
              Monthly savings capacity
              <input
                type="number"
                min={0}
                value={monthly || ''}
                onChange={(e) => setMonthly(Number(e.target.value) || 0)}
                className="mt-1 w-full rounded-lg border border-[#e7e5e4] px-3 py-2 text-[#1c1917] outline-none focus:ring-2 focus:ring-[#0d9488]/40"
              />
            </label>
          </div>

          <label className="mt-6 block text-sm font-semibold text-[#57534e]">
            Target move-in timeline
            <select
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#e7e5e4] bg-white px-3 py-2.5 text-[#1c1917] outline-none focus:ring-2 focus:ring-[#0d9488]/40 sm:max-w-xs"
            >
              <option value="6">6 months</option>
              <option value="12">1 year</option>
              <option value="24">2 years</option>
              <option value="36">3+ years</option>
            </select>
          </label>
        </div>

        <div className="mt-8 rounded-xl border border-[#e7e5e4] bg-white p-6 shadow-sm">
          <h2 className="font-display text-xl font-bold text-[#1c1917]">Down payment targets</h2>
          <ul className="mt-4 space-y-4">
            {[
              { label: '3.5% (FHA)', amount: scenarios.fha, gap: gapFha },
              { label: '5% conventional', amount: scenarios.conv5, gap: gap5 },
              { label: '20% conventional', amount: scenarios.conv20, gap: gap20 },
            ].map((row) => (
              <li key={row.label}>
                <div className="flex flex-wrap justify-between gap-2 text-sm">
                  <span className="font-semibold text-[#1c1917]">{row.label}</span>
                  <span className="text-[#57534e]">Need {formatMoney(row.amount)}</span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-[#f5f5f4]">
                  <div
                    className="h-full rounded-full bg-[#1a6b3c]"
                    style={{ width: `${Math.min(100, (savings / row.amount) * 100)}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-[#78716c]">
                  Gap: {formatMoney(row.gap)} vs. current savings
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 rounded-xl border border-[#e7e5e4] bg-white p-6 shadow-sm">
          <h2 className="font-display text-xl font-bold text-[#1c1917]">Timeline insights</h2>
          <p className="mt-3 text-sm text-[#57534e]">
            At <strong>{formatMoney(monthly)}/mo</strong>, reaching a <strong>3.5% FHA</strong> down payment from your
            current gap would take about{' '}
            <strong>{monthsToFha === Infinity ? '—' : `${monthsToFha} months`}</strong>
            {monthsToFha === Infinity ? ' (add monthly savings).' : '.'}
          </p>
          <p className="mt-3 text-sm text-[#57534e]">
            Over your selected <strong>{months} months</strong>, projected savings reach{' '}
            <strong>{formatMoney(projected)}</strong>. Remaining gap to a <strong>5% conventional</strong> target:{' '}
            <strong>{formatMoney(gapAfterTimeline)}</strong>.
          </p>
        </div>

        <div className="mt-8 rounded-xl border border-[#0d9488]/25 bg-[#ecfdf5] p-6 shadow-sm">
          <p className="text-sm font-semibold text-[#1a6b3c]">
            You may qualify for <strong>{dpaCount}</strong> down payment assistance programs that could cover up to{' '}
            <strong>{formatMoney(dpaCover)}</strong> of your gap (illustrative).
          </p>
          <Link
            href="/customized-journey?tab=assistance"
            className="mt-3 inline-flex text-sm font-bold text-[#0d9488] hover:underline"
          >
            Open Assistance tab in My Journey →
          </Link>
        </div>
          </>
        ) : null}
      </main>
    </div>
  )
}

'use client'

import { Component, type ErrorInfo, type ReactNode, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, HeartPulse, Home, TrendingDown } from 'lucide-react'
import BackToMyJourneyLink from '@/components/BackToMyJourneyLink'
import { formatCurrency } from '@/lib/calculations'
import { netProceedsFromSale, type BuySellCurrentHome } from '@/lib/journey-calculations'
import { BUY_SELL_JOURNEY_STORAGE_KEY } from '@/lib/move-up-journey-sync'
import { loadMoveUpRateAlert } from '@/lib/move-up-rate-alert'
import { getFreddieMacRatesSnapshot } from '@/lib/freddie-mac-rates'

const MOCK = {
  headline: 'Mortgage lifecycle snapshot',
  loanAgeMonths: 42,
  rateNote: 'Illustrative — connect your loan for live tracking.',
  nextChecklist: ['Review escrow analysis annually', 'Compare refinance when rates drop 0.5%+', 'Re-run insurance quotes'],
}

class LifecycleErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Lifecycle dashboard error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-900">
          <p className="font-semibold">Something went wrong loading this dashboard.</p>
          <Link href="/customized-journey" className="mt-3 inline-block font-semibold text-[#1a6b3c] underline">
            Go to My Journey →
          </Link>
        </div>
      )
    }
    return this.props.children
  }
}

type MoveUpDash = {
  show: true
  netProceeds: number
  homeValue: number
  mortgageBalance: number
  wizardStep: number
  targetMin: number
  targetMax: number
} | { show: false }

function LifecycleBody() {
  const [status, setStatus] = useState<'loading' | 'ready' | 'fallback'>('loading')
  const [moveUp, setMoveUp] = useState<MoveUpDash>({ show: false })
  const [rateHeadline, setRateHeadline] = useState<string | null>(null)

  useEffect(() => {
    const loaded = window.setTimeout(() => setStatus('ready'), 280)
    const timeout = window.setTimeout(() => {
      setStatus((s) => (s === 'loading' ? 'fallback' : s))
    }, 3000)
    return () => {
      window.clearTimeout(loaded)
      window.clearTimeout(timeout)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const quizRaw = localStorage.getItem('quizData')
      const quiz = quizRaw ? (JSON.parse(quizRaw) as Record<string, unknown>) : null
      const isMoveUpPath =
        quiz?.icpType === 'move-up' ||
        quiz?.transactionType === 'repeat-buyer' ||
        quiz?.transactionType === 'repeat_buyer'
      if (!isMoveUpPath) {
        setMoveUp({ show: false })
        return
      }
      const bsRaw = localStorage.getItem(BUY_SELL_JOURNEY_STORAGE_KEY)
      if (!bsRaw) {
        setMoveUp({ show: false })
        return
      }
      const bs = JSON.parse(bsRaw) as {
        currentHome?: Partial<BuySellCurrentHome>
        newHome?: { targetPriceMin?: number; targetPriceMax?: number }
        step?: number
      }
      const scPctRaw = Number(bs.currentHome?.sellingCostsPercent)
      const ch: BuySellCurrentHome = {
        homeValue: Number(bs.currentHome?.homeValue) || 450000,
        mortgageBalance: Number(bs.currentHome?.mortgageBalance) || 280000,
        sellingCostsPercent: Number.isFinite(scPctRaw) ? scPctRaw : 6,
        sellingCostsFixed: Number(bs.currentHome?.sellingCostsFixed) || 0,
        timelineToSell:
          bs.currentHome?.timelineToSell === '1-3' ||
          bs.currentHome?.timelineToSell === '3-6' ||
          bs.currentHome?.timelineToSell === '6-12' ||
          bs.currentHome?.timelineToSell === '12+'
            ? bs.currentHome.timelineToSell
            : '6-12',
      }
      const net = netProceedsFromSale(
        ch.homeValue,
        ch.mortgageBalance,
        ch.sellingCostsPercent,
        ch.sellingCostsFixed
      )
      const step = Number.isFinite(Number(bs.step)) ? Math.max(0, Math.min(6, Number(bs.step))) : 0
      const targetMin = Number(bs.newHome?.targetPriceMin) || 400000
      const targetMax = Number(bs.newHome?.targetPriceMax) || 600000
      setMoveUp({
        show: true,
        netProceeds: net,
        homeValue: ch.homeValue,
        mortgageBalance: ch.mortgageBalance,
        wizardStep: step,
        targetMin,
        targetMax,
      })
    } catch {
      setMoveUp({ show: false })
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const sub = loadMoveUpRateAlert()
    if (!sub) {
      setRateHeadline(null)
      return
    }
    const snap = getFreddieMacRatesSnapshot()
    const dropDecimal = sub.benchmarkRate30Year - snap.rate30Year
    const bps = Math.round(dropDecimal * 10000)
    const threshold = sub.alertThresholdBps ?? 25
    if (bps >= threshold) {
      setRateHeadline(
        `Benchmark 30-year rates are about ${(bps / 100).toFixed(2)} percentage points lower than when you subscribed — your bridge and new-loan estimates may improve (illustrative).`
      )
    } else {
      setRateHeadline(
        `Rate alert active — benchmark saved at ${(sub.benchmarkRate30Year * 100).toFixed(2)}% (${sub.benchmarkDate}). Current snapshot: ${(snap.rate30Year * 100).toFixed(2)}%.`
      )
    }
  }, [])

  if (status === 'fallback') {
    return (
      <div className="rounded-xl border border-[#e7e5e4] bg-white p-8 text-center shadow-sm">
        <p className="text-[#57534e]">
          Your lifecycle dashboard is being prepared. Check back after completing your buyer profile.
        </p>
        <Link
          href="/customized-journey"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1a6b3c] px-6 py-3 font-semibold text-white shadow-sm hover:bg-[#155c33]"
        >
          Go to My Journey →
        </Link>
      </div>
    )
  }

  if (status === 'loading') {
    return (
      <div className="rounded-xl border border-[#e7e5e4] bg-white p-12 text-center shadow-sm">
        <p className="animate-pulse text-[#57534e]">Loading…</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {moveUp.show ? (
        <div className="rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50/90 to-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Home className="h-7 w-7 text-[#0d9488]" aria-hidden />
            <h2 className="font-display text-xl font-bold text-[#1c1917]">Move-up &amp; buy-sell snapshot</h2>
          </div>
          <p className="mt-2 text-sm text-[#57534e]">
            Pulled from your saved Buy &amp; Sell wizard. Net proceeds and targets help tie this dashboard to your
            customized journey phase titles.
          </p>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-lg border border-[#e7e5e4] bg-white/80 p-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-[#78716c]">Est. net from sale</dt>
              <dd className="mt-1 text-lg font-bold text-[#1a6b3c]">{formatCurrency(moveUp.netProceeds)}</dd>
            </div>
            <div className="rounded-lg border border-[#e7e5e4] bg-white/80 p-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-[#78716c]">Current home / loan</dt>
              <dd className="mt-1 font-medium text-[#1c1917]">
                {formatCurrency(moveUp.homeValue)} value · {formatCurrency(moveUp.mortgageBalance)} owed
              </dd>
            </div>
            <div className="rounded-lg border border-[#e7e5e4] bg-white/80 p-3 sm:col-span-2">
              <dt className="text-xs font-semibold uppercase tracking-wide text-[#78716c]">Next-home target range</dt>
              <dd className="mt-1 font-medium text-[#1c1917]">
                {formatCurrency(moveUp.targetMin)} – {formatCurrency(moveUp.targetMax)} · Wizard step {moveUp.wizardStep + 1}{' '}
                of 7
              </dd>
            </div>
          </dl>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/homebuyer/buy-sell-journey"
              className="inline-flex items-center gap-2 rounded-lg bg-[#1a6b3c] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#155c33]"
            >
              Open Buy &amp; Sell wizard
            </Link>
            <Link
              href="/customized-journey?tab=phase"
              className="inline-flex items-center gap-2 rounded-lg border border-[#e7e5e4] bg-white px-4 py-2.5 text-sm font-semibold text-[#1c1917] hover:bg-[#fafaf9]"
            >
              Customized journey (phase)
            </Link>
          </div>
        </div>
      ) : null}

      {rateHeadline ? (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/80 p-5 shadow-sm">
          <div className="flex items-start gap-2">
            <TrendingDown className="mt-0.5 h-5 w-5 shrink-0 text-indigo-700" aria-hidden />
            <p className="text-sm font-medium text-indigo-950">{rateHeadline}</p>
          </div>
          <p className="mt-2 text-xs text-indigo-900/80">
            Prototype: subscription data is stored locally. Production would email or push when PMMS moves past your
            threshold.
          </p>
        </div>
      ) : null}

      <div className="rounded-xl border border-[#e7e5e4] bg-white p-6 shadow-sm">
        <h2 className="font-display text-xl font-bold text-[#1c1917]">{MOCK.headline}</h2>
        <p className="mt-2 text-sm text-[#57534e]">{MOCK.rateNote}</p>
        <p className="mt-4 text-sm">
          <span className="font-semibold text-[#1a6b3c]">Time with current loan:</span>{' '}
          {MOCK.loanAgeMonths} months (demo)
        </p>
      </div>
      <div className="rounded-xl border border-[#e7e5e4] bg-white p-6 shadow-sm">
        <h3 className="font-display text-lg font-bold text-[#1c1917]">Suggested checkpoints</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[#57534e]">
          {MOCK.nextChecklist.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
        <Link href="/refinance-optimizer" className="mt-4 inline-block text-sm font-semibold text-[#0d9488] hover:underline">
          Open refinance tools →
        </Link>
      </div>
    </div>
  )
}

export default function LifecycleDashboardPage() {
  return (
    <div className="app-page-shell">
      <header className="sticky top-0 z-10 border-b border-[#e7e5e4] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[#57534e] transition-colors hover:text-[#1c1917]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-4">
          <BackToMyJourneyLink />
        </div>
        <div className="mb-8 flex items-center gap-3">
          <HeartPulse className="h-10 w-10 text-[#0d9488]" aria-hidden />
          <div>
            <h1 className="font-display text-3xl font-bold text-[#1c1917]">Lifecycle dashboard</h1>
            <p className="text-sm text-[#57534e]">High-level mortgage health (prototype data).</p>
          </div>
        </div>

        <LifecycleErrorBoundary>
          <LifecycleBody />
        </LifecycleErrorBoundary>
      </main>
    </div>
  )
}

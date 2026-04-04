'use client'

import { Component, type ErrorInfo, type ReactNode, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, HeartPulse } from 'lucide-react'
import BackToMyJourneyLink from '@/components/BackToMyJourneyLink'

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

function LifecycleBody() {
  const [status, setStatus] = useState<'loading' | 'ready' | 'fallback'>('loading')

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

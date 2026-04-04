'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const METRICS = [
  { label: 'Total Users', value: '1,247', sub: 'All time' },
  { label: 'Active This Week', value: '389', sub: 'Signed in 7d' },
  { label: 'Quiz Completions', value: '892', sub: 'This month' },
  { label: 'Avg. Savings Found', value: '$11,340', sub: 'Per completed quiz' },
]

/** Deterministic 30-day series (no Math.random — stable SSR/hydration). */
function buildCompletionSeries(): { day: string; completions: number }[] {
  const out: { day: string; completions: number }[] = []
  for (let i = 0; i < 30; i++) {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    const wave = Math.sin(i / 4.2) * 12
    const completions = Math.round(22 + wave + (i % 7) * 0.8)
    out.push({
      day: `${date.getMonth() + 1}/${date.getDate()}`,
      completions: Math.max(12, Math.min(48, completions)),
    })
  }
  return out
}

const CHART_DATA = buildCompletionSeries()

export default function SaasAnalyticsPage() {
  return (
    <div>
      <Link
        href="/saas"
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Dashboard
      </Link>
      <h1 className="font-display text-2xl font-bold text-stone-900 mb-6">Analytics</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-2">
        {METRICS.map((m) => (
          <div key={m.label} className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-stone-500">{m.label}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-stone-900">{m.value}</p>
            <p className="text-xs text-stone-500 mt-1">{m.sub}</p>
          </div>
        ))}
      </div>
      <p className="mb-8 text-xs text-stone-500">
        Summary numbers are static demo values for UI review, not live product analytics.
      </p>

      <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm md:p-6">
        <h2 className="text-lg font-semibold text-stone-900 mb-4">Quiz Completions Over Time</h2>
        <div className="h-[320px] w-full min-h-[280px] min-w-0">
          <ResponsiveContainer width="100%" height="100%" minHeight={280}>
            <LineChart data={CHART_DATA} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} interval={4} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #e7e5e4' }}
                labelFormatter={(l) => `Date: ${l}`}
              />
              <Line
                type="monotone"
                dataKey="completions"
                stroke="#0d9488"
                strokeWidth={2}
                dot={false}
                name="Completions"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-xs text-stone-500">Mock data — last 30 days (prototype).</p>
      </div>
    </div>
  )
}

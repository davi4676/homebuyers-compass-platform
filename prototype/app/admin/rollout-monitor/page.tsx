'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { RefreshCw, AlertCircle, Download } from 'lucide-react'

interface RolloutMonitorResponse {
  generatedAt: string
  reminderStats: {
    totalRuns: number
    totalProcessed: number
    totalDeliveries: number
    totalFailures: number
    lastRunAt: string | null
    successRatePct: number | null
  }
  reminderRuns: Array<{
    id: string
    startedAt: string
    processed: number
    deliveries: number
    failures: number
  }>
  reminderChannels: {
    channelTotals: {
      email: number
      push: number
      'in-app': number
    }
    channelFailures: {
      email: number
      push: number
      'in-app': number
    }
  }
  reminderTrends: {
    hourly: { labels: string[]; values: number[]; total: number }
    daily: { labels: string[]; values: number[]; total: number }
  }
  pushStats: {
    total: number
    active: number
    inactive: number
    usersWithActive: number
    lastUpdatedAt: string | null
  }
  experimentStats: {
    totalEvents: number
    events24h: number
    byExperiment: Record<string, number>
    byEventName: Record<string, number>
    lastEventAt: string | null
  }
}

function formatDate(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}

function Sparkline({ values }: { values: number[] }) {
  if (values.length === 0) return null
  const width = 240
  const height = 60
  const max = Math.max(...values, 1)
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1 || 1)) * width
      const y = height - (v / max) * (height - 6) - 3
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-14">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-[rgb(var(--navy))]"
        points={points}
      />
    </svg>
  )
}

export default function RolloutMonitorPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<RolloutMonitorResponse | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/rollout-monitor', { credentials: 'include' })
      const body = await res.json()
      if (!res.ok) {
        setError(body?.error || 'Failed to load monitor data')
        setData(null)
        return
      }
      setData(body as RolloutMonitorResponse)
    } catch {
      setError('Failed to load monitor data')
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  const exportCsv = () => {
    if (!data) return
    const lines: string[] = []
    lines.push('section,key,value')
    lines.push(`summary,generatedAt,${data.generatedAt}`)
    lines.push(`reminderStats,totalRuns,${data.reminderStats.totalRuns}`)
    lines.push(`reminderStats,totalProcessed,${data.reminderStats.totalProcessed}`)
    lines.push(`reminderStats,totalDeliveries,${data.reminderStats.totalDeliveries}`)
    lines.push(`reminderStats,totalFailures,${data.reminderStats.totalFailures}`)
    lines.push(`reminderStats,successRatePct,${data.reminderStats.successRatePct ?? ''}`)
    lines.push(`reminderChannels,email_total,${data.reminderChannels.channelTotals.email}`)
    lines.push(`reminderChannels,push_total,${data.reminderChannels.channelTotals.push}`)
    lines.push(`reminderChannels,in_app_total,${data.reminderChannels.channelTotals['in-app']}`)
    lines.push(`reminderChannels,email_failures,${data.reminderChannels.channelFailures.email}`)
    lines.push(`reminderChannels,push_failures,${data.reminderChannels.channelFailures.push}`)
    lines.push(`reminderChannels,in_app_failures,${data.reminderChannels.channelFailures['in-app']}`)
    lines.push(`push,total,${data.pushStats.total}`)
    lines.push(`push,active,${data.pushStats.active}`)
    lines.push(`push,inactive,${data.pushStats.inactive}`)
    lines.push(`push,usersWithActive,${data.pushStats.usersWithActive}`)
    lines.push(`experiments,totalEvents,${data.experimentStats.totalEvents}`)
    lines.push(`experiments,events24h,${data.experimentStats.events24h}`)
    Object.entries(data.experimentStats.byExperiment).forEach(([key, value]) => {
      lines.push(`experimentByKey,${key},${value}`)
    })
    data.reminderRuns.forEach((run) => {
      lines.push(
        `reminderRun,${run.id},"startedAt=${run.startedAt}|processed=${run.processed}|deliveries=${run.deliveries}|failures=${run.failures}"`
      )
    })

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rollout-monitor-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Rollout Monitor</h1>
            <p className="text-sm text-slate-500">Reminders, push, and experiment telemetry</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/analytics-dashboard" className="text-sm text-slate-600 hover:text-slate-900">
              Analytics dashboard
            </Link>
            <button
              onClick={exportCsv}
              disabled={!data}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={load}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {loading && <p className="text-slate-500">Loading monitor data…</p>}
        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 flex items-center gap-2 text-rose-700">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {data && (
          <>
            <p className="text-xs text-slate-500">Updated: {formatDate(data.generatedAt)}</p>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Reminder runs</p>
                <p className="text-2xl font-bold">{data.reminderStats.totalRuns}</p>
                <p className="text-sm text-slate-600">Success rate: {data.reminderStats.successRatePct ?? '—'}%</p>
                <p className="text-xs text-slate-500 mt-1">Last run: {formatDate(data.reminderStats.lastRunAt)}</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Push subscriptions</p>
                <p className="text-2xl font-bold">{data.pushStats.active}</p>
                <p className="text-sm text-slate-600">Active of {data.pushStats.total} total</p>
                <p className="text-xs text-slate-500 mt-1">Users with active: {data.pushStats.usersWithActive}</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Experiment events</p>
                <p className="text-2xl font-bold">{data.experimentStats.totalEvents}</p>
                <p className="text-sm text-slate-600">Last 24h: {data.experimentStats.events24h}</p>
                <p className="text-xs text-slate-500 mt-1">Last event: {formatDate(data.experimentStats.lastEventAt)}</p>
              </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="rounded-xl border border-slate-200 bg-white p-4 lg:col-span-1">
                <h2 className="text-sm font-semibold mb-3">Reminder channel mix</h2>
                {(['email', 'push', 'in-app'] as const).map((channel) => {
                  const total = data.reminderChannels.channelTotals[channel]
                  const failures = data.reminderChannels.channelFailures[channel]
                  const grandTotal = Math.max(
                    1,
                    data.reminderChannels.channelTotals.email +
                      data.reminderChannels.channelTotals.push +
                      data.reminderChannels.channelTotals['in-app']
                  )
                  const widthPct = Math.round((total / grandTotal) * 100)
                  return (
                    <div key={channel} className="mb-3">
                      <div className="flex justify-between text-xs text-slate-600 mb-1">
                        <span>{channel}</span>
                        <span>
                          {total} total / {failures} failed
                        </span>
                      </div>
                      <div className="h-2 rounded bg-slate-100">
                        <div
                          className="h-2 rounded bg-[rgb(var(--navy))]"
                          style={{ width: `${widthPct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <h2 className="text-sm font-semibold mb-1">24h reminder delivery trend</h2>
                <p className="text-xs text-slate-500 mb-2">
                  Total deliveries in last 24h: {data.reminderTrends.hourly.total}
                </p>
                <Sparkline values={data.reminderTrends.hourly.values} />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>{data.reminderTrends.hourly.labels[0] || ''}</span>
                  <span>{data.reminderTrends.hourly.labels[data.reminderTrends.hourly.labels.length - 1] || ''}</span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <h2 className="text-sm font-semibold mb-1">7d reminder delivery trend</h2>
                <p className="text-xs text-slate-500 mb-2">
                  Total deliveries in last 7d: {data.reminderTrends.daily.total}
                </p>
                <Sparkline values={data.reminderTrends.daily.values} />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>{data.reminderTrends.daily.labels[0] || ''}</span>
                  <span>{data.reminderTrends.daily.labels[data.reminderTrends.daily.labels.length - 1] || ''}</span>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <h2 className="text-sm font-semibold mb-3">Recent reminder runs</h2>
                <div className="overflow-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-500 border-b border-slate-200">
                        <th className="py-2 pr-2">Started</th>
                        <th className="py-2 pr-2">Processed</th>
                        <th className="py-2 pr-2">Delivered</th>
                        <th className="py-2 pr-2">Failed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.reminderRuns.map((run) => (
                        <tr key={run.id} className="border-b border-slate-100">
                          <td className="py-2 pr-2">{formatDate(run.startedAt)}</td>
                          <td className="py-2 pr-2">{run.processed}</td>
                          <td className="py-2 pr-2">{run.deliveries}</td>
                          <td className="py-2 pr-2">{run.failures}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <h2 className="text-sm font-semibold mb-3">Experiment event counts</h2>
                <div className="space-y-2">
                  {Object.entries(data.experimentStats.byExperiment).length === 0 && (
                    <p className="text-sm text-slate-500">No experiment events yet.</p>
                  )}
                  {Object.entries(data.experimentStats.byExperiment).map(([key, count]) => (
                    <div key={key} className="flex items-center justify-between text-sm border-b border-slate-100 pb-1">
                      <span className="text-slate-700">{key}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  )
}


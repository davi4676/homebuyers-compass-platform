'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import {
  MOCK_LEADS,
  PIPELINE_SPARKLINES,
  type LeadStatus,
  scoreBadgeClass,
} from '@/lib/professional-mock-leads'
import BackToMyJourneyLink from '@/components/BackToMyJourneyLink'

const FILTERS: { id: LeadStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'new', label: 'New' },
  { id: 'qualified', label: 'Qualified' },
  { id: 'pipeline', label: 'In Pipeline' },
  { id: 'closed', label: 'Closed' },
]

function MiniSparkline({ values, color }: { values: readonly number[]; color: string }) {
  const w = 72
  const h = 28
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * (w - 4) + 2
      const y = h - 2 - ((v - min) / span) * (h - 8)
      return `${x},${y}`
    })
    .join(' ')
  return (
    <svg width={w} height={h} className="shrink-0" aria-hidden>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pts}
      />
    </svg>
  )
}

export default function ProfessionalDashboard() {
  const [filter, setFilter] = useState<LeadStatus | 'all'>('all')
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    return MOCK_LEADS.filter((lead) => {
      if (filter !== 'all' && lead.status !== filter) return false
      const s = `${lead.name} ${lead.location}`.toLowerCase()
      return s.includes(q.trim().toLowerCase())
    })
  }, [filter, q])

  return (
    <div className="app-page-shell">
      <nav className="border-b border-[#e7e5e4] bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="font-display text-xl font-bold text-[#1a6b3c]">
            NestQuest Pro
          </Link>
          <span className="text-sm text-[#57534e]">Lead Inbox</span>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-4">
          <BackToMyJourneyLink />
        </div>
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-[#1c1917]">Lead Inbox</h1>
          <p className="mt-1 text-[#57534e]">Manage and convert your qualified leads</p>
        </div>

        <section className="mb-8 rounded-xl border border-[#e7e5e4] bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <p className="text-xs font-bold uppercase tracking-wide text-[#78716c]">Pipeline overview</p>
            <span className="rounded-full bg-[#f5f5f4] px-3 py-1 text-xs font-semibold text-[#57534e]">
              This Month
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'New Leads', value: 12, spark: PIPELINE_SPARKLINES.newLeads, color: '#0d9488' },
              { label: 'Qualified', value: 8, spark: PIPELINE_SPARKLINES.qualified, color: '#1a6b3c' },
              { label: 'In Pipeline', value: 5, spark: PIPELINE_SPARKLINES.pipeline, color: '#c0622a' },
              { label: 'Closed', value: 24, spark: PIPELINE_SPARKLINES.closed, color: '#78716c' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex items-center justify-between gap-3 rounded-xl border border-[#e7e5e4] bg-[#fafaf9] px-4 py-3"
              >
                <div>
                  <p className="text-xs font-medium text-[#57534e]">{stat.label}</p>
                  <p className="font-display text-2xl font-bold tabular-nums text-[#1c1917]">{stat.value}</p>
                </div>
                <MiniSparkline values={stat.spark} color={stat.color} />
              </div>
            ))}
          </div>
        </section>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter leads">
            {FILTERS.map((f) => {
              const active = filter === f.id
              return (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(f.id)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? 'bg-[#1a6b3c] text-white shadow-sm'
                      : 'border border-[#e7e5e4] bg-white text-[#57534e] hover:border-[#1a6b3c]/40'
                  }`}
                >
                  {f.label}
                </button>
              )
            })}
          </div>
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a8a29e]" />
            <label htmlFor="lead-search" className="sr-only">
              Search leads
            </label>
            <input
              id="lead-search"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search leads by name or location"
              className="w-full rounded-xl border border-[#e7e5e4] bg-white py-2.5 pl-10 pr-3 text-sm text-[#1c1917] outline-none ring-[#0d9488]/30 focus:ring-2"
            />
          </div>
        </div>

        <ul className="space-y-4">
          {filtered.map((lead) => (
            <li key={lead.id}>
              <article className="rounded-xl border border-[#e7e5e4] bg-white p-5 shadow-sm transition hover:border-[#0d9488]/40 hover:shadow-md">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-xl font-semibold text-[#1c1917]">{lead.name}</h2>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ${scoreBadgeClass(lead.score)}`}
                      >
                        Score {lead.score}
                      </span>
                      <span className="rounded-full bg-[#f5f5f4] px-2.5 py-0.5 text-xs font-semibold text-[#57534e]">
                        {lead.buyerType}
                      </span>
                      <span className="text-xs text-[#78716c]">
                        Last activity {new Date(lead.lastActivity).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/professional/lead/${lead.id}`}
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-[#1a6b3c] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#155c33]"
                  >
                    View Profile →
                  </Link>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                  <div>
                    <dt className="text-[#78716c]">Location</dt>
                    <dd className="font-medium text-[#1c1917]">{lead.location}</dd>
                  </div>
                  <div>
                    <dt className="text-[#78716c]">Income</dt>
                    <dd className="font-medium text-[#1c1917]">{lead.incomeRange}</dd>
                  </div>
                  <div>
                    <dt className="text-[#78716c]">Timeline</dt>
                    <dd className="font-medium text-[#1c1917]">{lead.timeline}</dd>
                  </div>
                  <div>
                    <dt className="text-[#78716c]">Stage</dt>
                    <dd className="font-medium text-[#1c1917]">
                      {lead.status === 'pipeline'
                        ? 'In pipeline'
                        : lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                    </dd>
                  </div>
                </dl>
              </article>
            </li>
          ))}
        </ul>

        {filtered.length === 0 ? (
          <p className="mt-8 text-center text-[#57534e]">No leads match your filters.</p>
        ) : null}
      </div>
    </div>
  )
}

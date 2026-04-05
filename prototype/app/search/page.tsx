'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, ArrowRight } from 'lucide-react'
import BackToMyJourneyLink from '@/components/BackToMyJourneyLink'

const DESTINATIONS: { title: string; href: string; description: string; terms: string }[] = [
  { title: 'Playbooks', href: '/resources', description: 'Guides, scripts, and checklists', terms: 'resources playbook guide learn education' },
  { title: 'My Journey', href: '/customized-journey', description: 'Your personalized roadmap', terms: 'journey roadmap customized phases' },
  { title: 'Quiz & savings snapshot', href: '/quiz', description: 'Assessment and results', terms: 'quiz assessment results savings' },
  { title: 'Inbox', href: '/inbox', description: 'Actions and reminders', terms: 'inbox notifications tasks' },
  { title: 'Upgrade & plans', href: '/upgrade', description: 'Momentum, Navigator, pricing', terms: 'upgrade pricing plan subscription trial momentum' },
  { title: 'Refinance Optimizer', href: '/refinance-optimizer', description: 'Rates, break-even, cash-out', terms: 'refinance refi rate radar' },
  { title: 'Find funds', href: '/down-payment-optimizer', description: 'Down payment help', terms: 'down payment dpa assistance grants' },
  { title: 'Marketplace', href: '/marketplace', description: 'Partner tools and offers', terms: 'marketplace partners' },
  { title: 'Homebuyer hub', href: '/homebuyer', description: 'Paths for buyers and owners', terms: 'homebuyer home buyer start' },
  { title: 'For organizations', href: '/for-professionals', description: 'B2B: HUD agencies, CUs, CDFIs', terms: 'professionals organizations enterprise b2b hud cdfi credit union counseling procurement' },
]

function matchesQuery(q: string, row: (typeof DESTINATIONS)[0]): boolean {
  if (!q.trim()) return true
  const n = q.trim().toLowerCase()
  const hay = `${row.title} ${row.description} ${row.terms}`.toLowerCase()
  return hay.includes(n)
}

export default function SearchPage() {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => DESTINATIONS.filter((d) => matchesQuery(query, d)), [query])

  return (
    <div className="app-page-shell">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <BackToMyJourneyLink />
        </div>
        <h1 className="font-display text-3xl font-bold text-millennial-text">Search</h1>
        <p className="mt-2 text-sm text-millennial-text-muted">Jump to a page or tool — results filter as you type.</p>

        <div className="relative mt-6">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-millennial-text-muted"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages and tools…"
            className="w-full rounded-xl border border-millennial-border bg-white py-3 pl-11 pr-4 text-millennial-text shadow-sm outline-none ring-millennial-cta-primary/20 placeholder:text-millennial-text-muted focus:border-millennial-cta-primary focus:ring-2"
            autoComplete="off"
            autoFocus
            aria-label="Search NestQuest"
          />
        </div>

        <ul className="mt-8 divide-y divide-millennial-border rounded-xl border border-millennial-border bg-white">
          {filtered.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-millennial-text-muted">No matches. Try “journey”, “quiz”, or “refinance”.</li>
          ) : (
            filtered.map((d) => (
              <li key={d.href}>
                <Link
                  href={d.href}
                  className="flex items-center justify-between gap-3 px-4 py-4 transition-colors hover:bg-millennial-primary-light/20"
                >
                  <div>
                    <p className="font-semibold text-millennial-text">{d.title}</p>
                    <p className="text-sm text-millennial-text-muted">{d.description}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0 text-millennial-cta-primary" aria-hidden />
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  )
}

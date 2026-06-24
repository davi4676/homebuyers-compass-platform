'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import BackToMyJourneyLink from '@/components/BackToMyJourneyLink'
import { GLOSSARY, GLOSSARY_PLAIN_LABEL, getGlossaryTermIds, type GlossaryTermId } from '@/lib/glossary'

export default function GlossaryPage() {
  const [query, setQuery] = useState('')
  const termIds = useMemo(() => getGlossaryTermIds(), [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return termIds
    return termIds.filter((id) => {
      const hay = `${id} ${GLOSSARY_PLAIN_LABEL[id]} ${GLOSSARY[id]}`.toLowerCase()
      return hay.includes(q)
    })
  }, [query, termIds])

  return (
    <div className="app-page-shell">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="mb-6">
          <BackToMyJourneyLink />
        </div>
        <h1 className="font-display text-3xl font-bold text-[#1c1917]">Homebuying glossary</h1>
        <p className="mt-2 text-sm leading-relaxed text-[#57534e]">
          Plain-English definitions for terms you will see in guides, lender forms, and your NestQuest journey.{' '}
          <Link href="/resources" className="font-semibold text-[#0d9488] hover:underline">
            Back to Playbooks
          </Link>
        </p>

        <div className="relative mt-6">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#78716c]"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search terms…"
            className="w-full rounded-xl border border-[#e7e5e4] bg-white py-3 pl-11 pr-4 text-[#1c1917] shadow-sm outline-none placeholder:text-[#78716c] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20"
            aria-label="Search glossary"
          />
        </div>

        <dl className="mt-8 space-y-4">
          {filtered.length === 0 ? (
            <p className="text-sm text-[#78716c]">No matches. Try &ldquo;PMI&rdquo;, &ldquo;escrow&rdquo;, or &ldquo;DTI&rdquo;.</p>
          ) : (
            filtered.map((id: GlossaryTermId) => (
              <div
                key={id}
                id={`term-${id.replace(/\s+/g, '-').toLowerCase()}`}
                className="rounded-xl border border-[#e7e5e4] bg-white p-4 shadow-sm"
              >
                <dt className="font-semibold text-[#1c1917]">{GLOSSARY_PLAIN_LABEL[id]}</dt>
                <dd className="mt-1 text-xs font-medium uppercase tracking-wide text-[#78716c]">{id}</dd>
                <dd className="mt-2 text-sm leading-relaxed text-[#57534e]">{GLOSSARY[id]}</dd>
              </div>
            ))
          )}
        </dl>

        <p className="mt-10 text-sm text-[#78716c]">
          {termIds.length} terms ·{' '}
          <Link href="/resources" className="font-semibold text-[#0d9488] hover:underline">
            Playbooks
          </Link>{' '}
          ·{' '}
          <Link href="/quiz" className="font-semibold text-[#0d9488] hover:underline">
            Take the quiz
          </Link>
        </p>
      </div>
    </div>
  )
}

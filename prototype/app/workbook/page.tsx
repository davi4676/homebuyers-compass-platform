'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Lock, Printer, Mail } from 'lucide-react'
import BackToMyJourneyLink from '@/components/BackToMyJourneyLink'
import { getUserTier } from '@/lib/user-tracking'
import { tierAtLeast, type UserTier } from '@/lib/tiers'

type WorkbookSection = {
  id: string
  title: string
  phase: string
  momentumOnly?: boolean
  items: string[]
}

const WORKBOOK_SECTIONS: WorkbookSection[] = [
  {
    id: 'documents',
    title: 'Document checklist',
    phase: 'Preparation',
    items: [
      'Government-issued photo ID',
      'Last 2 years W-2s or 1099s',
      '2 recent pay stubs',
      '2 years tax returns',
      '2 months bank statements (all accounts)',
      'List of monthly debt payments',
      'Gift letter (if using gift funds)',
    ],
  },
  {
    id: 'lender-compare',
    title: 'Lender comparison worksheet',
    phase: 'Pre-approval',
    items: [
      'Lender name: _______________  Rate: _____  APR: _____',
      'Section A origination fees: $________',
      'Section C title (if quoted): $________',
      'Cash to close estimate: $________',
      'Rate lock expiration: __________',
      'Notes / lender credits offered: ________________________________',
    ],
  },
  {
    id: 'inspection',
    title: 'Inspection day checklist',
    phase: 'Negotiation',
    momentumOnly: true,
    items: [
      'Roof age and visible damage',
      'Foundation cracks or uneven floors',
      'HVAC age and test heat/cool',
      'Electrical panel (type and capacity)',
      'Plumbing leaks, water stains, or mold',
      'Windows and doors seal properly',
      'Major repairs to negotiate: ________________________________',
    ],
  },
  {
    id: 'closing-day',
    title: 'Closing day checklist',
    phase: 'Closing',
    momentumOnly: true,
    items: [
      'Final walk-through completed',
      'Closing Disclosure reviewed vs Loan Estimate',
      'Wire instructions verified by phone (not email alone)',
      'Photo ID packed',
      'Cashier\'s check or wire confirmed for cash to close',
      'Homeowners insurance proof ready',
    ],
  },
  {
    id: 'maintenance',
    title: 'First-year maintenance planner',
    phase: 'Post-closing',
    momentumOnly: true,
    items: [
      'Annual maintenance budget (1–3% of home value): $________',
      'Emergency fund target (3–6 months expenses): $________',
      'HVAC filter schedule: __________',
      'Gutter cleaning: __________',
      'Smoke/CO detector test dates: __________',
      'Insurance renewal date: __________',
    ],
  },
]

export default function WorkbookPage() {
  const [tier, setTier] = useState<UserTier>('foundations')
  const [email, setEmail] = useState('')
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  useEffect(() => {
    setTier(getUserTier())
  }, [])

  const hasMomentum = tierAtLeast(tier, 'momentum')

  const visibleSections = WORKBOOK_SECTIONS.filter((s) => !s.momentumOnly || hasMomentum)

  const handleEmailWorkbook = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setEmailStatus('sending')
    try {
      const res = await fetch('/api/leads/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), template: 'pre-purchase-workbook', source: 'workbook' }),
      })
      const data = await res.json()
      setEmailStatus(data.ok ? 'sent' : 'error')
    } catch {
      setEmailStatus('error')
    }
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .workbook-section {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          body {
            background: white !important;
          }
        }
      `}</style>
      <div className="app-page-shell min-h-screen bg-slate-50 print:bg-white">
        <div className="no-print mx-auto max-w-3xl px-4 py-6">
          <BackToMyJourneyLink />
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-800"
            >
              <Printer className="h-4 w-4" aria-hidden />
              Print workbook
            </button>
            {!hasMomentum ? (
              <Link
                href="/upgrade?source=workbook-full&tier=momentum"
                className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-bold text-amber-900 hover:bg-amber-100"
              >
                <Lock className="h-4 w-4" aria-hidden />
                Unlock full workbook (Momentum)
              </Link>
            ) : null}
          </div>
        </div>

        <main className="mx-auto max-w-3xl px-4 pb-16 print:px-8 print:py-8">
          <header className="workbook-section border-b border-slate-200 pb-8 print:border-teal-800">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-800">NestQuest Workbook</p>
            <h1 className="mt-2 font-display text-3xl font-bold text-slate-900">Pre-purchase workbook</h1>
            <p className="mt-3 text-slate-600">
              Print and fill in as you go. Phases 1–2 are free; inspection, closing, and maintenance worksheets unlock
              with Momentum.
            </p>
          </header>

          <div className="no-print mt-8 rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="flex items-center gap-2 font-semibold text-slate-900">
              <Mail className="h-5 w-5 text-teal-700" aria-hidden />
              Email me a link to this workbook
            </h2>
            <form onSubmit={handleEmailWorkbook} className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                aria-label="Email address"
              />
              <button
                type="submit"
                disabled={emailStatus === 'sending'}
                className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-bold text-white hover:bg-teal-800 disabled:opacity-60"
              >
                {emailStatus === 'sending' ? 'Sending…' : 'Send link'}
              </button>
            </form>
            {emailStatus === 'sent' ? (
              <p className="mt-2 text-sm text-teal-700">Check your inbox for the workbook link.</p>
            ) : null}
            {emailStatus === 'error' ? (
              <p className="mt-2 text-sm text-red-600">Could not send — try again or print this page.</p>
            ) : null}
          </div>

          <div className="mt-10 space-y-10">
            {WORKBOOK_SECTIONS.map((section) => {
              const locked = section.momentumOnly && !hasMomentum
              return (
                <section
                  key={section.id}
                  id={section.id}
                  className={`workbook-section rounded-xl border p-6 print:rounded-none print:border-slate-400 print:shadow-none ${
                    locked ? 'border-dashed border-slate-300 bg-slate-100/80 opacity-80' : 'border-slate-200 bg-white shadow-sm'
                  }`}
                >
                  <p className="text-xs font-bold uppercase tracking-wide text-teal-700">{section.phase}</p>
                  <h2 className="mt-1 font-display text-xl font-bold text-slate-900">{section.title}</h2>
                  {locked ? (
                    <p className="mt-2 flex items-center gap-2 text-sm text-amber-800">
                      <Lock className="h-4 w-4" aria-hidden />
                      Included with Momentum —{' '}
                      <Link href="/upgrade?source=workbook-section&tier=momentum" className="font-semibold underline">
                        upgrade to unlock
                      </Link>
                    </p>
                  ) : (
                    <ul className="mt-4 list-none space-y-2">
                      {section.items.map((item) => (
                        <li key={item} className="flex gap-3 text-sm text-slate-700">
                          <span className="mt-0.5 h-4 w-4 shrink-0 rounded border border-slate-400 print:border-slate-600" aria-hidden />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              )
            })}
          </div>

          <p className="workbook-section mt-10 text-xs text-slate-500 print:mt-8">
            NestQuest workbook — for personal planning only. Not legal or financial advice. Verify all numbers with your
            lender and professionals.
          </p>
        </main>
      </div>
    </>
  )
}

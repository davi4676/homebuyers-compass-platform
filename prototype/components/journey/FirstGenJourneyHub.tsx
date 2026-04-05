'use client'

import Link from 'next/link'
import { BookOpen, ExternalLink, Gift, MessagesSquare } from 'lucide-react'
import FirstGenHub from '@/components/results/FirstGenHub'
import type { JourneyTab } from '@/lib/journey-nav-tabs'
import { journeyTabHref } from '@/lib/journey-nav-tabs'

const GIFT_FUNDS_GUIDE_URL =
  'https://www.consumerfinance.gov/owning-a-home/sources-of-financial-help-for-homebuyers/'

type Props = { goTab: (t: JourneyTab) => void }

export default function FirstGenJourneyHub({ goTab }: Props) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">First-Gen Hub</h2>
          <p className="mt-2 max-w-prose text-slate-600">
            Counselors, program matches, plain-language help, and conversation starters — organized so you do not
            have to hunt through jargon.
          </p>
        </div>
      </div>

      <FirstGenHub context="journey" />

      <div>
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600">More first-gen resources</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Link
            href="/resources"
            className="group rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm transition hover:border-teal-200 hover:shadow-md"
          >
            <BookOpen className="h-8 w-8 text-teal-700" aria-hidden />
            <p className="mt-3 font-semibold text-slate-900">Glossary &amp; playbooks</p>
            <p className="mt-1 text-sm text-slate-600">
              Plain-language explainers for terms like DTI, PMI, and escrow — plus longer guides when you are ready.
            </p>
            <span className="mt-3 inline-block text-sm font-bold text-teal-900">Open Resources →</span>
          </Link>

          <a
            href={GIFT_FUNDS_GUIDE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm transition hover:border-teal-200 hover:shadow-md"
          >
            <Gift className="h-8 w-8 text-teal-700" aria-hidden />
            <p className="mt-3 font-semibold text-slate-900">Gift funds &amp; help from family</p>
            <p className="mt-1 text-sm text-slate-600">
              How gift letters work and what lenders usually need to document — from a trusted consumer source.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-teal-900">
              Read the guide <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </span>
          </a>

          <button
            type="button"
            onClick={() => goTab('library')}
            className="rounded-2xl border border-slate-200/90 bg-white p-4 text-left shadow-sm transition hover:border-teal-200 hover:shadow-md"
          >
            <MessagesSquare className="h-8 w-8 text-teal-700" aria-hidden />
            <p className="mt-3 font-semibold text-slate-900">Family conversation scripts</p>
            <p className="mt-1 text-sm text-slate-600">
              Open the Library tab for scripts and checklists you can use with parents, partners, and co-buyers.
            </p>
            <span className="mt-3 inline-block text-sm font-bold text-teal-900">Open Library tab →</span>
          </button>

          <Link
            href={journeyTabHref('assistance')}
            className="group rounded-2xl border border-slate-200/90 bg-gradient-to-br from-teal-50/80 to-white p-4 shadow-sm transition hover:border-teal-300 hover:shadow-md"
          >
            <p className="font-semibold text-slate-900">DPA matched to you</p>
            <p className="mt-1 text-sm text-slate-600">
              The Assistance tab lists down payment and closing-cost programs for your state and income — start there
              after you skim this hub.
            </p>
            <span className="mt-3 inline-block text-sm font-bold text-teal-900">Go to Assistance →</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

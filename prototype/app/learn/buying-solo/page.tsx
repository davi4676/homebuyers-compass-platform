'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, MapPin, UserRound } from 'lucide-react'
import BackToMyJourneyLink from '@/components/BackToMyJourneyLink'
import {
  SOLO_ADVOCATE_CHECKLIST_ITEMS,
  SOLO_ADVOCATE_CHECKLIST_LS_KEY,
} from '@/lib/solo-advocate-checklist-items'

export default function BuyingSoloLearnPage() {
  const [done, setDone] = useState<Record<string, boolean>>({})

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SOLO_ADVOCATE_CHECKLIST_LS_KEY)
      if (raw) setDone(JSON.parse(raw) as Record<string, boolean>)
    } catch {
      /* ignore */
    }
  }, [])

  const persist = (next: Record<string, boolean>) => {
    setDone(next)
    try {
      localStorage.setItem(SOLO_ADVOCATE_CHECKLIST_LS_KEY, JSON.stringify(next))
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="app-page-shell">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-3 px-4 py-4">
          <BackToMyJourneyLink />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-800">Learn · Buying solo</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-slate-900">Guides for buying on your own</h1>
        <p className="mt-3 text-slate-600">
          One income, one signature, and no default partner to sanity-check the scary moments. These sections mirror the
          cards on your journey&apos;s Learn tab.
        </p>

        <section id="qualifying-on-one-income" className="scroll-mt-28 mt-12 border-t border-slate-200 pt-10">
          <h2 className="text-xl font-bold text-slate-900">Qualifying on One Income</h2>
          <p className="mt-3 text-slate-700">
            Lenders care about <strong className="font-semibold">debt-to-income (DTI)</strong>,{' '}
            <strong className="font-semibold">reserves</strong> after closing, and how stable your income looks. When
            there is only one borrower, there is no second wage to offset a thin file — so documentation and staying
            under payment caps matter more.
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-700">
            <li>Ask each lender for the <strong className="font-semibold">maximum payment</strong> you qualify for at your target down payment — then set your own lower comfort cap.</li>
            <li>Build or keep <strong className="font-semibold">reserves</strong> (often a few months of housing payment after closing) so a single income hiccup does not derail underwriting.</li>
            <li>If you have a co-borrower in mind, compare scenarios: sometimes staying solo keeps the file simpler; sometimes a coborrower unlocks price band — your loan officer can model both.</li>
          </ul>
          <Link
            href="/mortgage-shopping?icp=solo"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[rgb(var(--navy))] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:opacity-95"
          >
            Open Mortgage Shopping (personalized for solo)
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </section>

        <section id="advocate-checklist" className="scroll-mt-28 mt-12 border-t border-slate-200 pt-10">
          <div className="flex items-center gap-2">
            <UserRound className="h-7 w-7 text-teal-700" aria-hidden />
            <h2 className="text-xl font-bold text-slate-900">The Advocate Checklist</h2>
          </div>
          <p className="mt-3 text-slate-700">
            Use this as your stand-in for a partner&apos;s second opinion. Checking items off is saved on this device —
            same list as on your results page if you took the quiz as a solo buyer.
          </p>
          <ul className="mt-6 space-y-4">
            {SOLO_ADVOCATE_CHECKLIST_ITEMS.map(({ id, title, detail }) => (
              <li key={id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <label className="flex cursor-pointer gap-3">
                  <input
                    type="checkbox"
                    checked={!!done[id]}
                    onChange={(e) => persist({ ...done, [id]: e.target.checked })}
                    className="mt-1 h-5 w-5 shrink-0 accent-teal-600"
                  />
                  <span>
                    <span className="font-semibold text-slate-900">{title}</span>
                    <span className="mt-1 block text-sm text-slate-600">{detail}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
          <Link
            href="/map"
            className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-teal-900 underline decoration-teal-400 underline-offset-2 hover:text-teal-950"
          >
            <MapPin className="h-4 w-4 shrink-0" aria-hidden />
            Compare neighborhoods (walkability &amp; livability links)
          </Link>
        </section>

        <section id="negotiating-without-a-partner" className="scroll-mt-28 mt-12 border-t border-slate-200 pt-10">
          <h2 className="text-xl font-bold text-slate-900">Negotiating Without a Partner</h2>
          <p className="mt-3 text-slate-700">
            You still deserve time to think. Use written counters, inspection contingencies, and explicit pause lines so
            you are not rushed on the phone.
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-700">
            <li>
              <strong className="font-semibold">Offer rhythm:</strong> It is OK to say you will respond by a specific
              time tomorrow — that reads as professional, not hesitant.
            </li>
            <li>
              <strong className="font-semibold">Inspection leverage:</strong> Lead with safety and major systems; skip
              nickel-and-diming so sellers take your asks seriously.
            </li>
            <li>
              <strong className="font-semibold">Emotional guardrail:</strong> Before you sign, run your max price and
              monthly payment past your checklist walk-away number — not just the listing&apos;s charm.
            </li>
          </ul>
          <p className="mt-4 text-sm text-slate-600">
            Deeper scripts live in your journey&apos;s <strong className="font-medium text-slate-800">Library</strong>{' '}
            tab; Navigator+ adds human review when you want an expert on your offer before you submit.
          </p>
          <Link
            href="/customized-journey?tab=library"
            className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-violet-800 underline underline-offset-2 hover:text-violet-950"
          >
            Open Library from your journey
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </section>
      </main>
    </div>
  )
}

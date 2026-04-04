'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/calculations'
import PlainEnglishText from '@/components/PlainEnglishText'
import GlossaryTooltip from '@/components/GlossaryTooltip'
import { usePlainEnglish } from '@/lib/hooks/usePlainEnglish'
import { applyPlainEnglishCopy } from '@/lib/plain-english'

const STATES = [
  'AL',
  'AK',
  'AZ',
  'AR',
  'CA',
  'CO',
  'CT',
  'FL',
  'GA',
  'TX',
  'NY',
  'NC',
  'OH',
  'PA',
  'WA',
] as const

type ProgramRow = { name: string; max: number; income: string; propertyType: string }

const PROGRAMS: Record<string, ProgramRow[]> = {
  TX: [
    { name: 'Texas Homebuyer Program', max: 17500, income: '≤115% AMI', propertyType: 'Primary' },
    { name: 'City of Austin TDHCA', max: 14000, income: '≤80% AMI', propertyType: 'Primary, 1-unit' },
    { name: 'SETH Gold Grant', max: 12000, income: '≤$120k household', propertyType: 'Primary' },
    { name: 'Homes for Texas Heroes', max: 15000, income: 'Career-based', propertyType: 'Primary' },
    { name: 'My First Texas Home', max: 5000, income: 'Program caps apply', propertyType: 'Primary' },
  ],
  default: [
    { name: 'State Housing Finance Agency (HFA)', max: 15000, income: '≤80–120% AMI', propertyType: 'Primary' },
    { name: 'Local First-Time Buyer Grant', max: 10000, income: '≤$100k', propertyType: 'Primary' },
    { name: 'Community Seconds / Silent Second', max: 25000, income: 'Varies', propertyType: 'Primary' },
    { name: 'Workforce Housing Initiative', max: 8000, income: '≤115% AMI', propertyType: 'Primary' },
    { name: 'Down Payment Assistance (DPA) Pool', max: 12000, income: '≤100% AMI', propertyType: '1–4 units' },
  ],
}

export default function AssistanceProgramsTab() {
  const plainEnglish = usePlainEnglish()
  const [state, setState] = useState<string>('TX')
  const rows = useMemo(() => {
    if (state === 'OTHER') return PROGRAMS.default
    return PROGRAMS[state] ?? PROGRAMS.default
  }, [state])
  const totalPotential = useMemo(() => rows.reduce((s, r) => s + r.max, 0), [rows])

  return (
    <div
      role="tabpanel"
      id="journey-panel-assistance"
      aria-labelledby="journey-tab-assistance"
      className="scroll-mt-28 space-y-6"
    >
      <div>
        <PlainEnglishText
          as="h2"
          className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
          text="Assistance programs"
        />
        <PlainEnglishText
          as="p"
          className="mt-2 max-w-prose text-slate-600"
          text="Illustrative programs for your state — verify eligibility with each administrator. Full discovery lives in the optimizer."
        />
        <p className="mt-2 text-xs text-slate-500">
          Income limits often reference <GlossaryTooltip term="AMI">AMI</GlossaryTooltip> (area median income). Many offers
          are <GlossaryTooltip term="DPA">DPA</GlossaryTooltip> (down payment assistance).
        </p>
      </div>

      <div className="max-w-xs">
        <label className="block text-sm font-semibold text-slate-700" htmlFor="assistance-state">
          State
        </label>
        <select
          id="assistance-state"
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm"
        >
          {STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
          <option value="OTHER">Other / Not listed</option>
        </select>
      </div>

      <p className="text-sm text-slate-700">
        {applyPlainEnglishCopy('Programs found in ', plainEnglish)}
        <strong>{state === 'OTHER' ? 'your area' : state}</strong>
        {': '}
        <strong>{rows.length}</strong>
        {applyPlainEnglishCopy(' · Total potential assistance (upper range): ', plainEnglish)}
        <strong className="text-emerald-700">{formatCurrency(totalPotential)}</strong>
      </p>

      <ul className="space-y-3">
        {rows.map((p) => (
          <li
            key={p.name}
            className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-bold text-slate-900">{p.name}</p>
              <p className="mt-1 text-sm text-slate-600">
                Up to {formatCurrency(p.max)} · Income: {p.income} · {p.propertyType}
              </p>
            </div>
            <button
              type="button"
              className="inline-flex shrink-0 items-center justify-center rounded-xl border-2 border-slate-200 px-4 py-2 text-sm font-bold text-slate-800 hover:border-teal-300 hover:bg-teal-50"
            >
              {applyPlainEnglishCopy('Check Eligibility', plainEnglish)}
            </button>
          </li>
        ))}
      </ul>

      <div className="rounded-2xl border border-teal-200 bg-teal-50/80 p-5">
        <PlainEnglishText as="p" className="text-sm font-semibold text-slate-800" text="Want the full scan?" />
        <Link
          href="/down-payment-optimizer"
          className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-teal-800 underline"
        >
          {applyPlainEnglishCopy('Open full down payment optimizer →', plainEnglish)}
        </Link>
      </div>
    </div>
  )
}

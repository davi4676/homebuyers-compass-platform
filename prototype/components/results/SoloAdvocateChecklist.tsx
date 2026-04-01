'use client'

import { useEffect, useState } from 'react'
import { UserRound } from 'lucide-react'

const LS_KEY = 'nq_solo_advocate_checklist_v1'

const ITEMS: { id: string; title: string; detail: string }[] = [
  {
    id: 'preapprove',
    title: 'Get pre-approved before touring',
    detail:
      'A pre-approval letter shows sellers you can close and helps you set a real budget — so you don’t fall in love with homes above what lenders will support.',
  },
  {
    id: 'inspection',
    title: 'Always get an independent inspection',
    detail:
      'An inspector works for you, not the seller. They catch expensive issues early so you can negotiate repairs or walk away before you’re committed.',
  },
  {
    id: 'closing',
    title: 'Negotiate closing costs separately',
    detail:
      'Lender fees, title, and third-party charges aren’t fixed. Comparing at least three lenders and asking line-by-line often saves thousands.',
  },
  {
    id: 'dti',
    title: 'Understand your DTI ceiling',
    detail:
      'Debt-to-income caps how much payment lenders allow. Knowing yours stops you from stretching into a payment that breaks your monthly budget.',
  },
  {
    id: 'walkaway',
    title: 'Know your walk-away number',
    detail:
      'Decide the max price and monthly payment you’ll accept before you bid. A clear ceiling protects you from emotional overspending.',
  },
]

const NEIGHBORHOOD_LABEL: Record<string, string> = {
  safety: 'Safety ratings',
  schools: 'School quality',
  walkability: 'Walkability',
  commute: 'Commute time',
  community: 'Community feel',
}

type Props = { neighborhoodPriority?: string | null }

/** Section 7 — Solo buyer advocate checklist with persistent checkboxes. */
export default function SoloAdvocateChecklist({ neighborhoodPriority }: Props) {
  const [done, setDone] = useState<Record<string, boolean>>({})

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) setDone(JSON.parse(raw) as Record<string, boolean>)
    } catch {
      /* ignore */
    }
  }, [])

  const persist = (next: Record<string, boolean>) => {
    setDone(next)
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(next))
    } catch {
      /* ignore */
    }
  }

  const neighLabel = neighborhoodPriority ? NEIGHBORHOOD_LABEL[neighborhoodPriority] : null

  return (
    <div className="mt-6 rounded-2xl border border-sky-200/90 bg-gradient-to-br from-sky-50/95 to-white p-5 sm:p-6 shadow-sm dark:border-slate-600 dark:from-slate-900 dark:to-slate-900/80">
      <div className="flex items-center gap-2">
        <UserRound className="h-6 w-6 text-sky-700 dark:text-sky-300" aria-hidden />
        <h3 className="text-lg font-bold text-brand-forest dark:text-white">What Every Solo Buyer Should Know</h3>
      </div>
      {neighLabel ? (
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          You prioritized <strong className="text-brand-forest dark:text-emerald-200">{neighLabel}</strong> — we’ll emphasize neighborhood fit and safety in your roadmap.
        </p>
      ) : (
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Check items as you complete them; your progress is saved on this device.
        </p>
      )}

      <ul className="mt-4 space-y-4">
        {ITEMS.map(({ id, title, detail }) => (
          <li key={id} className="rounded-xl border border-slate-200 bg-white/90 p-4 dark:border-slate-700 dark:bg-slate-800/80">
            <label className="flex cursor-pointer gap-3">
              <input
                type="checkbox"
                checked={!!done[id]}
                onChange={(e) => persist({ ...done, [id]: e.target.checked })}
                className="mt-1 h-5 w-5 shrink-0 accent-brand-terracotta"
              />
              <span>
                <span className="font-semibold text-slate-900 dark:text-white">{title}</span>
                <span className="mt-1 block text-sm text-slate-600 dark:text-slate-400">{detail}</span>
              </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  )
}

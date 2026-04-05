'use client'

import { useEffect, useState } from 'react'
import { UserRound } from 'lucide-react'
import {
  SOLO_ADVOCATE_CHECKLIST_ITEMS,
  SOLO_ADVOCATE_CHECKLIST_LS_KEY,
} from '@/lib/solo-advocate-checklist-items'

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

  const neighLabel = neighborhoodPriority ? NEIGHBORHOOD_LABEL[neighborhoodPriority] : null

  return (
    <div className="mt-6 rounded-2xl border border-teal-200/90 bg-gradient-to-br from-teal-50/95 to-white p-5 sm:p-6 shadow-sm dark:border-slate-600 dark:from-slate-900 dark:to-slate-900/80">
      <div className="flex items-center gap-2">
        <UserRound className="h-6 w-6 text-teal-700 dark:text-teal-300" aria-hidden />
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
        {SOLO_ADVOCATE_CHECKLIST_ITEMS.map(({ id, title, detail }) => (
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

'use client'

import { useEffect, useState } from 'react'
import { X } from '@phosphor-icons/react'
import { Target, PiggyBank, CheckCircle } from 'lucide-react'

const DISMISS_KEY = 'nq_journey_value_pillars_dismissed'

const PILLARS = [
  {
    Icon: Target,
    title: 'One clear next step',
    body: 'Today’s tab surfaces the single move that matters most right now.',
  },
  {
    Icon: PiggyBank,
    title: 'Real savings potential',
    body: 'Grants, fee audits, and programs matched to your numbers.',
  },
  {
    Icon: CheckCircle,
    title: 'Progress you can see',
    body: 'Phases, streaks, and wins — so momentum builds visit to visit.',
  },
] as const

export default function JourneyValuePillars() {
  const [dismissed, setDismissed] = useState<boolean | null>(null)

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(DISMISS_KEY) === '1')
    } catch {
      setDismissed(false)
    }
  }, [])

  if (dismissed === null || dismissed) return null

  return (
    <section className="nq-journey-value-pillars relative" aria-label="Why NestQuest works">
      <button
        type="button"
        onClick={() => {
          try {
            localStorage.setItem(DISMISS_KEY, '1')
          } catch {
            /* ignore */
          }
          setDismissed(true)
        }}
        className="absolute right-0 top-0 rounded-lg p-1.5 text-[var(--nq-ed-muted)] hover:bg-[var(--nq-ed-accent-soft)] hover:text-[var(--nq-ed-text)]"
        aria-label="Dismiss"
      >
        <X weight="duotone" size={18} aria-hidden />
      </button>
      {PILLARS.map(({ Icon, title, body }) => (
        <div key={title} className="nq-journey-value-pillar">
          <span className="nq-journey-value-pillar-icon" aria-hidden>
            <Icon className="h-5 w-5 text-[var(--nq-ed-accent)]" strokeWidth={1.75} />
          </span>
          <div>
            <p className="font-display text-sm font-bold text-[var(--nq-ed-text)]">{title}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-[var(--nq-ed-muted)] sm:text-sm">{body}</p>
          </div>
        </div>
      ))}
    </section>
  )
}

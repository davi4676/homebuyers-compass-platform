'use client'

import { useState } from 'react'
import { ExternalLink, Landmark, ChevronDown } from 'lucide-react'
import { trackActivity } from '@/lib/track-activity'

export const HUD_COUNSELOR_SEARCH_URL = 'https://www.hud.gov/findhousingcounselors'

type HudCounselorHandoffCardProps = {
  variant?: 'journey' | 'results'
  className?: string
}

export default function HudCounselorHandoffCard({
  variant = 'journey',
  className = '',
}: HudCounselorHandoffCardProps) {
  const [expanded, setExpanded] = useState(false)

  const handleClick = () => {
    trackActivity('tool_used', {
      tool: 'hud_counselor_handoff',
      context: variant,
    })
  }

  return (
    <div
      className={`rounded-2xl border border-teal-200/90 bg-gradient-to-br from-teal-50/80 to-white p-5 shadow-sm ${className}`}
    >
      <div className="flex items-start gap-3">
        <Landmark className="mt-0.5 h-6 w-6 shrink-0 text-teal-700" aria-hidden />
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-base font-bold text-[var(--nq-ed-text)]">
            Free HUD counseling can help before you make offers
          </h3>
          <p className="mt-1 text-sm text-[var(--nq-ed-muted)]">
            HUD-approved housing counselors offer free, one-on-one help with budgets, credit, and loan programs. NestQuest
            is not a HUD-certified counseling agency — we point you to official resources.
          </p>
          <a
            href={HUD_COUNSELOR_SEARCH_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800"
          >
            Find a HUD counselor near you
            <ExternalLink className="h-4 w-4" aria-hidden />
          </a>
          <button
            type="button"
            onClick={() => setExpanded((o) => !o)}
            className="mt-3 flex items-center gap-1 text-sm font-semibold text-teal-800 hover:underline"
            aria-expanded={expanded}
          >
            Why this helps
            <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} aria-hidden />
          </button>
          {expanded ? (
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-[var(--nq-ed-muted)]">
              <li>Understand your real budget before a lender max approval</li>
              <li>Get a neutral second opinion on loan types and down payment programs</li>
              <li>Build a plan if credit or DTI needs work — often at no cost</li>
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  )
}

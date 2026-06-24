'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { X } from '@phosphor-icons/react'
import {
  NQ_LAST_VISIT_KEY,
  parseVisitTimestamp,
  reengagementDismissedKey,
} from '@/lib/nq-journey-visit'

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000

export default function JourneyReengagementBanner() {
  const [visible, setVisible] = useState(false)
  const [hasValidPriorVisit, setHasValidPriorVisit] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const now = Date.now()

    let prev: number | null = null
    try {
      prev = parseVisitTimestamp(localStorage.getItem(NQ_LAST_VISIT_KEY))
    } catch {
      /* ignore */
    }

    try {
      localStorage.setItem(NQ_LAST_VISIT_KEY, String(now))
    } catch {
      /* ignore */
    }

    if (prev == null) {
      setVisible(false)
      return
    }

    const inactive = now - prev > THREE_DAYS_MS
    const dismissKey = reengagementDismissedKey()
    let dismissed = false
    try {
      dismissed = localStorage.getItem(dismissKey) === '1'
    } catch {
      /* ignore */
    }

    setHasValidPriorVisit(true)
    setVisible(inactive && !dismissed)
  }, [])

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(reengagementDismissedKey(), '1')
    } catch {
      /* ignore */
    }
    setVisible(false)
  }, [])

  if (!visible) return null

  const title = hasValidPriorVisit
    ? "Welcome back — here's what changed since your last visit"
    : 'Welcome back — here are your latest updates'

  return (
    <div
      className="flex flex-col gap-3 rounded-3xl border border-[var(--nq-ed-line)] bg-[var(--nq-ed-surface)] p-5 shadow-[0_14px_32px_rgba(29,23,17,0.05)] sm:flex-row sm:items-center sm:justify-between sm:px-6"
      role="region"
      aria-label="Welcome back"
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span
          className="mt-1 inline-flex h-2 w-2 shrink-0 rounded-full bg-[var(--nq-ed-accent)]"
          aria-hidden
        />
        <div className="min-w-0">
          <p className="font-display text-base font-semibold tracking-tight text-[var(--nq-ed-text)] sm:text-lg">
            {title}
          </p>
          <p className="mt-1 text-[14px] leading-relaxed text-[var(--nq-ed-muted)] sm:text-[15px]">
            {hasValidPriorVisit
              ? 'See updates to your programs, tasks, messages, and money plan.'
              : 'See what changed in your programs, tasks, messages, and money plan since your last visit.'}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 self-stretch sm:self-auto">
        <Link
          href="/customized-journey?tab=learn"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--nq-ed-accent)] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0f6058]"
        >
          See updates →
        </Link>
        <button
          type="button"
          onClick={dismiss}
          className="rounded-xl p-2 text-[var(--nq-ed-muted)] transition hover:bg-[var(--nq-ed-line-soft)] hover:text-[var(--nq-ed-text)]"
          aria-label="Dismiss"
        >
          <X weight="duotone" size={18} aria-hidden />
        </button>
      </div>
    </div>
  )
}

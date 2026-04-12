'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { X } from '@phosphor-icons/react'
import { NQ_LAST_VISIT_KEY, reengagementDismissedKey } from '@/lib/nq-journey-visit'

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000

function formatVisitDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function JourneyReengagementBanner() {
  const [visible, setVisible] = useState(false)
  const [lastVisitTs, setLastVisitTs] = useState<number | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const now = Date.now()
    let prev: number | null = null
    try {
      const raw = localStorage.getItem(NQ_LAST_VISIT_KEY)
      if (raw) {
        const n = parseInt(raw, 10)
        if (Number.isFinite(n)) prev = n
      }
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

    setLastVisitTs(prev)
    setVisible(inactive && !dismissed)
  }, [])

  const lastVisitLabel = useMemo(
    () => (lastVisitTs != null ? formatVisitDate(lastVisitTs) : ''),
    [lastVisitTs]
  )

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(reengagementDismissedKey(), '1')
    } catch {
      /* ignore */
    }
    setVisible(false)
  }, [])

  if (!visible || !lastVisitLabel) return null

  return (
    <div
      className="mb-6 flex flex-col gap-3 rounded-xl px-4 py-3 shadow-md sm:flex-row sm:items-center sm:justify-between"
      style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
      role="region"
      aria-label="Welcome back"
    >
      <p className="min-w-0 flex-1 text-sm font-medium sm:text-base">
        Welcome back — here&apos;s what&apos;s changed since {lastVisitLabel}
      </p>
      <div className="flex shrink-0 items-center gap-2">
        <Link
          href="/customized-journey?tab=learn"
          className="nq-reengage-cta inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-bold text-[color:var(--primary)] shadow-sm"
          style={{ background: '#fff' }}
        >
          See what&apos;s new →
        </Link>
        <button
          type="button"
          onClick={dismiss}
          className="rounded-lg p-2 text-white/90 hover:bg-white/10"
          aria-label="Dismiss"
        >
          <X weight="duotone" size={20} className="text-white/90" aria-hidden />
        </button>
      </div>
    </div>
  )
}

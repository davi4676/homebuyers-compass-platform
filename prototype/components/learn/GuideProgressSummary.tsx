'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import { countGuidesRead, GUIDE_CATALOG_SIZE } from '@/lib/guide-progress'

export default function GuideProgressSummary() {
  const [read, setRead] = useState(0)

  useEffect(() => {
    const refresh = () => setRead(countGuidesRead())
    refresh()
    window.addEventListener('nq-guide-progress-changed', refresh)
    return () => window.removeEventListener('nq-guide-progress-changed', refresh)
  }, [])

  const pct = Math.min(100, Math.round((read / GUIDE_CATALOG_SIZE) * 100))

  return (
    <div className="rounded-xl border border-teal-200/80 bg-teal-50/50 p-4">
      <div className="flex items-start gap-3">
        <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-teal-700" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[var(--nq-ed-text)]">Guide progress</p>
          <p className="mt-0.5 text-xs text-[var(--nq-ed-muted)]">
            {read} of ~{GUIDE_CATALOG_SIZE} guides opened — keep going in{' '}
            <Link href="/resources" className="font-semibold text-teal-700 hover:underline">
              Playbooks
            </Link>
          </p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
            <div
              className="h-full rounded-full bg-teal-600 transition-all duration-500"
              style={{ width: `${pct}%` }}
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${pct}% of guide library opened`}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

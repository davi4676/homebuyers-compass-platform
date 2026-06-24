'use client'

import { useEffect, useState } from 'react'
import { formatUsd } from '@/lib/journey-progress-identity'

type Props = {
  current: number
  goal: number
  className?: string
}

export default function SavingsMomentumBar({ current, goal, className = '' }: Props) {
  const pct = goal > 0 ? Math.min(100, (current / goal) * 100) : 0
  const [widthPct, setWidthPct] = useState(0)
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduceMotion(mq.matches)
  }, [])

  useEffect(() => {
    if (reduceMotion) {
      setWidthPct(pct)
      return
    }
    setWidthPct(0)
    const id = requestAnimationFrame(() => setWidthPct(pct))
    return () => cancelAnimationFrame(id)
  }, [pct, reduceMotion])

  const remaining = Math.max(0, goal - current)
  const hasReliableRemaining = goal > 0 && remaining > 0

  return (
    <div className={`space-y-3 ${className}`}>
      <p className="text-[15px] leading-relaxed text-[var(--nq-ed-muted)]">
        You are tracking toward your target home price. NestQuest is helping you compare savings opportunities,
        programs, and next steps along the way.
      </p>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-[var(--nq-ed-line-soft)]"
        aria-hidden
      >
        <div
          className="h-full rounded-full bg-[var(--nq-ed-accent)]"
          style={{
            width: `${widthPct}%`,
            transition: reduceMotion ? undefined : 'width 900ms ease-out',
          }}
        />
      </div>
      {hasReliableRemaining ? (
        <p className="text-[12px] leading-relaxed text-[var(--nq-ed-muted)]">
          Estimated remaining savings target:{' '}
          <span className="font-semibold text-[var(--nq-ed-text)]">${formatUsd(remaining)}</span> — depends on
          programs, lender terms, and closing costs.
        </p>
      ) : null}
    </div>
  )
}

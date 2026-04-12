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

  return (
    <div className={`space-y-2 ${className}`}>
      <p className="text-[15px] leading-snug" style={{ color: 'var(--text)' }}>
        You&apos;ve saved <span className="font-semibold">${formatUsd(current)}</span>
        {' — '}
        <span className="font-semibold">${formatUsd(remaining)}</span> to go for your goal
      </p>
      <div
        className="h-3 w-full overflow-hidden rounded-full"
        style={{
          background: 'var(--muted)',
          opacity: 0.45,
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${widthPct}%`,
            background: 'linear-gradient(90deg, #2D6A4F 0%, #52B788 100%)',
            transition: reduceMotion ? undefined : 'width 900ms ease-out',
            borderRadius: 'var(--radius)',
          }}
        />
      </div>
    </div>
  )
}

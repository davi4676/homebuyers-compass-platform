'use client'

import { useEffect, useRef, useState } from 'react'
import { getJourneyPhaseMilestoneLabel } from '@/lib/journey-phase-ring'

const RING_TRANSITION = 'stroke-dashoffset 800ms ease-out'

type Size = 'sm' | 'md' | 'lg'

const sizeMap: Record<
  Size,
  { dim: number; stroke: number; r: number; pctClass: string; labelClass: string }
> = {
  sm: { dim: 48, stroke: 3.5, r: 19, pctClass: 'text-[11px]', labelClass: 'text-[7px] leading-tight' },
  md: { dim: 72, stroke: 4, r: 30, pctClass: 'text-lg', labelClass: 'text-[9px] leading-tight' },
  lg: { dim: 112, stroke: 5, r: 48, pctClass: 'text-3xl', labelClass: 'text-xs leading-snug' },
}

type Props = {
  pct: number
  size?: Size
  className?: string
  /** Ring stroke color (CSS color) */
  accentColor?: string
}

export default function JourneyPhaseProgressRing({
  pct,
  size = 'md',
  className = '',
  accentColor = '#0d9488',
}: Props) {
  const { dim, stroke, r, pctClass, labelClass } = sizeMap[size]
  const circumference = 2 * Math.PI * r
  const clamped = Math.max(0, Math.min(100, pct))
  const targetOffset = circumference * (1 - clamped / 100)

  const [dashOffset, setDashOffset] = useState(circumference)
  const [reduceMotion, setReduceMotion] = useState(false)
  const didMountAnimate = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduceMotion(mq.matches)
    const onChange = () => setReduceMotion(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (reduceMotion) {
      setDashOffset(targetOffset)
      return
    }
    if (!didMountAnimate.current) {
      didMountAnimate.current = true
      setDashOffset(circumference)
      const id = requestAnimationFrame(() => setDashOffset(targetOffset))
      return () => cancelAnimationFrame(id)
    }
    setDashOffset(targetOffset)
  }, [circumference, targetOffset, reduceMotion])

  const label = getJourneyPhaseMilestoneLabel(clamped)
  const displayPct = Math.round(clamped)

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center ${className}`}
      style={{ width: dim, height: dim }}
      role="img"
      aria-label={`Journey progress ${displayPct} percent. ${label}`}
    >
      <svg
        className="absolute inset-0"
        width={dim}
        height={dim}
        viewBox={`0 0 ${dim} ${dim}`}
        style={{ transform: 'rotate(-90deg)' }}
        aria-hidden
      >
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={r}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={stroke}
        />
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={r}
          fill="none"
          stroke={accentColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{
            transition: reduceMotion ? undefined : RING_TRANSITION,
          }}
        />
      </svg>
      <div className="pointer-events-none flex max-w-[85%] flex-col items-center justify-center px-1 text-center">
        <span className={`font-bold tabular-nums text-slate-900 ${pctClass}`}>{displayPct}%</span>
        <span
          className={`mt-0.5 line-clamp-2 font-semibold text-slate-600 ${labelClass} ${
            size === 'lg' ? 'max-w-[7rem]' : 'max-w-[3.35rem]'
          }`}
        >
          {label}
        </span>
      </div>
    </div>
  )
}

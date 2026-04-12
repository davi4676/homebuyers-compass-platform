'use client'

import { useMemo } from 'react'

type Props = {
  active: boolean
  /** Unique key to re-trigger animation when milestone hits again */
  burstKey?: number
}

/** Pure CSS confetti: colored dots burst outward and fade (no extra deps). */
export default function JourneyConfettiBurst({ active, burstKey = 0 }: Props) {
  const dots = useMemo(() => {
    const n = 32
    return Array.from({ length: n }, (_, i) => {
      const angle = (i / n) * Math.PI * 2 + 0.3
      const dist = 36 + (i % 6) * 10
      return {
        i,
        hue: (i * 41) % 360,
        qx: `${Math.cos(angle) * dist}px`,
        qy: `${Math.sin(angle) * dist}px`,
        delay: (i % 10) * 0.015,
      }
    })
  }, [burstKey])

  if (!active) return null

  return (
    <div
      className="pointer-events-none absolute left-1/2 top-1/2 z-20 h-0 w-0 overflow-visible"
      aria-hidden
    >
      {dots.map(({ i, hue, qx, qy, delay }) => (
        <span
          key={`${burstKey}-${i}`}
          className="nq-confetti-dot absolute block h-2 w-2 rounded-full"
          style={{
            backgroundColor: `hsl(${hue} 78% 58%)`,
            left: 0,
            top: 0,
            animationDelay: `${delay}s`,
            ['--qx' as string]: qx,
            ['--qy' as string]: qy,
          }}
        />
      ))}
    </div>
  )
}

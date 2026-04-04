'use client'

import { useEffect, useRef, useState } from 'react'

type CountUpNumberProps = {
  end: number
  prefix?: string
  suffix?: string
  duration?: number
  className?: string
  /** If false, wait until element intersects viewport before animating (default: true = animate on mount). */
  startOnMount?: boolean
}

const DEFAULT_FALLBACK = 5593

export default function CountUpNumber({
  end,
  prefix = '',
  suffix = '',
  duration = 1800,
  className,
  startOnMount = true,
}: CountUpNumberProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const target = end > 0 ? end : DEFAULT_FALLBACK
  const [display, setDisplay] = useState(1)
  const [started, setStarted] = useState(startOnMount)

  useEffect(() => {
    if (startOnMount) return
    const el = ref.current
    if (!el || started) return
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setStarted(true)
      },
      { threshold: 0.2 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [started, startOnMount])

  useEffect(() => {
    if (!started) return
    let startTime: number | null = null
    let rafId = 0
    let cancelled = false

    const tick = (now: number) => {
      if (cancelled) return
      if (startTime === null) startTime = now
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const raw = Math.floor(eased * target)
      setDisplay(progress >= 1 ? target : Math.max(1, raw))
      if (progress < 1) {
        rafId = requestAnimationFrame(tick)
      }
    }
    rafId = requestAnimationFrame(tick)
    return () => {
      cancelled = true
      cancelAnimationFrame(rafId)
    }
  }, [started, target, duration])

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display.toLocaleString('en-US')}
      {suffix}
    </span>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'

type CountUpNumberProps = {
  end: number
  prefix?: string
  duration?: number
  className?: string
}

export default function CountUpNumber({
  end,
  prefix = '',
  duration = 2000,
  className,
}: CountUpNumberProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState(0)
  const [started, setStarted] = useState(false)

  useEffect(() => {
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
  }, [started])

  useEffect(() => {
    if (!started) return
    let startTime: number | null = null
    let rafId = 0
    let cancelled = false

    const tick = (now: number) => {
      if (cancelled) return
      if (startTime === null) startTime = now
      const t = Math.min((now - startTime) / duration, 1)
      setDisplay(Math.floor(end * t))
      if (t < 1) {
        rafId = requestAnimationFrame(tick)
      } else {
        setDisplay(end)
      }
    }
    rafId = requestAnimationFrame(tick)
    return () => {
      cancelled = true
      cancelAnimationFrame(rafId)
    }
  }, [started, end, duration])

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display.toLocaleString('en-US')}
    </span>
  )
}

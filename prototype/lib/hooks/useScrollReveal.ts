'use client'

import { useEffect, useRef, useState } from 'react'

const DEFAULT_OPTS: IntersectionObserverInit = {
  threshold: 0.15,
  rootMargin: '0px 0px -48px 0px',
}

/**
 * Reveals when the ref element enters the viewport (once).
 */
export function useScrollReveal<T extends HTMLElement>(options?: IntersectionObserverInit) {
  const ref = useRef<T | null>(null)
  const [revealed, setRevealed] = useState(false)
  const optsRef = useRef(options)
  optsRef.current = options

  useEffect(() => {
    let obs: IntersectionObserver | null = null
    let cancelled = false

    const run = () => {
      const el = ref.current
      if (!el || cancelled) return
      const merged: IntersectionObserverInit = {
        ...DEFAULT_OPTS,
        ...optsRef.current,
      }
      obs = new IntersectionObserver(([entry]) => {
        if (entry?.isIntersecting) setRevealed(true)
      }, merged)
      obs.observe(el)
    }

    const id = requestAnimationFrame(() => requestAnimationFrame(run))

    return () => {
      cancelled = true
      cancelAnimationFrame(id)
      obs?.disconnect()
    }
  }, [])

  return { ref, revealed }
}

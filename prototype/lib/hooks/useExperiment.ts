'use client'

import { useEffect, useMemo, useState } from 'react'

type Variant = 'control' | 'treatment'

export function useExperiment(experimentKey: string) {
  const [variant, setVariant] = useState<Variant>('control')
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function loadAssignment() {
      try {
        const res = await fetch('/api/experiments/assign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ experimentKey }),
        })
        const data = await res.json()
        if (!cancelled) {
          const assigned = data?.assignment?.variant === 'treatment' ? 'treatment' : 'control'
          setVariant(assigned)
          setIsReady(true)
        }
      } catch {
        if (!cancelled) setIsReady(true)
      }
    }
    loadAssignment()
    return () => {
      cancelled = true
    }
  }, [experimentKey])

  async function track(eventName: string, metadata?: Record<string, unknown>) {
    try {
      await fetch('/api/experiments/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          experimentKey,
          variant,
          eventName,
          metadata,
        }),
      })
    } catch {
      // no-op in client
    }
  }

  return useMemo(
    () => ({
      variant,
      isReady,
      isTreatment: variant === 'treatment',
      track,
    }),
    [variant, isReady]
  )
}


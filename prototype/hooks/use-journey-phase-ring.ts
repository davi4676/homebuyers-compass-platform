'use client'

import { useEffect, useState } from 'react'
import {
  getJourneyPhaseRingProgress,
  type JourneyPhaseRingProgress,
} from '@/lib/journey-phase-ring'

const defaultProgress: JourneyPhaseRingProgress = {
  pct: 0,
  completed: 0,
  total: 8,
}

/**
 * Reads roadmap phase completion from localStorage (same as NQGuidedRoadmap).
 * Re-syncs when `nq-journey-progress` fires (dispatched after step completion) or on `storage`.
 */
export function useJourneyPhaseRingProgress(): JourneyPhaseRingProgress {
  const [progress, setProgress] = useState<JourneyPhaseRingProgress>(defaultProgress)

  useEffect(() => {
    const read = () => setProgress(getJourneyPhaseRingProgress())
    read()
    window.addEventListener('nq-journey-progress', read)
    window.addEventListener('storage', read)
    return () => {
      window.removeEventListener('nq-journey-progress', read)
      window.removeEventListener('storage', read)
    }
  }, [])

  return progress
}

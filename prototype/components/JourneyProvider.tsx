'use client'

import { createContext, useContext, useMemo, useEffect, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import {
  type JourneyType,
  type JourneyState,
  getInitialJourneyState,
} from '@/lib/journey-context'

interface JourneyContextValue extends JourneyState {
  /** Set current phase/step for conditional logic (optional overlays, guards) */
  setCurrentPhase: (phase: string | null) => void
  /** Whether journey-first personalization is enabled (feature guard) */
  journeyFirstEnabled: boolean
}

const JourneyContext = createContext<JourneyContextValue | null>(null)

const JOURNEY_FIRST_ENABLED = true

export function useJourney(): JourneyContextValue | null {
  const ctx = useContext(JourneyContext)
  return ctx
}

export function useJourneyType(): JourneyType | null {
  const ctx = useJourney()
  return ctx?.journeyType ?? null
}

/**
 * Wraps app with journey-first context. Does not change layout, copy, or routes.
 * Use useJourney() / useJourneyType() for conditional behavior and optional overlays.
 */
export function JourneyProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [state, setState] = useState<JourneyState>(() =>
    getInitialJourneyState(pathname ?? '')
  )
  const [currentPhase, setCurrentPhase] = useState<string | null>(null)

  useEffect(() => {
    setState((prev) => ({
      ...prev,
      ...getInitialJourneyState(pathname ?? ''),
    }))
  }, [pathname])

  const value = useMemo<JourneyContextValue>(
    () => ({
      ...state,
      currentPhase,
      setCurrentPhase,
      journeyFirstEnabled: JOURNEY_FIRST_ENABLED,
    }),
    [state.journeyType, state.inferredFromPath, currentPhase]
  )

  return (
    <JourneyContext.Provider value={value}>
      {children}
    </JourneyContext.Provider>
  )
}

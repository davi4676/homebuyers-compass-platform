'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { UserTier } from '@/lib/tiers'
import { TIER_DEFINITIONS } from '@/lib/tiers'
import { getUserTier } from '@/lib/user-tracking'

export type JourneyTierContextValue = {
  userTier: UserTier
  previewTier: UserTier
  effectiveTier: UserTier
  setPreviewTier: (tier: UserTier) => void
  resetPreviewToAccount: () => void
  mindsetFor: (tier: UserTier) => string
}

const JourneyTierContext = createContext<JourneyTierContextValue | null>(null)

export function JourneyTierProvider({ children }: { children: ReactNode }) {
  const [userTier, setUserTierState] = useState<UserTier>('foundations')
  const [previewTier, setPreviewTierState] = useState<UserTier>('foundations')

  useEffect(() => {
    const sync = () => {
      const t = getUserTier()
      setUserTierState(t)
      setPreviewTierState(t)
    }
    sync()
    const onTierChanged = (e: Event) => {
      const next = (e as CustomEvent<{ tier?: UserTier }>).detail?.tier
      if (next && next in TIER_DEFINITIONS) {
        setUserTierState(next)
        setPreviewTierState(next)
      }
    }
    window.addEventListener('tierChanged', onTierChanged as EventListener)
    return () => window.removeEventListener('tierChanged', onTierChanged as EventListener)
  }, [])

  const setPreviewTier = useCallback((tier: UserTier) => {
    setPreviewTierState(tier)
  }, [])

  const resetPreviewToAccount = useCallback(() => {
    setPreviewTierState(getUserTier())
  }, [])

  const value = useMemo<JourneyTierContextValue>(() => {
    const effectiveTier = previewTier
    return {
      userTier,
      previewTier,
      effectiveTier,
      setPreviewTier,
      resetPreviewToAccount,
      mindsetFor: (t) => TIER_DEFINITIONS[t].mindset,
    }
  }, [userTier, previewTier, setPreviewTier, resetPreviewToAccount])

  return <JourneyTierContext.Provider value={value}>{children}</JourneyTierContext.Provider>
}

export function useJourneyTier(): JourneyTierContextValue {
  const ctx = useContext(JourneyTierContext)
  if (!ctx) {
    throw new Error('useJourneyTier must be used within JourneyTierProvider')
  }
  return ctx
}

/** Optional hook for components that may render outside the provider (e.g. shared widgets). */
export function useJourneyTierOptional(): JourneyTierContextValue | null {
  return useContext(JourneyTierContext)
}

/** Product-language alias — same provider as `JourneyTierProvider`. */
export { JourneyTierProvider as TierMindsetProvider }
/** Alias for `useJourneyTier`. */
export { useJourneyTier as useTierMindset }

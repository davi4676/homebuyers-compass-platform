'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type JourneyMoneyTotals = {
  savingsFoundSoFar: number
  fundsFoundSoFar: number
  altSolutionsIdentified: number
}

export type JourneyNavChrome = {
  phaseOrder: number
  phaseTotal: number
  /** 0–100, overall roadmap progress within phases */
  phaseProgressPct: number
  readinessScore: number | null
  learnTipCount: number
  budgetSketchEdited: boolean
  /** Inbox tab badge (alerts + open tasks). */
  inboxPendingCount: number
  /** Show “New” on Library when user hasn’t opened the tab this session. */
  libraryHasNew: boolean
  /** Money trackers for header strip (customized journey). */
  moneyTotals: JourneyMoneyTotals | null
}

const defaultChrome: JourneyNavChrome = {
  phaseOrder: 1,
  phaseTotal: 7,
  phaseProgressPct: 0,
  readinessScore: null,
  learnTipCount: 0,
  budgetSketchEdited: false,
  inboxPendingCount: 0,
  libraryHasNew: false,
  moneyTotals: null,
}

type Ctx = {
  chrome: JourneyNavChrome
  setJourneyNavChrome: (p: Partial<JourneyNavChrome>) => void
  resetJourneyNavChrome: () => void
}

const JourneyNavChromeContext = createContext<Ctx | null>(null)

export function JourneyNavChromeProvider({ children }: { children: ReactNode }) {
  const [chrome, setChrome] = useState<JourneyNavChrome>(defaultChrome)
  const setJourneyNavChrome = useCallback((p: Partial<JourneyNavChrome>) => {
    setChrome((s) => ({ ...s, ...p }))
  }, [])
  const resetJourneyNavChrome = useCallback(() => {
    setChrome(defaultChrome)
  }, [])
  const value = useMemo(
    () => ({ chrome, setJourneyNavChrome, resetJourneyNavChrome }),
    [chrome, setJourneyNavChrome, resetJourneyNavChrome]
  )
  return (
    <JourneyNavChromeContext.Provider value={value}>{children}</JourneyNavChromeContext.Provider>
  )
}

export function useJourneyNavChrome() {
  const c = useContext(JourneyNavChromeContext)
  if (!c) {
    return {
      chrome: defaultChrome,
      setJourneyNavChrome: () => {},
      resetJourneyNavChrome: () => {},
    }
  }
  return c
}

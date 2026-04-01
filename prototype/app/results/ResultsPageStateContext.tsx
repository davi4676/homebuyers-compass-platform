'use client'

import { createContext } from 'react'

export const ResultsPageStateContext = createContext<Record<string, unknown> | null>(null)

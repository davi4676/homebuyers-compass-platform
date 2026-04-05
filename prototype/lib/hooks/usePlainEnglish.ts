'use client'

import { useEffect, useState } from 'react'

const LS_KEY = 'nq_plain_english_mode'
export const PLAIN_ENGLISH_LS_KEY = LS_KEY

/** Journey page one-time Plain English promo; set to `1` when dismissed or after "Turn On". */
export const PLAIN_ENGLISH_JOURNEY_CALLOUT_DISMISSED_KEY = 'nq_journey_pe_callout_dismissed'

/** Plain-language copy preference; stays in sync when toggled on Profile (same tab + other tabs). */
export function usePlainEnglish(): boolean {
  const [on, setOn] = useState(false)

  useEffect(() => {
    const read = () => {
      try {
        setOn(typeof window !== 'undefined' && localStorage.getItem(LS_KEY) === '1')
      } catch {
        setOn(false)
      }
    }
    read()
    window.addEventListener('storage', read)
    window.addEventListener('nq-plain-english-changed', read)
    return () => {
      window.removeEventListener('storage', read)
      window.removeEventListener('nq-plain-english-changed', read)
    }
  }, [])

  return on
}

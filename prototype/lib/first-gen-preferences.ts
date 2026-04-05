import {
  PLAIN_ENGLISH_JOURNEY_CALLOUT_DISMISSED_KEY,
  PLAIN_ENGLISH_LS_KEY,
} from '@/lib/hooks/usePlainEnglish'

/** Turn on Plain English when the buyer identifies as first in their family (idempotent). */
export function enablePlainEnglishForFirstGenBuyer(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(PLAIN_ENGLISH_LS_KEY, '1')
    localStorage.setItem(PLAIN_ENGLISH_JOURNEY_CALLOUT_DISMISSED_KEY, '1')
    window.dispatchEvent(new Event('nq-plain-english-changed'))
  } catch {
    /* ignore */
  }
}

/** ICP entry types from landing `?type=` and quiz storage */
export type IcpType =
  | 'first-time'
  | 'first-gen'
  | 'solo'
  | 'move-up'
  | 'repeat-buyer'
  | 'refinance'

export function parseIcpTypeParam(raw: string | null | undefined): IcpType | null {
  if (!raw) return null
  const v = raw.trim().toLowerCase()
  /** Deep link to legacy long-form quiz — not an ICP slug */
  if (v === 'full') return null
  /** Landing hero split tracks → same quiz flow with sensible ICP defaults */
  if (v === 'affordability') return 'first-time'
  if (v === 'guided') return 'first-gen'
  if (
    v === 'first-time' ||
    v === 'first-gen' ||
    v === 'solo' ||
    v === 'move-up' ||
    v === 'repeat-buyer' ||
    v === 'refinance'
  )
    return v
  return null
}

export type NarrativeQuizEntry = 'affordability' | 'guided'

/** Raw URL `?type=` for hero split flows (before ICP normalization). */
export function parseNarrativeQuizEntry(raw: string | null | undefined): NarrativeQuizEntry | null {
  if (!raw) return null
  const v = raw.trim().toLowerCase()
  if (v === 'affordability') return 'affordability'
  if (v === 'guided') return 'guided'
  return null
}

/** Maps URL ICP to transaction type + icp label */
export function resolveTransactionAndIcp(type: IcpType | null): {
  transactionType: 'first-time' | 'repeat-buyer' | 'refinance'
  icpType: IcpType
} {
  if (!type) {
    return { transactionType: 'first-time', icpType: 'first-time' }
  }
  if (type === 'move-up') {
    return { transactionType: 'repeat-buyer', icpType: 'move-up' }
  }
  if (type === 'repeat-buyer') {
    return { transactionType: 'repeat-buyer', icpType: 'repeat-buyer' }
  }
  if (type === 'refinance') {
    return { transactionType: 'refinance', icpType: 'refinance' }
  }
  return { transactionType: 'first-time', icpType: type }
}

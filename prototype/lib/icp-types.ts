/** ICP entry types from landing `?type=` and quiz storage */
export type IcpType = 'first-time' | 'first-gen' | 'solo' | 'move-up'

export function parseIcpTypeParam(raw: string | null | undefined): IcpType | null {
  if (!raw) return null
  const v = raw.trim().toLowerCase()
  if (v === 'first-time' || v === 'first-gen' || v === 'solo' || v === 'move-up') return v
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
  return { transactionType: 'first-time', icpType: type }
}

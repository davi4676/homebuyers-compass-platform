/** localStorage key prefix for shareable /results?id=… links (same browser only). */
export const RESULTS_SHARE_PREFIX = 'nestquest_share_'

export function storeShareQueryString(queryString: string): string {
  const id =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().replace(/-/g, '').slice(0, 12)
      : `s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`
  try {
    localStorage.setItem(`${RESULTS_SHARE_PREFIX}${id}`, queryString)
  } catch {
    /* quota */
  }
  return id
}

export function getShareQueryString(id: string): string | null {
  try {
    return localStorage.getItem(`${RESULTS_SHARE_PREFIX}${id}`)
  } catch {
    return null
  }
}

/**
 * Compact money labels for Northstar-style journey chrome (e.g. "$18.4k").
 */
export function formatMoneyCompactK(n: number): string {
  if (!Number.isFinite(n) || n < 0) return '—'
  if (n === 0) return '$0'
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (n >= 1000) return `$${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`
  return `$${Math.round(n)}`
}

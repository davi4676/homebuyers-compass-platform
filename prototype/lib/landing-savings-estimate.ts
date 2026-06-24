/** Parse currency-style home price input to a whole-dollar number. */
export function parseHomePriceInput(raw: string): number {
  const n = Number(String(raw).replace(/[^0-9]/g, ''))
  return Number.isFinite(n) ? n : 0
}

/**
 * Marketing-aligned savings estimate (~3.5% of price, clamped to the $10k–$20k band).
 * Used on the landing hero and sticky CTA — not a guarantee.
 */
export function estimateLandingSavings(homePrice: number): number {
  if (!homePrice || homePrice < 50_000) return 12_500
  const pct = Math.round(homePrice * 0.035)
  return Math.min(20_000, Math.max(10_000, pct))
}

/**
 * Typical savings at each roadmap phase (percentile badge). Replace with analytics when available.
 */
export const AVG_USER_SAVINGS_AT_PHASE: Record<number, number> = {
  1: 12_000,
  2: 18_000,
  3: 24_000,
  4: 30_000,
  5: 36_000,
  6: 42_000,
  7: 48_000,
  8: 52_000,
}

export function getAvgUserSavingsAtPhase(phaseOrder: number): number {
  return AVG_USER_SAVINGS_AT_PHASE[phaseOrder] ?? 24_000
}

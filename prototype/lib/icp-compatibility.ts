/**
 * Client/server-safe ICP helpers: same normalization as persisted quiz data and URL params.
 * Do not change mapping without auditing localStorage, quiz routes, and `normalizeContextIcpType` consumers.
 */
import { parseIcpTypeParam } from '@/lib/icp-types'

export type ContextNormalizedIcp = 'first-time' | 'first-gen' | 'move-up' | 'investor'

const VALID: ReadonlySet<ContextNormalizedIcp> = new Set<ContextNormalizedIcp>([
  'first-time',
  'first-gen',
  'move-up',
  'investor',
])

/**
 * Single source of truth for mapping arbitrary stored/URL ICP slugs to the 4 context segments.
 * Mirrors legacy behavior: solo → first-time, repeat-buyer & refinance → move-up.
 */
export function normalizeIcpSelection(raw: string | null | undefined): ContextNormalizedIcp {
  if (raw == null || typeof raw !== 'string') return 'first-time'
  const v = raw.trim().toLowerCase()
  if (v === 'investor') return 'investor'
  if (VALID.has(v as ContextNormalizedIcp)) return v as ContextNormalizedIcp
  const parsed = parseIcpTypeParam(v)
  if (parsed === 'first-gen' || parsed === 'move-up' || parsed === 'first-time') return parsed
  if (parsed === 'solo') return 'first-time'
  if (parsed === 'repeat-buyer' || parsed === 'refinance') return 'move-up'
  return 'first-time'
}

/**
 * Coarse product audience for positioning (not a stored enum — derived only).
 * move-up and investor group as “established” for first-time / first-gen–first messaging.
 */
export type PrimaryProductAudience = 'first-time' | 'first-gen' | 'established'

export function getPrimaryJourneyType(
  rawOrNormalized: string | null | undefined
): PrimaryProductAudience {
  const n = normalizeIcpSelection(rawOrNormalized)
  if (n === 'first-gen') return 'first-gen'
  if (n === 'first-time') return 'first-time'
  return 'established'
}

/**
 * Compatibility-safe transaction family for UI framing.
 * Note: this is derived display context only — never persisted.
 */
export type PrimaryTransactionType = 'first-time' | 'move-up' | 'refinance'

export function getPrimaryTransactionType(raw: string | null | undefined): PrimaryTransactionType {
  const v = (raw ?? '').trim().toLowerCase()
  if (v === 'refinance' || v === 'refi') return 'refinance'
  if (v === 'move-up' || v === 'moveup' || v === 'repeat-buyer' || v === 'repeatbuyer') return 'move-up'
  return 'first-time'
}

/** Short labels for public UI; safe for unknown / legacy slugs. */
export function getDisplayAudienceLabel(
  raw: string | null | undefined,
  opts?: { style?: 'default' | 'short' }
): string {
  const n = normalizeIcpSelection(raw)
  const short = opts?.style === 'short'
  switch (n) {
    case 'first-gen':
      return short ? 'First-gen' : 'First-generation buyer'
    case 'first-time':
      return short ? 'First-time' : 'First-time buyer'
    case 'move-up':
      return short ? 'Move-up' : 'Move-up buyer'
    case 'investor':
      return short ? 'Investor' : 'Real estate investor'
    default:
      return short ? 'Buyer' : 'Homebuyer'
  }
}

/** Human label for transaction framing; safe for unknown/legacy values. */
export function getDisplayTransactionLabel(raw: string | null | undefined): string {
  const t = getPrimaryTransactionType(raw)
  if (t === 'refinance') return 'Refinance'
  if (t === 'move-up') return 'Move-up'
  return 'First-time purchase'
}

/** Shared copy and helpers for the NestQuest referral program (prototype). */

export const REFERRAL_CODE_LS_KEY = 'referralCode'
export const REFERRED_BY_LS_KEY = 'referredBy'

export const REFERRAL_PROGRAM_HEADLINE =
  'Refer a friend and you both get $50 off your next plan.'

function randomReferralCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let out = ''
  for (let i = 0; i < 8; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

/** Stable 8-char code: prefers email hash, else persisted random (or from username). */
export function getOrCreateReferralCode(email?: string | null): string {
  if (typeof window === 'undefined') return 'nestquest'
  try {
    const existing = localStorage.getItem(REFERRAL_CODE_LS_KEY)
    if (existing && existing.length >= 6) return existing
    let next = randomReferralCode()
    if (email && email.includes('@')) {
      const local = email.split('@')[0] || ''
      const compact = local.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8)
      if (compact.length >= 4) next = (compact + randomReferralCode()).slice(0, 8)
    }
    localStorage.setItem(REFERRAL_CODE_LS_KEY, next)
    return next
  } catch {
    return randomReferralCode()
  }
}

export function referralProgramUrl(slug: string): string {
  const s = slug.trim() || 'yourname'
  return `https://nestquest.com/ref/${s.slice(0, 32)}`
}

/** localStorage: once dismissed per milestone, we do not auto-open again. */
export const REFERRAL_PROMPT_LS = {
  afterQuizResults: 'nq_referral_prompt_after_quiz_v1',
  /** Roadmap phase order 2 — “Get Pre-Approved” (Pre-Approval). */
  afterPreApprovalPhase: 'nq_referral_prompt_preapproval_v1',
  /** Roadmap phase order 7 — “Post-Closing & Beyond” (journey Phase 7). */
  afterPhase7PostClosing: 'nq_referral_prompt_phase7_v1',
} as const

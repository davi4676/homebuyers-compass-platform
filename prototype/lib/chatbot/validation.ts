/**
 * Pre-send response validation and guardrails.
 */

const BLOCK_PATTERNS = [
  /\b(guaranteed|guarantee)\s+(approval|acceptance|you'?ll get|you will get)\b/i,
  /\b(approved|pre.?approved)\s+(for|up to)\s+\$[\d,]+/i,
  /\b(current\s+rate|today'?s\s+rate|today'?s\s+rates)\s+(is|are)\s+[\d.]+%/i,
  /\b(interest rate|mortgage rate)\s+(of|at)\s+[\d.]+%\s+(today|right now|currently)/i,
  /(recommend|avoid|don'?t consider)\s+(neighborhoods?|areas?)\s+(because|based on)\s+(race|ethnicity|religion|national origin|family status|disability)/i,
  /\b(the|that)\s+neighborhood\s+(is|has)\s+(mainly|mostly|primarily)\s+(black|white|hispanic|asian|minority|diverse)/i,
]

const JURISDICTION_KEYWORDS = ['state', 'county', 'city', 'local', 'jurisdiction', 'varies by location']

export interface ValidationResult {
  pass: boolean
  blockReason?: string
  shouldUseFallback?: string
}

/**
 * Validate response before sending. Block guaranteed outcomes, demographic framing, fabricated rates.
 */
export function validateResponse(response: string, context?: { queryContainsRates?: boolean }): ValidationResult {
  const trimmed = response.trim()
  if (trimmed.length < 20) {
    return { pass: false, blockReason: 'Response too short to be useful' }
  }

  for (const pattern of BLOCK_PATTERNS) {
    if (pattern.test(response)) {
      return { pass: false, blockReason: 'Blocked: contains disallowed content (guarantee, fabricated rate, or demographic framing)' }
    }
  }

  // If user asked for rates and response contains a specific rate %, flag for review
  if (context?.queryContainsRates && /\b[\d.]+%\b/.test(response)) {
    return { pass: false, blockReason: 'Response contains rate figure; user asked for rates — use fallback', shouldUseFallback: 'mortgageRates' }
  }

  // Check for clear next step (loose check)
  const hasNextStep =
    /\?|next|recommend|suggest|check|try|visit|connect|want to|would you like/i.test(response) ||
    response.endsWith('?')

  if (!hasNextStep && trimmed.length > 100) {
    return { pass: true } // Allow but could add warning
  }

  return { pass: true }
}

/**
 * Redact PII from text (basic patterns).
 */
export function redactPii(text: string): string {
  return text
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN-REDACTED]')
    .replace(/\b\d{16,19}\b/g, '[CARD-REDACTED]')
    .replace(/\b(0?[1-9]|1[0-2])\/(0?[1-9]|[12]\d|3[01])\/(19|20)\d{2}\b/g, '[DOB-REDACTED]')
}

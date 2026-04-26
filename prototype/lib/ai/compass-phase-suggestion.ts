/**
 * One-line contextual question for the Compass panel footer.
 * Matches spec examples first, then roadmap phase titles (`NQ_ROADMAP_PHASE_LINE`), then `?tab=` hints.
 */
export type CompassPhaseSuggestionOpts = {
  /** Raw `?tab=` value from the URL (e.g. `budget`, `assistance`) before legacy normalization. */
  rawJourneyTab?: string | null
}

export function getCompassPhaseSuggestion(
  phase: string,
  opts?: CompassPhaseSuggestionOpts
): string {
  const trimmed = phase.trim()
  const p = trimmed.toLowerCase()
  const raw = opts?.rawJourneyTab?.trim().toLowerCase() ?? ''

  // Spec examples (explicit labels)
  if (/budget sketch/i.test(trimmed)) return "What's a comfortable monthly payment for me?"
  if (/credit review/i.test(trimmed)) return 'How can I raise my score before applying?'
  if (/lender search/i.test(trimmed)) return 'What questions should I ask lenders?'

  // Deep-link tab hints — `?tab=` before legacy normalization (e.g. `budget` → “Budget Sketch” style)
  if (raw === 'budget' || raw === 'timeline') {
    return "What's a comfortable monthly payment for me?"
  }
  if (raw === 'phase' || raw === 'overview' || raw === 'plan') {
    return 'What should I focus on in this phase before moving on?'
  }
  if (raw === 'assistance' || raw === 'money' || raw === 'inbox' || raw === 'action' || raw === 'upgrades') {
    return 'What savings programs or help fit my situation best?'
  }
  if (raw === 'library' || raw === 'learn' || raw === 'checklist' || raw === 'firstgen') {
    return 'What should I read next for where I am in the process?'
  }

  // Roadmap phase titles (see `NQ_ROADMAP_PHASE_LINE` / `journey-phases-data`)
  if (p.includes('budget')) return "What's a comfortable monthly payment for me?"
  if (p.includes('credit') || p.includes('preparation')) return 'How can I raise my score before applying?'
  if (p.includes('pre-approv')) return 'What questions should I ask lenders?'
  if (p.includes('find your home') || p.includes('house-hunt') || p.includes('hunt')) {
    return 'What should I watch for when comparing listings?'
  }
  if (p.includes('negotiation')) return 'How much room do I have to negotiate after inspection?'
  if (p.includes('underwriting')) return 'What usually slows underwriting—and how can I avoid it?'
  if (p.includes('closing')) return 'What should I bring to closing day?'
  if (p.includes('post-closing') || p.includes('homeowner')) {
    return 'What should I set up first month as a homeowner?'
  }
  return "What's the smartest next step for me right now?"
}

/**
 * One-line contextual question for the Compass panel footer from roadmap phase label.
 */
export function getCompassPhaseSuggestion(phase: string): string {
  const p = phase.toLowerCase()
  if (p.includes('budget')) return "What's a comfortable monthly payment for me?"
  if (p.includes('credit') || p.includes('preparation')) return 'How can I raise my score before applying?'
  if (p.includes('pre-approv')) return 'What questions should I ask lenders?'
  if (p.includes('find your home') || p.includes('house-hunt') || p.includes('hunt')) {
    return 'What should I watch for when comparing listings?'
  }
  if (p.includes('negotiation')) return 'How much room do I have to negotiate after inspection?'
  if (p.includes('underwriting')) return 'What usually slows underwriting—and how can I avoid it?'
  if (p.includes('closing')) return 'What should I bring to closing day?'
  if (p.includes('post-closing') || p.includes('homeowner')) return 'What should I set up first month as a homeowner?'
  return "What's the smartest next step for me right now?"
}

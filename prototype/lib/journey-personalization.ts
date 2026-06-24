/**
 * Journey *copy* (headlines, welcome, tab framing) converges on a two-axis model:
 * first-time vs first-generation. Other ICPs (move-up, investor) remain in storage
 * for feature routing and background signals, but are not a separate *voice* in the main UI.
 */
export type JourneyCopyAxis = "first-time" | "first-gen"

/** Collapse normalized segment ICP to the public journey copy axis. */
export function toJourneyCopyAxis(fullNormalizedIcp: string | null | undefined): JourneyCopyAxis {
  const v = (fullNormalizedIcp ?? "first-time").toString().trim().toLowerCase()
  if (v === "first-gen") return "first-gen"
  return "first-time"
}

export type JourneyDisplayVariant = {
  audienceLabel: string
  transactionLabel: string
  audienceTagline: string
}

/**
 * Display-only resolver: keeps legacy/stored values intact while giving components
 * a stable UI framing model.
 */
export function resolveJourneyDisplayVariant(params: {
  normalizedIcp: string | null | undefined
  transactionType: string | null | undefined
}): JourneyDisplayVariant {
  const axis = toJourneyCopyAxis(params.normalizedIcp)
  const tx = (params.transactionType ?? '').trim().toLowerCase()
  const transactionLabel =
    tx === 'refinance' ? 'Refinance' : tx === 'repeat-buyer' || tx === 'move-up' ? 'Move-up' : 'First-time purchase'

  if (axis === 'first-gen') {
    return {
      audienceLabel: 'First-generation buyer',
      transactionLabel,
      audienceTagline: 'Built for first-generation buyers with plain-language support',
    }
  }
  return {
    audienceLabel: 'First-time buyer',
    transactionLabel,
    audienceTagline: 'Built for first-time buyers with guided next steps',
  }
}

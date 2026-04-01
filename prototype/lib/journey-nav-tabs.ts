/** Shared journey tab ids for `/customized-journey` (header + roadmap panels). */

export type JourneyTab =
  | 'overview'
  | 'phase'
  | 'budget'
  | 'learn'
  | 'library'
  | 'inbox'
  | 'upgrades'

export const JOURNEY_TAB_IDS: JourneyTab[] = [
  'overview',
  'phase',
  'budget',
  'learn',
  'library',
  'inbox',
  'upgrades',
]

/** Microcopy for tab tooltips (`title` / accessible descriptions). */
export const JOURNEY_TAB_TOOLTIPS: Record<JourneyTab, string> = {
  overview: 'Where you stand today — readiness, numbers, next step.',
  phase: 'Your current step in the 7‑phase journey.',
  budget: 'Stress‑test your monthly payment — every line is editable.',
  learn: 'Bite‑sized concepts that build confidence.',
  library: 'Scripts, guides, and checklists.',
  inbox: 'Your alerts, tasks, and messages.',
  upgrades: 'Choose the support level that fits your journey.',
}

const LEGACY_TAB_MAP: Record<string, JourneyTab> = {}

export function isJourneyTab(v: string): v is JourneyTab {
  return (JOURNEY_TAB_IDS as string[]).includes(v)
}

export function parseJourneyTabParam(v: string | null | undefined): JourneyTab {
  const raw = typeof v === 'string' ? v.trim().toLowerCase() : ''
  if (raw && isJourneyTab(raw)) return raw
  if (raw && LEGACY_TAB_MAP[raw]) return LEGACY_TAB_MAP[raw]
  return 'overview'
}

export const JOURNEY_PAGE_PATH = '/customized-journey'

export function journeyTabHref(tab: JourneyTab): string {
  return `${JOURNEY_PAGE_PATH}?tab=${tab}`
}

export const JOURNEY_TAB_STORAGE_KEY = 'nq_journey_tab'

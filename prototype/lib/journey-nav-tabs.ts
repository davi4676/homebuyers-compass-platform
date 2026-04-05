/** Shared journey tab ids for `/customized-journey` (header + roadmap panels). */

export type JourneyTab =
  | 'overview'
  | 'phase'
  | 'budget'
  | 'learn'
  | 'library'
  | 'inbox'
  | 'upgrades'
  | 'assistance'
  | 'firstgen'

export const JOURNEY_TAB_IDS: JourneyTab[] = [
  'overview',
  'phase',
  'budget',
  'learn',
  'assistance',
  'firstgen',
  'library',
  'inbox',
  'upgrades',
]

/** Microcopy for tab tooltips (`title` / accessible descriptions). */
export const JOURNEY_TAB_TOOLTIPS: Record<JourneyTab, string> = {
  overview: 'Where you stand today — readiness, numbers, next step.',
  phase: 'Your current step in the 8‑phase journey.',
  budget: 'Stress‑test your monthly payment — every line is editable.',
  learn: 'Bite‑sized concepts that build confidence.',
  assistance: 'Down payment & closing cost programs matched to you.',
  firstgen: 'First‑gen resources: counselors, glossary, gift funds, and family scripts.',
  library: 'Scripts, guides, and checklists.',
  inbox: 'Your alerts, tasks, and messages.',
  upgrades: 'Choose the support level that fits your journey.',
}

/** Deep-link aliases for `?tab=` (e.g. marketing links). */
const LEGACY_TAB_MAP: Record<string, JourneyTab> = {
  timeline: 'phase',
  checklist: 'library',
  action: 'inbox',
}

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

/** True on the hub or any nested route (e.g. detail pages). */
export function isCustomizedJourneyPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false
  return pathname === JOURNEY_PAGE_PATH || pathname.startsWith(`${JOURNEY_PAGE_PATH}/`)
}

/**
 * Base path for `?tab=` links. Nested customized-journey routes must still link to the hub,
 * otherwise URLs like `/customized-journey/detail/...?tab=library` break.
 */
export function journeyTabLinkBasePath(pathname: string | null | undefined): string {
  if (isCustomizedJourneyPath(pathname)) return JOURNEY_PAGE_PATH
  return pathname || JOURNEY_PAGE_PATH
}

export function journeyTabHref(tab: JourneyTab): string {
  return `${JOURNEY_PAGE_PATH}?tab=${tab}`
}

/** Same path + `tab=`, preserving any other query keys (e.g. `view=today`). */
export function journeyTabHrefPreservingSearch(pathname: string, currentSearch: string, tab: JourneyTab): string {
  const params = new URLSearchParams(currentSearch || undefined)
  params.set('tab', tab)
  const qs = params.toString()
  return qs ? `${pathname}?${qs}` : journeyTabHref(tab)
}

export const JOURNEY_TAB_STORAGE_KEY = 'nq_journey_tab'

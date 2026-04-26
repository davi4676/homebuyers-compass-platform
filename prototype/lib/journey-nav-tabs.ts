/** Shared journey tab ids for `/customized-journey` (header + roadmap panels). */

export type JourneyTab = 'today' | 'plan' | 'money' | 'learn'

export const JOURNEY_TAB_IDS: JourneyTab[] = ['today', 'plan', 'money', 'learn']

/** Microcopy for tab tooltips (`title` / accessible descriptions). */
export const JOURNEY_TAB_TOOLTIPS: Record<JourneyTab, string> = {
  today: 'What to do right now — your current step, readiness, and alerts.',
  plan: 'Phase progress, milestones, and your budget sketch.',
  money: 'DPA programs, savings, funding — everything financial in one place.',
  learn: 'Concepts for your current step plus the full script and guide library.',
}

/** Deep-link aliases for `?tab=` (e.g. marketing links or old bookmarks). */
const LEGACY_TAB_MAP: Record<string, JourneyTab> = {
  overview: 'today',
  phase: 'plan',
  budget: 'plan',
  timeline: 'plan',
  assistance: 'money',
  library: 'learn',
  checklist: 'learn',
  inbox: 'today',
  action: 'today',
  upgrades: 'today',
  firstgen: 'learn',
}

export function isJourneyTab(v: string): v is JourneyTab {
  return (JOURNEY_TAB_IDS as string[]).includes(v)
}

export function parseJourneyTabParam(v: string | null | undefined): JourneyTab {
  const raw = typeof v === 'string' ? v.trim().toLowerCase() : ''
  if (raw && isJourneyTab(raw)) return raw
  if (raw && LEGACY_TAB_MAP[raw]) return LEGACY_TAB_MAP[raw]
  return 'today'
}

export const JOURNEY_PAGE_PATH = '/customized-journey'

/** True on the hub or any nested route (e.g. detail pages). */
export function isCustomizedJourneyPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false
  return pathname === JOURNEY_PAGE_PATH || pathname.startsWith(`${JOURNEY_PAGE_PATH}/`)
}

/**
 * Base path for `?tab=` links. Nested customized-journey routes must still link to the hub,
 * otherwise URLs like `/customized-journey/detail/...?tab=learn` break.
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

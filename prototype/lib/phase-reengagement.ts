/**
 * Temporal re-engagement reminders scheduled when a journey phase completes.
 * Stored in localStorage for all users; merged into Inbox when due.
 */

export type PhaseReminderDelay = '1w' | '2w' | '1m' | 'dismiss'

export type ScheduledPhaseReminder = {
  id: string
  phaseOrder: number
  title: string
  message: string
  actionUrl: string
  dueAt: string
  createdAt: string
  dismissed?: boolean
  notified?: boolean
}

export type PhaseReengagementPrompt = {
  phaseOrder: number
  headline: string
  subline: string
  defaultDelay: PhaseReminderDelay
}

export const PHASE_REENGAGEMENT_PROMPTS: PhaseReengagementPrompt[] = [
  {
    phaseOrder: 1,
    headline: 'Remind me to shop lenders?',
    subline: 'Most buyers compare at least three lenders within a two-week window.',
    defaultDelay: '2w',
  },
  {
    phaseOrder: 2,
    headline: "Remind me when I'm ready to tour homes?",
    subline: 'A short pause after pre-approval helps you search with clear numbers.',
    defaultDelay: '2w',
  },
  {
    phaseOrder: 3,
    headline: 'Remind me to follow up on my offer?',
    subline: 'Inspection and negotiation deadlines move fast — a nudge can help.',
    defaultDelay: '1w',
  },
  {
    phaseOrder: 4,
    headline: 'Remind me to stay responsive to underwriting?',
    subline: 'Quick replies to your lender keep your file moving.',
    defaultDelay: '1w',
  },
  {
    phaseOrder: 5,
    headline: 'Remind me to review my Closing Disclosure?',
    subline: 'You get at least three business days to compare fees before signing.',
    defaultDelay: '1w',
  },
  {
    phaseOrder: 6,
    headline: 'Remind me about first-year maintenance?',
    subline: 'Set aside time for seasonal checks and your emergency fund.',
    defaultDelay: '1m',
  },
]

const STORAGE_KEY = 'nq_scheduled_phase_reminders'
export const PHASE_REENGAGEMENT_MODAL_PREFIX = 'nq_phase_reengagement_modal:'

const DELAY_MS: Record<Exclude<PhaseReminderDelay, 'dismiss'>, number> = {
  '1w': 7 * 24 * 60 * 60 * 1000,
  '2w': 14 * 24 * 60 * 60 * 1000,
  '1m': 30 * 24 * 60 * 60 * 1000,
}

export function getPhaseReengagementPrompt(phaseOrder: number): PhaseReengagementPrompt | null {
  return PHASE_REENGAGEMENT_PROMPTS.find((p) => p.phaseOrder === phaseOrder) ?? null
}

export function isPhaseReengagementModalShown(phaseOrder: number): boolean {
  if (typeof window === 'undefined') return true
  try {
    return localStorage.getItem(`${PHASE_REENGAGEMENT_MODAL_PREFIX}${phaseOrder}`) === '1'
  } catch {
    return true
  }
}

export function markPhaseReengagementModalShown(phaseOrder: number): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(`${PHASE_REENGAGEMENT_MODAL_PREFIX}${phaseOrder}`, '1')
  } catch {
    /* ignore */
  }
}

function readAll(): ScheduledPhaseReminder[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as ScheduledPhaseReminder[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAll(items: ScheduledPhaseReminder[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    /* ignore */
  }
}

export function schedulePhaseReminder(
  phaseOrder: number,
  delay: PhaseReminderDelay
): ScheduledPhaseReminder | null {
  if (delay === 'dismiss') {
    markPhaseReengagementModalShown(phaseOrder)
    return null
  }

  const prompt = getPhaseReengagementPrompt(phaseOrder)
  if (!prompt) return null

  const now = Date.now()
  const dueAt = new Date(now + DELAY_MS[delay]).toISOString()
  const actionUrls: Record<number, string> = {
    1: '/resources#resource-shop-lenders',
    2: '/resources#resource-search-without-burnout',
    3: '/resources#resource-inspection-guide',
    4: '/resources#resource-underwriting-checklist',
    5: '/resources#resource-closing-cost-guide',
    6: '/resources#resource-first-year-maintenance-budget',
  }

  const reminder: ScheduledPhaseReminder = {
    id: `phase_rem_${phaseOrder}_${now}`,
    phaseOrder,
    title: prompt.headline.replace('?', ''),
    message: prompt.subline,
    actionUrl: actionUrls[phaseOrder] ?? '/customized-journey',
    dueAt,
    createdAt: new Date(now).toISOString(),
  }

  const all = readAll().filter((r) => !(r.phaseOrder === phaseOrder && !r.dismissed))
  all.push(reminder)
  writeAll(all)
  markPhaseReengagementModalShown(phaseOrder)
  return reminder
}

export function listScheduledPhaseReminders(): ScheduledPhaseReminder[] {
  return readAll().filter((r) => !r.dismissed)
}

export function listDuePhaseReminders(now = Date.now()): ScheduledPhaseReminder[] {
  return readAll().filter((r) => {
    if (r.dismissed || r.notified) return false
    return new Date(r.dueAt).getTime() <= now
  })
}

export function markPhaseReminderNotified(id: string): void {
  const all = readAll()
  const idx = all.findIndex((r) => r.id === id)
  if (idx === -1) return
  all[idx] = { ...all[idx], notified: true }
  writeAll(all)
}

export function dismissScheduledPhaseReminder(id: string): void {
  const all = readAll()
  const idx = all.findIndex((r) => r.id === id)
  if (idx === -1) return
  all[idx] = { ...all[idx], dismissed: true }
  writeAll(all)
}

export function formatReminderDueLabel(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

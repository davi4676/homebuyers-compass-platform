import type { JourneyTab } from '@/lib/journey-nav-tabs'

export const NQ_UNREAD_ALERTS_KEY = 'nq_unread_alerts'
export const NQ_UNREAD_ALERTS_CHANGED = 'nq-unread-alerts-changed'

const NQ_INBOX_TAB_SEEN_KEY = 'nq_inbox_tab_seen'

/** Keeps Alerts tab dot in sync: open tasks or never opened Alerts → unread until inbox tab is active. */
export function syncNqUnreadFromInboxState(activeTab: JourneyTab, inboxTasks: { done: boolean }[]) {
  if (typeof window === 'undefined') return
  try {
    if (activeTab === 'inbox') {
      localStorage.setItem(NQ_INBOX_TAB_SEEN_KEY, '1')
      localStorage.removeItem(NQ_UNREAD_ALERTS_KEY)
      window.dispatchEvent(new Event(NQ_UNREAD_ALERTS_CHANGED))
      return
    }
    const seen = localStorage.getItem(NQ_INBOX_TAB_SEEN_KEY) === '1'
    const hasOpenTasks = inboxTasks.some((t) => !t.done)
    if (hasOpenTasks || !seen) {
      localStorage.setItem(NQ_UNREAD_ALERTS_KEY, '1')
    } else {
      localStorage.removeItem(NQ_UNREAD_ALERTS_KEY)
    }
    window.dispatchEvent(new Event(NQ_UNREAD_ALERTS_CHANGED))
  } catch {
    /* ignore */
  }
}

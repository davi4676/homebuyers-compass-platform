/**
 * Track which playbook guides the user has opened (localStorage).
 */

const STORAGE_KEY = 'nq_guide_progress'

export type GuideProgressEntry = {
  id: string
  readAt: string
}

function readAll(): GuideProgressEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as GuideProgressEntry[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAll(entries: GuideProgressEntry[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
    window.dispatchEvent(new Event('nq-guide-progress-changed'))
  } catch {
    /* ignore */
  }
}

export function markGuideRead(id: string): void {
  const now = new Date().toISOString()
  const all = readAll().filter((e) => e.id !== id)
  all.push({ id, readAt: now })
  writeAll(all)
}

export function listGuidesRead(): GuideProgressEntry[] {
  return readAll()
}

export function isGuideRead(id: string): boolean {
  return readAll().some((e) => e.id === id)
}

export function countGuidesRead(): number {
  return readAll().length
}

/** Total free guides in playbooks (approximate catalog size for progress bar). */
export const GUIDE_CATALOG_SIZE = 47

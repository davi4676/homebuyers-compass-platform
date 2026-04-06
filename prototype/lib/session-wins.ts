/**
 * Short-lived “wins” for the current browser tab session (strategy: “You finished X today”).
 */

const STORAGE_KEY = 'nq_session_wins_v1'
const MAX_WINS = 10

export function recordSessionWin(message: string): void {
  if (typeof window === 'undefined') return
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    const arr = (raw ? JSON.parse(raw) : []) as string[]
    if (!arr.includes(message)) arr.push(message)
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(arr.slice(-MAX_WINS)))
    window.dispatchEvent(new Event('nq-session-win'))
  } catch {
    /* ignore */
  }
}

export function getSessionWins(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export function clearSessionWins(): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem(STORAGE_KEY)
    window.dispatchEvent(new Event('nq-session-win'))
  } catch {
    /* ignore */
  }
}

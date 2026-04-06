/** Client-only recent actions for journey Overview (Recent Activity). */
export const NQ_ACTIVITY_LOG_KEY = "nq_activity_log";
const MAX_ENTRIES = 50;

export type NqActivityLogEntry = { at: number; label: string };

export function appendNqActivityLog(label: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(NQ_ACTIVITY_LOG_KEY);
    const prev = raw ? (JSON.parse(raw) as unknown) : [];
    const arr = Array.isArray(prev) ? (prev as NqActivityLogEntry[]) : [];
    const next = [{ at: Date.now(), label }, ...arr].slice(0, MAX_ENTRIES);
    localStorage.setItem(NQ_ACTIVITY_LOG_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("nq-activity-log-updated"));
  } catch {
    /* ignore */
  }
}

export function readNqActivityLog(): NqActivityLogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(NQ_ACTIVITY_LOG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (e): e is NqActivityLogEntry =>
          e != null &&
          typeof e === "object" &&
          typeof (e as NqActivityLogEntry).at === "number" &&
          typeof (e as NqActivityLogEntry).label === "string"
      )
      .slice(0, MAX_ENTRIES);
  } catch {
    return [];
  }
}

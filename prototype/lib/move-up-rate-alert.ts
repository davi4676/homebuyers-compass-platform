import type { FreddieMacRateData } from '@/lib/freddie-mac-rates'

export const NQ_MOVE_UP_RATE_ALERT_KEY = 'nq_move_up_rate_alert_v1'

export type MoveUpRateAlertSubscription = {
  email: string
  subscribedAt: string
  benchmarkRate30Year: number
  benchmarkDate: string
  /** Basis points drop from benchmark that we treat as “notable” in prototype UI (e.g. 25 = 0.25%). */
  alertThresholdBps: number
}

export function loadMoveUpRateAlert(): MoveUpRateAlertSubscription | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(NQ_MOVE_UP_RATE_ALERT_KEY)
    if (!raw) return null
    const p = JSON.parse(raw) as Partial<MoveUpRateAlertSubscription>
    if (typeof p.benchmarkRate30Year !== 'number' || !p.subscribedAt) return null
    return {
      email: typeof p.email === 'string' ? p.email : '',
      subscribedAt: p.subscribedAt,
      benchmarkRate30Year: p.benchmarkRate30Year,
      benchmarkDate: typeof p.benchmarkDate === 'string' ? p.benchmarkDate : '',
      alertThresholdBps: typeof p.alertThresholdBps === 'number' ? p.alertThresholdBps : 25,
    }
  } catch {
    return null
  }
}

export function saveMoveUpRateAlert(
  email: string,
  rates: Pick<FreddieMacRateData, 'rate30Year' | 'date'>,
  thresholdBps = 25
): void {
  if (typeof window === 'undefined') return
  const payload: MoveUpRateAlertSubscription = {
    email: email.trim(),
    subscribedAt: new Date().toISOString(),
    benchmarkRate30Year: rates.rate30Year,
    benchmarkDate: rates.date,
    alertThresholdBps: thresholdBps,
  }
  try {
    localStorage.setItem(NQ_MOVE_UP_RATE_ALERT_KEY, JSON.stringify(payload))
  } catch {
    /* ignore */
  }
}

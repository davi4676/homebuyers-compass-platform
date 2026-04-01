import { readJsonFile, writeJsonFile } from './store'
import type { ReminderChannel } from './reminders'

export interface ReminderRunRecord {
  id: string
  startedAt: string
  processed: number
  deliveries: number
  failures: number
  details: Array<{ userId: string; channel: ReminderChannel; ok: boolean; message: string }>
}

const FILE = 'reminder-runs.json'
const MAX_RUNS = 500

function readRuns(): ReminderRunRecord[] {
  return readJsonFile<ReminderRunRecord[]>(FILE, [])
}

function writeRuns(runs: ReminderRunRecord[]): void {
  writeJsonFile(FILE, runs)
}

export function addReminderRun(input: Omit<ReminderRunRecord, 'id'>): ReminderRunRecord {
  const runs = readRuns()
  const record: ReminderRunRecord = {
    id: `rr_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    ...input,
  }
  runs.push(record)
  if (runs.length > MAX_RUNS) {
    runs.splice(0, runs.length - MAX_RUNS)
  }
  writeRuns(runs)
  return record
}

export function listReminderRuns(limit = 20): ReminderRunRecord[] {
  const runs = readRuns()
  return runs.slice(-limit).reverse()
}

export function getReminderRunStats() {
  const runs = readRuns()
  const totalRuns = runs.length
  const totalProcessed = runs.reduce((sum, r) => sum + r.processed, 0)
  const totalDeliveries = runs.reduce((sum, r) => sum + r.deliveries, 0)
  const totalFailures = runs.reduce((sum, r) => sum + r.failures, 0)
  const lastRunAt = totalRuns > 0 ? runs[runs.length - 1].startedAt : null
  const successRatePct =
    totalDeliveries + totalFailures > 0
      ? Math.round((totalDeliveries / (totalDeliveries + totalFailures)) * 100)
      : null

  return {
    totalRuns,
    totalProcessed,
    totalDeliveries,
    totalFailures,
    lastRunAt,
    successRatePct,
  }
}

export function getReminderChannelStats() {
  const runs = readRuns()
  const channelTotals: Record<ReminderChannel, number> = {
    email: 0,
    push: 0,
    'in-app': 0,
  }
  const channelFailures: Record<ReminderChannel, number> = {
    email: 0,
    push: 0,
    'in-app': 0,
  }

  for (const run of runs) {
    for (const detail of run.details) {
      channelTotals[detail.channel] += 1
      if (!detail.ok) channelFailures[detail.channel] += 1
    }
  }

  return { channelTotals, channelFailures }
}

function initSeries(length: number) {
  return Array.from({ length }, () => 0)
}

export function getReminderTrendStats() {
  const runs = readRuns()
  const now = new Date()
  const nowMs = now.getTime()

  // Hourly series for last 24h (oldest -> newest)
  const hourlyLabels: string[] = []
  const hourlyValues = initSeries(24)
  for (let i = 23; i >= 0; i--) {
    const d = new Date(nowMs - i * 60 * 60 * 1000)
    hourlyLabels.push(`${d.getHours().toString().padStart(2, '0')}:00`)
  }

  // Daily series for last 7 days (oldest -> newest)
  const dailyLabels: string[] = []
  const dailyValues = initSeries(7)
  for (let i = 6; i >= 0; i--) {
    const d = new Date(nowMs - i * 24 * 60 * 60 * 1000)
    dailyLabels.push(d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }))
  }

  for (const run of runs) {
    const ts = new Date(run.startedAt).getTime()
    if (Number.isNaN(ts)) continue

    const hourDiff = Math.floor((nowMs - ts) / (60 * 60 * 1000))
    if (hourDiff >= 0 && hourDiff < 24) {
      const idx = 23 - hourDiff
      hourlyValues[idx] += run.deliveries
    }

    const dayDiff = Math.floor((nowMs - ts) / (24 * 60 * 60 * 1000))
    if (dayDiff >= 0 && dayDiff < 7) {
      const idx = 6 - dayDiff
      dailyValues[idx] += run.deliveries
    }
  }

  return {
    hourly: {
      labels: hourlyLabels,
      values: hourlyValues,
      total: hourlyValues.reduce((a, b) => a + b, 0),
    },
    daily: {
      labels: dailyLabels,
      values: dailyValues,
      total: dailyValues.reduce((a, b) => a + b, 0),
    },
  }
}


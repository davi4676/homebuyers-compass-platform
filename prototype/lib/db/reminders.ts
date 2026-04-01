import { readJsonFile, writeJsonFile } from './store'

export type ReminderChannel = 'email' | 'push' | 'in-app'
export type ReminderCadence = 'daily' | 'weekly'
export type ReminderStatus = 'pending' | 'sent' | 'failed'

export interface ReminderPreferences {
  userId: string
  enabled: boolean
  cadence: ReminderCadence
  channels: ReminderChannel[]
  timezone: string
  preferredHourLocal: number
  nextReminderAt: string
  snoozedUntil?: string
  updatedAt: string
}

export interface ReminderNotification {
  id: string
  userId: string
  title: string
  message: string
  actionUrl?: string
  channel: ReminderChannel
  status: ReminderStatus
  createdAt: string
  deliveredAt?: string
  readAt?: string
  error?: string
}

type PreferencesMap = Record<string, ReminderPreferences>

const PREFERENCES_FILE = 'reminder-preferences.json'
const NOTIFICATIONS_FILE = 'reminder-notifications.json'
const DEFAULT_CADENCE: ReminderCadence = 'weekly'
const DEFAULT_HOUR = 9

function nowIso() {
  return new Date().toISOString()
}

function computeNextReminderAt(cadence: ReminderCadence): string {
  const d = new Date()
  d.setHours(DEFAULT_HOUR, 0, 0, 0)
  if (cadence === 'daily') {
    d.setDate(d.getDate() + 1)
  } else {
    d.setDate(d.getDate() + 7)
  }
  return d.toISOString()
}

function readPreferences(): PreferencesMap {
  return readJsonFile<PreferencesMap>(PREFERENCES_FILE, {})
}

function writePreferences(map: PreferencesMap) {
  writeJsonFile(PREFERENCES_FILE, map)
}

function readNotifications(): ReminderNotification[] {
  return readJsonFile<ReminderNotification[]>(NOTIFICATIONS_FILE, [])
}

function writeNotifications(notifications: ReminderNotification[]) {
  writeJsonFile(NOTIFICATIONS_FILE, notifications)
}

export function getReminderPreferences(userId: string): ReminderPreferences {
  const map = readPreferences()
  const existing = map[userId]
  if (existing) return existing
  const created: ReminderPreferences = {
    userId,
    enabled: false,
    cadence: DEFAULT_CADENCE,
    channels: ['in-app'],
    timezone: 'UTC',
    preferredHourLocal: DEFAULT_HOUR,
    nextReminderAt: computeNextReminderAt(DEFAULT_CADENCE),
    updatedAt: nowIso(),
  }
  map[userId] = created
  writePreferences(map)
  return created
}

export function upsertReminderPreferences(
  userId: string,
  updates: Partial<Omit<ReminderPreferences, 'userId' | 'updatedAt'>>
): ReminderPreferences {
  const map = readPreferences()
  const current = getReminderPreferences(userId)
  const next: ReminderPreferences = {
    ...current,
    ...updates,
    userId,
    updatedAt: nowIso(),
  }
  map[userId] = next
  writePreferences(map)
  return next
}

export function listDueReminderPreferences(now = new Date()): ReminderPreferences[] {
  const map = readPreferences()
  const nowMs = now.getTime()
  return Object.values(map).filter((p) => {
    if (!p.enabled) return false
    if (p.snoozedUntil && new Date(p.snoozedUntil).getTime() > nowMs) return false
    return new Date(p.nextReminderAt).getTime() <= nowMs
  })
}

export function bumpReminderSchedule(userId: string): ReminderPreferences {
  const current = getReminderPreferences(userId)
  const nextReminderAt = computeNextReminderAt(current.cadence)
  return upsertReminderPreferences(userId, {
    nextReminderAt,
    snoozedUntil: undefined,
  })
}

export function addReminderNotification(
  input: Omit<ReminderNotification, 'id' | 'createdAt' | 'status'> & { status?: ReminderStatus }
): ReminderNotification {
  const notifications = readNotifications()
  const { status, ...rest } = input
  const notification: ReminderNotification = {
    id: `rem_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    status: status || 'sent',
    createdAt: nowIso(),
    ...rest,
  }
  notifications.push(notification)
  if (notifications.length > 2000) {
    notifications.splice(0, notifications.length - 2000)
  }
  writeNotifications(notifications)
  return notification
}

export function listReminderNotifications(userId: string, limit = 20): ReminderNotification[] {
  const notifications = readNotifications()
  return notifications
    .filter((n) => n.userId === userId)
    .slice(-limit)
    .reverse()
}

export function markReminderNotificationRead(userId: string, id: string): ReminderNotification | null {
  const notifications = readNotifications()
  const idx = notifications.findIndex((n) => n.id === id && n.userId === userId)
  if (idx === -1) return null
  notifications[idx] = {
    ...notifications[idx],
    readAt: nowIso(),
  }
  writeNotifications(notifications)
  return notifications[idx]
}


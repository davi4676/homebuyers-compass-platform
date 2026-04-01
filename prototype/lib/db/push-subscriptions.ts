import { readJsonFile, writeJsonFile } from './store'

export interface StoredPushSubscription {
  id: string
  userId: string
  endpoint: string
  p256dh: string
  auth: string
  userAgent?: string
  createdAt: string
  updatedAt: string
  lastSentAt?: string
  active: boolean
}

const FILE = 'push-subscriptions.json'

function readSubscriptions(): StoredPushSubscription[] {
  return readJsonFile<StoredPushSubscription[]>(FILE, [])
}

function writeSubscriptions(subscriptions: StoredPushSubscription[]) {
  writeJsonFile(FILE, subscriptions)
}

export function listPushSubscriptionsForUser(userId: string): StoredPushSubscription[] {
  return readSubscriptions().filter((s) => s.userId === userId && s.active)
}

export function upsertPushSubscription(input: {
  userId: string
  endpoint: string
  p256dh: string
  auth: string
  userAgent?: string
}): StoredPushSubscription {
  const subscriptions = readSubscriptions()
  const now = new Date().toISOString()
  const idx = subscriptions.findIndex(
    (s) => s.userId === input.userId && s.endpoint === input.endpoint
  )

  if (idx >= 0) {
    subscriptions[idx] = {
      ...subscriptions[idx],
      p256dh: input.p256dh,
      auth: input.auth,
      userAgent: input.userAgent,
      active: true,
      updatedAt: now,
    }
    writeSubscriptions(subscriptions)
    return subscriptions[idx]
  }

  const created: StoredPushSubscription = {
    id: `push_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    userId: input.userId,
    endpoint: input.endpoint,
    p256dh: input.p256dh,
    auth: input.auth,
    userAgent: input.userAgent,
    createdAt: now,
    updatedAt: now,
    active: true,
  }
  subscriptions.push(created)
  writeSubscriptions(subscriptions)
  return created
}

export function deactivatePushSubscription(userId: string, endpoint: string): boolean {
  const subscriptions = readSubscriptions()
  const idx = subscriptions.findIndex((s) => s.userId === userId && s.endpoint === endpoint)
  if (idx < 0) return false
  subscriptions[idx] = {
    ...subscriptions[idx],
    active: false,
    updatedAt: new Date().toISOString(),
  }
  writeSubscriptions(subscriptions)
  return true
}

export function touchPushSubscriptionSent(id: string): void {
  const subscriptions = readSubscriptions()
  const idx = subscriptions.findIndex((s) => s.id === id)
  if (idx < 0) return
  subscriptions[idx] = {
    ...subscriptions[idx],
    lastSentAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  writeSubscriptions(subscriptions)
}

export function getPushSubscriptionStats() {
  const subscriptions = readSubscriptions()
  const total = subscriptions.length
  const active = subscriptions.filter((s) => s.active).length
  const inactive = total - active
  const usersWithActive = new Set(
    subscriptions.filter((s) => s.active).map((s) => s.userId)
  ).size
  const lastUpdatedAt =
    subscriptions.length > 0
      ? subscriptions
          .map((s) => s.updatedAt)
          .sort((a, b) => (a < b ? 1 : -1))[0]
      : null

  return {
    total,
    active,
    inactive,
    usersWithActive,
    lastUpdatedAt,
  }
}


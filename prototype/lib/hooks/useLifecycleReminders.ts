'use client'

import { useCallback, useEffect, useState } from 'react'

export interface LifecycleReminderPreferences {
  enabled: boolean
  cadence: 'daily' | 'weekly'
  channels: Array<'email' | 'push' | 'in-app'>
  timezone: string
  preferredHourLocal: number
  nextReminderAt: string
  snoozedUntil?: string
}

export interface LifecycleReminderNotification {
  id: string
  title: string
  message: string
  actionUrl?: string
  channel: 'email' | 'push' | 'in-app'
  createdAt: string
  readAt?: string
}

export function useLifecycleReminders(enabled = true) {
  const [preferences, setPreferences] = useState<LifecycleReminderPreferences | null>(null)
  const [notifications, setNotifications] = useState<LifecycleReminderNotification[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!enabled) return
    setLoading(true)
    try {
      const [prefRes, notifRes] = await Promise.all([
        fetch('/api/user/reminders', { credentials: 'include' }),
        fetch('/api/user/reminders/notifications?limit=20', { credentials: 'include' }),
      ])
      const prefData = await prefRes.json()
      const notifData = await notifRes.json()
      if (prefRes.ok) setPreferences(prefData.preferences || null)
      if (notifRes.ok) setNotifications(notifData.notifications || [])
    } finally {
      setLoading(false)
    }
  }, [enabled])

  useEffect(() => {
    refresh()
  }, [refresh])

  const updatePreferences = useCallback(
    async (updates: Partial<LifecycleReminderPreferences>) => {
      const res = await fetch('/api/user/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates),
      })
      const data = await res.json()
      if (res.ok) setPreferences(data.preferences || null)
      return res.ok
    },
    []
  )

  const markRead = useCallback(async (id: string) => {
    const res = await fetch('/api/user/reminders/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id }),
    })
    if (res.ok) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
      )
    }
  }, [])

  const runNow = useCallback(async () => {
    await fetch('/api/user/reminders/run', {
      method: 'POST',
      credentials: 'include',
    })
    await refresh()
  }, [refresh])

  return {
    preferences,
    notifications,
    loading,
    refresh,
    updatePreferences,
    markRead,
    runNow,
  }
}


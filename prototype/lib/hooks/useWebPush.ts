'use client'

import { useCallback, useEffect, useState } from 'react'

interface PushStatusResponse {
  configured: boolean
  vapidPublicKey: string | null
  subscribed: boolean
  subscriptionCount: number
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = window.atob(base64)
  const out = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; ++i) out[i] = raw.charCodeAt(i)
  return out
}

export function useWebPush() {
  const [loading, setLoading] = useState(true)
  const [supported, setSupported] = useState(false)
  const [configured, setConfigured] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [subscribed, setSubscribed] = useState(false)
  const [vapidPublicKey, setVapidPublicKey] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    const pushSupported =
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    setSupported(pushSupported)
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission)
    }

    try {
      const res = await fetch('/api/push/status', { credentials: 'include' })
      const data = (await res.json()) as PushStatusResponse
      if (res.ok) {
        setConfigured(Boolean(data.configured))
        setSubscribed(Boolean(data.subscribed))
        setVapidPublicKey(data.vapidPublicKey || null)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const subscribe = useCallback(async () => {
    if (!supported || !vapidPublicKey) return { ok: false, error: 'Push not supported/configured' }
    const permissionResult = await Notification.requestPermission()
    setPermission(permissionResult)
    if (permissionResult !== 'granted') {
      return { ok: false, error: 'Notification permission denied' }
    }

    const registration = await navigator.serviceWorker.register('/sw.js')
    let subscription = await registration.pushManager.getSubscription()
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      })
    }

    const payload = subscription.toJSON()
    const res = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      return { ok: false, error: 'Failed to save subscription' }
    }
    setSubscribed(true)
    return { ok: true }
  }, [supported, vapidPublicKey])

  const unsubscribe = useCallback(async () => {
    const registration = await navigator.serviceWorker.getRegistration()
    const subscription = registration ? await registration.pushManager.getSubscription() : null

    if (subscription) {
      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      })
      await subscription.unsubscribe()
    }
    setSubscribed(false)
    return { ok: true }
  }, [])

  return {
    loading,
    supported,
    configured,
    permission,
    subscribed,
    refresh,
    subscribe,
    unsubscribe,
  }
}


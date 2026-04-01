import { deactivatePushSubscription, listPushSubscriptionsForUser, touchPushSubscriptionSent } from '@/lib/db/push-subscriptions'

interface PushPayload {
  title: string
  body: string
  url?: string
}

interface PushSendResult {
  delivered: number
  failed: number
  details: Array<{ endpoint: string; ok: boolean; message: string }>
}

async function getWebPushLib() {
  const mod = await import('web-push')
  return mod.default || mod
}

export function hasPushEnvConfigured() {
  return Boolean(
    process.env.VAPID_PUBLIC_KEY &&
      process.env.VAPID_PRIVATE_KEY &&
      process.env.VAPID_SUBJECT
  )
}

export async function sendWebPushToUser(
  userId: string,
  payload: PushPayload
): Promise<PushSendResult> {
  const subscriptions = listPushSubscriptionsForUser(userId)
  if (subscriptions.length === 0) {
    return {
      delivered: 0,
      failed: 0,
      details: [],
    }
  }

  if (!hasPushEnvConfigured()) {
    return {
      delivered: 0,
      failed: subscriptions.length,
      details: subscriptions.map((s) => ({
        endpoint: s.endpoint,
        ok: false,
        message: 'VAPID env vars not configured',
      })),
    }
  }

  const webpush = await getWebPushLib()
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT as string,
    process.env.VAPID_PUBLIC_KEY as string,
    process.env.VAPID_PRIVATE_KEY as string
  )

  const details: PushSendResult['details'] = []
  let delivered = 0
  let failed = 0

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        },
        JSON.stringify(payload)
      )
      touchPushSubscriptionSent(sub.id)
      delivered++
      details.push({
        endpoint: sub.endpoint,
        ok: true,
        message: 'Delivered',
      })
    } catch (error) {
      failed++
      const message = error instanceof Error ? error.message : 'Push delivery failed'
      details.push({
        endpoint: sub.endpoint,
        ok: false,
        message,
      })

      const statusCode = (error as { statusCode?: number })?.statusCode
      if (statusCode === 404 || statusCode === 410) {
        deactivatePushSubscription(userId, sub.endpoint)
      }
    }
  }

  return { delivered, failed, details }
}


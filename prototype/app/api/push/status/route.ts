import { NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth-server'
import { hasPushEnvConfigured } from '@/lib/push/web-push'
import { listPushSubscriptionsForUser } from '@/lib/db/push-subscriptions'

export async function GET() {
  const session = await getSessionFromRequest()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const subscriptions = listPushSubscriptionsForUser(session.userId)
  return NextResponse.json({
    configured: hasPushEnvConfigured(),
    vapidPublicKey: process.env.VAPID_PUBLIC_KEY || null,
    subscribed: subscriptions.length > 0,
    subscriptionCount: subscriptions.length,
  })
}


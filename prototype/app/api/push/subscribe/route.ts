import { NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth-server'
import { upsertPushSubscription } from '@/lib/db/push-subscriptions'

interface SubscriptionBody {
  endpoint?: string
  keys?: {
    p256dh?: string
    auth?: string
  }
}

export async function POST(request: Request) {
  const session = await getSessionFromRequest()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = (await request.json()) as SubscriptionBody
    const endpoint = String(body?.endpoint || '')
    const p256dh = String(body?.keys?.p256dh || '')
    const auth = String(body?.keys?.auth || '')
    if (!endpoint || !p256dh || !auth) {
      return NextResponse.json({ error: 'Invalid subscription payload' }, { status: 400 })
    }

    const userAgent = request.headers.get('user-agent') || undefined
    const subscription = upsertPushSubscription({
      userId: session.userId,
      endpoint,
      p256dh,
      auth,
      userAgent,
    })
    return NextResponse.json({ subscription })
  } catch (error) {
    console.error('Push subscribe failed:', error)
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}


import { NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth-server'
import { deactivatePushSubscription } from '@/lib/db/push-subscriptions'

export async function POST(request: Request) {
  const session = await getSessionFromRequest()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = (await request.json()) as { endpoint?: string }
    const endpoint = String(body.endpoint || '')
    if (!endpoint) {
      return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 })
    }
    const removed = deactivatePushSubscription(session.userId, endpoint)
    return NextResponse.json({ ok: removed })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}


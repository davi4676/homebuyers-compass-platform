import { NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth-server'
import {
  listReminderNotifications,
  markReminderNotificationRead,
} from '@/lib/db/reminders'

export async function GET(request: Request) {
  const session = await getSessionFromRequest()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const limit = Math.min(Number(searchParams.get('limit')) || 20, 100)
  const notifications = listReminderNotifications(session.userId, limit)
  return NextResponse.json({ notifications })
}

export async function POST(request: Request) {
  const session = await getSessionFromRequest()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const id = String(body.id || '')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    const updated = markReminderNotificationRead(session.userId, id)
    if (!updated) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }
    return NextResponse.json({ notification: updated })
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }
}


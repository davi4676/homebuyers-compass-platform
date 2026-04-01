import { NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth-server'
import {
  getReminderPreferences,
  upsertReminderPreferences,
  type ReminderCadence,
  type ReminderChannel,
} from '@/lib/db/reminders'

export async function GET() {
  const session = await getSessionFromRequest()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const preferences = getReminderPreferences(session.userId)
  return NextResponse.json({ preferences })
}

export async function POST(request: Request) {
  const session = await getSessionFromRequest()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const enabled = typeof body.enabled === 'boolean' ? body.enabled : undefined
    const cadence = body.cadence as ReminderCadence | undefined
    const channels = Array.isArray(body.channels)
      ? (body.channels.filter((c: unknown) => ['email', 'push', 'in-app'].includes(String(c))) as ReminderChannel[])
      : undefined
    const timezone = typeof body.timezone === 'string' ? body.timezone : undefined
    const preferredHourLocal =
      typeof body.preferredHourLocal === 'number' ? Math.max(0, Math.min(23, body.preferredHourLocal)) : undefined
    const snoozedUntil = typeof body.snoozedUntil === 'string' ? body.snoozedUntil : undefined

    const next = upsertReminderPreferences(session.userId, {
      ...(enabled != null ? { enabled } : {}),
      ...(cadence ? { cadence } : {}),
      ...(channels ? { channels } : {}),
      ...(timezone ? { timezone } : {}),
      ...(preferredHourLocal != null ? { preferredHourLocal } : {}),
      ...(snoozedUntil ? { snoozedUntil } : {}),
    })
    return NextResponse.json({ preferences: next })
  } catch (error) {
    console.error('Update reminders failed:', error)
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}


import { NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth-server'
import { findUserById, updateUser } from '@/lib/user-store'

function addCalendarMonths(from: Date, months: number): Date {
  const d = new Date(from.getTime())
  d.setMonth(d.getMonth() + months)
  return d
}

/**
 * Record server-side subscription pause (mirror of client localStorage).
 * Billing at 50% should be implemented in Stripe (pause price / schedule).
 */
export async function POST(request: Request) {
  const session = await getSessionFromRequest()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { months?: number }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const months = Number(body.months)
  if (![1, 2, 3].includes(months)) {
    return NextResponse.json({ error: 'months must be 1, 2, or 3' }, { status: 400 })
  }

  const user = findUserById(session.userId)
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const startedAt = new Date().toISOString()
  const until = addCalendarMonths(new Date(), months).toISOString()

  updateUser(user.id, {
    subscriptionPause: { startedAt, until },
  })

  return NextResponse.json({ ok: true, startedAt, until })
}

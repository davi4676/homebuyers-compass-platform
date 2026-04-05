import { NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth-server'
import { findUserById, updateUser } from '@/lib/user-store'

const MS_DAY = 86_400_000
const TRIAL_DAYS = 7

/**
 * Register server-side Momentum trial start for lifecycle email (day-5) and server tier hygiene.
 * Client must also call `startMomentumTrialLocal()` for immediate UI. Anonymous users skip this route.
 */
export async function POST() {
  const session = await getSessionFromRequest()
  if (!session) {
    return NextResponse.json({ ok: true, serverSync: false })
  }

  const user = findUserById(session.userId)
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  if (user.stripeSubscriptionId) {
    return NextResponse.json({ ok: true, serverSync: false, reason: 'subscribed' })
  }

  const existing = user.momentumTrial
  if (existing?.startedAt) {
    const endMs = new Date(existing.startedAt).getTime() + TRIAL_DAYS * MS_DAY
    if (Date.now() < endMs) {
      return NextResponse.json({ ok: true, serverSync: false, reason: 'trial_already_active' })
    }
  }

  const startedAt = new Date().toISOString()
  updateUser(user.id, {
    subscriptionTier: 'momentum',
    momentumTrial: { startedAt, endingEmailSent: false },
  })

  return NextResponse.json({ ok: true, serverSync: true, startedAt })
}

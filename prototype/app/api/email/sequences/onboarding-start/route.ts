import { NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth-server'
import { findUserById, updateUser } from '@/lib/user-store'
import { sendOnboardingStep } from '@/lib/email-sequences/onboarding'

export async function POST() {
  const session = await getSessionFromRequest()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = findUserById(session.userId)
  if (!user?.email) {
    return NextResponse.json({ error: 'No email on account' }, { status: 400 })
  }

  if (user.emailSequences?.onboarding?.startedAt) {
    return NextResponse.json({ ok: true, duplicate: true })
  }

  const startedAt = new Date().toISOString()
  const r = await sendOnboardingStep(user.email, 0, user.firstName)
  if (!r.ok) {
    return NextResponse.json({ ok: false, message: r.message }, { status: 503 })
  }

  updateUser(user.id, {
    emailSequences: {
      ...user.emailSequences,
      onboarding: { startedAt, stepsSent: [0] },
    },
  })

  return NextResponse.json({ ok: true, started: true })
}

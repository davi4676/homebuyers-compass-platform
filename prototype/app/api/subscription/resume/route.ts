import { NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth-server'
import { findUserById, updateUser } from '@/lib/user-store'

export async function POST() {
  const session = await getSessionFromRequest()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = findUserById(session.userId)
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  updateUser(user.id, { subscriptionPause: undefined })

  return NextResponse.json({ ok: true })
}

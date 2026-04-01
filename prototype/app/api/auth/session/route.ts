import { NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth-server'
import { findUserById, toPublicUser } from '@/lib/user-store'

export async function GET() {
  const session = await getSessionFromRequest()
  if (!session) {
    return NextResponse.json({ user: null })
  }

  const user = findUserById(session.userId)
  if (!user) {
    return NextResponse.json({ user: null })
  }

  return NextResponse.json({ user: toPublicUser(user) })
}

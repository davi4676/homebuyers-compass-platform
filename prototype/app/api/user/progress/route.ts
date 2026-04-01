import { NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth-server'
import { getProgress, saveProgress } from '@/lib/db/progress'
import type { UserProgress } from '@/lib/gamification'

export async function GET() {
  const session = await getSessionFromRequest()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const progress = getProgress(session.userId, 'foundations')
  return NextResponse.json(progress)
}

export async function POST(request: Request) {
  const session = await getSessionFromRequest()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json() as Partial<UserProgress>
    const existing = getProgress(session.userId, 'foundations')
    const updated: UserProgress = {
      ...existing,
      ...body,
      userId: session.userId,
    }
    saveProgress(session.userId, updated)
    return NextResponse.json(updated)
  } catch (e) {
    console.error('Save progress error:', e)
    return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 })
  }
}

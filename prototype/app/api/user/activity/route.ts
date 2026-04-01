import { NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth-server'
import { addActivity, getActivity, getProductivitySummary } from '@/lib/db/activity'
import type { ActivityActionId } from '@/lib/db/activity'

export async function GET(request: Request) {
  const session = await getSessionFromRequest()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const summary = searchParams.get('summary') === 'true'
  const limit = Math.min(Number(searchParams.get('limit')) || 50, 100)

  if (summary) {
    const data = getProductivitySummary(session.userId)
    return NextResponse.json(data)
  }

  const events = getActivity(session.userId, limit)
  return NextResponse.json({ events })
}

export async function POST(request: Request) {
  const session = await getSessionFromRequest()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const actionId = (body.actionId as ActivityActionId) || 'tool_used'
    const metadata = typeof body.metadata === 'object' ? body.metadata : undefined
    const event = addActivity(session.userId, actionId, metadata)
    return NextResponse.json(event)
  } catch (e) {
    console.error('Track activity error:', e)
    return NextResponse.json({ error: 'Failed to track activity' }, { status: 500 })
  }
}

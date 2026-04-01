import { NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth-server'
import {
  getUserQuizState,
  setUserQuizState,
  findUserById,
} from '@/lib/user-store'
import type { TransactionType } from '@/lib/user-store'

export async function GET() {
  const session = await getSessionFromRequest()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const state = getUserQuizState(session.userId)
  if (!state) {
    return NextResponse.json({ transactionType: null, quizAnswers: null })
  }

  return NextResponse.json({
    transactionType: state.transactionType,
    quizAnswers: state.quizAnswers,
  })
}

export async function POST(request: Request) {
  const session = await getSessionFromRequest()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = findUserById(session.userId)
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  try {
    const body = await request.json()
    const { transactionType, quizAnswers } = body

    const validTypes: TransactionType[] = ['first-time', 'repeat-buyer', 'refinance']
    const tt = validTypes.includes(transactionType) ? transactionType : 'first-time'
    const answers = typeof quizAnswers === 'object' && quizAnswers !== null ? quizAnswers : {}

    setUserQuizState(session.userId, tt, answers)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Save quiz state error:', e)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSessionFromRequest } from '@/lib/auth-server'
import { assignExperiment } from '@/lib/experiments'

const EXP_COOKIE = 'nq_subject_id'

function createAnonymousSubjectId() {
  return `anon_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const experimentKey = String(body.experimentKey || '')
    if (!experimentKey) {
      return NextResponse.json({ error: 'Missing experimentKey' }, { status: 400 })
    }

    const session = await getSessionFromRequest()
    const cookieStore = await cookies()
    const existingSubject = cookieStore.get(EXP_COOKIE)?.value
    const subjectKey = session?.userId || existingSubject || createAnonymousSubjectId()

    const assignment = assignExperiment(experimentKey, subjectKey)
    const response = NextResponse.json({ assignment })

    if (!existingSubject) {
      response.cookies.set(EXP_COOKIE, subjectKey, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 180,
        path: '/',
      })
    }

    return response
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}


import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSessionFromRequest } from '@/lib/auth-server'
import { trackExperimentEvent, type ExperimentVariant } from '@/lib/experiments'

const EXP_COOKIE = 'nq_subject_id'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const session = await getSessionFromRequest()
    const cookieStore = await cookies()
    const subjectKey = session?.userId || cookieStore.get(EXP_COOKIE)?.value

    if (!subjectKey) {
      return NextResponse.json({ error: 'Missing subject identity' }, { status: 400 })
    }

    const experimentKey = String(body.experimentKey || '')
    const eventName = String(body.eventName || '')
    const variant = String(body.variant || 'control') as ExperimentVariant
    if (!experimentKey || !eventName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    trackExperimentEvent({
      experimentKey,
      subjectKey,
      variant: variant === 'treatment' ? 'treatment' : 'control',
      eventName,
      metadata: typeof body.metadata === 'object' ? body.metadata : undefined,
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}


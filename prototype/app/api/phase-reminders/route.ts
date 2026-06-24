import { NextResponse } from 'next/server'
import { upsertPhaseReminder } from '@/lib/db/phase-reminder-subscriptions'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const phaseOrder = typeof body.phaseOrder === 'number' ? body.phaseOrder : Number(body.phaseOrder)
    const title = typeof body.title === 'string' ? body.title.trim() : ''
    const message = typeof body.message === 'string' ? body.message.trim() : ''
    const actionUrl = typeof body.actionUrl === 'string' ? body.actionUrl.trim() : '/customized-journey'
    const dueAt = typeof body.dueAt === 'string' ? body.dueAt : ''
    const id = typeof body.id === 'string' ? body.id : `phase_rem_${phaseOrder}_${Date.now()}`

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, error: 'Valid email required for reminders' }, { status: 400 })
    }
    if (!Number.isFinite(phaseOrder) || phaseOrder < 1) {
      return NextResponse.json({ ok: false, error: 'Invalid phase' }, { status: 400 })
    }
    if (!dueAt || Number.isNaN(new Date(dueAt).getTime())) {
      return NextResponse.json({ ok: false, error: 'Invalid due date' }, { status: 400 })
    }

    upsertPhaseReminder({
      id,
      email,
      phaseOrder,
      title: title || `Phase ${phaseOrder} reminder`,
      message: message || 'Continue your homebuying journey.',
      actionUrl,
      dueAt,
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: 'Bad request' }, { status: 400 })
  }
}

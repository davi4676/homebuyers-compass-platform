import { NextResponse } from 'next/server'

/**
 * Prototype lead capture — no auth. Logs server-side; extend to CRM/email provider later.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = typeof body.email === 'string' ? body.email.trim() : ''
    const source = typeof body.source === 'string' ? body.source : 'unknown'
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, error: 'Invalid email' }, { status: 400 })
    }
    console.log('[nestquest-lead-email]', { email, source })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
}

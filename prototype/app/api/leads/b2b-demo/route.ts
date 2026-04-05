import { NextResponse } from 'next/server'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type B2BDemoPayload = {
  fullName: string
  email: string
  organization: string
  organizationType: string
  interestedTier: string
  teamSize: string
  message: string
}

/**
 * B2B demo requests — logs server-side; wire to CRM/email (e.g. Resend) in production.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<B2BDemoPayload>
    const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : ''
    const email = typeof body.email === 'string' ? body.email.trim() : ''
    const organization = typeof body.organization === 'string' ? body.organization.trim() : ''
    const organizationType = typeof body.organizationType === 'string' ? body.organizationType.trim() : ''
    const interestedTier = typeof body.interestedTier === 'string' ? body.interestedTier.trim() : ''
    const teamSize = typeof body.teamSize === 'string' ? body.teamSize.trim() : ''
    const message = typeof body.message === 'string' ? body.message.trim() : ''

    if (!fullName || fullName.length > 200) {
      return NextResponse.json({ ok: false, error: 'Name is required' }, { status: 400 })
    }
    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ ok: false, error: 'Valid work email is required' }, { status: 400 })
    }
    if (!organization || organization.length > 300) {
      return NextResponse.json({ ok: false, error: 'Organization name is required' }, { status: 400 })
    }
    if (!organizationType) {
      return NextResponse.json({ ok: false, error: 'Organization type is required' }, { status: 400 })
    }

    const payload: B2BDemoPayload = {
      fullName,
      email,
      organization,
      organizationType,
      interestedTier,
      teamSize,
      message: message.slice(0, 4000),
    }

    console.log('[nestquest-b2b-demo]', payload)

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 })
  }
}

import { NextResponse } from 'next/server'
import { listApprovedTestimonials, submitTestimonial } from '@/lib/db/testimonials'

export async function GET() {
  const items = listApprovedTestimonials(20)
  return NextResponse.json({
    ok: true,
    testimonials: items.map((t) => ({
      name: t.name,
      location: t.location,
      quote: t.quote,
      rating: t.rating,
    })),
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const location = typeof body.location === 'string' ? body.location.trim() : ''
    const quote = typeof body.quote === 'string' ? body.quote.trim() : ''
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : undefined
    const consent = body.consent === true

    if (!name || name.length < 2) {
      return NextResponse.json({ ok: false, error: 'Name is required' }, { status: 400 })
    }
    if (!location || location.length < 2) {
      return NextResponse.json({ ok: false, error: 'City/state is required' }, { status: 400 })
    }
    if (!quote || quote.length < 20) {
      return NextResponse.json({ ok: false, error: 'Please share at least a few sentences' }, { status: 400 })
    }
    if (quote.length > 600) {
      return NextResponse.json({ ok: false, error: 'Quote is too long' }, { status: 400 })
    }
    if (!consent) {
      return NextResponse.json({ ok: false, error: 'Consent is required to publish your story' }, { status: 400 })
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, error: 'Invalid email' }, { status: 400 })
    }

    submitTestimonial({ name, location, quote, email, consent })
    return NextResponse.json({
      ok: true,
      message: 'Thanks! We review stories before featuring them on the site.',
    })
  } catch {
    return NextResponse.json({ ok: false, error: 'Bad request' }, { status: 400 })
  }
}

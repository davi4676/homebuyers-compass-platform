import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getSessionFromRequest } from '@/lib/auth-server'

type CompassBody = {
  system?: string
  messages?: Array<{ role: string; content: string }>
}

/**
 * Server-side Anthropic proxy for Compass — keeps ANTHROPIC_API_KEY off the client.
 */
export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized. Please log in to use Compass.' }, { status: 401 })
  }

  let body: CompassBody
  try {
    body = (await request.json()) as CompassBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const system = typeof body.system === 'string' ? body.system : ''
  const raw = Array.isArray(body.messages) ? body.messages : []

  const messages: Anthropic.MessageParam[] = raw
    .filter(
      (m): m is { role: 'user' | 'assistant'; content: string } =>
        (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string'
    )
    .map((m) => ({ role: m.role, content: m.content }))

  if (messages.length === 0) {
    return NextResponse.json({ error: 'messages must include at least one user/assistant turn' }, { status: 400 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY not set')
    return NextResponse.json({ error: 'Compass is temporarily unavailable.' }, { status: 503 })
  }

  const client = new Anthropic({ apiKey })

  try {
    const res = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system,
      messages,
    })

    const textBlock = res.content.find((b): b is Anthropic.TextBlock => b.type === 'text')
    const reply =
      textBlock?.text?.trim() ||
      "I'm having trouble connecting — please try again in a moment."

    return NextResponse.json({ reply })
  } catch (err) {
    console.error('Compass API error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}

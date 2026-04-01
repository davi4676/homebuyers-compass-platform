import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getSessionFromRequest } from '@/lib/auth-server'
import { findUserById, toPublicUser } from '@/lib/user-store'
import { normalizeUserTier, type UserTier } from '@/lib/tiers'
import { retrieveChunks } from '@/lib/chatbot/retrieval'
import { buildSystemPrompt } from '@/lib/chatbot/system-prompt'
import { validateResponse } from '@/lib/chatbot/validation'

const COOKIE_TIER = 'hbc_tier'
const MAX_HISTORY_TURNS = 10

function getTierFromRequest(request: NextRequest, userTier?: string): UserTier {
  const cookie = request.cookies.get(COOKIE_TIER)?.value
  return normalizeUserTier(cookie ?? userTier)
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized. Please log in to use the chatbot.' }, { status: 401 })
  }

  const user = findUserById(session.userId)
  if (!user) {
    return NextResponse.json({ error: 'User not found.' }, { status: 401 })
  }

  const publicUser = toPublicUser(user)
  const tier = getTierFromRequest(request, publicUser.subscriptionTier)

  try {
    const body = await request.json()
    const { message, history = [] } = body as { message: string; history?: Array<{ role: string; content: string }> }

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const trimmedMessage = message.trim()
    const recentHistory = history.slice(-MAX_HISTORY_TURNS)

    const chunks = retrieveChunks(trimmedMessage)
    const hasRetrievedChunks = chunks.length > 0

    const knowledgeBlock = hasRetrievedChunks
      ? `\n\n## Retrieved knowledge (answer from this when relevant):\n\n${chunks.map((c) => `[${c.source}]\n${c.text}`).join('\n\n---\n\n')}`
      : ''

    const systemContent =
      buildSystemPrompt({
        tier,
        userName: publicUser.firstName,
        location: publicUser.state || publicUser.city ? [publicUser.city, publicUser.state].filter(Boolean).join(', ') : undefined,
        hasRetrievedChunks,
      }) + knowledgeBlock

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY not set')
      return NextResponse.json(
        { error: 'Chat is temporarily unavailable.' },
        { status: 503 }
      )
    }

    const client = new Anthropic({ apiKey })

    const messages: Anthropic.MessageParam[] = [
      ...recentHistory.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user' as const, content: trimmedMessage },
    ]

    const stream = client.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      temperature: 0.3,
      system: systemContent,
      messages,
    })

    const encoder = new TextEncoder()
    let fullText = ''

    const readable = new ReadableStream({
      async start(controller) {
        stream.on('text', (delta: string) => {
          fullText += delta
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text', delta })}\n\n`))
        })

        stream.on('error', (err) => {
          console.error('Chat stream error:', err)
          try {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'error', error: 'Something went wrong.' })}\n\n`)
            )
          } catch {}
          controller.close()
        })

        try {
          await stream.finalText()
        } catch (err) {
          console.error('Stream finalText error:', err)
        }

        const queryContainsRates = /\b(rate|rates|apr|interest)\b/i.test(trimmedMessage)
        const validation = validateResponse(fullText, { queryContainsRates })
        if (!validation.pass) {
          console.warn('Chat response validation failed:', validation.blockReason)
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    })
  } catch (err) {
    console.error('Chat API error:', err)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}

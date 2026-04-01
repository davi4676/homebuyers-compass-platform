'use client'

import { useState, useCallback, useRef } from 'react'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export function useChatSession(authenticated: boolean) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const streamAccumRef = useRef('')
  const assistantIdRef = useRef<string | null>(null)

  const sendMessage = useCallback(
    async (content: string) => {
      if (!authenticated) return

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, userMsg])
      setIsLoading(true)
      setError(null)
      streamAccumRef.current = ''
      assistantIdRef.current = null

      const history = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }))

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ message: content.trim(), history }),
        })

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || `Request failed (${res.status})`)
        }

        const reader = res.body?.getReader()
        const decoder = new TextDecoder()

        if (reader) {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            const chunk = decoder.decode(value, { stream: true })
            const lines = chunk.split('\n')
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') continue
                try {
                  const parsed = JSON.parse(data)
                  if (parsed.type === 'text' && parsed.delta) {
                    streamAccumRef.current += parsed.delta
                    const id = assistantIdRef.current || `assistant-${Date.now()}`
                    assistantIdRef.current = id
                    setMessages((prev) => {
                      const existingIdx = prev.findIndex((m) => m.id === id)
                      if (existingIdx >= 0) {
                        const next = [...prev]
                        next[existingIdx] = {
                          ...next[existingIdx],
                          content: streamAccumRef.current,
                        }
                        return next
                      }
                      return [
                        ...prev,
                        { id, role: 'assistant', content: streamAccumRef.current, timestamp: new Date() },
                      ]
                    })
                  }
                  if (parsed.type === 'error') {
                    throw new Error(parsed.error || 'Stream error')
                  }
                } catch (e) {
                  if (e instanceof SyntaxError) continue
                  throw e
                }
              }
            }
          }
        }

        if (!streamAccumRef.current) {
          setMessages((prev) => {
            if (prev.some((m) => m.role === 'assistant' && m.id === assistantIdRef.current)) return prev
            return [
              ...prev,
              {
                id: `assistant-${Date.now()}`,
                role: 'assistant',
                content: "I'm sorry, I couldn't generate a response. Please try again.",
                timestamp: new Date(),
              },
            ]
          })
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Something went wrong'
        setError(msg)
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: msg,
            timestamp: new Date(),
          },
        ])
      } finally {
        setIsLoading(false)
      }
    },
    [authenticated, messages]
  )

  const reset = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return { messages, isLoading, error, sendMessage, reset }
}

'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CompassUser } from '@/lib/ai/types'
import { buildJourneyContext } from '@/lib/ai/journeyContext'
import { buildSystemPrompt } from '@/lib/ai/systemPrompt'
import { evaluateTriggers } from '@/lib/ai/triggerEngine'

export type CompassMessage = { role: 'user' | 'assistant'; content: string }

export type CompassTriggerData = {
  shouldShow: boolean
  triggerType: string
  suggestedPrompt: string
}

export type UseCompassReturn = {
  messages: CompassMessage[]
  isOpen: boolean
  isTyping: boolean
  triggerData: CompassTriggerData | null
  sendMessage: (userText: string) => Promise<void>
  dismiss: () => void
  open: () => void
  /** Close chat panel only — does not persist trigger dismissal. */
  close: () => void
  /** Two consecutive API failures — show recovery UI in the panel. */
  aiUnavailable: boolean
  /** Clears the “taking a break” state after a successful send or dismiss. */
  clearAiUnavailable: () => void
  /** Retries the last user turn without duplicating the user bubble. */
  retryLastAssistantReply: () => Promise<void>
}

const BREAK_MSG =
  'Compass is taking a break. Try again in a moment.'

/**
 * Wires journey context, system prompt, proactive triggers, and chat API for Compass.
 */
export function useCompass(user: CompassUser | null | undefined): UseCompassReturn {
  const [messages, setMessages] = useState<CompassMessage[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [triggerData, setTriggerData] = useState<CompassTriggerData | null>(null)
  const [aiUnavailable, setAiUnavailable] = useState(false)

  const context = useMemo(() => buildJourneyContext(user), [user])
  const systemPrompt = useMemo(() => buildSystemPrompt(context), [context])

  const mountedRef = useRef(true)
  const proactiveSeededRef = useRef(false)
  const messagesRef = useRef<CompassMessage[]>([])
  const consecutiveFailuresRef = useRef(0)
  const lastSendAtRef = useRef(0)

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (proactiveSeededRef.current) return
    const trigger = evaluateTriggers(context)
    if (!trigger.shouldShow) return

    proactiveSeededRef.current = true
    setTriggerData(trigger)

    const dismissed =
      typeof window !== 'undefined' &&
      localStorage.getItem(`nq_trigger_dismissed_${trigger.triggerType}`)

    if (dismissed) return

    setMessages([{ role: 'assistant', content: trigger.suggestedPrompt }])

    const t = window.setTimeout(() => {
      if (mountedRef.current) setIsOpen(true)
    }, 3000)

    return () => clearTimeout(t)
  }, [context])

  const runAssistantFetch = useCallback(
    async (historyForApi: CompassMessage[]) => {
      const res = await fetch('/api/ai/compass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: systemPrompt,
          messages: historyForApi.map((m) => ({ role: m.role, content: m.content })),
        }),
      })

      const data = (await res.json()) as { reply?: string; error?: string }

      if (!res.ok) {
        consecutiveFailuresRef.current += 1
        const fail2 = consecutiveFailuresRef.current >= 2
        if (fail2) setAiUnavailable(true)
        const errText = fail2
          ? BREAK_MSG
          : typeof data.error === 'string' && data.error.trim() !== ''
            ? data.error
            : "I'm having trouble connecting — please try again in a moment."
        setMessages((prevMsgs) => {
          const next = [...prevMsgs, { role: 'assistant' as const, content: errText }]
          messagesRef.current = next
          return next
        })
        return
      }

      consecutiveFailuresRef.current = 0
      setAiUnavailable(false)

      const reply =
        typeof data.reply === 'string' && data.reply.trim() !== ''
          ? data.reply
          : "I'm having trouble connecting — please try again in a moment."

      setMessages((prevMsgs) => {
        const next = [...prevMsgs, { role: 'assistant' as const, content: reply }]
        messagesRef.current = next
        return next
      })
    },
    [systemPrompt]
  )

  const sendMessage = useCallback(
    async (userText: string) => {
      const trimmed = userText.trim()
      if (!trimmed) return

      const now = Date.now()
      if (now - lastSendAtRef.current < 300) return
      lastSendAtRef.current = now

      const prev = messagesRef.current
      const updated: CompassMessage[] = [...prev, { role: 'user', content: trimmed }]
      messagesRef.current = updated
      setMessages(updated)
      setIsTyping(true)

      try {
        await runAssistantFetch(updated)
      } catch {
        consecutiveFailuresRef.current += 1
        const fail2 = consecutiveFailuresRef.current >= 2
        if (fail2) setAiUnavailable(true)
        setMessages((prevMsgs) => {
          const next = [
            ...prevMsgs,
            {
              role: 'assistant' as const,
              content: fail2
                ? BREAK_MSG
                : "I'm offline right now. Try refreshing or check back shortly.",
            },
          ]
          messagesRef.current = next
          return next
        })
      } finally {
        setIsTyping(false)
      }
    },
    [runAssistantFetch]
  )

  const clearAiUnavailable = useCallback(() => {
    setAiUnavailable(false)
    consecutiveFailuresRef.current = 0
  }, [])

  const retryLastAssistantReply = useCallback(async () => {
    const msgs = messagesRef.current
    let i = msgs.length - 1
    while (i >= 0 && msgs[i].role === 'assistant') i -= 1
    if (i < 0 || msgs[i].role !== 'user') return
    const uptoUser = msgs.slice(0, i + 1)
    messagesRef.current = uptoUser
    setMessages(uptoUser)
    setAiUnavailable(false)
    consecutiveFailuresRef.current = 0
    setIsTyping(true)
    try {
      await runAssistantFetch(uptoUser)
    } catch {
      consecutiveFailuresRef.current += 1
      if (consecutiveFailuresRef.current >= 2) setAiUnavailable(true)
      setMessages((prevMsgs) => {
        const next = [
          ...prevMsgs,
          { role: 'assistant' as const, content: BREAK_MSG },
        ]
        messagesRef.current = next
        return next
      })
    } finally {
      setIsTyping(false)
    }
  }, [runAssistantFetch])

  const dismiss = useCallback(() => {
    if (triggerData?.triggerType) {
      try {
        localStorage.setItem(`nq_trigger_dismissed_${triggerData.triggerType}`, new Date().toISOString())
      } catch {
        /* ignore */
      }
    }
    setIsOpen(false)
  }, [triggerData])

  const open = useCallback(() => {
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
  }, [])

  return {
    messages,
    isOpen,
    isTyping,
    triggerData,
    sendMessage,
    dismiss,
    open,
    close,
    aiUnavailable,
    clearAiUnavailable,
    retryLastAssistantReply,
  }
}

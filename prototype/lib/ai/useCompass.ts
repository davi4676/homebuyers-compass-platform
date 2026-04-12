'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CompassUser } from '@/lib/ai/types'
import { buildJourneyContext } from '@/lib/ai/journeyContext'
import { buildSystemPrompt } from '@/lib/ai/systemPrompt'
import { evaluateTriggers } from '@/lib/ai/triggerEngine'

export type CompassMessage = { role: 'user' | 'assistant'; content: string }

/**
 * Wires journey context, system prompt, proactive triggers, and chat API for Compass.
 */
export function useCompass(user: CompassUser | null | undefined) {
  const [messages, setMessages] = useState<CompassMessage[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [triggerData, setTriggerData] = useState<{
    shouldShow: boolean
    triggerType: string
    suggestedPrompt: string
  } | null>(null)

  const context = useMemo(() => buildJourneyContext(user), [user])
  const systemPrompt = useMemo(() => buildSystemPrompt(context), [context])

  const mountedRef = useRef(true)
  const proactiveSeededRef = useRef(false)
  const messagesRef = useRef<CompassMessage[]>([])

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

  const sendMessage = useCallback(
    async (userText: string) => {
      const trimmed = userText.trim()
      if (!trimmed) return

      const prev = messagesRef.current
      const updated: CompassMessage[] = [...prev, { role: 'user', content: trimmed }]
      messagesRef.current = updated
      setMessages(updated)
      setIsTyping(true)

      try {
        const res = await fetch('/api/ai/compass', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system: systemPrompt,
            messages: updated.map((m) => ({ role: m.role, content: m.content })),
          }),
        })

        const data = (await res.json()) as { reply?: string; error?: string }

        if (!res.ok) {
          const errText =
            typeof data.error === 'string' && data.error.trim() !== ''
              ? data.error
              : "I'm having trouble connecting — please try again in a moment."
          setMessages((prevMsgs) => {
            const next = [...prevMsgs, { role: 'assistant' as const, content: errText }]
            messagesRef.current = next
            return next
          })
          return
        }

        const reply =
          typeof data.reply === 'string' && data.reply.trim() !== ''
            ? data.reply
            : "I'm having trouble connecting — please try again in a moment."

        setMessages((prevMsgs) => {
          const next = [...prevMsgs, { role: 'assistant' as const, content: reply }]
          messagesRef.current = next
          return next
        })
      } catch {
        setMessages((prevMsgs) => {
          const next = [
            ...prevMsgs,
            {
              role: 'assistant' as const,
              content: "I'm offline right now. Try refreshing or check back shortly.",
            },
          ]
          messagesRef.current = next
          return next
        })
      } finally {
        setIsTyping(false)
      }
    },
    [systemPrompt]
  )

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

  return { messages, isOpen, isTyping, triggerData, sendMessage, dismiss, open }
}

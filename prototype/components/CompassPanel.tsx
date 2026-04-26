'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  CaretDown,
  Compass,
  Lightbulb,
  PaperPlaneRight,
  X,
} from '@phosphor-icons/react'
import type { UseCompassReturn } from '@/lib/ai/useCompass'
import { getCompassPhaseSuggestion } from '@/lib/ai/compass-phase-suggestion'

const QUICK_REPLIES: Record<string, string[]> = {
  stuck: ['Break it into steps', 'What info do I need?', 'Skip for now'],
  market_update: ['Show me the math', 'Should I lock a rate?', 'Not now'],
  welcome_back: ['Pick up where I left off', 'What changed?', 'Show my progress'],
  savings_milestone: ["What's next?", 'Am I on track?', 'Show my timeline'],
  onboarding: ['Yes, show me around', "I'll explore myself", 'What can you do?'],
}

export type CompassPanelProps = {
  compass: UseCompassReturn
  currentPhase: string
  /** Raw `?tab=` query (e.g. `budget`) for suggestion copy aligned with spec examples. */
  rawJourneyTab?: string | null
}

export function CompassPanel({ compass, currentPhase, rawJourneyTab }: CompassPanelProps) {
  const {
    messages,
    isOpen,
    isTyping,
    triggerData,
    sendMessage,
    close,
    aiUnavailable,
    retryLastAssistantReply,
    clearAiUnavailable,
  } = compass
  const [input, setInput] = useState('')
  const [narrow, setNarrow] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const fn = () => setNarrow(mq.matches)
    fn()
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const id = window.requestAnimationFrame(() => inputRef.current?.focus())
    return () => cancelAnimationFrame(id)
  }, [isOpen])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages, isTyping])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, close])

  useEffect(() => {
    if (!isOpen) return
    const root = panelRef.current
    if (!root) return
    const getFocusable = () =>
      Array.from(
        root.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.closest('[aria-hidden="true"]'))
    const els = getFocusable()
    const first = els[0]
    const last = els[els.length - 1]
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      if (!root.contains(document.activeElement)) return
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        }
      } else if (document.activeElement === last) {
        e.preventDefault()
        first?.focus()
      }
    }
    root.addEventListener('keydown', onKey)
    return () => root.removeEventListener('keydown', onKey)
  }, [isOpen, messages.length])

  const topSuggestion = useMemo(
    () => getCompassPhaseSuggestion(currentPhase, { rawJourneyTab }),
    [currentPhase, rawJourneyTab]
  )

  const chips = useMemo(() => {
    const t = triggerData?.triggerType
    if (!t || t === 'none') return []
    return QUICK_REPLIES[t] ?? []
  }, [triggerData?.triggerType])

  const showChips =
    messages.length === 1 &&
    messages[0]?.role === 'assistant' &&
    Boolean(triggerData?.triggerType && triggerData.triggerType !== 'none')

  const onSend = useCallback(async () => {
    const t = input.trim()
    if (!t || isTyping) return
    setInput('')
    await sendMessage(t)
  }, [input, isTyping, sendMessage])

  const onChip = useCallback(
    async (text: string) => {
      if (isTyping) return
      await sendMessage(text)
    },
    [isTyping, sendMessage]
  )

  const fillSuggestion = useCallback(() => {
    setInput(topSuggestion)
    inputRef.current?.focus()
  }, [topSuggestion])

  const panelInitial = narrow ? { y: '100%' } : { x: '100%' }
  const panelAnimate = { x: 0, y: 0 }

  return (
    <motion.div
      className="nq-compass-root fixed inset-0 z-[1001]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div
        role="presentation"
        className="absolute inset-0 bg-black/20 backdrop-blur-[4px]"
        onClick={close}
      />
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Compass chat"
        initial={panelInitial}
        animate={panelAnimate}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className={`absolute z-[1] flex max-h-[100dvh] min-h-0 flex-col bg-[var(--white)] shadow-[var(--shadow-lg)] ${
          narrow
            ? 'bottom-0 left-0 right-0 h-[70vh] max-h-[90vh] rounded-t-2xl'
            : 'bottom-0 right-0 top-0 h-full w-[380px] max-w-[min(100vw,380px)] border-l border-black/[0.06]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
            <header className="flex h-16 shrink-0 items-center justify-between border-b border-black/[0.06] bg-[var(--surface-2)] px-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)] text-white"
                    aria-hidden
                  >
                    <Compass weight="duotone" size={22} />
                  </div>
                  <span
                    className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[var(--surface-2)] bg-[var(--success)]"
                    title="Online"
                    aria-hidden
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--text)]">Compass</p>
                  <p className="truncate text-[11px] text-[var(--muted)]">AI Homebuying Guide</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={close}
                  className="rounded-lg p-2 text-[var(--muted)] hover:bg-black/[0.05] hover:text-[var(--text)]"
                  aria-label="Minimize"
                >
                  <CaretDown weight="bold" size={20} />
                </button>
                <button
                  type="button"
                  onClick={close}
                  className="rounded-lg p-2 text-[var(--muted)] hover:bg-black/[0.05] hover:text-[var(--text)]"
                  aria-label="Close"
                >
                  <X weight="bold" size={20} />
                </button>
              </div>
            </header>

            {aiUnavailable ? (
              <div
                role="status"
                className="flex flex-wrap items-center gap-2 border-b border-amber-200/80 bg-amber-50 px-4 py-2 text-sm text-amber-950"
              >
                <span className="min-w-0 flex-1">
                  Compass is taking a break. Try again in a moment.
                </span>
                <button
                  type="button"
                  onClick={() => {
                    clearAiUnavailable()
                    void retryLastAssistantReply()
                  }}
                  className="shrink-0 rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-semibold text-white"
                >
                  Retry
                </button>
              </div>
            ) : null}

            <div
              ref={scrollRef}
              className="min-h-0 flex-1 space-y-3 overflow-y-auto overflow-x-hidden px-4 py-4"
            >
              {messages.map((m, i) =>
                m.role === 'assistant' ? (
                  <div key={`${i}-${m.role}`} className="flex gap-2">
                    <div
                      className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-white"
                      aria-hidden
                    >
                      <Compass weight="duotone" size={12} />
                    </div>
                    <div className="max-w-[85%] whitespace-pre-wrap rounded-[18px] rounded-bl-[4px] bg-[var(--surface-2)] px-3.5 py-2.5 text-sm leading-relaxed text-[var(--text)]">
                      {m.content}
                    </div>
                  </div>
                ) : (
                  <div key={`${i}-${m.role}`} className="flex w-full justify-end">
                    <div className="max-w-[80%] rounded-[18px] rounded-br-[4px] bg-[var(--primary)] px-3.5 py-2.5 text-sm leading-relaxed text-white">
                      {m.content}
                    </div>
                  </div>
                )
              )}

              {showChips && chips.length > 0 ? (
                <div className="ml-8 flex flex-wrap gap-2 pt-1">
                  {chips.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => onChip(c)}
                      disabled={isTyping}
                      className="rounded-full border-[1.5px] border-[var(--primary)] px-3 py-1.5 text-xs font-semibold text-[var(--primary)] transition hover:bg-[var(--primary)] hover:text-white disabled:opacity-50"
                      style={{ fontFamily: 'var(--font-dm-sans), DM Sans, system-ui, sans-serif' }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              ) : null}

              {isTyping ? (
                <div className="flex gap-2">
                  <div
                    className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-white"
                    aria-hidden
                  >
                    <Compass weight="duotone" size={12} />
                  </div>
                  <div className="flex items-center gap-1 rounded-[18px] rounded-bl-[4px] bg-[var(--surface-2)] px-4 py-3">
                    <span className="nq-compass-typing-dot" />
                    <span className="nq-compass-typing-dot" />
                    <span className="nq-compass-typing-dot" />
                  </div>
                </div>
              ) : null}
            </div>

            <div className="shrink-0 border-t border-black/[0.06] px-4 pb-3 pt-2">
              <button
                type="button"
                onClick={fillSuggestion}
                className="mb-2 flex w-full items-start gap-2 text-left text-xs italic text-[var(--muted)] hover:text-[var(--text-soft)]"
              >
                <Lightbulb weight="duotone" size={16} className="mt-0.5 shrink-0 text-[var(--accent)]" />
                <span>
                  Suggested: <span className="font-medium not-italic text-[var(--text-soft)]">{topSuggestion}</span>
                </span>
              </button>
              <div className="flex h-[72px] items-center gap-2 py-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      void onSend()
                    }
                  }}
                  placeholder="Ask me anything about your home journey..."
                  disabled={isTyping}
                  className="min-w-0 flex-1 rounded-full border-[1.5px] border-[var(--muted)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:outline-none focus:ring-[3px] focus:ring-[rgba(45,106,79,0.15)]"
                />
                <button
                  type="button"
                  onClick={() => void onSend()}
                  disabled={!input.trim() || isTyping}
                  aria-label="Send message"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-white transition hover:opacity-95 disabled:opacity-50"
                >
                  <PaperPlaneRight weight="fill" size={20} />
                </button>
              </div>
            </div>
      </motion.div>
    </motion.div>
  )
}

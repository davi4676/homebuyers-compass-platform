'use client'

import { useRef, useEffect, useLayoutEffect, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Bot } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { useChatSession } from './useChatSession'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'

const OPENING_GREETING = {
  id: 'welcome',
  role: 'assistant' as const,
  content:
    "Hi! I'm NQ, your home buying guide. Have a question about this phase or anything else? Ask away!",
  timestamp: new Date(),
}

interface ChatPopoverProps {
  isOpen: boolean
  onClose: () => void
  triggerRef?: React.RefObject<HTMLElement | null>
  /** Other buttons that open this popover — clicks on them do not count as “outside” */
  extraTriggerRefs?: React.RefObject<HTMLElement | null>[]
  className?: string
}

export function ChatPopover({ isOpen, onClose, triggerRef, extraTriggerRefs, className = '' }: ChatPopoverProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { messages, isLoading, error, sendMessage } = useChatSession(isAuthenticated ?? false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [fixedStyle, setFixedStyle] = useState<CSSProperties>({})

  useEffect(() => setMounted(true), [])

  // Anchor to trigger with fixed positioning so ancestors with overflow:hidden cannot clip the panel
  useLayoutEffect(() => {
    if (!isOpen) {
      setFixedStyle({})
      return
    }
    if (!triggerRef?.current) {
      setFixedStyle({
        position: 'fixed',
        zIndex: 99999,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'min(380px, calc(100vw - 2rem))',
        maxWidth: 'calc(100vw - 2rem)',
      })
      return
    }
    const update = () => {
      const vw = typeof window !== 'undefined' ? window.innerWidth : 1024
      const isNarrow = vw < 640
      if (isNarrow) {
        setFixedStyle({
          position: 'fixed',
          zIndex: 99999,
          left: '1rem',
          right: '1rem',
          top: '50%',
          transform: 'translateY(-50%)',
          width: 'auto',
          maxWidth: 'calc(100vw - 2rem)',
        })
        return
      }
      const rect = triggerRef.current!.getBoundingClientRect()
      const panelW = Math.min(380, vw - 32)
      let left = rect.right + 12
      if (left + panelW > vw - 16) {
        left = Math.max(16, rect.left - panelW - 12)
      }
      setFixedStyle({
        position: 'fixed',
        zIndex: 99999,
        top: rect.top,
        left,
        width: panelW,
        maxWidth: 'calc(100vw - 2rem)',
      })
    }
    update()
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [isOpen, triggerRef])

  const displayMessages = [
    ...(messages.length === 0 ? [OPENING_GREETING] : []),
    ...messages,
  ]

  // Scroll messages area only (avoid moving the whole page)
  useEffect(() => {
    const el = scrollContainerRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [displayMessages, isLoading])

  // Close on click outside (excluding trigger buttons)
  useEffect(() => {
    if (!isOpen) return
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node
      if (panelRef.current?.contains(target)) return
      if (triggerRef?.current?.contains(target)) return
      for (const r of extraTriggerRefs ?? []) {
        if (r?.current?.contains(target)) return
      }
      onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen, onClose, triggerRef, extraTriggerRefs])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  const panel = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          style={fixedStyle}
          initial={{ opacity: 0, x: -8, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -8, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className={`h-[min(420px,70vh)] w-[min(380px,calc(100vw-2rem))] max-sm:!w-auto max-sm:!max-w-[calc(100vw-2rem)] bg-white border-2 border-teal-200/80 rounded-2xl shadow-xl flex flex-col overflow-hidden overscroll-contain ${className}`}
        >
          <div className="bg-gradient-to-r from-millennial-cta-primary to-millennial-cta-secondary px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-white text-base">Ask NQ</h2>
                <p className="text-sm text-white/90">Questions about this phase</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/90 hover:bg-white/20 transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto overflow-x-hidden bg-teal-50/50 p-4 space-y-4 min-h-0 overscroll-contain"
          >
            {!isAuthenticated && !authLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4 -mt-6">
                <Bot className="w-10 h-10 text-teal-600 mb-3" />
                <h3 className="font-semibold text-slate-800 mb-2 text-base">Log in to chat with NQ</h3>
                <p className="text-sm text-slate-600 mb-4 max-w-[220px]">
                  Get personalized answers about pre-approval, mortgages, offers, and more.
                </p>
                <Link
                  href="/auth"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[rgb(var(--coral))] text-white font-semibold text-base hover:bg-[rgb(var(--coral-hover))] transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/inbox"
                  onClick={onClose}
                  className="mt-2 text-sm text-teal-600 font-medium hover:underline"
                >
                  Or open full Inbox
                </Link>
              </div>
            ) : authLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-7 h-7 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {displayMessages.map((msg) => (
                  <div key={msg.id}>
                    <ChatMessage message={msg} />
                  </div>
                ))}
                {error && (
                  <div className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-base text-amber-800">
                    {error}{' '}
                    <Link href="/inbox" className="font-medium underline hover:no-underline">
                      Open Inbox instead
                    </Link>
                  </div>
                )}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-xl px-3 py-2">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {isAuthenticated && !authLoading && (
            <ChatInput
              onSend={sendMessage}
              disabled={isLoading}
              placeholder="Ask about this step..."
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )

  if (!mounted || typeof document === 'undefined') return null
  return createPortal(panel, document.body)
}

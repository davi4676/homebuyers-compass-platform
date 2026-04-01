'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Bot, ThumbsUp, ThumbsDown } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { useChatSession } from './useChatSession'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'

const OPENING_GREETING: { role: 'assistant'; content: string } = {
  role: 'assistant',
  content:
    "Hi! I'm NQ, your homebuying guide for NestQuest. Are you just starting to explore, or is there a specific question I can help with today?",
}

export function HomebuyerChatbotWidget() {
  const [mounted, setMounted] = useState(false)
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { messages, isLoading, sendMessage } = useChatSession(isAuthenticated ?? false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const displayMessages = [
    ...(messages.length === 0 ? [{ id: 'welcome', role: 'assistant' as const, content: OPENING_GREETING.content, timestamp: new Date() }] : []),
    ...messages,
  ]

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [displayMessages, isLoading])

  return (
    <>
      {mounted && (
      <>
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-[#06b6d4] to-[#0891b2] rounded-full shadow-lg flex items-center justify-center text-white z-[45] hover:shadow-xl transition-shadow"
        aria-label={isOpen ? 'Close chat' : 'Open NQ homebuying guide'}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 w-full max-w-md h-[580px] bg-white border-2 border-[#06b6d4]/40 rounded-2xl shadow-xl flex flex-col z-[45] overflow-hidden"
          >
            <div className="bg-gradient-to-r from-[#06b6d4] to-[#0891b2] px-4 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-white text-base">NQ</h2>
                  <p className="text-xs text-white/90">Homebuying guide · NestQuest</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-white/90 hover:bg-white/20 transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-[rgb(var(--sky-light))] p-4 space-y-4 min-h-0">
              {!isAuthenticated && !authLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-6 -mt-8">
                  <Bot className="w-12 h-12 text-[#06b6d4] mb-4" />
                  <h3 className="font-semibold text-slate-800 mb-2">Log in to chat with NQ</h3>
                  <p className="text-sm text-slate-600 mb-4 max-w-[240px]">
                    NQ is your homebuying guide. Sign in to get personalized answers about pre-approval, mortgages, offers, and more.
                  </p>
                  <Link
                    href="/auth"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[rgb(var(--coral))] text-white font-semibold hover:bg-[rgb(var(--coral-hover))] transition-colors"
                  >
                    Log in
                  </Link>
                </div>
              ) : authLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-8 h-8 border-2 border-[#06b6d4] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  {displayMessages.map((msg) => (
                    <div key={msg.id}>
                      <ChatMessage message={msg} />
                      {msg.role === 'assistant' && msg.id !== 'welcome' && (
                        <div className="flex gap-2 mt-2 ml-1">
                          <button
                            type="button"
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
                            aria-label="Helpful"
                            onClick={() => {
                              // Positive feedback — could log to analytics
                            }}
                          >
                            <ThumbsUp size={16} />
                          </button>
                          <button
                            type="button"
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
                            aria-label="Not helpful"
                            onClick={() => {
                              // Negative feedback — log for prompt review (no PII)
                              if (typeof window !== 'undefined') {
                                console.info('[NQ feedback] Negative — messageId:', msg.id)
                              }
                            }}
                          >
                            <ThumbsDown size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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
                placeholder="Ask about pre-approval, closing costs, offers..."
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
      </>
      )}
    </>
  )
}

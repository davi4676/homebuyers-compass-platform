'use client'

import { Bot, User } from 'lucide-react'
import type { ChatMessage as ChatMessageType } from './useChatSession'

interface ChatMessageProps {
  message: ChatMessageType
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
      data-message-id={message.id}
    >
      <div
        className={`flex items-start gap-2 max-w-[85%] rounded-xl px-4 py-3 ${
          isUser
            ? 'bg-[rgb(var(--navy))] text-white'
            : 'bg-slate-100 text-slate-800 border border-slate-200'
        }`}
      >
        {!isUser && (
          <Bot className="w-5 h-5 shrink-0 mt-0.5 text-[#06b6d4]" aria-hidden />
        )}
        <div className="min-w-0">
          <p className="text-[17px] leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
          <p
            className={`text-sm mt-1 ${
              isUser ? 'text-white/70' : 'text-slate-500'
            }`}
            suppressHydrationWarning
          >
            {message.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        {isUser && (
          <User className="w-5 h-5 shrink-0 mt-0.5 text-white/80" aria-hidden />
        )}
      </div>
    </div>
  )
}

'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, Send, X } from 'lucide-react'

interface EmbeddableChatWidgetProps {
  chatbotId: string
  chatbotName: string
  onClose?: () => void
  /** If false, render as floating button + panel; if true, render inline (e.g. in SaaS preview) */
  inline?: boolean
  /** When true, panel is open by default (e.g. preview overlay) */
  defaultOpen?: boolean
}

export default function EmbeddableChatWidget({
  chatbotId,
  chatbotName,
  onClose,
  inline = false,
  defaultOpen = false,
}: EmbeddableChatWidgetProps) {
  const [open, setOpen] = useState(inline || defaultOpen)
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([])
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = () => {
    const text = input.trim()
    if (!text) return
    setMessages((m) => [...m, { role: 'user', content: text }])
    setInput('')
    // Placeholder reply; in production call API with chatbotId and stream response
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: `Thanks for your message. (Chatbot: ${chatbotName} – connect to your API for real replies.)` },
      ])
    }, 500)
  }

  const panel = (
    <div className="flex flex-col h-full min-h-[320px] max-h-[80vh] bg-white rounded-xl border border-stone-200 shadow-lg overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-stone-200 bg-stone-50">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-teal-600" />
          <span className="font-semibold text-stone-900">{chatbotName}</span>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-200"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 && (
          <p className="text-sm text-stone-500 text-center py-4">Send a message to start the conversation.</p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                msg.role === 'user'
                  ? 'bg-teal-600 text-white'
                  : 'bg-stone-100 text-stone-800'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form
        className="p-3 border-t border-stone-200 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          send()
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-stone-900 placeholder-stone-500 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        />
        <button
          type="submit"
          className="p-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  )

  if (inline) {
    return <div className="w-full max-w-md">{panel}</div>
  }

  const showFloatingButton = !defaultOpen && !open
  return (
    <>
      {showFloatingButton && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-teal-600 text-white shadow-lg hover:bg-teal-700 flex items-center justify-center"
          aria-label="Open chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}
      {open && (
        <div className="fixed bottom-6 right-6 w-full max-w-md z-50">
          {panel}
          {!onClose && (
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute top-2 right-2 p-1.5 rounded-lg text-stone-500 hover:bg-stone-200"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      )}
    </>
  )
}

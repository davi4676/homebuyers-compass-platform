'use client'

import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'Ask about homebuying...',
}: ChatInputProps) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus({ preventScroll: true })
    }
  }, [disabled])

  const handleSubmit = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex gap-2 items-end border-t border-slate-200 bg-white p-3">
      <textarea
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className="flex-1 min-h-[48px] max-h-32 px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/50 focus:border-[#06b6d4] disabled:opacity-50 disabled:cursor-not-allowed resize-none text-[17px]"
        aria-label="Message"
      />
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!value.trim() || disabled}
        className="shrink-0 w-11 h-11 rounded-xl bg-[rgb(var(--coral))] text-white flex items-center justify-center hover:bg-[rgb(var(--coral-hover))] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Send"
      >
        <Send className="w-5 h-5" />
      </button>
    </div>
  )
}

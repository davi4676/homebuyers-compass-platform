'use client'

import { PLAIN_ENGLISH_LS_KEY } from '@/lib/hooks/usePlainEnglish'
import { usePlainEnglish } from '@/lib/hooks/usePlainEnglish'

type PlainEnglishToggleBarProps = {
  className?: string
}

/** Compact Plain English toggle for /resources and /learn. */
export default function PlainEnglishToggleBar({ className = '' }: PlainEnglishToggleBarProps) {
  const on = usePlainEnglish()

  const toggle = () => {
    try {
      localStorage.setItem(PLAIN_ENGLISH_LS_KEY, on ? '0' : '1')
      window.dispatchEvent(new Event('nq-plain-english-changed'))
    } catch {
      /* ignore */
    }
  }

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--nq-ed-line-soft,#e7e5e4)] bg-white/80 px-4 py-3 ${className}`}
    >
      <p className="text-sm text-[var(--nq-ed-muted)]">
        <span className="font-semibold text-[var(--nq-ed-text)]">Plain English mode</span> — swaps jargon for everyday words
      </p>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={toggle}
        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition ${
          on ? 'bg-teal-600' : 'bg-slate-300'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
            on ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
        <span className="sr-only">{on ? 'Plain English on' : 'Plain English off'}</span>
      </button>
    </div>
  )
}

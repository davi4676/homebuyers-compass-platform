'use client'

import { useEffect, useState } from 'react'
import { X, Sparkles } from 'lucide-react'
import { clearSessionWins, getSessionWins } from '@/lib/session-wins'

const DISMISS_KEY = 'nq_session_wins_banner_dismissed'

export default function SessionWinsBanner() {
  const [wins, setWins] = useState<string[]>([])
  const [dismissed, setDismissed] = useState(false)

  const refresh = () => {
    setWins(getSessionWins())
  }

  useEffect(() => {
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === '1') setDismissed(true)
    } catch {
      /* ignore */
    }
    refresh()
    window.addEventListener('nq-session-win', refresh)
    return () => window.removeEventListener('nq-session-win', refresh)
  }, [])

  if (dismissed || wins.length === 0) return null

  return (
    <div
      className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200/90 bg-amber-50/95 px-4 py-3 shadow-sm"
      role="status"
    >
      <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-amber-950">Nice — progress this visit</p>
        <ul className="mt-1 list-inside list-disc text-sm text-amber-900/90">
          {wins.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <button
          type="button"
          onClick={() => {
            try {
              sessionStorage.setItem(DISMISS_KEY, '1')
            } catch {
              /* ignore */
            }
            setDismissed(true)
          }}
          className="rounded-lg p-1 text-amber-800/70 hover:bg-amber-100 hover:text-amber-950"
          aria-label="Dismiss"
        >
          <X className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => {
            clearSessionWins()
            try {
              sessionStorage.removeItem(DISMISS_KEY)
            } catch {
              /* ignore */
            }
            setWins([])
          }}
          className="text-xs font-semibold text-amber-800 underline decoration-amber-600/50"
        >
          Clear list
        </button>
      </div>
    </div>
  )
}

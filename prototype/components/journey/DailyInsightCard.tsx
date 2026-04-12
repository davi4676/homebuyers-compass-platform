'use client'

import { useCallback, useMemo, useState, useEffect } from 'react'
import { X } from 'lucide-react'
import {
  BadgePercent,
  Building2,
  Calculator,
  CircleDollarSign,
  FileText,
  Home,
  Landmark,
  Percent,
  PiggyBank,
  Scale,
  ScrollText,
  ShieldCheck,
  Timer,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { DAILY_INSIGHTS, getDailyInsightIndex, type DailyInsightIconId } from '@/lib/nq-daily-insights'

const ICON_MAP: Record<DailyInsightIconId, LucideIcon> = {
  TrendingUp,
  Percent,
  PiggyBank,
  Landmark,
  Scale,
  ShieldCheck,
  Timer,
  Calculator,
  Home,
  FileText,
  Wallet,
  BadgePercent,
  CircleDollarSign,
  Building2,
  ScrollText,
}

const DISMISS_KEY = 'nq_insight_dismissed'

function todayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

export default function DailyInsightCard() {
  const [hidden, setHidden] = useState(true)

  const insight = useMemo(() => {
    const i = getDailyInsightIndex()
    return DAILY_INSIGHTS[i] ?? DAILY_INSIGHTS[0]
  }, [])

  const Icon = ICON_MAP[insight.icon] ?? TrendingUp

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const dismissed = localStorage.getItem(DISMISS_KEY)
      setHidden(dismissed === todayKey())
    } catch {
      setHidden(false)
    }
  }, [])

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(DISMISS_KEY, todayKey())
    } catch {
      /* ignore */
    }
    setHidden(true)
  }, [])

  if (hidden) return null

  return (
    <section
      className="relative rounded-[var(--radius)] border-l-[3px] pl-4 pr-10 py-4 shadow-sm"
      style={{
        backgroundColor: '#FFFBEB',
        borderLeftColor: 'var(--accent)',
      }}
      aria-labelledby="daily-insight-stat"
    >
      <button
        type="button"
        onClick={dismiss}
        className="absolute right-2 top-2 rounded-lg p-1.5 text-slate-500 transition hover:bg-black/5 hover:text-slate-800"
        aria-label="Dismiss insight"
      >
        <X className="h-4 w-4" strokeWidth={2} />
      </button>
      <div className="flex gap-3">
        <span className="mt-0.5 shrink-0" style={{ color: 'var(--accent)' }} aria-hidden>
          <Icon className="h-6 w-6" strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <p
            id="daily-insight-stat"
            className="text-[18px] leading-snug text-[color:var(--text)]"
            style={{ fontFamily: 'var(--font-dm-serif), "DM Serif Display", ui-serif, Georgia, serif' }}
          >
            {insight.stat}
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-[color:var(--muted)]">{insight.explanation}</p>
        </div>
      </div>
    </section>
  )
}

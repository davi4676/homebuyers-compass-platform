'use client'

import { useCallback, useMemo, useState, useEffect } from 'react'
import {
  X,
  TrendUp,
  Percent,
  PiggyBank,
  Bank,
  Scales,
  ShieldCheck,
  Timer,
  Calculator,
  House,
  FileText,
  Wallet,
  SealPercent,
  CurrencyCircleDollar,
  Buildings,
  Scroll,
} from '@phosphor-icons/react'
import { DAILY_INSIGHTS, getDailyInsightIndex, type DailyInsightIconId } from '@/lib/nq-daily-insights'

const ICON_MAP: Record<DailyInsightIconId, typeof TrendUp> = {
  TrendingUp: TrendUp,
  Percent,
  PiggyBank,
  Landmark: Bank,
  Scale: Scales,
  ShieldCheck,
  Timer,
  Calculator,
  Home: House,
  FileText,
  Wallet,
  BadgePercent: SealPercent,
  CircleDollarSign: CurrencyCircleDollar,
  Building2: Buildings,
  ScrollText: Scroll,
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

  const Icon = ICON_MAP[insight.icon] ?? TrendUp

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
        <X weight="duotone" size={20} className="text-[var(--muted)]" aria-hidden />
      </button>
      <div className="flex gap-3">
        <span className="mt-0.5 shrink-0" style={{ color: 'var(--accent)' }} aria-hidden>
          <Icon weight="duotone" size={24} />
        </span>
        <div className="min-w-0">
          <p
            id="daily-insight-stat"
            className="text-[18px] leading-snug text-[color:var(--text)]"
          >
            {insight.stat}
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-[color:var(--muted)]">{insight.explanation}</p>
        </div>
      </div>
    </section>
  )
}

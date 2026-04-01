'use client'

import type { ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
import type { MoneyCategory } from '@/lib/money-engine'
import { formatCurrency } from '@/lib/calculations'

type OpportunityCardProps = {
  category: MoneyCategory
  title: string
  description: string
  estimatedValue?: number
  ctaLabel?: string
  onCta?: () => void
  footer?: ReactNode
  className?: string
}

const CAT_THEME: Record<MoneyCategory, { wrap: string; chip: string; copy: string }> = {
  savings: {
    wrap: 'border-emerald-200/80 bg-emerald-50/50',
    chip: 'bg-emerald-100 text-emerald-900',
    copy: 'Most buyers miss this — but you will not.',
  },
  funds: {
    wrap: 'border-sky-200/80 bg-sky-50/50',
    chip: 'bg-sky-100 text-sky-900',
    copy: 'You just unlocked a new funding source.',
  },
  alternative: {
    wrap: 'border-violet-200/80 bg-violet-50/50',
    chip: 'bg-violet-100 text-violet-900',
    copy: 'Nice — creative structures can expand buying power quickly.',
  },
}

const CAT_LABEL: Record<MoneyCategory, string> = {
  savings: 'Savings',
  funds: 'Funds',
  alternative: 'Alternative solution',
}

export default function OpportunityCard({
  category,
  title,
  description,
  estimatedValue,
  ctaLabel = 'Apply this',
  onCta,
  footer,
  className = '',
}: OpportunityCardProps) {
  const t = CAT_THEME[category]
  return (
    <section className={`rounded-2xl border p-4 shadow-sm ${t.wrap} ${className}`}>
      <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${t.chip}`}>
        {CAT_LABEL[category]}
      </span>
      <p className="mt-2 text-sm font-bold text-slate-900">{title}</p>
      <p className="mt-1 text-sm text-slate-700">{description}</p>
      {estimatedValue != null ? (
        <p className="mt-2 text-sm font-semibold text-slate-900">
          {category === 'alternative'
            ? `Alternative value: ~${formatCurrency(estimatedValue)}`
            : `Potential value: ~${formatCurrency(estimatedValue)}`}
        </p>
      ) : null}
      <p className="mt-2 text-xs italic text-slate-600">{t.copy}</p>
      <button
        type="button"
        onClick={onCta}
        className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-slate-800 underline decoration-slate-300 underline-offset-2 hover:text-sky-900 hover:decoration-sky-400"
      >
        {ctaLabel}
        <ArrowRight className="h-4 w-4" aria-hidden />
      </button>
      {footer ? <div className="mt-2">{footer}</div> : null}
    </section>
  )
}


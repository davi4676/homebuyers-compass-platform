'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { MoneyCategory } from '@/lib/money-engine'
import { formatCurrency } from '@/lib/calculations'

const CAT_LABEL: Record<MoneyCategory, string> = {
  savings: 'Savings',
  funds: 'Funds',
  alternative: 'Alternative',
}

type MoneyCardProps = {
  title: string
  description: string
  category: MoneyCategory
  estimatedValue: number
  ctaLabel: string
  href?: string
  onCta?: () => void
  className?: string
}

export default function MoneyCard({
  title,
  description,
  category,
  estimatedValue,
  ctaLabel,
  href,
  onCta,
  className = '',
}: MoneyCardProps) {
  const valueLabel =
    category === 'alternative'
      ? `~${formatCurrency(estimatedValue)} impact`
      : `~${formatCurrency(estimatedValue)} est.`

  const inner = (
    <>
      <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-700">
        {CAT_LABEL[category]}
      </span>
      <p className="mt-2 text-base font-bold text-slate-900">{title}</p>
      <p className="mt-1 text-sm leading-relaxed text-slate-600">{description}</p>
      <p className="mt-2 text-sm font-semibold tabular-nums text-emerald-800">{valueLabel}</p>
      <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-sky-700">
        {ctaLabel}
        <ArrowRight className="h-4 w-4" aria-hidden />
      </span>
    </>
  )

  if (href) {
    return (
      <Link
        href={href}
        className={`group block rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm ring-1 ring-slate-100/80 transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md ${className}`}
      >
        {inner}
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={onCta}
      className={`w-full rounded-2xl border border-slate-200/90 bg-white p-4 text-left shadow-sm ring-1 ring-slate-100/80 transition hover:border-sky-200 hover:shadow-md ${className}`}
    >
      {inner}
    </button>
  )
}

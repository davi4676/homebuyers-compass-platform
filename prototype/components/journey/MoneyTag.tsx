'use client'

import type { MoneyCategory } from '@/lib/money-engine'
import { formatCurrency } from '@/lib/calculations'

type MoneyTagProps = {
  variant: MoneyCategory | 'saves_label' | 'finds_label' | 'alt_label'
  /** For saves/funds dollar chips */
  amount?: number
  className?: string
}

export default function MoneyTag({ variant, amount, className = '' }: MoneyTagProps) {
  if (variant === 'savings' || variant === 'saves_label') {
    const label =
      amount != null && amount > 0 ? `Saves ${formatCurrency(amount)}` : 'Saves money'
    return (
      <span
        className={`inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-900 ${className}`}
      >
        {label}
      </span>
    )
  }
  if (variant === 'funds' || variant === 'finds_label') {
    const label =
      amount != null && amount > 0 ? `Finds ${formatCurrency(amount)}` : 'Finds funds'
    return (
      <span
        className={`inline-flex items-center rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-teal-900 ${className}`}
      >
        {label}
      </span>
    )
  }
  return (
    <span
      className={`inline-flex items-center rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-900 ${className}`}
    >
      Alternative solution
    </span>
  )
}

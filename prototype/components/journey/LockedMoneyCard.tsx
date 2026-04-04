'use client'

import Link from 'next/link'
import { Lock } from 'lucide-react'
import type { MoneyCategory } from '@/lib/money-engine'
import type { UserTier as Tier } from '@/lib/tiers'
import { TIER_DEFINITIONS } from '@/lib/tiers'
import { formatCurrency } from '@/lib/calculations'
import { buildMoneyUpsellLine } from '@/lib/money-engine'

const CAT_LABEL: Record<MoneyCategory, string> = {
  savings: 'Savings',
  funds: 'Funds',
  alternative: 'Alternative',
}

type LockedMoneyCardProps = {
  title: string
  description: string
  category: MoneyCategory
  lockedValue: number
  requiredTier: Tier
  nextTier: Tier
  fundsHighlightForCopy?: number
  upgradeHref?: string
  className?: string
}

export default function LockedMoneyCard({
  title,
  description,
  category,
  lockedValue,
  requiredTier,
  nextTier,
  fundsHighlightForCopy,
  upgradeHref,
  className = '',
}: LockedMoneyCardProps) {
  const def = TIER_DEFINITIONS[nextTier]
  const href = upgradeHref ?? `/upgrade?source=money-lock&tier=${nextTier}&cat=${category}`
  const upsell = buildMoneyUpsellLine(
    nextTier,
    category,
    fundsHighlightForCopy ?? lockedValue
  )

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-br from-slate-50 to-slate-100/80 p-5 shadow-inner ring-1 ring-slate-200/50 ${className}`}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-200/90 text-slate-600">
          <Lock className="h-5 w-5" strokeWidth={2} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <span className="inline-block rounded-full bg-slate-200/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-700">
            {CAT_LABEL[category]} · {TIER_DEFINITIONS[requiredTier].name}+
          </span>
          <p className="mt-2 text-sm font-bold text-slate-900">{title}</p>
          <p className="mt-1 text-sm text-slate-600">{description}</p>
          <p className="mt-2 text-xs font-semibold text-slate-500">
            Estimated value locked:{' '}
            <span className="tabular-nums text-slate-800">{formatCurrency(lockedValue)}</span>
          </p>
          <p className="mt-2 text-xs italic leading-snug text-slate-600">&ldquo;{def.mindset}&rdquo;</p>
          <p className="mt-2 text-xs font-medium text-slate-700">{upsell}</p>
          <Link
            href={href}
            className="mt-3 inline-flex text-sm font-bold text-teal-700 underline decoration-teal-400/60 underline-offset-2 hover:text-teal-900"
          >
            Unlock with {def.name}
          </Link>
        </div>
      </div>
    </div>
  )
}

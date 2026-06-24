'use client'

import { PREMIUM_UI_TOKENS, cn } from '@/lib/design-system'

type StatCardProps = {
  label: string
  value: string
  hint?: string
  className?: string
}

export default function StatCard({ label, value, hint, className }: StatCardProps) {
  return (
    <article className={cn(PREMIUM_UI_TOKENS.patterns.statCard.container, className)}>
      <p className={PREMIUM_UI_TOKENS.patterns.statCard.label}>{label}</p>
      <p className={PREMIUM_UI_TOKENS.patterns.statCard.value}>{value}</p>
      {hint ? <p className={PREMIUM_UI_TOKENS.patterns.statCard.hint}>{hint}</p> : null}
    </article>
  )
}

'use client'

import type { ReactNode } from 'react'
import { PREMIUM_UI_TOKENS, cn } from '@/lib/design-system'
import StatusBadge from '@/components/journey/tab-system/StatusBadge'

type OpportunityCardProps = {
  title: string
  value?: string
  detail?: string
  badge?: string
  badgeTone?: 'subtle' | 'accent' | 'success' | 'warning'
  action?: ReactNode
  className?: string
}

export default function OpportunityCard({
  title,
  value,
  detail,
  badge,
  badgeTone = 'accent',
  action,
  className,
}: OpportunityCardProps) {
  return (
    <article
      className={cn(
        PREMIUM_UI_TOKENS.patterns.surfaceCard,
        'border-[color-mix(in_srgb,var(--app-primary)_14%,transparent)] bg-gradient-to-br from-[var(--app-surface2)] to-[color-mix(in_srgb,var(--app-primary)_7%,var(--app-surface2))] p-4 sm:p-5',
        className
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-[var(--app-text)]">{title}</h3>
        {badge ? <StatusBadge label={badge} tone={badgeTone} /> : null}
      </div>
      {value ? <p className="mt-1 text-xl font-bold tabular-nums text-[var(--app-text)]">{value}</p> : null}
      {detail ? <p className="mt-1.5 text-sm text-[var(--app-muted)]">{detail}</p> : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </article>
  )
}

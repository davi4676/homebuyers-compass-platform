'use client'

import type { ReactNode } from 'react'
import { PREMIUM_UI_TOKENS, cn } from '@/lib/design-system'
import StatusBadge from '@/components/journey/tab-system/StatusBadge'

type TaskCardProps = {
  title: string
  detail?: string
  status?: string
  statusTone?: 'subtle' | 'accent' | 'success' | 'warning'
  action?: ReactNode
  className?: string
}

export default function TaskCard({
  title,
  detail,
  status,
  statusTone = 'subtle',
  action,
  className,
}: TaskCardProps) {
  return (
    <article
      className={cn(
        PREMIUM_UI_TOKENS.patterns.surfaceCard,
        'p-4 sm:p-5',
        className
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-[var(--app-text)]">{title}</h3>
          {detail ? <p className="mt-1 text-sm text-[var(--app-muted)]">{detail}</p> : null}
        </div>
        {status ? <StatusBadge label={status} tone={statusTone} /> : null}
      </div>
      {action ? <div className="mt-3">{action}</div> : null}
    </article>
  )
}

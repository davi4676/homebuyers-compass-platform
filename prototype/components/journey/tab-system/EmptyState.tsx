'use client'

import type { ReactNode } from 'react'
import { PREMIUM_UI_TOKENS, cn } from '@/lib/design-system'

type EmptyStateProps = {
  title: string
  detail: string
  action?: ReactNode
  illustration?: ReactNode
  className?: string
}

export default function EmptyState({
  title,
  detail,
  action,
  illustration,
  className,
}: EmptyStateProps) {
  return (
    <section className={cn(PREMIUM_UI_TOKENS.patterns.surfaceCard, 'p-6 text-center sm:p-8', className)}>
      {illustration ? <div className="mx-auto mb-3 flex w-fit items-center justify-center">{illustration}</div> : null}
      <h3 className="text-lg font-semibold text-[var(--app-text)]">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-lg text-sm text-[var(--app-muted)]">{detail}</p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </section>
  )
}

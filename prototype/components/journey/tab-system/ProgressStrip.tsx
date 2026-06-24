'use client'

import { PREMIUM_UI_TOKENS, cn } from '@/lib/design-system'

type ProgressStripProps = {
  value: number
  label?: string
  hint?: string
  className?: string
}

export default function ProgressStrip({ value, label, hint, className }: ProgressStripProps) {
  const clampedValue = Math.max(0, Math.min(100, value))

  return (
    <section className={cn(PREMIUM_UI_TOKENS.patterns.surfaceCard, 'p-4 sm:p-5', className)}>
      {label ? <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--app-muted)]">{label}</p> : null}
      <div className={cn(PREMIUM_UI_TOKENS.patterns.progressStrip, 'mt-2')}>
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--app-primary)] to-[var(--app-success)] transition-[width] duration-500 ease-out motion-reduce:transition-none"
          style={{ width: `${clampedValue}%` }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(clampedValue)}
        />
      </div>
      <div className="mt-2 flex items-center justify-between gap-2 text-xs text-[var(--app-muted)]">
        <span>{hint ?? 'Progress updates as you complete steps'}</span>
        <span className="font-semibold tabular-nums text-[var(--app-text)]">{Math.round(clampedValue)}%</span>
      </div>
    </section>
  )
}

'use client'

import { PREMIUM_UI_TOKENS } from '@/lib/design-system'
import StatCard from './StatCard'

type SummaryItem = {
  label: string
  value: string
  hint?: string
}

export default function TabSummaryPanel({
  title,
  items,
}: {
  title: string
  items: SummaryItem[]
}) {
  return (
    <section
      className={`${PREMIUM_UI_TOKENS.patterns.surfaceCard} p-5 sm:p-6`}
      style={{
        background:
          'linear-gradient(165deg, color-mix(in srgb, var(--app-surface2) 92%, white) 0%, color-mix(in srgb, var(--app-surface) 88%, white) 100%)',
      }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--app-muted)]">{title}</p>
      <div className="mt-4 grid gap-3.5 sm:grid-cols-3">
        {items.map((item) => (
          <StatCard
            key={item.label}
            label={item.label}
            value={item.value}
            hint={item.hint}
            className="bg-[color-mix(in_srgb,var(--app-surface2)_86%,transparent)]"
          />
        ))}
      </div>
    </section>
  )
}

'use client'

import { CaretDown } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import { PREMIUM_UI_TOKENS } from '@/lib/design-system'

export default function TabDetailsDisclosure({
  label,
  children,
  defaultOpen = false,
}: {
  label: string
  children: ReactNode
  defaultOpen?: boolean
}) {
  return (
    <details className={`${PREMIUM_UI_TOKENS.patterns.surfaceCard} group`} open={defaultOpen}>
      <summary className="flex cursor-pointer items-center justify-between gap-3 p-5 sm:p-6">
        <span className="text-sm font-bold uppercase tracking-wide text-[var(--app-muted)]">{label}</span>
        <CaretDown className="h-4 w-4 shrink-0 text-[var(--app-faint)] transition group-open:rotate-180" aria-hidden />
      </summary>
      <div className="border-t border-[color-mix(in_srgb,var(--app-text)_8%,transparent)] p-5 sm:p-6">{children}</div>
    </details>
  )
}

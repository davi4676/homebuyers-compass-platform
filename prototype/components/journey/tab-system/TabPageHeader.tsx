'use client'

import { PREMIUM_UI_TOKENS } from '@/lib/design-system'
import SectionHeader from './SectionHeader'

type Props = {
  title: string
  purpose: string
  chip?: string
}

export default function TabPageHeader({ title, purpose, chip }: Props) {
  return (
    <section
      className={`${PREMIUM_UI_TOKENS.patterns.surfaceCard} overflow-hidden p-6 sm:p-7`}
      style={{
        background:
          'linear-gradient(160deg, color-mix(in srgb, var(--app-surface2) 95%, white) 0%, color-mix(in srgb, var(--app-surface) 90%, white) 100%)',
      }}
    >
      <SectionHeader className="max-w-3xl space-y-3" eyebrow={chip} title={title} subtitle={purpose} />
    </section>
  )
}

'use client'

import { PREMIUM_UI_TOKENS } from '@/lib/design-system'

type Props = {
  primaryLabel: string
  onPrimary: () => void
  secondaryLabel?: string
  onSecondary?: () => void
}

export default function TabPrimaryActionRow({
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
}: Props) {
  return (
    <section className={`${PREMIUM_UI_TOKENS.patterns.surfaceCard} p-4 sm:p-5`}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={onPrimary}
          className={PREMIUM_UI_TOKENS.patterns.action.primary}
        >
          {primaryLabel}
        </button>
        {secondaryLabel && onSecondary ? (
          <button
            type="button"
            onClick={onSecondary}
            className={PREMIUM_UI_TOKENS.patterns.action.secondary}
          >
            {secondaryLabel}
          </button>
        ) : null}
      </div>
    </section>
  )
}

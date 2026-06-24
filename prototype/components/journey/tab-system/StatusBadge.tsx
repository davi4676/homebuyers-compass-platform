'use client'

import { PREMIUM_UI_TOKENS, cn } from '@/lib/design-system'

type StatusBadgeTone = 'subtle' | 'accent' | 'success' | 'warning'

type StatusBadgeProps = {
  label: string
  tone?: StatusBadgeTone
  className?: string
}

export default function StatusBadge({ label, tone = 'subtle', className }: StatusBadgeProps) {
  return <span className={cn(PREMIUM_UI_TOKENS.patterns.badge[tone], className)}>{label}</span>
}

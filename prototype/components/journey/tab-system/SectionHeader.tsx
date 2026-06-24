'use client'

import { PREMIUM_UI_TOKENS, cn } from '@/lib/design-system'

type SectionHeaderProps = {
  title: string
  subtitle?: string
  eyebrow?: string
  className?: string
}

export default function SectionHeader({
  title,
  subtitle,
  eyebrow,
  className,
}: SectionHeaderProps) {
  return (
    <header className={cn(PREMIUM_UI_TOKENS.patterns.sectionHeader.root, className)}>
      {eyebrow ? <p className={PREMIUM_UI_TOKENS.patterns.sectionHeader.eyebrow}>{eyebrow}</p> : null}
      <h2 className={PREMIUM_UI_TOKENS.patterns.sectionHeader.title}>{title}</h2>
      {subtitle ? <p className={PREMIUM_UI_TOKENS.patterns.sectionHeader.subtitle}>{subtitle}</p> : null}
    </header>
  )
}

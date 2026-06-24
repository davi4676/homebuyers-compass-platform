'use client'

import type { ReactNode } from 'react'

type Props = {
  eyebrow: string
  title: string
  description: string
  headingId?: string
  children?: ReactNode
  className?: string
}

/**
 * Shared tab header shell — compact spacing aligned across all journey tabs.
 */
export default function JourneyTabHeroShell({
  eyebrow,
  title,
  description,
  headingId,
  children,
  className = '',
}: Props) {
  return (
    <section
      className={`nq-journey-tab-hero relative overflow-hidden border border-[var(--nq-ed-line-soft)] nq-glass ${className}`}
      aria-labelledby={headingId}
    >
      <span
        className="pointer-events-none absolute left-5 top-0 h-[2px] w-9 rounded-b bg-[var(--nq-ed-accent)] sm:left-6"
        aria-hidden
      />
      <span className="nq-ed-eyebrow">{eyebrow}</span>
      <h2
        id={headingId}
        className="nq-journey-tab-hero__title font-display text-[clamp(1.35rem,2.8vw,1.85rem)] font-semibold leading-[1.15] tracking-tight text-[var(--nq-ed-text)]"
      >
        {title}
      </h2>
      <p className="nq-journey-tab-hero__desc max-w-2xl text-[var(--nq-ed-muted)] sm:text-[15px]">
        {description}
      </p>
      {children ? <div className="nq-journey-tab-hero__slot">{children}</div> : null}
    </section>
  )
}

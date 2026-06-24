'use client'

import type { ReactNode } from 'react'
import clsx from 'clsx'

export type MissionControlLayoutProps = {
  /** Center column: primary action canvas, roadmap, and journey content. */
  main: ReactNode
  /** Right column: money & momentum (sticky on wide screens; stacks below on mobile). */
  aside: ReactNode
  className?: string
}

/**
 * Mission Control two-column content grid (page-level).
 * The left “journey rail” is the fixed `JourneyNav` in `TopNav` (`md:w-56`); this layout is the main + right stack.
 */
export default function MissionControlLayout({ main, aside, className }: MissionControlLayoutProps) {
  return (
    <div
      className={clsx(
        'mission-control-canvas grid w-full min-w-0 grid-cols-1 gap-10 lg:gap-9 xl:grid-cols-[minmax(0,1fr)_minmax(18.5rem,21.5rem)] xl:items-start xl:gap-12',
        className
      )}
    >
      <div className="mission-control-canvas__main min-w-0">{main}</div>
      <aside
        className="mission-control-canvas__aside w-full min-w-0 max-w-lg mx-auto min-h-0 rounded-[var(--app-r2)] border border-[color-mix(in_srgb,var(--app-text)_9%,transparent)] bg-[color-mix(in_srgb,var(--app-surface2)_78%,transparent)] p-4 shadow-[var(--app-shadow1)] xl:mx-0 xl:max-w-none xl:sticky xl:top-16 xl:max-h-[calc(100dvh-4.5rem)] xl:overflow-y-auto xl:overflow-x-hidden xl:overscroll-y-contain xl:pr-2 [scrollbar-gutter:stable]"
        aria-label="Money and momentum at a glance"
      >
        {aside}
      </aside>
    </div>
  )
}

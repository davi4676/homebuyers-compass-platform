'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface NextBestActionStickyProps {
  title: string
  description: string
  ctaLabel: string
  ctaHref: string
  secondaryLabel?: string
  secondaryHref?: string
  className?: string
}

export default function NextBestActionSticky({
  title,
  description,
  ctaLabel,
  ctaHref,
  secondaryLabel,
  secondaryHref,
  className = '',
}: NextBestActionStickyProps) {
  return (
    <div className={`nq-hub-panel sticky top-4 z-30 p-4 ${className}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="nq-ed-eyebrow !px-2.5 !py-1.5 !text-[0.65rem]">Next best action</p>
          <p className="mt-2 font-display text-base font-semibold tracking-tight text-[var(--nq-ed-text)] sm:text-lg">
            {title}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-[var(--nq-ed-muted)]">{description}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {secondaryLabel && secondaryHref && (
            <Link href={secondaryHref} className="nq-ed-btn-outline inline-flex !rounded-lg !px-3 !py-2 text-sm">
              {secondaryLabel}
            </Link>
          )}
          <Link
            href={ctaHref}
            className="nq-ed-btn-primary inline-flex items-center gap-1 !rounded-lg !px-3 !py-2 text-sm"
          >
            {ctaLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}

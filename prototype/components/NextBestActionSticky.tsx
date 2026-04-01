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
    <div className={`sticky top-4 z-30 rounded-xl border border-slate-200 bg-white/95 backdrop-blur p-3 shadow-sm ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide font-semibold text-slate-500">Next Best Action</p>
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="text-xs text-slate-600">{description}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {secondaryLabel && secondaryHref && (
            <Link
              href={secondaryHref}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              {secondaryLabel}
            </Link>
          )}
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-[rgb(var(--coral))] text-white text-sm font-semibold hover:bg-[rgb(var(--coral-hover))]"
          >
            {ctaLabel}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}


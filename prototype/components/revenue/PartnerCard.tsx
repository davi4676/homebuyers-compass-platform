import Link from 'next/link'
import type { ReactNode } from 'react'
import clsx from 'clsx'

export type PartnerCardProps = {
  partnerName: string
  logoIcon?: ReactNode
  tagline: string
  primaryStat: string
  primaryStatLabel: string
  ctaText: string
  ctaHref: string
  badge?: ReactNode
  isSponsored?: boolean
}

export default function PartnerCard({
  partnerName,
  logoIcon,
  tagline,
  primaryStat,
  primaryStatLabel,
  ctaText,
  ctaHref,
  badge,
  isSponsored,
}: PartnerCardProps) {
  const initial = partnerName.trim().charAt(0).toUpperCase() || '?'

  return (
    <div
      className={clsx(
        'group relative rounded-xl border bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)] transition-all duration-150 ease-in-out',
        'border-[var(--revenue-partner-border)] hover:border-teal-400 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)]'
      )}
    >
      {isSponsored ? (
        <span className="absolute right-3 top-3 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
          Partner
        </span>
      ) : null}
      {badge ? <div className="absolute left-3 top-3">{badge}</div> : null}

      <div className={clsx('p-4', (isSponsored || badge) ? 'pt-10' : 'pt-5')}>
        <div className="flex gap-3">
          <div
            className="flex h-[40px] w-[40px] shrink-0 items-center justify-center overflow-hidden rounded-lg text-lg font-semibold text-teal-800"
            style={{ backgroundColor: 'var(--revenue-partner-bg)' }}
          >
            {logoIcon ?? <span aria-hidden>{initial}</span>}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900">{partnerName}</h3>
            <p className="text-sm text-gray-500">{tagline}</p>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-2xl font-bold text-teal-600">{primaryStat}</p>
          <p className="text-xs font-normal uppercase tracking-wide text-gray-400">
            {primaryStatLabel}
          </p>
        </div>

        <Link
          href={ctaHref}
          className="mt-4 block w-full rounded-lg bg-teal-600 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-teal-700"
        >
          {ctaText}
        </Link>
      </div>
    </div>
  )
}

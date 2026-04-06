import Link from 'next/link'
import { Lock } from 'lucide-react'

export type UpgradeLockCalloutProps = {
  /** Short name of the locked item, e.g. "All assistance programs" */
  lockedLabel: string
  /** One line: why Momentum (or paid) unlocks it */
  reason: string
  /** Single primary CTA */
  ctaLabel: string
  ctaHref: string
  className?: string
  /** Optional second action (e.g. higher tier) */
  secondaryCta?: { label: string; href: string }
}

/** Shared style for inline “upgrade” links outside the card (library rows, etc.) */
export const upgradeLockSecondaryLinkClass =
  'font-bold text-teal-800 underline decoration-teal-600/60 underline-offset-2 hover:text-teal-950'

/**
 * Consistent upgrade pattern: what’s locked · why · one CTA (strategy recommendation #3).
 */
export default function UpgradeLockCallout({
  lockedLabel,
  reason,
  ctaLabel,
  ctaHref,
  className = '',
  secondaryCta,
}: UpgradeLockCalloutProps) {
  return (
    <div
      className={`rounded-2xl border border-teal-200/90 bg-gradient-to-br from-teal-50 to-emerald-50/80 p-4 shadow-md ring-1 ring-teal-100/80 sm:p-5 ${className}`}
      role="region"
      aria-label={`Upgrade to unlock ${lockedLabel}`}
    >
      <p className="flex items-start gap-2 text-sm font-semibold text-teal-950">
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" aria-hidden />
        <span>
          <span className="sr-only">Locked: </span>
          {lockedLabel}
        </span>
      </p>
      <p className="mt-2 text-sm leading-relaxed text-teal-900/85">{reason}</p>
      <Link
        href={ctaHref}
        className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-teal-700 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800 sm:w-auto"
      >
        {ctaLabel}
      </Link>
      {secondaryCta ? (
        <Link
          href={secondaryCta.href}
          className={`mt-3 inline-flex w-full justify-center text-center text-sm ${upgradeLockSecondaryLinkClass}`}
        >
          {secondaryCta.label}
        </Link>
      ) : null}
    </div>
  )
}

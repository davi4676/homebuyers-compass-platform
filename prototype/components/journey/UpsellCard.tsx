'use client'

import Link from 'next/link'
import { X } from 'lucide-react'
import type { UserTier } from '@/lib/tiers'
import { TIER_DEFINITIONS } from '@/lib/tiers'
import MindsetTag from '@/components/journey/MindsetTag'

type UpsellCardProps = {
  id?: string
  title: string
  valueLine: string
  nextTier: UserTier
  upgradeHref?: string
  ctaLabel?: string
  className?: string
  dismissible?: boolean
  dismissStorageKey?: string
  onDismiss?: () => void
  /** When true, parent controls visibility after dismiss */
  dismissed?: boolean
}

export default function UpsellCard({
  id: domId,
  title,
  valueLine,
  nextTier,
  upgradeHref,
  ctaLabel,
  className = '',
  dismissible = false,
  dismissStorageKey,
  onDismiss,
  dismissed = false,
}: UpsellCardProps) {
  if (dismissed) return null

  const def = TIER_DEFINITIONS[nextTier]
  const href = upgradeHref ?? `/upgrade?source=journey-upsell&tier=${nextTier}`

  const handleDismiss = () => {
    if (dismissStorageKey && typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(dismissStorageKey, '1')
      } catch {
        // ignore
      }
    }
    onDismiss?.()
  }

  return (
    <div
      id={domId}
      className={`relative rounded-2xl border border-sky-200/80 bg-gradient-to-br from-sky-50/90 via-white to-indigo-50/40 p-4 shadow-sm ring-1 ring-sky-100/60 sm:p-5 ${className}`}
    >
      {dismissible ? (
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute right-2 top-2 rounded-lg p-1.5 text-slate-500 transition hover:bg-white/80 hover:text-slate-800"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      ) : null}
      <p className="pr-8 text-sm font-bold text-sky-950">{title}</p>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-700">{valueLine}</p>
      <div className="mt-2">
        <MindsetTag compact mindset={def.mindset} />
      </div>
      <Link
        href={href}
        className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[rgb(var(--navy))] px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:opacity-95"
      >
        {ctaLabel ?? `Upgrade to ${def.name}`}
      </Link>
    </div>
  )
}

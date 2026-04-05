'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { shouldShowLandingQuizMobileSticky } from '@/lib/mobile-marketing-cta'

/** Fixed bottom CTA on mobile only; landing + quiz pages, guests only. */
export default function StickyMobileCta() {
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()
  const show = shouldShowLandingQuizMobileSticky(pathname, isAuthenticated)

  if (!show) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex gap-2 border-t border-gray-200 bg-white p-3 md:hidden"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      <Link
        href="/quiz"
        className="flex-1 rounded-lg bg-teal-600 py-3 text-center text-sm font-semibold text-white"
      >
        Find My Savings →
      </Link>
      <Link
        href="/upgrade"
        className="rounded-lg border border-teal-600 px-4 py-3 text-sm font-medium text-teal-600"
      >
        Plans
      </Link>
    </div>
  )
}

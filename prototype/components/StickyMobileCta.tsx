'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { SIGNUP_DISABLED } from '@/lib/auth-flags'
import { shouldShowMobileMarketingSticky } from '@/lib/mobile-marketing-cta'

const SAVINGS_HREF = SIGNUP_DISABLED ? '/quiz?transactionType=first-time' : '/auth?mode=signup&redirect=%2Fquiz%3FtransactionType%3Dfirst-time'

/** Fixed bottom CTA on mobile; appears after the landing/marketing hero scrolls out of view. */
export default function StickyMobileCta() {
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()
  const [showBar, setShowBar] = useState(false)

  const eligible = shouldShowMobileMarketingSticky(pathname, isAuthenticated)

  useEffect(() => {
    if (!eligible) {
      setShowBar(false)
      return
    }

    if (pathname === '/') {
      const hero = document.getElementById('landing-hero')
      if (!hero) return

      const obs = new IntersectionObserver(
        ([entry]) => {
          setShowBar(!entry.isIntersecting)
        },
        { threshold: 0, rootMargin: '0px' }
      )
      obs.observe(hero)
      return () => obs.disconnect()
    }

    const onScroll = () => {
      setShowBar(window.scrollY > 96)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [eligible, pathname])

  if (!eligible) return null

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 md:hidden transition-transform duration-300 ease-in-out ${
        showBar ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{ paddingBottom: 'max(0px, env(safe-area-inset-bottom))' }}
    >
      <div className="border-t border-millennial-border bg-millennial-surface/95 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-3 pb-2 pt-3 font-sans">
          <Link
            href={SAVINGS_HREF}
            className="flex w-full items-center justify-center rounded-xl bg-millennial-cta-primary px-4 py-3.5 text-base font-bold text-white shadow-md transition-colors hover:bg-millennial-cta-hover active:scale-[0.99]"
          >
            Find My Savings →
          </Link>
          <p className="mt-2 text-center text-[11px] font-medium text-millennial-text-muted">
            Free · No credit check · Typical scan ~90 seconds
          </p>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { SIGNUP_DISABLED } from '@/lib/auth-flags'

const QUIZ_CTA_HREF = SIGNUP_DISABLED ? '/quiz' : '/auth?mode=signup&redirect=%2Fquiz'

/** Fixed bottom CTA on mobile; appears after the landing hero scrolls out of view. */
export default function StickyMobileCta() {
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()
  const [showBar, setShowBar] = useState(false)

  useEffect(() => {
    if (pathname !== '/' || isAuthenticated) {
      setShowBar(false)
      return
    }
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
  }, [pathname, isAuthenticated])

  if (pathname !== '/' || isAuthenticated) return null

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 md:hidden transition-transform duration-300 ease-in-out ${
        showBar ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{ paddingBottom: 'max(0px, env(safe-area-inset-bottom))' }}
    >
      <div className="bg-brand-forest px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <Link
          href={QUIZ_CTA_HREF}
          className="flex min-h-[48px] w-full items-center justify-center rounded-lg py-3 text-center text-base font-semibold text-white"
        >
          Find My Savings — Free →
        </Link>
      </div>
    </div>
  )
}

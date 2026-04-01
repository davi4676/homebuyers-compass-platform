'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'

/** Sticky bottom CTA on mobile for guests on the landing page; hides after scrolling past hero. */
export default function MobileLandingCta() {
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (pathname !== '/' || isAuthenticated) {
      setVisible(false)
      return
    }
    const onScroll = () => {
      setVisible(window.scrollY < 420)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [pathname, isAuthenticated])

  if (pathname !== '/' || isAuthenticated || !visible) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-[90] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
      <Link
        href="/quiz"
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-forest py-3.5 text-base font-bold text-white shadow-lg"
      >
        Find My Savings — Free
        <ArrowRight className="h-5 w-5" />
      </Link>
    </div>
  )
}

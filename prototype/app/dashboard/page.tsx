'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BackToMyJourneyLink from '@/components/BackToMyJourneyLink'

/**
 * Dashboard has been realigned into the personalized journey pages.
 * First-time & repeat buyer: /customized-journey (journey hub)
 * Refinance: /refinance-optimizer (hub; wizard at /homebuyer/refinance-journey)
 */
export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    if (typeof window === 'undefined') return
    let transactionType: 'first-time' | 'repeat-buyer' | 'refinance' = 'first-time'
    try {
      const raw = localStorage.getItem('quizData')
      if (raw) {
        const parsed = JSON.parse(raw) as { transactionType?: string }
        if (parsed.transactionType === 'repeat-buyer' || parsed.transactionType === 'refinance') {
          transactionType = parsed.transactionType
        }
      }
    } catch {
      // Fall back to first-time route.
    }

    const routeByType: Record<typeof transactionType, string> = {
      'first-time': '/customized-journey',
      'repeat-buyer': '/customized-journey',
      'refinance': '/refinance-optimizer',
    }
    router.replace(routeByType[transactionType])
  }, [router])

  return (
    <div className="app-page-shell flex flex-col items-center justify-center px-4 py-10">
      <div className="mb-6">
        <BackToMyJourneyLink />
      </div>
      <div className="w-full max-w-sm space-y-4">
        <div className="h-10 rounded-xl bg-slate-200/80 animate-pulse" />
        <div className="h-24 rounded-2xl bg-white border border-slate-200 shadow-sm animate-pulse" />
        <div className="h-4 w-2/3 mx-auto rounded bg-slate-200/80 animate-pulse" />
        <p className="text-center text-sm text-slate-500">Redirecting to your journey…</p>
      </div>
    </div>
  )
}

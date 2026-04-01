'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Dashboard has been realigned into the personalized journey pages.
 * First-time homebuyer: /customized-journey (My progress section)
 * Refinance: /refinance-optimizer (My progress tab)
 * Repeat buyer: /repeat-buyer-suite (My progress tab)
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
      'repeat-buyer': '/homebuyer/buy-sell-journey',
      'refinance': '/homebuyer/refinance-journey',
    }
    router.replace(routeByType[transactionType])
  }, [router])

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5] flex items-center justify-center">
      <p className="text-gray-400">Redirecting to your journey...</p>
    </div>
  )
}

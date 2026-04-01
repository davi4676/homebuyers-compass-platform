'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Lifecycle dashboard has been realigned into refinance and repeat buyer personalized journey tabs only.
 * Refinance: /refinance-optimizer (Personalized journey → Mortgage lifecycle)
 * Repeat buyer: /repeat-buyer-suite (Personalized journey → Mortgage lifecycle)
 */
export default function LifecycleDashboardPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/refinance-optimizer')
  }, [router])

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5] flex items-center justify-center">
      <p className="text-gray-400">Redirecting to your journey...</p>
    </div>
  )
}

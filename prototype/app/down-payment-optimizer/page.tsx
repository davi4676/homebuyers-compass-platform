'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Down Payment Optimizer is now embedded in the Personalized Journey (Preparation phase).
 * Redirect to customized-journey and scroll to the preparation phase.
 */
export default function DownPaymentOptimizerPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/customized-journey#phase-preparation')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a] flex items-center justify-center text-white">
      <p className="text-gray-400">Redirecting to Your Journey…</p>
    </div>
  )
}

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BackToMyJourneyLink from '@/components/BackToMyJourneyLink'
import { setUserTier } from '@/lib/user-tracking'
import { type UserTier } from '@/lib/tiers'

export default function DevUpgradePage() {
  const router = useRouter()

  useEffect(() => {
    // Set to premium tier
    setUserTier('momentum')
    
    // Dispatch event to update all components
    window.dispatchEvent(new CustomEvent('tierChanged', { detail: { tier: 'momentum' } }))
    
    // Redirect to home after a brief moment
    setTimeout(() => {
      router.push('/')
    }, 500)
  }, [router])

  return (
    <div className="app-page-shell flex flex-col items-center justify-center px-4 py-10">
      <div className="mb-6">
        <BackToMyJourneyLink />
      </div>
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-[#e7e5e4] border-t-[#0d9488]" />
        <p className="text-lg font-semibold text-[#0f766e]">Upgrading to Momentum…</p>
        <p className="mt-2 text-sm text-[#57534e]">Redirecting…</p>
      </div>
    </div>
  )
}

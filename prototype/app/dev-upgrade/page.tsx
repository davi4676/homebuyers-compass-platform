'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p className="text-lg font-semibold text-purple-400">Upgrading to Guided Plan...</p>
        <p className="text-sm text-gray-400 mt-2">Redirecting...</p>
      </div>
    </div>
  )
}

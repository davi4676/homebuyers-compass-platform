'use client'

import { useEffect } from 'react'
import { initBlinkSDK } from '@/lib/blink'

export default function BlinkProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initBlinkSDK({
      apiKey: process.env.NEXT_PUBLIC_BLINK_API_KEY,
      environment: (process.env.NODE_ENV === 'production' ? 'production' : 'development') as 'development' | 'staging' | 'production',
    })
  }, [])
  return <>{children}</>
}

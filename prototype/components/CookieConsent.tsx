'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const CONSENT_KEY = 'cookie-consent-accepted'

export default function CookieConsent() {
  const [mounted, setMounted] = useState(false)
  const [accepted, setAccepted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      setAccepted(localStorage.getItem(CONSENT_KEY) === 'true')
    }
  }, [])

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, 'true')
    setAccepted(true)
  }

  if (!mounted || accepted) return null

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gray-800/95 border-t border-gray-700 text-gray-200 text-sm"
    >
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p>
          We use cookies to improve your experience and analyze traffic.{' '}
          <Link href="/privacy" className="text-cyan-400 hover:underline">
            Privacy policy
          </Link>
        </p>
        <button
          onClick={accept}
          className="shrink-0 px-4 py-2 rounded-lg bg-cyan-600 text-white font-medium hover:bg-cyan-700 transition"
        >
          Accept
        </button>
      </div>
    </div>
  )
}

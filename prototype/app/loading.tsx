'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Loading() {
  const [showRecovery, setShowRecovery] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShowRecovery(true), 6000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center p-8" aria-live="polite" aria-busy="true">
      <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" role="status" aria-label="Loading" />
      <p className="mt-4 text-gray-400">Loading...</p>
      {showRecovery && (
        <p className="mt-6 text-sm text-gray-500">
          Taking a while?{' '}
          <Link href="/" className="text-[rgb(var(--coral))] hover:underline font-medium">
            Go to home
          </Link>
          {' or '}
          <button type="button" onClick={() => window.location.reload()} className="text-[rgb(var(--coral))] hover:underline font-medium">
            refresh the page
          </button>
        </p>
      )}
    </div>
  )
}

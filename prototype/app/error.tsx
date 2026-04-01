'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('App error:', error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-2xl font-bold text-gray-100 mb-2">Something went wrong</h1>
      <p className="text-gray-400 mb-6 max-w-md">{error.message || 'An unexpected error occurred.'}</p>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="px-4 py-2 rounded-lg bg-cyan-600 text-white font-medium hover:bg-cyan-700 transition"
        >
          Try again
        </button>
        <Link
          href="/"
          className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 font-medium hover:bg-gray-800 transition"
        >
          Back to home
        </Link>
      </div>
    </div>
  )
}

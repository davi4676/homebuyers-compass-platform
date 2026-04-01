'use client'

import Link from 'next/link'
import { Star, ArrowLeft } from 'lucide-react'

export default function RatingsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5]">
      <header className="sticky top-0 z-10 border-b border-gray-800 bg-[#0a0a0a]/95 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="flex justify-center mb-6">
          <Star className="w-16 h-16 text-[#06b6d4]" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Ratings and Reviews</h1>
        <p className="text-gray-400 mb-6 max-w-md mx-auto">
          User ratings and feedback. Connect to your marketplace or professional directory for reviews and ratings.
        </p>
        <Link
          href="/resources"
          className="text-[#06b6d4] hover:underline text-sm"
        >
          Open playbooks →
        </Link>
      </main>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { MapPin, ArrowLeft } from 'lucide-react'

export default function MapPage() {
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
          <MapPin className="w-16 h-16 text-[#06b6d4]" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Mapping</h1>
        <p className="text-gray-400 mb-6 max-w-md mx-auto">
          Location and map data are used in the quiz (city/zip) and results. A full map view can be added here for property search or area insights.
        </p>
        <Link
          href="/quiz"
          className="text-[#06b6d4] hover:underline text-sm"
        >
          Start assessment (location step) →
        </Link>
      </main>
    </div>
  )
}

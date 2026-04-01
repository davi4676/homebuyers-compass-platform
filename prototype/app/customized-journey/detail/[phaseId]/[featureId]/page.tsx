'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { getPhaseAndFeature } from '@/lib/journey-phases-data'

const JOURNEY_TITLE = "Let's Face It: The Homebuying Process Is Very Complicated"
const JOURNEY_SUBTITLE =
  "Here's the complete journey from pre-approval to closing - and why having a guide makes all the difference"

export default function JourneyTileDetailPage() {
  const params = useParams()
  const router = useRouter()
  const phaseId = params.phaseId as string
  const featureId = params.featureId as string

  const lookup = getPhaseAndFeature(phaseId ?? '', featureId ?? '')

  if (!lookup) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5] p-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Tile not found</h1>
          <p className="text-gray-400 mb-6">
            This journey step or feature could not be found.
          </p>
          <Link
            href="/customized-journey"
            className="inline-flex items-center gap-2 text-[#06b6d4] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to journey
          </Link>
        </div>
      </div>
    )
  }

  const { phase, feature } = lookup

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5]">
      <header className="sticky top-0 z-10 border-b border-gray-800 bg-[#0a0a0a]/95 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.push('/customized-journey')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to journey</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Journey title - attributed to this section */}
        <div className="mb-10 p-6 rounded-xl bg-gray-900/60 border border-gray-700">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            {JOURNEY_TITLE}
          </h1>
          <p className="text-gray-400">{JOURNEY_SUBTITLE}</p>
        </div>

        {/* Phase context */}
        <div className="mb-6">
          <span className="text-sm font-semibold text-gray-400">
            Phase {phase.order} · {phase.estimatedTime}
          </span>
          <h2 className="text-xl text-[#06b6d4] font-semibold mt-1">
            {phase.title}
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {phase.detailDescription ?? phase.description}
          </p>
        </div>

        {/* Feature detail */}
        <div className="rounded-xl bg-gray-900/50 border-2 border-[#06b6d4]/30 p-8">
          <h3 className="text-2xl font-bold text-white mb-4">
            {feature.title}
          </h3>
          <p className="text-gray-300 text-lg leading-relaxed mb-8">
            {feature.detailDescription ?? feature.description}
          </p>

          {feature.link && (
            <Link
              href={feature.link}
              className="inline-flex items-center gap-2 bg-[#06b6d4] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0891b2] transition-colors"
            >
              Open {feature.title}
              <ArrowRight className="w-5 h-5" />
            </Link>
          )}
        </div>
      </main>
    </div>
  )
}

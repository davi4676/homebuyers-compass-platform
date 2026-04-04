'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { getPhaseAndFeature } from '@/lib/journey-phases-data'
import BackToMyJourneyLink from '@/components/BackToMyJourneyLink'

const JOURNEY_TITLE = "Let's Face It: The home buying Process Is Very Complicated"
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
      <div className="app-page-shell p-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-6 text-left">
            <BackToMyJourneyLink className="font-semibold" />
          </div>
          <h1 className="font-display text-2xl font-bold mb-4">Tile not found</h1>
          <p className="text-[#57534e] mb-6">This journey step or feature could not be found.</p>
          <button
            type="button"
            onClick={() => router.push('/customized-journey')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0d9488] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to journey hub
          </button>
        </div>
      </div>
    )
  }

  const { phase, feature } = lookup

  return (
    <div className="app-page-shell">
      <header className="sticky top-0 z-10 border-b border-[#e7e5e4] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-4 px-4 py-4">
          <BackToMyJourneyLink className="font-semibold" />
          <button
            type="button"
            onClick={() => router.push('/customized-journey')}
            className="flex items-center gap-2 text-sm font-medium text-[#57534e] transition-colors hover:text-[#1c1917]"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Journey hub</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-10 rounded-xl border border-[#e7e5e4] bg-white p-6 shadow-sm">
          <h1 className="font-display text-2xl font-bold text-[#1c1917] md:text-3xl mb-2">{JOURNEY_TITLE}</h1>
          <p className="text-[#57534e]">{JOURNEY_SUBTITLE}</p>
        </div>

        <div className="mb-6">
          <span className="text-sm font-semibold text-[#78716c]">
            Phase {phase.order} · {phase.estimatedTime}
          </span>
          <h2 className="font-display mt-1 text-xl font-semibold text-[#0d9488]">{phase.title}</h2>
          <p className="mt-1 text-sm text-[#57534e]">{phase.detailDescription ?? phase.description}</p>
        </div>

        <div className="rounded-xl border border-[#e7e5e4] bg-white p-8 shadow-sm">
          <h3 className="font-display mb-4 text-2xl font-bold text-[#1c1917]">{feature.title}</h3>
          <p className="mb-8 text-lg leading-relaxed text-[#57534e]">
            {feature.detailDescription ?? feature.description}
          </p>

          {feature.link && (
            <Link
              href={feature.link}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0d9488] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#0f766e]"
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

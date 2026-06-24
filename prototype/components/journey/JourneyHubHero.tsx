'use client'

import NqHubModernHero from '@/components/hub/NqHubModernHero'
import { HUB_TAB_CONFIG } from '@/lib/hub-tab-theme'
import {
  journeyTabHrefPreservingSearch,
  JOURNEY_PAGE_PATH,
  type JourneyTab,
} from '@/lib/journey-nav-tabs'
import { getJourneyPhaseMilestoneLabel } from '@/lib/journey-phase-ring'

type Props = {
  phaseCompleted: number
  phaseTotal: number
  phasePct: number
  searchKey?: string
  activeTab?: JourneyTab
}

export default function JourneyHubHero({
  phaseCompleted,
  phaseTotal,
  phasePct,
  searchKey = '',
  activeTab = 'today',
}: Props) {
  const config = HUB_TAB_CONFIG.journey
  const ctaTab: JourneyTab = activeTab === 'today' ? 'plan' : 'today'
  const ctaLabel = activeTab === 'today' ? 'Open your roadmap' : "See today's move"
  const ctaHref = journeyTabHrefPreservingSearch(JOURNEY_PAGE_PATH, searchKey, ctaTab)

  const glassCard = (
    <div className="nq-glass nq-savings-glass">
      <p className="nq-savings-glass-label">Journey progress</p>
      <p className="nq-savings-glass-amount tabular-nums">
        {phaseCompleted}/{phaseTotal}
      </p>
      <p className="mt-2 text-sm text-[var(--nq-ed-muted)]">
        {getJourneyPhaseMilestoneLabel(phasePct)} · {phasePct}% complete
      </p>
    </div>
  )

  return (
    <div className="nq-journey-hub-hero border-b border-[var(--nq-ed-line-soft)]">
      <NqHubModernHero
        brandLine={config.brandLine}
        title={config.title}
        titleAccent={config.titleAccent}
        subtitle={config.subtitle}
        imageSrc={config.imageSrc}
        imageAlt={config.imageAlt}
        imagePosition={config.imagePosition}
        cta={{ href: ctaHref, label: ctaLabel }}
        glassCard={glassCard}
        compact
      />
    </div>
  )
}

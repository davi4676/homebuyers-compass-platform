'use client'

import type { User } from '@/lib/types/auth'
import type { UserSnapshot } from '@/lib/user-snapshot'
import JourneyProgressIdentityHeader from '@/components/journey/JourneyProgressIdentityHeader'
import JourneyPhaseProgressRing from '@/components/journey/JourneyPhaseProgressRing'
import JourneyQuickNav from '@/components/journey/JourneyQuickNav'
import { getJourneyPhaseMilestoneLabel } from '@/lib/journey-phase-ring'
import type { JourneyTab } from '@/lib/journey-nav-tabs'

type Props = {
  user: User | null
  snapshot: UserSnapshot | null
  phasePct: number
  phaseCompleted: number
  phaseTotal: number
  ringAccent: string
  activeTab: JourneyTab
  searchKey: string
}

export default function JourneyCommandHeader({
  user,
  snapshot,
  phasePct,
  phaseCompleted,
  phaseTotal,
  ringAccent,
  activeTab,
  searchKey,
}: Props) {
  return (
    <header className="nq-journey-command-header">
      <div className="nq-hub-panel relative overflow-hidden p-5 sm:p-6">
        <span
          className="pointer-events-none absolute left-7 top-0 h-[2px] w-9 rounded-b bg-[var(--nq-ed-accent)] sm:left-8"
          aria-hidden
        />

        <p className="nq-sl-brand-line">My Journey</p>

        <div className="mt-4 border-t border-[var(--nq-ed-line-soft)] pt-4">
          <JourneyProgressIdentityHeader user={user} snapshot={snapshot} />
        </div>

        <div className="mt-4 flex items-center gap-3.5">
          <JourneyPhaseProgressRing pct={phasePct} size="sm" accentColor={ringAccent} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[var(--nq-ed-text)]">
              {phaseCompleted} of {phaseTotal} phases
              {' · '}
              <span className="text-[var(--nq-ed-muted)]">{getJourneyPhaseMilestoneLabel(phasePct)}</span>
            </p>
            <div className="mt-1.5 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-[var(--nq-ed-line-soft)]">
              <div
                className="h-full rounded-full transition-[width] duration-500 ease-out motion-reduce:transition-none"
                style={{ width: `${phasePct}%`, background: ringAccent }}
                aria-hidden
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 md:hidden">
        <JourneyQuickNav activeTab={activeTab} searchKey={searchKey} />
      </div>
    </header>
  )
}

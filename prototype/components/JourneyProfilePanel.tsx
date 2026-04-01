'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { ChevronUp, ChevronDown, Compass } from 'lucide-react'
import { useJourney } from './JourneyProvider'
import { getUserProfile } from '@/lib/user-profile'
import {
  getCurrentStep,
  getCompletedSteps,
  type JourneyStep,
} from '@/lib/journey-framework'
import { getAgentTriggerFlags } from '@/lib/agent-triggers'
import { getNextBestAction } from '@/lib/next-best-action'
import { COPY_PERSONALIZATION_ENABLED } from '@/lib/copy-variants'

export default function JourneyProfilePanel() {
  const pathname = usePathname()
  const journey = useJourney()
  const [open, setOpen] = useState(false)
  const [profile, setProfile] = useState<ReturnType<typeof getUserProfile> | null>(null)
  const [triggers, setTriggers] = useState<ReturnType<typeof getAgentTriggerFlags> | null>(null)
  const [completedSteps, setCompletedSteps] = useState<JourneyStep[]>([])

  const currentStep = pathname ? getCurrentStep(pathname) : 'discover'

  useEffect(() => {
    if (typeof window === 'undefined') return
    setProfile(getUserProfile())
    setTriggers(getAgentTriggerFlags())
    setCompletedSteps(getCompletedSteps())
  }, [open, pathname])

  const nba =
    profile &&
    getNextBestAction(currentStep, profile.confidenceScore, profile.buyerType)

  return (
    <div
      className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-0"
      aria-label="Your journey and profile"
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg border border-gray-600 bg-gray-900/95 px-3 py-2 text-sm text-gray-300 shadow-lg hover:bg-gray-800 hover:text-white"
      >
        <Compass className="h-4 w-4" />
        <span>Your journey</span>
        {open ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
      </button>

      {open && (
        <div className="mt-1 w-72 max-w-[calc(100vw-2rem)] rounded-lg border border-gray-600 bg-gray-900/98 p-3 text-xs text-gray-300 shadow-xl">
          {/* Journey context */}
          <Section title="Journey context">
            <Row label="Type" value={journey?.journeyType ?? '—'} />
            <Row label="From path" value={journey?.inferredFromPath ? 'Yes' : 'No'} />
          </Section>

          {/* Journey framework */}
          <Section title="Journey steps">
            <Row label="Current step" value={currentStep} />
            <Row
              label="Completed"
              value={
                completedSteps.length > 0 ? completedSteps.join(', ') : 'None yet'
              }
            />
          </Section>

          {/* UserProfile */}
          <Section title="Profile">
            {profile ? (
              <>
                <Row label="Buyer type" value={profile.buyerType} />
                <Row label="Confidence" value={`${profile.confidenceScore} / 100`} />
                <Row label="Risk" value={profile.riskTolerance} />
                <Row label="Time horizon" value={profile.timeHorizon} />
                <Row label="Detail" value={profile.detailPreference} />
              </>
            ) : (
              <p className="text-gray-500">—</p>
            )}
          </Section>

          {/* Copy personalization */}
          <Section title="Copy personalization">
            <Row
              label="Enabled"
              value={COPY_PERSONALIZATION_ENABLED ? 'Yes' : 'No'}
            />
          </Section>

          {/* Agent triggers */}
          <Section title="Agent triggers">
            {triggers ? (
              <>
                <Row label="Plateau" value={triggers.confidencePlateau ? 'Yes' : 'No'} />
                <Row label="Stretch risk" value={triggers.firstStretchRisk ? 'Yes' : 'No'} />
                <Row label="Hesitation" value={triggers.repeatedHesitation ? 'Yes' : 'No'} />
                <Row label="Help tap" value={triggers.explicitHelpTap ? 'Yes' : 'No'} />
              </>
            ) : (
              <p className="text-gray-500">—</p>
            )}
          </Section>

          {/* Next best action */}
          <Section title="Next best action">
            {nba ? (
              <>
                <Row label="Action" value={nba.action} />
                <p className="mt-1 text-gray-400">{nba.reason}</p>
              </>
            ) : (
              <p className="text-gray-500">—</p>
            )}
          </Section>
        </div>
      )}
    </div>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="mb-3 last:mb-0">
      <h4 className="mb-1 font-semibold text-gray-200">{title}</h4>
      {children}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-gray-500">{label}</span>
      <span className="truncate text-right">{value}</span>
    </div>
  )
}

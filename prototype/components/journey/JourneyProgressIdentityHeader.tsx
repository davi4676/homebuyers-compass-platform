'use client'

import { useEffect, useMemo, useState } from 'react'
import type { User } from '@/lib/types/auth'
import type { UserSnapshot } from '@/lib/user-snapshot'
import {
  getJourneyDayNumber,
  isJourneyConfettiMilestoneDay,
  resolveSavingsProgress,
} from '@/lib/journey-progress-identity'
import JourneyConfettiBurst from '@/components/journey/JourneyConfettiBurst'
import SavingsMomentumBar from '@/components/journey/SavingsMomentumBar'

const GUEST_JOURNEY_START_LS = 'nq_journey_start_guest'

type Props = {
  user: User | null
  snapshot: UserSnapshot | null
  className?: string
}

function resolveJourneyStartIso(user: User | null, guestFallback: string | null): string | null {
  if (user?.journeyStartDate) return user.journeyStartDate
  if (user?.createdAt) return user.createdAt
  if (!user && guestFallback) return guestFallback
  return null
}

export default function JourneyProgressIdentityHeader({ user, snapshot, className = '' }: Props) {
  const [guestStart, setGuestStart] = useState<string | null>(null)

  useEffect(() => {
    if (user?.journeyStartDate || user?.createdAt) return
    try {
      let g = localStorage.getItem(GUEST_JOURNEY_START_LS)
      if (!g) {
        g = new Date().toISOString()
        localStorage.setItem(GUEST_JOURNEY_START_LS, g)
      }
      setGuestStart(g)
    } catch {
      setGuestStart(new Date().toISOString())
    }
  }, [user?.journeyStartDate, user?.createdAt, user])

  const startIso = useMemo(
    () => resolveJourneyStartIso(user, guestStart),
    [user, guestStart]
  )
  const dayN = useMemo(() => getJourneyDayNumber(startIso), [startIso])
  const firstName = user?.firstName?.trim() || 'friend'
  const confetti = isJourneyConfettiMilestoneDay(dayN)
  const { current, goal } = resolveSavingsProgress(user, snapshot)

  return (
    <div className={`relative space-y-4 ${className}`}>
      <div className="relative px-1">
        {confetti ? <JourneyConfettiBurst active burstKey={dayN} /> : null}
        <p
          className="relative z-10 text-[22px] leading-snug"
          style={{
            fontFamily: 'var(--font-dm-serif), "DM Serif Display", Georgia, serif',
            color: 'var(--primary)',
            fontWeight: 400,
          }}
        >
          Day {dayN} of your homebuying journey, {firstName}
        </p>
      </div>
      <SavingsMomentumBar current={current} goal={goal} />
    </div>
  )
}

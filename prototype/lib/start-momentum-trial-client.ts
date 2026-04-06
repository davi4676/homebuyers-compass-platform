'use client'

import { startMomentumTrialLocal } from '@/lib/user-tracking'
import { track } from '@/lib/analytics'

export async function startMomentumTrialFromUi(
  source: 'quiz_result' | 'phase_lock' | 'upgrades_tab',
  navigate: (href: string) => void
) {
  track.trialStarted(source)
  startMomentumTrialLocal()
  try {
    await fetch('/api/trial/momentum/start', { method: 'POST', credentials: 'include' })
  } catch {
    /* optional when anonymous */
  }
  navigate('/customized-journey')
}

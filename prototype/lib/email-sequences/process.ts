/**
 * Cron-driven processors for onboarding and re-engagement sequences.
 */

import { findUserById, updateUser, type StoredUser } from '@/lib/user-store'
import { getProductivitySummary } from '@/lib/db/activity'
import { ONBOARDING_STEP_DAYS, sendOnboardingStep } from '@/lib/email-sequences/onboarding'
import { sendReengagementStep } from '@/lib/email-sequences/reengagement'
import { sendMomentumTrialEndingEmail } from '@/lib/email-sequences/momentum-trial'

const MS_DAY = 86_400_000

function daysSince(iso: string): number {
  const t = new Date(iso).getTime()
  return Math.floor((Date.now() - t) / MS_DAY)
}

/**
 * Send any due onboarding emails (steps 0–4). Step 0 is also sent from POST /onboarding-start;
 * cron picks up missed steps or users who only have state from older builds.
 */
export async function processOnboardingDue(user: StoredUser): Promise<{ sent: boolean; step?: number }> {
  const seq = user.emailSequences?.onboarding
  if (!seq?.startedAt) return { sent: false }

  const started = seq.startedAt
  const sentSet = new Set(seq.stepsSent ?? [])
  const elapsed = daysSince(started)

  for (let i = 0; i < ONBOARDING_STEP_DAYS.length; i++) {
    if (sentSet.has(i)) continue
    if (elapsed < ONBOARDING_STEP_DAYS[i]) continue

    const r = await sendOnboardingStep(user.email, i, user.firstName)
    if (!r.ok) {
      console.warn('[email] onboarding step failed', user.id, i, r.message)
      return { sent: false }
    }
    sentSet.add(i)
    updateUser(user.id, {
      emailSequences: {
        ...user.emailSequences,
        onboarding: { startedAt: started, stepsSent: Array.from(sentSet).sort((a, b) => a - b) },
      },
    })
    return { sent: true, step: i }
  }

  return { sent: false }
}

/**
 * Win-back: 3 emails when marketing is on — at 7d, 10d, 14d of inactivity (one per threshold).
 */
export async function processReengagementDue(user: StoredUser): Promise<{ sent: boolean; step?: number }> {
  if (!user.marketingEmailsOptIn) return { sent: false }

  const summary = getProductivitySummary(user.id)
  const last = summary.lastActiveAt
  if (!last) return { sent: false }

  const inactiveDays = daysSince(last)

  if (inactiveDays < 7) {
    if ((user.emailSequences?.reengagement?.sent ?? 0) > 0) {
      updateUser(user.id, {
        emailSequences: { ...user.emailSequences, reengagement: { sent: 0 } },
      })
    }
    return { sent: false }
  }

  const done = user.emailSequences?.reengagement?.sent ?? 0
  if (done >= 3) return { sent: false }

  let step: number | null = null
  if (done === 0 && inactiveDays >= 7) step = 0
  else if (done === 1 && inactiveDays >= 10) step = 1
  else if (done === 2 && inactiveDays >= 14) step = 2

  if (step === null) return { sent: false }

  const r = await sendReengagementStep(user.email, step, user.firstName)
  if (!r.ok) {
    console.warn('[email] reengagement failed', user.id, step, r.message)
    return { sent: false }
  }

  updateUser(user.id, {
    emailSequences: {
      ...user.emailSequences,
      reengagement: { sent: done + 1 },
    },
  })
  return { sent: true, step }
}

const MOMENTUM_TRIAL_DAYS = 7

/**
 * Momentum 7-day trial: day 5+ email (once); day 7+ downgrade if no Stripe subscription.
 */
export async function processMomentumTrialDue(user: StoredUser): Promise<{
  sent?: 'trial_ending'
  downgraded?: boolean
}> {
  const trial = user.momentumTrial
  if (!trial?.startedAt) return {}

  if (user.stripeSubscriptionId) {
    if (user.momentumTrial) {
      updateUser(user.id, { momentumTrial: undefined })
    }
    return {}
  }

  const elapsedDays = daysSince(trial.startedAt)

  if (elapsedDays >= 5 && elapsedDays < MOMENTUM_TRIAL_DAYS && !trial.endingEmailSent) {
    const r = await sendMomentumTrialEndingEmail(user.email, user.firstName)
    if (!r.ok) {
      console.warn('[email] momentum trial ending failed', user.id, r.message)
      return {}
    }
    updateUser(user.id, {
      momentumTrial: { ...trial, endingEmailSent: true },
    })
    return { sent: 'trial_ending' }
  }

  if (elapsedDays >= MOMENTUM_TRIAL_DAYS) {
    updateUser(user.id, {
      subscriptionTier: 'foundations',
      momentumTrial: undefined,
    })
    return { downgraded: true }
  }

  return {}
}

export async function runAllEmailSequenceJobs(users: StoredUser[]): Promise<{
  onboarding: number
  reengagement: number
  momentumTrialEmails: number
  momentumTrialDowngrades: number
}> {
  let onboarding = 0
  let reengagement = 0
  let momentumTrialEmails = 0
  let momentumTrialDowngrades = 0
  for (const u of users) {
    const o = await processOnboardingDue(u)
    if (o.sent) onboarding++
    let fresh = findUserById(u.id) ?? u
    const r = await processReengagementDue(fresh)
    if (r.sent) reengagement++
    fresh = findUserById(u.id) ?? fresh
    const m = await processMomentumTrialDue(fresh)
    if (m.sent === 'trial_ending') momentumTrialEmails++
    if (m.downgraded) momentumTrialDowngrades++
  }
  return { onboarding, reengagement, momentumTrialEmails, momentumTrialDowngrades }
}

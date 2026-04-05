/**
 * Time-gated in-app “email” cards for the customized journey (localStorage).
 */

export type OnboardingNotificationCta =
  | { label: string; tab: 'overview' | 'budget' | 'assistance' | 'phase' }
  | { label: string; href: string }
  | { label: string; action: 'referral' }

export type OnboardingNotificationDef = {
  id: string
  triggerAfterMs: number
  title: string
  body: string
  cta: OnboardingNotificationCta
}

export const ONBOARDING_NOTIFICATIONS: OnboardingNotificationDef[] = [
  {
    id: 'welcome',
    triggerAfterMs: 0,
    title: "Welcome to NestQuest — here's where to start",
    body: 'Your personalized journey is ready. Start with the Budget Sketch to see exactly what you can afford.',
    cta: { label: 'Open Budget Sketch →', tab: 'budget' },
  },
  {
    id: 'dpa-programs',
    triggerAfterMs: 24 * 60 * 60 * 1000,
    title: 'You may qualify for $8,500 in down payment assistance',
    body: "We've matched 3 programs to your profile. Check the Assistance tab to see them.",
    cta: { label: 'See My Programs →', tab: 'assistance' },
  },
  {
    id: 'hosa-score',
    triggerAfterMs: 3 * 24 * 60 * 60 * 1000,
    title: 'Your HOSA Savings Score is ready',
    body: "We've calculated your optimization score. Upgrade to Momentum to see your full breakdown and action plan.",
    cta: { label: 'See My Score →', href: '/upgrade' },
  },
  {
    id: 'streak',
    triggerAfterMs: 7 * 24 * 60 * 60 * 1000,
    title: "You're on a 7-day streak 🔥",
    body: "You've been working on your home buying journey for a week. Keep it up — buyers who stay consistent close 40% faster.",
    cta: { label: 'Continue My Journey →', tab: 'phase' },
  },
  {
    id: 'referral',
    triggerAfterMs: 14 * 24 * 60 * 60 * 1000,
    title: 'Know someone buying a home?',
    body: 'Refer a friend to NestQuest and you both get $50 off your next plan.',
    cta: { label: 'Share My Link →', action: 'referral' },
  },
]

export const JOURNEY_FIRST_VISIT_AT_KEY = 'nq_journey_first_visit_at'
export const ONBOARDING_NOTIFICATION_DISMISSED_PREFIX = 'nq_onboarding_notify_dismissed:'

export function getJourneyFirstVisitAtMs(): number {
  if (typeof window === 'undefined') return Date.now()
  try {
    const raw = localStorage.getItem(JOURNEY_FIRST_VISIT_AT_KEY)
    if (raw) return parseInt(raw, 10) || Date.now()
    const now = Date.now()
    localStorage.setItem(JOURNEY_FIRST_VISIT_AT_KEY, String(now))
    return now
  } catch {
    return Date.now()
  }
}

export function isOnboardingNotificationDismissed(id: string): boolean {
  if (typeof window === 'undefined') return false
  try {
    return localStorage.getItem(`${ONBOARDING_NOTIFICATION_DISMISSED_PREFIX}${id}`) === '1'
  } catch {
    return false
  }
}

export function dismissOnboardingNotification(id: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(`${ONBOARDING_NOTIFICATION_DISMISSED_PREFIX}${id}`, '1')
  } catch {
    /* ignore */
  }
}

/** Next notification that should show based on elapsed time since first visit and dismissals. */
export function getActiveOnboardingNotification(now: number = Date.now()): OnboardingNotificationDef | null {
  if (typeof window === 'undefined') return null
  const started = getJourneyFirstVisitAtMs()
  const elapsed = now - started
  for (const n of ONBOARDING_NOTIFICATIONS) {
    if (isOnboardingNotificationDismissed(n.id)) continue
    if (elapsed >= n.triggerAfterMs) return n
  }
  return null
}

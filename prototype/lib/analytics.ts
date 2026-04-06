import { applyMomentumTrialExpiryIfNeeded } from '@/lib/user-tracking'

type PostHogClient = typeof import('posthog-js').default

let posthogClient: PostHogClient | null = null
let initPromise: Promise<void> | null = null

function ensurePosthog(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim()
  if (!key) return Promise.resolve()
  if (posthogClient) return Promise.resolve()
  if (initPromise) return initPromise
  initPromise = import('posthog-js').then((m) => {
    posthogClient = m.default
    posthogClient.init(key, {
      api_host: 'https://app.posthog.com',
      capture_pageview: true,
    })
  })
  return initPromise
}

/** Client-only: loads posthog-js dynamically (no SSR evaluation of browser SDK). */
export function initAnalytics() {
  void ensurePosthog()
}

function capture(event: string, props?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim()) return
  void ensurePosthog().then(() => {
    posthogClient?.capture(event, props)
  })
}

/** Run after init on the client when trial may have lapsed between visits. */
export function trackTrialExpiredIfDowngradedClient() {
  if (typeof window === 'undefined') return
  const pre = localStorage.getItem('userTier')
  applyMomentumTrialExpiryIfNeeded()
  const post = localStorage.getItem('userTier')
  if (pre === 'momentum' && post === 'foundations') {
    capture('trial_expired', { converted: false })
  }
}

export const track = {
  quizCompleted: (icpType: string) => capture('quiz_completed', { icp_type: icpType }),

  journeyEntered: (icpType: string) => capture('journey_entered', { icp_type: icpType }),

  trialStarted: (
    source: 'quiz_result' | 'phase_lock' | 'upgrades_tab' | 'upgrade_page'
  ) => capture('trial_started', { source }),

  subscriptionConverted: (tier: string, mrr: number) =>
    capture('subscription_converted', { tier, mrr }),

  dpaReportPurchased: (amount: number) => capture('dpa_report_purchased', { dpa_amount: amount }),

  certificatePurchased: () => capture('certificate_purchased'),

  milestoneGateSeen: (gateType: string) => capture('milestone_gate_seen', { gate_type: gateType }),

  milestoneGateConverted: (gateType: string) =>
    capture('milestone_gate_converted', { gate_type: gateType }),

  trialExpired: (converted: boolean) => capture('trial_expired', { converted }),

  lenderLeadGenerated: (icpType: string) => capture('lender_lead_generated', { icp_type: icpType }),
}

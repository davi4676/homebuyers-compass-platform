'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Check,
  ArrowRight,
  Sparkles,
  Lock,
  Zap,
  Shield,
  Crown,
  TrendingUp,
  Calculator,
  FileText,
  Calendar,
  Users,
  MessageSquare,
  Phone,
  Star,
  X,
} from 'lucide-react'
import Link from 'next/link'
import {
  TIER_DEFINITIONS,
  type UserTier,
  TIER_ORDER,
  formatTierPriceForCycle,
  type TierBillingDisplayCycle,
} from '@/lib/tiers'
import {
  getMomentumTrialInfo,
  getUserTier,
  startMomentumTrialLocal,
} from '@/lib/user-tracking'
import { trackActivity } from '@/lib/track-activity'
import BackToMyJourneyLink from '@/components/BackToMyJourneyLink'
import { startSubscriptionPauseLocal, type PauseMonths } from '@/lib/subscription-pause'
import { cn } from '@/lib/design-system'
import { useAuth } from '@/lib/hooks/useAuth'
import { isStripePublishableConfigured } from '@/lib/stripe-public'

const ANNUAL_CARD_PROMO: Partial<Record<UserTier, { equiv: string; save: string }>> = {
  momentum: { equiv: '$23/mo', save: 'Save $70/year' },
  navigator: { equiv: '$47/mo', save: 'Save $142/year' },
  navigator_plus: { equiv: '$119/mo', save: 'Save $358/year' },
}

const WAITLIST_LS = 'nestquest_upgrade_waitlist'
const RETENTION_FREE_MONTH_LS = 'nestquest_retention_free_month_credit'

function pushUpgradeWaitlist(email: string, tier: UserTier) {
  try {
    const raw = localStorage.getItem(WAITLIST_LS)
    const arr = (raw ? JSON.parse(raw) : []) as { email: string; tier: UserTier; at: string }[]
    arr.push({ email: email.trim(), tier, at: new Date().toISOString() })
    localStorage.setItem(WAITLIST_LS, JSON.stringify(arr))
  } catch {
    /* ignore */
  }
}

function CardWaitlistForm({ tier }: { tier: UserTier }) {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)
  if (done) {
    return <p className="text-center text-sm font-semibold text-teal-800">You&apos;re on the list — we&apos;ll notify you soon.</p>
  }
  return (
    <form
      className="space-y-2"
      onSubmit={(e) => {
        e.preventDefault()
        if (!email.trim()) return
        pushUpgradeWaitlist(email, tier)
        setDone(true)
      }}
    >
      <input
        type="email"
        required
        autoComplete="email"
        placeholder="Email for waitlist"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
      />
      <button
        type="submit"
        className="w-full rounded-xl bg-slate-800 py-3 text-sm font-semibold text-white hover:bg-slate-900"
      >
        Join Waitlist
      </button>
      <p className="text-center text-xs text-slate-500">Payment checkout is being configured.</p>
    </form>
  )
}

function FooterWaitlistForm({ defaultTier }: { defaultTier: UserTier }) {
  const [email, setEmail] = useState('')
  const [tier, setTier] = useState<UserTier>(defaultTier === 'foundations' ? 'momentum' : defaultTier)
  const [done, setDone] = useState(false)
  const paidTiers = TIER_ORDER.filter((t) => t !== 'foundations')
  if (done) {
    return <p className="text-center font-semibold text-teal-800">Thanks — you&apos;re on the waitlist.</p>
  }
  return (
    <form
      className="mx-auto flex max-w-md flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault()
        if (!email.trim()) return
        pushUpgradeWaitlist(email, tier)
        setDone(true)
      }}
    >
      <select
        value={tier}
        onChange={(e) => setTier(e.target.value as UserTier)}
        className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
      >
        {paidTiers.map((t) => (
          <option key={t} value={t}>
            {TIER_DEFINITIONS[t].name}
          </option>
        ))}
      </select>
      <input
        type="email"
        required
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
      />
      <button
        type="submit"
        className="rounded-xl bg-slate-800 py-3 text-sm font-semibold text-white hover:bg-slate-900"
      >
        Join Waitlist
      </button>
    </form>
  )
}

/** Unicode + explicit colors — Lucide SVGs in <td> were not reliably visible in all table layouts. */
function ComparisonCheckMark() {
  return (
    <span
      className="inline-flex min-h-[1.25rem] w-full items-center justify-center text-base font-semibold leading-none text-green-600"
      aria-label="Included"
    >
      {'\u2713'}
    </span>
  )
}

function ComparisonEmDash() {
  return (
    <span
      className="inline-flex min-h-[1.25rem] w-full items-center justify-center text-base font-normal leading-none text-gray-300"
      aria-label="Not included"
    >
      {'\u2014'}
    </span>
  )
}

/** Matches “Most popular for active buyers” on the Momentum tier card. */
const COMPARISON_HIGHLIGHT_TIER: UserTier = 'momentum'

export default function UpgradePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const targetTier = (searchParams.get('tier') || 'momentum') as UserTier
  const [selectedTier, setSelectedTier] = useState<UserTier>(targetTier)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')
  const stripeReady = isStripePublishableConfigured()

  const [currentTier, setCurrentTier] = useState<UserTier>('foundations')
  const [churnModalOpen, setChurnModalOpen] = useState(false)
  const [churnStep, setChurnStep] = useState<'pick' | 'pause' | 'cancel-offer' | 'done'>('pick')
  const [pauseMonths, setPauseMonths] = useState<PauseMonths>(1)
  const [pauseMessage, setPauseMessage] = useState<string | null>(null)
  const [trialUi, setTrialUi] = useState(() =>
    typeof window === 'undefined'
      ? { onTrial: false, paid: false, endsAtIso: null as string | null, daysRemaining: 0 }
      : getMomentumTrialInfo()
  )

  const bumpTierAndTrial = () => {
    setCurrentTier(getUserTier())
    setTrialUi(getMomentumTrialInfo())
  }

  useEffect(() => {
    bumpTierAndTrial()
    const onTier = () => bumpTierAndTrial()
    window.addEventListener('tierChanged', onTier)
    return () => window.removeEventListener('tierChanged', onTier)
  }, [])

  const tiers = TIER_ORDER
  const selectedTierDef = TIER_DEFINITIONS[selectedTier]

  const handleUpgrade = (tier?: UserTier) => {
    const tierToUpgrade = tier || selectedTier

    if (tierToUpgrade === 'foundations') return
    if (!stripeReady) return

    trackActivity('tool_used', {
      tool: 'upgrade_plan_selected',
      tier: tierToUpgrade,
      billingCycle,
      source: 'upgrade_page',
    })

    // Paid tier: send to payment page (Stripe) so they can complete purchase
    const cycleParam = billingCycle === 'annual' ? 'yearly' : 'monthly'
    router.push(`/payment?tier=${tierToUpgrade}&cycle=${cycleParam}`)
  }

  const handleStartMomentumTrial = async () => {
    trackActivity('tool_used', {
      tool: 'momentum_trial_started',
      source: 'upgrade_page',
      authenticated: isAuthenticated,
    })
    startMomentumTrialLocal()
    try {
      await fetch('/api/trial/momentum/start', { method: 'POST', credentials: 'include' })
    } catch {
      /* server sync optional for anonymous users */
    }
    bumpTierAndTrial()
    router.push('/customized-journey')
  }

  const getTierIcon = (tier: UserTier) => {
    switch (tier) {
      case 'foundations':
        return <Sparkles className="w-6 h-6" />
      case 'momentum':
        return <Zap className="w-6 h-6" />
      case 'navigator':
        return <Shield className="w-6 h-6" />
      case 'navigator_plus':
        return <Crown className="w-6 h-6" />
      default:
        return <Sparkles className="w-6 h-6" />
    }
  }

  const getTierColor = (tier: UserTier) => {
    switch (tier) {
      case 'foundations':
        return 'text-[#78716c]'
      case 'momentum':
        return 'text-[#0d9488]'
      case 'navigator':
        return 'text-[#f97316]'
      case 'navigator_plus':
        return 'text-[#D4AF37]'
      default:
        return 'text-[#78716c]'
    }
  }

  const getTierBgColor = (tier: UserTier) => {
    switch (tier) {
      case 'foundations':
        return 'bg-slate-50 border-slate-200'
      case 'momentum':
        return 'bg-[#0d9488]/10 border-[#0d9488]'
      case 'navigator':
        return 'bg-[#f97316]/10 border-[#f97316]'
      case 'navigator_plus':
        return 'bg-[#D4AF37]/10 border-[#D4AF37]'
      default:
        return 'bg-slate-50 border-slate-200'
    }
  }

  return (
    <div className="app-page-shell">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <BackToMyJourneyLink />
        </div>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-4 text-[#1c1917]">
            Choose Your Plan
          </h1>
          <p className="text-xl text-[#57534e] max-w-2xl mx-auto">
            Unlock powerful tools to save thousands on your home purchase
          </p>
          <p className="mt-4 text-base font-medium text-[#0f766e] max-w-xl mx-auto">
            Momentum includes a <strong className="font-semibold text-[#0d9488]">7-day free trial</strong> — no credit
            card required. We&apos;ll email you before it ends; after day 7 you&apos;ll move to Foundations unless you
            subscribe.
          </p>
          {trialUi.onTrial && currentTier === 'momentum' ? (
            <div
              className="mt-6 mx-auto max-w-lg rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
              role="status"
            >
              <span className="font-semibold">Momentum trial active</span> —{' '}
              {trialUi.daysRemaining} day{trialUi.daysRemaining === 1 ? '' : 's'} left. Day 5: we email what you&apos;ll
              lose; day 7: back to Foundations without payment.{' '}
              <Link href="/payment?tier=momentum&cycle=monthly" className="font-semibold text-[#0d9488] underline">
                Keep Momentum
              </Link>
            </div>
          ) : null}
        </motion.div>

        {/* Billing Toggle */}
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-3 w-full max-w-lg rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-center text-sm font-medium text-emerald-900">
            <span aria-hidden>💡</span> Annual plans save you up to $358/year
          </div>
          <div className="flex flex-wrap justify-center gap-1 rounded-lg border border-[#e7e5e4] bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`rounded-md px-4 py-2 text-sm font-semibold transition-all sm:px-5 ${
                billingCycle === 'monthly'
                  ? 'bg-[#0d9488] text-white'
                  : 'text-[#57534e] hover:text-[#1c1917]'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('annual')}
              className={`relative rounded-md px-4 py-2 text-sm font-semibold transition-all sm:px-5 ${
                billingCycle === 'annual'
                  ? 'bg-[#0d9488] text-white'
                  : 'text-[#57534e] hover:text-[#1c1917]'
              }`}
            >
              Annual
              <span
                className={`ml-1.5 inline-block rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                  billingCycle === 'annual'
                    ? 'bg-white/25 text-white'
                    : 'bg-amber-100 text-amber-900'
                }`}
              >
                Save 20%
              </span>
            </button>
          </div>
          <p className="mt-4 max-w-xl text-center text-sm leading-relaxed text-[#57534e]">
            <strong className="font-semibold text-[#44403c]">Monthly</strong> fits buyers who want flexibility.{' '}
            <strong className="font-semibold text-[#44403c]">Annual</strong> is billed once per year with{' '}
            <strong className="font-semibold text-[#44403c]">20% off</strong> the monthly×12 rate (shown as a monthly
            equivalent on each plan).
          </p>
        </div>

        {/* Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {tiers.map((tier) => {
            const tierDef = TIER_DEFINITIONS[tier]
            const displayCycle: TierBillingDisplayCycle =
              billingCycle === 'annual' ? 'annual' : 'monthly'
            const priceLabel = formatTierPriceForCycle(tierDef, displayCycle)
            const isSelected = selectedTier === tier
            const isFree = tier === 'foundations'
            const isCurrentTier = currentTier === tier

            return (
              <motion.div
                key={tier}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: tiers.indexOf(tier) * 0.1 }}
                onClick={(e) => {
                  if (!isFree) {
                    if ((e.target as HTMLElement).closest('button')) {
                      return
                    }
                    setSelectedTier(tier)
                    if (stripeReady) handleUpgrade(tier)
                  }
                }}
                className={`relative rounded-xl border-2 p-6 cursor-pointer transition-all shadow-sm ${
                  isSelected && !isFree
                    ? `${getTierBgColor(tier)} border-2 scale-105`
                    : isCurrentTier
                      ? 'bg-[#ecfdf5] border-[#1a6b3c]'
                      : 'bg-white border-[#e7e5e4] hover:border-[#0d9488]/50'
                } ${isFree && !isCurrentTier ? 'opacity-60 cursor-not-allowed' : ''} ${
                  isFree && isCurrentTier ? 'cursor-default' : ''
                }`}
              >
                {isCurrentTier && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-green-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                      Current Plan
                    </div>
                  </div>
                )}
                {isSelected && !isFree && !isCurrentTier && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-[#0d9488] text-white px-4 py-1 rounded-full text-sm font-bold">
                      Selected
                    </div>
                  </div>
                )}
                {tier === 'momentum' && !isFree ? (
                  <div className="absolute -right-1 top-10 z-10 max-w-[11rem] sm:right-2 sm:top-12 sm:max-w-[13rem]">
                    <span className="mb-1 inline-block w-full rounded-lg bg-amber-100 px-2 py-1 text-center text-[10px] font-bold uppercase leading-tight text-amber-950 ring-1 ring-amber-300/60 sm:text-xs">
                      7-day free trial
                    </span>
                    {billingCycle === 'monthly' ? (
                      <span className="inline-block w-full rounded-lg bg-[#0f766e] px-2.5 py-1 text-center text-[10px] font-bold uppercase leading-tight text-white shadow-md ring-1 ring-teal-900/20 sm:text-xs">
                        Most popular for active buyers
                      </span>
                    ) : null}
                  </div>
                ) : null}
                {tier === 'navigator_plus' ? (
                  <div className="absolute -right-1 top-12 z-10 max-w-[11.5rem] sm:right-2 sm:top-14 sm:max-w-[13.5rem]">
                    <span className="inline-block rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-center text-[10px] font-semibold leading-tight text-amber-900 shadow-sm ring-1 ring-amber-900/10 sm:text-xs">
                      ⚡ Most buyers start here before pre-approval
                    </span>
                  </div>
                ) : null}

                <div className="flex items-center gap-3 mb-4">
                  <div className={getTierColor(tier)}>
                    {getTierIcon(tier)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{tierDef.name}</h3>
                    <p className="text-sm text-[#57534e] italic">{tierDef.mindset}</p>
                  </div>
                </div>

                <div className="mb-6">
                  {isFree ? (
                    <>
                      <div className="text-3xl font-bold">{priceLabel}</div>
                      <p className="mt-1 text-sm text-[#57534e]">{tierDef.description}</p>
                    </>
                  ) : billingCycle === 'annual' && ANNUAL_CARD_PROMO[tier] ? (
                    <>
                      <div className="text-3xl font-bold text-[#1c1917]">{ANNUAL_CARD_PROMO[tier]!.equiv}</div>
                      <p className="mt-0.5 text-xs font-medium text-slate-600">billed annually</p>
                      <p className="mt-2 inline-flex rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 ring-1 ring-emerald-200">
                        {ANNUAL_CARD_PROMO[tier]!.save}
                      </p>
                      <p className="mt-2 text-xs leading-snug text-[#57534e]">{tierDef.price.annualBlurb}</p>
                      {tierDef.price.displayAnnual ? (
                        <p className="mt-1 text-xs font-medium text-[#57534e]">{tierDef.price.displayAnnual}</p>
                      ) : null}
                      {tierDef.price.displayMonthly ? (
                        <p className="mt-1 text-xs text-[#57534e]">
                          Or {tierDef.price.displayMonthly} month-to-month
                        </p>
                      ) : null}
                      <p className="mt-2 text-sm text-[#57534e]">{tierDef.description}</p>
                    </>
                  ) : (
                    <>
                      <div className="text-3xl font-bold">{priceLabel}</div>
                      <p className="mt-1 text-sm text-[#57534e]">{tierDef.description}</p>
                    </>
                  )}
                </div>

                <ul className="space-y-2 mb-6">
                  {isFree &&
                    tierDef.journeyHighlights.map((line) => (
                      <li key={line} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 shrink-0 text-[#0d9488]" />
                        <span>{line}</span>
                      </li>
                    ))}
                  {!isFree && (
                    <>
                      {tierDef.features.hosa.optimizationScore && (
                        <li className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-[#0d9488]" />
                          <span>HOSA Optimization Score</span>
                        </li>
                      )}
                      {tierDef.features.hosa.savingsOpportunities > 0 && (
                        <li className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-[#0d9488]" />
                          <span>
                            {tierDef.features.hosa.savingsOpportunities === Infinity
                              ? 'Unlimited'
                              : tierDef.features.hosa.savingsOpportunities}{' '}
                            Savings Opportunities
                          </span>
                        </li>
                      )}
                      {tierDef.features.hosa.actionPlan && (
                        <li className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-[#0d9488]" />
                          <span>Personalized Action Plan</span>
                        </li>
                      )}
                      {tierDef.features.hosa.weekByWeekPlan && (
                        <li className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-[#0d9488]" />
                          <span>Week-by-Week Plan</span>
                        </li>
                      )}
                      {tierDef.features.personalizedJourney && (
                        <li className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-[#0d9488]" />
                          <span>Personalized Journey / Roadmap</span>
                        </li>
                      )}
                      {tierDef.features.mortgageShopping && (
                        <li className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-[#0d9488]" />
                          <span>Mortgage Shopping Roadmap</span>
                        </li>
                      )}
                      {tierDef.features.tools.calculators.length > 0 && (
                        <li className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-[#0d9488]" />
                          <span>{tierDef.features.tools.calculators.length} Calculators</span>
                        </li>
                      )}
                      {tierDef.features.tools.lenderComparison && (
                        <li className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-[#0d9488]" />
                          <span>Lender Comparison</span>
                        </li>
                      )}
                      {tierDef.features.tools.dealAnalyzer && (
                        <li className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-[#0d9488]" />
                          <span>Deal Analyzer</span>
                        </li>
                      )}
                      {tierDef.features.tools.documentVault && (
                        <li className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-[#0d9488]" />
                          <span>Document Vault</span>
                        </li>
                      )}
                      {tierDef.features.tools.timelineOrchestrator && (
                        <li className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-[#0d9488]" />
                          <span>Timeline Orchestrator</span>
                        </li>
                      )}
                      {tierDef.features.aiAssistant.enabled && (
                        <li className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-[#0d9488]" />
                          <span>
                            AI Assistant
                            {tierDef.features.aiAssistant.dailyMessageLimit === Infinity
                              ? ' (unlimited)'
                              : ` (${tierDef.features.aiAssistant.dailyMessageLimit}/day)`}
                          </span>
                        </li>
                      )}
                      {tierDef.features.gamification.xp && (
                        <li className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-[#0d9488]" />
                          <span>
                            Gamification
                            {tierDef.features.gamification.leaderboard ? ' (XP, badges, streaks, leaderboard)' : ' (XP, badges, levels)'}
                          </span>
                        </li>
                      )}
                      {tierDef.features.content.scripts > 0 && (
                        <li className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-[#0d9488]" />
                          <span>{tierDef.features.content.scripts} Negotiation Scripts</span>
                        </li>
                      )}
                      {tierDef.features.content.guides && (
                        <li className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-[#0d9488]" />
                          <span>Guides & Templates</span>
                        </li>
                      )}
                      {tierDef.features.support.expertAccess && (
                        <li className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-[#0d9488]" />
                          <span>Dedicated Expert</span>
                        </li>
                      )}
                      {tierDef.features.crowdsourcedDownPayment.enabled && (
                        <li className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-[#0d9488]" />
                          <span>Crowdsourced Down Payment Platform</span>
                        </li>
                      )}
                    </>
                  )}
                </ul>

                {!isFree && !isCurrentTier && (
                  <div className="space-y-2">
                    {!stripeReady ? (
                      <CardWaitlistForm tier={tier} />
                    ) : tier === 'momentum' && !isCurrentTier ? (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedTier(tier)
                            handleUpgrade(tier)
                          }}
                          className="w-full rounded-xl bg-[#0d9488] py-3 font-semibold text-white transition-all hover:bg-[#0f766e]"
                        >
                          Start Free Trial →
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedTier(tier)
                            void handleStartMomentumTrial()
                          }}
                          className="w-full rounded-xl border border-slate-200 bg-white py-2 text-sm font-medium text-[#57534e] hover:bg-slate-50"
                        >
                          Try without a card (7 days)
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedTier(tier)
                          handleUpgrade(tier)
                        }}
                        className={`w-full rounded-xl py-3 font-semibold transition-all ${
                          isSelected
                            ? 'bg-[#0d9488] text-white hover:bg-[#0f766e]'
                            : 'border border-[#e7e5e4] bg-[#fafaf9] text-[#44403c] hover:bg-[#f5f5f4]'
                        }`}
                      >
                        {isSelected ? 'Selected' : 'Select Plan'}
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Feature Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12 rounded-xl border border-[#e7e5e4] bg-white p-8 shadow-sm"
        >
          <h2 className="font-display text-3xl font-bold mb-6 text-center text-[#1c1917]">Feature Comparison</h2>
          <div className="max-h-[min(75vh,720px)] overflow-auto rounded-lg border border-[#e7e5e4]">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#e7e5e4]">
                  <th
                    scope="col"
                    className="sticky top-0 z-20 bg-white py-4 pl-4 pr-2 text-left font-semibold text-[#1c1917] shadow-[0_1px_0_0_#e7e5e4]"
                  >
                    Feature
                  </th>
                  {tiers.map((tier) => (
                    <th
                      key={tier}
                      scope="col"
                      className={cn(
                        'sticky top-0 z-20 whitespace-nowrap bg-white px-3 py-4 text-center font-semibold text-[#1c1917] shadow-[0_1px_0_0_#e7e5e4]',
                        tier === COMPARISON_HIGHLIGHT_TIER &&
                          'border-l-2 border-l-teal-500 bg-teal-50/70 text-[#0f766e]'
                      )}
                    >
                      {TIER_DEFINITIONS[tier].name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#e7e5e4] odd:bg-white even:bg-gray-50">
                  <th scope="row" className="py-3 pl-4 pr-2 text-left font-normal text-[#44403c]">
                    HOSA / optimization score
                  </th>
                  {tiers.map((tier) => {
                    const h = TIER_DEFINITIONS[tier].features.hosa
                    const preview = h.savingsScorePreview === true
                    const full = h.optimizationScore === true
                    return (
                      <td
                        key={tier}
                        className={cn(
                          'px-3 py-3 text-center align-middle text-[#44403c]',
                          tier === COMPARISON_HIGHLIGHT_TIER && 'border-l-2 border-l-teal-500 bg-teal-50/30'
                        )}
                      >
                        {full ? (
                          <ComparisonCheckMark />
                        ) : preview ? (
                          <span className="font-semibold text-green-600">Preview</span>
                        ) : (
                          <ComparisonEmDash />
                        )}
                      </td>
                    )
                  })}
                </tr>
                <tr className="border-b border-[#e7e5e4] odd:bg-white even:bg-gray-50">
                  <th scope="row" className="py-3 pl-4 pr-2 text-left font-normal text-[#44403c]">
                    Savings Opportunities
                  </th>
                  {tiers.map((tier) => {
                    const count = TIER_DEFINITIONS[tier].features.hosa.savingsOpportunities
                    return (
                      <td
                        key={tier}
                        className={cn(
                          'px-3 py-3 text-center align-middle tabular-nums text-[#44403c]',
                          tier === COMPARISON_HIGHLIGHT_TIER && 'border-l-2 border-l-teal-500 bg-teal-50/30'
                        )}
                      >
                        {count === Infinity ? '∞' : count}
                      </td>
                    )
                  })}
                </tr>
                <tr className="border-b border-[#e7e5e4] odd:bg-white even:bg-gray-50">
                  <th scope="row" className="py-3 pl-4 pr-2 text-left font-normal text-[#44403c]">
                    Personalized Action Plan
                  </th>
                  {tiers.map((tier) => (
                    <td
                      key={tier}
                      className={cn(
                        'px-3 py-3 text-center align-middle',
                        tier === COMPARISON_HIGHLIGHT_TIER && 'border-l-2 border-l-teal-500 bg-teal-50/30'
                      )}
                    >
                      {TIER_DEFINITIONS[tier].features.hosa.actionPlan ? (
                        <ComparisonCheckMark />
                      ) : (
                        <ComparisonEmDash />
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-[#e7e5e4] odd:bg-white even:bg-gray-50">
                  <th scope="row" className="py-3 pl-4 pr-2 text-left font-normal text-[#44403c]">
                    Week-by-Week Plan
                  </th>
                  {tiers.map((tier) => (
                    <td
                      key={tier}
                      className={cn(
                        'px-3 py-3 text-center align-middle',
                        tier === COMPARISON_HIGHLIGHT_TIER && 'border-l-2 border-l-teal-500 bg-teal-50/30'
                      )}
                    >
                      {TIER_DEFINITIONS[tier].features.hosa.weekByWeekPlan ? (
                        <ComparisonCheckMark />
                      ) : (
                        <ComparisonEmDash />
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-[#e7e5e4] odd:bg-white even:bg-gray-50">
                  <th scope="row" className="py-3 pl-4 pr-2 text-left font-normal text-[#44403c]">
                    Personalized Journey / Roadmap
                  </th>
                  {tiers.map((tier) => (
                    <td
                      key={tier}
                      className={cn(
                        'px-3 py-3 text-center align-middle',
                        tier === COMPARISON_HIGHLIGHT_TIER && 'border-l-2 border-l-teal-500 bg-teal-50/30'
                      )}
                    >
                      {TIER_DEFINITIONS[tier].features.personalizedJourney ? (
                        <ComparisonCheckMark />
                      ) : (
                        <ComparisonEmDash />
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-[#e7e5e4] odd:bg-white even:bg-gray-50">
                  <th scope="row" className="py-3 pl-4 pr-2 text-left font-normal text-[#44403c]">
                    Calculators
                  </th>
                  {tiers.map((tier) => {
                    const n = TIER_DEFINITIONS[tier].features.tools.calculators.length
                    return (
                      <td
                        key={tier}
                        className={cn(
                          'px-3 py-3 text-center align-middle tabular-nums text-[#44403c]',
                          tier === COMPARISON_HIGHLIGHT_TIER && 'border-l-2 border-l-teal-500 bg-teal-50/30'
                        )}
                      >
                        {n}
                      </td>
                    )
                  })}
                </tr>
                <tr className="border-b border-[#e7e5e4] odd:bg-white even:bg-gray-50">
                  <th scope="row" className="py-3 pl-4 pr-2 text-left font-normal text-[#44403c]">
                    Lender Comparison
                  </th>
                  {tiers.map((tier) => (
                    <td
                      key={tier}
                      className={cn(
                        'px-3 py-3 text-center align-middle',
                        tier === COMPARISON_HIGHLIGHT_TIER && 'border-l-2 border-l-teal-500 bg-teal-50/30'
                      )}
                    >
                      {TIER_DEFINITIONS[tier].features.tools.lenderComparison ? (
                        <ComparisonCheckMark />
                      ) : (
                        <ComparisonEmDash />
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-[#e7e5e4] odd:bg-white even:bg-gray-50">
                  <th scope="row" className="py-3 pl-4 pr-2 text-left font-normal text-[#44403c]">
                    Deal Analyzer
                  </th>
                  {tiers.map((tier) => (
                    <td
                      key={tier}
                      className={cn(
                        'px-3 py-3 text-center align-middle',
                        tier === COMPARISON_HIGHLIGHT_TIER && 'border-l-2 border-l-teal-500 bg-teal-50/30'
                      )}
                    >
                      {TIER_DEFINITIONS[tier].features.tools.dealAnalyzer ? (
                        <ComparisonCheckMark />
                      ) : (
                        <ComparisonEmDash />
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-[#e7e5e4] odd:bg-white even:bg-gray-50">
                  <th scope="row" className="py-3 pl-4 pr-2 text-left font-normal text-[#44403c]">
                    Document Vault
                  </th>
                  {tiers.map((tier) => (
                    <td
                      key={tier}
                      className={cn(
                        'px-3 py-3 text-center align-middle',
                        tier === COMPARISON_HIGHLIGHT_TIER && 'border-l-2 border-l-teal-500 bg-teal-50/30'
                      )}
                    >
                      {TIER_DEFINITIONS[tier].features.tools.documentVault ? (
                        <ComparisonCheckMark />
                      ) : (
                        <ComparisonEmDash />
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-[#e7e5e4] odd:bg-white even:bg-gray-50">
                  <th scope="row" className="py-3 pl-4 pr-2 text-left font-normal text-[#44403c]">
                    AI Assistant
                  </th>
                  {tiers.map((tier) => {
                    const ai = TIER_DEFINITIONS[tier].features.aiAssistant
                    if (!ai.enabled) {
                      return (
                        <td
                          key={tier}
                          className={cn(
                            'px-3 py-3 text-center align-middle',
                            tier === COMPARISON_HIGHLIGHT_TIER && 'border-l-2 border-l-teal-500 bg-teal-50/30'
                          )}
                        >
                          <ComparisonEmDash />
                        </td>
                      )
                    }
                    const aiLabel =
                      ai.dailyMessageLimit === Infinity ? 'Unlimited' : `${ai.dailyMessageLimit}/day`
                    return (
                      <td
                        key={tier}
                        className={cn(
                          'px-3 py-3 text-center align-middle text-[#44403c]',
                          tier === COMPARISON_HIGHLIGHT_TIER && 'border-l-2 border-l-teal-500 bg-teal-50/30'
                        )}
                      >
                        {aiLabel}
                      </td>
                    )
                  })}
                </tr>
                <tr className="border-b border-[#e7e5e4] odd:bg-white even:bg-gray-50">
                  <th scope="row" className="py-3 pl-4 pr-2 text-left font-normal text-[#44403c]">
                    Crowdsourced Down Payment
                  </th>
                  {tiers.map((tier) => (
                    <td
                      key={tier}
                      className={cn(
                        'px-3 py-3 text-center align-middle',
                        tier === COMPARISON_HIGHLIGHT_TIER && 'border-l-2 border-l-teal-500 bg-teal-50/30'
                      )}
                    >
                      {TIER_DEFINITIONS[tier].features.crowdsourcedDownPayment.enabled ? (
                        <ComparisonCheckMark />
                      ) : (
                        <ComparisonEmDash />
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-[#e7e5e4] odd:bg-white even:bg-gray-50">
                  <th scope="row" className="py-3 pl-4 pr-2 text-left font-normal text-[#44403c]">
                    Dedicated Expert
                  </th>
                  {tiers.map((tier) => (
                    <td
                      key={tier}
                      className={cn(
                        'px-3 py-3 text-center align-middle',
                        tier === COMPARISON_HIGHLIGHT_TIER && 'border-l-2 border-l-teal-500 bg-teal-50/30'
                      )}
                    >
                      {TIER_DEFINITIONS[tier].features.support.expertAccess ? (
                        <ComparisonCheckMark />
                      ) : (
                        <ComparisonEmDash />
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="odd:bg-white even:bg-gray-50">
                  <th scope="row" className="py-3 pl-4 pr-2 text-left font-normal text-[#44403c]">
                    Support Response Time
                  </th>
                  {tiers.map((tier) => {
                    const rt = TIER_DEFINITIONS[tier].features.support.responseTime
                    const label =
                      rt === Infinity ? 'FAQ Only' : `${rt}h`
                    return (
                      <td
                        key={tier}
                        className={cn(
                          'px-3 py-3 text-center align-middle text-[#44403c]',
                          tier === COMPARISON_HIGHLIGHT_TIER && 'border-l-2 border-l-teal-500 bg-teal-50/30'
                        )}
                      >
                        {label}
                      </td>
                    )
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* CTA */}
        {selectedTier !== 'foundations' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-xl border border-[#0d9488]/25 bg-gradient-to-r from-[#0d9488]/10 to-[#0f766e]/10 p-8 text-center shadow-sm"
          >
            <h2 className="font-display text-3xl font-bold mb-4 text-[#1c1917]">
              Ready to Upgrade to {selectedTierDef.name}?
            </h2>
            <p className="mb-6 text-lg text-[#57534e]">
              {`Pricing: ${formatTierPriceForCycle(
                selectedTierDef,
                billingCycle === 'annual' ? 'annual' : 'monthly'
              )}`}
              {billingCycle === 'annual' ? (
                <span className="mt-1 block text-base font-normal text-[#57534e]">
                  Billed annually (20% off monthly×12)
                </span>
              ) : null}
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <p className="text-amber-800 font-semibold text-sm">
                ⏰ Every week without a plan costs you money.
              </p>
              <p className="text-amber-700 text-sm mt-1">
                Buyers who start NestQuest before pre-approval save an average of $2,400 more than those who start
                after. DPA programs in your state have limited funding — some close when their annual allocation runs
                out.
              </p>
            </div>
            {stripeReady ? (
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => handleUpgrade()}
                  className="flex items-center gap-2 rounded-xl bg-[#0d9488] px-8 py-4 text-lg font-semibold text-white transition-all hover:scale-105 hover:bg-[#0f766e]"
                >
                  {selectedTier === 'momentum' ? 'Start Free Trial →' : 'Upgrade Now'}{' '}
                  <ArrowRight className="h-5 w-5" />
                </button>
                <Link
                  href="/results"
                  className="rounded-xl border border-[#e7e5e4] bg-white px-8 py-4 text-lg font-semibold text-[#1c1917] transition-all hover:bg-[#f5f5f4]"
                >
                  Maybe Later
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-center text-sm text-[#57534e]">
                  Checkout is being configured — join the waitlist and we&apos;ll email you when you can subscribe.
                </p>
                <FooterWaitlistForm defaultTier={selectedTier} />
              </div>
            )}
            <p className="mt-4 text-sm text-[#57534e]">
              30-day money-back guarantee • Cancel anytime
            </p>
          </motion.div>
        )}

        {currentTier !== 'foundations' ? (
          <div className="mt-10 rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
            <p className="text-sm font-semibold text-slate-800">Already subscribed?</p>
            <button
              type="button"
              onClick={() => {
                setChurnStep('pick')
                setPauseMessage(null)
                setChurnModalOpen(true)
              }}
              className="mt-2 text-sm font-bold text-teal-800 underline underline-offset-2 hover:text-teal-950"
            >
              Manage or cancel my plan
            </button>
          </div>
        ) : null}
      </div>

      {churnModalOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Manage subscription"
        >
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-2">
              <h2 className="text-lg font-bold text-[#1c1917]">We&apos;re sorry to see you go</h2>
              <button
                type="button"
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
                aria-label="Close"
                onClick={() => setChurnModalOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {pauseMessage ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-700">{pauseMessage}</p>
                <button
                  type="button"
                  onClick={() => setChurnModalOpen(false)}
                  className="w-full rounded-xl bg-slate-800 py-3 text-sm font-bold text-white hover:bg-slate-900"
                >
                  Close
                </button>
              </div>
            ) : churnStep === 'pick' ? (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setChurnStep('pause')}
                  className="w-full rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-left text-sm font-semibold text-teal-950"
                >
                  Pause for 1–3 months <span className="font-normal text-teal-800">(50% of monthly rate during pause)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChurnStep('cancel-offer')}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-900"
                >
                  Cancel my plan
                </button>
              </div>
            ) : churnStep === 'pause' ? (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-700">
                  Pause duration (months)
                  <select
                    value={pauseMonths}
                    onChange={(e) => setPauseMonths(Number(e.target.value) as PauseMonths)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  >
                    <option value={1}>1 month</option>
                    <option value={2}>2 months</option>
                    <option value={3}>3 months</option>
                  </select>
                </label>
                <p className="text-sm text-slate-600">
                  You&apos;ll be charged <strong className="text-slate-900">$14.50/month</strong> during your pause (50% of
                  $29). Your progress and data are saved.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const state = startSubscriptionPauseLocal(pauseMonths, currentTier)
                    const until = new Date(state.until)
                    setPauseMessage(
                      `Your plan is paused until ${until.toLocaleDateString()}. Your progress and data are saved.`
                    )
                    setChurnStep('done')
                  }}
                  className="w-full rounded-xl bg-teal-600 py-3 text-sm font-bold text-white hover:bg-teal-700"
                >
                  Pause My Plan →
                </button>
                <button
                  type="button"
                  onClick={() => setChurnStep('pick')}
                  className="w-full text-sm font-semibold text-slate-600 underline"
                >
                  Back
                </button>
              </div>
            ) : churnStep === 'cancel-offer' ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-700">
                  Before you go — get <strong>1 month free</strong> if you stay.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      localStorage.setItem(RETENTION_FREE_MONTH_LS, '1')
                    } catch {
                      /* ignore */
                    }
                    setPauseMessage('Your free month credit has been applied locally — thanks for staying with NestQuest.')
                    setChurnStep('done')
                  }}
                  className="w-full rounded-xl bg-teal-600 py-3 text-sm font-bold text-white hover:bg-teal-700"
                >
                  Claim My Free Month →
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPauseMessage(
                      'Cancellation flow is a prototype — in production this would continue to your billing portal.'
                    )
                    setChurnStep('done')
                  }}
                  className="w-full text-sm font-semibold text-slate-500 underline"
                >
                  No thanks, cancel anyway →
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}

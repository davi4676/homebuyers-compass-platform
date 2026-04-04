'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Check,
  X,
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
  Star
} from 'lucide-react'
import Link from 'next/link'
import { TIER_DEFINITIONS, type UserTier, TIER_ORDER, formatTierPrice } from '@/lib/tiers'
import { getUserTier } from '@/lib/user-tracking'
import { trackActivity } from '@/lib/track-activity'
import BackToMyJourneyLink from '@/components/BackToMyJourneyLink'

export default function UpgradePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const targetTier = (searchParams.get('tier') || 'momentum') as UserTier
  const [selectedTier, setSelectedTier] = useState<UserTier>(targetTier)
  const [billingCycle, setBillingCycle] = useState<'one-time' | 'monthly'>('one-time')

  const [currentTier, setCurrentTier] = useState<UserTier>('foundations')

  useEffect(() => {
    setCurrentTier(getUserTier())
  }, [])

  const tiers = TIER_ORDER
  const selectedTierDef = TIER_DEFINITIONS[selectedTier]

  const handleUpgrade = (tier?: UserTier) => {
    const tierToUpgrade = tier || selectedTier

    if (tierToUpgrade === 'foundations') return

    trackActivity('tool_used', {
      tool: 'upgrade_plan_selected',
      tier: tierToUpgrade,
      billingCycle,
      source: 'upgrade_page',
    })

    // Paid tier: send to payment page (Stripe) so they can complete purchase
    router.push(`/payment?tier=${tierToUpgrade}&cycle=${billingCycle}`)
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
        </motion.div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex gap-1 rounded-lg border border-[#e7e5e4] bg-white p-1 shadow-sm">
            <button
              onClick={() => setBillingCycle('one-time')}
              className={`px-6 py-2 rounded-md font-semibold transition-all ${
                billingCycle === 'one-time'
                  ? 'bg-[#0d9488] text-white'
                  : 'text-[#57534e] hover:text-[#1c1917]'
              }`}
            >
              One-Time
            </button>
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-md font-semibold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-[#0d9488] text-white'
                  : 'text-[#57534e] hover:text-[#1c1917]'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        {/* Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {tiers.map((tier) => {
            const tierDef = TIER_DEFINITIONS[tier]
            const priceLabel = formatTierPrice(tierDef)
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
                    handleUpgrade(tier)
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
                  <div className="text-3xl font-bold">{priceLabel}</div>
                  <p className="text-sm text-[#57534e] mt-1">{tierDef.description}</p>
                </div>

                <ul className="space-y-2 mb-6">
                  {/* Free tier: explicit starter inclusions */}
                  {isFree && (
                    <>
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-[#0d9488]" />
                        <span>Basic cost breakdown</span>
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-[#0d9488]" />
                        <span>PDF export (watermarked)</span>
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-[#0d9488]" />
                        <span>Blog access</span>
                      </li>
                    </>
                  )}
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

                {!isFree && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedTier(tier)
                      // Trigger upgrade with the selected tier
                      handleUpgrade(tier)
                    }}
                    className={`w-full py-3 rounded-xl font-semibold transition-all ${
                      isSelected
                        ? 'bg-[#0d9488] text-white hover:bg-[#0f766e]'
                        : 'border border-[#e7e5e4] bg-[#fafaf9] text-[#44403c] hover:bg-[#f5f5f4]'
                    }`}
                  >
                    {isSelected ? 'Selected' : 'Select Plan'}
                  </button>
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e7e5e4]">
                  <th className="text-left py-4 px-4">Feature</th>
                  {tiers.map((tier) => (
                    <th key={tier} className="text-center py-4 px-4">
                      {TIER_DEFINITIONS[tier].name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#e7e5e4]">
                  <td className="py-4 px-4">HOSA Optimization Score</td>
                  {tiers.map((tier) => (
                    <td key={tier} className="text-center py-4 px-4">
                      {TIER_DEFINITIONS[tier].features.hosa.optimizationScore ? (
                        <Check className="w-5 h-5 text-[#0d9488] mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-[#a8a29e] mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-[#e7e5e4]">
                  <td className="py-4 px-4">Savings Opportunities</td>
                  {tiers.map((tier) => {
                    const count = TIER_DEFINITIONS[tier].features.hosa.savingsOpportunities
                    return (
                      <td key={tier} className="text-center py-4 px-4">
                        {count === Infinity ? '∞' : count}
                      </td>
                    )
                  })}
                </tr>
                <tr className="border-b border-[#e7e5e4]">
                  <td className="py-4 px-4">Personalized Action Plan</td>
                  {tiers.map((tier) => (
                    <td key={tier} className="text-center py-4 px-4">
                      {TIER_DEFINITIONS[tier].features.hosa.actionPlan ? (
                        <Check className="w-5 h-5 text-[#0d9488] mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-[#a8a29e] mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-[#e7e5e4]">
                  <td className="py-4 px-4">Week-by-Week Plan</td>
                  {tiers.map((tier) => (
                    <td key={tier} className="text-center py-4 px-4">
                      {TIER_DEFINITIONS[tier].features.hosa.weekByWeekPlan ? (
                        <Check className="w-5 h-5 text-[#0d9488] mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-[#a8a29e] mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-[#e7e5e4]">
                  <td className="py-4 px-4">Personalized Journey / Roadmap</td>
                  {tiers.map((tier) => (
                    <td key={tier} className="text-center py-4 px-4">
                      {TIER_DEFINITIONS[tier].features.personalizedJourney ? (
                        <Check className="w-5 h-5 text-[#0d9488] mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-[#a8a29e] mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-[#e7e5e4]">
                  <td className="py-4 px-4">Calculators</td>
                  {tiers.map((tier) => {
                    const n = TIER_DEFINITIONS[tier].features.tools.calculators.length
                    return (
                      <td key={tier} className="text-center py-4 px-4">
                        {n}
                      </td>
                    )
                  })}
                </tr>
                <tr className="border-b border-[#e7e5e4]">
                  <td className="py-4 px-4">Lender Comparison</td>
                  {tiers.map((tier) => (
                    <td key={tier} className="text-center py-4 px-4">
                      {TIER_DEFINITIONS[tier].features.tools.lenderComparison ? (
                        <Check className="w-5 h-5 text-[#0d9488] mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-[#a8a29e] mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-[#e7e5e4]">
                  <td className="py-4 px-4">Deal Analyzer</td>
                  {tiers.map((tier) => (
                    <td key={tier} className="text-center py-4 px-4">
                      {TIER_DEFINITIONS[tier].features.tools.dealAnalyzer ? (
                        <Check className="w-5 h-5 text-[#0d9488] mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-[#a8a29e] mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-[#e7e5e4]">
                  <td className="py-4 px-4">Document Vault</td>
                  {tiers.map((tier) => (
                    <td key={tier} className="text-center py-4 px-4">
                      {TIER_DEFINITIONS[tier].features.tools.documentVault ? (
                        <Check className="w-5 h-5 text-[#0d9488] mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-[#a8a29e] mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-[#e7e5e4]">
                  <td className="py-4 px-4">AI Assistant</td>
                  {tiers.map((tier) => {
                    const ai = TIER_DEFINITIONS[tier].features.aiAssistant
                    const label = !ai.enabled
                      ? '—'
                      : ai.dailyMessageLimit === Infinity
                        ? 'Unlimited'
                        : `${ai.dailyMessageLimit}/day`
                    return (
                      <td key={tier} className="text-center py-4 px-4 text-sm">
                        {label}
                      </td>
                    )
                  })}
                </tr>
                <tr className="border-b border-[#e7e5e4]">
                  <td className="py-4 px-4">Crowdsourced Down Payment</td>
                  {tiers.map((tier) => (
                    <td key={tier} className="text-center py-4 px-4">
                      {TIER_DEFINITIONS[tier].features.crowdsourcedDownPayment.enabled ? (
                        <Check className="w-5 h-5 text-[#0d9488] mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-[#a8a29e] mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-[#e7e5e4]">
                  <td className="py-4 px-4">Dedicated Expert</td>
                  {tiers.map((tier) => (
                    <td key={tier} className="text-center py-4 px-4">
                      {TIER_DEFINITIONS[tier].features.support.expertAccess ? (
                        <Check className="w-5 h-5 text-[#0d9488] mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-[#a8a29e] mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-4 px-4">Support Response Time</td>
                  {tiers.map((tier) => (
                    <td key={tier} className="text-center py-4 px-4 text-sm">
                      {TIER_DEFINITIONS[tier].features.support.responseTime === Infinity
                        ? 'FAQ Only'
                        : `${TIER_DEFINITIONS[tier].features.support.responseTime}h`}
                    </td>
                  ))}
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
              {`Pricing: ${formatTierPrice(selectedTierDef)}`}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => handleUpgrade()}
                className="px-8 py-4 bg-[#0d9488] text-white rounded-xl text-lg font-semibold hover:bg-[#0f766e] transition-all hover:scale-105 flex items-center gap-2"
              >
                Upgrade Now <ArrowRight className="w-5 h-5" />
              </button>
              <Link
                href="/results"
                className="px-8 py-4 rounded-xl border border-[#e7e5e4] bg-white text-lg font-semibold text-[#1c1917] transition-all hover:bg-[#f5f5f4]"
              >
                Maybe Later
              </Link>
            </div>
            <p className="mt-4 text-sm text-[#57534e]">
              30-day money-back guarantee • Cancel anytime
            </p>
            <p className="mt-2 text-xs italic text-[#78716c]">
              Best time to act: before you lock a pre-approval.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
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
import { trackActivity } from '@/lib/track-activity'

export default function UpgradePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const targetTier = (searchParams.get('tier') || 'momentum') as UserTier
  const [selectedTier, setSelectedTier] = useState<UserTier>(targetTier)
  const [billingCycle, setBillingCycle] = useState<'one-time' | 'monthly'>('one-time')

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
        return 'text-gray-400'
      case 'momentum':
        return 'text-[#06b6d4]'
      case 'navigator':
        return 'text-[#f97316]'
      case 'navigator_plus':
        return 'text-[#D4AF37]'
      default:
        return 'text-gray-400'
    }
  }

  const getTierBgColor = (tier: UserTier) => {
    switch (tier) {
      case 'foundations':
        return 'bg-gray-800'
      case 'momentum':
        return 'bg-[#06b6d4]/10 border-[#06b6d4]'
      case 'navigator':
        return 'bg-[#f97316]/10 border-[#f97316]'
      case 'navigator_plus':
        return 'bg-[#D4AF37]/10 border-[#D4AF37]'
      default:
        return 'bg-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Unlock powerful tools to save thousands on your home purchase
          </p>
        </motion.div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800 rounded-lg p-1 inline-flex gap-1">
            <button
              onClick={() => setBillingCycle('one-time')}
              className={`px-6 py-2 rounded-md font-semibold transition-all ${
                billingCycle === 'one-time'
                  ? 'bg-[#06b6d4] text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              One-Time
            </button>
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-md font-semibold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-[#06b6d4] text-white'
                  : 'text-gray-400 hover:text-white'
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

            return (
              <motion.div
                key={tier}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: tiers.indexOf(tier) * 0.1 }}
                onClick={(e) => {
                  if (!isFree) {
                    // If clicking the button itself, let it handle the event
                    if ((e.target as HTMLElement).closest('button')) {
                      return
                    }
                    setSelectedTier(tier)
                    handleUpgrade(tier)
                  }
                }}
                className={`relative rounded-lg border-2 p-6 cursor-pointer transition-all ${
                  isSelected && !isFree
                    ? `${getTierBgColor(tier)} border-2 scale-105`
                    : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                } ${isFree ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {isSelected && !isFree && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className={`bg-[#06b6d4] text-white px-4 py-1 rounded-full text-sm font-bold ${getTierColor(tier)}`}>
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
                    <p className="text-sm text-gray-400">{tierDef.description}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="text-3xl font-bold">{priceLabel}</div>
                  {!isFree ? (
                    <p className="text-sm text-gray-400 mt-1">
                      Placeholder pricing range shown
                    </p>
                  ) : null}
                </div>

                <ul className="space-y-2 mb-6">
                  {/* Free tier: explicit starter inclusions */}
                  {isFree && (
                    <>
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-[#06b6d4]" />
                        <span>Basic cost breakdown</span>
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-[#06b6d4]" />
                        <span>PDF export (watermarked)</span>
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-[#06b6d4]" />
                        <span>Blog access</span>
                      </li>
                    </>
                  )}
                  {!isFree && (
                    <>
                      {tierDef.features.hosa.optimizationScore && (
                        <li className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-[#06b6d4]" />
                          <span>HOSA Optimization Score</span>
                        </li>
                      )}
                      {tierDef.features.hosa.savingsOpportunities > 0 && (
                        <li className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-[#06b6d4]" />
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
                          <Check className="w-4 h-4 text-[#06b6d4]" />
                          <span>Personalized Action Plan</span>
                        </li>
                      )}
                      {tierDef.features.hosa.weekByWeekPlan && (
                        <li className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-[#06b6d4]" />
                          <span>Week-by-Week Plan</span>
                        </li>
                      )}
                      {tierDef.features.personalizedJourney && (
                        <li className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-[#06b6d4]" />
                          <span>Personalized Journey / Roadmap</span>
                        </li>
                      )}
                      {tierDef.features.mortgageShopping && (
                        <li className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-[#06b6d4]" />
                          <span>Mortgage Shopping Roadmap</span>
                        </li>
                      )}
                      {tierDef.features.tools.calculators.length > 0 && (
                        <li className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-[#06b6d4]" />
                          <span>{tierDef.features.tools.calculators.length} Calculators</span>
                        </li>
                      )}
                      {tierDef.features.tools.lenderComparison && (
                        <li className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-[#06b6d4]" />
                          <span>Lender Comparison</span>
                        </li>
                      )}
                      {tierDef.features.tools.dealAnalyzer && (
                        <li className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-[#06b6d4]" />
                          <span>Deal Analyzer</span>
                        </li>
                      )}
                      {tierDef.features.tools.documentVault && (
                        <li className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-[#06b6d4]" />
                          <span>Document Vault</span>
                        </li>
                      )}
                      {tierDef.features.tools.timelineOrchestrator && (
                        <li className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-[#06b6d4]" />
                          <span>Timeline Orchestrator</span>
                        </li>
                      )}
                      {tierDef.features.aiAssistant.enabled && (
                        <li className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-[#06b6d4]" />
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
                          <Check className="w-4 h-4 text-[#06b6d4]" />
                          <span>
                            Gamification
                            {tierDef.features.gamification.leaderboard ? ' (XP, badges, streaks, leaderboard)' : ' (XP, badges, levels)'}
                          </span>
                        </li>
                      )}
                      {tierDef.features.content.scripts > 0 && (
                        <li className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-[#06b6d4]" />
                          <span>{tierDef.features.content.scripts} Negotiation Scripts</span>
                        </li>
                      )}
                      {tierDef.features.content.guides && (
                        <li className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-[#06b6d4]" />
                          <span>Guides & Templates</span>
                        </li>
                      )}
                      {tierDef.features.support.expertAccess && (
                        <li className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-[#06b6d4]" />
                          <span>Dedicated Expert</span>
                        </li>
                      )}
                      {tierDef.features.crowdsourcedDownPayment.enabled && (
                        <li className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-[#06b6d4]" />
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
                    className={`w-full py-3 rounded-lg font-semibold transition-all ${
                      isSelected
                        ? 'bg-[#06b6d4] text-white hover:bg-[#0891b2]'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
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
          className="bg-gray-900/50 rounded-lg p-8 mb-12"
        >
          <h2 className="text-3xl font-bold mb-6 text-center">Feature Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-4 px-4">Feature</th>
                  {tiers.map((tier) => (
                    <th key={tier} className="text-center py-4 px-4">
                      {TIER_DEFINITIONS[tier].name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-800">
                  <td className="py-4 px-4">HOSA Optimization Score</td>
                  {tiers.map((tier) => (
                    <td key={tier} className="text-center py-4 px-4">
                      {TIER_DEFINITIONS[tier].features.hosa.optimizationScore ? (
                        <Check className="w-5 h-5 text-[#06b6d4] mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-gray-600 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-800">
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
                <tr className="border-b border-gray-800">
                  <td className="py-4 px-4">Personalized Action Plan</td>
                  {tiers.map((tier) => (
                    <td key={tier} className="text-center py-4 px-4">
                      {TIER_DEFINITIONS[tier].features.hosa.actionPlan ? (
                        <Check className="w-5 h-5 text-[#06b6d4] mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-gray-600 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-4 px-4">Week-by-Week Plan</td>
                  {tiers.map((tier) => (
                    <td key={tier} className="text-center py-4 px-4">
                      {TIER_DEFINITIONS[tier].features.hosa.weekByWeekPlan ? (
                        <Check className="w-5 h-5 text-[#06b6d4] mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-gray-600 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-4 px-4">Personalized Journey / Roadmap</td>
                  {tiers.map((tier) => (
                    <td key={tier} className="text-center py-4 px-4">
                      {TIER_DEFINITIONS[tier].features.personalizedJourney ? (
                        <Check className="w-5 h-5 text-[#06b6d4] mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-gray-600 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-800">
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
                <tr className="border-b border-gray-800">
                  <td className="py-4 px-4">Lender Comparison</td>
                  {tiers.map((tier) => (
                    <td key={tier} className="text-center py-4 px-4">
                      {TIER_DEFINITIONS[tier].features.tools.lenderComparison ? (
                        <Check className="w-5 h-5 text-[#06b6d4] mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-gray-600 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-4 px-4">Deal Analyzer</td>
                  {tiers.map((tier) => (
                    <td key={tier} className="text-center py-4 px-4">
                      {TIER_DEFINITIONS[tier].features.tools.dealAnalyzer ? (
                        <Check className="w-5 h-5 text-[#06b6d4] mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-gray-600 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-4 px-4">Document Vault</td>
                  {tiers.map((tier) => (
                    <td key={tier} className="text-center py-4 px-4">
                      {TIER_DEFINITIONS[tier].features.tools.documentVault ? (
                        <Check className="w-5 h-5 text-[#06b6d4] mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-gray-600 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-800">
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
                <tr className="border-b border-gray-800">
                  <td className="py-4 px-4">Crowdsourced Down Payment</td>
                  {tiers.map((tier) => (
                    <td key={tier} className="text-center py-4 px-4">
                      {TIER_DEFINITIONS[tier].features.crowdsourcedDownPayment.enabled ? (
                        <Check className="w-5 h-5 text-[#06b6d4] mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-gray-600 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-4 px-4">Dedicated Expert</td>
                  {tiers.map((tier) => (
                    <td key={tier} className="text-center py-4 px-4">
                      {TIER_DEFINITIONS[tier].features.support.expertAccess ? (
                        <Check className="w-5 h-5 text-[#06b6d4] mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-gray-600 mx-auto" />
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
            className="bg-gradient-to-r from-[#06b6d4]/20 to-[#0891b2]/20 rounded-lg p-8 border border-[#06b6d4]/30 text-center"
          >
            <h2 className="text-3xl font-bold mb-4">
              Ready to Upgrade to {selectedTierDef.name}?
            </h2>
            <p className="text-gray-300 mb-6 text-lg">
              {`Pricing: ${formatTierPrice(selectedTierDef)}`}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => handleUpgrade()}
                className="px-8 py-4 bg-[#06b6d4] text-white rounded-lg text-lg font-semibold hover:bg-[#0891b2] transition-all hover:scale-105 flex items-center gap-2"
              >
                Upgrade Now <ArrowRight className="w-5 h-5" />
              </button>
              <Link
                href="/results"
                className="px-8 py-4 bg-gray-800 text-white rounded-lg text-lg font-semibold hover:bg-gray-700 transition-all"
              >
                Maybe Later
              </Link>
            </div>
            <p className="text-sm text-gray-400 mt-4">
              30-day money-back guarantee • Cancel anytime
            </p>
            <p className="text-xs text-gray-500 mt-2 italic">
              Best time to act: before you lock a pre-approval.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

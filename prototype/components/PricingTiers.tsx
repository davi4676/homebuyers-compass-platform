'use client'

import { motion } from 'framer-motion'
import { Check, X, Zap, Crown, Sparkles, ArrowRight, Lock } from 'lucide-react'
import { useState } from 'react'
import { type UserTier, TIER_DEFINITIONS, TIER_ORDER, formatTierPrice } from '@/lib/tiers'

/** @deprecated Use UserTier from @/lib/tiers */
export type PricingTier = UserTier

interface PricingTiersProps {
  currentTier?: UserTier
  onUpgrade?: (tier: UserTier) => void
  showComparison?: boolean
  compact?: boolean
}

export default function PricingTiers({ 
  currentTier = 'foundations', 
  onUpgrade,
  showComparison = false,
  compact = false 
}: PricingTiersProps) {
  const [selectedTier, setSelectedTier] = useState<UserTier>('momentum')

  const tiers: Record<UserTier, { name: string; price: string; period: string; description: string; icon: typeof Zap; color: string; features: string[]; limitations: string[]; cta: string; popular?: boolean; savings?: string }> = {
    foundations: {
      name: TIER_DEFINITIONS.foundations.name,
      price: formatTierPrice(TIER_DEFINITIONS.foundations),
      period: '',
      description: TIER_DEFINITIONS.foundations.description,
      icon: Zap,
      color: 'from-gray-600 to-gray-700',
      features: [
        'One-time affordability analysis',
        'Basic cost breakdown',
        'Readiness score',
        '3 savings opportunities',
        'Watermarked PDF export',
      ],
      limitations: [
        'No negotiation scripts',
        'No action plan',
        'No lender comparison tools',
        'No personalized journey',
      ],
      cta: 'Start Free',
      popular: false,
    },
    momentum: {
      name: TIER_DEFINITIONS.momentum.name,
      price: formatTierPrice(TIER_DEFINITIONS.momentum),
      period: '',
      description: TIER_DEFINITIONS.momentum.description,
      icon: Crown,
      color: 'from-[#06b6d4] to-[#0891b2]',
      features: [
        'Everything in Explorer, plus:',
        'Personalized action plan',
        '10 savings opportunities',
        'Personalized journey guide',
        'Lender comparison checklist',
        'Printable PDF (no watermark)',
        'Email support (48hr response)',
        'Gamification (XP, badges, levels)',
      ],
      limitations: [
        'No week-by-week plan',
        'No deal analyzer',
        'No document vault',
      ],
      cta: 'Choose Momentum',
      popular: true,
      savings: 'Save $2,000-$10,000+',
    },
    navigator: {
      name: TIER_DEFINITIONS.navigator.name,
      price: formatTierPrice(TIER_DEFINITIONS.navigator),
      period: '',
      description: TIER_DEFINITIONS.navigator.description,
      icon: Sparkles,
      color: 'from-[#f97316] to-[#ea580c]',
      features: [
        'Everything in Premium, plus:',
        'Week-by-week action plan',
        'Unlimited savings opportunities',
        'Deal analyzer for specific homes',
        'Document vault',
        'Timeline orchestrator',
        'Chat support (24hr response)',
        'All calculators & tools',
        'Full gamification (streaks, leaderboard)',
      ],
      limitations: [],
      cta: 'Choose Navigator+',
      popular: false,
      savings: 'Save $5,000-$15,000+',
    },
    navigator_plus: {
      name: TIER_DEFINITIONS.navigator_plus.name,
      price: formatTierPrice(TIER_DEFINITIONS.navigator_plus),
      period: '',
      description: TIER_DEFINITIONS.navigator_plus.description,
      icon: Crown,
      color: 'from-[#D4AF37] to-[#B8860B]',
      features: [
        'Everything in Pro, plus:',
        'Unlimited AI assistant with expert escalation',
        'Crowdsourced Down Payment (CSDP) access',
        'Community Funding Engine',
        'Phone & expert access',
        '2hr response time',
      ],
      limitations: [],
      cta: 'Choose Concierge+',
      popular: false,
      savings: 'Unlock community funding',
    },
  }

  const tierKeys = TIER_ORDER

  if (compact) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tierKeys.map((key) => {
          const tier = tiers[key]
          const TierIcon = tier.icon
          const isCurrent = currentTier === key
          const isLocked = currentTier === 'foundations' && key !== 'foundations'
          
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`relative bg-gray-900/50 border-2 rounded-lg p-6 ${
                tier.popular 
                  ? 'border-[#06b6d4] shadow-lg shadow-[#06b6d4]/20' 
                  : isCurrent
                  ? 'border-green-500'
                  : 'border-gray-800'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#06b6d4] text-white text-xs px-3 py-1 rounded-full font-semibold">
                  MOST POPULAR
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                  CURRENT
                </div>
              )}
              
              <div className="text-center mb-4">
                <TierIcon className={`w-8 h-8 mx-auto mb-2 ${
                  tier.popular ? 'text-[#06b6d4]' : 'text-gray-400'
                }`} />
                <h3 className="text-xl font-bold mb-1">{tier.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-bold">{tier.price}</span>
                  {tier.period && (
                    <span className="text-sm text-gray-400">/{tier.period}</span>
                  )}
                </div>
                {'savings' in tier && tier.savings && (
                  <p className="text-xs text-[#10b981] mt-1 font-semibold">{tier.savings}</p>
                )}
              </div>

              {isLocked && (
                <button
                  onClick={() => onUpgrade?.(key)}
                  className="w-full bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Lock size={16} />
                  Upgrade
                </button>
              )}
              {isCurrent && (
                <div className="w-full bg-green-500/20 text-green-400 py-2 rounded-lg font-semibold text-center">
                  Active
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Choose Your Plan</h2>
        <p className="text-gray-400">All plans include our core analysis. Upgrade to unlock more savings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tierKeys.map((key) => {
          const tier = tiers[key]
          const TierIcon = tier.icon
          const isCurrent = currentTier === key
          const isLocked = currentTier === 'foundations' && key !== 'foundations'
          
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`relative bg-gray-900/50 border-2 rounded-lg p-6 ${
                tier.popular 
                  ? 'border-[#06b6d4] shadow-lg shadow-[#06b6d4]/20 scale-105' 
                  : isCurrent
                  ? 'border-green-500'
                  : 'border-gray-800'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#06b6d4] text-white text-xs px-3 py-1 rounded-full font-semibold">
                  MOST POPULAR
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                  CURRENT
                </div>
              )}
              
              <div className="text-center mb-6">
                <TierIcon className={`w-10 h-10 mx-auto mb-3 ${
                  tier.popular ? 'text-[#06b6d4]' : 'text-gray-400'
                }`} />
                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                <p className="text-sm text-gray-400 mb-4">{tier.description}</p>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  {tier.period && (
                    <span className="text-sm text-gray-400">/{tier.period}</span>
                  )}
                </div>
                {'savings' in tier && tier.savings && (
                  <p className="text-sm text-[#10b981] font-semibold">{tier.savings}</p>
                )}
              </div>

              <ul className="space-y-3 mb-6">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check size={16} className="mt-0.5 flex-shrink-0 text-[#10b981]" />
                    <span>{feature}</span>
                  </li>
                ))}
                {tier.limitations.map((limitation, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-500">
                    <X size={16} className="mt-0.5 flex-shrink-0" />
                    <span>{limitation}</span>
                  </li>
                ))}
              </ul>

              {isLocked ? (
                <button
                  onClick={() => onUpgrade?.(key)}
                  className={`w-full bg-gradient-to-r ${tier.color} text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2`}
                >
                  <Lock size={18} />
                  {tier.cta}
                  <ArrowRight size={18} />
                </button>
              ) : isCurrent ? (
                <div className="w-full bg-green-500/20 text-green-400 py-3 rounded-lg font-semibold text-center">
                  ✓ Active Plan
                </div>
              ) : (
                <button
                  onClick={() => onUpgrade?.(key)}
                  className="w-full bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                >
                  {tier.cta}
                </button>
              )}
            </motion.div>
          )
        })}
      </div>

      {showComparison && (
        <div className="mt-8 bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-center">Feature Comparison</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3">Feature</th>
                  <th className="text-center py-3">Explorer</th>
                  <th className="text-center py-3">Premium</th>
                  <th className="text-center py-3">Pro</th>
                  <th className="text-center py-3">Pro+</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                <tr className="border-b border-gray-800">
                  <td className="py-3">Affordability Analysis</td>
                  <td className="text-center"><Check className="mx-auto text-[#10b981]" size={18} /></td>
                  <td className="text-center"><Check className="mx-auto text-[#10b981]" size={18} /></td>
                  <td className="text-center"><Check className="mx-auto text-[#10b981]" size={18} /></td>
                  <td className="text-center"><Check className="mx-auto text-[#10b981]" size={18} /></td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3">Cost Breakdown</td>
                  <td className="text-center"><Check className="mx-auto text-[#10b981]" size={18} /></td>
                  <td className="text-center"><Check className="mx-auto text-[#10b981]" size={18} /></td>
                  <td className="text-center"><Check className="mx-auto text-[#10b981]" size={18} /></td>
                  <td className="text-center"><Check className="mx-auto text-[#10b981]" size={18} /></td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3">Personalized Journey</td>
                  <td className="text-center"><X className="mx-auto text-gray-600" size={18} /></td>
                  <td className="text-center"><Check className="mx-auto text-[#10b981]" size={18} /></td>
                  <td className="text-center"><Check className="mx-auto text-[#10b981]" size={18} /></td>
                  <td className="text-center"><Check className="mx-auto text-[#10b981]" size={18} /></td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3">Week-by-Week Plan</td>
                  <td className="text-center"><X className="mx-auto text-gray-600" size={18} /></td>
                  <td className="text-center"><X className="mx-auto text-gray-600" size={18} /></td>
                  <td className="text-center"><Check className="mx-auto text-[#10b981]" size={18} /></td>
                  <td className="text-center"><Check className="mx-auto text-[#10b981]" size={18} /></td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3">Deal Analyzer</td>
                  <td className="text-center"><X className="mx-auto text-gray-600" size={18} /></td>
                  <td className="text-center"><X className="mx-auto text-gray-600" size={18} /></td>
                  <td className="text-center"><Check className="mx-auto text-[#10b981]" size={18} /></td>
                  <td className="text-center"><Check className="mx-auto text-[#10b981]" size={18} /></td>
                </tr>
                <tr>
                  <td className="py-3">Savings Opportunities</td>
                  <td className="text-center">3</td>
                  <td className="text-center">10</td>
                  <td className="text-center">∞</td>
                  <td className="text-center">∞</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}


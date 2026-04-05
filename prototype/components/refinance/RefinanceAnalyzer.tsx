'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, AlertTriangle, Lock, ArrowRight } from 'lucide-react'
import { UserTier, tierAtLeast } from '@/lib/tiers'
import { formatCurrency } from '@/lib/calculations'

interface RefinanceData {
  currentRate: number
  currentBalance: number
  homeValue: number
  yearsRemaining: number
}

interface RefinanceAnalyzerProps {
  userTier: UserTier
  refinanceData: RefinanceData
  onBack: () => void
  onUpgrade: (tier: UserTier) => void
}

export default function RefinanceAnalyzer({
  userTier,
  refinanceData,
  onBack,
  onUpgrade,
}: RefinanceAnalyzerProps) {
  const isPremium = userTier === 'momentum' || userTier === 'navigator'

  const newRate = 5.5
  const rateSavings = refinanceData.currentRate - newRate
  const monthlySavings = ((rateSavings / 100) / 12) * refinanceData.currentBalance
  const closingCosts = 5000
  const breakEvenMonths = closingCosts / monthlySavings

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 rounded-lg bg-gray-900 hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold">Should I Refinance?</h1>
          <p className="text-gray-400">Multi-factor analysis beyond just rates</p>
        </div>
      </div>

      {!isPremium ? (
        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-6 h-6 text-yellow-400" />
            <h2 className="text-xl font-bold">Premium Feature</h2>
          </div>
          <p className="text-gray-300 mb-4">
            Upgrade to Premium to access comprehensive refinance analysis including time in home
            plans, credit score changes, and PMI elimination calculations.
          </p>
          <button
            onClick={() => onUpgrade('momentum')}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#06b6d4] to-[#22d3ee] text-white font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            Upgrade to Premium
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <>
          {/* Analysis Results */}
          <div className="bg-gradient-to-br from-[#06b6d4]/20 to-[#22d3ee]/20 rounded-xl p-6 border border-[#06b6d4]/30">
            <h2 className="text-xl font-bold mb-4">Refinance Recommendation</h2>
            {rateSavings > 0.5 ? (
              <div className="p-4 rounded-lg bg-green-900/20 border border-green-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <span className="text-xl font-bold text-green-400">Refinancing Makes Sense</span>
                </div>
                <p className="text-gray-300">
                  You could save {formatCurrency(monthlySavings)} per month. Break-even in{' '}
                  {breakEvenMonths.toFixed(1)} months.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-yellow-900/20 border border-yellow-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-6 h-6 text-yellow-400" />
                  <span className="text-xl font-bold text-yellow-400">
                    Consider Waiting
                  </span>
                </div>
                <p className="text-gray-300">
                  Current rate savings may not justify closing costs. Monitor for better rates.
                </p>
              </div>
            )}
          </div>

          {/* Factors Analysis */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
            <h2 className="text-xl font-bold mb-4">Key Factors</h2>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-gray-800/50">
                <div className="font-semibold mb-2">Time in Home Plans</div>
                <div className="text-sm text-gray-400">
                  {breakEvenMonths < 24
                    ? '✓ You plan to stay long enough to benefit'
                    : '⚠ Consider if you plan to move soon'}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-gray-800/50">
                <div className="font-semibold mb-2">Credit Score Changes</div>
                <div className="text-sm text-gray-400">
                  Your credit score may qualify you for better rates than when you first purchased.
                </div>
              </div>
              <div className="p-4 rounded-lg bg-gray-800/50">
                <div className="font-semibold mb-2">PMI Elimination</div>
                <div className="text-sm text-gray-400">
                  {refinanceData.homeValue * 0.2 > refinanceData.currentBalance
                    ? '✓ You can eliminate PMI with refinance'
                    : 'You may still need PMI after refinance'}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#06b6d4]/40 bg-[#06b6d4]/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Your Next Steps</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <Link
                href="/mortgage-shopping"
                className="rounded-lg border border-gray-700 bg-gray-900/50 p-4 transition hover:border-[#06b6d4]/50"
              >
                <p className="font-semibold text-white">Compare Lenders</p>
                <p className="mt-2 text-sm text-gray-400">Shop rates and fees with a structured checklist.</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#22d3ee]">
                  Open <ArrowRight className="h-4 w-4" aria-hidden />
                </span>
              </Link>
              <Link
                href="/homebuyer/refinance-journey"
                className="rounded-lg border border-gray-700 bg-gray-900/50 p-4 transition hover:border-[#06b6d4]/50"
              >
                <p className="font-semibold text-white">Get Your Documents Ready</p>
                <p className="mt-2 text-sm text-gray-400">Wizard for paperwork and timeline.</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#22d3ee]">
                  Start <ArrowRight className="h-4 w-4" aria-hidden />
                </span>
              </Link>
              <div className="rounded-lg border border-gray-700 bg-gray-900/50 p-4">
                <p className="font-semibold text-white">Set a Rate Alert</p>
                <p className="mt-2 text-sm text-gray-400">
                  {tierAtLeast(userTier, 'momentum')
                    ? 'Open Rate Drop Radar to configure alerts.'
                    : 'Unlock with Momentum — get notified when rates move enough to matter.'}
                </p>
                <Link
                  href={
                    tierAtLeast(userTier, 'momentum')
                      ? '/refinance-optimizer#rate-radar'
                      : '/upgrade?source=rate-radar&tier=momentum'
                  }
                  className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#22d3ee]"
                >
                  {tierAtLeast(userTier, 'momentum') ? 'Configure alerts →' : 'Upgrade for alerts →'}
                </Link>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="flex items-center justify-between pt-6 border-t border-gray-800">
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-lg bg-gray-900 hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Optimizer
        </button>
      </div>
    </motion.div>
  )
}

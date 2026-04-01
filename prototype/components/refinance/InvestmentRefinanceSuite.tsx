'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, BarChart3, Home, Lock, ArrowRight } from 'lucide-react'
import { UserTier } from '@/lib/tiers'
import { formatCurrency } from '@/lib/calculations'

interface InvestmentRefinanceSuiteProps {
  userTier: UserTier
  onBack: () => void
  onUpgrade: (tier: UserTier) => void
}

export default function InvestmentRefinanceSuite({
  userTier,
  onBack,
  onUpgrade,
}: InvestmentRefinanceSuiteProps) {
  const isPro = userTier === 'navigator'

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
          <h1 className="text-3xl font-bold">Investment Property Refinance Suite</h1>
          <p className="text-gray-400">Specialized tools for real estate investors</p>
        </div>
      </div>

      {!isPro ? (
        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-6 h-6 text-yellow-400" />
            <h2 className="text-xl font-bold">Pro Feature</h2>
          </div>
          <p className="text-gray-300 mb-4">
            Upgrade to Pro to access investment property refinance tools, portfolio optimization,
            and 1031 exchange integration.
          </p>
          <button
            onClick={() => onUpgrade('navigator')}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#06b6d4] to-[#22d3ee] text-white font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            Upgrade to Pro
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <>
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-[#06b6d4]" />
              Portfolio Rate Optimization
            </h2>
            <p className="text-gray-300 mb-4">
              Analyze all your investment properties to find refinance opportunities across your
              portfolio.
            </p>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-gray-800/50">
                <div className="font-semibold mb-2">Property 1: 123 Main St</div>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400">Current Rate</div>
                    <div className="font-semibold">6.5%</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Potential Rate</div>
                    <div className="font-semibold text-[#06b6d4]">5.5%</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Annual Savings</div>
                    <div className="font-semibold text-green-400">{formatCurrency(2400)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
            <h2 className="text-xl font-bold mb-4">1031 Exchange Timing Integration</h2>
            <p className="text-gray-300 mb-4">
              Coordinate refinance timing with 1031 exchange deadlines to maximize tax benefits.
            </p>
            <button className="px-6 py-3 rounded-lg bg-[#06b6d4] hover:bg-[#0891b2] transition-colors text-white font-semibold">
              Plan 1031 Exchange
            </button>
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

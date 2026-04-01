'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, TrendingUp, Home, Calculator, BarChart3, Lock, ArrowRight } from 'lucide-react'
import { UserTier } from '@/lib/tiers'
import { formatCurrency } from '@/lib/calculations'
import Link from 'next/link'

interface EquityData {
  currentHomeValue: number
  mortgageBalance: number
  newHomePrice: number
}

interface MoveUpOptimizerProps {
  userTier: UserTier
  equityData: EquityData
  onBack: () => void
  onUpgrade: (tier: UserTier) => void
}

export default function MoveUpOptimizer({
  userTier,
  equityData,
  onBack,
  onUpgrade,
}: MoveUpOptimizerProps) {
  const isPremium = userTier === 'momentum' || userTier === 'navigator'
  const isPro = userTier === 'navigator'

  const [scenario, setScenario] = useState<'buy-first' | 'sell-first'>('buy-first')

  const availableEquity = equityData.currentHomeValue - equityData.mortgageBalance
  const priceDifference = equityData.newHomePrice - equityData.currentHomeValue

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
          <h1 className="text-3xl font-bold">Move-Up Optimizer</h1>
          <p className="text-gray-400">Compare buy-first vs sell-first scenarios</p>
        </div>
      </div>

      {!isPremium ? (
        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-6 h-6 text-yellow-400" />
            <h2 className="text-xl font-bold">Premium Feature</h2>
          </div>
          <p className="text-gray-300 mb-4">
            Upgrade to Premium to access scenario modeling, temporary rental analysis, and lifestyle
            upgrade calculator.
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
          {/* Scenario Selector */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
            <h2 className="text-xl font-bold mb-4">Choose Your Strategy</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => setScenario('buy-first')}
                className={`p-6 rounded-lg border-2 transition-all ${
                  scenario === 'buy-first'
                    ? 'border-[#06b6d4] bg-[#06b6d4]/20'
                    : 'border-gray-700 bg-gray-800/50'
                }`}
              >
                <h3 className="text-xl font-bold mb-2">Buy First</h3>
                <p className="text-sm text-gray-400">
                  Purchase new home first, then sell current home. Requires bridge financing.
                </p>
              </button>
              <button
                onClick={() => setScenario('sell-first')}
                className={`p-6 rounded-lg border-2 transition-all ${
                  scenario === 'sell-first'
                    ? 'border-[#06b6d4] bg-[#06b6d4]/20'
                    : 'border-gray-700 bg-gray-800/50'
                }`}
              >
                <h3 className="text-xl font-bold mb-2">Sell First</h3>
                <p className="text-sm text-gray-400">
                  Sell current home first, then buy new home. May require temporary housing.
                </p>
              </button>
            </div>
          </div>

          {/* Scenario Analysis */}
          <div className="bg-gradient-to-br from-[#06b6d4]/20 to-[#22d3ee]/20 rounded-xl p-6 border border-[#06b6d4]/30">
            <h2 className="text-xl font-bold mb-4">
              {scenario === 'buy-first' ? 'Buy First' : 'Sell First'} Analysis
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-gray-900/50">
                <div className="text-sm text-gray-400 mb-1">Additional Financing Needed</div>
                <div className="text-2xl font-bold text-[#06b6d4]">
                  {scenario === 'buy-first'
                    ? formatCurrency(priceDifference - availableEquity)
                    : formatCurrency(0)}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-gray-900/50">
                <div className="text-sm text-gray-400 mb-1">
                  {scenario === 'buy-first' ? 'Bridge Loan Cost' : 'Temporary Housing Cost'}
                </div>
                <div className="text-2xl font-bold text-white">
                  {scenario === 'buy-first' ? formatCurrency(3000) : formatCurrency(4500)}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-gray-900/50">
                <div className="text-sm text-gray-400 mb-1">Total Additional Cost</div>
                <div className="text-2xl font-bold text-white">
                  {scenario === 'buy-first' ? formatCurrency(3000) : formatCurrency(4500)}
                </div>
              </div>
            </div>
          </div>

          {isPro && (
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-[#06b6d4]" />
                Lifestyle Upgrade Calculator
              </h2>
              <p className="text-gray-300 mb-4">
                Compare the financial impact of your upgrade vs. the lifestyle benefits you'll gain.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-gray-800/50">
                  <div className="text-sm text-gray-400 mb-1">Additional Monthly Payment</div>
                  <div className="text-2xl font-bold text-[#06b6d4]">{formatCurrency(800)}</div>
                </div>
                <div className="p-4 rounded-lg bg-gray-800/50">
                  <div className="text-sm text-gray-400 mb-1">Additional Square Feet</div>
                  <div className="text-2xl font-bold text-white">+500 sq ft</div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <div className="flex items-center justify-between pt-6 border-t border-gray-800">
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-lg bg-gray-900 hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Suite
        </button>
      </div>
    </motion.div>
  )
}

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, DollarSign, TrendingUp, Calculator, Lock, ArrowRight } from 'lucide-react'
import { UserTier } from '@/lib/tiers'
import { formatCurrency } from '@/lib/calculations'

interface RefinanceData {
  currentRate: number
  currentBalance: number
  homeValue: number
  yearsRemaining: number
}

interface CashOutOptimizerProps {
  userTier: UserTier
  refinanceData: RefinanceData
  onBack: () => void
  onUpgrade: (tier: UserTier) => void
}

export default function CashOutOptimizer({
  userTier,
  refinanceData,
  onBack,
  onUpgrade,
}: CashOutOptimizerProps) {
  const isPremium = userTier === 'momentum' || userTier === 'navigator'
  const isPro = userTier === 'navigator'

  const [cashOutAmount, setCashOutAmount] = useState(50000)
  const [purpose, setPurpose] = useState<'debt' | 'home-improvement' | 'investment'>('debt')

  const availableEquity = refinanceData.homeValue - refinanceData.currentBalance
  const maxCashOut = availableEquity * 0.8 // 80% LTV max

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
          <h1 className="text-3xl font-bold">Cash-Out Optimization Engine</h1>
          <p className="text-gray-400">Optimize cash-out refinancing for your goals</p>
        </div>
      </div>

      {!isPremium ? (
        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-6 h-6 text-yellow-400" />
            <h2 className="text-xl font-bold">Premium Feature</h2>
          </div>
          <p className="text-gray-300 mb-4">
            Upgrade to Premium to access cash-out optimization, debt consolidation planning, and
            home improvement ROI calculators.
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
          {/* Cash-Out Calculator */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Calculator className="w-6 h-6 text-[#06b6d4]" />
              Cash-Out Amount
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  How much cash do you need?
                </label>
                <input
                  type="number"
                  value={cashOutAmount}
                  onChange={(e) => setCashOutAmount(parseFloat(e.target.value) || 0)}
                  max={maxCashOut}
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:border-[#06b6d4] focus:outline-none"
                />
                <div className="text-xs text-gray-400 mt-1">
                  Maximum available: {formatCurrency(maxCashOut)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  What will you use it for?
                </label>
                <select
                  value={purpose}
                  onChange={(e) =>
                    setPurpose(e.target.value as 'debt' | 'home-improvement' | 'investment')
                  }
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:border-[#06b6d4] focus:outline-none"
                >
                  <option value="debt">Debt Consolidation</option>
                  <option value="home-improvement">Home Improvement</option>
                  <option value="investment">Investment Property</option>
                </select>
              </div>
            </div>
          </div>

          {/* Purpose-Specific Analysis */}
          {purpose === 'debt' && (
            <div className="bg-gradient-to-br from-[#06b6d4]/20 to-[#22d3ee]/20 rounded-xl p-6 border border-[#06b6d4]/30">
              <h2 className="text-xl font-bold mb-4">Debt Consolidation Savings</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-gray-900/50">
                  <div className="text-sm text-gray-400 mb-1">Current Debt Payments</div>
                  <div className="text-2xl font-bold text-white">{formatCurrency(1200)}</div>
                </div>
                <div className="p-4 rounded-lg bg-gray-900/50">
                  <div className="text-sm text-gray-400 mb-1">New Monthly Payment</div>
                  <div className="text-2xl font-bold text-[#06b6d4]">{formatCurrency(800)}</div>
                </div>
              </div>
              <div className="mt-4 p-4 rounded-lg bg-green-900/20 border border-green-500/30">
                <div className="text-sm text-gray-300">
                  <strong className="text-green-400">Monthly Savings:</strong>{' '}
                  {formatCurrency(400)} | <strong className="text-green-400">Annual Savings:</strong>{' '}
                  {formatCurrency(4800)}
                </div>
              </div>
            </div>
          )}

          {purpose === 'home-improvement' && (
            <div className="bg-gradient-to-br from-[#06b6d4]/20 to-[#22d3ee]/20 rounded-xl p-6 border border-[#06b6d4]/30">
              <h2 className="text-xl font-bold mb-4">Home Improvement ROI</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-gray-900/50">
                  <div className="text-sm text-gray-400 mb-1">Investment Amount</div>
                  <div className="text-2xl font-bold text-white">{formatCurrency(cashOutAmount)}</div>
                </div>
                <div className="p-4 rounded-lg bg-gray-900/50">
                  <div className="text-sm text-gray-400 mb-1">Estimated Home Value Increase</div>
                  <div className="text-2xl font-bold text-[#06b6d4]">
                    {formatCurrency(cashOutAmount * 1.2)}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-gray-900/50">
                  <div className="text-sm text-gray-400 mb-1">ROI</div>
                  <div className="text-2xl font-bold text-green-400">120%</div>
                </div>
              </div>
            </div>
          )}

          {isPro && (
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-bold mb-4">🏆 Pro Feature: Tax Advisor Integration</h2>
              <p className="text-gray-300 mb-4">
                Connect with a CPA to understand the tax implications of your cash-out refinance.
              </p>
              <button className="px-6 py-3 rounded-lg bg-[#06b6d4] hover:bg-[#0891b2] transition-colors text-white font-semibold">
                Schedule Tax Consultation
              </button>
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
          Back to Optimizer
        </button>
      </div>
    </motion.div>
  )
}

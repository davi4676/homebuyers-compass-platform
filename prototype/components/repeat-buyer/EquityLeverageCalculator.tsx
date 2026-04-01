'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, DollarSign, TrendingUp, Calculator, Lock, ArrowRight, BarChart3 } from 'lucide-react'
import { UserTier } from '@/lib/tiers'
import { formatCurrency } from '@/lib/calculations'
import Link from 'next/link'

interface EquityData {
  currentHomeValue: number
  mortgageBalance: number
  newHomePrice: number
}

interface EquityLeverageCalculatorProps {
  userTier: UserTier
  equityData: EquityData
  onDataChange: (data: EquityData) => void
  onBack: () => void
  onUpgrade: (tier: UserTier) => void
}

export default function EquityLeverageCalculator({
  userTier,
  equityData,
  onDataChange,
  onBack,
  onUpgrade,
}: EquityLeverageCalculatorProps) {
  const isPremium = userTier === 'momentum' || userTier === 'navigator'
  const isPro = userTier === 'navigator'

  const [data, setData] = useState(equityData)

  const handleChange = (field: keyof EquityData, value: number) => {
    const newData = { ...data, [field]: value }
    setData(newData)
    onDataChange(newData)
  }

  const availableEquity = data.currentHomeValue - data.mortgageBalance
  const equityPercent = (availableEquity / data.currentHomeValue) * 100

  // Calculate different financing options
  const helocRate = 0.075 // 7.5% typical HELOC rate
  const cashOutRefiRate = 0.062 // 6.2% cash-out refi rate
  const bridgeLoanRate = 0.095 // 9.5% bridge loan rate

  const helocMonthlyPayment = (availableEquity * 0.5 * helocRate) / 12 // Using 50% of equity
  const cashOutRefiMonthlyPayment = (availableEquity * cashOutRefiRate) / 12
  const bridgeLoanMonthlyPayment = (availableEquity * bridgeLoanRate) / 12

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 rounded-lg bg-gray-900 hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold">Equity Leverage Calculator</h1>
          <p className="text-gray-400">Calculate and optimize your available equity</p>
        </div>
      </div>

      {/* Equity Overview */}
      <div className="bg-gradient-to-br from-[#06b6d4]/20 to-[#22d3ee]/20 rounded-xl p-6 border border-[#06b6d4]/30">
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-gray-400 mb-2">Available Equity</div>
            <div className="text-4xl font-bold text-white">{formatCurrency(availableEquity)}</div>
            <div className="text-sm text-gray-400 mt-1">{equityPercent.toFixed(1)}% of home value</div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-2">Current Home Value</div>
            <div className="text-3xl font-bold text-[#06b6d4]">
              {formatCurrency(data.currentHomeValue)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-2">Mortgage Balance</div>
            <div className="text-3xl font-bold text-gray-300">
              {formatCurrency(data.mortgageBalance)}
            </div>
          </div>
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Calculator className="w-6 h-6 text-[#06b6d4]" />
          Update Your Numbers
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Current Home Value
            </label>
            <input
              type="number"
              value={data.currentHomeValue}
              onChange={(e) => handleChange('currentHomeValue', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:border-[#06b6d4] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Mortgage Balance
            </label>
            <input
              type="number"
              value={data.mortgageBalance}
              onChange={(e) => handleChange('mortgageBalance', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:border-[#06b6d4] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              New Home Price
            </label>
            <input
              type="number"
              value={data.newHomePrice}
              onChange={(e) => handleChange('newHomePrice', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:border-[#06b6d4] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Financing Options Comparison */}
      {isPremium ? (
        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#06b6d4]" />
            Financing Options Comparison
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {/* HELOC */}
            <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
              <h3 className="font-semibold mb-3">HELOC</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Rate:</span>
                  <span className="font-semibold">{(helocRate * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Monthly Payment:</span>
                  <span className="font-semibold">{formatCurrency(helocMonthlyPayment)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tax Deductible:</span>
                  <span className="text-green-400">Yes*</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-500">
                *If used for home improvements
              </div>
            </div>

            {/* Cash-Out Refi */}
            <div className="p-4 rounded-lg bg-gray-800/50 border border-[#06b6d4]">
              <h3 className="font-semibold mb-3">Cash-Out Refinance</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Rate:</span>
                  <span className="font-semibold">{(cashOutRefiRate * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Monthly Payment:</span>
                  <span className="font-semibold">{formatCurrency(cashOutRefiMonthlyPayment)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tax Deductible:</span>
                  <span className="text-green-400">Yes</span>
                </div>
              </div>
            </div>

            {/* Bridge Loan */}
            <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
              <h3 className="font-semibold mb-3">Bridge Loan</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Rate:</span>
                  <span className="font-semibold">{(bridgeLoanRate * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Monthly Payment:</span>
                  <span className="font-semibold">{formatCurrency(bridgeLoanMonthlyPayment)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Best For:</span>
                  <span className="text-yellow-400">Short-term</span>
                </div>
              </div>
            </div>
          </div>

          {isPro && (
            <div className="mt-6 p-4 rounded-lg bg-[#06b6d4]/10 border border-[#06b6d4]/20">
              <h3 className="font-semibold text-[#06b6d4] mb-2">
                🏆 Pro Feature: Real-Time HELOC Rate Comparisons
              </h3>
              <p className="text-sm text-gray-300">
                Compare HELOC rates from multiple lenders in your area. Get personalized
                recommendations based on your credit profile and equity position.
              </p>
              <button className="mt-3 px-4 py-2 rounded-lg bg-[#06b6d4] hover:bg-[#0891b2] transition-colors text-sm text-white">
                Compare HELOC Rates
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-6 h-6 text-yellow-400" />
            <h2 className="text-xl font-bold">Premium Feature</h2>
          </div>
          <p className="text-gray-300 mb-4">
            Upgrade to Premium to see detailed financing options comparison, tax implications, and
            personalized recommendations.
          </p>
          <button
            onClick={() => onUpgrade('momentum')}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#06b6d4] to-[#22d3ee] text-white font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            Upgrade to Premium
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Down Payment Calculation */}
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
        <h2 className="text-xl font-bold mb-4">Down Payment Scenarios</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-gray-800/50">
            <div className="text-sm text-gray-400 mb-1">3% Down Payment</div>
            <div className="text-2xl font-bold text-[#06b6d4]">
              {formatCurrency(data.newHomePrice * 0.03)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {availableEquity >= data.newHomePrice * 0.03 ? (
                <span className="text-green-400">✓ You have enough equity</span>
              ) : (
                <span className="text-red-400">
                  Need {formatCurrency(data.newHomePrice * 0.03 - availableEquity)} more
                </span>
              )}
            </div>
          </div>
          <div className="p-4 rounded-lg bg-gray-800/50">
            <div className="text-sm text-gray-400 mb-1">10% Down Payment</div>
            <div className="text-2xl font-bold text-[#06b6d4]">
              {formatCurrency(data.newHomePrice * 0.1)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {availableEquity >= data.newHomePrice * 0.1 ? (
                <span className="text-green-400">✓ You have enough equity</span>
              ) : (
                <span className="text-red-400">
                  Need {formatCurrency(data.newHomePrice * 0.1 - availableEquity)} more
                </span>
              )}
            </div>
          </div>
          <div className="p-4 rounded-lg bg-gray-800/50 border border-[#06b6d4]">
            <div className="text-sm text-gray-400 mb-1">20% Down Payment</div>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(data.newHomePrice * 0.2)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {availableEquity >= data.newHomePrice * 0.2 ? (
                <span className="text-green-400">✓ You have enough equity</span>
              ) : (
                <span className="text-red-400">
                  Need {formatCurrency(data.newHomePrice * 0.2 - availableEquity)} more
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-800">
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-lg bg-gray-900 hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Suite
        </button>
        {isPremium && (
          <Link
            href="/repeat-buyer-suite?phase=simultaneous"
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#06b6d4] to-[#22d3ee] text-white font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            Continue to Buy-Sell Orchestrator
            <ArrowRight className="w-5 h-5" />
          </Link>
        )}
      </div>
    </motion.div>
  )
}

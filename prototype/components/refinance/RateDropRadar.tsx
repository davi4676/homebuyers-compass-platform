'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Bell, TrendingDown, DollarSign, AlertCircle, CheckCircle } from 'lucide-react'
import { UserTier } from '@/lib/tiers'
import { formatCurrency } from '@/lib/calculations'

interface RefinanceData {
  currentRate: number
  currentBalance: number
  homeValue: number
  yearsRemaining: number
}

interface RateDropRadarProps {
  userTier: UserTier
  refinanceData: RefinanceData
  onDataChange: (data: RefinanceData) => void
  onBack: () => void
  onUpgrade: (tier: UserTier) => void
}

export default function RateDropRadar({
  userTier,
  refinanceData,
  onDataChange,
  onBack,
  onUpgrade,
}: RateDropRadarProps) {
  const [data, setData] = useState(refinanceData)
  const currentMarketRate = 5.5 // Example market rate
  const rateDifference = data.currentRate - currentMarketRate

  const calculateBreakEven = () => {
    const closingCosts = 5000 // Example
    const monthlySavings = ((data.currentRate - currentMarketRate) / 100 / 12) * data.currentBalance
    return closingCosts / monthlySavings
  }

  const breakEvenMonths = calculateBreakEven()
  const monthlySavings = ((data.currentRate - currentMarketRate) / 100 / 12) * data.currentBalance
  const annualSavings = monthlySavings * 12

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
          <h1 className="text-3xl font-bold">Rate Drop Radar</h1>
          <p className="text-gray-400">Monitor rates and get alerts when refinancing makes sense</p>
        </div>
      </div>

      {/* Rate Comparison */}
      <div className="bg-gradient-to-br from-[#06b6d4]/20 to-[#22d3ee]/20 rounded-xl p-6 border border-[#06b6d4]/30">
        <h2 className="text-xl font-bold mb-4">Current Rate vs. Market</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-4 rounded-lg bg-gray-900/50">
            <div className="text-sm text-gray-400 mb-1">Your Current Rate</div>
            <div className="text-4xl font-bold text-white">{data.currentRate.toFixed(2)}%</div>
          </div>
          <div className="p-4 rounded-lg bg-gray-900/50">
            <div className="text-sm text-gray-400 mb-1">Current Market Rate</div>
            <div className="text-4xl font-bold text-[#06b6d4]">{currentMarketRate.toFixed(2)}%</div>
          </div>
        </div>
        {rateDifference > 0.5 && (
          <div className="mt-4 p-4 rounded-lg bg-green-900/20 border border-green-500/30">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="font-semibold text-green-400">Refinance Opportunity Detected!</span>
            </div>
            <p className="text-sm text-gray-300">
              Rates have dropped {rateDifference.toFixed(2)}% since you got your mortgage. You could
              save {formatCurrency(annualSavings)} per year.
            </p>
          </div>
        )}
      </div>

      {/* Savings Analysis */}
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
        <h2 className="text-xl font-bold mb-4">Potential Savings</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-gray-800/50">
            <div className="text-sm text-gray-400 mb-1">Monthly Savings</div>
            <div className="text-3xl font-bold text-[#06b6d4]">{formatCurrency(monthlySavings)}</div>
          </div>
          <div className="p-4 rounded-lg bg-gray-800/50">
            <div className="text-sm text-gray-400 mb-1">Annual Savings</div>
            <div className="text-3xl font-bold text-white">{formatCurrency(annualSavings)}</div>
          </div>
          <div className="p-4 rounded-lg bg-gray-800/50">
            <div className="text-sm text-gray-400 mb-1">Break-Even Point</div>
            <div className="text-3xl font-bold text-white">{breakEvenMonths.toFixed(1)} months</div>
          </div>
        </div>
      </div>

      {/* Alert Settings */}
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Bell className="w-6 h-6 text-[#06b6d4]" />
          Rate Alert Settings
        </h2>
        <div className="space-y-4">
          <label className="flex items-center gap-3 p-4 rounded-lg bg-gray-800/50 cursor-pointer hover:bg-gray-800">
            <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-gray-700" />
            <div>
              <div className="font-semibold">Rate Drop Alert</div>
              <div className="text-sm text-gray-400">
                Notify me when rates drop 0.5% or more
              </div>
            </div>
          </label>
          <label className="flex items-center gap-3 p-4 rounded-lg bg-gray-800/50 cursor-pointer hover:bg-gray-800">
            <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-gray-700" />
            <div>
              <div className="font-semibold">Break-Even Alert</div>
              <div className="text-sm text-gray-400">
                Alert when break-even point is under 24 months
              </div>
            </div>
          </label>
        </div>
      </div>

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

'use client'

import { motion } from 'framer-motion'
import { DollarSign, TrendingUp, Target, Lock, CheckCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/calculations'
import { type UserTier } from '@/lib/tiers'
import SavingsThermometer from '@/components/visuals/SavingsThermometer'

interface SavingsData {
  downPaymentTarget: number
  currentSavings: number
  closingCostEstimate: number
  potentialSavings: {
    downPayment: number
    closingCosts: number
    total: number
  }
}

interface SavingsDashboardProps {
  savingsData: SavingsData
  userTier: UserTier
  onDataChange: (data: SavingsData) => void
}

export default function SavingsDashboard({
  savingsData,
  userTier,
  onDataChange,
}: SavingsDashboardProps) {
  const downPaymentProgress = savingsData.downPaymentTarget > 0
    ? (savingsData.currentSavings / savingsData.downPaymentTarget) * 100
    : 0

  const totalTarget = savingsData.downPaymentTarget + savingsData.closingCostEstimate
  const totalCurrent = savingsData.currentSavings
  const totalPotential = savingsData.potentialSavings.total

  return (
    <div className="space-y-6">
      {/* Overall Savings Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 rounded-2xl border border-[#50C878]/30 p-8"
      >
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="text-center p-6 rounded-xl bg-gradient-to-br from-[#06b6d4]/20 to-[#22d3ee]/20 border border-[#06b6d4]/30">
            <DollarSign className="w-8 h-8 text-[#06b6d4] mx-auto mb-2" />
            <div className="text-3xl font-bold text-white mb-1">
              {formatCurrency(savingsData.potentialSavings.downPayment)}
            </div>
            <div className="text-sm text-gray-400">Down Payment Savings</div>
          </div>

          <div className="text-center p-6 rounded-xl bg-gradient-to-br from-[#50C878]/20 to-[#228B22]/20 border border-[#50C878]/30">
            <TrendingUp className="w-8 h-8 text-[#50C878] mx-auto mb-2" />
            <div className="text-3xl font-bold text-white mb-1">
              {formatCurrency(savingsData.potentialSavings.closingCosts)}
            </div>
            <div className="text-sm text-gray-400">Closing Cost Savings</div>
          </div>

          <div className="text-center p-6 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-[#FFD700]/20 border border-[#D4AF37]/30">
            <Target className="w-8 h-8 text-[#D4AF37] mx-auto mb-2" />
            <div className="text-3xl font-bold text-white mb-1">
              {formatCurrency(savingsData.potentialSavings.total)}
            </div>
            <div className="text-sm text-gray-400">Total Potential Savings</div>
          </div>
        </div>

        {/* Tier-Specific View */}
        {userTier === 'foundations' && (
          <div className="mt-6 p-4 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-[#D4AF37] mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold text-[#D4AF37] mb-1">
                  Upgrade to Premium to unlock personalized optimization
                </div>
                <div className="text-sm text-gray-400 mb-3">
                  Premium users save an average of 2.5x more on down payment and closing costs
                  through personalized strategies and negotiation tools.
                </div>
                <button
                  onClick={() => (window.location.href = '/upgrade?tier=momentum&feature=downPaymentOptimizer')}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-[#003366] font-semibold hover:opacity-90 transition-opacity"
                >
                  Upgrade to Premium
                </button>
              </div>
            </div>
          </div>
        )}

        {userTier === 'momentum' && (
          <div className="mt-6 p-4 rounded-lg bg-[#06b6d4]/10 border border-[#06b6d4]/30">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-[#06b6d4] mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold text-[#06b6d4] mb-1">
                  Upgrade to Pro for AI-powered optimization
                </div>
                <div className="text-sm text-gray-400 mb-3">
                  Pro users get AI-powered down payment source blending, automated closing cost
                  negotiation, and document automation—saving an average of $15,000+.
                </div>
                <button
                  onClick={() => (window.location.href = '/upgrade?tier=navigator&feature=downPaymentOptimizer')}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#06b6d4] to-[#22d3ee] text-white font-semibold hover:opacity-90 transition-opacity"
                >
                  Upgrade to Pro
                </button>
              </div>
            </div>
          </div>
        )}

        {userTier === 'navigator' && (
          <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-[#50C878]/20 to-[#228B22]/20 border border-[#50C878]/30">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-[#50C878] mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold text-[#50C878] mb-1">
                  🏆 Pro Features Active
                </div>
                <div className="text-sm text-gray-300">
                  AI-powered optimization, automated negotiation, and document automation are
                  working to maximize your savings.
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Progress Visualization */}
      <div className="grid md:grid-cols-2 gap-6">
        <SavingsThermometer
          current={savingsData.currentSavings}
          target={savingsData.downPaymentTarget}
          label="Down Payment Progress"
          showTarget={true}
        />

        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 rounded-2xl border border-gray-800 p-6">
          <h3 className="text-xl font-bold mb-4">Closing Cost Reduction</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Estimated Closing Costs</span>
                <span className="text-white font-semibold">
                  {formatCurrency(savingsData.closingCostEstimate)}
                </span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-gray-600 to-gray-500"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[#50C878]">Potential Savings</span>
                <span className="text-[#50C878] font-semibold">
                  {formatCurrency(savingsData.potentialSavings.closingCosts)}
                </span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#50C878] to-[#228B22]"
                  style={{
                    width: `${(savingsData.potentialSavings.closingCosts / savingsData.closingCostEstimate) * 100}%`,
                  }}
                />
              </div>
            </div>
            <div className="pt-4 border-t border-gray-800">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Final Closing Costs</span>
                <span className="text-2xl font-bold text-white">
                  {formatCurrency(
                    savingsData.closingCostEstimate - savingsData.potentialSavings.closingCosts
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

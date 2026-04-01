/**
 * Repeat Buyer Results Component
 * Displays comprehensive analysis for buyers selling current home to buy next one
 */

'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Home, DollarSign, AlertTriangle, CheckCircle, Info, Lock } from 'lucide-react'
import type { RepeatBuyerData, RepeatBuyerAnalysis } from '@/lib/calculations-repeat-buyer'
import type { UserTier } from '@/lib/tiers'
import { formatCurrency } from '@/lib/calculations'
import { hasFeature } from '@/lib/tiers'

interface RepeatBuyerResultsProps {
  data: RepeatBuyerData
  analysis: RepeatBuyerAnalysis
  userTier: UserTier
  onUpgrade?: () => void
}

export default function RepeatBuyerResults({
  data,
  analysis,
  userTier,
  onUpgrade,
}: RepeatBuyerResultsProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5] font-sans">
      {/* Hero Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#0a0a0a] via-[#0f172a] to-[#0a0a0a]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-6xl md:text-7xl font-bold mb-3 bg-gradient-to-r from-[#f5f5f5] to-[#06b6d4] bg-clip-text text-transparent">
              Your Equity Position & Upgrade Strategy
            </h1>
            <div className="text-5xl font-bold text-[#06b6d4] mb-6">
              {formatCurrency(analysis.newPurchase.totalDownPayment)}
            </div>
            <p className="text-2xl text-gray-400">
              Net proceeds available for your next purchase
            </p>
          </motion.div>
        </div>
      </section>

      {/* Equity Analysis Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-8">What You&apos;re Working With</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Current Home */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900/50 border border-gray-800 rounded-xl p-6"
            >
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Home className="text-[#06b6d4]" size={24} />
                Current Home
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Estimated Value:</span>
                  <span className="font-bold">{formatCurrency(analysis.equityPosition.currentHomeValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Mortgage Balance:</span>
                  <span className="font-bold">{formatCurrency(analysis.equityPosition.mortgageBalance)}</span>
                </div>
                <div className="flex justify-between text-[#06b6d4]">
                  <span className="font-semibold">Gross Equity:</span>
                  <span className="font-bold text-2xl">{formatCurrency(analysis.equityPosition.grossEquity)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Equity %:</span>
                  <span className="font-bold">{analysis.equityPosition.equityPercent.toFixed(1)}%</span>
                </div>
              </div>
            </motion.div>

            {/* Sale Proceeds Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-900/50 border border-gray-800 rounded-xl p-6"
            >
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <DollarSign className="text-[#10b981]" size={24} />
                Sale Proceeds Breakdown
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Sale Price:</span>
                  <span>{formatCurrency(analysis.saleProceeds.salePrice)}</span>
                </div>
                <div className="flex justify-between text-red-400">
                  <span>Mortgage Payoff:</span>
                  <span>-{formatCurrency(analysis.saleProceeds.mortgagePayoff)}</span>
                </div>
                <div className="flex justify-between text-red-400">
                  <span>Agent Commission ({data.agentCommission}%):</span>
                  <span>-{formatCurrency(analysis.saleProceeds.agentCommission)}</span>
                </div>
                <div className="flex justify-between text-red-400">
                  <span>Closing Costs:</span>
                  <span>-{formatCurrency(analysis.saleProceeds.sellerClosingCosts)}</span>
                </div>
                <div className="flex justify-between text-red-400">
                  <span>Repairs/Concessions:</span>
                  <span>-{formatCurrency(analysis.saleProceeds.repairsAndConcessions)}</span>
                </div>
                {analysis.saleProceeds.taxes.taxLiability > 0 && (
                  <div className="flex justify-between text-red-400">
                    <span>Capital Gains Tax:</span>
                    <span>-{formatCurrency(analysis.saleProceeds.taxes.taxLiability)}</span>
                  </div>
                )}
                <div className="border-t border-gray-700 pt-2 mt-2">
                  <div className="flex justify-between text-[#06b6d4] font-bold text-xl">
                    <span>NET PROCEEDS:</span>
                    <span>{formatCurrency(analysis.saleProceeds.netProceeds)}</span>
                  </div>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-gray-400">+ Additional Savings:</span>
                  <span>{formatCurrency(data.additionalSavings)}</span>
                </div>
                <div className="border-t border-[#06b6d4] pt-2 mt-2">
                  <div className="flex justify-between text-[#06b6d4] font-bold text-2xl">
                    <span>TOTAL DOWN PAYMENT POWER:</span>
                    <span>{formatCurrency(analysis.newPurchase.totalDownPayment)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Comparison Callout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-[#06b6d4]/20 to-[#0891b2]/20 border border-[#06b6d4]/30 rounded-xl p-6"
          >
            <p className="text-xl text-gray-300">
              This gives you <strong className="text-[#06b6d4]">{analysis.newPurchase.downPaymentPercent.toFixed(1)}%</strong> down payment on a{' '}
              <strong className="text-[#06b6d4]">{formatCurrency(analysis.newPurchase.totalDownPayment / (analysis.newPurchase.downPaymentPercent / 100))}</strong> home, 
              compared to the typical first-time buyer with <strong>10%</strong> down. Your equity gives you a{' '}
              <strong className="text-[#10b981]">{formatCurrency(analysis.newPurchase.comparedToFirstTime.advantageAmount)}</strong> advantage.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Upgrade Analysis Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-8">Old Home vs. New Home Comparison</h2>

          <div className="overflow-x-auto">
            <table className="w-full bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-gray-800/50">
                  <th className="px-6 py-4 text-left text-xl font-bold">Metric</th>
                  <th className="px-6 py-4 text-center text-xl font-bold">Current Home</th>
                  <th className="px-6 py-4 text-center text-xl font-bold">New Home Target</th>
                </tr>
              </thead>
              <tbody className="text-lg">
                <tr className="border-t border-gray-700">
                  <td className="px-6 py-4 text-gray-400">Home Value</td>
                  <td className="px-6 py-4 text-center">{formatCurrency(analysis.comparison.oldHome.value)}</td>
                  <td className="px-6 py-4 text-center">{formatCurrency(analysis.comparison.newHome.targetPrice)}</td>
                </tr>
                <tr className="border-t border-gray-700">
                  <td className="px-6 py-4 text-gray-400">Loan Amount</td>
                  <td className="px-6 py-4 text-center">{formatCurrency(analysis.comparison.oldHome.remainingBalance)}</td>
                  <td className="px-6 py-4 text-center">{formatCurrency(analysis.newPurchase.newLoanAmount)}</td>
                </tr>
                <tr className="border-t border-gray-700">
                  <td className="px-6 py-4 text-gray-400">Interest Rate</td>
                  <td className="px-6 py-4 text-center">{analysis.comparison.oldHome.rate}%</td>
                  <td className="px-6 py-4 text-center">{analysis.comparison.newHome.rate}%</td>
                </tr>
                <tr className="border-t border-gray-700">
                  <td className="px-6 py-4 text-gray-400">Monthly Payment</td>
                  <td className="px-6 py-4 text-center">{formatCurrency(analysis.comparison.oldHome.payment)}</td>
                  <td className="px-6 py-4 text-center">{formatCurrency(analysis.comparison.newHome.payment)}</td>
                </tr>
                <tr className="border-t border-gray-700">
                  <td className="px-6 py-4 text-gray-400">Equity Position</td>
                  <td className="px-6 py-4 text-center">{formatCurrency(analysis.comparison.oldHome.equityBuilt)}</td>
                  <td className="px-6 py-4 text-center text-[#06b6d4]">{formatCurrency(analysis.comparison.newHome.equityDay1)}</td>
                </tr>
                <tr className="border-t-2 border-[#06b6d4] bg-[#06b6d4]/10">
                  <td className="px-6 py-4 font-bold">Monthly Cash Flow Change</td>
                  <td colSpan={2} className="px-6 py-4 text-center">
                    <span className={`text-2xl font-bold ${analysis.comparison.cashFlowChange >= 0 ? 'text-[#10b981]' : 'text-red-400'}`}>
                      {analysis.comparison.cashFlowChange >= 0 ? '+' : ''}{formatCurrency(analysis.comparison.cashFlowChange)}/month
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Timing Strategy Section - Always visible for repeat buyers */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-8">Closing Coordination Strategy</h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900/50 border border-gray-800 rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="text-[#10b981]" size={24} />
              <h3 className="text-2xl font-bold">Recommended: {analysis.timing.recommendation.replace('-', ' ').toUpperCase()}</h3>
            </div>
            <p className="text-lg text-gray-300 mb-4">{analysis.timing.reasoning}</p>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-gray-400">Risk Level:</span>
              <span className={`font-semibold ${
                analysis.timing.riskLevel === 'low' ? 'text-[#10b981]' :
                analysis.timing.riskLevel === 'medium' ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {analysis.timing.riskLevel.toUpperCase()}
              </span>
            </div>
            {analysis.timing.bridgeLoanCost && (
              <div className="mt-4 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                <p className="text-sm text-yellow-200">
                  Estimated bridge loan cost: {formatCurrency(analysis.timing.bridgeLoanCost)}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Tax Implications Section */}
      {analysis.saleProceeds.taxes.taxLiability > 0 && (
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900/30">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold mb-8">Tax Implications</h2>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900/50 border border-gray-800 rounded-xl p-6"
            >
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Gain:</span>
                  <span>{formatCurrency(analysis.saleProceeds.taxes.capitalGains)}</span>
                </div>
                <div className="flex justify-between text-[#10b981]">
                  <span>Capital Gains Exclusion:</span>
                  <span>-{formatCurrency(analysis.saleProceeds.taxes.capitalGainsExclusion)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Taxable Gain:</span>
                  <span>{formatCurrency(analysis.saleProceeds.taxes.capitalGains - analysis.saleProceeds.taxes.capitalGainsExclusion)}</span>
                </div>
                <div className="border-t border-gray-700 pt-4">
                  <div className="flex justify-between text-red-400 font-bold text-xl">
                    <span>Estimated Tax Liability:</span>
                    <span>{formatCurrency(analysis.saleProceeds.taxes.taxLiability)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Advantages Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-8">Why Your Equity Gives You an Edge</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {analysis.newPurchase.avoidsPMI && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900/50 border border-gray-800 rounded-xl p-6"
              >
                <h3 className="text-xl font-bold mb-2 text-[#10b981]">✓ No PMI</h3>
                <p className="text-gray-400">With {analysis.newPurchase.downPaymentPercent.toFixed(1)}% down, you avoid PMI entirely.</p>
              </motion.div>
            )}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-900/50 border border-gray-800 rounded-xl p-6"
            >
              <h3 className="text-xl font-bold mb-2 text-[#06b6d4]">Better Interest Rates</h3>
              <p className="text-gray-400">Lower LTV = Better rates. Potential savings over loan life.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-900/50 border border-gray-800 rounded-xl p-6"
            >
              <h3 className="text-xl font-bold mb-2 text-[#f97316]">Stronger Negotiating Position</h3>
              <p className="text-gray-400">Larger down payment signals strength. May waive financing contingency.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-900/50 border border-gray-800 rounded-xl p-6"
            >
              <h3 className="text-xl font-bold mb-2 text-[#10b981]">Wealth Building Acceleration</h3>
              <p className="text-gray-400">Start with {formatCurrency(analysis.comparison.newHome.equityDay1)} equity (not $0). Build wealth faster.</p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}

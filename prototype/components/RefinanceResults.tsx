/**
 * Refinance Results Component
 * Displays comprehensive refinance analysis
 */

'use client'

import { motion } from 'framer-motion'
import { RefreshCw, TrendingDown, TrendingUp, AlertTriangle, CheckCircle, Info, Lock } from 'lucide-react'
import type { RefinanceData, RefinanceAnalysis } from '@/lib/calculations-refinance'
import type { UserTier } from '@/lib/tiers'
import { formatCurrency } from '@/lib/calculations'
import { hasFeature } from '@/lib/tiers'

interface RefinanceResultsProps {
  data: RefinanceData
  analysis: RefinanceAnalysis
  userTier: UserTier
  onUpgrade: () => void
}

export default function RefinanceResults({
  data,
  analysis,
  userTier,
  onUpgrade,
}: RefinanceResultsProps) {
  const bestOption = analysis.newLoanOptions.rateAndTerm
  const netSavings = analysis.lifetimeAnalysis.netSavings

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
              Should You Refinance? Here&apos;s The Math
            </h1>
            <div className={`text-5xl font-bold mb-6 ${netSavings >= 0 ? 'text-[#10b981]' : 'text-red-400'}`}>
              {netSavings >= 0 ? '+' : ''}{formatCurrency(netSavings)}
            </div>
            <p className="text-2xl text-gray-400">
              {netSavings >= 0 ? 'Net savings' : 'Net cost'} over loan life
            </p>
          </motion.div>
        </div>
      </section>

      {/* Current vs New Comparison */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-8">Current vs. New Comparison</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-900/50 border border-gray-800 rounded-xl p-6"
            >
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <AlertTriangle className="text-red-400" size={24} />
                Current Situation
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Rate:</span>
                  <span className="font-bold">{analysis.currentSituation.rate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Monthly Payment:</span>
                  <span className="font-bold">{formatCurrency(analysis.currentSituation.monthlyPayment)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Years Remaining:</span>
                  <span className="font-bold">{analysis.currentSituation.yearsRemaining}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Interest Remaining:</span>
                  <span className="font-bold text-red-400">{formatCurrency(analysis.currentSituation.totalInterestRemaining)}</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-900/50 border border-[#06b6d4] rounded-xl p-6"
            >
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <CheckCircle className="text-[#10b981]" size={24} />
                Best Refinance Option
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">New Rate:</span>
                  <span className="font-bold text-[#10b981]">{bestOption.newRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">New Payment:</span>
                  <span className="font-bold">{formatCurrency(bestOption.newMonthlyPayment)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">New Term:</span>
                  <span className="font-bold">{bestOption.newTerm} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Interest:</span>
                  <span className="font-bold text-[#10b981]">{formatCurrency(bestOption.totalInterest)}</span>
                </div>
                <div className="border-t border-[#06b6d4] pt-2 mt-2">
                  <div className="flex justify-between text-[#10b981] font-bold">
                    <span>vs. Current Savings:</span>
                    <span>{formatCurrency(bestOption.vsCurrentSavings)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Break-Even Analysis */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-8">Break-Even Analysis</h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900/50 border border-gray-800 rounded-xl p-6"
          >
            <div className="text-center mb-6">
              <div className="text-5xl font-bold text-[#06b6d4] mb-2">
                {analysis.breakEvenAnalysis.breakEvenMonths} months
              </div>
              <p className="text-xl text-gray-400">to recoup closing costs</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-gray-400 mb-1">Closing Costs</div>
                <div className="text-2xl font-bold">{formatCurrency(analysis.breakEvenAnalysis.closingCosts)}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-400 mb-1">Monthly Savings</div>
                <div className="text-2xl font-bold text-[#10b981]">
                  {formatCurrency(analysis.breakEvenAnalysis.monthlySavings)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-400 mb-1">Break-Even Date</div>
                <div className="text-2xl font-bold">{analysis.breakEvenAnalysis.breakEvenDate}</div>
              </div>
            </div>

            <div className={`p-4 rounded-lg border-2 ${
              analysis.breakEvenAnalysis.worthIt
                ? 'bg-[#10b981]/20 border-[#10b981]'
                : 'bg-yellow-500/20 border-yellow-500'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {analysis.breakEvenAnalysis.worthIt ? (
                  <CheckCircle className="text-[#10b981]" size={24} />
                ) : (
                  <AlertTriangle className="text-yellow-400" size={24} />
                )}
                <h3 className="text-xl font-bold">
                  {analysis.breakEvenAnalysis.worthIt
                    ? '✓ Refinancing makes financial sense'
                    : '⚠️ Depends on how long you\'ll stay'}
                </h3>
              </div>
              <p className="text-gray-300">{analysis.breakEvenAnalysis.reasoning}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Recommendation */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-8">Our Recommendation</h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-[#06b6d4]/20 to-[#0891b2]/20 border border-[#06b6d4]/30 rounded-xl p-6"
          >
            <div className="flex items-start gap-4 mb-4">
              {analysis.recommendation.bestOption === 'dont-refinance' ? (
                <AlertTriangle className="text-yellow-400" size={32} />
              ) : (
                <CheckCircle className="text-[#10b981]" size={32} />
              )}
              <div>
                <h3 className="text-2xl font-bold mb-2">
                  {analysis.recommendation.bestOption === 'dont-refinance'
                    ? 'Consider Waiting'
                    : `Best Option: ${analysis.recommendation.bestOption.replace('-', ' ').toUpperCase()}`}
                </h3>
                <p className="text-lg text-gray-300 mb-2">{analysis.recommendation.reasoning}</p>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Confidence:</span>
                  <span className={`font-semibold ${
                    analysis.recommendation.confidence === 'high' ? 'text-[#10b981]' :
                    analysis.recommendation.confidence === 'medium' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {analysis.recommendation.confidence.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Lifetime Analysis */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-8">Lifetime Analysis</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-900/50 border border-gray-800 rounded-xl p-6"
            >
              <h3 className="text-xl font-bold mb-4">Current Path</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Interest:</span>
                  <span>{formatCurrency(analysis.lifetimeAnalysis.currentPath.totalInterest)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Paid:</span>
                  <span>{formatCurrency(analysis.lifetimeAnalysis.currentPath.totalPaid)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Payoff Date:</span>
                  <span>{analysis.lifetimeAnalysis.currentPath.payoffDate}</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-900/50 border border-[#06b6d4] rounded-xl p-6"
            >
              <h3 className="text-xl font-bold mb-4">Refinance Path</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Interest:</span>
                  <span className="text-[#10b981]">{formatCurrency(analysis.lifetimeAnalysis.refinancePath.totalInterest)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Closing Costs:</span>
                  <span>{formatCurrency(analysis.lifetimeAnalysis.refinancePath.closingCosts)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Paid:</span>
                  <span>{formatCurrency(analysis.lifetimeAnalysis.refinancePath.totalPaid)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Payoff Date:</span>
                  <span>{analysis.lifetimeAnalysis.refinancePath.payoffDate}</span>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 bg-gradient-to-r from-[#06b6d4]/20 to-[#0891b2]/20 border border-[#06b6d4]/30 rounded-xl p-6 text-center"
          >
            <div className="text-4xl font-bold mb-2">
              <span className={netSavings >= 0 ? 'text-[#10b981]' : 'text-red-400'}>
                {netSavings >= 0 ? 'Save' : 'Cost'}: {formatCurrency(Math.abs(netSavings))}
              </span>
            </div>
            <p className="text-xl text-gray-400">
              Over the life of your loan, refinancing will {netSavings >= 0 ? 'save' : 'cost'} you{' '}
              <strong className="text-white">{formatCurrency(Math.abs(netSavings))}</strong>
            </p>
          </motion.div>
        </div>
      </section>

      {/* All Refinance Options */}
      {hasFeature(userTier, 'hosa.savingsOpportunities') && (
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold mb-8">All Refinance Options</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Rate and Term */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900/50 border border-gray-800 rounded-xl p-6"
              >
                <h3 className="text-xl font-bold mb-4">Rate & Term Refinance</h3>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">New Rate:</span>
                    <span>{bestOption.newRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Monthly Payment:</span>
                    <span>{formatCurrency(bestOption.newMonthlyPayment)}</span>
                  </div>
                  <div className="flex justify-between text-[#10b981]">
                    <span>Savings:</span>
                    <span>{formatCurrency(bestOption.vsCurrentSavings)}</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold mb-2 text-[#10b981]">Pros:</div>
                  <ul className="text-xs space-y-1">
                    {bestOption.pros.map((pro, i) => (
                      <li key={i}>• {pro}</li>
                    ))}
                  </ul>
                </div>
              </motion.div>

              {/* Shorter Term */}
              {analysis.newLoanOptions.shorterTerm && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gray-900/50 border border-gray-800 rounded-xl p-6"
                >
                  <h3 className="text-xl font-bold mb-4">15-Year Refinance</h3>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400">New Rate:</span>
                      <span>{analysis.newLoanOptions.shorterTerm.newRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Monthly Payment:</span>
                      <span>{formatCurrency(analysis.newLoanOptions.shorterTerm.newMonthlyPayment)}</span>
                    </div>
                    <div className="flex justify-between text-[#10b981]">
                      <span>Savings:</span>
                      <span>{formatCurrency(analysis.newLoanOptions.shorterTerm.vsCurrentSavings)}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold mb-2 text-[#10b981]">Pros:</div>
                    <ul className="text-xs space-y-1">
                      {analysis.newLoanOptions.shorterTerm.pros.map((pro, i) => (
                        <li key={i}>• {pro}</li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}

              {/* Lower Payment */}
              {analysis.newLoanOptions.lowerPayment && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gray-900/50 border border-gray-800 rounded-xl p-6"
                >
                  <h3 className="text-xl font-bold mb-4">Lower Payment (Extended Term)</h3>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400">New Rate:</span>
                      <span>{analysis.newLoanOptions.lowerPayment.newRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Monthly Payment:</span>
                      <span className="text-[#10b981]">{formatCurrency(analysis.newLoanOptions.lowerPayment.newMonthlyPayment)}</span>
                    </div>
                    <div className="flex justify-between text-red-400">
                      <span>Cost:</span>
                      <span>{formatCurrency(Math.abs(analysis.newLoanOptions.lowerPayment.vsCurrentSavings))}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold mb-2 text-yellow-400">Trade-offs:</div>
                    <ul className="text-xs space-y-1">
                      {analysis.newLoanOptions.lowerPayment.cons.map((con, i) => (
                        <li key={i}>• {con}</li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}

              {/* Cash Out */}
              {analysis.newLoanOptions.cashOut && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gray-900/50 border border-gray-800 rounded-xl p-6"
                >
                  <h3 className="text-xl font-bold mb-4">Cash-Out Refinance</h3>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Cash Out:</span>
                      <span className="text-[#06b6d4]">{formatCurrency(analysis.newLoanOptions.cashOut.cashout || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">New Rate:</span>
                      <span>{analysis.newLoanOptions.cashOut.newRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Monthly Payment:</span>
                      <span>{formatCurrency(analysis.newLoanOptions.cashOut.newMonthlyPayment)}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold mb-2 text-yellow-400">Important:</div>
                    <ul className="text-xs space-y-1">
                      {analysis.newLoanOptions.cashOut.cons.map((con, i) => (
                        <li key={i}>• {con}</li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

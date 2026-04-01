'use client'

import { motion } from 'framer-motion'
import { CheckCircle, AlertTriangle, TrendingDown, Info } from 'lucide-react'
import { formatCurrency } from '@/lib/calculations'

interface RateOption {
  id: string
  lender: string
  rate: number
  apr: number
  closingCosts: number
  monthlyPayment: number
  totalCost: number
  rating: 'good' | 'better' | 'best'
  highlights: string[]
  warnings?: string[]
}

interface RateComparisonMatrixProps {
  options: RateOption[]
  loanAmount: number
  term: number
}

export default function RateComparisonMatrix({
  options,
  loanAmount,
  term,
}: RateComparisonMatrixProps) {
  const sortedOptions = [...options].sort((a, b) => a.totalCost - b.totalCost)
  const bestOption = sortedOptions[0]

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'best':
        return 'from-[#50C878] to-[#228B22]'
      case 'better':
        return 'from-[#D4AF37] to-[#FFD700]'
      case 'good':
        return 'from-[#003366] to-[#004080]'
      default:
        return 'from-gray-700 to-gray-600'
    }
  }

  const getRatingLabel = (rating: string) => {
    switch (rating) {
      case 'best':
        return 'Best Deal'
      case 'better':
        return 'Good Deal'
      case 'good':
        return 'Standard'
      default:
        return 'Compare'
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Rate Comparison Matrix</h2>
        <p className="text-gray-400">
          Compare your options side-by-side. Green indicates savings, red indicates costs.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {sortedOptions.map((option, index) => {
          const isBest = option.id === bestOption.id
          const savings = option.totalCost - bestOption.totalCost

          return (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-xl border-2 p-6 ${
                isBest
                  ? 'border-[#50C878] bg-gradient-to-br from-[#50C878]/20 to-[#228B22]/10'
                  : 'border-gray-800 bg-gray-900/50'
              }`}
            >
              {isBest && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#50C878] to-[#228B22] text-white text-sm font-semibold">
                  Best Deal
                </div>
              )}

              {!isBest && (
                <div className="absolute -top-3 right-4 px-3 py-1 rounded-full bg-gray-800 border border-gray-700 text-gray-400 text-xs">
                  {formatCurrency(savings)} more
                </div>
              )}

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold">{option.lender}</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getRatingColor(
                      option.rating
                    )} text-white`}
                  >
                    {getRatingLabel(option.rating)}
                  </span>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Interest Rate</span>
                  <span className="text-2xl font-bold text-[#50C878]">
                    {option.rate.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">APR</span>
                  <span className="text-lg font-semibold">{option.apr.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Monthly Payment</span>
                  <span className="text-lg font-semibold text-white">
                    {formatCurrency(option.monthlyPayment)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Closing Costs</span>
                  <span className="text-lg font-semibold text-white">
                    {formatCurrency(option.closingCosts)}
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-800">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total {term}-Year Cost</span>
                    <span
                      className={`text-xl font-bold ${
                        isBest ? 'text-[#50C878]' : 'text-white'
                      }`}
                    >
                      {formatCurrency(option.totalCost)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Highlights */}
              <div className="space-y-2 mb-4">
                {option.highlights.map((highlight, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-[#50C878] mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">{highlight}</span>
                  </div>
                ))}
              </div>

              {/* Warnings */}
              {option.warnings && option.warnings.length > 0 && (
                <div className="space-y-2 pt-4 border-t border-gray-800">
                  {option.warnings.map((warning, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="w-4 h-4 text-[#FFBF00] mt-0.5 flex-shrink-0" />
                      <span className="text-yellow-400">{warning}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Button */}
              <button
                className={`w-full mt-4 py-3 px-4 rounded-lg font-semibold transition-all ${
                  isBest
                    ? 'bg-gradient-to-r from-[#50C878] to-[#228B22] text-white hover:opacity-90'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {isBest ? 'Apply Now' : 'Compare Details'}
              </button>
            </motion.div>
          )
        })}
      </div>

      {/* Savings Summary */}
      <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-[#50C878]/20 to-[#228B22]/10 border border-[#50C878]/30">
        <div className="flex items-center gap-3 mb-4">
          <TrendingDown className="w-6 h-6 text-[#50C878]" />
          <h3 className="text-xl font-bold">Potential Savings</h3>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-gray-400 mb-1">Best vs. Worst</div>
            <div className="text-2xl font-bold text-[#50C878]">
              {formatCurrency(
                sortedOptions[sortedOptions.length - 1].totalCost - bestOption.totalCost
              )}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-1">Monthly Savings</div>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(
                sortedOptions[1]?.monthlyPayment
                  ? sortedOptions[1].monthlyPayment - bestOption.monthlyPayment
                  : 0
              )}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-1">Annual Savings</div>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(
                sortedOptions[1]?.monthlyPayment
                  ? (sortedOptions[1].monthlyPayment - bestOption.monthlyPayment) * 12
                  : 0
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

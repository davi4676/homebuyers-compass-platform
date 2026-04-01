'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calculator, TrendingDown, DollarSign, Target } from 'lucide-react'
import { formatCurrency } from '@/lib/calculations'

interface SavingsData {
  loanAmount: number
  creditScore: number
  downPayment: number
  timeline: string
}

interface SavingsCalculatorProps {
  initialData: SavingsData
  onDataChange: (data: SavingsData) => void
  userTier: 'foundations' | 'momentum' | 'navigator'
}

export default function SavingsCalculator({
  initialData,
  onDataChange,
  userTier,
}: SavingsCalculatorProps) {
  const [data, setData] = useState<SavingsData>(initialData)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleChange = (field: keyof SavingsData, value: number | string) => {
    const newData = { ...data, [field]: value }
    setData(newData)
    onDataChange(newData)
  }

  const calculateSavingsRange = () => {
    // Conservative estimate: 0.3% to 15% of loan amount
    const baseMin = data.loanAmount * 0.003
    const baseMax = data.loanAmount * 0.15

    // Adjust based on credit score
    let creditMultiplier = 1
    if (data.creditScore >= 750) creditMultiplier = 1.2
    else if (data.creditScore >= 700) creditMultiplier = 1.0
    else if (data.creditScore >= 650) creditMultiplier = 0.8
    else creditMultiplier = 0.6

    return {
      min: Math.round(baseMin * creditMultiplier),
      max: Math.round(baseMax * creditMultiplier),
      hourlyRate: Math.round((baseMax * creditMultiplier) / 15), // Assuming 15 hours of work
    }
  }

  const savings = calculateSavingsRange()
  const savingsPercent = ((savings.max / data.loanAmount) * 100).toFixed(1)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 rounded-2xl border border-[#06b6d4]/30 p-8 shadow-2xl"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-lg bg-[#06b6d4]/20">
          <Calculator className="w-6 h-6 text-[#06b6d4]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Your Savings Potential</h2>
          <p className="text-gray-400 text-sm">Based on your loan profile</p>
        </div>
      </div>

      {/* Savings Display */}
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <TrendingDown className="w-4 h-4" />
            Minimum Savings
          </div>
          <div className="text-3xl font-bold text-[#06b6d4]">
            {formatCurrency(savings.min)}
          </div>
          <div className="text-xs text-gray-500 mt-1">Conservative estimate</div>
        </div>

        <div className="bg-gradient-to-br from-[#06b6d4]/20 to-[#22d3ee]/20 rounded-xl p-6 border border-[#06b6d4]/30">
          <div className="flex items-center gap-2 text-gray-300 text-sm mb-2">
            <Target className="w-4 h-4" />
            Maximum Potential
          </div>
          <div className="text-3xl font-bold text-white">
            {formatCurrency(savings.max)}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {savingsPercent}% of loan amount
          </div>
        </div>

        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <DollarSign className="w-4 h-4" />
            Hourly Value
          </div>
          <div className="text-3xl font-bold text-[#22d3ee]">
            {formatCurrency(savings.hourlyRate)}
          </div>
          <div className="text-xs text-gray-500 mt-1">Per hour of shopping</div>
        </div>
      </div>

      {/* Input Form */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full py-3 px-4 rounded-lg bg-gray-900/50 border border-gray-800 hover:border-[#06b6d4]/30 transition-colors flex items-center justify-between"
      >
        <span className="text-gray-300">Customize Your Estimate</span>
        <span className="text-[#06b6d4]">{isExpanded ? '−' : '+'}</span>
      </button>

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Loan Amount
            </label>
            <input
              type="number"
              value={data.loanAmount}
              onChange={(e) => handleChange('loanAmount', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-800 text-white focus:border-[#06b6d4] focus:outline-none"
              placeholder="400000"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Credit Score
              </label>
              <input
                type="number"
                value={data.creditScore}
                onChange={(e) => handleChange('creditScore', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-800 text-white focus:border-[#06b6d4] focus:outline-none"
                placeholder="720"
                min="300"
                max="850"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Down Payment
              </label>
              <input
                type="number"
                value={data.downPayment}
                onChange={(e) => handleChange('downPayment', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-800 text-white focus:border-[#06b6d4] focus:outline-none"
                placeholder="80000"
              />
            </div>
          </div>

          {userTier === 'navigator' && (
            <div className="p-4 rounded-lg bg-[#06b6d4]/10 border border-[#06b6d4]/20">
              <p className="text-sm text-gray-300">
                <strong className="text-[#06b6d4]">Pro Feature:</strong> Your personalized
                optimization plan will show exact impact of 5-10 point credit improvements on your
                rates.
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* CTA */}
      <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-[#06b6d4]/10 to-[#22d3ee]/10 border border-[#06b6d4]/20">
        <p className="text-sm text-gray-300 text-center">
          Ready to start your savings journey? Most users spend 10-15 hours shopping and save an
          average of <strong className="text-white">$24,480</strong>.
        </p>
      </div>
    </motion.div>
  )
}

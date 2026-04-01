'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calculator, Zap, TrendingUp, ArrowRight } from 'lucide-react'
import { formatCurrency } from '@/lib/calculations'
import Link from 'next/link'

export default function QuickWinCalculator() {
  const [loanAmount, setLoanAmount] = useState('')
  const [creditScore, setCreditScore] = useState('')
  const [hasResult, setHasResult] = useState(false)

  const calculateSavings = () => {
    if (!loanAmount || !creditScore) return null

    const amount = parseFloat(loanAmount)
    const score = parseInt(creditScore)

    // Simple calculation: 0.3% to 15% of loan amount based on credit score
    const baseMin = amount * 0.003
    const baseMax = amount * 0.15
    const creditMultiplier = score >= 750 ? 1.2 : score >= 700 ? 1.0 : score >= 650 ? 0.8 : 0.6

    return {
      min: Math.round(baseMin * creditMultiplier),
      max: Math.round(baseMax * creditMultiplier),
    }
  }

  const savings = calculateSavings()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-[#003366] to-[#004080] rounded-2xl p-8 border border-[#0055AA] shadow-2xl"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-lg bg-[#D4AF37]/20">
          <Zap className="w-6 h-6 text-[#D4AF37]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">60-Second Savings Estimate</h2>
          <p className="text-gray-300 text-sm">Get your potential savings in under a minute</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Loan Amount
          </label>
          <input
            type="number"
            value={loanAmount}
            onChange={(e) => {
              setLoanAmount(e.target.value)
              setHasResult(false)
            }}
            placeholder="$400,000"
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Credit Score
          </label>
          <input
            type="number"
            value={creditScore}
            onChange={(e) => {
              setCreditScore(e.target.value)
              setHasResult(false)
            }}
            placeholder="720"
            min="300"
            max="850"
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
          />
        </div>
      </div>

      {savings && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-6 rounded-xl bg-gradient-to-r from-[#50C878]/20 to-[#228B22]/20 border border-[#50C878]/30"
        >
          <div className="text-center mb-4">
            <div className="text-sm text-gray-300 mb-2">Your Potential Savings Range</div>
            <div className="text-4xl font-bold text-[#50C878] mb-1">
              {formatCurrency(savings.min)} - {formatCurrency(savings.max)}
            </div>
            <div className="text-xs text-gray-400">
              Based on your loan amount and credit profile
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/quiz"
          className="flex-1 px-6 py-4 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-[#003366] font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          <Calculator className="w-5 h-5" />
          Get Full Analysis
        </Link>
        <Link
          href="/mortgage-shopping"
          className="flex-1 px-6 py-4 rounded-lg bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
        >
          Start Shopping
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>

      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="flex items-center justify-center gap-6 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            <span>Average user saves $24,480</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4" />
            <span>Results in 60 seconds</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

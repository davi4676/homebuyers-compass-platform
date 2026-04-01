'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Lock,
  CheckCircle,
  FileText,
  TrendingUp,
  CreditCard,
  Calculator,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { UserTier } from '@/lib/tiers'
import { formatCurrency } from '@/lib/calculations'
import Link from 'next/link'

interface SavingsData {
  loanAmount: number
  creditScore: number
  downPayment: number
  timeline: string
}

interface Phase1PreparationProps {
  userTier: UserTier
  savingsData: SavingsData
  onBack: () => void
  onUpgrade: (tier: UserTier) => void
}

export default function Phase1Preparation({
  userTier,
  savingsData,
  onBack,
  onUpgrade,
}: Phase1PreparationProps) {
  const [creditScore, setCreditScore] = useState(savingsData.creditScore)
  const [dtiRatio, setDtiRatio] = useState(35)
  const [documentsReady, setDocumentsReady] = useState({
    payStubs: false,
    taxReturns: false,
    bankStatements: false,
    w2: false,
  })

  const isPremium = userTier === 'momentum' || userTier === 'navigator'
  const isPro = userTier === 'navigator'

  // Calculate credit impact
  const calculateCreditImpact = () => {
    const currentRate = 0.055 + (creditScore < 750 ? 0.005 : 0)
    const improvedRate = 0.055 + (creditScore + 10 < 750 ? 0.005 : 0)
    const monthlySavings = (savingsData.loanAmount * (currentRate - improvedRate)) / 12
    return {
      currentRate: (currentRate * 100).toFixed(1),
      improvedRate: (improvedRate * 100).toFixed(1),
      monthlySavings: monthlySavings,
      yearlySavings: monthlySavings * 12,
    }
  }

  const creditImpact = calculateCreditImpact()
  const documentProgress =
    (Object.values(documentsReady).filter(Boolean).length / Object.keys(documentsReady).length) *
    100

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
          <h1 className="text-3xl font-bold">Phase 1: Preparation</h1>
          <p className="text-gray-400">Get your credit, documents, and finances ready</p>
        </div>
      </div>

      {/* Savings Potential */}
      <div className="bg-gradient-to-br from-[#06b6d4]/20 to-[#22d3ee]/20 rounded-xl p-6 border border-[#06b6d4]/30">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-6 h-6 text-[#06b6d4]" />
          <h2 className="text-xl font-bold">Your Savings Potential</h2>
        </div>
        <p className="text-gray-300 mb-4">
          Based on your loan amount of {formatCurrency(savingsData.loanAmount)}, you could save
          between{' '}
          <strong className="text-[#06b6d4]">
            {formatCurrency(savingsData.loanAmount * 0.003)} -{' '}
            {formatCurrency(savingsData.loanAmount * 0.15)}
          </strong>{' '}
          by shopping smart.
        </p>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Clock className="w-4 h-4" />
          <span>Estimated time: 2-3 hours</span>
        </div>
      </div>

      {/* Credit Score Optimization */}
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-[#06b6d4]" />
            <h2 className="text-xl font-bold">Credit Score Check</h2>
          </div>
          {!isPremium && (
            <span className="text-xs px-2 py-1 rounded-full bg-gray-800 text-gray-500">
              Premium Feature
            </span>
          )}
        </div>

        {isPremium ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Your Current Credit Score
              </label>
              <input
                type="number"
                value={creditScore}
                onChange={(e) => setCreditScore(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:border-[#06b6d4] focus:outline-none"
                min="300"
                max="850"
              />
            </div>

            {isPro && (
              <div className="p-4 rounded-lg bg-[#06b6d4]/10 border border-[#06b6d4]/20">
                <h3 className="font-semibold text-[#06b6d4] mb-2">
                  🏆 Pro Feature: Credit Optimization Engine
                </h3>
                <p className="text-sm text-gray-300 mb-3">
                  Improving your credit score by just 10 points could save you:
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-400">Current Rate</div>
                    <div className="text-2xl font-bold text-gray-300">{creditImpact.currentRate}%</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">With +10 Points</div>
                    <div className="text-2xl font-bold text-[#06b6d4]">
                      {creditImpact.improvedRate}%
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-[#06b6d4]/20">
                  <div className="text-sm text-gray-400">Potential Annual Savings</div>
                  <div className="text-xl font-bold text-[#22d3ee]">
                    {formatCurrency(creditImpact.yearlySavings)}
                  </div>
                </div>
              </div>
            )}

            <div className="p-4 rounded-lg bg-gray-800/50">
              <p className="text-sm text-gray-300">
                <strong className="text-white">Good news:</strong> Shopping for rates within a
                45-day window counts as a single credit inquiry, so it won't hurt your score.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-lg bg-gray-800/50 border border-gray-700">
            <p className="text-gray-400 mb-4">
              Upgrade to Premium to unlock credit score integration and see how shopping affects
              YOUR score specifically.
            </p>
            <button
              onClick={() => onUpgrade('momentum')}
              className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-[#06b6d4] to-[#22d3ee] text-white font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              Upgrade to Premium
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* DTI Calculator */}
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Calculator className="w-6 h-6 text-[#06b6d4]" />
            <h2 className="text-xl font-bold">Debt-to-Income (DTI) Calculator</h2>
          </div>
          {!isPremium && (
            <span className="text-xs px-2 py-1 rounded-full bg-gray-800 text-gray-500">
              Premium Feature
            </span>
          )}
        </div>

        {isPremium ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Your DTI Ratio
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={dtiRatio}
                  onChange={(e) => setDtiRatio(parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-2xl font-bold text-[#06b6d4] w-16 text-right">
                  {dtiRatio}%
                </span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gray-800/50">
              <p className="text-sm text-gray-300">
                {dtiRatio <= 36 ? (
                  <>
                    <strong className="text-green-400">Excellent!</strong> Your DTI is ideal for
                    getting the best rates. Most lenders prefer DTI under 36%.
                  </>
                ) : dtiRatio <= 43 ? (
                  <>
                    <strong className="text-yellow-400">Good.</strong> Your DTI is acceptable, but
                    lowering it could help you qualify for better rates.
                  </>
                ) : (
                  <>
                    <strong className="text-red-400">High.</strong> Consider paying down debt
                    before applying to improve your rate options.
                  </>
                )}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-lg bg-gray-800/50 border border-gray-700">
            <p className="text-gray-400 mb-4">
              Upgrade to Premium to access the DTI calculator and see how your ratio affects your
              rate options.
            </p>
            <button
              onClick={() => onUpgrade('momentum')}
              className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-[#06b6d4] to-[#22d3ee] text-white font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              Upgrade to Premium
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Document Checklist */}
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-[#06b6d4]" />
            <h2 className="text-xl font-bold">Document Checklist</h2>
          </div>
          <div className="text-sm text-gray-400">
            {Math.round(documentProgress)}% Complete
          </div>
        </div>

        <div className="space-y-3">
          {Object.entries(documentsReady).map(([key, value]) => (
            <label
              key={key}
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={value}
                onChange={(e) =>
                  setDocumentsReady({ ...documentsReady, [key]: e.target.checked })
                }
                className="w-5 h-5 rounded border-gray-700 text-[#06b6d4] focus:ring-[#06b6d4]"
              />
              <span className="flex-1 text-gray-300 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              {value && <CheckCircle className="w-5 h-5 text-green-400" />}
            </label>
          ))}
        </div>

        {isPro && (
          <div className="mt-4 p-4 rounded-lg bg-[#06b6d4]/10 border border-[#06b6d4]/20">
            <h3 className="font-semibold text-[#06b6d4] mb-2">
              🏆 Pro Feature: Document Pre-Scanner
            </h3>
            <p className="text-sm text-gray-300">
              Upload your documents and our AI will check for common issues before submission,
              saving you time and preventing delays.
            </p>
          </div>
        )}
      </div>

      {/* 45-Day Window Tracker */}
      {isPro && (
        <div className="bg-gradient-to-br from-[#06b6d4]/20 to-[#22d3ee]/20 rounded-xl p-6 border border-[#06b6d4]/30">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-[#06b6d4]" />
            <h2 className="text-xl font-bold">45-Day Shopping Window Tracker</h2>
          </div>
          <p className="text-gray-300 mb-4">
            You have <strong className="text-[#06b6d4]">45 days</strong> from your first credit
            inquiry to shop for rates. All inquiries within this window count as one.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-[#06b6d4] w-3/4" />
              </div>
            </div>
            <span className="text-sm font-semibold text-[#06b6d4]">34 days remaining</span>
          </div>
        </div>
      )}

      {/* Next Steps */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-800">
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-lg bg-gray-900 hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Roadmap
        </button>
        <Link
          href="/mortgage-shopping?phase=research"
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#06b6d4] to-[#22d3ee] text-white font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          Continue to Phase 2: Research
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </motion.div>
  )
}

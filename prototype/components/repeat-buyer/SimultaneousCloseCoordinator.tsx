'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, DollarSign, AlertTriangle, TrendingUp, Lock, ArrowRight } from 'lucide-react'
import { UserTier } from '@/lib/tiers'
import { formatCurrency } from '@/lib/calculations'
import Link from 'next/link'

interface EquityData {
  currentHomeValue: number
  mortgageBalance: number
  newHomePrice: number
}

interface SimultaneousCloseCoordinatorProps {
  userTier: UserTier
  equityData: EquityData
  onBack: () => void
  onUpgrade: (tier: UserTier) => void
}

export default function SimultaneousCloseCoordinator({
  userTier,
  equityData,
  onBack,
  onUpgrade,
}: SimultaneousCloseCoordinatorProps) {
  const isPremium = userTier === 'momentum' || userTier === 'navigator'
  const isPro = userTier === 'navigator'

  const [timeline, setTimeline] = useState({
    listDate: '',
    expectedSaleDate: '',
    newHomeCloseDate: '',
  })

  const overlapDays = 30 // Example overlap
  const currentMortgagePayment = 2000 // Example
  const overlapCost = (overlapDays / 30) * currentMortgagePayment
  const availableEquity = equityData.currentHomeValue - equityData.mortgageBalance
  const modeledOverlapSave = Math.round(Math.min(40000, Math.max(8000, availableEquity * 0.018)))

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
          <h1 className="text-3xl font-bold">Buy-Sell Orchestrator</h1>
          <p className="text-gray-400">Coordinate timing for selling and buying simultaneously</p>
        </div>
      </div>

      {!isPremium ? (
        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-6 h-6 text-yellow-400" />
            <h2 className="text-xl font-bold">Premium Feature</h2>
          </div>
          <p className="text-gray-300 mb-2 font-semibold text-white">
            Tighten buy-sell timing — modeled members avoid about {formatCurrency(modeledOverlapSave)} in overlap costs vs.
            a loose schedule.
          </p>
          <p className="text-gray-400 mb-4 text-sm">
            Momentum unlocks the coordinator, bridge options, and day-by-day overlap math tied to your equity.
          </p>
          <button
            onClick={() => onUpgrade('momentum')}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#06b6d4] to-[#22d3ee] text-white font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            Coordinate my closing dates
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <>
          {/* Timeline Builder */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-[#06b6d4]" />
              Transaction Timeline
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  List Current Home
                </label>
                <input
                  type="date"
                  value={timeline.listDate}
                  onChange={(e) => setTimeline({ ...timeline, listDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:border-[#06b6d4] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Expected Sale Date
                </label>
                <input
                  type="date"
                  value={timeline.expectedSaleDate}
                  onChange={(e) =>
                    setTimeline({ ...timeline, expectedSaleDate: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:border-[#06b6d4] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  New Home Close Date
                </label>
                <input
                  type="date"
                  value={timeline.newHomeCloseDate}
                  onChange={(e) =>
                    setTimeline({ ...timeline, newHomeCloseDate: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:border-[#06b6d4] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Overlap Cost Analysis */}
          <div className="bg-gradient-to-br from-[#06b6d4]/20 to-[#22d3ee]/20 rounded-xl p-6 border border-[#06b6d4]/30">
            <h2 className="text-xl font-bold mb-4">Overlap Cost Analysis</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-gray-900/50">
                <div className="text-sm text-gray-400 mb-1">Overlap Period</div>
                <div className="text-2xl font-bold text-[#06b6d4]">{overlapDays} days</div>
              </div>
              <div className="p-4 rounded-lg bg-gray-900/50">
                <div className="text-sm text-gray-400 mb-1">Carrying Two Mortgages</div>
                <div className="text-2xl font-bold text-white">{formatCurrency(overlapCost)}</div>
              </div>
              <div className="p-4 rounded-lg bg-gray-900/50">
                <div className="text-sm text-gray-400 mb-1">Storage & Moving</div>
                <div className="text-2xl font-bold text-gray-300">
                  {formatCurrency(overlapCost * 0.3)}
                </div>
              </div>
            </div>
          </div>

          {/* Bridge Financing Options */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
            <h2 className="text-xl font-bold mb-4">Bridge Financing Recommendations</h2>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Bridge Loan Option 1</h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-[#06b6d4]/20 text-[#06b6d4]">
                    Recommended
                  </span>
                </div>
                <div className="grid md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400">Rate</div>
                    <div className="font-semibold">9.5%</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Term</div>
                    <div className="font-semibold">6 months</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Monthly Payment</div>
                    <div className="font-semibold">{formatCurrency(1500)}</div>
                  </div>
                  <div>
                    <button className="px-4 py-2 rounded-lg bg-[#06b6d4] hover:bg-[#0891b2] transition-colors text-sm text-white">
                      Get Quote
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {isPro && (
              <div className="mt-4 p-4 rounded-lg bg-[#06b6d4]/10 border border-[#06b6d4]/20">
                <h3 className="font-semibold text-[#06b6d4] mb-2">
                  🏆 Pro Feature: Contract Contingency Analyzer
                </h3>
                <p className="text-sm text-gray-300">
                  Analyze your purchase contract contingencies to optimize timing and reduce overlap
                  costs.
                </p>
              </div>
            )}
          </div>
        </>
      )}

      <div className="flex flex-col gap-4 border-t border-gray-800 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-lg bg-gray-900 hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Suite
        </button>
        {isPremium ? (
          <div className="flex flex-wrap gap-2">
            <Link
              href="/lifecycle-dashboard"
              className="rounded-lg border border-gray-600 px-4 py-2 text-sm font-semibold text-gray-200 hover:bg-gray-800/80"
            >
              Lifecycle dashboard
            </Link>
            <Link
              href="/refinance-optimizer"
              className="rounded-lg border border-gray-600 px-4 py-2 text-sm font-semibold text-gray-200 hover:bg-gray-800/80"
            >
              Refinance optimizer
            </Link>
          </div>
        ) : null}
      </div>
    </motion.div>
  )
}

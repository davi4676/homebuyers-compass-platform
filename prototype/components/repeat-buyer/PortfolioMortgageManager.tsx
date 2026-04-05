'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, BarChart3, Home, TrendingUp, Lock, ArrowRight } from 'lucide-react'
import { UserTier } from '@/lib/tiers'
import { formatCurrency } from '@/lib/calculations'
import Link from 'next/link'

interface PortfolioMortgageManagerProps {
  userTier: UserTier
  onBack: () => void
  onUpgrade: (tier: UserTier) => void
}

export default function PortfolioMortgageManager({
  userTier,
  onBack,
  onUpgrade,
}: PortfolioMortgageManagerProps) {
  const isPro = userTier === 'navigator'

  const [properties] = useState([
    { id: 1, address: '123 Main St', value: 450000, balance: 250000, rate: 5.5 },
    { id: 2, address: '456 Oak Ave', value: 320000, balance: 200000, rate: 6.2 },
  ])

  const totalEquity = properties.reduce(
    (sum, prop) => sum + (prop.value - prop.balance),
    0
  )
  const modeledPortfolioLift = Math.round(Math.min(35000, Math.max(12000, totalEquity * 0.028)))

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
          <h1 className="text-3xl font-bold">Portfolio Mortgage Management</h1>
          <p className="text-gray-400">Manage multiple properties and optimize your mortgage portfolio</p>
        </div>
      </div>

      {!isPro ? (
        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-6 h-6 text-yellow-400" />
            <h2 className="text-xl font-bold">Pro Feature</h2>
          </div>
          <p className="text-gray-300 mb-2 font-semibold text-white">
            Surface about {formatCurrency(modeledPortfolioLift)} in modeled tax- and rate-smart moves across your
            properties (illustrative).
          </p>
          <p className="text-gray-400 mb-4 text-sm">
            Navigator+ unlocks multi-loan modeling, 1031 checkpoints, and consolidated payoff strategies.
          </p>
          <button
            onClick={() => onUpgrade('navigator')}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#06b6d4] to-[#22d3ee] text-white font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            Open portfolio modeling
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <>
          {/* Portfolio Overview */}
          <div className="bg-gradient-to-br from-[#06b6d4]/20 to-[#22d3ee]/20 rounded-xl p-6 border border-[#06b6d4]/30">
            <h2 className="text-xl font-bold mb-4">Portfolio Overview</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-gray-900/50">
                <div className="text-sm text-gray-400 mb-1">Total Properties</div>
                <div className="text-3xl font-bold text-[#06b6d4]">{properties.length}</div>
              </div>
              <div className="p-4 rounded-lg bg-gray-900/50">
                <div className="text-sm text-gray-400 mb-1">Total Equity</div>
                <div className="text-3xl font-bold text-white">{formatCurrency(totalEquity)}</div>
              </div>
              <div className="p-4 rounded-lg bg-gray-900/50">
                <div className="text-sm text-gray-400 mb-1">Average Rate</div>
                <div className="text-3xl font-bold text-white">
                  {(
                    properties.reduce((sum, p) => sum + p.rate, 0) / properties.length
                  ).toFixed(2)}
                  %
                </div>
              </div>
            </div>
          </div>

          {/* Property List */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
            <h2 className="text-xl font-bold mb-4">Your Properties</h2>
            <div className="space-y-4">
              {properties.map((property) => (
                <div
                  key={property.id}
                  className="p-4 rounded-lg bg-gray-800/50 border border-gray-700"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{property.address}</h3>
                      <div className="text-sm text-gray-400">Rate: {property.rate}%</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Equity</div>
                      <div className="text-xl font-bold text-[#06b6d4]">
                        {formatCurrency(property.value - property.balance)}
                      </div>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-gray-400">Value</div>
                      <div className="font-semibold">{formatCurrency(property.value)}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Balance</div>
                      <div className="font-semibold">{formatCurrency(property.balance)}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Equity %</div>
                      <div className="font-semibold">
                        {(((property.value - property.balance) / property.value) * 100).toFixed(
                          1
                        )}
                        %
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 1031 Exchange Checker */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
            <h2 className="text-xl font-bold mb-4">1031 Exchange Eligibility</h2>
            <div className="p-4 rounded-lg bg-gray-800/50">
              <p className="text-gray-300 mb-4">
                Check if your properties qualify for a 1031 exchange to defer capital gains taxes.
              </p>
              <button className="px-6 py-3 rounded-lg bg-[#06b6d4] hover:bg-[#0891b2] transition-colors text-white font-semibold">
                Check Eligibility
              </button>
            </div>
          </div>
        </>
      )}

      <div className="flex items-center justify-between pt-6 border-t border-gray-800">
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-lg bg-gray-900 hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Suite
        </button>
      </div>
    </motion.div>
  )
}

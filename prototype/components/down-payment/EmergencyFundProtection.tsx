'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, AlertTriangle, TrendingUp, Calculator, Lock, CheckCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/calculations'
import { type UserTier } from '@/lib/tiers'

interface EmergencyFundProtectionProps {
  purchasePrice: number
  monthlyIncome: number
  monthlyExpenses: number
  userTier: UserTier
  onDataChange?: (data: { emergencyFund: number; riskLevel: string }) => void
}

export default function EmergencyFundProtection({
  purchasePrice,
  monthlyIncome,
  monthlyExpenses,
  userTier,
  onDataChange,
}: EmergencyFundProtectionProps) {
  const [emergencyFund, setEmergencyFund] = useState(0)
  const [showStressTest, setShowStressTest] = useState(false)

  // Calculate emergency fund needs
  const standardMonths = 6
  const homeownershipMonths = 9 // Recommended for homeowners
  const homeRepairReserve = purchasePrice * 0.02 // 2% for home repairs
  
  const standardNeed = monthlyExpenses * standardMonths
  const homeownerNeed = monthlyExpenses * homeownershipMonths + homeRepairReserve
  const recommendedFund = userTier === 'navigator' ? homeownerNeed : standardNeed

  const riskLevel = emergencyFund >= recommendedFund 
    ? 'low' 
    : emergencyFund >= recommendedFund * 0.5 
    ? 'medium' 
    : 'high'

  // Stress test scenarios
  const stressScenarios = [
    {
      name: 'Job Loss (3 months)',
      impact: monthlyIncome * 3,
      probability: 'medium',
      solution: '6 months expenses + unemployment insurance coverage',
    },
    {
      name: 'Major Home Repair ($15k)',
      impact: 15000,
      probability: 'high',
      solution: '1-2% of home value set aside for repairs',
    },
    {
      name: 'Rate Increase (+2%)',
      impact: (purchasePrice * 0.8 * 0.02) / 12, // Monthly payment increase
      probability: 'medium',
      solution: 'Buffer in monthly budget + HELOC as backup',
    },
    {
      name: 'Medical Emergency ($10k)',
      impact: 10000,
      probability: 'low',
      solution: 'Health insurance + health savings account',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 rounded-2xl border border-[#50C878]/30 p-8">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-8 h-8 text-[#50C878]" />
          <div>
            <h3 className="text-2xl font-bold">Emergency Fund Protection</h3>
            <p className="text-gray-400 text-sm">
              Protect yourself from becoming house-poor with adequate reserves
            </p>
          </div>
        </div>

        {/* Emergency Fund Calculator */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Current Emergency Fund
            </label>
            <input
              type="number"
              value={emergencyFund}
              onChange={(e) => {
                const value = Number(e.target.value) || 0
                setEmergencyFund(value)
                onDataChange?.({ emergencyFund: value, riskLevel })
              }}
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-[#50C878]"
              placeholder="0"
            />
          </div>

          {/* Recommended Funds */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg border-2 ${
              userTier === 'navigator' 
                ? 'border-[#50C878] bg-[#50C878]/10' 
                : 'border-gray-700 bg-gray-800/50'
            }`}>
              <div className="text-sm text-gray-400 mb-1">
                {userTier === 'navigator' ? 'Recommended (Homeowner)' : 'Standard (Renter)'}
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {formatCurrency(userTier === 'navigator' ? homeownerNeed : standardNeed)}
              </div>
              <div className="text-xs text-gray-400">
                {userTier === 'navigator' ? `${homeownershipMonths} months expenses + repairs` : `${standardMonths} months expenses`}
              </div>
            </div>

            <div className={`p-4 rounded-lg border-2 ${
              riskLevel === 'low' 
                ? 'border-[#50C878] bg-[#50C878]/10' 
                : riskLevel === 'medium'
                ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                : 'border-[#DC143C] bg-[#DC143C]/10'
            }`}>
              <div className="text-sm text-gray-400 mb-1">Risk Level</div>
              <div className={`text-2xl font-bold mb-1 ${
                riskLevel === 'low' ? 'text-[#50C878]' 
                : riskLevel === 'medium' ? 'text-[#D4AF37]' 
                : 'text-[#DC143C]'
              }`}>
                {riskLevel === 'low' ? 'Low ✓' : riskLevel === 'medium' ? 'Medium ⚠' : 'High ⚠'}
              </div>
              <div className="text-xs text-gray-400">
                {emergencyFund < recommendedFund 
                  ? `Need ${formatCurrency(recommendedFund - emergencyFund)} more`
                  : 'Well protected'}
              </div>
            </div>
          </div>

          {/* Risk Assessment */}
          {riskLevel !== 'low' && (
            <div className="p-4 rounded-lg bg-[#DC143C]/10 border border-[#DC143C]/30">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-[#DC143C] mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold text-[#DC143C] mb-1">Risk Warning</div>
                  <div className="text-sm text-gray-300">
                    Your emergency fund is below recommended levels. Consider delaying your down payment
                    or exploring alternative funding sources that don't deplete your reserves.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stress Testing (Pro Feature) */}
        {userTier === 'navigator' ? (
          <div className="mt-6">
            <button
              onClick={() => setShowStressTest(!showStressTest)}
              className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-[#50C878] to-[#228B22] text-white font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Calculator className="w-5 h-5" />
              {showStressTest ? 'Hide' : 'Show'} Stress Test Scenarios
            </button>

            {showStressTest && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 space-y-3"
              >
                {stressScenarios.map((scenario, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-semibold text-white">{scenario.name}</div>
                        <div className="text-xs text-gray-400">Impact: {formatCurrency(scenario.impact)}</div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        scenario.probability === 'high' 
                          ? 'bg-[#DC143C]/20 text-[#DC143C]'
                          : scenario.probability === 'medium'
                          ? 'bg-[#D4AF37]/20 text-[#D4AF37]'
                          : 'bg-gray-700 text-gray-400'
                      }`}>
                        {scenario.probability} probability
                      </span>
                    </div>
                    <div className="text-sm text-gray-300 mt-2">
                      <strong>Solution:</strong> {scenario.solution}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        ) : (
          <div className="mt-6 p-4 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30">
            <div className="flex items-start gap-2">
              <Lock className="w-5 h-5 text-[#D4AF37] mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold text-[#D4AF37] mb-1">
                  🏆 Pro Feature: Stress Test Scenarios
                </div>
                <div className="text-sm text-gray-300 mb-3">
                  Upgrade to Pro to access Monte Carlo stress testing with 1,000+ scenarios,
                  personalized risk modeling, and automated emergency fund optimization.
                </div>
                <button
                  onClick={() => (window.location.href = '/upgrade?tier=navigator&feature=downPaymentOptimizer')}
                  className="px-4 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#FFD700] text-[#003366] text-sm font-semibold transition-colors"
                >
                  Upgrade to Pro
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Safety Recommendations */}
        <div className="mt-6 pt-6 border-t border-gray-800">
          <h4 className="font-semibold mb-3">Safety Recommendations</h4>
          <div className="space-y-2">
            {[
              'Never deplete emergency fund below 3 months expenses for down payment',
              'Consider HELOC as backup emergency funding (after closing)',
              'Maintain separate repair fund (1-2% of home value)',
              'Review and update emergency fund annually',
            ].map((rec, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                <CheckCircle className="w-4 h-4 text-[#50C878] mt-0.5 flex-shrink-0" />
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

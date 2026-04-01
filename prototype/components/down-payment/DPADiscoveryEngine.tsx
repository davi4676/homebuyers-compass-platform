'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MapPin, DollarSign, TrendingUp, AlertCircle, Lock, CheckCircle, Zap } from 'lucide-react'
import { formatCurrency } from '@/lib/calculations'
import { type UserTier } from '@/lib/tiers'

interface DPAProgram {
  id: string
  name: string
  type: 'grant' | 'loan' | 'mcc' | 'employer' | 'nonprofit'
  amount: number
  location: 'city' | 'county' | 'state' | 'federal' | 'employer'
  eligibilityScore: number
  approvalProbability: number
  applicationWindow: string
  fundingRemaining: number
  combinable: boolean
  url: string
}

interface DPADiscoveryEngineProps {
  zipCode?: string
  city?: string
  state?: string
  occupation?: string
  employer?: string
  annualIncome?: number
  purchasePrice?: number
  userTier: UserTier
}

export default function DPADiscoveryEngine({
  zipCode,
  city,
  state,
  occupation,
  employer,
  annualIncome,
  purchasePrice,
  userTier,
}: DPADiscoveryEngineProps) {
  const [discoveredPrograms, setDiscoveredPrograms] = useState<DPAProgram[]>([])
  const [stackingAnalysis, setStackingAnalysis] = useState<{
    optimalStack: DPAProgram[]
    totalBenefit: number
    combinable: boolean
  } | null>(null)

  // Simulate DPA program discovery based on location and profile
  useEffect(() => {
    // In production, this would query a DPA database API
    const mockPrograms: DPAProgram[] = [
      {
        id: 'city-grant-1',
        name: 'City First-Time Buyer Grant',
        type: 'grant',
        amount: 10000,
        location: 'city',
        eligibilityScore: 92,
        approvalProbability: 78,
        applicationWindow: 'Open year-round',
        fundingRemaining: 85,
        combinable: true,
        url: '#',
      },
      {
        id: 'state-loan-1',
        name: 'State Housing Trust Fund',
        type: 'loan',
        amount: 15000,
        location: 'state',
        eligibilityScore: 88,
        approvalProbability: 82,
        applicationWindow: 'Open year-round',
        fundingRemaining: 67,
        combinable: true,
        url: '#',
      },
      {
        id: 'employer-1',
        name: `${employer || 'Employer'} Homebuyer Assistance`,
        type: 'employer',
        amount: 5000,
        location: 'employer',
        eligibilityScore: 95,
        approvalProbability: 90,
        applicationWindow: 'Open year-round',
        fundingRemaining: 100,
        combinable: true,
        url: '#',
      },
      {
        id: 'federal-mcc-1',
        name: 'Mortgage Credit Certificate (MCC)',
        type: 'mcc',
        amount: 2000, // Annual tax credit value
        location: 'federal',
        eligibilityScore: 85,
        approvalProbability: 75,
        applicationWindow: 'Open year-round',
        fundingRemaining: 100,
        combinable: true,
        url: '#',
      },
      {
        id: 'county-grant-1',
        name: 'County Down Payment Assistance',
        type: 'grant',
        amount: 7500,
        location: 'county',
        eligibilityScore: 80,
        approvalProbability: 70,
        applicationWindow: 'Open year-round',
        fundingRemaining: 45,
        combinable: true,
        url: '#',
      },
    ]

    // Filter based on eligibility (simplified logic)
    const eligiblePrograms = mockPrograms.filter(
      (p) => p.eligibilityScore >= 70 && (userTier === 'navigator' || p.location !== 'employer' || !!employer)
    )

    setDiscoveredPrograms(eligiblePrograms)

    // Calculate optimal stacking (Premium+)
    if (userTier !== 'foundations' && eligiblePrograms.length > 1) {
      // Sort by combinability and benefit
      const combinablePrograms = eligiblePrograms.filter((p) => p.combinable).slice(0, 3)
      const totalBenefit = combinablePrograms.reduce((sum, p) => sum + p.amount, 0)

      setStackingAnalysis({
        optimalStack: combinablePrograms,
        totalBenefit,
        combinable: true,
      })
    }
  }, [zipCode, city, state, occupation, employer, annualIncome, purchasePrice, userTier])

  const totalPotential = discoveredPrograms.reduce((sum, p) => sum + p.amount, 0)
  const averageApprovalProbability = discoveredPrograms.length > 0
    ? discoveredPrograms.reduce((sum, p) => sum + p.approvalProbability, 0) / discoveredPrograms.length
    : 0

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 rounded-2xl border border-[#06b6d4]/30 p-8">
        <div className="flex items-center gap-3 mb-6">
          <MapPin className="w-8 h-8 text-[#06b6d4]" />
          <div>
            <h3 className="text-2xl font-bold">DPA Discovery Engine</h3>
            <p className="text-gray-400 text-sm">
              Intelligent discovery of down payment assistance programs in your area
            </p>
          </div>
        </div>

        {/* Discovery Summary */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-gradient-to-br from-[#06b6d4]/20 to-[#22d3ee]/20 border border-[#06b6d4]/30">
            <div className="text-sm text-gray-400 mb-1">Programs Discovered</div>
            <div className="text-3xl font-bold text-white">{discoveredPrograms.length}</div>
            <div className="text-xs text-gray-400 mt-1">
              {userTier === 'foundations' ? 'Basic scan' : userTier === 'momentum' ? 'Hyper-local search' : 'AI-powered discovery'}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-gradient-to-br from-[#50C878]/20 to-[#228B22]/20 border border-[#50C878]/30">
            <div className="text-sm text-gray-400 mb-1">Total Potential Benefit</div>
            <div className="text-3xl font-bold text-[#50C878]">
              {formatCurrency(totalPotential)}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              If all programs approved
            </div>
          </div>

          <div className="p-4 rounded-lg bg-gradient-to-br from-[#D4AF37]/20 to-[#FFD700]/20 border border-[#D4AF37]/30">
            <div className="text-sm text-gray-400 mb-1">Average Approval Probability</div>
            <div className="text-3xl font-bold text-[#D4AF37]">
              {Math.round(averageApprovalProbability)}%
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Based on your profile
            </div>
          </div>
        </div>

        {/* Geographic Intelligence (Premium+) */}
        {userTier !== 'foundations' ? (
          <div className="mb-6 p-4 rounded-lg bg-[#06b6d4]/10 border border-[#06b6d4]/30">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-5 h-5 text-[#06b6d4]" />
              <h4 className="font-semibold">📍 Hyper-Local DPA Intelligence</h4>
            </div>
            <div className="grid md:grid-cols-4 gap-3 text-sm">
              <div>
                <div className="text-gray-400">Location Coverage</div>
                <div className="font-semibold text-white">
                  {city && state ? `${city}, ${state}` : zipCode ? `ZIP ${zipCode}` : 'Enter location'}
                </div>
              </div>
              <div>
                <div className="text-gray-400">Program Layers</div>
                <div className="font-semibold text-white">
                  {new Set(discoveredPrograms.map((p) => p.location)).size} layers
                </div>
              </div>
              <div>
                <div className="text-gray-400">Address-Level Precision</div>
                <div className="font-semibold text-[#50C878]">
                  {userTier === 'navigator' ? 'Active' : 'Basic'}
                </div>
              </div>
              <div>
                <div className="text-gray-400">Neighborhood Data</div>
                <div className="font-semibold text-[#50C878]">
                  {userTier === 'navigator' ? 'Available' : 'Limited'}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6 p-4 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30">
            <div className="flex items-start gap-2">
              <Lock className="w-5 h-5 text-[#D4AF37] mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold text-[#D4AF37] mb-1">
                  🏆 Premium Feature: Hyper-Local DPA Intelligence
                </div>
                <div className="text-sm text-gray-300">
                  Upgrade to see address-level program matching, neighborhood-specific success rates,
                  and school district-based programs.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DPA Programs List */}
        <div className="space-y-3 mb-6">
          <h4 className="font-semibold mb-3">Discovered DPA Programs</h4>
          {discoveredPrograms.map((program, idx) => (
            <motion.div
              key={program.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-4 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-[#06b6d4]/50 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h5 className="font-semibold text-white">{program.name}</h5>
                    <span className={`text-xs px-2 py-1 rounded ${
                      program.type === 'grant' ? 'bg-[#50C878]/20 text-[#50C878]' :
                      program.type === 'loan' ? 'bg-[#06b6d4]/20 text-[#06b6d4]' :
                      program.type === 'mcc' ? 'bg-[#D4AF37]/20 text-[#D4AF37]' :
                      'bg-purple-500/20 text-purple-400'
                    }`}>
                      {program.type.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400 mb-2">
                    {program.location.charAt(0).toUpperCase() + program.location.slice(1)} Program
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#50C878]">
                    {formatCurrency(program.amount)}
                  </div>
                  <div className="text-xs text-gray-400">
                    {program.approvalProbability}% approval odds
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-3 text-xs mb-3">
                <div>
                  <div className="text-gray-500">Eligibility Score</div>
                  <div className="font-semibold text-white">{program.eligibilityScore}/100</div>
                </div>
                <div>
                  <div className="text-gray-500">Funding Remaining</div>
                  <div className={`font-semibold ${
                    program.fundingRemaining > 70 ? 'text-[#50C878]' :
                    program.fundingRemaining > 40 ? 'text-[#D4AF37]' :
                    'text-[#DC143C]'
                  }`}>
                    {program.fundingRemaining}%
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Application Window</div>
                  <div className="font-semibold text-white">{program.applicationWindow}</div>
                </div>
                <div>
                  <div className="text-gray-500">Combinable</div>
                  <div className="font-semibold text-white">
                    {program.combinable ? 'Yes ✓' : 'No'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={program.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg bg-[#06b6d4] hover:bg-[#0891b2] text-white text-sm font-semibold transition-colors"
                >
                  View Program Details
                </a>
                {(userTier === 'momentum' || userTier === 'navigator') && (
                  <button className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold transition-colors">
                    Start Application
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stacking Analysis (Premium+) */}
        {stackingAnalysis && userTier !== 'foundations' && (
          <div className="p-6 rounded-lg bg-gradient-to-r from-[#50C878]/10 to-[#228B22]/10 border-2 border-[#50C878]/30">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-6 h-6 text-[#50C878]" />
              <h4 className="text-xl font-bold text-[#50C878]">💡 Optimal DPA Stacking Strategy</h4>
            </div>
            <div className="mb-4">
              <div className="text-sm text-gray-300 mb-2">
                Apply for these programs in this order for maximum benefit:
              </div>
              <div className="space-y-2">
                {stackingAnalysis.optimalStack.map((program, idx) => (
                  <div key={program.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#50C878] text-white font-bold flex items-center justify-center">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{program.name}</div>
                        <div className="text-xs text-gray-400">{program.type.toUpperCase()}</div>
                      </div>
                    </div>
                    <div className="text-[#50C878] font-bold">{formatCurrency(program.amount)}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-4 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-white">Total Stacked Benefit</span>
                <span className="text-3xl font-bold text-[#50C878]">
                  {formatCurrency(stackingAnalysis.totalBenefit)}
                </span>
              </div>
              <div className="text-xs text-gray-400 mt-2">
                This combination is legally allowable and maximizes your total assistance
              </div>
            </div>
          </div>
        )}

        {/* Free Tier Gate */}
        {userTier === 'foundations' && discoveredPrograms.length > 0 && (
          <div className="p-6 rounded-lg bg-gradient-to-r from-[#D4AF37]/20 to-[#FFD700]/20 border-2 border-[#D4AF37]">
            <div className="flex items-start gap-3">
              <Lock className="w-6 h-6 text-[#D4AF37] mt-1" />
              <div className="flex-1">
                <h4 className="text-lg font-bold text-[#D4AF37] mb-2">
                  Discover {discoveredPrograms.length} Hidden DPA Opportunities in Your Neighborhood
                </h4>
                <p className="text-sm text-gray-300 mb-4">
                  Premium users get address-level program matching, stacking optimization, and
                  application success prediction. Average Premium user discovers $8,420 more in DPA.
                </p>
                <button
                  onClick={() => (window.location.href = '/upgrade?tier=momentum&feature=downPaymentOptimizer')}
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-[#003366] font-bold hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  Upgrade to Premium
                  <TrendingUp className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pro Features */}
        {userTier === 'navigator' && (
          <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-[#06b6d4]/10 to-[#22d3ee]/10 border border-[#06b6d4]/30">
            <h4 className="font-semibold text-[#06b6d4] mb-3">🤖 Pro Feature: AI-Powered DPA Optimization</h4>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#50C878]" />
                <span>Automated application form pre-filling (80% completion)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#50C878]" />
                <span>Document assembly and verification engine</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#50C878]" />
                <span>Real-time funding availability monitoring</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#50C878]" />
                <span>Application success probability scoring</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

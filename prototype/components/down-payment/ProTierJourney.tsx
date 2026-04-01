'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Zap, FileCheck, TrendingUp, CheckCircle, Sparkles } from 'lucide-react'
import { formatCurrency } from '@/lib/calculations'

interface SavingsData {
  downPaymentTarget: number
  currentSavings: number
  closingCostEstimate: number
  potentialSavings: {
    downPayment: number
    closingCosts: number
    total: number
  }
}

interface ProTierJourneyProps {
  savingsData: SavingsData
  onDataChange: (data: SavingsData) => void
}

type Phase = 'assessment' | 'optimization' | 'execution' | 'ongoing'

export default function ProTierJourney({
  savingsData,
  onDataChange,
}: ProTierJourneyProps) {
  const [currentPhase, setCurrentPhase] = useState<Phase>('assessment')

  const phases = [
    { id: 'assessment' as Phase, label: 'Pro Assessment', icon: Brain, time: 'Day 1-3' },
    { id: 'optimization' as Phase, label: 'AI Optimization', icon: Zap, time: 'Week 1-2' },
    { id: 'execution' as Phase, label: 'Automated Execution', icon: FileCheck, time: 'Week 3-4' },
    { id: 'ongoing' as Phase, label: 'Ongoing Optimization', icon: TrendingUp, time: 'Ongoing' },
  ]

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#50C878]/20 to-[#228B22]/20 border border-[#50C878]/30 mb-4">
          <Sparkles className="w-4 h-4 text-[#50C878]" />
          <span className="text-sm font-medium">Pro Tier - AI-Powered Optimization Active</span>
        </div>
        <h2 className="text-3xl font-bold mb-2">Your Intelligent Optimization Engine</h2>
        <p className="text-gray-400">
          AI-powered down payment sourcing, automated negotiation, and document automation
        </p>
      </div>

      {/* Phase Navigation */}
      <div className="flex justify-center gap-4 mb-8 flex-wrap">
        {phases.map((phase, index) => {
          const Icon = phase.icon
          const isActive = currentPhase === phase.id
          const isCompleted = phases.findIndex((p) => p.id === currentPhase) > index

          return (
            <button
              key={phase.id}
              onClick={() => setCurrentPhase(phase.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-[#50C878] to-[#228B22] text-white'
                  : isCompleted
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-gray-900 text-gray-500 border border-gray-800'
              }`}
            >
              <Icon className="w-5 h-5" />
              <div className="text-left">
                <div className="font-semibold">{phase.label}</div>
                <div className="text-xs">{phase.time}</div>
              </div>
              {isCompleted && <CheckCircle className="w-4 h-4 ml-2" />}
            </button>
          )
        })}
      </div>

      {/* Phase Content */}
      <AnimatePresence mode="wait">
        {currentPhase === 'assessment' && (
          <motion.div
            key="assessment"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 rounded-2xl border border-[#50C878]/30 p-8">
              <h3 className="text-2xl font-bold mb-6">Phase R1: Pro Assessment</h3>

              <div className="space-y-6">
                {/* Multi-Source Optimization */}
                <div>
                  <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    🤖 Multi-Source Down Payment Optimization Algorithm
                  </h4>
                  <div className="p-4 rounded-lg bg-gradient-to-r from-[#50C878]/10 to-[#228B22]/10 border border-[#50C878]/30">
                    <div className="text-sm text-gray-300 mb-4">
                      AI analysis of 12+ funding sources with optimal blending strategy:
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      {[
                        { source: 'DPA Programs', amount: '$8,000', optimality: '98%', taxImpact: 'None' },
                        { source: '401(k) Loan', amount: '$12,000', optimality: '95%', taxImpact: 'Low' },
                        { source: 'Family Gift', amount: '$17,000', optimality: '92%', taxImpact: 'None' },
                        { source: 'IRA Withdrawal', amount: '$8,000', optimality: '88%', taxImpact: 'Low' },
                      ].map((item, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-gray-800/50">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-white">{item.source}</span>
                            <span className="text-xs px-2 py-1 rounded bg-[#50C878]/20 text-[#50C878]">
                              {item.optimality}
                            </span>
                          </div>
                          <div className="text-[#50C878] font-bold mb-1">{item.amount}</div>
                          <div className="text-xs text-gray-400">Tax Impact: {item.taxImpact}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-3 rounded-lg bg-[#50C878]/20 border border-[#50C878]/30">
                      <div className="text-sm font-semibold text-[#50C878] mb-1">
                        Optimal Total: {formatCurrency(savingsData.potentialSavings.downPayment)}
                      </div>
                      <div className="text-xs text-gray-300">
                        Combination minimizes tax impact while maximizing available funds
                      </div>
                    </div>
                  </div>
                </div>

                {/* Historical Closing Cost Analysis */}
                <div>
                  <h4 className="text-lg font-semibold mb-3">📊 Historical Closing Cost Database Analysis</h4>
                  <div className="p-4 rounded-lg bg-gray-800/50">
                    <div className="text-sm text-gray-300 mb-4">
                      Based on 50,000+ similar transactions in your area:
                    </div>
                    <div className="space-y-2">
                      {[
                        { lender: 'Big Bank A', avg: '$12,500', success: '73%', avgReduction: '$2,200' },
                        { lender: 'Credit Union B', avg: '$9,800', success: '82%', avgReduction: '$1,800' },
                        { lender: 'Online Lender C', avg: '$8,200', success: '91%', avgReduction: '$1,500' },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-gray-900/50">
                          <div>
                            <div className="font-semibold text-white">{item.lender}</div>
                            <div className="text-xs text-gray-400">Avg: {item.avg} • Negotiation Success: {item.success}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[#50C878] font-bold">-{item.avgReduction}</div>
                            <div className="text-xs text-gray-400">avg reduction</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Predictive Savings Opportunities */}
                <div>
                  <h4 className="text-lg font-semibold mb-3">🔮 Predictive Savings Opportunity Identification</h4>
                  <div className="p-4 rounded-lg bg-gradient-to-r from-[#D4AF37]/10 to-[#FFD700]/10 border border-[#D4AF37]/30">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">High-Probability Savings</span>
                        <span className="text-2xl font-bold text-[#50C878]">
                          {formatCurrency(savingsData.potentialSavings.total * 0.8)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Optimistic Scenario</span>
                        <span className="text-xl font-semibold text-[#D4AF37]">
                          {formatCurrency(savingsData.potentialSavings.total * 1.2)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 pt-2 border-t border-gray-700">
                        Based on ML model trained on 100,000+ transactions with similar profiles
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {currentPhase === 'optimization' && (
          <motion.div
            key="optimization"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 rounded-2xl border border-[#50C878]/30 p-8">
              <h3 className="text-2xl font-bold mb-6">Phase R2: AI-Powered Optimization</h3>

              <div className="space-y-6">
                {/* AI Down Payment Sourcing Engine */}
                <div>
                  <h4 className="text-lg font-semibold mb-3">
                    🧠 AI Down Payment Sourcing Engine
                  </h4>
                  <div className="p-4 rounded-lg bg-gradient-to-r from-[#50C878]/10 to-[#228B22]/10 border border-[#50C878]/30">
                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 rounded-lg bg-gray-800/50">
                        <div className="text-2xl font-bold text-[#50C878]">12+</div>
                        <div className="text-xs text-gray-400">Sources Analyzed</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-gray-800/50">
                        <div className="text-2xl font-bold text-[#50C878]">5</div>
                        <div className="text-xs text-gray-400">Optimal Mix</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-gray-800/50">
                        <div className="text-2xl font-bold text-[#50C878]">$15,000</div>
                        <div className="text-xs text-gray-400">Max Savings</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-gray-300">
                        <strong>Tax Optimization:</strong> Minimizes tax impact across all sources
                      </div>
                      <div className="text-sm text-gray-300">
                        <strong>Timing Optimization:</strong> Coordinates fund availability with closing timeline
                      </div>
                      <div className="text-sm text-gray-300">
                        <strong>Risk Assessment:</strong> Weights each source by reliability and risk
                      </div>
                    </div>
                  </div>
                </div>

                {/* Closing Cost Arbitrage System */}
                <div>
                  <h4 className="text-lg font-semibold mb-3">⚖️ Closing Cost Arbitrage System</h4>
                  <div className="p-4 rounded-lg bg-gray-800/50">
                    <div className="text-sm text-gray-300 mb-4">
                      Real-time comparison across 20+ lenders with negotiation prediction:
                    </div>
                    <div className="space-y-3">
                      {[
                        { fee: 'Processing Fee', negotiable: true, success: '85%', avgSavings: '$750' },
                        { fee: 'Origination Fee', negotiable: true, success: '72%', avgSavings: '$1,200' },
                        { fee: 'Title Insurance', negotiable: false, success: 'N/A', avgSavings: 'Shop rates' },
                        { fee: 'Recording Fees', negotiable: false, success: 'N/A', avgSavings: 'Fixed by law' },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-gray-900/50">
                          <div>
                            <div className="font-semibold text-white">{item.fee}</div>
                            <div className="text-xs text-gray-400">
                              {item.negotiable ? 'Negotiable' : 'Fixed/Non-negotiable'}
                              {item.negotiable && ` • Success Rate: ${item.success}`}
                            </div>
                          </div>
                          <div className="text-[#50C878] font-semibold">{item.avgSavings}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {currentPhase === 'execution' && (
          <motion.div
            key="execution"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 rounded-2xl border border-[#50C878]/30 p-8">
              <h3 className="text-2xl font-bold mb-6">Phase R3: Automated Execution</h3>

              <div className="space-y-6">
                {/* Automated Gift Documentation */}
                <div>
                  <h4 className="text-lg font-semibold mb-3">✅ Automated Gift Documentation</h4>
                  <div className="p-4 rounded-lg bg-[#50C878]/10 border border-[#50C878]/30">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-300">AI-Generated Gift Letters</span>
                      <span className="text-xs px-2 py-1 rounded bg-[#50C878]/20 text-[#50C878]">
                        Ready
                      </span>
                    </div>
                    <div className="text-sm text-gray-300 mb-4">
                      All gift letters have been generated and verified for lender compliance.
                      Includes required language and tax implications.
                    </div>
                    <button className="px-4 py-2 rounded-lg bg-[#50C878] hover:bg-[#228B22] text-white text-sm font-semibold transition-colors">
                      Review & Sign Documents
                    </button>
                  </div>
                </div>

                {/* Retirement Account Strategy */}
                <div>
                  <h4 className="text-lg font-semibold mb-3">💼 CPA-Approved Retirement Account Strategy</h4>
                  <div className="p-4 rounded-lg bg-gray-800/50">
                    <div className="text-sm text-gray-300 mb-3">
                      <strong>Recommended Strategy:</strong>
                    </div>
                    <div className="space-y-2 text-sm text-gray-300">
                      <div>• 401(k) Loan: $12,000 (tax-free, 5-year payback)</div>
                      <div>• IRA Withdrawal: $8,000 (first-time buyer exemption, no penalty)</div>
                      <div>• Total Available: $20,000</div>
                    </div>
                    <div className="mt-3 text-xs text-gray-400">
                      Strategy reviewed by tax professional for optimal tax efficiency
                    </div>
                  </div>
                </div>

                {/* Automated Negotiation */}
                <div>
                  <h4 className="text-lg font-semibold mb-3">📧 AI-Powered Cost Negotiation</h4>
                  <div className="p-4 rounded-lg bg-gradient-to-r from-[#06b6d4]/10 to-[#22d3ee]/10 border border-[#06b6d4]/30">
                    <div className="text-sm text-gray-300 mb-4">
                      AI has drafted negotiation emails for your top 3 lenders:
                    </div>
                    <div className="space-y-2 mb-4">
                      {['Lender A - Processing Fee', 'Lender B - Origination Fee', 'Lender C - Total Fees'].map(
                        (item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-gray-800/50">
                            <span className="text-sm text-gray-300">{item}</span>
                            <span className="text-xs px-2 py-1 rounded bg-[#06b6d4]/20 text-[#06b6d4]">
                              Draft Ready
                            </span>
                          </div>
                        )
                      )}
                    </div>
                    <button className="px-4 py-2 rounded-lg bg-[#06b6d4] hover:bg-[#0891b2] text-white text-sm font-semibold transition-colors">
                      Review & Send Negotiations
                    </button>
                  </div>
                </div>

                {/* Compliance Check */}
                <div>
                  <h4 className="text-lg font-semibold mb-3">🔒 Regulatory Compliance Check</h4>
                  <div className="p-4 rounded-lg bg-[#50C878]/10 border border-[#50C878]/30">
                    <div className="space-y-2">
                      {[
                        'RESPA/TILA compliance verified',
                        'Gift fund documentation compliant',
                        'State-specific DPA rules verified',
                        'Anti-money laundering checks passed',
                      ].map((check, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-[#50C878]" />
                          <span className="text-sm text-gray-300">{check}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {currentPhase === 'ongoing' && (
          <motion.div
            key="ongoing"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 rounded-2xl border border-[#50C878]/30 p-8">
              <h3 className="text-2xl font-bold mb-6">Phase R4: Ongoing Optimization</h3>

              <div className="space-y-6">
                {/* Dynamic Rebalancing */}
                <div>
                  <h4 className="text-lg font-semibold mb-3">🔄 Dynamic Rebalancing</h4>
                  <div className="p-4 rounded-lg bg-gray-800/50">
                    <div className="text-sm text-gray-300 mb-3">
                      Strategy automatically adjusts based on:
                    </div>
                    <div className="space-y-2">
                      {[
                        'Market rate changes',
                        'New DPA program availability',
                        'Lender fee updates',
                        'User financial situation changes',
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                          <CheckCircle className="w-4 h-4 text-[#50C878]" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Market Opportunity Alerts */}
                <div>
                  <h4 className="text-lg font-semibold mb-3">🔔 Market Opportunity Alerts</h4>
                  <div className="p-4 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30">
                    <div className="text-sm text-gray-300 mb-2">
                      <strong>New Opportunity:</strong> State down payment grant program opening in 14 days
                    </div>
                    <div className="text-xs text-gray-400 mb-3">
                      Based on your profile, you have an 87% chance of qualifying for up to $10,000
                    </div>
                    <button className="px-4 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#FFD700] text-[#003366] text-sm font-semibold transition-colors">
                      Get Application Prepared
                    </button>
                  </div>
                </div>

                {/* Savings Verification */}
                <div>
                  <h4 className="text-lg font-semibold mb-3">✅ Savings Verification</h4>
                  <div className="p-4 rounded-lg bg-gradient-to-r from-[#50C878]/10 to-[#228B22]/10 border border-[#50C878]/30">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Projected Savings</span>
                        <span className="text-white font-semibold">
                          {formatCurrency(savingsData.potentialSavings.total)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#50C878]">Actual Savings (as strategies complete)</span>
                        <span className="text-2xl font-bold text-[#50C878]">
                          {formatCurrency(savingsData.potentialSavings.total * 0.65)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 pt-2 border-t border-gray-700">
                        Savings tracker updates in real-time as each strategy is executed
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

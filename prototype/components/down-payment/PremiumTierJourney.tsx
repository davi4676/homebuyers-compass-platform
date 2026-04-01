'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Zap, FileCheck, CheckCircle, Circle, Lock, ArrowRight } from 'lucide-react'
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

interface PremiumTierJourneyProps {
  savingsData: SavingsData
  onDataChange: (data: SavingsData) => void
  onUpgrade: () => void
}

type Phase = 'assessment' | 'planning' | 'execution'

export default function PremiumTierJourney({
  savingsData,
  onDataChange,
  onUpgrade,
}: PremiumTierJourneyProps) {
  const [currentPhase, setCurrentPhase] = useState<Phase>('assessment')

  const phases = [
    { id: 'assessment' as Phase, label: 'Personalized Assessment', icon: User, week: 'Week 1' },
    { id: 'planning' as Phase, label: 'Accelerated Planning', icon: Zap, week: 'Week 2-3' },
    { id: 'execution' as Phase, label: 'Execution Support', icon: FileCheck, week: 'Week 4-8' },
  ]

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Your Premium Optimization Journey</h2>
        <p className="text-gray-400">
          Personalized down payment acceleration and closing cost negotiation strategies
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
                  ? 'bg-gradient-to-r from-[#06b6d4] to-[#22d3ee] text-white'
                  : isCompleted
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-gray-900 text-gray-500 border border-gray-800'
              }`}
            >
              <Icon className="w-5 h-5" />
              <div className="text-left">
                <div className="font-semibold">{phase.label}</div>
                <div className="text-xs">{phase.week}</div>
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
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 rounded-2xl border border-[#06b6d4]/30 p-8">
              <h3 className="text-2xl font-bold mb-6">Phase P1: Personalized Assessment</h3>

              <div className="space-y-6">
                {/* AI-Driven Down Payment Source Matching */}
                <div>
                  <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    🤖 AI-Driven Down Payment Source Matching
                  </h4>
                  <div className="p-4 rounded-lg bg-gray-800/50 space-y-3">
                    <div className="text-sm text-gray-300 mb-4">
                      Based on your profile, we've identified the best funding sources for you:
                    </div>
                    <div className="space-y-2">
                      {[
                        { source: 'Down Payment Assistance Programs', match: '92%', savings: '$8,000' },
                        { source: '401(k) Loan', match: '85%', savings: '$12,000' },
                        { source: 'Gift Funds (Family)', match: '78%', savings: '$5,000' },
                        { source: 'Employer Assistance', match: '65%', savings: '$3,000' },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-gray-900/50">
                          <div>
                            <div className="font-semibold text-white">{item.source}</div>
                            <div className="text-xs text-gray-400">Match Score: {item.match}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[#50C878] font-bold">+{item.savings}</div>
                            <div className="text-xs text-gray-400">Potential</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Closing Cost Comparison */}
                <div>
                  <h4 className="text-lg font-semibold mb-3">Closing Cost Comparison by Lender Type</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    {[
                      { type: 'Big Bank', avg: '$12,500', range: '$10k-$15k' },
                      { type: 'Credit Union', avg: '$9,800', range: '$8k-$12k' },
                      { type: 'Online Lender', avg: '$8,200', range: '$7k-$10k' },
                    ].map((item, idx) => (
                      <div key={idx} className="p-4 rounded-lg bg-gray-800/50">
                        <div className="font-semibold text-white mb-2">{item.type}</div>
                        <div className="text-2xl font-bold text-[#06b6d4] mb-1">{item.avg}</div>
                        <div className="text-xs text-gray-400">Range: {item.range}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {currentPhase === 'planning' && (
          <motion.div
            key="planning"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 rounded-2xl border border-[#06b6d4]/30 p-8">
              <h3 className="text-2xl font-bold mb-6">Phase P2: Accelerated Planning</h3>

              <div className="space-y-6">
                {/* Automated Savings Plan */}
                <div>
                  <h4 className="text-lg font-semibold mb-3">💡 Automated Savings Plan Generator</h4>
                  <div className="p-4 rounded-lg bg-gray-800/50">
                    <div className="text-sm text-gray-300 mb-4">
                      Your personalized 6-month savings plan:
                    </div>
                    <div className="space-y-2">
                      {[
                        { month: 'Month 1-2', action: 'Apply for DPA programs', savings: '$4,000' },
                        { month: 'Month 3-4', action: 'Secure 401(k) loan', savings: '$8,000' },
                        { month: 'Month 5-6', action: 'Coordinate family gifts', savings: '$5,000' },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-gray-900/50">
                          <div>
                            <div className="font-semibold text-white">{item.month}</div>
                            <div className="text-xs text-gray-400">{item.action}</div>
                          </div>
                          <div className="text-[#50C878] font-bold">+{item.savings}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Gift Fund Optimization */}
                <div>
                  <h4 className="text-lg font-semibold mb-3">🎁 Gift Fund Tax Optimization</h4>
                  <div className="p-4 rounded-lg bg-[#50C878]/10 border border-[#50C878]/30">
                    <div className="text-sm text-gray-300 mb-3">
                      <strong>Tax-Free Gift Limit:</strong> $17,000 per person, per year (2024)
                    </div>
                    <div className="text-sm text-gray-300 mb-3">
                      <strong>Your Optimal Strategy:</strong> Split $34,000 gift between two parents
                      to maximize tax benefits
                    </div>
                    <button className="px-4 py-2 rounded-lg bg-[#50C878] hover:bg-[#228B22] text-white text-sm font-semibold transition-colors">
                      Generate Gift Letter Template
                    </button>
                  </div>
                </div>

                {/* Retirement Account Analysis */}
                <div>
                  <h4 className="text-lg font-semibold mb-3">💼 Retirement Account Withdrawal Analysis</h4>
                  <div className="p-4 rounded-lg bg-gray-800/50 space-y-3">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-400 mb-1">401(k) Loan</div>
                        <div className="text-lg font-bold text-white">$12,000 available</div>
                        <div className="text-xs text-gray-400 mt-1">Payback over 5 years</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400 mb-1">IRA Withdrawal</div>
                        <div className="text-lg font-bold text-yellow-400">$10,000 penalty-free</div>
                        <div className="text-xs text-gray-400 mt-1">First-time homebuyer exemption</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-300 pt-3 border-t border-gray-700">
                      💡 <strong>Recommendation:</strong> Use 401(k) loan for larger amount, IRA for
                      immediate needs
                    </div>
                  </div>
                </div>

                {/* Closing Cost Negotiation Playbook */}
                <div>
                  <h4 className="text-lg font-semibold mb-3">📋 Closing Cost Negotiation Playbook</h4>
                  <div className="p-4 rounded-lg bg-gradient-to-r from-[#D4AF37]/20 to-[#FFD700]/20 border border-[#D4AF37]/30">
                    <div className="space-y-2 mb-4">
                      {[
                        'Processing fees: 73% success rate in negotiation',
                        'Origination fees: 45% average reduction',
                        'Title insurance: Shop for competitive rates',
                        'Prepaid items: Fixed, but can optimize timing',
                      ].map((tip, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                          <CheckCircle className="w-4 h-4 text-[#D4AF37] mt-0.5 flex-shrink-0" />
                          <span>{tip}</span>
                        </div>
                      ))}
                    </div>
                    <button className="px-4 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#FFD700] text-[#003366] text-sm font-semibold transition-colors">
                      Generate Negotiation Script
                    </button>
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
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 rounded-2xl border border-[#06b6d4]/30 p-8">
              <h3 className="text-2xl font-bold mb-6">Phase P3: Execution Support</h3>

              <div className="space-y-6">
                {/* Document Verification */}
                <div>
                  <h4 className="text-lg font-semibold mb-3">✅ Document Verification Assistant</h4>
                  <div className="space-y-2">
                    {[
                      { doc: 'Gift Letter', status: 'ready', verified: true },
                      { doc: '401(k) Loan Docs', status: 'in-progress', verified: false },
                      { doc: 'DPA Application', status: 'pending', verified: false },
                      { doc: 'Bank Statements', status: 'ready', verified: true },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50"
                      >
                        <div className="flex items-center gap-3">
                          {item.verified ? (
                            <CheckCircle className="w-5 h-5 text-[#50C878]" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-600" />
                          )}
                          <span className="text-white">{item.doc}</span>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            item.status === 'ready'
                              ? 'bg-[#50C878]/20 text-[#50C878]'
                              : item.status === 'in-progress'
                              ? 'bg-[#D4AF37]/20 text-[#D4AF37]'
                              : 'bg-gray-700 text-gray-400'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gift Letter Generator */}
                <div>
                  <h4 className="text-lg font-semibold mb-3">📝 Gift Letter Generator</h4>
                  <div className="p-4 rounded-lg bg-[#50C878]/10 border border-[#50C878]/30">
                    <p className="text-sm text-gray-300 mb-4">
                      Generate a compliant gift letter with just a few details. Our template
                      includes all required language for lender acceptance.
                    </p>
                    <button className="px-4 py-2 rounded-lg bg-[#50C878] hover:bg-[#228B22] text-white text-sm font-semibold transition-colors">
                      Generate Gift Letter
                    </button>
                  </div>
                </div>

                {/* Cost Reduction Tracker */}
                <div>
                  <h4 className="text-lg font-semibold mb-3">📊 Cost Reduction Tracker</h4>
                  <div className="p-4 rounded-lg bg-gray-800/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Original Closing Cost Estimate</span>
                      <span className="text-white font-semibold">
                        {formatCurrency(savingsData.closingCostEstimate)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#50C878]">Negotiated Savings</span>
                      <span className="text-[#50C878] font-bold">
                        -{formatCurrency(savingsData.potentialSavings.closingCosts)}
                      </span>
                    </div>
                    <div className="pt-3 border-t border-gray-700 flex items-center justify-between">
                      <span className="text-white font-semibold">Projected Final Cost</span>
                      <span className="text-2xl font-bold text-white">
                        {formatCurrency(
                          savingsData.closingCostEstimate - savingsData.potentialSavings.closingCosts
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tier Gate */}
                <div className="p-6 rounded-lg bg-gradient-to-r from-[#06b6d4]/20 to-[#22d3ee]/20 border-2 border-[#06b6d4]">
                  <div className="flex items-start gap-3">
                    <Lock className="w-6 h-6 text-[#06b6d4] mt-1" />
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-[#06b6d4] mb-2">
                        Ready for AI-Powered Automation?
                      </h4>
                      <p className="text-sm text-gray-300 mb-4">
                        Upgrade to Pro for AI-powered down payment source blending, automated closing
                        cost negotiation emails, and document automation. Pro users save an average of
                        $15,000+.
                      </p>
                      <button
                        onClick={onUpgrade}
                        className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#06b6d4] to-[#22d3ee] text-white font-bold hover:opacity-90 transition-opacity flex items-center gap-2"
                      >
                        Upgrade to Pro <ArrowRight className="w-5 h-5" />
                      </button>
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

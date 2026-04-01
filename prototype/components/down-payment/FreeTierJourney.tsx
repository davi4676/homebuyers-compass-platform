'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calculator, BookOpen, Calendar, Lock, ArrowRight, CheckCircle } from 'lucide-react'
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

interface FreeTierJourneyProps {
  savingsData: SavingsData
  onDataChange: (data: SavingsData) => void
  onUpgrade: () => void
}

type Phase = 'assessment' | 'education' | 'planning'

export default function FreeTierJourney({
  savingsData,
  onDataChange,
  onUpgrade,
}: FreeTierJourneyProps) {
  const [currentPhase, setCurrentPhase] = useState<Phase>('assessment')

  const phases = [
    { id: 'assessment' as Phase, label: 'Assessment', icon: Calculator, week: 'Week 1-2' },
    { id: 'education' as Phase, label: 'Education', icon: BookOpen, week: 'Week 3-4' },
    { id: 'planning' as Phase, label: 'Planning', icon: Calendar, week: 'Week 5-8' },
  ]

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Your Free Tier Journey</h2>
        <p className="text-gray-400">
          Basic education and calculators to help you understand down payment and closing costs
        </p>
      </div>

      {/* Phase Navigation */}
      <div className="flex justify-center gap-4 mb-8">
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
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 rounded-2xl border border-gray-800 p-8">
              <h3 className="text-2xl font-bold mb-6">Phase F1: Assessment</h3>

              {/* Simple Down Payment Calculator */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Home Purchase Price
                  </label>
                  <input
                    type="number"
                    value={Math.round(savingsData.downPaymentTarget / 0.2)}
                    onChange={(e) => {
                      const price = Number(e.target.value) || 0
                      const downPayment = price * 0.2
                      onDataChange({
                        ...savingsData,
                        downPaymentTarget: downPayment,
                        closingCostEstimate: price * 0.03,
                      })
                    }}
                    className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-[#06b6d4]"
                    placeholder="400000"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-gray-800/50">
                    <div className="text-sm text-gray-400 mb-1">20% Down Payment</div>
                    <div className="text-2xl font-bold text-white">
                      {formatCurrency(savingsData.downPaymentTarget)}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-800/50">
                    <div className="text-sm text-gray-400 mb-1">Estimated Closing Costs (3%)</div>
                    <div className="text-2xl font-bold text-white">
                      {formatCurrency(savingsData.closingCostEstimate)}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-[#06b6d4]/20 border border-[#06b6d4]/30">
                  <div className="text-sm text-gray-300 mb-2">
                    💡 <strong>Did you know?</strong> You may not need 20% down! Many programs
                    allow 3-5% down payments.
                  </div>
                  <button
                    onClick={() => setCurrentPhase('education')}
                    className="text-[#06b6d4] hover:text-[#22d3ee] text-sm font-semibold flex items-center gap-1"
                  >
                    Learn more <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {currentPhase === 'education' && (
          <motion.div
            key="education"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 rounded-2xl border border-gray-800 p-8">
              <h3 className="text-2xl font-bold mb-6">Phase F2: Education</h3>

              <div className="space-y-6">
                {/* Down Payment Sources */}
                <div>
                  <h4 className="text-lg font-semibold mb-3">Common Down Payment Sources</h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    {[
                      'Personal savings & investments',
                      'Gifts from family (up to $17,000/year tax-free)',
                      '401(k) or IRA withdrawals',
                      'Down payment assistance programs',
                      'Employer assistance programs',
                      'Government grants (FHA, VA, USDA)',
                    ].map((source, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-3 rounded-lg bg-gray-800/50">
                        <CheckCircle className="w-5 h-5 text-[#50C878] mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-300">{source}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Closing Cost Education */}
                <div>
                  <h4 className="text-lg font-semibold mb-3">Understanding Closing Costs</h4>
                  <div className="space-y-2 text-sm text-gray-300">
                    <p>
                      Closing costs typically range from 2-5% of your home's purchase price. These
                      include:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Lender fees (origination, processing, underwriting)</li>
                      <li>Title and settlement fees</li>
                      <li>Government recording fees</li>
                      <li>Prepaid items (insurance, taxes, interest)</li>
                    </ul>
                  </div>
                </div>

                {/* Government Programs */}
                <div className="p-4 rounded-lg bg-[#50C878]/20 border border-[#50C878]/30">
                  <h4 className="font-semibold text-[#50C878] mb-2">Government Program Eligibility</h4>
                  <p className="text-sm text-gray-300 mb-3">
                    Take our quick quiz to see which down payment assistance programs you may
                    qualify for.
                  </p>
                  <button
                    onClick={() => setCurrentPhase('planning')}
                    className="px-4 py-2 rounded-lg bg-[#50C878] hover:bg-[#228B22] text-white text-sm font-semibold transition-colors"
                  >
                    Check Eligibility
                  </button>
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
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 rounded-2xl border border-gray-800 p-8">
              <h3 className="text-2xl font-bold mb-6">Phase F3: Planning</h3>

              <div className="space-y-6">
                {/* Savings Timeline Calculator */}
                <div>
                  <h4 className="text-lg font-semibold mb-3">Basic Savings Timeline Calculator</h4>
                  <div className="p-4 rounded-lg bg-gray-800/50 space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        How much can you save per month?
                      </label>
                      <input
                        type="number"
                        className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white"
                        placeholder="1000"
                      />
                    </div>
                    <div className="text-sm text-gray-300">
                      Based on your current savings and monthly contribution, you'll reach your down
                      payment goal in approximately{' '}
                      <span className="font-semibold text-white">
                        {Math.ceil(
                          (savingsData.downPaymentTarget - savingsData.currentSavings) / 2000
                        )}{' '}
                        months
                      </span>
                      .
                    </div>
                  </div>
                </div>

                {/* Document Checklist */}
                <div>
                  <h4 className="text-lg font-semibold mb-3">Basic Document Checklist</h4>
                  <div className="space-y-2">
                    {[
                      '2 years of tax returns',
                      '2 months of bank statements',
                      '30 days of pay stubs',
                      'Gift letter (if applicable)',
                      '401(k) or investment statements',
                      "Driver's license or ID",
                    ].map((doc, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-gray-800/50">
                        <div className="w-5 h-5 rounded border-2 border-gray-600 flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-[#50C878] hidden" />
                        </div>
                        <span className="text-sm text-gray-300">{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tier Gate */}
                <div className="p-6 rounded-lg bg-gradient-to-r from-[#D4AF37]/20 to-[#FFD700]/20 border-2 border-[#D4AF37]">
                  <div className="flex items-start gap-3">
                    <Lock className="w-6 h-6 text-[#D4AF37] mt-1" />
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-[#D4AF37] mb-2">
                        Ready for Personalized Optimization?
                      </h4>
                      <p className="text-sm text-gray-300 mb-4">
                        Upgrade to Premium to unlock AI-driven down payment source matching,
                        closing cost comparison by lender, and automated savings plan generation.
                        Premium users save an average of $8,420 more.
                      </p>
                      <button
                        onClick={onUpgrade}
                        className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-[#003366] font-bold hover:opacity-90 transition-opacity flex items-center gap-2"
                      >
                        Upgrade to Premium <ArrowRight className="w-5 h-5" />
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

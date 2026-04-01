'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, AlertCircle, ArrowRight, Shield } from 'lucide-react'

interface EligibilityAssessmentProps {
  onComplete: (qualified: boolean) => void
}

export default function CSDPEligibilityAssessment({ onComplete }: EligibilityAssessmentProps) {
  const [step, setStep] = useState(1)
  const [eligibility, setEligibility] = useState({
    creditScore: 0,
    dti: 0,
    homebuyerEducation: false,
    financialCounseling: false,
    communityVerification: false,
  })

  const calculateEligibility = () => {
    const creditOk = eligibility.creditScore >= 680
    const dtiOk = eligibility.dti < 43
    const educationOk = eligibility.homebuyerEducation
    const counselingOk = eligibility.financialCounseling

    const qualified = creditOk && dtiOk && educationOk && counselingOk
    return qualified
  }

  const handleComplete = () => {
    const qualified = calculateEligibility()
    onComplete(qualified)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900/50 rounded-lg p-8 border border-gray-800"
    >
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-8 h-8 text-[#06b6d4]" />
        <h2 className="text-3xl font-bold">CSDP Eligibility Assessment</h2>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold mb-2">
            Credit Score (Minimum: 680)
          </label>
          <input
            type="number"
            value={eligibility.creditScore || ''}
            onChange={(e) => setEligibility({ ...eligibility, creditScore: parseInt(e.target.value) || 0 })}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            placeholder="Enter your credit score"
          />
          {eligibility.creditScore >= 680 && (
            <div className="flex items-center gap-2 mt-2 text-[#10b981]">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Qualified</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">
            Debt-to-Income Ratio (Maximum: 43%)
          </label>
          <input
            type="number"
            value={eligibility.dti || ''}
            onChange={(e) => setEligibility({ ...eligibility, dti: parseFloat(e.target.value) || 0 })}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            placeholder="Enter your DTI %"
            step="0.1"
          />
          {eligibility.dti > 0 && eligibility.dti < 43 && (
            <div className="flex items-center gap-2 mt-2 text-[#10b981]">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Qualified</span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={eligibility.homebuyerEducation}
              onChange={(e) => setEligibility({ ...eligibility, homebuyerEducation: e.target.checked })}
              className="w-5 h-5 rounded border-gray-700 bg-gray-800 text-[#06b6d4]"
            />
            <span>Completed Homebuyer Education Course</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={eligibility.financialCounseling}
              onChange={(e) => setEligibility({ ...eligibility, financialCounseling: e.target.checked })}
              className="w-5 h-5 rounded border-gray-700 bg-gray-800 text-[#06b6d4]"
            />
            <span>Completed Financial Counseling Session</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={eligibility.communityVerification}
              onChange={(e) => setEligibility({ ...eligibility, communityVerification: e.target.checked })}
              className="w-5 h-5 rounded border-gray-700 bg-gray-800 text-[#06b6d4]"
            />
            <span>Community Verification (Optional but Recommended)</span>
          </label>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4 mt-6">
          <h3 className="font-semibold mb-2">Eligibility Status</h3>
          {calculateEligibility() ? (
            <div className="flex items-center gap-2 text-[#10b981]">
              <CheckCircle className="w-5 h-5" />
              <span>You qualify for CSDP Basic access!</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-amber-500">
              <AlertCircle className="w-5 h-5" />
              <span>Complete all requirements to qualify</span>
            </div>
          )}
        </div>

        <button
          onClick={handleComplete}
          className="w-full px-6 py-3 bg-[#06b6d4] text-white rounded-lg font-semibold hover:bg-[#0891b2] transition-all flex items-center justify-center gap-2"
        >
          Continue to Funding Model Selection <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  )
}

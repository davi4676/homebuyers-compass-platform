'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Lock,
  Shield,
  FileText,
  CheckCircle,
  AlertTriangle,
  Upload,
  TrendingDown,
  Calendar,
  DollarSign,
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

interface Phase4ClosingProps {
  userTier: UserTier
  savingsData: SavingsData
  onBack: () => void
  onUpgrade: (tier: UserTier) => void
}

interface Document {
  id: string
  name: string
  status: 'missing' | 'uploaded' | 'verified'
  requiredBy: string
  uploadedDate?: string
}

interface ClosingCostItem {
  category: string
  estimated: number
  actual: number
  change: number
  status: 'match' | 'increase' | 'decrease'
}

export default function Phase4Closing({
  userTier,
  savingsData,
  onBack,
  onUpgrade,
}: Phase4ClosingProps) {
  const isPremium = userTier === 'momentum' || userTier === 'navigator'
  const isPro = userTier === 'navigator'

  const [documents, setDocuments] = useState<Document[]>([
    { id: '1', name: 'Pay Stubs (2 months)', status: 'missing', requiredBy: 'Lender' },
    { id: '2', name: 'Tax Returns (2 years)', status: 'missing', requiredBy: 'Lender' },
    { id: '3', name: 'Bank Statements (2 months)', status: 'missing', requiredBy: 'Lender' },
    { id: '4', name: 'W-2 Forms (2 years)', status: 'missing', requiredBy: 'Lender' },
    { id: '5', name: 'Employment Verification Letter', status: 'missing', requiredBy: 'Lender' },
    { id: '6', name: 'Gift Letter (if applicable)', status: 'missing', requiredBy: 'Lender' },
  ])

  const [closingCosts, setClosingCosts] = useState<ClosingCostItem[]>([
    { category: 'Origination Fee', estimated: 2000, actual: 0, change: 0, status: 'match' },
    { category: 'Title Insurance', estimated: 1500, actual: 0, change: 0, status: 'match' },
    { category: 'Appraisal', estimated: 500, actual: 0, change: 0, status: 'match' },
    { category: 'Home Inspection', estimated: 400, actual: 0, change: 0, status: 'match' },
    { category: 'Recording Fees', estimated: 200, actual: 0, change: 0, status: 'match' },
  ])

  const documentProgress =
    (documents.filter((d) => d.status === 'verified').length / documents.length) * 100

  const handleDocumentUpload = (id: string) => {
    setDocuments(
      documents.map((doc) =>
        doc.id === id
          ? { ...doc, status: 'uploaded' as const, uploadedDate: new Date().toISOString() }
          : doc
      )
    )
  }

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
          <h1 className="text-3xl font-bold">Phase 4: Document Management & Closing</h1>
          <p className="text-gray-400">Organize documents and track closing costs</p>
        </div>
      </div>

      {/* Tier Gate Warning */}
      {!isPremium && (
        <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 rounded-xl p-6 border border-yellow-500/30">
          <div className="flex items-center gap-3 mb-2">
            <Lock className="w-6 h-6 text-yellow-400" />
            <h2 className="text-xl font-bold">Premium Feature</h2>
          </div>
          <p className="text-gray-300 mb-4">
            Upgrade to Premium to unlock document management, closing cost tracking, and lender-specific
            requirements database.
          </p>
          <button
            onClick={() => onUpgrade('momentum')}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#06b6d4] to-[#22d3ee] text-white font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            Upgrade to Premium
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {isPremium && (
        <>
          {/* Document Checklist */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-[#06b6d4]" />
                <h2 className="text-xl font-bold">Document Checklist</h2>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Progress</div>
                <div className="text-2xl font-bold text-[#06b6d4]">
                  {Math.round(documentProgress)}%
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50 border border-gray-700"
                >
                  <div className="flex items-center gap-3">
                    {doc.status === 'verified' ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : doc.status === 'uploaded' ? (
                      <CheckCircle className="w-5 h-5 text-yellow-400" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-gray-600" />
                    )}
                    <div>
                      <div className="font-medium text-gray-300">{doc.name}</div>
                      <div className="text-xs text-gray-500">Required by: {doc.requiredBy}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {doc.status === 'missing' && (
                      <button
                        onClick={() => handleDocumentUpload(doc.id)}
                        className="px-4 py-2 rounded-lg bg-[#06b6d4] hover:bg-[#0891b2] transition-colors text-sm flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Upload
                      </button>
                    )}
                    {doc.status === 'uploaded' && (
                      <span className="text-sm text-yellow-400">Pending Verification</span>
                    )}
                    {doc.status === 'verified' && (
                      <span className="text-sm text-green-400">Verified</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {isPro && (
              <div className="p-4 rounded-lg bg-[#06b6d4]/10 border border-[#06b6d4]/20">
                <h3 className="font-semibold text-[#06b6d4] mb-2">
                  🏆 Pro Feature: AI Document Pre-Scanner
                </h3>
                <p className="text-sm text-gray-300 mb-3">
                  Upload your documents and our AI will check for common issues before submission:
                </p>
                <ul className="space-y-1 text-sm text-gray-400">
                  <li>• Missing pages or signatures</li>
                  <li>• Expired dates or outdated information</li>
                  <li>• Format requirements (PDF, file size)</li>
                  <li>• Lender-specific requirements</li>
                </ul>
                <button className="mt-3 px-4 py-2 rounded-lg bg-[#06b6d4] hover:bg-[#0891b2] transition-colors text-sm text-white">
                  Scan Documents
                </button>
              </div>
            )}
          </div>

          {/* Lender-Specific Requirements */}
          {isPro && (
            <div className="bg-gradient-to-br from-[#06b6d4]/20 to-[#22d3ee]/20 rounded-xl p-6 border border-[#06b6d4]/30">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-[#06b6d4]" />
                <h2 className="text-xl font-bold">Lender-Specific Requirements Database</h2>
              </div>
              <p className="text-gray-300 mb-4">
                Different lenders have different requirements. Here's what your lender needs:
              </p>
              <div className="space-y-3">
                <div className="p-4 rounded-lg bg-gray-900/50">
                  <div className="font-semibold mb-2">Chase Bank</div>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Requires 3 months of business statements for self-employed</li>
                    <li>• Gift funds need signed gift letter from donor</li>
                    <li>• Bank statements must be within 30 days</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg bg-gray-900/50">
                  <div className="font-semibold mb-2">Rocket Mortgage</div>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Accepts digital bank statements</li>
                    <li>• W-2s can be uploaded directly from employer portal</li>
                    <li>• Tax returns must include all schedules</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Closing Cost Tracker */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-6">
              <DollarSign className="w-6 h-6 text-[#06b6d4]" />
              <h2 className="text-xl font-bold">Closing Cost Tracker</h2>
            </div>
            <p className="text-gray-300 mb-4">
              Monitor your closing costs and compare them to your Loan Estimate. Watch for
              last-minute changes.
            </p>

            <div className="space-y-3">
              {closingCosts.map((cost, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg bg-gray-800/50 border border-gray-700"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-gray-300">{cost.category}</div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-400">Estimated</div>
                        <div className="font-semibold">{formatCurrency(cost.estimated)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-400">Actual</div>
                        <div className="font-semibold text-[#06b6d4]">
                          {cost.actual > 0 ? formatCurrency(cost.actual) : 'Not set'}
                        </div>
                      </div>
                    </div>
                  </div>
                  {cost.actual > 0 && cost.change !== 0 && (
                    <div
                      className={`text-sm ${
                        cost.change > 0 ? 'text-red-400' : 'text-green-400'
                      }`}
                    >
                      {cost.change > 0 ? '+' : ''}
                      {formatCurrency(cost.change)} from estimate
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-lg bg-gray-800/50 border border-gray-700">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-lg">Total Closing Costs</div>
                <div className="text-2xl font-bold text-[#06b6d4]">
                  {formatCurrency(
                    closingCosts.reduce((sum, cost) => sum + (cost.actual || cost.estimated), 0)
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Post-Closing Savings Calculator */}
          {isPro && (
            <div className="bg-gradient-to-br from-[#06b6d4]/20 to-[#22d3ee]/20 rounded-xl p-6 border border-[#06b6d4]/30">
              <div className="flex items-center gap-3 mb-4">
                <TrendingDown className="w-6 h-6 text-[#06b6d4]" />
                <h2 className="text-xl font-bold">Post-Closing Savings Calculator</h2>
              </div>
              <p className="text-gray-300 mb-4">
                Calculate your actual savings vs. potential savings to see how well you did:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-gray-900/50">
                  <div className="text-sm text-gray-400 mb-1">Potential Savings</div>
                  <div className="text-2xl font-bold text-[#06b6d4]">
                    {formatCurrency(savingsData.loanAmount * 0.1)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">If you got the best possible rate</div>
                </div>
                <div className="p-4 rounded-lg bg-gray-900/50">
                  <div className="text-sm text-gray-400 mb-1">Actual Savings</div>
                  <div className="text-2xl font-bold text-white">
                    {formatCurrency(savingsData.loanAmount * 0.08)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Based on your final rate</div>
                </div>
              </div>
              <div className="mt-4 p-4 rounded-lg bg-gray-900/50">
                <div className="text-sm text-gray-400 mb-1">Savings Achievement</div>
                <div className="text-xl font-bold text-green-400">80%</div>
                <div className="text-xs text-gray-500 mt-1">
                  You achieved 80% of potential savings - excellent work!
                </div>
              </div>
            </div>
          )}

          {/* Closing Timeline */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-6 h-6 text-[#06b6d4]" />
              <h2 className="text-xl font-bold">Closing Timeline</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#06b6d4] flex items-center justify-center font-bold">
                  1
                </div>
                <div className="flex-1">
                  <div className="font-semibold">Document Submission</div>
                  <div className="text-sm text-gray-400">Due: Within 7 days</div>
                </div>
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#06b6d4] flex items-center justify-center font-bold">
                  2
                </div>
                <div className="flex-1">
                  <div className="font-semibold">Underwriting Review</div>
                  <div className="text-sm text-gray-400">Estimated: 14-21 days</div>
                </div>
                <div className="w-5 h-5 rounded-full border-2 border-gray-600" />
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center font-bold text-gray-600">
                  3
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-600">Final Approval</div>
                  <div className="text-sm text-gray-500">Estimated: 21-30 days</div>
                </div>
                <div className="w-5 h-5 rounded-full border-2 border-gray-600" />
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center font-bold text-gray-600">
                  4
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-600">Closing</div>
                  <div className="text-sm text-gray-500">Scheduled: {savingsData.timeline}</div>
                </div>
                <div className="w-5 h-5 rounded-full border-2 border-gray-600" />
              </div>
            </div>
          </div>
        </>
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
        {isPremium && (
          <Link
            href="/results"
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#06b6d4] to-[#22d3ee] text-white font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            Complete Journey
            <ArrowRight className="w-5 h-5" />
          </Link>
        )}
      </div>
    </motion.div>
  )
}

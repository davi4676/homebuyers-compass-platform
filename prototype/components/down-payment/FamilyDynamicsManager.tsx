'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, FileText, Heart, Lock, CheckCircle, AlertTriangle } from 'lucide-react'
import { formatCurrency } from '@/lib/calculations'
import { type UserTier } from '@/lib/tiers'

interface FamilyDynamicsManagerProps {
  giftAmount: number
  userTier: UserTier
}

export default function FamilyDynamicsManager({
  giftAmount,
  userTier,
}: FamilyDynamicsManagerProps) {
  const [agreementType, setAgreementType] = useState<'gift' | 'loan' | 'mixed'>('gift')
  const [familyMembers, setFamilyMembers] = useState(1)

  const taxFreeLimit = 17000 // 2024 gift tax exclusion
  const totalGiftLimit = taxFreeLimit * familyMembers * 2 // Two parents

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 rounded-2xl border border-purple-500/30 p-8">
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-8 h-8 text-purple-400" />
          <div>
            <h3 className="text-2xl font-bold">Family Dynamics & Gift Fund Management</h3>
            <p className="text-gray-400 text-sm">
              Navigate family relationships and legal requirements when receiving help
            </p>
          </div>
        </div>

        {/* Agreement Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Type of Family Contribution
          </label>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { type: 'gift' as const, label: 'Gift', icon: Heart, desc: 'No repayment required' },
              { type: 'loan' as const, label: 'Loan', icon: FileText, desc: 'Repayment expected' },
              { type: 'mixed' as const, label: 'Mixed', icon: Users, desc: 'Combination of both' },
            ].map(({ type, label, icon: Icon, desc }) => (
              <button
                key={type}
                onClick={() => setAgreementType(type)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  agreementType === type
                    ? 'border-purple-500 bg-purple-500/20'
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                }`}
              >
                <Icon className="w-6 h-6 text-purple-400 mb-2" />
                <div className="font-semibold text-white mb-1">{label}</div>
                <div className="text-xs text-gray-400">{desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Gift Fund Optimization */}
        {agreementType === 'gift' && (
          <div className="mb-6 p-4 rounded-lg bg-[#50C878]/10 border border-[#50C878]/30">
            <h4 className="font-semibold text-[#50C878] mb-3">🎁 Tax-Free Gift Optimization</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Number of Contributing Families (e.g., parents, in-laws)
                </label>
                <input
                  type="number"
                  min="1"
                  max="4"
                  value={familyMembers}
                  onChange={(e) => setFamilyMembers(Number(e.target.value) || 1)}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white"
                />
              </div>
              <div className="text-sm text-gray-300">
                <strong>Tax-Free Limit:</strong> {formatCurrency(totalGiftLimit)} per year
                <br />
                <span className="text-xs text-gray-400">
                  ($17,000 per person × {familyMembers} families × 2 people per family)
                </span>
              </div>
              {giftAmount > totalGiftLimit && (
                <div className="p-3 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-[#D4AF37] mt-0.5" />
                    <div className="text-sm text-gray-300">
                      <strong>Tax Implications:</strong> Amounts over {formatCurrency(totalGiftLimit)} may
                      require gift tax filing. Consult a tax professional.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loan Agreement Features (Premium+) */}
        {agreementType === 'loan' && (
          <div className="mb-6">
            {userTier === 'momentum' || userTier === 'navigator' ? (
              <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                <h4 className="font-semibold text-purple-400 mb-3">📄 Loan Agreement Generator</h4>
                <div className="space-y-3 text-sm text-gray-300">
                  <div>
                    <strong>Key Elements:</strong>
                    <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                      <li>Principal amount and repayment terms</li>
                      <li>Interest rate (if applicable) or 0% for family loans</li>
                      <li>Repayment schedule and payment method</li>
                      <li>Consequences of default</li>
                      <li>Lender disclosure requirements</li>
                    </ul>
                  </div>
                  <button className="px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white text-sm font-semibold transition-colors">
                    Generate Agreement Template
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30">
                <div className="flex items-start gap-2">
                  <Lock className="w-5 h-5 text-[#D4AF37] mt-0.5" />
                  <div className="flex-1">
                    <div className="font-semibold text-[#D4AF37] mb-1">
                      🏆 Premium Feature: Loan Agreement Generator
                    </div>
                    <div className="text-sm text-gray-300 mb-3">
                      Upgrade to Premium for legally-vetted loan agreement templates, repayment
                      schedule generators, and family communication scripts.
                    </div>
                    <button
                      onClick={() => (window.location.href = '/upgrade?tier=momentum&feature=downPaymentOptimizer')}
                      className="px-4 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#FFD700] text-[#003366] text-sm font-semibold transition-colors"
                    >
                      Upgrade to Premium
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Family Communication Guidance */}
        {userTier === 'momentum' || userTier === 'navigator' ? (
          <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30">
            <h4 className="font-semibold text-purple-400 mb-3">💬 Family Communication Scripts</h4>
            <div className="space-y-3 text-sm text-gray-300">
              <div>
                <strong>Starting the Conversation:</strong>
                <p className="mt-1 text-gray-400">
                  "Mom/Dad, I'm planning to buy a home and would appreciate your support. I've done
                  my research and can share the details. I want to ensure we're both comfortable with
                  the arrangement."
                </p>
              </div>
              <div>
                <strong>Setting Boundaries:</strong>
                <p className="mt-1 text-gray-400">
                  "This is a significant help, and I want to make sure it doesn't affect our
                  relationship. Can we agree on clear terms and put it in writing?"
                </p>
              </div>
              <button className="px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white text-sm font-semibold transition-colors">
                View All Communication Templates
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-6 p-4 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30">
            <div className="flex items-start gap-2">
              <Lock className="w-5 h-5 text-[#D4AF37] mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold text-[#D4AF37] mb-1">
                  🏆 Premium Feature: Family Communication Scripts
                </div>
                <div className="text-sm text-gray-300">
                  Upgrade for conversation starters, boundary-setting guidance, and conflict resolution
                  strategies for family money situations.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Relationship Preservation Guidelines */}
        <div className="pt-6 border-t border-gray-800">
          <h4 className="font-semibold mb-3">💚 Relationship Preservation Guidelines</h4>
          <div className="space-y-2">
            {[
              'Put everything in writing—even with family (protects everyone)',
              'Set clear expectations and repayment terms upfront',
              'Keep financial discussions separate from family gatherings',
              'Consider using a third-party mediator for large amounts',
              'Have an exit strategy if things don\'t work out',
              'Show appreciation and keep family updated on progress',
            ].map((guideline, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                <CheckCircle className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                <span>{guideline}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pro Feature: Multi-Family Coordination */}
        {userTier === 'navigator' && (
          <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-[#50C878]/10 to-[#228B22]/10 border border-[#50C878]/30">
            <h4 className="font-semibold text-[#50C878] mb-3">🤝 Pro Feature: Multi-Family Coordination</h4>
            <div className="text-sm text-gray-300 mb-3">
              Coordinate contributions from multiple families while maintaining tax efficiency and
              relationship harmony.
            </div>
            <button className="px-4 py-2 rounded-lg bg-[#50C878] hover:bg-[#228B22] text-white text-sm font-semibold transition-colors">
              Set Up Multi-Family Contribution Plan
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

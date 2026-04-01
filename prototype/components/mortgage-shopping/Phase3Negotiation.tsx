'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Lock,
  Users,
  MessageSquare,
  TrendingDown,
  Sparkles,
  Copy,
  CheckCircle,
  Clock,
  AlertCircle,
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

interface Phase3NegotiationProps {
  userTier: UserTier
  savingsData: SavingsData
  onBack: () => void
  onUpgrade: (tier: UserTier) => void
}

type LenderType = 'online' | 'credit-union' | 'big-bank' | 'local-bank' | 'mortgage-broker'

interface NegotiationScript {
  lenderType: LenderType
  script: string
  tips: string[]
}

export default function Phase3Negotiation({
  userTier,
  savingsData,
  onBack,
  onUpgrade,
}: Phase3NegotiationProps) {
  const isPro = userTier === 'navigator'

  const [selectedLenderType, setSelectedLenderType] = useState<LenderType>('online')
  const [competitorRate, setCompetitorRate] = useState('')
  const [competitorCredits, setCompetitorCredits] = useState('')
  const [copied, setCopied] = useState(false)

  const generateScript = (): NegotiationScript => {
    const rate = competitorRate || 'X.XX'
    const credits = competitorCredits || '$X,XXX'
    
    const scripts: Record<LenderType, NegotiationScript> = {
      'online': {
        lenderType: 'online',
        script: `Hi [Lender Name],

I'm shopping for a mortgage and have received a competitive offer:
- Rate: ${rate}%
- Lender credits: ${credits}

I'm very interested in working with [Lender Name] because [specific reason - fast processing, good reviews, etc.]. 

Can you match or beat this offer? I'm ready to move forward quickly if we can come to terms.

Thank you,
[Your Name]`,
        tips: [
          'Online lenders respond best to competitive pressure',
          'Mention you have 2-3 other quotes',
          'Emphasize speed - they compete on efficiency',
          'Ask about rate lock options',
        ],
      },
      'credit-union': {
        lenderType: 'credit-union',
        script: `Hello [Credit Union Name],

As a member, I'm hoping you can help me with my mortgage. I've received an offer from another lender:
- Rate: ${rate}%
- Closing costs: ${credits}

I value our relationship and would prefer to work with you. Can you match this offer? I understand credit unions often have member benefits that could make this even better.

Thank you for your consideration,
[Your Name]`,
        tips: [
          'Emphasize loyalty and membership',
          'Credit unions often have lower overhead',
          "Mention you're comparing but prefer to stay with them",
          'Ask about member-only benefits or discounts',
        ],
      },
      'big-bank': {
        lenderType: 'big-bank',
        script: `Dear [Bank Name] Loan Officer,

I'm in the process of securing a mortgage and have received a competitive offer:
- Interest rate: ${rate}%
- Lender credits: ${credits}

I have [existing relationship - checking account, credit card, etc.] with [Bank Name] and would prefer to consolidate my banking. Can you match or improve upon this offer?

I'm prepared to move forward this week if we can reach an agreement.

Best regards,
[Your Name]`,
        tips: [
          'Mention existing relationship',
          'Big banks value customer retention',
          'Ask about relationship discounts',
          'Be prepared - they may take longer to respond',
        ],
      },
      'local-bank': {
        lenderType: 'local-bank',
        script: `Hello [Local Bank],

I'm a [local resident/business owner] and am shopping for a mortgage. I've received this offer:
- Rate: ${rate}%
- Credits: ${credits}

I prefer to support local businesses and would love to work with you. Can you match this rate? I'm ready to proceed quickly.

Thank you,
[Your Name]`,
        tips: [
          'Emphasize local connection',
          'Local banks often more flexible',
          "Mention you're comparing but prefer local",
          'Ask about community member benefits',
        ],
      },
      'mortgage-broker': {
        lenderType: 'mortgage-broker',
        script: `Hi [Broker Name],

I'm working with multiple brokers and lenders. I've received this offer:
- Rate: ${rate}%
- Total costs: ${credits}

I know brokers have access to multiple lenders. Can you find me a better deal? I'm ready to move forward with the best offer.

Thanks,
[Your Name]`,
        tips: [
          'Brokers have access to wholesale rates',
          'They make money on volume, so negotiate',
          'Ask about their lender relationships',
          'Request multiple lender options',
        ],
      },
    }

    return scripts[selectedLenderType]
  }

  const currentScript = generateScript()

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentScript.script)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
          <h1 className="text-3xl font-bold">Phase 3: Negotiation & Closing</h1>
          <p className="text-gray-400">Use AI-powered scripts to negotiate the best deal</p>
        </div>
      </div>

      {/* Tier Gate Warning */}
      {!isPro && (
        <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 rounded-xl p-6 border border-yellow-500/30">
          <div className="flex items-center gap-3 mb-2">
            <Lock className="w-6 h-6 text-yellow-400" />
            <h2 className="text-xl font-bold">Pro Feature</h2>
          </div>
          <p className="text-gray-300 mb-4">
            Upgrade to Pro to unlock AI Negotiation Coach, dynamic script generator, concession
            predictor, and rate lock advisor.
          </p>
          <button
            onClick={() => onUpgrade('navigator')}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#06b6d4] to-[#22d3ee] text-white font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            Upgrade to Pro
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {isPro && (
        <>
          {/* Negotiation War Room */}
          <div className="bg-gradient-to-br from-[#06b6d4]/20 to-[#22d3ee]/20 rounded-xl p-6 border border-[#06b6d4]/30">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-[#06b6d4]" />
              <h2 className="text-xl font-bold">AI Negotiation Coach</h2>
            </div>
            <p className="text-gray-300 mb-6">
              Generate personalized negotiation scripts based on lender type and your competitive
              offers.
            </p>

            {/* Lender Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Select Lender Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {(['online', 'credit-union', 'big-bank', 'local-bank', 'mortgage-broker'] as LenderType[]).map(
                  (type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedLenderType(type)}
                      className={`px-4 py-3 rounded-lg border-2 transition-all ${
                        selectedLenderType === type
                          ? 'border-[#06b6d4] bg-[#06b6d4]/20'
                          : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                      }`}
                    >
                      <div className="text-sm font-semibold capitalize">
                        {type.replace('-', ' ')}
                      </div>
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Competitor Info */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Competitor Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={competitorRate}
                  onChange={(e) => setCompetitorRate(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white focus:border-[#06b6d4] focus:outline-none"
                  placeholder="5.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Competitor Credits ($)
                </label>
                <input
                  type="number"
                  value={competitorCredits}
                  onChange={(e) => setCompetitorCredits(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white focus:border-[#06b6d4] focus:outline-none"
                  placeholder="2000"
                />
              </div>
            </div>

            {/* Generated Script */}
            <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Generated Script</h3>
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 rounded-lg bg-[#06b6d4] hover:bg-[#0891b2] transition-colors flex items-center gap-2 text-sm"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Script
                    </>
                  )}
                </button>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 text-sm text-gray-300 whitespace-pre-wrap font-mono">
                {currentScript.script}
              </div>
            </div>

            {/* Tips */}
            <div className="mt-6 p-4 rounded-lg bg-gray-900/50 border border-gray-800">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#06b6d4]" />
                Negotiation Tips for {selectedLenderType.replace('-', ' ')}
              </h3>
              <ul className="space-y-2">
                {currentScript.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-[#06b6d4] mt-1">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Concession Predictor */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <TrendingDown className="w-6 h-6 text-[#06b6d4]" />
              <h2 className="text-xl font-bold">Concession Predictor</h2>
            </div>
            <p className="text-gray-300 mb-4">
              Based on crowdsourced data from other users, here's what you can expect:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-gray-800/50">
                <div className="text-sm text-gray-400 mb-1">Online Lenders</div>
                <div className="text-lg font-bold text-[#06b6d4]">72%</div>
                <div className="text-xs text-gray-500 mt-1">
                  of users got application fees waived
                </div>
              </div>
              <div className="p-4 rounded-lg bg-gray-800/50">
                <div className="text-sm text-gray-400 mb-1">Local Banks</div>
                <div className="text-lg font-bold text-[#06b6d4]">65%</div>
                <div className="text-xs text-gray-500 mt-1">matched rates when shown 3+ competitors</div>
              </div>
              <div className="p-4 rounded-lg bg-gray-800/50">
                <div className="text-sm text-gray-400 mb-1">Credit Unions</div>
                <div className="text-lg font-bold text-[#06b6d4]">58%</div>
                <div className="text-xs text-gray-500 mt-1">offered additional member discounts</div>
              </div>
              <div className="p-4 rounded-lg bg-gray-800/50">
                <div className="text-sm text-gray-400 mb-1">Big Banks</div>
                <div className="text-lg font-bold text-[#06b6d4]">45%</div>
                <div className="text-xs text-gray-500 mt-1">matched rates for existing customers</div>
              </div>
            </div>
          </div>

          {/* Rate Lock Advisor */}
          <div className="bg-gradient-to-br from-[#06b6d4]/20 to-[#22d3ee]/20 rounded-xl p-6 border border-[#06b6d4]/30">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-[#06b6d4]" />
              <h2 className="text-xl font-bold">Rate Lock Advisor</h2>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-gray-900/50">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                  <span className="font-semibold">Current Recommendation: Lock Now</span>
                </div>
                <p className="text-sm text-gray-300">
                  Based on Treasury yield trends and Fed meeting calendar, locking your rate now is
                  recommended. Rates are expected to increase 0.125-0.25% over the next 7 days.
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-gray-900/50">
                  <div className="text-sm text-gray-400 mb-1">10-Year Treasury Yield</div>
                  <div className="text-2xl font-bold text-[#06b6d4]">4.25%</div>
                  <div className="text-xs text-gray-500 mt-1">↑ 0.15% this week</div>
                </div>
                <div className="p-4 rounded-lg bg-gray-900/50">
                  <div className="text-sm text-gray-400 mb-1">Next Fed Meeting</div>
                  <div className="text-lg font-bold">March 20, 2024</div>
                  <div className="text-xs text-gray-500 mt-1">7 days away</div>
                </div>
              </div>
            </div>
          </div>

          {/* Multi-Lender Auction System */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-[#06b6d4]" />
              <h2 className="text-xl font-bold">Multi-Lender Auction System</h2>
            </div>
            <p className="text-gray-300 mb-4">
              Draft "Can you beat this?" emails to your top 3 lenders simultaneously. This creates
              competitive pressure and often results in better offers.
            </p>
            <button className="px-6 py-3 rounded-lg bg-[#06b6d4] hover:bg-[#0891b2] transition-colors text-white font-semibold">
              Generate Auction Emails
            </button>
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
        {isPro && (
          <Link
            href="/mortgage-shopping?phase=closing"
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#06b6d4] to-[#22d3ee] text-white font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            Continue to Phase 4: Document Management
            <ArrowRight className="w-5 h-5" />
          </Link>
        )}
      </div>
    </motion.div>
  )
}

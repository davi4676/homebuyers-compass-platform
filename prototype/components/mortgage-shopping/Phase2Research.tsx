'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Lock,
  Calculator,
  TrendingDown,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  BarChart3,
  ExternalLink,
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

interface Phase2ResearchProps {
  userTier: UserTier
  savingsData: SavingsData
  onBack: () => void
  onUpgrade: (tier: UserTier) => void
}

interface LenderQuote {
  id: string
  name: string
  rate: number
  apr: number
  closingCosts: number
  points: number
  loanType: string
  fiveYearCost?: number
  thirtyYearCost?: number
}

export default function Phase2Research({
  userTier,
  savingsData,
  onBack,
  onUpgrade,
}: Phase2ResearchProps) {
  const isPremium = userTier === 'momentum' || userTier === 'navigator'
  const isPro = userTier === 'navigator'

  const [quotes, setQuotes] = useState<LenderQuote[]>([])
  const [newQuote, setNewQuote] = useState({
    name: '',
    rate: 0,
    apr: 0,
    closingCosts: 0,
    points: 0,
    loanType: '30-year fixed',
  })

  const calculateTrueCost = (quote: LenderQuote, years: number) => {
    const monthlyRate = quote.rate / 100 / 12
    const numPayments = years * 12
    const monthlyPayment =
      monthlyRate === 0
        ? savingsData.loanAmount / numPayments
        : (savingsData.loanAmount *
            (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
          (Math.pow(1 + monthlyRate, numPayments) - 1)

    return monthlyPayment * numPayments + quote.closingCosts
  }

  const addQuote = () => {
    if (!newQuote.name || newQuote.rate === 0) return

    const tempQuote: LenderQuote = {
      id: Date.now().toString(),
      name: newQuote.name,
      rate: newQuote.rate,
      apr: newQuote.apr || newQuote.rate,
      closingCosts: newQuote.closingCosts,
      points: newQuote.points,
      loanType: newQuote.loanType,
    }

    const quote: LenderQuote = {
      ...tempQuote,
      fiveYearCost: calculateTrueCost(tempQuote, 5),
      thirtyYearCost: calculateTrueCost(tempQuote, 30),
    }

    setQuotes([...quotes, quote])
    setNewQuote({
      name: '',
      rate: 0,
      apr: 0,
      closingCosts: 0,
      points: 0,
      loanType: '30-year fixed',
    })
  }

  const bestQuote = quotes.length > 0 ? quotes.reduce((best, current) => {
    const currentCost = current.fiveYearCost || Infinity
    const bestCost = best.fiveYearCost || Infinity
    return currentCost < bestCost ? current : best
  }) : null

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
          <h1 className="text-3xl font-bold">Phase 2: Lender Research & Quote Collection</h1>
          <p className="text-gray-400">Compare rates and collect quotes from multiple lenders</p>
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
            Upgrade to Premium to unlock lender comparison tools, quote collection, and advanced
            rate analysis.
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
          {/* Strategy Guide */}
          <div className="bg-gradient-to-br from-[#06b6d4]/20 to-[#22d3ee]/20 rounded-xl p-6 border border-[#06b6d4]/30">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-[#06b6d4]" />
              <h2 className="text-xl font-bold">3-2-1 Strategy</h2>
            </div>
            <p className="text-gray-300 mb-4">
              Get quotes from 6 lenders systematically: 3 online lenders first, then 2 local
              credit unions, then 1 big bank.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-gray-900/50">
                <div className="text-2xl font-bold text-[#06b6d4] mb-1">3</div>
                <div className="text-sm text-gray-300">Online Lenders</div>
                <div className="text-xs text-gray-500 mt-2">Rocket Mortgage, Better.com, LoanDepot</div>
              </div>
              <div className="p-4 rounded-lg bg-gray-900/50">
                <div className="text-2xl font-bold text-[#06b6d4] mb-1">2</div>
                <div className="text-sm text-gray-300">Credit Unions</div>
                <div className="text-xs text-gray-500 mt-2">Local institutions, often better rates</div>
              </div>
              <div className="p-4 rounded-lg bg-gray-900/50">
                <div className="text-2xl font-bold text-[#06b6d4] mb-1">1</div>
                <div className="text-sm text-gray-300">Big Bank</div>
                <div className="text-xs text-gray-500 mt-2">Chase, Bank of America, Wells Fargo</div>
              </div>
            </div>
          </div>

          {/* Quote Battle Interface */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-[#06b6d4]" />
                <h2 className="text-xl font-bold">Quote Comparison</h2>
              </div>
              {isPro && (
                <span className="text-xs px-2 py-1 rounded-full bg-[#06b6d4]/20 text-[#06b6d4]">
                  Pro: Automated Aggregation
                </span>
              )}
            </div>

            {/* Add New Quote Form */}
            <div className="mb-6 p-4 rounded-lg bg-gray-800/50 border border-gray-700">
              <h3 className="font-semibold mb-4">Add Lender Quote</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Lender Name
                  </label>
                  <input
                    type="text"
                    value={newQuote.name}
                    onChange={(e) => setNewQuote({ ...newQuote, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white focus:border-[#06b6d4] focus:outline-none"
                    placeholder="Rocket Mortgage"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Interest Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newQuote.rate || ''}
                    onChange={(e) =>
                      setNewQuote({ ...newQuote, rate: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white focus:border-[#06b6d4] focus:outline-none"
                    placeholder="5.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    APR (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newQuote.apr || ''}
                    onChange={(e) =>
                      setNewQuote({ ...newQuote, apr: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white focus:border-[#06b6d4] focus:outline-none"
                    placeholder="5.7"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Closing Costs
                  </label>
                  <input
                    type="number"
                    value={newQuote.closingCosts || ''}
                    onChange={(e) =>
                      setNewQuote({ ...newQuote, closingCosts: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white focus:border-[#06b6d4] focus:outline-none"
                    placeholder="5000"
                  />
                </div>
              </div>
              <button
                onClick={addQuote}
                className="mt-4 px-6 py-2 rounded-lg bg-[#06b6d4] text-white font-semibold hover:bg-[#0891b2] transition-colors"
              >
                Add Quote
              </button>
            </div>

            {/* Quotes Display */}
            {quotes.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No quotes yet. Add your first lender quote above.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {quotes.map((quote, index) => {
                  const isBest = bestQuote?.id === quote.id
                  return (
                    <motion.div
                      key={quote.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-lg border-2 ${
                        isBest
                          ? 'border-[#06b6d4] bg-[#06b6d4]/10'
                          : 'border-gray-800 bg-gray-800/50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg">{quote.name}</h3>
                            {isBest && (
                              <span className="text-xs px-2 py-1 rounded-full bg-[#06b6d4] text-white">
                                Best 5-Year Cost
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-400 mt-1">{quote.loanType}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-[#06b6d4]">
                            {quote.rate.toFixed(2)}%
                          </div>
                          <div className="text-xs text-gray-400">Rate</div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-4 gap-4 mt-4">
                        <div>
                          <div className="text-xs text-gray-400 mb-1">APR</div>
                          <div className="font-semibold">{quote.apr.toFixed(2)}%</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400 mb-1">Closing Costs</div>
                          <div className="font-semibold">{formatCurrency(quote.closingCosts)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400 mb-1">5-Year Cost</div>
                          <div className="font-semibold text-[#22d3ee]">
                            {formatCurrency(quote.fiveYearCost || 0)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400 mb-1">30-Year Cost</div>
                          <div className="font-semibold">
                            {formatCurrency(quote.thirtyYearCost || 0)}
                          </div>
                        </div>
                      </div>

                      {isPro && (
                        <div className="mt-4 p-3 rounded-lg bg-[#06b6d4]/10 border border-[#06b6d4]/20">
                          <div className="text-xs text-gray-400 mb-2">Pro Insights:</div>
                          <div className="text-sm text-gray-300">
                            • This lender typically matches rates 65% of the time
                            <br />• Application fees waived 72% of the time for online lenders
                            <br />• Best time to call: Tuesday 10am-2pm
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            )}

            {isPro && quotes.length > 0 && (
              <div className="mt-6 p-4 rounded-lg bg-[#06b6d4]/10 border border-[#06b6d4]/20">
                <h3 className="font-semibold text-[#06b6d4] mb-2">
                  🏆 Pro Feature: Fee Decoder AI
                </h3>
                <p className="text-sm text-gray-300 mb-3">
                  Our AI analyzes each quote and suggests what to negotiate:
                </p>
                <div className="space-y-2 text-sm">
                  {quotes.map((quote) => (
                    <div key={quote.id} className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5" />
                      <span className="text-gray-300">
                        <strong>{quote.name}:</strong> Origination fee of{' '}
                        {formatCurrency(quote.closingCosts * 0.3)} is negotiable. Try asking for
                        0.5% instead.
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Pro Features */}
          {isPro && (
            <div className="bg-gradient-to-br from-[#06b6d4]/20 to-[#22d3ee]/20 rounded-xl p-6 border border-[#06b6d4]/30">
            <h2 className="text-xl font-bold mb-4">🏆 Pro Features</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-gray-900/50">
                <h3 className="font-semibold text-[#06b6d4] mb-2">Automated Quote Aggregator</h3>
                <p className="text-sm text-gray-300">
                  Connect to Bankrate/NerdWallet APIs for real-time rate comparisons. No manual
                  entry needed.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-gray-900/50">
                <h3 className="font-semibold text-[#06b6d4] mb-2">Lender Negotiation Database</h3>
                <p className="text-sm text-gray-300">
                  See which lenders most frequently match competitors based on crowdsourced data
                  from other users.
                </p>
              </div>
            </div>
          </div>
          )}
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
            href="/mortgage-shopping?phase=negotiation"
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#06b6d4] to-[#22d3ee] text-white font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            Continue to Phase 3: Negotiation
            <ArrowRight className="w-5 h-5" />
          </Link>
        )}
      </div>
    </motion.div>
  )
}

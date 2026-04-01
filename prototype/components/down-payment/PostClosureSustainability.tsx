'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Calendar, AlertTriangle, Lock, CheckCircle, Home } from 'lucide-react'
import { formatCurrency } from '@/lib/calculations'
import { type UserTier } from '@/lib/tiers'

interface PostClosureSustainabilityProps {
  purchasePrice: number
  downPayment: number
  monthlyIncome: number
  monthlyExpenses: number
  monthlyMortgagePayment: number
  userTier: UserTier
}

export default function PostClosureSustainability({
  purchasePrice,
  downPayment,
  monthlyIncome,
  monthlyExpenses,
  monthlyMortgagePayment,
  userTier,
}: PostClosureSustainabilityProps) {
  const [timeframe, setTimeframe] = useState<6 | 12 | 24>(12)

  // Calculate post-closing cash flow
  const totalMonthlyExpenses = monthlyExpenses + monthlyMortgagePayment
  const monthlyCashFlow = monthlyIncome - totalMonthlyExpenses
  const homeRepairFund = purchasePrice * 0.015 // 1.5% annually for repairs
  const monthlyRepairContribution = homeRepairFund / 12

  // "House-Poor" Assessment
  const housingCostRatio = (monthlyMortgagePayment / monthlyIncome) * 100
  const isHousePoor = housingCostRatio > 30 || monthlyCashFlow < monthlyIncome * 0.1

  // Cash flow projections
  const getProjection = (months: number) => {
    const totalExpenses = totalMonthlyExpenses * months
    const totalIncome = monthlyIncome * months
    const totalRepairs = monthlyRepairContribution * months
    return {
      totalExpenses: totalExpenses + totalRepairs,
      totalIncome,
      netCashFlow: totalIncome - totalExpenses - totalRepairs,
      remainingCash: monthlyCashFlow * months - totalRepairs,
    }
  }

  const projection = getProjection(timeframe)

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 rounded-2xl border border-[#06b6d4]/30 p-8">
        <div className="flex items-center gap-3 mb-6">
          <Home className="w-8 h-8 text-[#06b6d4]" />
          <div>
            <h3 className="text-2xl font-bold">Post-Closing Sustainability & Wealth Building</h3>
            <p className="text-gray-400 text-sm">
              Ensure you can thrive after closing, not just survive
            </p>
          </div>
        </div>

        {/* House-Poor Warning */}
        {isHousePoor && (
          <div className="mb-6 p-4 rounded-lg bg-[#DC143C]/10 border border-[#DC143C]/30">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-[#DC143C] mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold text-[#DC143C] mb-1">⚠️ House-Poor Warning</div>
                <div className="text-sm text-gray-300 mb-3">
                  Your housing costs represent {housingCostRatio.toFixed(1)}% of your income, which
                  exceeds the recommended 30% threshold. This may impact your ability to save,
                  invest, and handle emergencies.
                </div>
                <div className="space-y-2 text-sm text-gray-300">
                  <div><strong>Recommendations:</strong></div>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Consider increasing your down payment to reduce monthly costs</li>
                    <li>Explore longer loan terms (if available)</li>
                    <li>Identify ways to increase income or reduce other expenses</li>
                    <li>Build larger emergency fund before closing</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cash Flow Projections */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">Cash Flow Projections</h4>
            <div className="flex gap-2">
              {[6, 12, 24].map((months) => (
                <button
                  key={months}
                  onClick={() => setTimeframe(months as 6 | 12 | 24)}
                  className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
                    timeframe === months
                      ? 'bg-[#06b6d4] text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {months}M
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
              <div className="text-sm text-gray-400 mb-1">Total Income ({timeframe} months)</div>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(projection.totalIncome)}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
              <div className="text-sm text-gray-400 mb-1">Total Expenses ({timeframe} months)</div>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(projection.totalExpenses)}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Includes mortgage + repairs ({formatCurrency(monthlyRepairContribution)}/month)
              </div>
            </div>
            <div className={`p-4 rounded-lg border-2 ${
              projection.netCashFlow > 0
                ? 'border-[#50C878] bg-[#50C878]/10'
                : 'border-[#DC143C] bg-[#DC143C]/10'
            }`}>
              <div className="text-sm text-gray-400 mb-1">Net Cash Flow</div>
              <div className={`text-2xl font-bold ${
                projection.netCashFlow > 0 ? 'text-[#50C878]' : 'text-[#DC143C]'
              }`}>
                {formatCurrency(projection.netCashFlow)}
              </div>
            </div>
          </div>
        </div>

        {/* Home Maintenance Fund */}
        <div className="mb-6 p-4 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30">
          <h4 className="font-semibold text-[#D4AF37] mb-3">🔧 Home Maintenance Fund</h4>
          <div className="space-y-3 text-sm text-gray-300">
            <div>
              <strong>Annual Repair Budget:</strong> {formatCurrency(homeRepairFund)} (1.5% of home value)
            </div>
            <div>
              <strong>Monthly Contribution:</strong> {formatCurrency(monthlyRepairContribution)}
            </div>
            <div className="text-xs text-gray-400">
              Typical repairs include: HVAC ($5k-$10k), roof ($8k-$15k), plumbing ($2k-$5k),
              foundation ($5k-$15k)
            </div>
          </div>
        </div>

        {/* Wealth Building Strategies */}
        {userTier === 'navigator' ? (
          <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-[#50C878]/10 to-[#228B22]/10 border border-[#50C878]/30">
            <h4 className="font-semibold text-[#50C878] mb-3">💎 Wealth Building Strategies</h4>
            <div className="space-y-3 text-sm text-gray-300">
              <div>
                <strong>Home Equity Deployment:</strong>
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  <li>Wait 2-3 years before considering cash-out refinance</li>
                  <li>Target 80% LTV for best rates on investment properties</li>
                  <li>Consider HELOC for flexible access to equity</li>
                </ul>
              </div>
              <div>
                <strong>Tax Advantages:</strong>
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  <li>Mortgage interest deduction (if itemizing)</li>
                  <li>Property tax deductions</li>
                  <li>Home office deduction (if eligible)</li>
                  <li>Energy efficiency credits</li>
                </ul>
              </div>
              <button className="px-4 py-2 rounded-lg bg-[#50C878] hover:bg-[#228B22] text-white text-sm font-semibold transition-colors">
                Generate Personalized Wealth Building Plan
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-6 p-4 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30">
            <div className="flex items-start gap-2">
              <Lock className="w-5 h-5 text-[#D4AF37] mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold text-[#D4AF37] mb-1">
                  🏆 Pro Feature: Wealth Building Strategies
                </div>
                <div className="text-sm text-gray-300 mb-3">
                  Upgrade to Pro for home equity deployment strategies, investment property acquisition
                  roadmaps, and tax advantage maximization plans.
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

        {/* Financial Wellness Checklist */}
        <div className="pt-6 border-t border-gray-800">
          <h4 className="font-semibold mb-3">✅ Post-Closing Financial Wellness Checklist</h4>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { item: 'Maintain 6-9 months emergency fund', timeframe: 'Ongoing' },
              { item: 'Set aside 1-2% of home value annually for repairs', timeframe: 'Monthly' },
              { item: 'Review and optimize insurance coverage', timeframe: 'Annually' },
              { item: 'Maximize retirement contributions', timeframe: 'Ongoing' },
              { item: 'Rebuild emergency fund after using for down payment', timeframe: '12 months' },
              { item: 'Monitor home equity for future opportunities', timeframe: 'Annually' },
            ].map(({ item, timeframe }, idx) => (
              <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-gray-800/50">
                <div className="w-5 h-5 rounded border-2 border-gray-600 flex items-center justify-center mt-0.5">
                  <CheckCircle className="w-4 h-4 text-[#50C878] hidden" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-300">{item}</div>
                  <div className="text-xs text-gray-500">{timeframe}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { motion } from 'framer-motion'
import { DollarSign, TrendingUp, Users, CheckCircle } from 'lucide-react'
import type { Campaign, CampaignContribution } from './csdp-types'

interface FundsManagementProps {
  campaign: Campaign | Partial<Campaign> | null
}

const MOCK_CONTRIBUTIONS: CampaignContribution[] = [
  { id: '1', contributorName: 'Family Member A', amount: 2000, status: 'received', date: '2024-01-15' },
  { id: '2', contributorName: 'Friend B', amount: 500, status: 'pledged', date: '2024-01-18' },
  { id: '3', contributorName: 'Colleague C', amount: 1000, status: 'verified', date: '2024-01-10' },
]

export default function FundsManagement({ campaign }: FundsManagementProps) {
  const contributions = campaign?.contributions ?? MOCK_CONTRIBUTIONS
  const target = campaign?.targetAmount ?? 15000
  const received = contributions
    .filter((c) => c.status === 'received' || c.status === 'verified')
    .reduce((sum, c) => sum + c.amount, 0)
  const pledged = contributions
    .filter((c) => c.status === 'pledged')
    .reduce((sum, c) => sum + c.amount, 0)
  const totalRaised = received + pledged
  const progress = target > 0 ? Math.min(100, (totalRaised / target) * 100) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-gray-700 bg-gray-900/50 p-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <DollarSign className="w-8 h-8 text-[#06b6d4]" />
        <h2 className="text-2xl font-bold text-white">Funds Management</h2>
      </div>

      {campaign && (
        <div className="mb-6 p-4 rounded-lg bg-gray-800/50 border border-gray-700">
          <p className="text-sm text-gray-500">Campaign</p>
          <p className="font-semibold text-white">{campaign.campaignName ?? 'Campaign'}</p>
          <p className="text-sm text-gray-400">
            Target: ${(campaign.targetAmount ?? 0).toLocaleString()} · {campaign.timeline ?? ''}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-lg bg-[#06b6d4]/10 border border-[#06b6d4]/30 p-4">
          <div className="flex items-center gap-2 text-[#06b6d4] mb-2">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm font-medium">Total Raised</span>
          </div>
          <p className="text-2xl font-bold text-white">${totalRaised.toLocaleString()}</p>
          <p className="text-xs text-gray-500">
            ${received.toLocaleString()} received · ${pledged.toLocaleString()} pledged
          </p>
        </div>
        <div className="rounded-lg bg-gray-800/50 border border-gray-700 p-4">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <DollarSign className="w-5 h-5" />
            <span className="text-sm font-medium">Target</span>
          </div>
          <p className="text-2xl font-bold text-white">${target.toLocaleString()}</p>
        </div>
        <div className="rounded-lg bg-gray-800/50 border border-gray-700 p-4">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Users className="w-5 h-5" />
            <span className="text-sm font-medium">Contributors</span>
          </div>
          <p className="text-2xl font-bold text-white">{contributions.length}</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Progress</span>
          <span className="text-white font-medium">{progress.toFixed(0)}%</span>
        </div>
        <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6 }}
            className="h-full bg-gradient-to-r from-[#06b6d4] to-[#22d3ee] rounded-full"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Contributions</h3>
        <ul className="space-y-3">
          {contributions.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 border border-gray-700"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#06b6d4]/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-[#06b6d4]" />
                </div>
                <div>
                  <p className="font-medium text-white">{c.contributorName}</p>
                  <p className="text-xs text-gray-500">{c.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-white">${c.amount.toLocaleString()}</span>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    c.status === 'verified'
                      ? 'bg-green-500/20 text-green-400'
                      : c.status === 'received'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-amber-500/20 text-amber-400'
                  }`}
                >
                  {c.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  )
}

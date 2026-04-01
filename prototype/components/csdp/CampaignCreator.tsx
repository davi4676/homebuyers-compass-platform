'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Target, DollarSign, Calendar, ArrowRight } from 'lucide-react'
import type { Campaign, FundingModel } from './csdp-types'

interface CampaignCreatorProps {
  fundingModel?: FundingModel
  onComplete: (campaign: Campaign) => void
}

const TIMELINE_OPTIONS = [
  { id: '30', label: '30 days' },
  { id: '60', label: '60 days' },
  { id: '90', label: '90 days' },
  { id: '120', label: '120 days' },
]

export default function CampaignCreator({ fundingModel, onComplete }: CampaignCreatorProps) {
  const [campaignName, setCampaignName] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [timeline, setTimeline] = useState('60')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!fundingModel) return
    const amount = parseInt(targetAmount, 10) || 0
    if (amount <= 0) return
    onComplete({
      fundingModel,
      campaignName: campaignName.trim() || 'My Down Payment Campaign',
      targetAmount: parseInt(targetAmount, 10) || 0,
      timeline: TIMELINE_OPTIONS.find((t) => t.id === timeline)?.label ?? '60 days',
      status: 'draft',
      createdAt: new Date().toISOString(),
      complianceStatus: {
        identityVerified: false,
        documentsSubmitted: false,
        termsAccepted: false,
      },
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-gray-700 bg-gray-900/50 p-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <Target className="w-8 h-8 text-[#06b6d4]" />
        <h2 className="text-2xl font-bold text-white">Create Your Campaign</h2>
      </div>
      {fundingModel && (
        <p className="text-gray-400 mb-6">
          Funding model: <span className="text-[#06b6d4] font-medium">{fundingModel.name}</span>
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Campaign name
          </label>
          <input
            type="text"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            placeholder="e.g. First Home Down Payment"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4]"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Target amount ($)
          </label>
          <div className="relative">
            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="number"
              min="1000"
              step="500"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="15000"
              className="w-full pl-11 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4]"
            />
          </div>
          {fundingModel?.maxAmount != null && (
            <p className="text-xs text-gray-500 mt-1">
              Max for this model: ${fundingModel.maxAmount.toLocaleString()}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Campaign timeline
          </label>
          <div className="flex flex-wrap gap-2">
            {TIMELINE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setTimeline(opt.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  timeline === opt.id
                    ? 'bg-[#06b6d4] text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <Calendar className="w-4 h-4" />
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <button
          type="submit"
          disabled={!targetAmount || parseInt(targetAmount, 10) <= 0}
          className="w-full md:w-auto px-6 py-3 rounded-lg bg-[#06b6d4] text-white font-semibold hover:bg-[#0891b2] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          Create Campaign <ArrowRight className="w-5 h-5" />
        </button>
      </form>
    </motion.div>
  )
}

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Share2, Copy, CheckCircle, Mail, MessageCircle, ArrowRight } from 'lucide-react'
import type { Campaign } from './csdp-types'

interface CommunityActivationProps {
  campaign: Campaign | Partial<Campaign> | null
  onComplete: () => void
}

export default function CommunityActivation({ campaign, onComplete }: CommunityActivationProps) {
  const [copied, setCopied] = useState(false)
  const shareLink =
    campaign?.shareLink ??
    (typeof window !== 'undefined'
      ? `${window.location.origin}/csdp/invite?ref=${campaign?.id ?? 'demo'}-${Date.now().toString(36)}`
      : '')

  const copyLink = () => {
    if (typeof navigator !== 'undefined' && shareLink) {
      navigator.clipboard.writeText(shareLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shareChannels = [
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'sms', label: 'SMS / Text', icon: MessageCircle },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-gray-700 bg-gray-900/50 p-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <Share2 className="w-8 h-8 text-[#06b6d4]" />
        <h2 className="text-2xl font-bold text-white">Activate Your Community</h2>
      </div>
      <p className="text-gray-400 mb-6">
        Share your campaign link with friends, family, and your network. They can pledge or contribute
        directly through the link.
      </p>

      {campaign && (
        <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-500 mb-1">Campaign</p>
          <p className="font-semibold text-white">{campaign.campaignName ?? 'Campaign'}</p>
          <p className="text-sm text-[#06b6d4]">
            Target: ${(campaign.targetAmount ?? 0).toLocaleString()} · {campaign.timeline ?? ''}
          </p>
        </div>
      )}

      <div className="space-y-4 mb-6">
        <label className="block text-sm font-semibold text-gray-300">Your shareable link</label>
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={shareLink}
            className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
          />
          <button
            type="button"
            onClick={copyLink}
            className="flex items-center gap-2 px-4 py-3 rounded-lg bg-[#06b6d4] text-white font-medium hover:bg-[#0891b2] transition-all"
          >
            {copied ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-sm font-semibold text-gray-300 mb-3">Share via</p>
        <div className="flex gap-3">
          {shareChannels.map((ch) => {
            const Icon = ch.icon
            return (
              <button
                key={ch.id}
                type="button"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700 transition-all"
              >
                <Icon className="w-5 h-5" />
                {ch.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="rounded-lg bg-[#06b6d4]/10 border border-[#06b6d4]/30 p-4 mb-6">
        <p className="text-sm text-gray-300">
          <strong className="text-white">Tip:</strong> Personalize your message when sharing.
          Explain your goal and timeline so contributors feel part of your journey.
        </p>
      </div>

      <button
        type="button"
        onClick={onComplete}
        className="w-full md:w-auto px-6 py-3 rounded-lg bg-[#06b6d4] text-white font-semibold hover:bg-[#0891b2] transition-all flex items-center justify-center gap-2"
      >
        Continue to Funds Management <ArrowRight className="w-5 h-5" />
      </button>
    </motion.div>
  )
}

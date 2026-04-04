'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Share2, Copy, CheckCircle, Gift, Users } from 'lucide-react'
import { getUserTier } from '@/lib/user-tracking'

export default function ReferralEngine() {
  const [copied, setCopied] = useState(false)
  const [userTier, setUserTier] = useState<'foundations' | 'momentum' | 'navigator'>('foundations')

  useEffect(() => {
    const tier = getUserTier()
    setUserTier(tier === 'navigator_plus' ? 'navigator' : tier)
  }, [])

  // Generate personalized referral link
  const referralCode = `REF-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
  const referralLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/quiz?ref=${referralCode}`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareOnSocial = (platform: 'facebook' | 'twitter' | 'linkedin') => {
    const text = `I just saved $24,480 on my mortgage using NestQuest! Check it out:`
    const url = referralLink

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    }

    window.open(shareUrls[platform], '_blank', 'width=600,height=400')
  }

  return (
    <div className="bg-gradient-to-br from-[#003366] to-[#004080] rounded-2xl p-8 border border-[#0055AA]">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-lg bg-[#D4AF37]/20">
          <Gift className="w-6 h-6 text-[#D4AF37]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Refer Friends, Both Get Rewards</h2>
          <p className="text-gray-300 text-sm">Share your success and help others save</p>
        </div>
      </div>

      {/* Referral Stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-white/10 border border-white/20">
          <div className="text-sm text-gray-300 mb-1">Your Referrals</div>
          <div className="text-2xl font-bold text-white">0</div>
        </div>
        <div className="p-4 rounded-lg bg-white/10 border border-white/20">
          <div className="text-sm text-gray-300 mb-1">Total Rewards</div>
          <div className="text-2xl font-bold text-[#D4AF37] tabular-nums" title="Not tracked in this demo">
            —
          </div>
        </div>
        <div className="p-4 rounded-lg bg-white/10 border border-white/20">
          <div className="text-sm text-gray-300 mb-1">Friends Saved</div>
          <div className="text-2xl font-bold text-[#50C878] tabular-nums" title="Not tracked in this demo">
            —
          </div>
        </div>
      </div>
      <p className="text-xs text-center text-gray-400 mb-6">
        Prototype: referral rewards and friends&apos; savings are not tracked here.
      </p>

      {/* Referral Link */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Your Personal Referral Link
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={referralLink}
            readOnly
            className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white text-sm"
          />
          <button
            onClick={copyToClipboard}
            className="px-6 py-3 rounded-lg bg-[#D4AF37] hover:bg-[#FFD700] transition-colors text-[#003366] font-semibold flex items-center gap-2"
          >
            {copied ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Copied!
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

      {/* Social Share Buttons */}
      <div className="mb-6">
        <div className="text-sm font-medium text-gray-300 mb-3">Share on Social Media</div>
        <div className="flex gap-3">
          <button
            onClick={() => shareOnSocial('facebook')}
            className="flex-1 px-4 py-3 rounded-lg bg-[#1877F2] hover:bg-[#166FE5] transition-colors text-white font-semibold flex items-center justify-center gap-2"
          >
            <Share2 className="w-5 h-5" />
            Facebook
          </button>
          <button
            onClick={() => shareOnSocial('twitter')}
            className="flex-1 px-4 py-3 rounded-lg bg-[#1DA1F2] hover:bg-[#1A91DA] transition-colors text-white font-semibold flex items-center justify-center gap-2"
          >
            <Share2 className="w-5 h-5" />
            Twitter
          </button>
          <button
            onClick={() => shareOnSocial('linkedin')}
            className="flex-1 px-4 py-3 rounded-lg bg-[#0077B5] hover:bg-[#006399] transition-colors text-white font-semibold flex items-center justify-center gap-2"
          >
            <Share2 className="w-5 h-5" />
            LinkedIn
          </button>
        </div>
      </div>

      {/* Rewards Info */}
      <div className="p-4 rounded-lg bg-white/5 border border-white/10">
        <div className="flex items-start gap-3">
          <Users className="w-5 h-5 text-[#D4AF37] mt-0.5" />
          <div className="flex-1">
            <div className="font-semibold text-white mb-1">How It Works</div>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Share your link with friends</li>
              <li>• When they sign up, you both get rewards</li>
              <li>
                • {userTier === 'navigator' ? '$50' : userTier === 'momentum' ? '$25' : '$10'} credit for
                each successful referral
              </li>
              <li>• Track your referrals and rewards in real-time</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

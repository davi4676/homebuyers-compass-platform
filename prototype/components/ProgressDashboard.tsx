'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  Award,
  DollarSign,
  Trophy,
  Flame,
  BarChart3,
  CheckCircle,
  Circle,
  Share2,
  Twitter,
  Facebook,
  Linkedin,
  Copy,
} from 'lucide-react'
import { getUserProgress, getUserTier } from '@/lib/user-tracking'
import { useAuth } from '@/lib/hooks/useAuth'
import { BADGES, getXpProgress, getTotalXpForLevel } from '@/lib/gamification'
import { TIER_DEFINITIONS, type UserTier } from '@/lib/tiers'
import { formatCurrency } from '@/lib/calculations'
import { BadgeUnlockAnimation } from '@/components/BadgeUnlockAnimation'

type Tab = 'overview' | 'badges' | 'achievements' | 'stats'

interface ProgressDashboardProps {
  /** When true, hide header and use less vertical space (e.g. inside a tab) */
  compact?: boolean
  /** Optional title override */
  title?: string
}

export function ProgressDashboard({ compact = false, title = 'My progress' }: ProgressDashboardProps) {
  const { isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [userProgress, setUserProgress] = useState(getUserProgress())
  const [userTier, setUserTier] = useState<UserTier>('foundations')
  const [showBadgeAnimation, setShowBadgeAnimation] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const updateTier = () => {
      if (!isAuthenticated) setUserTier('foundations')
      else setUserTier(getUserTier())
    }
    updateTier()
    const handleTierChange = (e: CustomEvent) => {
      const newTier = e.detail?.tier as UserTier | undefined
      if (newTier && newTier in TIER_DEFINITIONS) setUserTier(newTier)
    }
    window.addEventListener('tierChanged', handleTierChange as EventListener)
    return () => window.removeEventListener('tierChanged', handleTierChange as EventListener)
  }, [isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) return
    const interval = setInterval(() => {
      setUserProgress(getUserProgress())
      setUserTier(getUserTier())
    }, 1000)
    return () => clearInterval(interval)
  }, [isAuthenticated])

  if (!userProgress) {
    return (
      <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-8 text-center text-gray-400">
        Loading progress...
      </div>
    )
  }

  const tierDef = TIER_DEFINITIONS[userTier]
  const xpProgress = getXpProgress(userProgress.totalXp, userProgress.level)
  const userBadges = BADGES.filter((b) => userProgress.badges.includes(b.id))
  const unlockedBadges = userBadges.length
  const totalBadges = BADGES.length

  const shareAchievement = (type: 'level' | 'badge' | 'savings') => {
    const text =
      type === 'level'
        ? `I just reached Level ${userProgress.level} on NestQuest! 🎉`
        : type === 'badge'
          ? `I've unlocked ${unlockedBadges} badges on NestQuest! 🏆`
          : `I've identified ${formatCurrency(userProgress.stats.totalSavings)} in savings opportunities! 💰`
    const url = window.location.origin
    const shareText = `${text} Check it out: ${url}`
    if (navigator.share) {
      navigator.share({ title: "NestQuest Achievement", text: shareText, url })
    } else {
      navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="space-y-6">
      {!compact && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-bold">{title}</h2>
          <span
            className={`rounded-lg px-4 py-2 font-semibold ${
              userTier === 'navigator' ? 'bg-[#f97316]/20 text-[#f97316]' :
              userTier === 'momentum' ? 'bg-[#06b6d4]/20 text-[#06b6d4]' :
              'bg-gray-800 text-gray-400'
            }`}
          >
            {tierDef.name}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
          <div className="mb-2 flex items-center gap-3">
            <TrendingUp className="text-[#06b6d4]" size={24} />
            <h3 className="text-sm text-gray-400">Level</h3>
          </div>
          <p className="text-3xl font-bold">{userProgress.level}</p>
          <p className="mt-1 text-sm text-gray-500">{xpProgress.current} / {xpProgress.needed} XP to next</p>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
          <div className="mb-2 flex items-center gap-3">
            <Award className="text-yellow-400" size={24} />
            <h3 className="text-sm text-gray-400">Badges</h3>
          </div>
          <p className="text-3xl font-bold">{unlockedBadges}</p>
          <p className="mt-1 text-sm text-gray-500">of {totalBadges} total</p>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
          <div className="mb-2 flex items-center gap-3">
            <Flame className="text-orange-500" size={24} />
            <h3 className="text-sm text-gray-400">Streak</h3>
          </div>
          <p className="text-3xl font-bold">{userProgress.currentStreak}</p>
          <p className="mt-1 text-sm text-gray-500">days in a row</p>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
          <div className="mb-2 flex items-center gap-3">
            <DollarSign className="text-green-400" size={24} />
            <h3 className="text-sm text-gray-400">Savings</h3>
          </div>
          <p className="text-3xl font-bold">{formatCurrency(userProgress.stats.totalSavings)}</p>
          <p className="mt-1 text-sm text-gray-500">identified</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-gray-800">
        {(['overview', 'badges', 'achievements', 'stats'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`border-b-2 px-4 py-2 font-semibold transition-colors ${
              activeTab === tab ? 'border-[#06b6d4] text-[#06b6d4]' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="min-h-[280px]">
        {activeTab === 'overview' && <OverviewTab userProgress={userProgress} xpProgress={xpProgress} />}
        {activeTab === 'badges' && (
          <BadgesTab userProgress={userProgress} onBadgeClick={(id) => setShowBadgeAnimation(id)} />
        )}
        {activeTab === 'achievements' && <AchievementsTab userProgress={userProgress} />}
        {activeTab === 'stats' && <StatsTab userProgress={userProgress} />}
      </div>

      {!compact && (
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
          <h3 className="mb-4 flex items-center gap-2 text-xl font-bold">
            <Share2 size={20} />
            Share Your Progress
          </h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => shareAchievement('level')}
              className="flex items-center gap-2 rounded-lg bg-[#06b6d4] px-4 py-2 text-white transition-colors hover:bg-[#0891b2]"
            >
              <Twitter size={18} /> Share Level
            </button>
            <button
              onClick={() => shareAchievement('badge')}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              <Facebook size={18} /> Share Badges
            </button>
            <button
              onClick={() => shareAchievement('savings')}
              className="flex items-center gap-2 rounded-lg bg-blue-800 px-4 py-2 text-white transition-colors hover:bg-blue-900"
            >
              <Linkedin size={18} /> Share Savings
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  `I'm on NestQuest! Level ${userProgress.level}, ${unlockedBadges} badges, ${formatCurrency(userProgress.stats.totalSavings)} in savings identified. ${window.location.origin}`
                )
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }}
              className="flex items-center gap-2 rounded-lg bg-gray-700 px-4 py-2 text-white transition-colors hover:bg-gray-600"
            >
              {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>
      )}

      {showBadgeAnimation && (
        <BadgeUnlockAnimation badgeId={showBadgeAnimation} onClose={() => setShowBadgeAnimation(null)} />
      )}
    </div>
  )
}

function OverviewTab({ userProgress, xpProgress }: { userProgress: any; xpProgress: any }) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
        <h3 className="mb-4 text-xl font-bold">Level Progress</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Level {userProgress.level}</span>
            <span className="text-gray-400">Level {userProgress.level + 1}</span>
          </div>
          <div className="h-4 w-full overflow-hidden rounded-full bg-gray-800">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress.progress}%` }}
              transition={{ duration: 1 }}
              className="h-full bg-gradient-to-r from-[#06b6d4] to-[#0891b2]"
            />
          </div>
          <p className="text-center text-sm text-gray-400">{xpProgress.current} / {xpProgress.needed} XP</p>
        </div>
      </div>
      <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
        <h3 className="mb-4 text-xl font-bold">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <CheckCircle className="text-green-400" size={18} />
            <span>Completed quiz assessment</span>
            <span className="ml-auto text-gray-500">+50 XP</span>
          </div>
          {userProgress.stats.actionsCompleted > 0 && (
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle className="text-green-400" size={18} />
              <span>Completed {userProgress.stats.actionsCompleted} action(s)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function BadgesTab({
  userProgress,
  onBadgeClick,
}: {
  userProgress: any
  onBadgeClick: (badgeId: string) => void
}) {
  const userBadges = BADGES.filter((b) => userProgress.badges.includes(b.id))
  const lockedBadges = BADGES.filter((b) => !userProgress.badges.includes(b.id))
  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-xl font-bold">Unlocked Badges ({userBadges.length})</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {userBadges.map((badge) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => onBadgeClick(badge.id)}
              className="cursor-pointer rounded-lg border border-gray-800 bg-gray-900/50 p-6 transition-colors hover:border-[#06b6d4]"
            >
              <div className="mb-3 text-6xl">{badge.icon}</div>
              <h4 className="mb-1 text-lg font-bold">{badge.name}</h4>
              <p className="mb-3 text-sm text-gray-400">{badge.description}</p>
              <span
                className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                  badge.rarity === 'legendary' ? 'bg-yellow-400/20 text-yellow-400' :
                  badge.rarity === 'epic' ? 'bg-purple-400/20 text-purple-400' :
                  badge.rarity === 'rare' ? 'bg-blue-400/20 text-blue-400' :
                  'bg-gray-400/20 text-gray-400'
                }`}
              >
                {badge.rarity.toUpperCase()}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="mb-4 text-xl font-bold">Locked Badges ({lockedBadges.length})</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {lockedBadges.map((badge) => (
            <div key={badge.id} className="rounded-lg border border-gray-800 bg-gray-900/50 p-6 opacity-50">
              <div className="mb-3 grayscale text-6xl">{badge.icon}</div>
              <h4 className="mb-1 text-lg font-bold">{badge.name}</h4>
              <p className="mb-3 text-sm text-gray-500">{badge.description}</p>
              <div className="text-xs text-gray-600">
                {badge.requirements.map((req, i) => (
                  <div key={i}>• {req.description}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function AchievementsTab({ userProgress }: { userProgress: any }) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
        <h3 className="mb-4 text-xl font-bold">Achievements</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">First Steps</h4>
              <p className="text-sm text-gray-400">Complete your first assessment</p>
            </div>
            {userProgress.stats.actionsCompleted > 0 ? (
              <CheckCircle className="text-green-400" size={24} />
            ) : (
              <Circle className="text-gray-600" size={24} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatsTab({ userProgress }: { userProgress: any }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
        <h3 className="mb-4 flex items-center gap-2 text-xl font-bold">
          <BarChart3 size={24} /> Statistics
        </h3>
        <div className="space-y-4">
          <div>
            <p className="mb-1 text-sm text-gray-400">Actions Completed</p>
            <p className="text-2xl font-bold">{userProgress.stats.actionsCompleted}</p>
          </div>
          <div>
            <p className="mb-1 text-sm text-gray-400">Opportunities Completed</p>
            <p className="text-2xl font-bold">{userProgress.stats.opportunitiesCompleted}</p>
          </div>
          <div>
            <p className="mb-1 text-sm text-gray-400">Days Active</p>
            <p className="text-2xl font-bold">{userProgress.stats.daysActive}</p>
          </div>
        </div>
      </div>
      <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
        <h3 className="mb-4 flex items-center gap-2 text-xl font-bold">
          <Trophy size={24} /> Milestones
        </h3>
        <div className="space-y-4">
          <div>
            <p className="mb-1 text-sm text-gray-400">Total XP</p>
            <p className="text-2xl font-bold">{userProgress.totalXp.toLocaleString()}</p>
          </div>
          <div>
            <p className="mb-1 text-sm text-gray-400">Longest Streak</p>
            <p className="text-2xl font-bold">{userProgress.longestStreak} days</p>
          </div>
          <div>
            <p className="mb-1 text-sm text-gray-400">Total Savings Identified</p>
            <p className="text-2xl font-bold text-green-400">{formatCurrency(userProgress.stats.totalSavings)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

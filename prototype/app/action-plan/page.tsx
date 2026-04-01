'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  CheckCircle,
  Circle,
  Clock,
  Calendar,
  TrendingUp,
  AlertCircle,
  Lock,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import Link from 'next/link'
import { hasFeature, type UserTier } from '@/lib/tiers'
import { getUserTier, getUserProgress } from '@/lib/user-tracking'
import { formatCurrency } from '@/lib/calculations'
import type { ActionSequence, Action } from '@/lib/algorithm/hosa-core'
import { useAuth } from '@/lib/hooks/useAuth'

export default function ActionPlanPage() {
  const searchParams = useSearchParams()
  const { isAuthenticated } = useAuth()
  const [userTier, setUserTier] = useState<UserTier>(isAuthenticated ? getUserTier() : 'foundations')
  const [userProgress, setUserProgress] = useState(isAuthenticated ? getUserProgress() : null)

  useEffect(() => {
    const updateTier = () => {
      if (!isAuthenticated) {
        setUserTier('foundations')
        setUserProgress(null)
      } else {
        setUserTier(getUserTier())
        setUserProgress(getUserProgress())
      }
    }

    // Initial load
    updateTier()

    // Listen for tier changes from developer switcher
    const handleTierChange = (e: CustomEvent) => {
      const newTier = e.detail?.tier
      if (newTier) {
        setUserTier(newTier)
      }
    }

    window.addEventListener('tierChanged', handleTierChange as EventListener)
    
    return () => {
      window.removeEventListener('tierChanged', handleTierChange as EventListener)
    }
  }, [isAuthenticated])
  
  // Check if user has access
  const hasAccess = hasFeature(userTier, 'hosa.weekByWeekPlan')
  
  // Mock action plan data (would come from HOSA in production)
  const [actionPlan, setActionPlan] = useState<ActionSequence[]>([])
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null)
  const [planReady, setPlanReady] = useState(false)

  useEffect(() => {
    setPlanReady(false)
    // In production, would fetch from HOSA output stored in results
    // For now, create mock data
    const mockPlan: ActionSequence[] = [
      {
        sequenceId: 'week-0',
        phase: 'preparation',
        weekNumber: 0,
        actions: [
          {
            id: 'action-1',
            title: 'Improve Credit Score',
            description: 'Review credit report and dispute any errors',
            category: 'credit',
            timeEstimate: 60,
            difficulty: 3,
            resources: [],
            xpReward: 50,
            streakEligible: false,
            verificationMethod: 'self-report',
          },
          {
            id: 'action-2',
            title: 'Shop Multiple Lenders',
            description: 'Get loan estimates from 3+ lenders',
            category: 'negotiation',
            timeEstimate: 120,
            difficulty: 4,
            resources: [],
            xpReward: 100,
            streakEligible: true,
            verificationMethod: 'document-upload',
          },
        ],
        parallelizable: true,
        criticalPath: true,
        optimalStartDate: new Date().toISOString().split('T')[0],
        requires: [],
        enables: ['action-3'],
        estimatedCompletion: 0,
        actualCompletion: 0,
        status: 'pending',
      },
      {
        sequenceId: 'week-1',
        phase: 'preparation',
        weekNumber: 1,
        actions: [
          {
            id: 'action-3',
            title: 'Negotiate Closing Costs',
            description: 'Use best loan estimate to negotiate with other lenders',
            category: 'negotiation',
            timeEstimate: 45,
            difficulty: 5,
            resources: [],
            xpReward: 150,
            streakEligible: true,
            verificationMethod: 'self-report',
          },
        ],
        parallelizable: false,
        criticalPath: true,
        optimalStartDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        requires: ['action-2'],
        enables: [],
        estimatedCompletion: 0,
        actualCompletion: 0,
        status: 'pending',
      },
    ]
    setActionPlan(mockPlan)
    const t = requestAnimationFrame(() => setPlanReady(true))
    return () => cancelAnimationFrame(t)
  }, [])

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Lock className="text-[#f97316] mx-auto mb-4" size={48} />
          <h2 className="text-3xl font-bold mb-4">Week-by-Week Action Plan</h2>
          <p className="text-lg text-gray-400 mb-6">
            This feature is available for Concierge members. Upgrade to unlock your personalized week-by-week action plan.
          </p>
          <Link
            href="/upgrade?tier=navigator"
            className="inline-block px-6 py-3 bg-[#f97316] text-white rounded-lg hover:bg-[#ea580c] transition-colors font-semibold"
          >
            Upgrade to Concierge →
          </Link>
        </div>
      </div>
    )
  }

  if (!planReady) {
    return (
      <div className="min-h-screen bg-brand-cream text-brand-charcoal dark:bg-[#0a0a0a] dark:text-[#f5f5f5]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8 h-12 max-w-md animate-pulse rounded-xl bg-brand-mist dark:bg-gray-800" />
          <div className="mb-4 h-6 w-2/3 animate-pulse rounded-lg bg-brand-mist dark:bg-gray-800" />
          <div className="space-y-4">
            <div className="h-40 animate-pulse rounded-xl bg-brand-mist dark:bg-gray-800" />
            <div className="h-40 animate-pulse rounded-xl bg-brand-mist dark:bg-gray-800" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="text-[#06b6d4]" size={32} />
            <h1 className="text-4xl md:text-5xl font-bold">Your Action Plan</h1>
          </div>
          <p className="text-xl text-gray-400">
            Personalized week-by-week guidance optimized for maximum savings
          </p>
          
          {/* Progress Summary */}
          {userProgress && (
            <div className="mt-6 bg-gray-900/50 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Level</p>
                  <p className="text-2xl font-bold text-[#06b6d4]">{userProgress.level}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Total XP</p>
                  <p className="text-2xl font-bold text-[#06b6d4]">{userProgress.totalXp}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Current Streak</p>
                  <p className="text-2xl font-bold text-[#06b6d4]">{userProgress.currentStreak} days</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {searchParams.get('type') === 'move-up' ? (
          <div className="mb-12 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-gray-700 bg-gray-900/50 p-5">
              <h2 className="text-lg font-bold text-[#06b6d4]">Selling your current home</h2>
              <ul className="mt-4 space-y-2 text-sm text-gray-300">
                <li>• Get a pre-listing valuation &amp; net sheet</li>
                <li>• List the same week you secure pre-approval on the buy side</li>
                <li>• Align inspection timelines on both contracts</li>
              </ul>
            </div>
            <div className="rounded-xl border border-gray-700 bg-gray-900/50 p-5">
              <h2 className="text-lg font-bold text-emerald-400">Buying your new home</h2>
              <ul className="mt-4 space-y-2 text-sm text-gray-300">
                <li>• Get pre-approved before you tour seriously</li>
                <li>• Sync contingency dates with your sale</li>
                <li>• Book movers only after both sides are firm</li>
              </ul>
              <p className="mt-4 rounded-lg bg-gray-800/80 p-3 text-xs text-gray-400">
                Sync point: list your home the same week you get pre-approved — keeps both transactions aligned.
              </p>
            </div>
          </div>
        ) : null}

        {/* Action Plan Timeline */}
        <div className="space-y-6">
          {actionPlan.map((sequence, index) => (
            <motion.div
              key={sequence.sequenceId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-900/50 rounded-lg p-6 border border-gray-800"
            >
              {/* Week Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="bg-[#06b6d4]/20 rounded-full p-3">
                    <Calendar className="text-[#06b6d4]" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      Week {sequence.weekNumber}
                    </h2>
                    <p className="text-gray-400 capitalize">{sequence.phase} Phase</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {sequence.criticalPath && (
                    <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-semibold">
                      Critical Path
                    </span>
                  )}
                  {sequence.parallelizable && (
                    <span className="px-3 py-1 bg-[#06b6d4]/20 text-[#06b6d4] rounded-full text-xs font-semibold">
                      Can Do Together
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-4 mt-6">
                {sequence.actions.map((action) => (
                  <motion.div
                    key={action.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
                  >
                    <div className="flex items-start gap-4">
                      <button className="mt-1">
                        <Circle className="w-6 h-6 text-gray-500 hover:text-[#06b6d4] transition-colors" />
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xl font-bold">{action.title}</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400">
                              +{action.xpReward} XP
                            </span>
                            {action.streakEligible && (
                              <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs">
                                Streak
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-300 mb-3">{action.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <div className="flex items-center gap-1">
                            <Clock size={16} />
                            <span>{action.timeEstimate} min</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp size={16} />
                            <span>Difficulty: {action.difficulty}/10</span>
                          </div>
                          <span className="capitalize">{action.category}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Week Info */}
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-gray-400">Optimal Start Date</p>
                    <p className="text-white font-semibold">
                      {new Date(sequence.optimalStartDate).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  {sequence.deadline && (
                    <div>
                      <p className="text-gray-400">Deadline</p>
                      <p className="text-white font-semibold">
                        {new Date(sequence.deadline).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {actionPlan.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="text-gray-500 mx-auto mb-4" size={48} />
            <p className="text-gray-400">No action plan available yet.</p>
            <p className="text-gray-400">Complete the quiz to generate your personalized plan.</p>
            <Link
              href="/quiz"
              className="inline-block mt-4 px-6 py-3 bg-[#06b6d4] text-white rounded-lg hover:bg-[#0891b2] transition-colors"
            >
              Take Quiz →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

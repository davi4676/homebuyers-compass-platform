'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  BarChart3,
  UserPlus,
  User,
  Database,
  MapPin,
  Bell,
  Calendar,
  Star,
  Activity,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Users,
  TrendingUp,
  Target,
  Zap,
  Flag,
} from 'lucide-react'
import { getUserProfile, type UserProfile } from '@/lib/user-profile'
import { getCompletedSteps, JOURNEY_STEPS, type JourneyStep } from '@/lib/journey-framework'
import { getAgentTriggerFlags, type AgentTriggerFlags } from '@/lib/agent-triggers'
import { getUserProgress, getUserTier } from '@/lib/user-tracking'
import { getStoredJourneyType } from '@/lib/journey-context'

const JOURNEY_TITLE = "Let's Face It: The Homebuying Process Is Very Complicated"

const FEATURE_SECTIONS = [
  {
    id: 'registration',
    title: 'Registration',
    description: 'User signup and authentication',
    icon: UserPlus,
    status: 'implemented' as const,
    link: '/register',
    detail: 'AuthModal (login/signup) via UserMenu; /register entry point.',
  },
  {
    id: 'user-profiles',
    title: 'User Profiles',
    description: 'User profile data and personalization',
    icon: User,
    status: 'implemented' as const,
    link: '/profile',
    detail: 'UserProfile (lib), JourneyProfilePanel; /profile view.',
  },
  {
    id: 'databases',
    title: 'List of Databases',
    description: 'Data sources and storage used by the app',
    icon: Database,
    status: 'implemented' as const,
    link: null,
    detail: 'localStorage: quizData, userProfile, journeyFrameworkCompletedSteps, agentTriggersState, buy-sell-journey-v1, refinance-journey-v1. APIs: /api/zillow/metro, /api/zillow/zip, /api/zillow/refresh, /api/hmda/msa, /api/pmms.',
  },
  {
    id: 'mapping',
    title: 'Mapping',
    description: 'Location and map data',
    icon: MapPin,
    status: 'partial' as const,
    link: '/map',
    detail: 'Location/zip in quiz and results; Zillow metro/zip APIs. /map placeholder for map view.',
  },
  {
    id: 'push-notifications',
    title: 'Push Notifications',
    description: 'In-app and browser push notifications',
    icon: Bell,
    status: 'partial' as const,
    link: null,
    detail: 'In-app: NotificationSystem (toasts). Browser push: not implemented.',
  },
  {
    id: 'calendar',
    title: 'Calendar',
    description: 'Timeline and scheduling',
    icon: Calendar,
    status: 'implemented' as const,
    link: '/calendar',
    detail: 'Timeline in journey/action-plan; /calendar placeholder for scheduling.',
  },
  {
    id: 'ratings-reviews',
    title: 'Ratings and Reviews',
    description: 'User ratings and feedback',
    icon: Star,
    status: 'implemented' as const,
    link: '/ratings',
    detail: 'Marketplace and professional pages; /ratings placeholder for reviews.',
  },
  {
    id: 'in-app-analytics',
    title: 'In-App Analytics',
    description: 'Usage and journey tracking',
    icon: Activity,
    status: 'implemented' as const,
    link: null,
    detail: 'UserJourneyTracker, UserProfilePanel (journey, profile, triggers, next best action).',
  },
]

function StatusBadge({ status }: { status: 'implemented' | 'partial' | 'not-implemented' }) {
  const config = {
    implemented: { label: 'Implemented', color: 'bg-green-500/20 text-green-400 border-green-500/50', Icon: CheckCircle },
    partial: { label: 'Partial', color: 'bg-amber-500/20 text-amber-400 border-amber-500/50', Icon: AlertCircle },
    'not-implemented': { label: 'Not implemented', color: 'bg-gray-500/20 text-gray-400 border-gray-500/50', Icon: AlertCircle },
  }
  const { label, color, Icon } = config[status]
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${color}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  )
}

/** User statistics read from client-side storage (this browser). */
interface UserStats {
  profile: UserProfile
  completedSteps: JourneyStep[]
  agentFlags: AgentTriggerFlags
  tier: string
  progress: { level: number; xp: number; streak: number; badgesCount: number } | null
  storedJourneyType: string | null
}

function useUserStats(): UserStats | null {
  const [stats, setStats] = useState<UserStats | null>(null)
  useEffect(() => {
    setStats({
      profile: getUserProfile(),
      completedSteps: getCompletedSteps(),
      agentFlags: getAgentTriggerFlags(),
      tier: getUserTier(),
      progress: (() => {
        const p = getUserProgress()
        if (!p) return null
        return {
          level: p.level,
          xp: p.xp,
          streak: p.currentStreak,
          badgesCount: p.badges?.length ?? 0,
        }
      })(),
      storedJourneyType: getStoredJourneyType(),
    })
  }, [])
  return stats
}

function UserAnalyticsSection() {
  const stats = useUserStats()
  if (!stats) {
    return (
      <div className="rounded-xl border border-gray-600 bg-gray-800 p-6">
        <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <Users className="w-5 h-5 text-[#06b6d4]" />
          User Analytics Dashboard
        </h2>
        <p className="text-sm text-gray-400">Loading user statistics…</p>
      </div>
    )
  }
  const { profile, completedSteps, agentFlags, tier, progress, storedJourneyType } = stats
  const stepsComplete = completedSteps.length
  const stepsTotal = JOURNEY_STEPS.length
  const agentFlagsCount = [
    agentFlags.confidencePlateau,
    agentFlags.firstStretchRisk,
    agentFlags.repeatedHesitation,
    agentFlags.explicitHelpTap,
  ].filter(Boolean).length

  return (
    <div className="rounded-xl border border-gray-600 bg-gray-800 p-6 space-y-6">
      <h2 className="text-lg font-bold text-white flex items-center gap-2">
        <Users className="w-5 h-5 text-[#06b6d4]" />
        User Analytics Dashboard
      </h2>
      <p className="text-sm text-gray-400">
        Standard view of user statistics for this browser (from localStorage). App creator view only.
      </p>

      {/* Overview cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="rounded-lg border border-gray-600 bg-gray-800/50 p-4">
          <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-wide mb-1">
            <Target className="w-3.5 h-3.5" />
            Buyer type
          </div>
          <div className="text-white font-semibold capitalize">{profile.buyerType}</div>
        </div>
        <div className="rounded-lg border border-gray-600 bg-gray-800/50 p-4">
          <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-wide mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Confidence
          </div>
          <div className="text-white font-semibold">{profile.confidenceScore}</div>
        </div>
        <div className="rounded-lg border border-gray-600 bg-gray-800/50 p-4">
          <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-wide mb-1">
            <Activity className="w-3.5 h-3.5" />
            Steps done
          </div>
          <div className="text-white font-semibold">{stepsComplete} / {stepsTotal}</div>
        </div>
        <div className="rounded-lg border border-gray-600 bg-gray-800/50 p-4">
          <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-wide mb-1">
            <Zap className="w-3.5 h-3.5" />
            Tier
          </div>
          <div className="text-white font-semibold capitalize">{tier}</div>
        </div>
        <div className="rounded-lg border border-gray-600 bg-gray-800/50 p-4">
          <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-wide mb-1">
            <Flag className="w-3.5 h-3.5" />
            Agent triggers
          </div>
          <div className="text-white font-semibold">{agentFlagsCount}</div>
        </div>
      </div>

      {/* User profile breakdown */}
      <div>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">User profile</h3>
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 text-sm">
          <dt className="text-gray-500">Buyer type</dt>
          <dd className="text-white capitalize">{profile.buyerType}</dd>
          <dt className="text-gray-500">Risk tolerance</dt>
          <dd className="text-white capitalize">{profile.riskTolerance}</dd>
          <dt className="text-gray-500">Time horizon</dt>
          <dd className="text-white capitalize">{profile.timeHorizon}</dd>
          <dt className="text-gray-500">Detail preference</dt>
          <dd className="text-white capitalize">{profile.detailPreference}</dd>
        </dl>
        {storedJourneyType && (
          <p className="text-xs text-gray-500 mt-2">Stored journey type (quiz): {storedJourneyType}</p>
        )}
      </div>

      {/* Journey funnel */}
      <div>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">Journey funnel</h3>
        <div className="flex flex-wrap gap-2">
          {JOURNEY_STEPS.map((step) => {
            const done = completedSteps.includes(step)
            return (
              <div
                key={step}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm capitalize ${
                  done ? 'border-green-500/50 bg-green-500/10 text-green-400' : 'border-gray-600 bg-gray-800/50 text-gray-400'
                }`}
              >
                {done ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0 opacity-50" />}
                {step}
              </div>
            )
          })}
        </div>
      </div>

      {/* Agent triggers */}
      <div>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">Agent trigger flags</h3>
        <ul className="space-y-1 text-sm">
          <li className={agentFlags.confidencePlateau ? 'text-amber-400' : 'text-gray-500'}>
            Confidence plateau: {agentFlags.confidencePlateau ? 'Yes' : 'No'}
          </li>
          <li className={agentFlags.firstStretchRisk ? 'text-amber-400' : 'text-gray-500'}>
            First stretch/risk: {agentFlags.firstStretchRisk ? 'Yes' : 'No'}
          </li>
          <li className={agentFlags.repeatedHesitation ? 'text-amber-400' : 'text-gray-500'}>
            Repeated hesitation: {agentFlags.repeatedHesitation ? 'Yes' : 'No'}
          </li>
          <li className={agentFlags.explicitHelpTap ? 'text-amber-400' : 'text-gray-500'}>
            Explicit help tap: {agentFlags.explicitHelpTap ? 'Yes' : 'No'}
          </li>
        </ul>
      </div>

      {/* Progress (gamification) */}
      {progress && (
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">Progress</h3>
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 text-sm">
            <dt className="text-gray-500">Level</dt>
            <dd className="text-white">{progress.level}</dd>
            <dt className="text-gray-500">XP</dt>
            <dd className="text-white">{progress.xp}</dd>
            <dt className="text-gray-500">Current streak</dt>
            <dd className="text-white">{progress.streak} days</dd>
            <dt className="text-gray-500">Badges</dt>
            <dd className="text-white">{progress.badgesCount}</dd>
          </dl>
        </div>
      )}
    </div>
  )
}

export default function AnalyticsDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <header className="sticky top-0 z-10 border-b border-gray-700 bg-gray-900/95 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-[#06b6d4]" />
            <h1 className="text-xl font-bold">Analytics Dashboard</h1>
          </div>
          <Link
            href="/"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← Back to app
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <p className="text-gray-400 mb-8">
          App creator view: feature status and links for registration, user profiles, databases, mapping, push notifications, calendar, ratings and reviews, and in-app analytics.
        </p>

        <section className="mb-10">
          <UserAnalyticsSection />
        </section>

        <div className="space-y-6">
          {FEATURE_SECTIONS.map((section) => {
            const Icon = section.icon
            return (
              <div
                key={section.id}
                className="rounded-xl border border-gray-600 bg-gray-800 p-6 hover:border-gray-500 transition-colors"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-[#06b6d4]/20 p-3">
                      <Icon className="w-6 h-6 text-[#06b6d4]" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white mb-1">
                        {section.title}
                      </h2>
                      <p className="text-sm text-gray-400 mb-2">
                        {section.description}
                      </p>
                      <p className="text-xs text-gray-500 max-w-2xl">
                        {section.detail}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <StatusBadge status={section.status} />
                    {section.link && (
                      <Link
                        href={section.link}
                        className="inline-flex items-center gap-1 text-sm text-[#06b6d4] hover:underline"
                      >
                        Open
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-12 p-6 rounded-xl border border-gray-600 bg-gray-800">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Quick links (app creator)
          </h3>
          <div className="flex flex-wrap gap-4">
            <Link href="/register" className="text-[#06b6d4] hover:underline text-sm">Registration</Link>
            <Link href="/profile" className="text-[#06b6d4] hover:underline text-sm">User Profile</Link>
            <Link href="/map" className="text-[#06b6d4] hover:underline text-sm">Mapping</Link>
            <Link href="/calendar" className="text-[#06b6d4] hover:underline text-sm">Calendar</Link>
            <Link href="/ratings" className="text-[#06b6d4] hover:underline text-sm">Ratings & Reviews</Link>
            <Link href="/customized-journey" className="text-[#06b6d4] hover:underline text-sm">Journey</Link>
            <Link href="/admin/rollout-monitor" className="text-[#06b6d4] hover:underline text-sm">Rollout Monitor</Link>
          </div>
        </div>
      </main>
    </div>
  )
}

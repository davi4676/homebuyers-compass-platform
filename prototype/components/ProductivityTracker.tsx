'use client'

import { TrendingUp, Target, Zap, Activity, Award } from 'lucide-react'
import { useProgress } from '@/lib/hooks/useProgress'
import { useAuth } from '@/lib/hooks/useAuth'
import Link from 'next/link'
import { getXpProgress } from '@/lib/gamification'
import { BADGES } from '@/lib/gamification'

export default function ProductivityTracker() {
  const { user, isAuthenticated } = useAuth()
  const { progress, productivity, loading } = useProgress()

  if (!isAuthenticated) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 text-center">
        <Activity className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <p className="text-slate-600 mb-2">Sign in to track your progress</p>
        <Link href="/login" className="text-[rgb(var(--coral))] hover:underline text-sm font-semibold">
          Log in
        </Link>
        {' · '}
        <Link href="/register" className="text-[rgb(var(--coral))] hover:underline text-sm font-semibold">
          Sign up
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
        <p className="text-slate-500">Loading your progress...</p>
      </div>
    )
  }

  const xpProgress = progress
    ? getXpProgress(progress.totalXp, progress.level)
    : { current: 0, needed: 100, progress: 0 }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 space-y-6">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-[rgb(var(--navy))]" />
        <h2 className="text-lg font-semibold text-[rgb(var(--navy))]">Buildout Progress</h2>
      </div>

      {/* Level & XP */}
      {progress && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
            <p className="text-2xl font-bold text-[rgb(var(--navy))]">Level {progress.level}</p>
            <p className="text-xs text-slate-500">Current level</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
            <p className="text-2xl font-bold text-slate-800">{progress.totalXp}</p>
            <p className="text-xs text-slate-500">Total XP</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
            <p className="text-2xl font-bold text-amber-600">{progress.currentStreak}</p>
            <p className="text-xs text-slate-500">Day streak</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
            <p className="text-2xl font-bold text-emerald-600">{progress.stats.actionsCompleted}</p>
            <p className="text-xs text-slate-500">Actions done</p>
          </div>
        </div>
      )}

      {/* XP bar */}
      {progress && (
        <div>
          <div className="flex justify-between text-sm text-slate-500 mb-1">
            <span>XP to next level</span>
            <span>{xpProgress.current} / {xpProgress.needed}</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[rgb(var(--coral))] transition-all"
              style={{ width: `${xpProgress.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Activity summary */}
      {productivity && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Activity className="w-4 h-4" />
            <span>This week</span>
          </div>
          <ul className="space-y-1 text-sm">
            <li className="flex justify-between">
              <span className="text-slate-500">Quiz completed</span>
              <span className="font-medium text-slate-800">{productivity.quizCompleted}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-slate-500">Results viewed</span>
              <span className="font-medium text-slate-800">{productivity.resultsViewed}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-slate-500">Journey steps</span>
              <span className="font-medium text-slate-800">{productivity.journeyStepsCompleted}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-slate-500">Tools used</span>
              <span className="font-medium text-slate-800">{productivity.toolsUsed}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-slate-500">Events this week</span>
              <span className="font-medium text-slate-800">{productivity.eventsThisWeek}</span>
            </li>
          </ul>
          {productivity.lastActiveAt && (
            <p className="text-xs text-slate-400 mt-2">
              Last active: {new Date(productivity.lastActiveAt).toLocaleDateString()}
            </p>
          )}
        </div>
      )}

      {/* Badges */}
      {progress && progress.badges.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Award className="w-4 h-4" />
            <span>Badges</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {progress.badges.slice(0, 10).map((badgeId) => {
              const badge = BADGES.find((b) => b.id === badgeId)
              return (
                <span
                  key={badgeId}
                  className="px-2 py-1 rounded-lg bg-slate-100 text-slate-700 text-sm border border-slate-200"
                  title={badge?.description}
                >
                  {badge?.icon || '?'} {badge?.name || badgeId}
                </span>
              )
            })}
          </div>
        </div>
      )}

      <Link
        href="/customized-journey"
        className="inline-flex items-center gap-2 text-[rgb(var(--coral))] hover:underline text-sm font-semibold"
      >
        <Target className="w-4 h-4" />
        Continue your journey
      </Link>
    </div>
  )
}

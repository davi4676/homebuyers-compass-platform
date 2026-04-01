'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import type { UserProgress } from '@/lib/gamification'
import { getUserProgress, saveUserProgress, awardXpForAction } from '@/lib/user-tracking'

/**
 * Progress and productivity for the current user.
 * When authenticated: syncs with API. When not: uses localStorage.
 */
export function useProgress() {
  const { user, isAuthenticated } = useAuth()
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [productivity, setProductivity] = useState<{
    totalEvents: number
    quizCompleted: number
    resultsViewed: number
    journeyStepsCompleted: number
    toolsUsed: number
    lastActiveAt: string | null
    eventsThisWeek: number
  } | null>(null)

  const fetchProgress = useCallback(async () => {
    if (!isAuthenticated || !user) {
      const local = getUserProgress()
      setProgress(local)
      setProductivity(null)
      setLoading(false)
      return
    }
    try {
      const [progressRes, prodRes] = await Promise.all([
        fetch('/api/user/progress', { credentials: 'include' }),
        fetch('/api/user/activity?summary=true', { credentials: 'include' }),
      ])
      if (progressRes.ok) {
        const data = await progressRes.json()
        setProgress(data)
      } else {
        setProgress(getUserProgress())
      }
      if (prodRes.ok) {
        const data = await prodRes.json()
        setProductivity(data)
      } else {
        setProductivity(null)
      }
    } catch {
      setProgress(getUserProgress())
      setProductivity(null)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user])

  useEffect(() => {
    setLoading(true)
    fetchProgress()
  }, [fetchProgress])

  const saveProgress = useCallback(
    async (next: UserProgress) => {
      setProgress(next)
      if (!isAuthenticated) {
        saveUserProgress(next)
        return
      }
      try {
        await fetch('/api/user/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(next),
        })
      } catch (e) {
        console.error('Failed to save progress to API:', e)
        saveUserProgress(next)
      }
    },
    [isAuthenticated]
  )

  const trackActivity = useCallback(
    async (actionId: string) => {
      if (isAuthenticated) {
        try {
          await fetch('/api/user/activity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ actionId }),
          })
          fetchProgress()
        } catch (e) {
          console.error('Failed to track activity:', e)
        }
      }
    },
    [isAuthenticated, fetchProgress]
  )

  const awardXp = useCallback(
    (actionId: string, xpAmount: number) => {
      const result = awardXpForAction(actionId, xpAmount)
      if (isAuthenticated && result.newProgress) {
        saveProgress(result.newProgress)
      }
      return result
    },
    [isAuthenticated, saveProgress]
  )

  return {
    progress,
    productivity,
    loading,
    refetch: fetchProgress,
    saveProgress,
    trackActivity,
    awardXp,
  }
}

import { NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth-server'
import { getProductivitySummary } from '@/lib/db/activity'
import { getProgress } from '@/lib/db/progress'

/**
 * GET /api/user/productivity
 * Returns full productivity dashboard data: progress (XP, level, streak) + activity summary.
 */
export async function GET() {
  const session = await getSessionFromRequest()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const progress = getProgress(session.userId, 'foundations')
  const summary = getProductivitySummary(session.userId)

  return NextResponse.json({
    progress: {
      level: progress.level,
      xp: progress.xp,
      totalXp: progress.totalXp,
      currentStreak: progress.currentStreak,
      longestStreak: progress.longestStreak,
      lastActionDate: progress.lastActionDate,
      badges: progress.badges,
      stats: progress.stats,
    },
    activity: summary,
  })
}

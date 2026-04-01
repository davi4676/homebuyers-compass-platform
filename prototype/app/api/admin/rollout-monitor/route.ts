import { NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/admin-auth'
import {
  getReminderRunStats,
  listReminderRuns,
  getReminderChannelStats,
  getReminderTrendStats,
} from '@/lib/db/reminder-runs'
import { getPushSubscriptionStats } from '@/lib/db/push-subscriptions'
import { getExperimentEventStats } from '@/lib/experiments'

export async function GET() {
  const auth = await requireAdminSession()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const reminderStats = getReminderRunStats()
  const reminderRuns = listReminderRuns(15)
  const reminderChannels = getReminderChannelStats()
  const reminderTrends = getReminderTrendStats()
  const pushStats = getPushSubscriptionStats()
  const experimentStats = getExperimentEventStats()

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    reminderStats,
    reminderRuns,
    reminderChannels,
    reminderTrends,
    pushStats,
    experimentStats,
  })
}


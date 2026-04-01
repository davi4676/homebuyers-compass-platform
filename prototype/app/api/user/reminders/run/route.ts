import { NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth-server'
import { runReminderOrchestration } from '@/lib/reminders/orchestrator'
import { addReminderRun } from '@/lib/db/reminder-runs'

function isAuthorizedCron(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET
  const auth = request.headers.get('authorization') || ''
  if (cronSecret && auth === `Bearer ${cronSecret}`) return true

  // Vercel cron requests include this header. Use only in production deployments.
  const vercelCron = request.headers.get('x-vercel-cron')
  if (process.env.NODE_ENV === 'production' && vercelCron) return true
  return false
}

export async function POST(request: Request) {
  // Allow either authenticated user (manual trigger) or protected cron trigger.
  const session = await getSessionFromRequest()
  const cronAllowed = isAuthorizedCron(request)
  if (!session && !cronAllowed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await runReminderOrchestration()
  addReminderRun({
    startedAt: new Date().toISOString(),
    processed: result.processed,
    deliveries: result.deliveries,
    failures: result.failures,
    details: result.details,
  })
  return NextResponse.json({ result })
}


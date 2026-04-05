import { NextResponse } from 'next/server'
import { listUsers } from '@/lib/user-store'
import { runAllEmailSequenceJobs } from '@/lib/email-sequences/process'

function isAuthorizedCron(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET
  const auth = request.headers.get('authorization') || ''
  if (cronSecret && auth === `Bearer ${cronSecret}`) return true
  const vercelCron = request.headers.get('x-vercel-cron')
  if (process.env.NODE_ENV === 'production' && vercelCron) return true
  return false
}

async function run(request: Request) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const users = listUsers()
  const result = await runAllEmailSequenceJobs(users)
  return NextResponse.json({ ok: true, ...result, usersChecked: users.length })
}

/**
 * Daily cron: onboarding steps 1–4 and re-engagement win-back emails.
 * Vercel Cron invokes **GET**; manual runs can use POST with `Authorization: Bearer CRON_SECRET`.
 */
export async function GET(request: Request) {
  return run(request)
}

export async function POST(request: Request) {
  return run(request)
}

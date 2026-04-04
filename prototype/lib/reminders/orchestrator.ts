import { findUserById } from '@/lib/user-store'
import { buildUserSnapshotFromQuizAnswers, getSnapshotOneLiner } from '@/lib/user-snapshot'
import {
  addReminderNotification,
  bumpReminderSchedule,
  listDueReminderPreferences,
  type ReminderChannel,
  type ReminderPreferences,
} from '@/lib/db/reminders'
import { sendWebPushToUser } from '@/lib/push/web-push'

interface ReminderRunResult {
  processed: number
  deliveries: number
  failures: number
  details: Array<{ userId: string; channel: ReminderChannel; ok: boolean; message: string }>
}

function getNextBestActionForReminder(userId: string): {
  title: string
  message: string
  actionUrl: string
} {
  const user = findUserById(userId)
  const answers = user?.quizState?.quizAnswers as Record<string, unknown> | undefined
  const snapshot = buildUserSnapshotFromQuizAnswers(answers, { firstName: user?.firstName })
  const message = getSnapshotOneLiner(snapshot)
  const title = snapshot
    ? `Hey${user?.firstName ? ` ${user.firstName}` : ''} — your roadmap nudge`
    : 'Your next best home buying action'
  return {
    title,
    message,
    actionUrl: '/customized-journey',
  }
}

async function sendEmailReminder(
  userId: string,
  preference: ReminderPreferences
): Promise<{ ok: boolean; message: string }> {
  const user = findUserById(userId)
  if (!user?.email) return { ok: false, message: 'No user email found' }

  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM
  const action = getNextBestActionForReminder(userId)
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <h2>${action.title}</h2>
      <p>${action.message}</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL || ''}${action.actionUrl}">Open your action inbox</a></p>
      <p style="color:#64748b;font-size:12px;">Cadence: ${preference.cadence}. You can change reminder settings in your inbox.</p>
    </div>
  `

  if (apiKey && from) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: user.email,
        subject: 'NestQuest: your next best action',
        html,
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      return { ok: false, message: `Resend failed: ${body}` }
    }

    addReminderNotification({
      userId,
      channel: 'email',
      title: action.title,
      message: action.message,
      actionUrl: action.actionUrl,
      deliveredAt: new Date().toISOString(),
    })
    return { ok: true, message: 'Email sent via Resend' }
  }

  // Fallback: persist as delivered notification to keep orchestration functional in local/dev.
  addReminderNotification({
    userId,
    channel: 'email',
    title: action.title,
    message: action.message,
    actionUrl: action.actionUrl,
    deliveredAt: new Date().toISOString(),
  })
  return { ok: true, message: 'Email queued (dev fallback)' }
}

async function sendPushReminder(userId: string): Promise<{ ok: boolean; message: string }> {
  const action = getNextBestActionForReminder(userId)
  const pushResult = await sendWebPushToUser(userId, {
    title: action.title,
    body: action.message,
    url: action.actionUrl,
  })

  // Always persist in the in-app reminder feed as a fallback/audit trail.
  addReminderNotification({
    userId,
    channel: 'push',
    title: action.title,
    message: action.message,
    actionUrl: action.actionUrl,
    deliveredAt: new Date().toISOString(),
  })

  if (pushResult.delivered > 0) {
    return { ok: true, message: `Push delivered to ${pushResult.delivered} subscription(s)` }
  }
  if (pushResult.failed > 0) {
    return { ok: false, message: 'Push send failed; in-app fallback stored' }
  }
  return { ok: true, message: 'No active push subscriptions; in-app fallback stored' }
}

async function sendInAppReminder(userId: string): Promise<{ ok: boolean; message: string }> {
  const action = getNextBestActionForReminder(userId)
  addReminderNotification({
    userId,
    channel: 'in-app',
    title: action.title,
    message: action.message,
    actionUrl: action.actionUrl,
    deliveredAt: new Date().toISOString(),
  })
  return { ok: true, message: 'In-app reminder delivered' }
}

export async function runReminderOrchestration(now = new Date()): Promise<ReminderRunResult> {
  const due = listDueReminderPreferences(now)
  const result: ReminderRunResult = {
    processed: due.length,
    deliveries: 0,
    failures: 0,
    details: [],
  }

  for (const pref of due) {
    const channels = pref.channels.length > 0 ? pref.channels : (['in-app'] as ReminderChannel[])
    for (const channel of channels) {
      try {
        let delivery: { ok: boolean; message: string }
        if (channel === 'email') {
          delivery = await sendEmailReminder(pref.userId, pref)
        } else if (channel === 'push') {
          delivery = await sendPushReminder(pref.userId)
        } else {
          delivery = await sendInAppReminder(pref.userId)
        }

        result.details.push({
          userId: pref.userId,
          channel,
          ok: delivery.ok,
          message: delivery.message,
        })

        if (delivery.ok) result.deliveries++
        else {
          result.failures++
          addReminderNotification({
            userId: pref.userId,
            channel,
            title: 'Reminder delivery issue',
            message: delivery.message,
            actionUrl: '/inbox',
            error: delivery.message,
            status: 'failed',
          })
        }
      } catch (error) {
        result.failures++
        const message = error instanceof Error ? error.message : 'Unknown error'
        result.details.push({
          userId: pref.userId,
          channel,
          ok: false,
          message,
        })
        addReminderNotification({
          userId: pref.userId,
          channel,
          title: 'Reminder delivery issue',
          message,
          actionUrl: '/inbox',
          error: message,
          status: 'failed',
        })
      }
    }
    bumpReminderSchedule(pref.userId)
  }

  return result
}


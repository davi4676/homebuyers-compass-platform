/**
 * 3-email re-engagement when a user has been inactive for 7+ days (then 10d, 14d).
 */

import { appBaseUrl, sendTransactionalEmail } from '@/lib/email/send-transactional'

const subjects = [
  'We saved your place — ready when you are',
  'Your homebuying checklist is waiting',
  'One last nudge: your snapshot is still here',
]

function wrap(html: string) {
  return `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:0 auto;line-height:1.5;color:#1c1917">${html}<p style="color:#78716c;font-size:12px;margin-top:24px">We send occasional nudges when you’ve been away. <a href="${appBaseUrl()}/profile">Update email preferences</a>.</p></div>`
}

function bodyForStep(step: number, firstName?: string): string {
  const name = firstName?.trim() || 'there'
  const base = appBaseUrl()
  const paras: string[] = [`<p>Hi ${name},</p>`]
  if (step === 0) {
    paras.push(
      `<p>It’s been a little while since you were in NestQuest. Your roadmap and numbers are still saved — pick up where you left off in under a minute.</p>`
    )
  } else if (step === 1) {
    paras.push(
      `<p>Small progress still counts: review your <a href="${base}/results">results</a> or open <a href="${base}/customized-journey">My Journey</a> for the next checklist item.</p>`
    )
  } else {
    paras.push(
      `<p>If timing shifted, that’s normal. When you’re ready, we’re here — <a href="${base}/quiz">retake the quiz</a> if your situation changed.</p>`
    )
  }
  paras.push(
    `<p><a href="${base}/results" style="display:inline-block;margin-top:8px;padding:10px 18px;background:#0d9488;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Continue your plan</a></p>`
  )
  return wrap(paras.join(''))
}

export async function sendReengagementStep(
  to: string,
  step: number,
  firstName?: string
): Promise<{ ok: boolean; message: string }> {
  const subject = subjects[step] ?? 'NestQuest — we miss you'
  const html = bodyForStep(step, firstName)
  return sendTransactionalEmail({ to, subject, html })
}

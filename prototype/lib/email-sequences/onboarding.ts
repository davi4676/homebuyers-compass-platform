/**
 * 5-email onboarding sequence after quiz completion (days 0,1,3,5,7 from start).
 */

import { appBaseUrl, sendTransactionalEmail } from '@/lib/email/send-transactional'

export const ONBOARDING_STEP_DAYS = [0, 1, 3, 5, 7] as const

function wrap(html: string) {
  return `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:0 auto;line-height:1.5;color:#1c1917">${html}<p style="color:#78716c;font-size:12px;margin-top:24px">You're receiving this because you started NestQuest. <a href="${appBaseUrl()}/inbox">Manage notifications</a>.</p></div>`
}

const subjects = [
  'Your savings snapshot is ready',
  'Quick win: one thing to do today',
  'Your timeline — what happens next',
  'Resources picked for your situation',
  'Still here? Your next step is one click away',
]

function bodyForStep(step: number, firstName?: string): string {
  const name = firstName?.trim() || 'there'
  const base = appBaseUrl()
  const blocks: string[] = [
    `<p>Hi ${name},</p>`,
    `<p><a href="${base}/results" style="color:#0d9488;font-weight:600">Open your results</a> anytime — your numbers update as you refine your inputs.</p>`,
  ]
  if (step === 0) {
    blocks.push(
      `<p>Thanks for completing the assessment. Your personalized snapshot is the foundation for everything else — affordability, costs, and savings opportunities.</p>`
    )
  } else if (step === 1) {
    blocks.push(
      `<p><strong>Today:</strong> open your results and review one line in the cost breakdown you didn’t expect. That awareness alone saves buyers money at closing.</p>`
    )
  } else if (step === 2) {
    blocks.push(
      `<p>Buying takes months for most people. <a href="${base}/customized-journey">Your journey</a> breaks the process into phases so you always know the next step.</p>`
    )
  } else if (step === 3) {
    blocks.push(
      `<p>Browse <a href="${base}/resources">guides and checklists</a> matched to where you are — especially if you’re comparing loan types or down payment help.</p>`
    )
  } else {
    blocks.push(
      `<p>We’re here for the long arc. Reply to this email or open the app — even five minutes a week keeps momentum.</p>`
    )
  }
  return wrap(blocks.join(''))
}

export async function sendOnboardingStep(to: string, step: number, firstName?: string): Promise<{ ok: boolean; message: string }> {
  const subject = subjects[step] ?? `NestQuest — step ${step + 1}`
  const html = bodyForStep(step, firstName)
  return sendTransactionalEmail({ to, subject, html })
}

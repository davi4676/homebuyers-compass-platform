/**
 * Day-5 reminder during 7-day Momentum trial (cron-driven for signed-up users).
 */

import { appBaseUrl, sendTransactionalEmail } from '@/lib/email/send-transactional'
import { TIER_DEFINITIONS } from '@/lib/tiers'

function wrap(html: string) {
  const base = appBaseUrl()
  return `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:0 auto;line-height:1.5;color:#1c1917">${html}<p style="color:#78716c;font-size:12px;margin-top:24px">You're receiving this about your NestQuest Momentum trial. <a href="${base}/upgrade">View plans</a> · <a href="${base}/inbox">Notifications</a></p></div>`
}

const SUBJECT = "Your trial ends in 2 days — here's what you'll lose access to"

export async function sendMomentumTrialEndingEmail(
  to: string,
  firstName?: string
): Promise<{ ok: boolean; message: string }> {
  const name = firstName?.trim() || 'there'
  const base = appBaseUrl()
  const highlights = TIER_DEFINITIONS.momentum.journeyHighlights
  const listItems = highlights
    .slice(0, 8)
    .map((line) => `<li style="margin:6px 0">${line}</li>`)
    .join('')

  const html = wrap(`<p>Hi ${name},</p>
<p><strong>Your Momentum trial ends in 2 days.</strong> If you don&apos;t subscribe, your account moves back to Foundations on day 7 — no charge, no card on file.</p>
<p><strong>Here&apos;s what you&apos;ll lose access to:</strong></p>
<ul style="padding-left:20px;margin:12px 0">${listItems}</ul>
<p>Plus: personalized action plan depth, expanded savings opportunities, lender comparison tools, and premium refinance alerts — depending on what you&apos;ve been using.</p>
<p style="margin-top:20px"><a href="${base}/upgrade?tier=momentum" style="display:inline-block;background:#0d9488;color:#fff;font-weight:600;padding:12px 20px;border-radius:10px;text-decoration:none">Keep Momentum</a></p>
<p style="font-size:14px;color:#57534e">Questions? Reply to this email — we read every message.</p>`)

  return sendTransactionalEmail({ to, subject: SUBJECT, html })
}

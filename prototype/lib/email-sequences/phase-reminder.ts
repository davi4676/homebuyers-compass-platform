import { appBaseUrl, sendTransactionalEmail } from '@/lib/email/send-transactional'

function wrap(html: string) {
  return `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:0 auto;line-height:1.5;color:#1c1917">${html}<p style="color:#78716c;font-size:12px;margin-top:24px">You're receiving this because you set a NestQuest journey reminder. <a href="${appBaseUrl()}/inbox">View inbox</a>.</p></div>`
}

export async function sendPhaseReminderEmail(input: {
  to: string
  title: string
  message: string
  actionUrl: string
  firstName?: string
}): Promise<{ ok: boolean; message: string }> {
  const name = input.firstName?.trim() || 'there'
  const base = appBaseUrl()
  const href = input.actionUrl.startsWith('http') ? input.actionUrl : `${base}${input.actionUrl}`
  const html = wrap(`
    <p>Hi ${name},</p>
    <p>You asked us to remind you: <strong>${input.title}</strong></p>
    <p>${input.message}</p>
    <p><a href="${href}" style="display:inline-block;background:#0f766e;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">Continue your journey →</a></p>
    <p style="font-size:13px;color:#78716c">NestQuest is not a lender or real estate agent. For personalized advice, consult licensed professionals or a <a href="https://www.hud.gov/findhousingcounselors">HUD-approved counselor</a>.</p>
  `)
  return sendTransactionalEmail({
    to: input.to,
    subject: `NestQuest reminder: ${input.title}`,
    html,
  })
}

import { appBaseUrl, sendTransactionalEmail } from '@/lib/email/send-transactional'
import { getWeeklyLesson } from '@/lib/weekly-lessons'

function wrap(html: string) {
  return `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:0 auto;line-height:1.5;color:#1c1917">${html}<p style="color:#78716c;font-size:12px;margin-top:24px">You're receiving this because you opted in to NestQuest updates. <a href="${appBaseUrl()}/profile">Manage preferences</a>.</p></div>`
}

export async function sendWeeklyLessonEmail(
  to: string,
  firstName?: string
): Promise<{ ok: boolean; message: string }> {
  const lesson = getWeeklyLesson()
  const name = firstName?.trim() || 'there'
  const base = appBaseUrl()
  const html = wrap(`
    <p>Hi ${name},</p>
    <p><strong>Lesson of the week:</strong> ${lesson.title}</p>
    <p>${lesson.summary}</p>
    <p style="background:#f0fdfa;border-left:3px solid #0d9488;padding:12px 16px;border-radius:8px">${lesson.tip}</p>
    <p><a href="${base}${lesson.href}" style="color:#0d9488;font-weight:600">Read the guide →</a></p>
    <p style="font-size:13px;color:#78716c">NestQuest is educational guidance — not a lender or agent. <a href="${base}/resources#phase-methodology">How we calculate savings</a>.</p>
  `)
  return sendTransactionalEmail({
    to,
    subject: `NestQuest lesson: ${lesson.title}`,
    html,
  })
}

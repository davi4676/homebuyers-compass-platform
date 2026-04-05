/**
 * Thin Resend wrapper for transactional / lifecycle email.
 */

export async function sendTransactionalEmail(opts: {
  to: string
  subject: string
  html: string
}): Promise<{ ok: boolean; message: string }> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM
  if (!apiKey || !from) {
    return { ok: false, message: 'RESEND_API_KEY or RESEND_FROM not configured' }
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    return { ok: false, message: `Resend failed: ${body}` }
  }

  return { ok: true, message: 'sent' }
}

export function appBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || '').replace(/\/$/, '')
}

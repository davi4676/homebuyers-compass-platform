import { getSessionFromRequest } from '@/lib/auth-server'

function parseAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS || ''
  return raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}

export async function requireAdminSession(): Promise<
  | { ok: true; userId: string; email: string }
  | { ok: false; status: number; error: string }
> {
  const session = await getSessionFromRequest()
  if (!session) {
    return { ok: false, status: 401, error: 'Unauthorized' }
  }

  const admins = parseAdminEmails()
  if (admins.length > 0 && !admins.includes(session.email.toLowerCase())) {
    return { ok: false, status: 403, error: 'Forbidden' }
  }

  return { ok: true, userId: session.userId, email: session.email }
}

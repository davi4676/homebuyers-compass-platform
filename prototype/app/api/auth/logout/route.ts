import { NextResponse } from 'next/server'
import { getSessionCookieOpts } from '@/lib/auth-server'

export async function POST() {
  const opts = getSessionCookieOpts()
  const res = NextResponse.json({ ok: true })
  res.cookies.set(opts.name, '', {
    httpOnly: true,
    secure: opts.secure,
    sameSite: opts.sameSite,
    maxAge: 0,
    path: opts.path,
  })
  return res
}

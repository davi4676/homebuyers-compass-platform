import { NextResponse } from 'next/server'
import { verifyPassword, createSessionToken, getSessionCookieOpts } from '@/lib/auth-server'
import { findUserByEmail, updateLastLogin, toPublicUser } from '@/lib/user-store'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email?.trim() || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const user = findUserByEmail(email.trim())
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const valid = await verifyPassword(password, user.passwordHash)
    if (!valid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    updateLastLogin(user.id)
    const token = createSessionToken(user.id, user.email)
    const opts = getSessionCookieOpts()
    const res = NextResponse.json({ user: toPublicUser(user) })
    res.cookies.set(opts.name, token, {
      httpOnly: opts.httpOnly,
      secure: opts.secure,
      sameSite: opts.sameSite,
      maxAge: opts.maxAge,
      path: opts.path,
    })
    return res
  } catch (e) {
    console.error('Login error:', e)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}

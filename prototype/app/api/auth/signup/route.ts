import { NextResponse } from 'next/server'
import { hashPassword, createSessionToken, getSessionCookieOpts } from '@/lib/auth-server'
import {
  createUser,
  findUserByEmail,
  findUserByUsername,
  toPublicUser,
} from '@/lib/user-store'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, email, password, firstName, lastName, phone } = body

    if (!username?.trim() || !email?.trim() || !password) {
      return NextResponse.json(
        { error: 'Username, email, and password are required' },
        { status: 400 }
      )
    }
    if (username.trim().length < 2) {
      return NextResponse.json(
        { error: 'Username must be at least 2 characters' },
        { status: 400 }
      )
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    const existingEmail = findUserByEmail(email)
    if (existingEmail) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    const existingUsername = findUserByUsername(username.trim())
    if (existingUsername) {
      return NextResponse.json(
        { error: 'This username is already taken' },
        { status: 409 }
      )
    }

    const passwordHash = await hashPassword(password)
    const user = createUser({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      firstName: firstName?.trim(),
      lastName: lastName?.trim(),
      phone: phone?.trim(),
    })

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
    console.error('Signup error:', e)
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    )
  }
}

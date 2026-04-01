/**
 * Server-side auth helpers: password hashing and session cookie.
 * Use only in API routes or server code.
 */

import { cookies } from 'next/headers'
import crypto from 'crypto'

const SESSION_COOKIE = 'session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days
const SALT_LEN = 16
const KEY_LEN = 64
const SCRYPT_OPTS = { N: 16384, r: 8, p: 1 }

function getSecret(): string {
  const secret = process.env.SESSION_SECRET || process.env.AUTH_SECRET
  if (!secret) {
    console.warn('SESSION_SECRET or AUTH_SECRET not set; using dev default')
    return 'dev-secret-change-in-production'
  }
  return secret
}

export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(SALT_LEN).toString('hex')
    crypto.scrypt(password, salt, KEY_LEN, SCRYPT_OPTS, (err, derived) => {
      if (err) return reject(err)
      resolve(`${salt}:${derived.toString('hex')}`)
    })
  })
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const [salt, keyHex] = storedHash.split(':')
    if (!salt || !keyHex) return resolve(false)
    crypto.scrypt(password, salt, KEY_LEN, SCRYPT_OPTS, (err, derived) => {
      if (err) return reject(err)
      resolve(crypto.timingSafeEqual(Buffer.from(keyHex, 'hex'), derived))
    })
  })
}

export function createSessionToken(userId: string, email: string): string {
  const secret = getSecret()
  const payload = `${userId}:${email}:${Date.now() + SESSION_MAX_AGE * 1000}`
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex')
  return Buffer.from(`${payload}:${sig}`).toString('base64url')
}

export function verifySessionToken(token: string): { userId: string; email: string } | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8')
    const [userId, email, expStr, sig] = decoded.split(':')
    if (!userId || !email || !expStr || !sig) return null
    if (Date.now() > parseInt(expStr, 10)) return null
    const secret = getSecret()
    const payload = `${userId}:${email}:${expStr}`
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex')
    if (!crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))) return null
    return { userId, email }
  } catch {
    return null
  }
}

export async function getSessionFromRequest(): Promise<{ userId: string; email: string } | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE)
  if (!sessionCookie?.value) return null
  return verifySessionToken(sessionCookie.value)
}

export function getSessionCookieOpts() {
  return {
    name: SESSION_COOKIE,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: SESSION_MAX_AGE,
    path: '/',
  }
}

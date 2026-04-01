/**
 * Simple file-based user store for prototype.
 * In production, replace with a database.
 */

import fs from 'fs'
import path from 'path'
import type { User } from '@/lib/types/auth'

export type TransactionType = 'first-time' | 'repeat-buyer' | 'refinance'

export interface StoredUser {
  id: string
  username: string
  email: string
  passwordHash: string
  firstName?: string
  lastName?: string
  phone?: string
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
  emailVerified: boolean
  quizState?: {
    transactionType: TransactionType
    quizAnswers: Record<string, unknown>
  }
  // rest of User fields we might need for API response (no password)
  subscriptionTier: string
  subscriptionStatus: string
  country: string
  marketingEmailsOptIn: boolean
  timezone: string
  dataSharingConsent: boolean
  termsAcceptedAt?: string
  privacyPolicyAcceptedAt?: string
}

const DATA_DIR = path.join(process.cwd(), '.data')
const USERS_FILE = path.join(DATA_DIR, 'users.json')

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

function readUsers(): StoredUser[] {
  ensureDataDir()
  if (!fs.existsSync(USERS_FILE)) return []
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf8')
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function writeUsers(users: StoredUser[]) {
  ensureDataDir()
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8')
}

export function findUserByEmail(email: string): StoredUser | undefined {
  const users = readUsers()
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase())
}

export function findUserByUsername(username: string): StoredUser | undefined {
  const users = readUsers()
  return users.find((u) => u.username.toLowerCase() === username.toLowerCase())
}

export function findUserById(id: string): StoredUser | undefined {
  const users = readUsers()
  return users.find((u) => u.id === id)
}

export function createUser(data: {
  username: string
  email: string
  passwordHash: string
  firstName?: string
  lastName?: string
  phone?: string
}): StoredUser {
  const users = readUsers()
  const id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
  const now = new Date().toISOString()
  const user: StoredUser = {
    id,
    username: data.username.trim(),
    email: data.email.trim().toLowerCase(),
    passwordHash: data.passwordHash,
    firstName: data.firstName?.trim(),
    lastName: data.lastName?.trim(),
    phone: data.phone?.trim(),
    createdAt: now,
    updatedAt: now,
    emailVerified: false,
    subscriptionTier: 'foundations',
    subscriptionStatus: 'active',
    country: 'US',
    marketingEmailsOptIn: true,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    dataSharingConsent: true,
  }
  users.push(user)
  writeUsers(users)
  return user
}

export function updateUser(id: string, updates: Partial<StoredUser>) {
  const users = readUsers()
  const idx = users.findIndex((u) => u.id === id)
  if (idx === -1) return
  users[idx] = { ...users[idx], ...updates, updatedAt: new Date().toISOString() }
  writeUsers(users)
}

export function updateLastLogin(id: string) {
  updateUser(id, { lastLoginAt: new Date().toISOString() })
}

export function setUserQuizState(
  id: string,
  transactionType: TransactionType,
  quizAnswers: Record<string, unknown>
) {
  const users = readUsers()
  const idx = users.findIndex((u) => u.id === id)
  if (idx === -1) return
  users[idx].quizState = { transactionType, quizAnswers }
  users[idx].updatedAt = new Date().toISOString()
  writeUsers(users)
}

export function getUserQuizState(id: string): { transactionType: TransactionType; quizAnswers: Record<string, unknown> } | null {
  const user = findUserById(id)
  if (!user?.quizState) return null
  return user.quizState
}

/** Strip sensitive fields for API response */
export function toPublicUser(u: StoredUser): User {
  return {
    id: u.id,
    username: u.username,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    phone: u.phone,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
    lastLoginAt: u.lastLoginAt,
    emailVerified: u.emailVerified,
    phoneVerified: false,
    onboardingCompleted: false,
    profileCompletionPercent: 25,
    subscriptionTier: u.subscriptionTier as User['subscriptionTier'],
    subscriptionStatus: u.subscriptionStatus as User['subscriptionStatus'],
    hasCoBorrower: false,
    country: u.country,
    marketingEmailsOptIn: u.marketingEmailsOptIn,
    smsOptIn: false,
    timezone: u.timezone,
    dataSharingConsent: u.dataSharingConsent,
    termsAcceptedAt: u.termsAcceptedAt,
    privacyPolicyAcceptedAt: u.privacyPolicyAcceptedAt,
  }
}

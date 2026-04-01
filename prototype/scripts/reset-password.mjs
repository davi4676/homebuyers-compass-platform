/**
 * One-off script: set a new password for a user by email.
 * Uses same hashing as lib/auth-server (scrypt).
 * Run from prototype dir: node scripts/reset-password.mjs <email> <newPassword>
 */

import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, '..', '.data')
const USERS_FILE = path.join(DATA_DIR, 'users.json')

const SALT_LEN = 16
const KEY_LEN = 64
const SCRYPT_OPTS = { N: 16384, r: 8, p: 1 }

function hashPassword(password) {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(SALT_LEN).toString('hex')
    crypto.scrypt(password, salt, KEY_LEN, SCRYPT_OPTS, (err, derived) => {
      if (err) return reject(err)
      resolve(`${salt}:${derived.toString('hex')}`)
    })
  })
}

async function main() {
  const email = process.argv[2]
  const newPassword = process.argv[3]

  if (!email || !newPassword) {
    console.error('Usage: node scripts/reset-password.mjs <email> <newPassword>')
    process.exit(1)
  }

  if (!fs.existsSync(USERS_FILE)) {
    console.error('Users file not found:', USERS_FILE)
    process.exit(1)
  }

  const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'))
  const normalized = email.trim().toLowerCase()
  const idx = users.findIndex((u) => u.email.toLowerCase() === normalized)

  if (idx === -1) {
    console.error('User not found for email:', email)
    process.exit(1)
  }

  const passwordHash = await hashPassword(newPassword)
  users[idx].passwordHash = passwordHash
  users[idx].updatedAt = new Date().toISOString()
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8')

  console.log('Password updated for', users[idx].email)
  console.log('They can sign in with the new password.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

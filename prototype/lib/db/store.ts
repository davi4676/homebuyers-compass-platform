import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), '.data')

export function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

export function readJsonFile<T>(filename: string, fallback: T): T {
  ensureDataDir()
  const filepath = path.join(DATA_DIR, filename)
  if (!fs.existsSync(filepath)) return fallback
  try {
    const raw = fs.readFileSync(filepath, 'utf8')
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeJsonFile(filename: string, data: unknown): void {
  ensureDataDir()
  const filepath = path.join(DATA_DIR, filename)
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8')
}

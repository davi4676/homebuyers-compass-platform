import { readJsonFile, writeJsonFile } from '@/lib/db/store'

export type StoredPhaseReminder = {
  id: string
  email: string
  phaseOrder: number
  title: string
  message: string
  actionUrl: string
  dueAt: string
  createdAt: string
  sent?: boolean
  dismissed?: boolean
}

const FILE = 'phase-reminders.json'

function readAll(): StoredPhaseReminder[] {
  return readJsonFile<StoredPhaseReminder[]>(FILE, [])
}

function writeAll(items: StoredPhaseReminder[]) {
  writeJsonFile(FILE, items)
}

export function upsertPhaseReminder(reminder: StoredPhaseReminder): StoredPhaseReminder {
  const all = readAll().filter(
    (r) => !(r.email === reminder.email && r.phaseOrder === reminder.phaseOrder && !r.dismissed && !r.sent)
  )
  all.push(reminder)
  writeAll(all)
  return reminder
}

export function listDuePhaseReminders(now = Date.now()): StoredPhaseReminder[] {
  return readAll().filter((r) => {
    if (r.dismissed || r.sent) return false
    return new Date(r.dueAt).getTime() <= now
  })
}

export function markPhaseReminderSent(id: string): void {
  const all = readAll()
  const idx = all.findIndex((r) => r.id === id)
  if (idx === -1) return
  all[idx] = { ...all[idx], sent: true }
  writeAll(all)
}

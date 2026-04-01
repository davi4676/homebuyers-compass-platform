/**
 * User progress (gamification: XP, level, streak, badges) per user.
 */

import type { UserProgress } from '@/lib/gamification'
import { initializeProgress } from '@/lib/gamification'
import { readJsonFile, writeJsonFile } from './store'

const FILE = 'progress.json'

type ProgressMap = Record<string, UserProgress>

function readProgressMap(): ProgressMap {
  return readJsonFile<ProgressMap>(FILE, {})
}

export function getProgress(userId: string, tier: UserProgress['tier'] = 'foundations'): UserProgress {
  const map = readProgressMap()
  const existing = map[userId]
  if (existing) return existing
  const progress = initializeProgress(userId, tier)
  map[userId] = progress
  writeJsonFile(FILE, map)
  return progress
}

export function saveProgress(userId: string, progress: UserProgress): void {
  const map = readProgressMap()
  map[userId] = { ...progress, userId }
  writeJsonFile(FILE, map)
}

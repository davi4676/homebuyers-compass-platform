/**
 * Productivity / activity events per user (for buildout tracker).
 */

import { readJsonFile, writeJsonFile } from './store'

export type ActivityActionId =
  | 'quiz_completed'
  | 'results_viewed'
  | 'journey_step_completed'
  | 'tool_used'
  | 'down_payment_calculator'
  | 'refinance_calculator'
  | 'affordability_viewed'
  | 'profile_updated'
  | 'first_login'

export interface ActivityEvent {
  id: string
  userId: string
  actionId: ActivityActionId
  timestamp: string
  metadata?: Record<string, unknown>
}

type ActivityMap = Record<string, ActivityEvent[]>

const FILE = 'activity.json'
const MAX_EVENTS_PER_USER = 500

function readActivityMap(): ActivityMap {
  return readJsonFile<ActivityMap>(FILE, {})
}

export function addActivity(userId: string, actionId: ActivityActionId, metadata?: Record<string, unknown>): ActivityEvent {
  const map = readActivityMap()
  const list = map[userId] || []
  const event: ActivityEvent = {
    id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    userId,
    actionId,
    timestamp: new Date().toISOString(),
    metadata,
  }
  list.push(event)
  if (list.length > MAX_EVENTS_PER_USER) {
    list.splice(0, list.length - MAX_EVENTS_PER_USER)
  }
  map[userId] = list
  writeJsonFile(FILE, map)
  return event
}

export function getActivity(userId: string, limit = 50): ActivityEvent[] {
  const map = readActivityMap()
  const list = map[userId] || []
  return list.slice(-limit).reverse()
}

export function getProductivitySummary(userId: string): {
  totalEvents: number
  quizCompleted: number
  resultsViewed: number
  journeyStepsCompleted: number
  toolsUsed: number
  lastActiveAt: string | null
  eventsThisWeek: number
} {
  const map = readActivityMap()
  const list = map[userId] || []
  const now = Date.now()
  const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000

  let quizCompleted = 0
  let resultsViewed = 0
  let journeyStepsCompleted = 0
  let toolsUsed = 0
  let lastActiveAt: string | null = null
  let eventsThisWeek = 0

  for (const e of list) {
    if (new Date(e.timestamp).getTime() >= oneWeekAgo) eventsThisWeek++
    if (e.timestamp > (lastActiveAt || '')) lastActiveAt = e.timestamp
    switch (e.actionId) {
      case 'quiz_completed':
        quizCompleted++
        break
      case 'results_viewed':
        resultsViewed++
        break
      case 'journey_step_completed':
        journeyStepsCompleted++
        break
      case 'tool_used':
      case 'down_payment_calculator':
      case 'refinance_calculator':
      case 'affordability_viewed':
        toolsUsed++
        break
      default:
        break
    }
  }

  return {
    totalEvents: list.length,
    quizCompleted,
    resultsViewed,
    journeyStepsCompleted,
    toolsUsed,
    lastActiveAt,
    eventsThisWeek,
  }
}

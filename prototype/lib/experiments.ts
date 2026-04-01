import crypto from 'crypto'
import { readJsonFile, writeJsonFile } from '@/lib/db/store'

export type ExperimentVariant = 'control' | 'treatment'

export interface ExperimentDefinition {
  key: string
  rolloutPercent: number
  sticky: boolean
  enabled: boolean
}

export interface ExperimentAssignment {
  experimentKey: string
  subjectKey: string
  variant: ExperimentVariant
  assignedAt: string
}

const DEFINITIONS: Record<string, ExperimentDefinition> = {
  auth_gate_v2: { key: 'auth_gate_v2', rolloutPercent: 100, sticky: true, enabled: true },
  results_layout_v2: { key: 'results_layout_v2', rolloutPercent: 100, sticky: true, enabled: true },
  roadmap_today_view_v2: { key: 'roadmap_today_view_v2', rolloutPercent: 100, sticky: true, enabled: true },
}

const ASSIGNMENTS_FILE = 'experiment-assignments.json'
const EVENTS_FILE = 'experiment-events.json'

type AssignmentMap = Record<string, ExperimentAssignment>

function assignmentId(experimentKey: string, subjectKey: string): string {
  return `${experimentKey}:${subjectKey}`
}

function hashToPercent(input: string): number {
  const hash = crypto.createHash('sha256').update(input).digest('hex')
  const slice = hash.slice(0, 8)
  const int = Number.parseInt(slice, 16)
  return int % 100
}

function readAssignments(): AssignmentMap {
  return readJsonFile<AssignmentMap>(ASSIGNMENTS_FILE, {})
}

function writeAssignments(map: AssignmentMap): void {
  writeJsonFile(ASSIGNMENTS_FILE, map)
}

export function getExperimentDefinition(key: string): ExperimentDefinition | null {
  return DEFINITIONS[key] || null
}

export function assignExperiment(
  experimentKey: string,
  subjectKey: string
): ExperimentAssignment {
  const def = getExperimentDefinition(experimentKey)
  if (!def || !def.enabled) {
    return {
      experimentKey,
      subjectKey,
      variant: 'control',
      assignedAt: new Date().toISOString(),
    }
  }

  const map = readAssignments()
  const id = assignmentId(experimentKey, subjectKey)
  const existing = map[id]
  if (existing && def.sticky) return existing

  const bucket = hashToPercent(id)
  const variant: ExperimentVariant = bucket < def.rolloutPercent ? 'treatment' : 'control'
  const assignment: ExperimentAssignment = {
    experimentKey,
    subjectKey,
    variant,
    assignedAt: new Date().toISOString(),
  }
  map[id] = assignment
  writeAssignments(map)
  return assignment
}

export function trackExperimentEvent(input: {
  experimentKey: string
  subjectKey: string
  variant: ExperimentVariant
  eventName: string
  metadata?: Record<string, unknown>
}) {
  const events = readJsonFile<Array<Record<string, unknown>>>(EVENTS_FILE, [])
  events.push({
    id: `exp_evt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    ...input,
    createdAt: new Date().toISOString(),
  })
  if (events.length > 50000) {
    events.splice(0, events.length - 50000)
  }
  writeJsonFile(EVENTS_FILE, events)
}

export function getExperimentEventStats() {
  const events = readJsonFile<Array<Record<string, unknown>>>(EVENTS_FILE, [])
  const totalEvents = events.length
  const now = Date.now()
  const oneDay = 24 * 60 * 60 * 1000
  const events24h = events.filter((e) => {
    const createdAt = typeof e.createdAt === 'string' ? new Date(e.createdAt).getTime() : 0
    return now - createdAt <= oneDay
  }).length

  const byExperiment = events.reduce<Record<string, number>>((acc, e) => {
    const key = typeof e.experimentKey === 'string' ? e.experimentKey : 'unknown'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  const byEventName = events.reduce<Record<string, number>>((acc, e) => {
    const key = typeof e.eventName === 'string' ? e.eventName : 'unknown'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  const lastEventAt =
    totalEvents > 0 && typeof events[totalEvents - 1]?.createdAt === 'string'
      ? (events[totalEvents - 1].createdAt as string)
      : null

  return {
    totalEvents,
    events24h,
    byExperiment,
    byEventName,
    lastEventAt,
  }
}


/**
 * Architecture-safe integration readiness map.
 * No live partner calls here; this is metadata for product framing and planning.
 */

export type IntegrationDomain =
  | 'rates'
  | 'property_values'
  | 'credit_signals'
  | 'alerts'
  | 'partner_programs'

export type IntegrationStage = 'mock' | 'adapter-ready' | 'production'

export type IntegrationReadinessItem = {
  domain: IntegrationDomain
  label: string
  stage: IntegrationStage
  notes: string
}

export const INTEGRATION_READINESS_ITEMS: ReadonlyArray<IntegrationReadinessItem> = [
  {
    domain: 'rates',
    label: 'Rate snapshots',
    stage: 'production',
    notes: 'Freddie Mac rate snapshots are wired and reused across refinance/move-up tools.',
  },
  {
    domain: 'property_values',
    label: 'Property value context',
    stage: 'adapter-ready',
    notes: 'Value fields are scaffolded in journey flows; provider adapters can be attached safely.',
  },
  {
    domain: 'credit_signals',
    label: 'Credit signal intake',
    stage: 'adapter-ready',
    notes: 'Credit bands are used in modeling today; hard pulls and bureau connectors are not wired.',
  },
  {
    domain: 'alerts',
    label: 'Reminder and alert routing',
    stage: 'adapter-ready',
    notes: 'Reminder hook/API scaffolding exists; delivery channels can be expanded behind the same boundary.',
  },
  {
    domain: 'partner_programs',
    label: 'Program and partner ingestion',
    stage: 'mock',
    notes: 'Program matching is currently modeled + curated; no live partner ingestion is assumed.',
  },
]

export function getIntegrationStageLabel(stage: IntegrationStage): string {
  if (stage === 'production') return 'Production'
  if (stage === 'adapter-ready') return 'Adapter-ready'
  return 'Mock/scaffolded'
}

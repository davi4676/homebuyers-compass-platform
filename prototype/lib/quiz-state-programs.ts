/** Illustrative programs for guided quiz results — aligned with Assistance tab samples. */

export type SampleProgram = { name: string; max: number }

const TX_PROGRAMS: SampleProgram[] = [
  { name: 'Texas Homebuyer Program', max: 17500 },
  { name: 'City of Austin TDHCA', max: 14000 },
  { name: 'SETH Gold Grant', max: 12000 },
  { name: 'Homes for Texas Heroes', max: 15000 },
  { name: 'My First Texas Home', max: 5000 },
]

const DEFAULT_PROGRAMS: SampleProgram[] = [
  { name: 'State Housing Finance Agency (HFA)', max: 15000 },
  { name: 'Local First-Time Buyer Grant', max: 10000 },
  { name: 'Community Seconds / Silent Second', max: 25000 },
  { name: 'Workforce Housing Initiative', max: 8000 },
  { name: 'Down Payment Assistance (DPA) Pool', max: 12000 },
]

const BY_CODE: Record<string, SampleProgram[]> = {
  TX: TX_PROGRAMS,
  CA: DEFAULT_PROGRAMS,
  NY: DEFAULT_PROGRAMS,
  FL: DEFAULT_PROGRAMS,
}

export function getSampleProgramsForState(stateCode: string): SampleProgram[] {
  const c = stateCode.trim().toUpperCase()
  return BY_CODE[c] ?? DEFAULT_PROGRAMS
}

export function getSampleProgramSummary(stateCode: string): {
  count: number
  topTwo: SampleProgram[]
  maxAmount: number
} {
  const list = getSampleProgramsForState(stateCode)
  const maxAmount = Math.max(...list.map((p) => p.max), 0)
  return { count: list.length, topTwo: list.slice(0, 2), maxAmount }
}

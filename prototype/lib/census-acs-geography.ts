import { CENSUS_ACS5_GEOGRAPHY } from '@/lib/census-geography-table'

/**
 * Geography specs for ACS 5-year `for` / `in` query parameters, tied to {@link CENSUS_ACS5_GEOGRAPHY}.
 */
export type Acs5Geography =
  | { kind: 'zcta'; zcta5: string }
  | { kind: 'county'; stateFips: string; countyFips: string }
  | { kind: 'place'; stateFips: string; placeFips: string }

export interface Acs5ForInParams {
  /** `for=` value only (without leading `for=`) */
  forValue: string
  /** `in=` value when required (without leading `in=`) */
  inValue?: string
  label: string
  kind: Acs5Geography['kind']
}

const ZCTA_RE = /^\d{5}$/
const FIPS2 = /^\d{2}$/
const FIPS3 = /^\d{3}$/
const FIPS5 = /^\d{5}$/

/** Validate and normalize 5-digit ZCTA (commonly entered as ZIP). */
export function normalizeZcta5(input: string): string | null {
  const d = String(input).trim()
  if (!ZCTA_RE.test(d)) return null
  return d
}

/** Build ACS `for` / `in` clauses for B25143 and other detailed tables. */
export function acs5GeographyToForIn(g: Acs5Geography): Acs5ForInParams {
  const zctaKey = CENSUS_ACS5_GEOGRAPHY.zcta.acsForKey
  const countyKey = CENSUS_ACS5_GEOGRAPHY.county.acsForKey
  const placeKey = CENSUS_ACS5_GEOGRAPHY.place.acsForKey

  switch (g.kind) {
    case 'zcta': {
      const z = normalizeZcta5(g.zcta5)
      if (!z) throw new Error('Invalid ZCTA: expected 5 digits')
      return {
        kind: 'zcta',
        label: `${zctaKey} ${z}`,
        forValue: `${zctaKey}:${z}`,
      }
    }
    case 'county': {
      if (!FIPS2.test(g.stateFips) || !FIPS3.test(g.countyFips)) {
        throw new Error('Invalid county FIPS: state 2 digits, county 3 digits')
      }
      return {
        kind: 'county',
        label: `state ${g.stateFips} county ${g.countyFips}`,
        forValue: `${countyKey}:${g.countyFips}`,
        inValue: `state:${g.stateFips}`,
      }
    }
    case 'place': {
      if (!FIPS2.test(g.stateFips) || !FIPS5.test(g.placeFips)) {
        throw new Error('Invalid place FIPS: state 2 digits, place 5 digits')
      }
      return {
        kind: 'place',
        label: `state ${g.stateFips} place ${g.placeFips}`,
        forValue: `${placeKey}:${g.placeFips}`,
        inValue: `state:${g.stateFips}`,
      }
    }
    default: {
      const _exhaustive: never = g
      return _exhaustive
    }
  }
}

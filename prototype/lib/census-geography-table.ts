/**
 * Census ACS 5-year summary levels used when requesting table B25143 (and other detailed tables).
 * See: https://api.census.gov/data/2023/acs/acs5/geography.html
 */

export const CENSUS_ACS5_GEOGRAPHY = {
  /** ZCTA5 — use 5-digit ZCTA code (often aligned with ZIP, not identical). */
  zcta: {
    summaryLevel: '860',
    acsForKey: 'zip code tabulation area',
    description: 'ZIP Code Tabulation Area (ZCTA5)',
  },
  /** State–county (FIPS). */
  county: {
    summaryLevel: '050',
    acsForKey: 'county',
    description: 'County (within state)',
  },
  /** Incorporated place / census place. */
  place: {
    summaryLevel: '160',
    acsForKey: 'place',
    description: 'Place (incorporated city, town, etc.)',
  },
} as const

export type CensusAcs5GeographyKind = keyof typeof CENSUS_ACS5_GEOGRAPHY

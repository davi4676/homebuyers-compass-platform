import { getZipCodeData } from '@/lib/calculations'
import type { IcpType } from '@/lib/icp-types'

const STATE_ABBR_TO_NAME: Record<string, string> = {
  AL: 'Alabama',
  AK: 'Alaska',
  AZ: 'Arizona',
  AR: 'Arkansas',
  CA: 'California',
  CO: 'Colorado',
  CT: 'Connecticut',
  DE: 'Delaware',
  DC: 'Washington, D.C.',
  FL: 'Florida',
  GA: 'Georgia',
  HI: 'Hawaii',
  ID: 'Idaho',
  IL: 'Illinois',
  IN: 'Indiana',
  IA: 'Iowa',
  KS: 'Kansas',
  KY: 'Kentucky',
  LA: 'Louisiana',
  ME: 'Maine',
  MD: 'Maryland',
  MA: 'Massachusetts',
  MI: 'Michigan',
  MN: 'Minnesota',
  MS: 'Mississippi',
  MO: 'Missouri',
  MT: 'Montana',
  NE: 'Nebraska',
  NV: 'Nevada',
  NH: 'New Hampshire',
  NJ: 'New Jersey',
  NM: 'New Mexico',
  NY: 'New York',
  NC: 'North Carolina',
  ND: 'North Dakota',
  OH: 'Ohio',
  OK: 'Oklahoma',
  OR: 'Oregon',
  PA: 'Pennsylvania',
  RI: 'Rhode Island',
  SC: 'South Carolina',
  SD: 'South Dakota',
  TN: 'Tennessee',
  TX: 'Texas',
  UT: 'Utah',
  VT: 'Vermont',
  VA: 'Virginia',
  WA: 'Washington',
  WV: 'West Virginia',
  WI: 'Wisconsin',
  WY: 'Wyoming',
}

/** Best-effort metro → state for quiz city dropdown (extends `CITY_DATA` in calculations). */
const METRO_TO_STATE_NAME: Record<string, string> = {
  Austin: 'Texas',
  Boston: 'Massachusetts',
  Charlotte: 'North Carolina',
  Chicago: 'Illinois',
  Columbus: 'Ohio',
  Dallas: 'Texas',
  Denver: 'Colorado',
  Houston: 'Texas',
  Indianapolis: 'Indiana',
  Jacksonville: 'Florida',
  'Kansas City': 'Missouri',
  'Las Vegas': 'Nevada',
  'Los Angeles': 'California',
  Memphis: 'Tennessee',
  Miami: 'Florida',
  Milwaukee: 'Wisconsin',
  Minneapolis: 'Minnesota',
  Nashville: 'Tennessee',
  'New York': 'New York',
  'Oklahoma City': 'Oklahoma',
  Orlando: 'Florida',
  Philadelphia: 'Pennsylvania',
  Phoenix: 'Arizona',
  Portland: 'Oregon',
  Raleigh: 'North Carolina',
  Sacramento: 'California',
  'San Antonio': 'Texas',
  'San Diego': 'California',
  'San Francisco': 'California',
  'San Jose': 'California',
  Seattle: 'Washington',
  Tampa: 'Florida',
  'Washington DC': 'Washington, D.C.',
}

export function getQuizStateDisplayName(params: {
  locationType: 'metro' | 'zip'
  city: string
  zipCode: string
}): string | null {
  const zip = params.zipCode?.trim() ?? ''
  if (params.locationType === 'zip' && /^\d{5}$/.test(zip)) {
    const z = getZipCodeData(zip)
    if (z?.state) {
      const u = z.state.toUpperCase()
      return STATE_ABBR_TO_NAME[u] ?? z.state
    }
  }
  const city = params.city?.trim()
  if (city && METRO_TO_STATE_NAME[city]) return METRO_TO_STATE_NAME[city]
  return null
}

export function getPersonalizedQuizHeadline(icp: IcpType, stateDisplay: string | null): string {
  const statePhrase = stateDisplay ?? 'your area'
  switch (icp) {
    case 'first-time':
      return `Here's what we found for you as a first-time buyer in ${statePhrase}:`
    case 'first-gen':
      return "As the first in your family to buy, here's what you qualify for:"
    case 'solo':
      return "Buying solo? Here's your advantage:"
    case 'move-up':
      return "As a move-up buyer, here's your opportunity:"
    case 'repeat-buyer':
      return "Welcome back — here's what's new for repeat buyers:"
    case 'refinance':
      return "Here's your refinance opportunity:"
    default:
      return `Here's what we found for you as a first-time buyer in ${statePhrase}:`
  }
}

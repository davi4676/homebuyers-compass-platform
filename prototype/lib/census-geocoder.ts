/**
 * Census Geocoder — resolve coordinates to official state / county / place FIPS
 * (ties ACS pulls to Census geography IDs).
 * https://geocoding.geo.census.gov/geocoder/Geocoding_Services_API.html
 */

export type GeocoderCountyPlace = {
  stateFips: string
  countyFips: string
  placeFips: string | null
  countyName: string | null
  placeName: string | null
}

type GeographiesResponse = {
  result?: {
    geographies?: {
      Counties?: Array<{ STATE: string; COUNTY: string; NAME?: string }>
      'Incorporated Places'?: Array<{ STATE: string; PLACE: string; NAME?: string }>
    }
  }
}

/**
 * Reverse-geocode lon/lat to county + (optional) place using Census2020_Current vintage.
 */
export async function geocodeLonLatToCountyPlace(
  longitude: number,
  latitude: number
): Promise<GeocoderCountyPlace | null> {
  const url =
    `https://geocoding.geo.census.gov/geocoder/geographies/coordinates` +
    `?x=${encodeURIComponent(String(longitude))}` +
    `&y=${encodeURIComponent(String(latitude))}` +
    `&benchmark=Public_AR_Current` +
    `&vintage=Census2020_Current` +
    `&format=json`

  const res = await fetch(url, { next: { revalidate: 86400 } })
  if (!res.ok) return null

  const data = (await res.json()) as GeographiesResponse
  const counties = data.result?.geographies?.Counties
  const places = data.result?.geographies?.['Incorporated Places']
  const c0 = counties?.[0]
  if (!c0?.STATE || !c0.COUNTY) return null

  const p0 = places?.[0]
  return {
    stateFips: String(c0.STATE).padStart(2, '0'),
    countyFips: String(c0.COUNTY).padStart(3, '0'),
    placeFips: p0?.PLACE != null ? String(p0.PLACE).padStart(5, '0') : null,
    countyName: c0.NAME ?? null,
    placeName: p0?.NAME ?? null,
  }
}

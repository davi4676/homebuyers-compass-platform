import { geocodeLonLatToCountyPlace } from '@/lib/census-geocoder'

export type ZipToCountyResult = {
  zip: string
  stateFips: string
  countyFips: string
  countyName: string | null
}

/**
 * Resolve a U.S. ZIP code to Census county FIPS using approximate coordinates
 * (Zippopotam USPS centroid) + Census geocoder `geographies/coordinates`.
 * ZIP boundaries do not align with counties; the reported county is for the centroid.
 */
export async function resolveUsZipToCountyFips(zipRaw: string): Promise<ZipToCountyResult | null> {
  const zip = String(zipRaw).trim()
  if (!/^\d{5}$/.test(zip)) return null

  const res = await fetch(`https://api.zippopotam.us/us/${zip}`, {
    next: { revalidate: 86_400 },
  })
  if (!res.ok) return null

  const data = (await res.json()) as {
    places?: Array<{ latitude?: string; longitude?: string }>
  }
  const place = data.places?.[0]
  if (!place?.latitude || !place?.longitude) return null

  const lat = Number(place.latitude)
  const lon = Number(place.longitude)
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null

  const g = await geocodeLonLatToCountyPlace(lon, lat)
  if (!g) return null

  return {
    zip,
    stateFips: g.stateFips,
    countyFips: g.countyFips,
    countyName: g.countyName,
  }
}

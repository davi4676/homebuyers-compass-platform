import { NextResponse } from 'next/server'

/**
 * Forward geocoding via OpenStreetMap Nominatim (demo / prototype).
 * Respect usage policy: low volume, identifiable User-Agent.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()
  if (!q) {
    return NextResponse.json({ error: 'missing_q' }, { status: 400 })
  }

  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('q', q)
  url.searchParams.set('format', 'json')
  url.searchParams.set('limit', '1')

  const res = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'NestQuestPrototype/1.0 (https://github.com/nestquest)',
    },
    next: { revalidate: 0 },
  })

  if (!res.ok) {
    return NextResponse.json({ error: 'geocode_failed', status: res.status }, { status: 502 })
  }

  const data = (await res.json()) as { lat?: string; lon?: string; display_name?: string }[]
  const hit = data[0]
  if (!hit?.lat || !hit?.lon) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  return NextResponse.json({
    lat: parseFloat(hit.lat),
    lon: parseFloat(hit.lon),
    displayName: hit.display_name ?? q,
  })
}

import { NextResponse } from 'next/server'

/**
 * Walk Score API proxy — keeps wsapikey server-side.
 * https://www.walkscore.com/professional/api.php
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')
  const address = searchParams.get('address') ?? ''

  if (!lat || !lon) {
    return NextResponse.json({ error: 'missing_coords' }, { status: 400 })
  }

  const key = process.env.WALK_SCORE_API_KEY
  if (!key) {
    return NextResponse.json({
      mock: true,
      message: 'Connect your Walk Score API key to see live scores.',
      walkscore: null,
      transit: null,
      bike: null,
    })
  }

  const url = new URL('https://api.walkscore.com/score')
  url.searchParams.set('format', 'json')
  url.searchParams.set('address', address)
  url.searchParams.set('lat', lat)
  url.searchParams.set('lon', lon)
  url.searchParams.set('transit', '1')
  url.searchParams.set('bike', '1')
  url.searchParams.set('wsapikey', key)

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } })
  const json = (await res.json().catch(() => null)) as Record<string, unknown> | null

  if (!res.ok || !json) {
    return NextResponse.json(
      { error: 'walkscore_failed', mock: true, walkscore: null, transit: null, bike: null },
      { status: 200 }
    )
  }

  // Walk Score uses status 1 = success; 0 = error in body
  if (json.status === 0) {
    return NextResponse.json(
      { error: 'walkscore_rejected', mock: true, walkscore: null, transit: null, bike: null },
      { status: 200 }
    )
  }

  const transitRaw = json.transit as { score?: number } | number | undefined
  const transitScore =
    typeof transitRaw === 'object' && transitRaw?.score != null
      ? transitRaw.score
      : typeof transitRaw === 'number'
        ? transitRaw
        : null
  const bikeRaw = json.bike as { score?: number } | number | undefined
  const bikeScore =
    typeof bikeRaw === 'object' && bikeRaw?.score != null ? bikeRaw.score : typeof bikeRaw === 'number' ? bikeRaw : null

  return NextResponse.json({
    mock: false,
    walkscore: typeof json.walkscore === 'number' ? json.walkscore : null,
    transit: transitScore,
    bike: bikeScore,
    description: json.description,
    ws_link: json.ws_link,
  })
}

import { NextResponse } from 'next/server'

type FreddieSeries = {
  date: string
  rateDecimal: number
}

async function fetchLatestFredSeries(seriesId: 'MORTGAGE30US' | 'MORTGAGE15US'): Promise<FreddieSeries> {
  const url = `https://fred.stlouisfed.org/graph/fredgraph.csv?id=${seriesId}`
  const response = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'text/csv' },
    // Always attempt to read the latest published point.
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch ${seriesId}: ${response.status}`)
  }

  const csv = await response.text()
  const rows = csv
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (rows.length < 2) {
    throw new Error(`No data rows for ${seriesId}`)
  }

  // CSV format: DATE,SERIES_ID
  // Example: 2026-02-26,6.74
  for (let i = rows.length - 1; i >= 1; i -= 1) {
    const row = rows[i]
    const [dateRaw, valueRaw] = row.split(',')
    if (!dateRaw || !valueRaw || valueRaw === '.') continue
    const value = Number(valueRaw)
    if (!Number.isFinite(value)) continue
    return {
      date: dateRaw,
      rateDecimal: value / 100,
    }
  }

  throw new Error(`No valid observation for ${seriesId}`)
}

export async function GET() {
  try {
    const [rate30, rate15] = await Promise.all([
      fetchLatestFredSeries('MORTGAGE30US'),
      fetchLatestFredSeries('MORTGAGE15US'),
    ])

    const date = rate30.date > rate15.date ? rate30.date : rate15.date

    return NextResponse.json(
      {
        date,
        rate30Year: rate30.rateDecimal,
        rate15Year: rate15.rateDecimal,
        points30Year: 0.6,
        points15Year: 0.6,
        source: 'freddie-mac-pmms',
      },
      {
        headers: {
          // Short cache on response, but utility-level cache still applies.
          'Cache-Control': 's-maxage=1800, stale-while-revalidate=86400',
        },
      }
    )
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

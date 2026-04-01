import { NextRequest, NextResponse } from 'next/server'
import {
  ACS_B25143_TABLE_ID,
  fetchB25143HoaMedians,
  findLatestAcs5YearWithB25143,
} from '@/lib/acs-b25143-hoa'
import type { Acs5Geography } from '@/lib/census-acs-geography'
import { normalizeZcta5 } from '@/lib/census-acs-geography'
import { geocodeLonLatToCountyPlace } from '@/lib/census-geocoder'
import { resolveUsZipToCountyFips } from '@/lib/census-zip-to-county'
import { CENSUS_ACS5_GEOGRAPHY } from '@/lib/census-geography-table'
import { NATIONAL_TYPICAL_HOA_MONTHLY } from '@/lib/hoa-fallback'

/**
 * Median monthly HOA / condo fee from ACS 5-year **table B25143**, tied to Census geography.
 *
 * Query one of:
 * - `zip` — 5-digit **ZCTA** (use your ZIP; Census tabulates by ZCTA, not USPS ZIP exactly)
 * - `zip` + `geo=county` — resolve ZIP to centroid → **county** FIPS, then B25143 at county level
 * - `stateFips` + `countyFips` — county directly
 * - `stateFips` + `placeFips` — place
 * - `lon` + `lat` — reverse-geocode to county (default) or place (`geo=place`)
 *
 * Optional: `year` (ACS 5-year end year), `CENSUS_API_KEY` env for api.census.gov
 */
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams
  const censusApiKey = process.env.CENSUS_API_KEY
  const yearParam = sp.get('year')
  const yearParsed = yearParam ? parseInt(yearParam, 10) : undefined
  const year = yearParsed != null && !Number.isNaN(yearParsed) ? yearParsed : undefined

  let geography: Acs5Geography | null = null
  let geocoderMeta: Awaited<ReturnType<typeof geocodeLonLatToCountyPlace>> | null = null
  let zipToCounty: Awaited<ReturnType<typeof resolveUsZipToCountyFips>> | null = null

  const zip = sp.get('zip')
  const stateFips = sp.get('stateFips')
  const countyFips = sp.get('countyFips')
  const placeFips = sp.get('placeFips')
  const lon = sp.get('lon')
  const lat = sp.get('lat')

  if (zip) {
    const z = normalizeZcta5(zip)
    if (!z) {
      return NextResponse.json({ error: 'Invalid zip: expected 5 digits' }, { status: 400 })
    }
    const useCountyFromZip = sp.get('geo') === 'county'
    if (useCountyFromZip) {
      zipToCounty = await resolveUsZipToCountyFips(z)
      if (!zipToCounty) {
        return NextResponse.json(
          { error: 'Could not resolve ZIP to a Census county (geocoding failed)' },
          { status: 422 }
        )
      }
      geography = {
        kind: 'county',
        stateFips: zipToCounty.stateFips,
        countyFips: zipToCounty.countyFips,
      }
    } else {
      geography = { kind: 'zcta', zcta5: z }
    }
  } else if (stateFips && countyFips) {
    geography = { kind: 'county', stateFips, countyFips }
  } else if (stateFips && placeFips) {
    geography = { kind: 'place', stateFips, placeFips }
  } else if (lon != null && lat != null) {
    const lo = Number(lon)
    const la = Number(lat)
    if (!Number.isFinite(lo) || !Number.isFinite(la)) {
      return NextResponse.json({ error: 'Invalid lon or lat' }, { status: 400 })
    }
    geocoderMeta = await geocodeLonLatToCountyPlace(lo, la)
    if (!geocoderMeta) {
      return NextResponse.json({ error: 'Census geocoder could not resolve coordinates' }, { status: 422 })
    }
    const prefer = sp.get('geo') ?? 'county'
    if (prefer === 'place' && geocoderMeta.placeFips) {
      geography = {
        kind: 'place',
        stateFips: geocoderMeta.stateFips,
        placeFips: geocoderMeta.placeFips,
      }
    } else {
      geography = {
        kind: 'county',
        stateFips: geocoderMeta.stateFips,
        countyFips: geocoderMeta.countyFips,
      }
    }
  } else {
    return NextResponse.json(
      {
        error: 'Provide zip=, or stateFips+countyFips, or stateFips+placeFips, or lon+lat',
        table: ACS_B25143_TABLE_ID,
        geographyTable: CENSUS_ACS5_GEOGRAPHY,
      },
      { status: 400 }
    )
  }

  const availableYear = await findLatestAcs5YearWithB25143()
  if (availableYear == null) {
    return NextResponse.json({
      success: true,
      fallback: true,
      table: ACS_B25143_TABLE_ID,
      source: `National typical median monthly HOA among payers (~$${NATIONAL_TYPICAL_HOA_MONTHLY}; Census ACS). ZCTA-level API pending.`,
      sourceUrl: 'https://www.census.gov/library/stories/2025/09/condo-hoa-fees.html',
      geographyTable: CENSUS_ACS5_GEOGRAPHY,
      geocoder: geocoderMeta,
      zipToCounty,
      acsYear: null,
      tableId: ACS_B25143_TABLE_ID,
      geography,
      medians: {
        total: NATIONAL_TYPICAL_HOA_MONTHLY,
        withMortgage: null,
        withoutMortgage: null,
      },
      variableIds: {},
      name: null,
      raw: {},
    })
  }

  try {
    const data = await fetchB25143HoaMedians(geography, {
      year: year ?? availableYear,
      censusApiKey,
    })
    return NextResponse.json({
      success: true,
      fallback: false,
      source:
        'U.S. Census Bureau ACS 5-Year, Table B25143 (ZCTA for zip=; use geo=county for county)',
      sourceUrl: 'https://www.census.gov/programs-surveys/acs/data/data-tables.html',
      geographyTable: CENSUS_ACS5_GEOGRAPHY,
      geocoder: geocoderMeta,
      zipToCounty,
      ...data,
    })
  } catch {
    return NextResponse.json({
      success: true,
      fallback: true,
      table: ACS_B25143_TABLE_ID,
      source: `National typical median (ACS API request failed; using ~$${NATIONAL_TYPICAL_HOA_MONTHLY}/mo benchmark).`,
      sourceUrl: 'https://www.census.gov/programs-surveys/acs/data/data-tables.html',
      geographyTable: CENSUS_ACS5_GEOGRAPHY,
      requestedGeography: geography,
      geocoder: geocoderMeta,
      zipToCounty,
      acsYear: null,
      tableId: ACS_B25143_TABLE_ID,
      geography,
      medians: {
        total: NATIONAL_TYPICAL_HOA_MONTHLY,
        withMortgage: null,
        withoutMortgage: null,
      },
      variableIds: {},
      name: null,
      raw: {},
    })
  }
}

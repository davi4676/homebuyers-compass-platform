import { NextResponse } from 'next/server'
import { fetchHMDAClosingCosts, getMSACodeForCity } from '@/lib/hmda-data'

/**
 * API route to fetch HMDA closing cost data by MSA
 * 
 * Query parameters:
 * - msaCode: 5-digit MSA code (optional if city provided)
 * - city: City name (optional if msaCode provided)
 * - year: Data year (optional, defaults to latest available)
 * 
 * Example: /api/hmda/msa?city=Austin
 * Example: /api/hmda/msa?msaCode=12420
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const msaCode = searchParams.get('msaCode')
    const city = searchParams.get('city')
    const yearParam = searchParams.get('year')
    const year = yearParam ? parseInt(yearParam, 10) : undefined

    let targetMsaCode: string | null = null

    // Get MSA code from either parameter
    if (msaCode) {
      targetMsaCode = msaCode
    } else if (city) {
      const msaMapping = getMSACodeForCity(city)
      if (msaMapping) {
        targetMsaCode = msaMapping.msaCode
      } else {
        return NextResponse.json(
          {
            success: false,
            error: `City "${city}" not found in MSA mapping`,
          },
          { status: 404 }
        )
      }
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Either msaCode or city parameter is required',
        },
        { status: 400 }
      )
    }

    if (!targetMsaCode) {
      return NextResponse.json(
        {
          success: false,
          error: 'Could not determine MSA code',
        },
        { status: 400 }
      )
    }

    const hmdaData = await fetchHMDAClosingCosts(targetMsaCode, year)

    if (!hmdaData) {
      return NextResponse.json(
        {
          success: false,
          error: `HMDA data not found for MSA ${targetMsaCode}`,
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: hmdaData,
      source: 'HMDA (Home Mortgage Disclosure Act)',
      sourceUrl: 'https://ffiec.cfpb.gov/data-browser/',
    })
  } catch (error) {
    console.error('Error fetching HMDA MSA data:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch HMDA data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

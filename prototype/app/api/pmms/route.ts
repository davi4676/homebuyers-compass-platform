import { NextResponse } from 'next/server'
import { fetchPMMSRates } from '@/lib/freddie-mac-pmms'

/**
 * API route to fetch Freddie Mac PMMS mortgage rates
 * 
 * Source: https://www.freddiemac.com/pmms
 * 
 * Returns current Primary Mortgage Market Survey rates
 */
export async function GET() {
  try {
    const rates = await fetchPMMSRates()
    
    return NextResponse.json({
      success: true,
      data: {
        thirtyYearFixed: rates.thirtyYearFixed,
        fifteenYearFixed: rates.fifteenYearFixed,
        thirtyYearFixedPercent: (rates.thirtyYearFixed * 100).toFixed(2),
        fifteenYearFixedPercent: (rates.fifteenYearFixed * 100).toFixed(2),
        lastUpdated: rates.lastUpdated,
        weekEnding: rates.weekEnding,
        source: 'Freddie Mac Primary Mortgage Market Survey (PMMS)',
        sourceUrl: 'https://www.freddiemac.com/pmms',
      }
    })
  } catch (error) {
    console.error('Error fetching PMMS rates:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch PMMS rates',
      },
      { status: 500 }
    )
  }
}

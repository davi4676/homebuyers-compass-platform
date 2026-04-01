import { NextRequest, NextResponse } from 'next/server'
import { getCachedMetroData, setCachedMetroData } from '@/lib/zillow-cache'
import fs from 'fs'
import path from 'path'

/**
 * API Route to fetch Zillow ZHVI data for metro areas
 * Fetches from Zillow Research Data: https://www.zillow.com/research/data/
 * 
 * Zillow provides CSV files with ZHVI data. This endpoint:
 * 1. Checks cache first (refreshes monthly)
 * 2. Fetches the latest Metro_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv if cache expired
 * 3. Finds the metro area by name
 * 4. Returns the latest ZHVI value
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const metroName = searchParams.get('name')
    const forceRefresh = searchParams.get('refresh') === 'true'
    
    if (!metroName) {
      return NextResponse.json(
        { error: 'Metro name is required' },
        { status: 400 }
      )
    }
    
    // Zillow Research Data URL for Metro ZHVI (All Homes)
    // This is the latest CSV file from Zillow Research Data
    const zillowDataUrl = 'https://files.zillowstatic.com/research/public_csvs/zhvi/Metro_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv'
    const localFileName = 'Metro_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv'
    const localFilePath = path.join(process.cwd(), 'data', 'zillow', localFileName)
    
    // Check cache first (unless force refresh)
    let csvText: string
    let cachedData = getCachedMetroData()
    
    if (!forceRefresh && cachedData) {
      // Use cached data
      csvText = cachedData.data
    } else {
      // Try local file first, then fall back to URL fetch
      try {
        // Check if local file exists
        if (fs.existsSync(localFilePath)) {
          console.log('Using local Zillow CSV file:', localFilePath)
          csvText = fs.readFileSync(localFilePath, 'utf-8')
        } else {
          // Local file doesn't exist, fetch from URL
          console.log('Local file not found, fetching from Zillow URL...')
          const response = await fetch(zillowDataUrl, {
            headers: {
              'Accept': 'text/csv',
            },
          })
          
          if (!response.ok) {
            throw new Error(`Failed to fetch Zillow data: ${response.statusText}`)
          }
          
          csvText = await response.text()
          console.log('Successfully fetched from Zillow URL')
        }
      } catch (fetchError) {
        // If both fail, try cached data as last resort
        if (cachedData) {
          console.warn('Failed to fetch fresh Zillow data, using cached data')
          csvText = cachedData.data
        } else {
          console.error('Error fetching Zillow metro data:', fetchError)
          throw fetchError
        }
      }
    }
    
    const lines = csvText.split('\n')
    
    if (lines.length < 2) {
      throw new Error('Invalid CSV data from Zillow')
    }
    
    // Parse CSV header to find date columns
    const header = lines[0].split(',')
    const dateColumns = header.slice(5) // Skip: RegionID, SizeRank, RegionName, RegionType, StateName
    
    // Find the latest date column (last non-empty column)
    let latestDateIndex = dateColumns.length - 1
    while (latestDateIndex > 0 && (!dateColumns[latestDateIndex] || dateColumns[latestDateIndex].trim() === '')) {
      latestDateIndex--
    }
    const latestDate = dateColumns[latestDateIndex]?.trim() || dateColumns[dateColumns.length - 1]?.trim()
    
    // Cache the data if we fetched fresh data
    if (!cachedData || forceRefresh) {
      setCachedMetroData(csvText, latestDate)
    }
    
    // Find the metro area in the data
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      if (!line.trim()) continue
      
      const columns = line.split(',')
      const regionName = columns[2]?.trim() // RegionName column
      const regionType = columns[3]?.trim() // RegionType column
      
      // Match metro area (case-insensitive, partial match)
      if (regionType === 'Msa' && regionName && 
          regionName.toLowerCase().includes(metroName.toLowerCase())) {
        const zhviValue = columns[5 + latestDateIndex]?.trim() // Data column for latest date
        
        if (zhviValue && !isNaN(parseFloat(zhviValue))) {
          return NextResponse.json({
            regionId: columns[0]?.trim() || '',
            regionName,
            regionType: 'metro',
            zhvi: parseFloat(zhviValue),
            date: latestDate,
          })
        }
      }
    }
    
    // Metro not found
    return NextResponse.json(
      { error: `Metro area "${metroName}" not found in Zillow data` },
      { status: 404 }
    )
  } catch (error) {
    console.error('Error in Zillow metro API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

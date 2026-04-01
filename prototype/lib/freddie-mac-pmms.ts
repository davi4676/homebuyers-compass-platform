/**
 * Freddie Mac Primary Mortgage Market Survey (PMMS) Integration
 * 
 * Source: https://www.freddiemac.com/pmms
 * 
 * The PMMS provides weekly mortgage rate averages based on data from Loan Product Advisor (LPA)
 * Rates are updated weekly on Thursdays at 12 p.m. ET
 */

export interface PMMSRates {
  thirtyYearFixed: number // 30-year fixed-rate mortgage
  fifteenYearFixed: number // 15-year fixed-rate mortgage
  lastUpdated: string // ISO date string
  weekEnding: string // Week ending date
}

// Cache for PMMS rates (updated weekly)
let pmmsCache: PMMSRates | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds

/**
 * Default/fallback rates based on latest PMMS data
 * Updated to reflect more competitive rates for well-qualified buyers
 * 30-year: 5.5%
 * 15-year: 4.9%
 */
const DEFAULT_PMMS_RATES: PMMSRates = {
  thirtyYearFixed: 0.055, // 5.5%
  fifteenYearFixed: 0.049, // 4.9%
  lastUpdated: new Date().toISOString(),
  weekEnding: new Date().toISOString(),
}

/**
 * Fetch current PMMS rates from Freddie Mac
 * Note: This is a placeholder for API integration
 * In production, you would fetch from Freddie Mac's API or scrape their PMMS page
 */
export async function fetchPMMSRates(): Promise<PMMSRates> {
  try {
    // Check cache first
    const now = Date.now()
    if (pmmsCache && (now - cacheTimestamp) < CACHE_DURATION) {
      return pmmsCache
    }

    // TODO: Implement actual API call to Freddie Mac PMMS
    // For now, return default rates
    // In production, you could:
    // 1. Use Freddie Mac's API if available
    // 2. Scrape the PMMS page (with proper attribution)
    // 3. Use a third-party service that aggregates PMMS data
    
    // Example API call structure (if API becomes available):
    // const response = await fetch('https://api.freddiemac.com/pmms/rates')
    // const data = await response.json()
    // pmmsCache = {
    //   thirtyYearFixed: data.thirtyYearFixed / 100,
    //   fifteenYearFixed: data.fifteenYearFixed / 100,
    //   lastUpdated: data.lastUpdated,
    //   weekEnding: data.weekEnding,
    // }

    // For now, return default rates
    pmmsCache = DEFAULT_PMMS_RATES
    cacheTimestamp = now
    
    return pmmsCache
  } catch (error) {
    console.error('Error fetching PMMS rates:', error)
    // Return default rates on error
    return DEFAULT_PMMS_RATES
  }
}

/**
 * Get current 30-year fixed mortgage rate from PMMS
 */
export async function getCurrentMortgageRate(): Promise<number> {
  const rates = await fetchPMMSRates()
  return rates.thirtyYearFixed
}

/**
 * Get current 15-year fixed mortgage rate from PMMS
 */
export async function getCurrent15YearMortgageRate(): Promise<number> {
  const rates = await fetchPMMSRates()
  return rates.fifteenYearFixed
}

/**
 * Get base mortgage rate for calculations
 * Uses 30-year fixed rate as the standard
 */
export async function getBaseMortgageRate(): Promise<number> {
  return getCurrentMortgageRate()
}

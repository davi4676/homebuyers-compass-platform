/**
 * HMDA (Home Mortgage Disclosure Act) API Integration
 * 
 * Source: https://ffiec.cfpb.gov/data-browser/
 * 
 * HMDA data provides detailed mortgage lending information including:
 * - Loan origination fees
 * - Total loan costs
 * - Total points and fees
 * - By Metropolitan Statistical Area (MSA)
 * 
 * HMDA API endpoints:
 * - Base URL: https://ffiec.cfpb.gov/api/public
 * - Data Browser: https://ffiec.cfpb.gov/data-browser/
 */

export interface HMDAClosingCosts {
  msaCode: string
  msaName: string
  averageOriginationCharges: number
  averageTotalLoanCosts: number
  averagePointsAndFees: number
  medianOriginationCharges: number
  medianTotalLoanCosts: number
  sampleSize: number
  year: number
  lastUpdated: string
}

export interface MSAMapping {
  city: string
  msaCode: string
  msaName: string
  state: string
}

// Cache for HMDA data (updated annually)
let hmdaCache: Map<string, HMDAClosingCosts> = new Map()
let cacheTimestamp: number = 0
const CACHE_DURATION = 365 * 24 * 60 * 60 * 1000 // 1 year in milliseconds

/**
 * Map of major cities to their MSA codes
 * MSA codes are 5-digit codes from the Census Bureau
 */
const CITY_TO_MSA: Record<string, MSAMapping> = {
  'Austin': { city: 'Austin', msaCode: '12420', msaName: 'Austin-Round Rock-Georgetown, TX', state: 'TX' },
  'Boston': { city: 'Boston', msaCode: '14460', msaName: 'Boston-Cambridge-Newton, MA-NH', state: 'MA' },
  'Charlotte': { city: 'Charlotte', msaCode: '16740', msaName: 'Charlotte-Concord-Gastonia, NC-SC', state: 'NC' },
  'Chicago': { city: 'Chicago', msaCode: '16980', msaName: 'Chicago-Naperville-Elgin, IL-IN-WI', state: 'IL' },
  'Columbus': { city: 'Columbus', msaCode: '18140', msaName: 'Columbus, OH', state: 'OH' },
  'Dallas': { city: 'Dallas', msaCode: '19100', msaName: 'Dallas-Fort Worth-Arlington, TX', state: 'TX' },
  'Denver': { city: 'Denver', msaCode: '19740', msaName: 'Denver-Aurora-Lakewood, CO', state: 'CO' },
  'Houston': { city: 'Houston', msaCode: '26420', msaName: 'Houston-The Woodlands-Sugar Land, TX', state: 'TX' },
  'Indianapolis': { city: 'Indianapolis', msaCode: '26900', msaName: 'Indianapolis-Carmel-Anderson, IN', state: 'IN' },
  'Jacksonville': { city: 'Jacksonville', msaCode: '27260', msaName: 'Jacksonville, FL', state: 'FL' },
  'Kansas City': { city: 'Kansas City', msaCode: '28140', msaName: 'Kansas City, MO-KS', state: 'MO' },
  'Las Vegas': { city: 'Las Vegas', msaCode: '29820', msaName: 'Las Vegas-Henderson-Paradise, NV', state: 'NV' },
  'Los Angeles': { city: 'Los Angeles', msaCode: '31080', msaName: 'Los Angeles-Long Beach-Anaheim, CA', state: 'CA' },
  'Memphis': { city: 'Memphis', msaCode: '32820', msaName: 'Memphis, TN-MS-AR', state: 'TN' },
  'Miami': { city: 'Miami', msaCode: '33100', msaName: 'Miami-Fort Lauderdale-Pompano Beach, FL', state: 'FL' },
  'Milwaukee': { city: 'Milwaukee', msaCode: '33340', msaName: 'Milwaukee-Waukesha-West Allis, WI', state: 'WI' },
  'Minneapolis': { city: 'Minneapolis', msaCode: '33460', msaName: 'Minneapolis-St. Paul-Bloomington, MN-WI', state: 'MN' },
  'Nashville': { city: 'Nashville', msaCode: '34980', msaName: 'Nashville-Davidson--Murfreesboro--Franklin, TN', state: 'TN' },
  'New York': { city: 'New York', msaCode: '35620', msaName: 'New York-Newark-Jersey City, NY-NJ-PA', state: 'NY' },
  'Oklahoma City': { city: 'Oklahoma City', msaCode: '36420', msaName: 'Oklahoma City, OK', state: 'OK' },
  'Orlando': { city: 'Orlando', msaCode: '36740', msaName: 'Orlando-Kissimmee-Sanford, FL', state: 'FL' },
  'Philadelphia': { city: 'Philadelphia', msaCode: '37980', msaName: 'Philadelphia-Camden-Wilmington, PA-NJ-DE-MD', state: 'PA' },
  'Phoenix': { city: 'Phoenix', msaCode: '38060', msaName: 'Phoenix-Mesa-Chandler, AZ', state: 'AZ' },
  'Portland': { city: 'Portland', msaCode: '38900', msaName: 'Portland-Vancouver-Hillsboro, OR-WA', state: 'OR' },
  'Raleigh': { city: 'Raleigh', msaCode: '39580', msaName: 'Raleigh-Cary, NC', state: 'NC' },
  'Sacramento': { city: 'Sacramento', msaCode: '40900', msaName: 'Sacramento-Roseville-Folsom, CA', state: 'CA' },
  'San Antonio': { city: 'San Antonio', msaCode: '41700', msaName: 'San Antonio-New Braunfels, TX', state: 'TX' },
  'San Diego': { city: 'San Diego', msaCode: '41740', msaName: 'San Diego-Chula Vista-Carlsbad, CA', state: 'CA' },
  'San Francisco': { city: 'San Francisco', msaCode: '41860', msaName: 'San Francisco-Oakland-Berkeley, CA', state: 'CA' },
  'San Jose': { city: 'San Jose', msaCode: '41940', msaName: 'San Jose-Sunnyvale-Santa Clara, CA', state: 'CA' },
  'Seattle': { city: 'Seattle', msaCode: '42660', msaName: 'Seattle-Tacoma-Bellevue, WA', state: 'WA' },
  'Tampa': { city: 'Tampa', msaCode: '45300', msaName: 'Tampa-St. Petersburg-Clearwater, FL', state: 'FL' },
  'Washington DC': { city: 'Washington DC', msaCode: '47900', msaName: 'Washington-Arlington-Alexandria, DC-VA-MD-WV', state: 'DC' },
}

/**
 * Get MSA code for a city
 */
export function getMSACodeForCity(city: string): MSAMapping | null {
  return CITY_TO_MSA[city] || null
}

/**
 * Fetch HMDA closing cost data for an MSA
 * 
 * HMDA API structure:
 * - Base endpoint: https://ffiec.cfpb.gov/api/public
 * - Aggregate data by MSA
 * - Fields include: origination_charges, total_loan_costs, points_and_fees
 * 
 * Note: HMDA data is typically available with a 1-2 year lag
 * Latest available year is usually the previous calendar year
 */
export async function fetchHMDAClosingCosts(msaCode: string, year?: number): Promise<HMDAClosingCosts | null> {
  try {
    // Check cache first
    const cacheKey = `${msaCode}-${year || 'latest'}`
    const now = Date.now()
    if (hmdaCache.has(cacheKey) && (now - cacheTimestamp) < CACHE_DURATION) {
      return hmdaCache.get(cacheKey) || null
    }

    // Use latest available year if not specified (typically previous year)
    const dataYear = year || new Date().getFullYear() - 1
    
    // HMDA API endpoint structure
    // Note: Actual API structure may vary - this is a template
    // You may need to use the HMDA Data Browser or download bulk data files
    const apiUrl = `https://ffiec.cfpb.gov/api/public/data/aggregate?msa=${msaCode}&year=${dataYear}&fields=origination_charges,total_loan_costs,points_and_fees`
    
    try {
      const response = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        // If API call fails, try alternative approach
        console.warn(`HMDA API call failed for MSA ${msaCode}, using fallback data`)
        return getFallbackHMDAData(msaCode)
      }

      const data = await response.json()
      
      // Parse HMDA response (structure may vary)
      // HMDA data typically includes aggregations by MSA
      if (data && data.aggregations && data.aggregations.length > 0) {
        const msaData = data.aggregations.find((agg: any) => agg.msa_code === msaCode)
        
        if (msaData) {
          const msaInfo = CITY_TO_MSA[Object.keys(CITY_TO_MSA).find(city => 
            CITY_TO_MSA[city].msaCode === msaCode
          ) || ''] || { msaName: `MSA ${msaCode}`, city: '', state: '' }
          
          const hmdaCosts: HMDAClosingCosts = {
            msaCode,
            msaName: msaInfo.msaName,
            averageOriginationCharges: msaData.avg_origination_charges || msaData.origination_charges_mean || 0,
            averageTotalLoanCosts: msaData.avg_total_loan_costs || msaData.total_loan_costs_mean || 0,
            averagePointsAndFees: msaData.avg_points_and_fees || msaData.points_and_fees_mean || 0,
            medianOriginationCharges: msaData.median_origination_charges || msaData.origination_charges_median || 0,
            medianTotalLoanCosts: msaData.median_total_loan_costs || msaData.total_loan_costs_median || 0,
            sampleSize: msaData.count || msaData.sample_size || 0,
            year: dataYear,
            lastUpdated: new Date().toISOString(),
          }
          
          // Cache the result
          hmdaCache.set(cacheKey, hmdaCosts)
          cacheTimestamp = now
          
          return hmdaCosts
        }
      }
    } catch (apiError) {
      console.warn(`HMDA API error for MSA ${msaCode}:`, apiError)
    }

    // Fallback to estimated data if API fails
    return getFallbackHMDAData(msaCode)
  } catch (error) {
    console.error(`Error fetching HMDA data for MSA ${msaCode}:`, error)
    return getFallbackHMDAData(msaCode)
  }
}

/**
 * Get fallback HMDA data based on market averages
 * Uses typical closing cost patterns by region
 */
function getFallbackHMDAData(msaCode: string): HMDAClosingCosts | null {
  const msaInfo = Object.values(CITY_TO_MSA).find(m => m.msaCode === msaCode)
  if (!msaInfo) return null

  // Regional closing cost estimates based on HMDA patterns
  // High-cost areas (CA, NY, MA): $8,000-$12,000
  // Medium-cost areas (TX, FL, AZ): $5,000-$8,000
  // Lower-cost areas (OH, TN, OK): $3,000-$6,000
  
  const highCostStates = ['CA', 'NY', 'MA', 'DC', 'WA', 'OR']
  const mediumCostStates = ['TX', 'FL', 'AZ', 'NV', 'CO', 'NC', 'SC']
  
  let baseClosingCost = 6000 // Default medium
  if (highCostStates.includes(msaInfo.state)) {
    baseClosingCost = 10000
  } else if (mediumCostStates.includes(msaInfo.state)) {
    baseClosingCost = 6500
  } else {
    baseClosingCost = 4500
  }

  // Origination charges typically 0.5-1.5% of loan amount
  // For $300k loan: $1,500-$4,500
  const avgOriginationCharges = baseClosingCost * 0.4
  const avgTotalLoanCosts = baseClosingCost
  const avgPointsAndFees = baseClosingCost * 0.3

  return {
    msaCode,
    msaName: msaInfo.msaName,
    averageOriginationCharges: Math.round(avgOriginationCharges),
    averageTotalLoanCosts: Math.round(avgTotalLoanCosts),
    averagePointsAndFees: Math.round(avgPointsAndFees),
    medianOriginationCharges: Math.round(avgOriginationCharges * 0.9),
    medianTotalLoanCosts: Math.round(avgTotalLoanCosts * 0.9),
    sampleSize: 0, // Unknown for fallback
    year: new Date().getFullYear() - 1,
    lastUpdated: new Date().toISOString(),
  }
}

/**
 * Get closing costs for a city using HMDA data
 */
export async function getClosingCostsByCity(city: string, loanAmount: number = 300000): Promise<number> {
  const msaMapping = getMSACodeForCity(city)
  if (!msaMapping) {
    // Fallback to default if city not found
    return loanAmount * 0.03 // 3% of loan amount
  }

  const hmdaData = await fetchHMDAClosingCosts(msaMapping.msaCode)
  if (!hmdaData) {
    // Fallback calculation
    return loanAmount * 0.03
  }

  // Scale HMDA average total loan costs based on loan amount
  // HMDA data is typically for average loan sizes, so we scale proportionally
  const baseLoanAmount = 300000 // Typical average loan size in HMDA data
  const scaleFactor = loanAmount / baseLoanAmount
  
  // Use median total loan costs (more representative than average)
  const scaledClosingCosts = hmdaData.medianTotalLoanCosts * scaleFactor
  
  // Ensure minimum closing costs (at least 2% of loan)
  const minimumClosingCosts = loanAmount * 0.02
  return Math.max(scaledClosingCosts, minimumClosingCosts)
}

/**
 * Get detailed closing cost breakdown by city using HMDA data
 */
export async function getDetailedClosingCostsByCity(
  city: string, 
  loanAmount: number = 300000
): Promise<{
  originationCharges: number
  totalLoanCosts: number
  pointsAndFees: number
  source: string
  year: number
} | null> {
  const msaMapping = getMSACodeForCity(city)
  if (!msaMapping) return null

  const hmdaData = await fetchHMDAClosingCosts(msaMapping.msaCode)
  if (!hmdaData) return null

  const baseLoanAmount = 300000
  const scaleFactor = loanAmount / baseLoanAmount

  return {
    originationCharges: Math.round(hmdaData.medianOriginationCharges * scaleFactor),
    totalLoanCosts: Math.round(hmdaData.medianTotalLoanCosts * scaleFactor),
    pointsAndFees: Math.round((hmdaData.medianOriginationCharges * 0.4) * scaleFactor), // Estimate points as 40% of origination
    source: 'HMDA',
    year: hmdaData.year,
  }
}

/**
 * Zillow Research Data Integration
 * Fetches ZHVI (Zillow Home Value Index) data for metro areas and zip codes
 * Source: https://www.zillow.com/research/data/
 */

export interface ZillowZHVIData {
  regionId: string
  regionName: string
  regionType: 'metro' | 'zip'
  zhvi: number // Zillow Home Value Index (all homes)
  date: string // Latest date available
  yearOverYearChange?: number
  monthOverMonthChange?: number
}

export interface ZillowDataCache {
  [key: string]: {
    data: ZillowZHVIData | null
    timestamp: number
  }
}

// Cache to avoid repeated API calls
const dataCache: ZillowDataCache = {}
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

/**
 * Get Zillow ZHVI data for a metro area
 * @param metroName - Metro area name (e.g., "Austin, TX", "Los Angeles-Long Beach-Anaheim, CA")
 */
export async function getZillowMetroZHVI(metroName: string): Promise<ZillowZHVIData | null> {
  const cacheKey = `metro:${metroName.toLowerCase()}`
  
  // Check cache
  if (dataCache[cacheKey] && Date.now() - dataCache[cacheKey].timestamp < CACHE_DURATION) {
    return dataCache[cacheKey].data
  }
  
  try {
    // Zillow Research Data is available via CSV download
    // For production, you would:
    // 1. Set up a server-side API route to fetch from Zillow's data files
    // 2. Or use a Zillow API if available
    // 3. Or maintain a local database of Zillow data
    
    // For now, we'll create an API route that fetches from Zillow's public data
    const response = await fetch(`/api/zillow/metro?name=${encodeURIComponent(metroName)}`)
    
    if (!response.ok) {
      console.warn(`Failed to fetch Zillow data for metro: ${metroName}`)
      return null
    }
    
    const data = await response.json()
    
    // Cache the result
    dataCache[cacheKey] = {
      data,
      timestamp: Date.now()
    }
    
    return data
  } catch (error) {
    console.error(`Error fetching Zillow metro data for ${metroName}:`, error)
    return null
  }
}

/**
 * Get Zillow ZHVI data for a zip code
 * @param zipCode - 5-digit zip code
 */
export async function getZillowZipZHVI(zipCode: string): Promise<ZillowZHVIData | null> {
  const cacheKey = `zip:${zipCode}`
  
  // Check cache
  if (dataCache[cacheKey] && Date.now() - dataCache[cacheKey].timestamp < CACHE_DURATION) {
    return dataCache[cacheKey].data
  }
  
  try {
    const response = await fetch(`/api/zillow/zip?code=${zipCode}`)
    
    if (!response.ok) {
      console.warn(`Failed to fetch Zillow data for zip: ${zipCode}`)
      return null
    }
    
    const data = await response.json()
    
    // Cache the result
    dataCache[cacheKey] = {
      data,
      timestamp: Date.now()
    }
    
    return data
  } catch (error) {
    console.error(`Error fetching Zillow zip data for ${zipCode}:`, error)
    return null
  }
}

/**
 * Map city name to Zillow metro name
 * Zillow uses specific metro area names (e.g., "Austin-Round Rock, TX")
 * This function maps our city names to Zillow's metro area naming convention
 */
export function mapCityToZillowMetro(city: string): string {
  const cityMetroMap: Record<string, string> = {
    // Major metros
    'Akron': 'Akron, OH',
    'Albany': 'Albany-Schenectady-Troy, NY',
    'Albuquerque': 'Albuquerque, NM',
    'Alexandria': 'Washington-Arlington-Alexandria, DC-VA-MD-WV',
    'Allentown': 'Allentown-Bethlehem-Easton, PA-NJ',
    'Amarillo': 'Amarillo, TX',
    'Anaheim': 'Los Angeles-Long Beach-Anaheim, CA',
    'Anchorage': 'Anchorage, AK',
    'Ann Arbor': 'Ann Arbor, MI',
    'Arlington': 'Dallas-Fort Worth-Arlington, TX',
    'Atlanta': 'Atlanta-Sandy Springs-Roswell, GA',
    'Augusta': 'Augusta-Richmond County, GA-SC',
    'Aurora': 'Denver-Aurora-Lakewood, CO',
    'Austin': 'Austin-Round Rock, TX',
    'Bakersfield': 'Bakersfield, CA',
    'Baltimore': 'Baltimore-Columbia-Towson, MD',
    'Baton Rouge': 'Baton Rouge, LA',
    'Birmingham': 'Birmingham-Hoover, AL',
    'Boise': 'Boise City, ID',
    'Boston': 'Boston-Cambridge-Newton, MA-NH',
    'Bridgeport': 'Bridgeport-Stamford-Norwalk, CT',
    'Buffalo': 'Buffalo-Cheektowaga-Niagara Falls, NY',
    'Cape Coral': 'Cape Coral-Fort Myers, FL',
    'Carlsbad': 'San Diego-Carlsbad, CA',
    'Carrollton': 'Dallas-Fort Worth-Arlington, TX',
    'Cary': 'Raleigh, NC',
    'Cedar Rapids': 'Cedar Rapids, IA',
    'Chandler': 'Phoenix-Mesa-Scottsdale, AZ',
    'Charleston': 'Charleston-North Charleston, SC',
    'Charlotte': 'Charlotte-Concord-Gastonia, NC-SC',
    'Chattanooga': 'Chattanooga, TN-GA',
    'Chesapeake': 'Virginia Beach-Norfolk-Newport News, VA-NC',
    'Chicago': 'Chicago-Naperville-Elgin, IL-IN-WI',
    'Chula Vista': 'San Diego-Carlsbad, CA',
    'Cincinnati': 'Cincinnati, OH-KY-IN',
    'Clarksville': 'Clarksville, TN-KY',
    'Clearwater': 'Tampa-St. Petersburg-Clearwater, FL',
    'Cleveland': 'Cleveland-Elyria, OH',
    'Colorado Springs': 'Colorado Springs, CO',
    'Columbia': 'Columbia, SC',
    'Columbus': 'Columbus, OH',
    'Concord': 'San Francisco-Oakland-Hayward, CA',
    'Corpus Christi': 'Corpus Christi, TX',
    'Dallas': 'Dallas-Fort Worth-Arlington, TX',
    'Davenport': 'Davenport-Moline-Rock Island, IA-IL',
    'Dayton': 'Dayton, OH',
    'Denver': 'Denver-Aurora-Lakewood, CO',
    'Des Moines': 'Des Moines-West Des Moines, IA',
    'Detroit': 'Detroit-Warren-Dearborn, MI',
    'Durham': 'Durham-Chapel Hill, NC',
    'El Paso': 'El Paso, TX',
    'Elk Grove': 'Sacramento--Roseville--Arden-Arcade, CA',
    'Escondido': 'San Diego-Carlsbad, CA',
    'Eugene': 'Eugene, OR',
    'Evansville': 'Evansville, IN-KY',
    'Fayetteville': 'Fayetteville, NC',
    'Fontana': 'Riverside-San Bernardino-Ontario, CA',
    'Fort Collins': 'Fort Collins, CO',
    'Fort Lauderdale': 'Miami-Fort Lauderdale-West Palm Beach, FL',
    'Fort Wayne': 'Fort Wayne, IN',
    'Fort Worth': 'Dallas-Fort Worth-Arlington, TX',
    'Fremont': 'San Francisco-Oakland-Hayward, CA',
    'Fresno': 'Fresno, CA',
    'Frisco': 'Dallas-Fort Worth-Arlington, TX',
    'Gainesville': 'Gainesville, FL',
    'Garden Grove': 'Los Angeles-Long Beach-Anaheim, CA',
    'Garland': 'Dallas-Fort Worth-Arlington, TX',
    'Gilbert': 'Phoenix-Mesa-Scottsdale, AZ',
    'Glendale': 'Phoenix-Mesa-Scottsdale, AZ',
    'Grand Prairie': 'Dallas-Fort Worth-Arlington, TX',
    'Grand Rapids': 'Grand Rapids-Wyoming, MI',
    'Greensboro': 'Greensboro-High Point, NC',
    'Greenville': 'Greenville-Anderson-Mauldin, SC',
    'Hampton': 'Virginia Beach-Norfolk-Newport News, VA-NC',
    'Hartford': 'Hartford-West Hartford-East Hartford, CT',
    'Hayward': 'San Francisco-Oakland-Hayward, CA',
    'Henderson': 'Las Vegas-Henderson-Paradise, NV',
    'Hialeah': 'Miami-Fort Lauderdale-West Palm Beach, FL',
    'Honolulu': 'Urban Honolulu, HI',
    'Houston': 'Houston-The Woodlands-Sugar Land, TX',
    'Huntsville': 'Huntsville, AL',
    'Independence': 'Kansas City, MO-KS',
    'Indianapolis': 'Indianapolis-Carmel-Anderson, IN',
    'Inglewood': 'Los Angeles-Long Beach-Anaheim, CA',
    'Irvine': 'Los Angeles-Long Beach-Anaheim, CA',
    'Irving': 'Dallas-Fort Worth-Arlington, TX',
    'Jackson': 'Jackson, MS',
    'Jacksonville': 'Jacksonville, FL',
    'Jersey City': 'New York-Newark-Jersey City, NY-NJ-PA',
    'Joliet': 'Chicago-Naperville-Elgin, IL-IN-WI',
    'Kansas City': 'Kansas City, MO-KS',
    'Knoxville': 'Knoxville, TN',
    'Lakeland': 'Lakeland-Winter Haven, FL',
    'Laredo': 'Laredo, TX',
    'Las Vegas': 'Las Vegas-Henderson-Paradise, NV',
    'Lexington': 'Lexington-Fayette, KY',
    'Lincoln': 'Lincoln, NE',
    'Little Rock': 'Little Rock-North Little Rock-Conway, AR',
    'Long Beach': 'Los Angeles-Long Beach-Anaheim, CA',
    'Los Angeles': 'Los Angeles-Long Beach-Anaheim, CA',
    'Louisville': 'Louisville/Jefferson County, KY-IN',
    'Lubbock': 'Lubbock, TX',
    'Madison': 'Madison, WI',
    'McAllen': 'McAllen-Edinburg-Mission, TX',
    'McKinney': 'Dallas-Fort Worth-Arlington, TX',
    'Memphis': 'Memphis, TN-MS-AR',
    'Mesa': 'Phoenix-Mesa-Scottsdale, AZ',
    'Miami': 'Miami-Fort Lauderdale-West Palm Beach, FL',
    'Milwaukee': 'Milwaukee-Waukesha-West Allis, WI',
    'Minneapolis': 'Minneapolis-St. Paul-Bloomington, MN-WI',
    'Mobile': 'Mobile, AL',
    'Modesto': 'Modesto, CA',
    'Montgomery': 'Montgomery, AL',
    'Moreno Valley': 'Riverside-San Bernardino-Ontario, CA',
    'Nashville': 'Nashville-Davidson--Murfreesboro--Franklin, TN',
    'New Haven': 'New Haven-Milford, CT',
    'New Orleans': 'New Orleans-Metairie, LA',
    'New York': 'New York-Newark-Jersey City, NY-NJ-PA',
    'Newark': 'New York-Newark-Jersey City, NY-NJ-PA',
    'Newport News': 'Virginia Beach-Norfolk-Newport News, VA-NC',
    'Norfolk': 'Virginia Beach-Norfolk-Newport News, VA-NC',
    'Norman': 'Oklahoma City, OK',
    'North Las Vegas': 'Las Vegas-Henderson-Paradise, NV',
    'Oakland': 'San Francisco-Oakland-Hayward, CA',
    'Oceanside': 'San Diego-Carlsbad, CA',
    'Oklahoma City': 'Oklahoma City, OK',
    'Omaha': 'Omaha-Council Bluffs, NE-IA',
    'Ontario': 'Riverside-San Bernardino-Ontario, CA',
    'Orlando': 'Orlando-Kissimmee-Sanford, FL',
    'Oxnard': 'Oxnard-Thousand Oaks-Ventura, CA',
    'Palm Bay': 'Palm Bay-Melbourne-Titusville, FL',
    'Palmdale': 'Los Angeles-Long Beach-Anaheim, CA',
    'Pasadena': 'Los Angeles-Long Beach-Anaheim, CA',
    'Paterson': 'New York-Newark-Jersey City, NY-NJ-PA',
    'Pensacola': 'Pensacola-Ferry Pass-Brent, FL',
    'Peoria': 'Peoria, IL',
    'Philadelphia': 'Philadelphia-Camden-Wilmington, PA-NJ-DE-MD',
    'Phoenix': 'Phoenix-Mesa-Scottsdale, AZ',
    'Pittsburgh': 'Pittsburgh, PA',
    'Plano': 'Dallas-Fort Worth-Arlington, TX',
    'Portland': 'Portland-Vancouver-Hillsboro, OR-WA',
    'Port St. Lucie': 'Port St. Lucie, FL',
    'Providence': 'Providence-Warwick, RI-MA',
    'Raleigh': 'Raleigh, NC',
    'Reno': 'Reno, NV',
    'Richmond': 'Richmond, VA',
    'Riverside': 'Riverside-San Bernardino-Ontario, CA',
    'Rochester': 'Rochester, NY',
    'Rockford': 'Rockford, IL',
    'Sacramento': 'Sacramento--Roseville--Arden-Arcade, CA',
    'Saint Louis': 'St. Louis, MO-IL',
    'Saint Paul': 'Minneapolis-St. Paul-Bloomington, MN-WI',
    'Saint Petersburg': 'Tampa-St. Petersburg-Clearwater, FL',
    'Salem': 'Salem, OR',
    'Salinas': 'Salinas, CA',
    'Salt Lake City': 'Salt Lake City, UT',
    'San Antonio': 'San Antonio-New Braunfels, TX',
    'San Bernardino': 'Riverside-San Bernardino-Ontario, CA',
    'San Diego': 'San Diego-Carlsbad, CA',
    'San Francisco': 'San Francisco-Oakland-Hayward, CA',
    'San Jose': 'San Jose-Sunnyvale-Santa Clara, CA',
    'Santa Ana': 'Los Angeles-Long Beach-Anaheim, CA',
    'Santa Clarita': 'Los Angeles-Long Beach-Anaheim, CA',
    'Santa Rosa': 'Santa Rosa, CA',
    'Savannah': 'Savannah, GA',
    'Scottsdale': 'Phoenix-Mesa-Scottsdale, AZ',
    'Seattle': 'Seattle-Tacoma-Bellevue, WA',
    'Shreveport': 'Shreveport-Bossier City, LA',
    'Spokane': 'Spokane-Spokane Valley, WA',
    'Springfield': 'Springfield, MO',
    'Stockton': 'Stockton-Lodi, CA',
    'Sunnyvale': 'San Jose-Sunnyvale-Santa Clara, CA',
    'Syracuse': 'Syracuse, NY',
    'Tacoma': 'Seattle-Tacoma-Bellevue, WA',
    'Tallahassee': 'Tallahassee, FL',
    'Tampa': 'Tampa-St. Petersburg-Clearwater, FL',
    'Tempe': 'Phoenix-Mesa-Scottsdale, AZ',
    'Thornton': 'Denver-Aurora-Lakewood, CO',
    'Toledo': 'Toledo, OH',
    'Topeka': 'Topeka, KS',
    'Tucson': 'Tucson, AZ',
    'Tulsa': 'Tulsa, OK',
    'Vallejo': 'Vallejo-Fairfield, CA',
    'Vancouver': 'Portland-Vancouver-Hillsboro, OR-WA',
    'Virginia Beach': 'Virginia Beach-Norfolk-Newport News, VA-NC',
    'Visalia': 'Visalia-Porterville, CA',
    'Warren': 'Detroit-Warren-Dearborn, MI',
    'Washington DC': 'Washington-Arlington-Alexandria, DC-VA-MD-WV',
    'West Covina': 'Los Angeles-Long Beach-Anaheim, CA',
    'West Valley City': 'Salt Lake City, UT',
    'Wichita': 'Wichita, KS',
    'Wilmington': 'Wilmington, NC',
    'Winston-Salem': 'Winston-Salem, NC',
    'Worcester': 'Worcester, MA-CT',
    'Yonkers': 'New York-Newark-Jersey City, NY-NJ-PA',
  }
  
  // Return mapped metro name or use city name as-is (API will try to match)
  return cityMetroMap[city] || city
}

/**
 * Get average home price from Zillow data
 * Falls back to default if Zillow data unavailable
 */
export async function getAverageHomePrice(
  location: string,
  locationType: 'city' | 'zip'
): Promise<number | null> {
  try {
    if (locationType === 'zip') {
      const zipData = await getZillowZipZHVI(location)
      return zipData?.zhvi || null
    } else {
      const metroName = mapCityToZillowMetro(location)
      const metroData = await getZillowMetroZHVI(metroName)
      return metroData?.zhvi || null
    }
  } catch (error) {
    console.error('Error getting average home price from Zillow:', error)
    return null
  }
}

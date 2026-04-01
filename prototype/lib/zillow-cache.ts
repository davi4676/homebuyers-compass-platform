/**
 * Zillow ZHVI Data Cache
 * Caches Zillow metro and zip ZHVI data with monthly expiration
 * Data is refreshed automatically when older than 30 days
 */

interface CachedData {
  data: string // CSV text
  timestamp: number
  lastDate: string // Latest date in the CSV
}

const METRO_CACHE_KEY = 'zillow_metro_zhvi'
const ZIP_CACHE_KEY = 'zillow_zip_zhvi'
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds

// In-memory cache (in production, use Redis or a database)
const cache: Map<string, CachedData> = new Map()

/**
 * Check if cached data is still valid (less than 30 days old)
 */
function isCacheValid(cached: CachedData | undefined): boolean {
  if (!cached) return false
  const age = Date.now() - cached.timestamp
  return age < CACHE_DURATION
}

/**
 * Get cached Zillow metro data
 */
export function getCachedMetroData(): CachedData | null {
  const cached = cache.get(METRO_CACHE_KEY)
  return (cached && isCacheValid(cached)) ? cached : null
}

/**
 * Get cached Zillow zip data
 */
export function getCachedZipData(): CachedData | null {
  const cached = cache.get(ZIP_CACHE_KEY)
  return (cached && isCacheValid(cached)) ? cached : null
}

/**
 * Cache Zillow metro data
 */
export function setCachedMetroData(csvText: string, lastDate: string): void {
  cache.set(METRO_CACHE_KEY, {
    data: csvText,
    timestamp: Date.now(),
    lastDate,
  })
}

/**
 * Cache Zillow zip data
 */
export function setCachedZipData(csvText: string, lastDate: string): void {
  cache.set(ZIP_CACHE_KEY, {
    data: csvText,
    timestamp: Date.now(),
    lastDate,
  })
}

/**
 * Clear all Zillow caches (for manual refresh)
 */
export function clearZillowCache(): void {
  cache.delete(METRO_CACHE_KEY)
  cache.delete(ZIP_CACHE_KEY)
}

/**
 * Get cache status
 */
export function getCacheStatus(): {
  metro: { cached: boolean; age: number; lastDate?: string }
  zip: { cached: boolean; age: number; lastDate?: string }
} {
  const metroCached = cache.get(METRO_CACHE_KEY)
  const zipCached = cache.get(ZIP_CACHE_KEY)

  return {
    metro: {
      cached: isCacheValid(metroCached),
      age: metroCached ? Date.now() - metroCached.timestamp : 0,
      lastDate: metroCached?.lastDate,
    },
    zip: {
      cached: isCacheValid(zipCached),
      age: zipCached ? Date.now() - zipCached.timestamp : 0,
      lastDate: zipCached?.lastDate,
    },
  }
}

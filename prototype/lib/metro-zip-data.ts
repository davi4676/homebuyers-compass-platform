/**
 * Metro Area and Zip Code Data Management
 * Replaces city-based data with comprehensive zip code and metro area data
 * Supports loading from external data sources (API, CSV, JSON)
 */

// ============================================================================
// TYPES
// ============================================================================

export interface MetroAreaData {
  metroCode: string; // e.g., "NYC", "LA", "SF"
  metroName: string; // e.g., "New York-Newark-Jersey City, NY-NJ-PA"
  state: string;
  states: string[]; // Some metros span multiple states
  averageHomePrice: number;
  medianHomePrice: number;
  priceMin: number;
  priceMax: number;
  priceRange25th: number;
  priceRange75th: number;
  closingCostAvg: number;
  stateTransferTax: number;
  zipCodes: string[]; // All zip codes in this metro area
}

export interface ZipCodePriceData {
  zipCode: string;
  metroCode: string;
  metroName: string;
  city: string;
  state: string;
  county?: string;
  averageHomePrice: number;
  medianHomePrice: number;
  priceMin: number;
  priceMax: number;
  priceRange25th: number;
  priceRange75th: number;
  homeCount?: number; // Number of homes sold/listed
  lastUpdated?: string; // Date of last data update
}

export interface MetroZipMapping {
  zipCode: string;
  metroCode: string;
  metroName: string;
  city: string;
  state: string;
  county?: string;
}

// ============================================================================
// DATA STORAGE
// ============================================================================

/**
 * Metro area data cache
 * In production, this would be loaded from an external API or database
 */
let metroDataCache: Record<string, MetroAreaData> = {};

/**
 * Zip code to price data cache
 * In production, this would be loaded from an external API or database
 */
let zipCodePriceCache: Record<string, ZipCodePriceData> = {};

/**
 * Zip code to metro mapping cache
 */
let zipToMetroCache: Record<string, MetroZipMapping> = {};

// ============================================================================
// DATA LOADING FUNCTIONS
// ============================================================================

/**
 * Load metro area data from external source
 * @param dataSource URL or path to data source (CSV, JSON, API endpoint)
 * @returns Promise that resolves when data is loaded
 */
export async function loadMetroDataFromSource(dataSource: string): Promise<void> {
  try {
    const response = await fetch(dataSource);
    
    if (!response.ok) {
      throw new Error(`Failed to load metro data: ${response.statusText}`);
    }

    // Determine data format and parse accordingly
    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      const data = await response.json();
      await parseAndStoreMetroData(data);
    } else if (contentType.includes('text/csv') || dataSource.endsWith('.csv')) {
      const csvText = await response.text();
      await parseCSVAndStoreMetroData(csvText);
    } else {
      // Try JSON first, fallback to CSV
      try {
        const data = await response.json();
        await parseAndStoreMetroData(data);
      } catch {
        const csvText = await response.text();
        await parseCSVAndStoreMetroData(csvText);
      }
    }
  } catch (error) {
    console.error('Error loading metro data:', error);
    // Fallback to default data
    loadDefaultMetroData();
  }
}

/**
 * Load zip code price data from external source
 * @param dataSource URL or path to data source
 * @returns Promise that resolves when data is loaded
 */
export async function loadZipCodePriceDataFromSource(dataSource: string): Promise<void> {
  try {
    const response = await fetch(dataSource);
    
    if (!response.ok) {
      throw new Error(`Failed to load zip code data: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      const data = await response.json();
      await parseAndStoreZipCodeData(data);
    } else if (contentType.includes('text/csv') || dataSource.endsWith('.csv')) {
      const csvText = await response.text();
      await parseCSVAndStoreZipCodeData(csvText);
    } else {
      try {
        const data = await response.json();
        await parseAndStoreZipCodeData(data);
      } catch {
        const csvText = await response.text();
        await parseCSVAndStoreZipCodeData(csvText);
      }
    }
  } catch (error) {
    console.error('Error loading zip code data:', error);
    // Fallback to default data
    loadDefaultZipCodeData();
  }
}

/**
 * Parse JSON metro data and store in cache
 * Expected JSON format:
 * {
 *   "metros": [
 *     {
 *       "metroCode": "NYC",
 *       "metroName": "New York-Newark-Jersey City, NY-NJ-PA",
 *       "state": "NY",
 *       "averageHomePrice": 750000,
 *       ...
 *     }
 *   ]
 * }
 */
async function parseAndStoreMetroData(data: any): Promise<void> {
  if (Array.isArray(data)) {
    // If data is directly an array
    data.forEach((metro: any) => {
      if (metro.metroCode) {
        metroDataCache[metro.metroCode] = normalizeMetroData(metro);
      }
    });
  } else if (data.metros && Array.isArray(data.metros)) {
    // If data has a "metros" key
    data.metros.forEach((metro: any) => {
      if (metro.metroCode) {
        metroDataCache[metro.metroCode] = normalizeMetroData(metro);
      }
    });
  } else if (data.data && Array.isArray(data.data)) {
    // If data has a "data" key
    data.data.forEach((metro: any) => {
      if (metro.metroCode) {
        metroDataCache[metro.metroCode] = normalizeMetroData(metro);
      }
    });
  }
}

/**
 * Parse CSV metro data and store in cache
 * Expected CSV format:
 * metroCode,metroName,state,averageHomePrice,medianHomePrice,priceMin,priceMax,...
 */
async function parseCSVAndStoreMetroData(csvText: string): Promise<void> {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length === 0) return;

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const metroCodeIndex = headers.indexOf('metrocode') !== -1 ? headers.indexOf('metrocode') : headers.indexOf('metro_code');
  const metroNameIndex = headers.indexOf('metroname') !== -1 ? headers.indexOf('metroname') : headers.indexOf('metro_name');
  const stateIndex = headers.indexOf('state');
  const avgPriceIndex = headers.findIndex(h => h.includes('average') || h.includes('avg'));
  const medianPriceIndex = headers.findIndex(h => h.includes('median'));

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length < headers.length) continue;

    const metroCode = values[metroCodeIndex];
    if (!metroCode) continue;

    const metro: Partial<MetroAreaData> = {
      metroCode,
      metroName: values[metroNameIndex] || metroCode,
      state: values[stateIndex] || '',
      states: values[stateIndex] ? [values[stateIndex]] : [],
      averageHomePrice: parseFloat(values[avgPriceIndex] || '0') || 0,
      medianHomePrice: parseFloat(values[medianPriceIndex] || '0') || 0,
      priceMin: 0,
      priceMax: 0,
      priceRange25th: 0,
      priceRange75th: 0,
      closingCostAvg: 0,
      stateTransferTax: 0,
      zipCodes: [],
    };

    metroDataCache[metroCode] = normalizeMetroData(metro);
  }
}

/**
 * Parse JSON zip code data and store in cache
 */
async function parseAndStoreZipCodeData(data: any): Promise<void> {
  if (Array.isArray(data)) {
    data.forEach((zip: any) => {
      if (zip.zipCode || zip.zip_code || zip.zip) {
        const zipCode = zip.zipCode || zip.zip_code || zip.zip;
        zipCodePriceCache[zipCode] = normalizeZipCodeData(zip);
        
        // Also update zip to metro mapping
        if (zip.metroCode || zip.metro_code) {
          zipToMetroCache[zipCode] = {
            zipCode,
            metroCode: zip.metroCode || zip.metro_code || '',
            metroName: zip.metroName || zip.metro_name || '',
            city: zip.city || '',
            state: zip.state || '',
            county: zip.county,
          };
        }
      }
    });
  } else if (data.zipCodes && Array.isArray(data.zipCodes)) {
    data.zipCodes.forEach((zip: any) => {
      if (zip.zipCode || zip.zip_code || zip.zip) {
        const zipCode = zip.zipCode || zip.zip_code || zip.zip;
        zipCodePriceCache[zipCode] = normalizeZipCodeData(zip);
      }
    });
  }
}

/**
 * Parse CSV zip code data and store in cache
 */
async function parseCSVAndStoreZipCodeData(csvText: string): Promise<void> {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length === 0) return;

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const zipCodeIndex = headers.findIndex(h => h.includes('zip'));
  const metroCodeIndex = headers.findIndex(h => h.includes('metro'));
  const cityIndex = headers.indexOf('city');
  const stateIndex = headers.indexOf('state');
  const avgPriceIndex = headers.findIndex(h => h.includes('average') || h.includes('avg'));
  const medianPriceIndex = headers.findIndex(h => h.includes('median'));

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length < headers.length) continue;

    const zipCode = values[zipCodeIndex];
    if (!zipCode) continue;

    const zip: Partial<ZipCodePriceData> = {
      zipCode,
      metroCode: values[metroCodeIndex] || '',
      metroName: '',
      city: values[cityIndex] || '',
      state: values[stateIndex] || '',
      averageHomePrice: parseFloat(values[avgPriceIndex] || '0') || 0,
      medianHomePrice: parseFloat(values[medianPriceIndex] || '0') || 0,
      priceMin: 0,
      priceMax: 0,
      priceRange25th: 0,
      priceRange75th: 0,
    };

    zipCodePriceCache[zipCode] = normalizeZipCodeData(zip);

    if (values[metroCodeIndex]) {
      zipToMetroCache[zipCode] = {
        zipCode,
        metroCode: values[metroCodeIndex],
        metroName: '',
        city: values[cityIndex] || '',
        state: values[stateIndex] || '',
      };
    }
  }
}

/**
 * Normalize metro data to ensure all required fields are present
 */
function normalizeMetroData(data: Partial<MetroAreaData>): MetroAreaData {
  return {
    metroCode: data.metroCode || '',
    metroName: data.metroName || data.metroCode || '',
    state: data.state || '',
    states: data.states || (data.state ? [data.state] : []),
    averageHomePrice: data.averageHomePrice || data.medianHomePrice || 400000,
    medianHomePrice: data.medianHomePrice || data.averageHomePrice || 400000,
    priceMin: data.priceMin || (data.medianHomePrice || 400000) * 0.6,
    priceMax: data.priceMax || (data.medianHomePrice || 400000) * 1.5,
    priceRange25th: data.priceRange25th || (data.medianHomePrice || 400000) * 0.75,
    priceRange75th: data.priceRange75th || (data.medianHomePrice || 400000) * 1.25,
    closingCostAvg: data.closingCostAvg || (data.medianHomePrice || 400000) * 0.03,
    stateTransferTax: data.stateTransferTax || 0.001,
    zipCodes: data.zipCodes || [],
  };
}

/**
 * Normalize zip code data to ensure all required fields are present
 */
function normalizeZipCodeData(data: Partial<ZipCodePriceData>): ZipCodePriceData {
  const avgPrice = data.averageHomePrice || data.medianHomePrice || 400000;
  return {
    zipCode: data.zipCode || '',
    metroCode: data.metroCode || '',
    metroName: data.metroName || '',
    city: data.city || '',
    state: data.state || '',
    county: data.county,
    averageHomePrice: avgPrice,
    medianHomePrice: data.medianHomePrice || avgPrice,
    priceMin: data.priceMin || avgPrice * 0.6,
    priceMax: data.priceMax || avgPrice * 1.5,
    priceRange25th: data.priceRange25th || avgPrice * 0.75,
    priceRange75th: data.priceRange75th || avgPrice * 1.25,
    homeCount: data.homeCount,
    lastUpdated: data.lastUpdated,
  };
}

// ============================================================================
// DEFAULT DATA (Fallback when external source is unavailable)
// ============================================================================

/**
 * Load default metro area data as fallback
 * This provides basic coverage for major metro areas
 */
function loadDefaultMetroData(): void {
  // This will be populated with comprehensive default data
  // For now, keeping minimal to allow external data to take precedence
}

/**
 * Load default zip code data as fallback
 */
function loadDefaultZipCodeData(): void {
  // This will be populated with comprehensive default data
}

// ============================================================================
// GETTER FUNCTIONS
// ============================================================================

/**
 * Get metro area data by metro code
 */
export function getMetroData(metroCode: string): MetroAreaData | null {
  return metroDataCache[metroCode] || null;
}

/**
 * Get zip code price data
 */
export function getZipCodePriceData(zipCode: string): ZipCodePriceData | null {
  return zipCodePriceCache[zipCode] || null;
}

/**
 * Get metro area for a zip code
 */
export function getMetroForZipCode(zipCode: string): MetroZipMapping | null {
  return zipToMetroCache[zipCode] || null;
}

/**
 * Get all zip codes for a metro area
 */
export function getZipCodesForMetro(metroCode: string): string[] {
  const metro = metroDataCache[metroCode];
  return metro?.zipCodes || [];
}

/**
 * Get average home price by zip code
 */
export function getAverageHomePriceByZip(zipCode: string): number | null {
  const zipData = zipCodePriceCache[zipCode];
  return zipData?.averageHomePrice || null;
}

/**
 * Get price range for zip code
 */
export function getPriceRangeByZip(zipCode: string): { min: number; max: number; median: number } | null {
  const zipData = zipCodePriceCache[zipCode];
  if (!zipData) return null;
  
  return {
    min: zipData.priceMin,
    max: zipData.priceMax,
    median: zipData.medianHomePrice,
  };
}

/**
 * Initialize data from external sources
 * Call this on app startup or when data needs to be refreshed
 */
export async function initializeMetroZipData(
  metroDataSource?: string,
  zipCodeDataSource?: string
): Promise<void> {
  if (metroDataSource) {
    await loadMetroDataFromSource(metroDataSource);
  }
  
  if (zipCodeDataSource) {
    await loadZipCodePriceDataFromSource(zipCodeDataSource);
  }
  
  // If no sources provided, load defaults
  if (!metroDataSource && !zipCodeDataSource) {
    loadDefaultMetroData();
    loadDefaultZipCodeData();
  }
}


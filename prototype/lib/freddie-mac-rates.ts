/**
 * Freddie Mac Mortgage Rate Data Fetcher
 * Fetches the most recent mortgage rates from Freddie Mac's Primary Mortgage Market Survey (PMMS)
 * 
 * PMMS data source: https://www.freddiemac.com/pmms
 * PMMS is published weekly on Thursdays at 12 p.m. ET
 * Data is based on actual loan applications submitted to Freddie Mac through Loan Product Advisor (LPA)
 */

export interface FreddieMacRateData {
  date: string;
  rate30Year: number; // 30-year fixed rate from PMMS
  rate15Year: number; // 15-year fixed rate from PMMS
  points30Year: number;
  points15Year: number;
  source: 'freddie-mac-pmms' | 'fallback';
}

interface FredSeriesPoint {
  date: string;
  valueDecimal: number;
}

async function fetchLatestFredCsvPoint(seriesId: 'MORTGAGE30US' | 'MORTGAGE15US'): Promise<FredSeriesPoint> {
  const response = await fetch(`https://fred.stlouisfed.org/graph/fredgraph.csv?id=${seriesId}`, {
    method: 'GET',
    headers: { Accept: 'text/csv' },
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error(`FRED CSV request failed for ${seriesId}: ${response.status}`);
  }
  const csv = await response.text();
  const rows = csv
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  for (let i = rows.length - 1; i >= 1; i -= 1) {
    const [dateRaw, valueRaw] = rows[i].split(',');
    if (!dateRaw || !valueRaw || valueRaw === '.') continue;
    const parsed = Number(valueRaw);
    if (!Number.isFinite(parsed)) continue;
    return { date: dateRaw, valueDecimal: parsed / 100 };
  }
  throw new Error(`No valid CSV observation found for ${seriesId}`);
}

/**
 * Fetch the most recent mortgage rates from Freddie Mac PMMS
 * Uses FRED API which provides Freddie Mac PMMS data:
 * - MORTGAGE30US: 30-Year Fixed Rate Mortgage Average (PMMS)
 * - MORTGAGE15US: 15-Year Fixed Rate Mortgage Average (PMMS)
 * 
 * Reference: https://www.freddiemac.com/pmms
 */
export async function fetchFreddieMacRates(): Promise<FreddieMacRateData | null> {
  try {
    // Server/runtime-safe path: fetch latest PMMS data directly from FRED CSV.
    if (typeof window === 'undefined') {
      const [rate30, rate15] = await Promise.all([
        fetchLatestFredCsvPoint('MORTGAGE30US'),
        fetchLatestFredCsvPoint('MORTGAGE15US'),
      ]);
      return {
        date: rate30.date > rate15.date ? rate30.date : rate15.date,
        rate30Year: rate30.valueDecimal,
        rate15Year: rate15.valueDecimal,
        points30Year: 0.6,
        points15Year: 0.6,
        source: 'freddie-mac-pmms',
      };
    }

    // Prefer server-side endpoint that reads latest Freddie Mac PMMS weekly data.
    // This avoids client-side feed/CORS/network inconsistencies.
    const response = await fetch('/api/market/freddie-mac-rates', {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (response.ok) {
      const data = (await response.json()) as Partial<FreddieMacRateData>;
      if (
        data &&
        typeof data.date === 'string' &&
        typeof data.rate30Year === 'number' &&
        typeof data.rate15Year === 'number'
      ) {
        return {
          date: data.date,
          rate30Year: data.rate30Year,
          rate15Year: data.rate15Year,
          points30Year: typeof data.points30Year === 'number' ? data.points30Year : 0.6,
          points15Year: typeof data.points15Year === 'number' ? data.points15Year : 0.6,
          source: 'freddie-mac-pmms',
        };
      }
    }
  } catch (error) {
    console.warn('Failed to fetch latest Freddie Mac PMMS rates:', error);
  }

  // Fallback: Use current PMMS rates from website
  // Updated as of 12/31/2025 from https://www.freddiemac.com/pmms
  return getFallbackRates();
}

/**
 * Get fallback rates based on latest Freddie Mac PMMS data
 * These should be updated weekly when new PMMS data is published (Thursdays at 12 p.m. ET)
 * 
 * Current rates as of 12/31/2025 from https://www.freddiemac.com/pmms:
 * - 30-year fixed-rate mortgage: 6.15%
 * - 15-year fixed-rate mortgage: 5.44%
 */
function getFallbackRates(): FreddieMacRateData {
  // Latest PMMS rates from https://www.freddiemac.com/pmms
  // Update these weekly when new PMMS data is published
  const lastVerifiedPmmsDate = '2025-12-31';
  
  return {
    date: lastVerifiedPmmsDate,
    rate30Year: 0.0615, // 6.15% - PMMS 30-year fixed-rate mortgage as of 12/31/2025
    rate15Year: 0.0544, // 5.44% - PMMS 15-year fixed-rate mortgage as of 12/31/2025
    points30Year: 0.6, // PMMS no longer publishes points, using typical value
    points15Year: 0.6,
    source: 'fallback',
  };
}

/**
 * Get cached rates with automatic refresh
 * Caches rates for 24 hours to avoid excessive API calls
 */
let cachedRates: FreddieMacRateData | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Sync snapshot getter for callers that cannot await.
 * Returns cached PMMS data if available, otherwise fallback PMMS values.
 */
export function getFreddieMacRatesSnapshot(): FreddieMacRateData {
  return cachedRates ?? getFallbackRates();
}

export async function getCachedFreddieMacRates(): Promise<FreddieMacRateData> {
  const now = Date.now();
  
  // Return cached rates if still valid
  if (cachedRates && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedRates;
  }
  
  // Fetch new rates
  const rates = await fetchFreddieMacRates();
  if (rates) {
    cachedRates = rates;
    cacheTimestamp = now;
    return rates;
  }
  
  // If fetch failed, return fallback
  return getFallbackRates();
}

/**
 * Best-effort background refresh for UI flows using sync rate helpers.
 * Safe to call repeatedly; refreshes cache when stale.
 */
export function refreshFreddieMacRatesInBackground(): void {
  void getCachedFreddieMacRates().catch(() => {
    // Ignore background refresh failures and keep fallback/cached values.
  });
}

/**
 * Get base mortgage rate adjusted for credit score
 * Uses Freddie Mac average as baseline, then adjusts based on credit score
 */
export async function getAdjustedRateForCreditScore(
  creditScore: CreditScoreRange,
  loanTerm: 15 | 30 = 30
): Promise<number> {
  const freddieMacRates = await getCachedFreddieMacRates();
  const baseRate = loanTerm === 15 ? freddieMacRates.rate15Year : freddieMacRates.rate30Year;
  
  // Credit score adjustments (typical lender adjustments)
  const creditAdjustments: Record<CreditScoreRange, number> = {
    'under-600': 0.025,  // +2.5% for poor credit
    '600-650': 0.015,   // +1.5% for fair credit
    '650-700': 0.010,   // +1.0% for good credit
    '700-750': 0.005,   // +0.5% for very good credit
    '750+': 0.000,      // No adjustment for excellent credit
  };
  
  return baseRate + creditAdjustments[creditScore];
}

// Re-export type for use in other files
export type CreditScoreRange = 'under-600' | '600-650' | '650-700' | '700-750' | '750+';


/**
 * Financial calculation library for homebuyer's compass
 * All calculations for affordability, costs, and savings opportunities
 */

import { getFreddieMacRatesSnapshot, refreshFreddieMacRatesInBackground } from './freddie-mac-rates';

// ============================================================================
// TYPES
// ============================================================================

export type CreditScoreRange = 'under-600' | '600-650' | '650-700' | '700-750' | '750+';
export type Timeline = '3-months' | '6-months' | '1-year' | 'exploring';
export type AgentStatus = 'have-agent' | 'interviewing' | 'not-yet' | 'solo';
export type Concern = 'affording' | 'hidden-costs' | 'ripped-off' | 'wrong-choice' | 'timing' | 'other';

export interface QuizData {
  income: number;
  monthlyDebt: number;
  downPayment: number;
  city: string;
  /** When the user chose ZIP in the quiz, persisted for county-level ACS (e.g. HOA). */
  zipCode?: string;
  timeline: Timeline;
  creditScore: CreditScoreRange;
  agentStatus: AgentStatus;
  concern: Concern;
  targetHomePrice?: number; // User-supplied target purchase price
}

export interface AffordabilityResult {
  maxApproved: number; // What lender will approve (dangerous)
  realisticMax: number; // What you should actually spend
  realisticMin: number; // Lower end of comfortable range
  monthlyPayment: number; // PITI + PMI
  interestRate: number; // Based on credit score
  loanAmount: number; // After down payment
  pmiMonthly: number; // PMI if <20% down
  downPaymentPercent: number;
  // Target price derived fields (populated when targetHomePrice is provided)
  targetHomePrice?: number;
  targetLoanAmount?: number;
  targetLTV?: number;           // 0-100, loan / targetHomePrice
  targetPMIMonthly?: number;
  targetMonthlyPayment?: number;
  targetAffordable?: boolean;   // true if targetHomePrice <= maxApproved
  targetComfortable?: boolean;  // true if targetHomePrice <= realisticMax
}

/**
 * Monthly housing cost lines aligned with snapshot affordability (same assumptions as `calculateAffordability`).
 * Uses **target home price** when `targetHomePrice` is set; otherwise the **comfortable max** (`realisticMax`).
 * Used for the NQ roadmap “budget sketch” editor (PITI + HOA + maintenance reserve).
 */
export interface ComfortMonthlyBudgetLines {
  /** Home price basis for taxes, insurance, maintenance %, and loan (target when set, else `realisticMax`). */
  homePriceBasis: number
  /** Projected annual note rate (PMMS snapshot + credit band), same as `getInterestRate(quiz.creditScore)`. */
  mortgageRateAnnual: number
  /** 30-year fixed payment on `max(0, homePriceBasis - downPayment)` at `mortgageRateAnnual`. */
  principalAndInterest: number
  propertyTaxMonthly: number
  homeownersInsuranceMonthly: number
  pmiMonthly: number
  hoaMonthly: number
  /** ~1% of price annually ÷ 12 (editable rule-of-thumb). */
  maintenanceReserveMonthly: number
}

export function getComfortMonthlyBudgetLines(
  data: QuizData,
  affordability: AffordabilityResult
): ComfortMonthlyBudgetLines {
  const fromTarget =
    data.targetHomePrice != null && data.targetHomePrice > 0 ? data.targetHomePrice : null
  const price = fromTarget ?? Math.max(0, affordability.realisticMax)
  const loan = Math.max(0, price - data.downPayment)
  const downPct = price > 0 ? (data.downPayment / price) * 100 : 0
  const projectedRate = getInterestRate(data.creditScore)
  const principalAndInterest =
    loan > 0 ? calculateMonthlyPayment(loan, projectedRate, 30) : 0
  const propertyTaxMonthly = (price * 0.015) / 12
  const homeownersInsuranceMonthly = (price * 0.003) / 12
  const pmiMonthly = calculatePMI(loan, downPct)
  return {
    homePriceBasis: price,
    mortgageRateAnnual: projectedRate,
    principalAndInterest,
    propertyTaxMonthly,
    homeownersInsuranceMonthly,
    pmiMonthly,
    hoaMonthly: 0,
    maintenanceReserveMonthly: (price * 0.01) / 12,
  }
}

export interface ReadinessScore {
  total: number; // 0-100
  breakdown: {
    creditScore: number; // max 30 points
    dtiRatio: number; // max 25 points
    downPayment: number; // max 25 points
    timeline: number; // max 10 points
    savingsBuffer: number; // max 10 points
  };
  interpretation: string; // Text based on score
}

export interface ActionItem {
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string; // Dollar impact or benefit
  timeframe: string; // How long to complete
  category: 'credit' | 'debt' | 'savings' | 'education' | 'negotiation';
}

export interface CostBreakdown {
  purchasePrice: number;
  downPayment: number;
  loanAmount: number;

  closingCosts: {
    total: number;
    lenderFees: {
      origination: number;
      applicationFee: number;
      creditReport: number;
      points: number;
      total: number;
    };
    titleAndSettlement: {
      titleInsurance: number;
      settlementFee: number;
      titleSearch: number;
      total: number;
    };
    governmentFees: {
      recordingFees: number;
      transferTaxes: number;
      total: number;
    };
    prepaidCosts: {
      homeownersInsurance: number;
      propertyTaxes: number;
      prepaidInterest: number;
      total: number;
    };
    otherServices: {
      appraisal: number;
      inspection: number;
      survey: number;
      total: number;
    };
  };

  monthlyPayment: {
    total: number;
    principalAndInterest: number;
    propertyTaxes: number;
    homeownersInsurance: number;
    pmi: number;
    hoa: number;
    maintenanceReserve: number;
  };

  lifetimeCosts: {
    totalInterest: number;
    totalPrincipal: number;
    totalPaid: number;
    vsOriginalPrice: number; // How much more than purchase price
  };
}

export interface SavingsOpportunity {
  id: string;
  title: string;
  description: string;
  savingsMin: number;
  savingsMax: number;
  difficulty: 'easy' | 'medium' | 'hard';
  priority: number; // 1 = highest priority
  actionSteps: string[];
  category: string;
}

export interface CityData {
  medianPrice: number;
  closingCostAvg: number;
  stateTransferTax: number;
  priceMin: number;
  priceMax: number;
}

export interface ZipCodeData {
  zipCode: string;
  averageHomePrice: number;
  city: string;
  state: string;
}

export interface ZipCodeInsuranceData {
  zipCode: string;
  annualInsuranceCost: number; // Annual cost for $300k home (baseline)
  insuranceRate: number; // Rate per $1000 of home value
  riskLevel: 'low' | 'medium' | 'high' | 'very-high';
  city: string;
  state: string;
}

export interface ZipCodeClosingCostsData {
  zipCode: string;
  censusTract?: string; // Optional census tract for more granular data
  city: string;
  state: string;
  county?: string;
  
  // Component breakdowns (based on HMDA patterns and market data)
  lenderFees: {
    originationFeePercent: number; // % of loan amount (typically 0.5-1.5%)
    applicationFee: number; // Flat fee (often $0, sometimes $200-500)
    creditReportFee: number; // Typically $25-50
    pointsAverage: number; // Average points paid (0-2 points)
  };
  
  titleAndSettlement: {
    titleInsuranceRate: number; // Rate per $1000 of home value (varies by state regulation)
    settlementFee: number; // Flat fee (typically $200-800, negotiable)
    titleSearchFee: number; // Flat fee (typically $100-300)
  };
  
  governmentFees: {
    recordingFee: number; // Flat fee per document (varies by county)
    transferTaxRate: number; // % of purchase price (varies by state/county)
    transferTaxFlat?: number; // Some areas have flat transfer taxes
  };
  
  otherServices: {
    appraisalFee: number; // Typically $300-600, varies by home value
    inspectionFee: number; // Typically $300-500
    surveyFee: number; // Typically $400-800, may not be required
  };
  
  // Market averages (for comparison)
  averageClosingCostPercent: number; // % of purchase price (typically 2-5%)
  averageTotalClosingCosts: number; // For $300k home baseline
  marketCompetition: 'high' | 'medium' | 'low'; // Affects lender fee negotiation
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate monthly mortgage payment using standard formula
 * M = P[r(1+r)^n]/[(1+r)^n-1]
 */
export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  years: number = 30
): number {
  const monthlyRate = annualRate / 12;
  const numPayments = years * 12;
  
  if (monthlyRate === 0) {
    return principal / numPayments;
  }
  
  const numerator = monthlyRate * Math.pow(1 + monthlyRate, numPayments);
  const denominator = Math.pow(1 + monthlyRate, numPayments) - 1;
  
  return principal * (numerator / denominator);
}

/**
 * Calculate PMI monthly payment
 * Only applies if down payment < 20%
 * Typically 0.5-1% of loan amount annually, use 0.75% average
 */
export function calculatePMI(loanAmount: number, downPaymentPercent: number): number {
  if (downPaymentPercent >= 20) {
    return 0;
  }
  // 0.75% of loan amount annually, divided by 12 for monthly
  return (loanAmount * 0.0075) / 12;
}

/**
 * Format number as US currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calculate debt-to-income ratio as percentage
 */
export function calculateDTI(monthlyDebt: number, monthlyIncome: number): number {
  if (monthlyIncome === 0) return 0;
  return (monthlyDebt / monthlyIncome) * 100;
}

/**
 * Get interest rate based on credit score range
 * 
 * Base rates are from Freddie Mac Primary Mortgage Market Survey (PMMS)
 * Source: https://www.freddiemac.com/pmms
 * 
 * Base rate reflects competitive rates for well-qualified buyers
 * Credit score adjustments are applied on top of the base rate
 * 
 * Note: PMMS rates are updated weekly on Thursdays at 12 p.m. ET
 * These rates should be updated based on the latest PMMS data
 */
export function getInterestRate(creditScore: CreditScoreRange): number {
  // Trigger a best-effort background refresh so sync callers gradually
  // converge to latest Freddie Mac PMMS weekly data.
  refreshFreddieMacRatesInBackground();
  // Base rate for well-qualified buyers (30-year fixed) from PMMS snapshot.
  const pmmsBaseRate = getFreddieMacRatesSnapshot().rate30Year;
  
  // Credit score adjustments (typical spreads from base rate)
  // These spreads reflect typical market pricing based on credit score
  const creditAdjustments: Record<CreditScoreRange, number> = {
    '750+': 0,           // Best rate (base rate: 5.5%)
    '700-750': 0.005,   // +0.5% from base (6.0%)
    '650-700': 0.010,   // +1.0% from base (6.5%)
    '600-650': 0.015,   // +1.5% from base (7.0%)
    'under-600': 0.025, // +2.5% from base (8.0%) - may not qualify for conventional
  };
  
  return pmmsBaseRate + creditAdjustments[creditScore];
}

// ============================================================================
// CITY DATA (Hardcoded for MVP)
// ============================================================================

const CITY_DATA: Record<string, CityData> = {
  'Austin': { medianPrice: 550000, closingCostAvg: 16500, stateTransferTax: 0, priceMin: 350000, priceMax: 750000 },
  'Boston': { medianPrice: 650000, closingCostAvg: 19500, stateTransferTax: 0.002, priceMin: 450000, priceMax: 850000 },
  'Charlotte': { medianPrice: 380000, closingCostAvg: 11400, stateTransferTax: 0.002, priceMin: 250000, priceMax: 500000 },
  'Chicago': { medianPrice: 320000, closingCostAvg: 9600, stateTransferTax: 0.001, priceMin: 200000, priceMax: 450000 },
  'Columbus': { medianPrice: 250000, closingCostAvg: 7500, stateTransferTax: 0.001, priceMin: 150000, priceMax: 350000 },
  'Dallas': { medianPrice: 420000, closingCostAvg: 12600, stateTransferTax: 0, priceMin: 280000, priceMax: 550000 },
  'Denver': { medianPrice: 580000, closingCostAvg: 17400, stateTransferTax: 0, priceMin: 400000, priceMax: 750000 },
  'Houston': { medianPrice: 300000, closingCostAvg: 9000, stateTransferTax: 0, priceMin: 200000, priceMax: 400000 },
  'Indianapolis': { medianPrice: 240000, closingCostAvg: 7200, stateTransferTax: 0.001, priceMin: 150000, priceMax: 330000 },
  'Jacksonville': { medianPrice: 320000, closingCostAvg: 9600, stateTransferTax: 0.007, priceMin: 200000, priceMax: 450000 },
  'Kansas City': { medianPrice: 220000, closingCostAvg: 6600, stateTransferTax: 0.001, priceMin: 140000, priceMax: 300000 },
  'Las Vegas': { medianPrice: 450000, closingCostAvg: 13500, stateTransferTax: 0, priceMin: 300000, priceMax: 600000 },
  'Los Angeles': { medianPrice: 850000, closingCostAvg: 25500, stateTransferTax: 0.0011, priceMin: 600000, priceMax: 1200000 },
  'Memphis': { medianPrice: 200000, closingCostAvg: 6000, stateTransferTax: 0.0037, priceMin: 120000, priceMax: 280000 },
  'Miami': { medianPrice: 480000, closingCostAvg: 14400, stateTransferTax: 0.007, priceMin: 320000, priceMax: 650000 },
  'Milwaukee': { medianPrice: 240000, closingCostAvg: 7200, stateTransferTax: 0.001, priceMin: 150000, priceMax: 330000 },
  'Minneapolis': { medianPrice: 350000, closingCostAvg: 10500, stateTransferTax: 0.001, priceMin: 230000, priceMax: 470000 },
  'Nashville': { medianPrice: 420000, closingCostAvg: 12600, stateTransferTax: 0.0037, priceMin: 280000, priceMax: 550000 },
  'New York': { medianPrice: 750000, closingCostAvg: 22500, stateTransferTax: 0.004, priceMin: 500000, priceMax: 1000000 },
  'Oklahoma City': { medianPrice: 200000, closingCostAvg: 6000, stateTransferTax: 0, priceMin: 130000, priceMax: 270000 },
  'Orlando': { medianPrice: 380000, closingCostAvg: 11400, stateTransferTax: 0.007, priceMin: 250000, priceMax: 500000 },
  'Philadelphia': { medianPrice: 280000, closingCostAvg: 8400, stateTransferTax: 0.01, priceMin: 180000, priceMax: 380000 },
  'Phoenix': { medianPrice: 450000, closingCostAvg: 13500, stateTransferTax: 0, priceMin: 300000, priceMax: 600000 },
  'Portland': { medianPrice: 550000, closingCostAvg: 16500, stateTransferTax: 0, priceMin: 370000, priceMax: 730000 },
  'Raleigh': { medianPrice: 400000, closingCostAvg: 12000, stateTransferTax: 0.002, priceMin: 270000, priceMax: 530000 },
  'Sacramento': { medianPrice: 520000, closingCostAvg: 15600, stateTransferTax: 0.0011, priceMin: 350000, priceMax: 690000 },
  'San Antonio': { medianPrice: 280000, closingCostAvg: 8400, stateTransferTax: 0, priceMin: 190000, priceMax: 370000 },
  'San Diego': { medianPrice: 850000, closingCostAvg: 25500, stateTransferTax: 0.0011, priceMin: 600000, priceMax: 1100000 },
  'San Francisco': { medianPrice: 1400000, closingCostAvg: 42000, stateTransferTax: 0.0011, priceMin: 1000000, priceMax: 1800000 },
  'San Jose': { medianPrice: 1300000, closingCostAvg: 39000, stateTransferTax: 0.0011, priceMin: 900000, priceMax: 1700000 },
  'Seattle': { medianPrice: 750000, closingCostAvg: 22500, stateTransferTax: 0, priceMin: 500000, priceMax: 1000000 },
  'Tampa': { medianPrice: 380000, closingCostAvg: 11400, stateTransferTax: 0.007, priceMin: 250000, priceMax: 500000 },
  'Washington DC': { medianPrice: 600000, closingCostAvg: 18000, stateTransferTax: 0.01, priceMin: 400000, priceMax: 800000 },
};

/**
 * Get city data (median price, closing costs, etc.)
 * Uses Zillow ZHVI data for median price when available
 */
export function getCityData(city: string): CityData {
  const defaultData: CityData = {
    medianPrice: 400000,
    closingCostAvg: 12000,
    stateTransferTax: 0.001,
    priceMin: 250000,
    priceMax: 550000,
  };
  
  return CITY_DATA[city] || defaultData;
}

/**
 * Get city data with Zillow ZHVI integration (async)
 * Fetches latest home price data from Zillow Research Data
 */
export async function getCityDataWithZillow(city: string): Promise<CityData> {
  const baseData = getCityData(city)
  
  try {
    // Import Zillow utilities
    const { getAverageHomePrice, mapCityToZillowMetro } = await import('./zillow-data')
    const zillowPrice = await getAverageHomePrice(city, 'city')
    
    if (zillowPrice && zillowPrice > 0) {
      // Update median price with Zillow data
      return {
        ...baseData,
        medianPrice: Math.round(zillowPrice),
        priceMin: Math.round(zillowPrice * 0.6), // 60% of median
        priceMax: Math.round(zillowPrice * 1.4), // 140% of median
      }
    }
  } catch (error) {
    console.error(`Error fetching Zillow data for city ${city}:`, error)
  }
  
  // Fallback to base data if Zillow fetch fails
  return baseData
}

// ============================================================================
// ZIP CODE DATA (Zillow/Redfin-style average home prices by zip code)
// ============================================================================

/**
 * Zip code to average home price mapping
 * In production, this would be fetched from Zillow/Redfin APIs
 * For MVP, we'll use representative zip codes for major cities
 */
const ZIP_CODE_DATA: Record<string, ZipCodeData> = {
  // Austin, TX
  '78701': { zipCode: '78701', averageHomePrice: 650000, city: 'Austin', state: 'TX' },
  '78702': { zipCode: '78702', averageHomePrice: 580000, city: 'Austin', state: 'TX' },
  '78703': { zipCode: '78703', averageHomePrice: 1200000, city: 'Austin', state: 'TX' },
  '78704': { zipCode: '78704', averageHomePrice: 750000, city: 'Austin', state: 'TX' },
  '78705': { zipCode: '78705', averageHomePrice: 550000, city: 'Austin', state: 'TX' },
  // Los Angeles, CA
  '90001': { zipCode: '90001', averageHomePrice: 650000, city: 'Los Angeles', state: 'CA' },
  '90002': { zipCode: '90002', averageHomePrice: 580000, city: 'Los Angeles', state: 'CA' },
  '90024': { zipCode: '90024', averageHomePrice: 1800000, city: 'Los Angeles', state: 'CA' },
  '90025': { zipCode: '90025', averageHomePrice: 1200000, city: 'Los Angeles', state: 'CA' },
  '90028': { zipCode: '90028', averageHomePrice: 750000, city: 'Los Angeles', state: 'CA' },
  // New York, NY
  '10001': { zipCode: '10001', averageHomePrice: 850000, city: 'New York', state: 'NY' },
  '10002': { zipCode: '10002', averageHomePrice: 1200000, city: 'New York', state: 'NY' },
  '10003': { zipCode: '10003', averageHomePrice: 1500000, city: 'New York', state: 'NY' },
  '10011': { zipCode: '10011', averageHomePrice: 1800000, city: 'New York', state: 'NY' },
  '10012': { zipCode: '10012', averageHomePrice: 2200000, city: 'New York', state: 'NY' },
  // Chicago, IL
  '60601': { zipCode: '60601', averageHomePrice: 450000, city: 'Chicago', state: 'IL' },
  '60602': { zipCode: '60602', averageHomePrice: 380000, city: 'Chicago', state: 'IL' },
  '60614': { zipCode: '60614', averageHomePrice: 650000, city: 'Chicago', state: 'IL' },
  '60622': { zipCode: '60622', averageHomePrice: 550000, city: 'Chicago', state: 'IL' },
  '60657': { zipCode: '60657', averageHomePrice: 750000, city: 'Chicago', state: 'IL' },
  // Dallas, TX
  '75201': { zipCode: '75201', averageHomePrice: 450000, city: 'Dallas', state: 'TX' },
  '75202': { zipCode: '75202', averageHomePrice: 380000, city: 'Dallas', state: 'TX' },
  '75204': { zipCode: '75204', averageHomePrice: 650000, city: 'Dallas', state: 'TX' },
  '75205': { zipCode: '75205', averageHomePrice: 850000, city: 'Dallas', state: 'TX' },
  '75209': { zipCode: '75209', averageHomePrice: 550000, city: 'Dallas', state: 'TX' },
  // Miami, FL
  '33101': { zipCode: '33101', averageHomePrice: 550000, city: 'Miami', state: 'FL' },
  '33109': { zipCode: '33109', averageHomePrice: 2800000, city: 'Miami', state: 'FL' },
  '33130': { zipCode: '33130', averageHomePrice: 650000, city: 'Miami', state: 'FL' },
  '33131': { zipCode: '33131', averageHomePrice: 750000, city: 'Miami', state: 'FL' },
  '33139': { zipCode: '33139', averageHomePrice: 1200000, city: 'Miami', state: 'FL' },
  // Seattle, WA
  '98101': { zipCode: '98101', averageHomePrice: 850000, city: 'Seattle', state: 'WA' },
  '98102': { zipCode: '98102', averageHomePrice: 950000, city: 'Seattle', state: 'WA' },
  '98103': { zipCode: '98103', averageHomePrice: 850000, city: 'Seattle', state: 'WA' },
  '98109': { zipCode: '98109', averageHomePrice: 1200000, city: 'Seattle', state: 'WA' },
  '98112': { zipCode: '98112', averageHomePrice: 1100000, city: 'Seattle', state: 'WA' },
  // San Francisco, CA
  '94102': { zipCode: '94102', averageHomePrice: 1200000, city: 'San Francisco', state: 'CA' },
  '94103': { zipCode: '94103', averageHomePrice: 1400000, city: 'San Francisco', state: 'CA' },
  '94109': { zipCode: '94109', averageHomePrice: 1100000, city: 'San Francisco', state: 'CA' },
  '94110': { zipCode: '94110', averageHomePrice: 1500000, city: 'San Francisco', state: 'CA' },
  '94117': { zipCode: '94117', averageHomePrice: 1800000, city: 'San Francisco', state: 'CA' },
  // Denver, CO
  '80202': { zipCode: '80202', averageHomePrice: 650000, city: 'Denver', state: 'CO' },
  '80203': { zipCode: '80203', averageHomePrice: 750000, city: 'Denver', state: 'CO' },
  '80205': { zipCode: '80205', averageHomePrice: 550000, city: 'Denver', state: 'CO' },
  '80206': { zipCode: '80206', averageHomePrice: 850000, city: 'Denver', state: 'CO' },
  '80211': { zipCode: '80211', averageHomePrice: 650000, city: 'Denver', state: 'CO' },
  // Phoenix, AZ
  '85001': { zipCode: '85001', averageHomePrice: 450000, city: 'Phoenix', state: 'AZ' },
  '85003': { zipCode: '85003', averageHomePrice: 380000, city: 'Phoenix', state: 'AZ' },
  '85004': { zipCode: '85004', averageHomePrice: 550000, city: 'Phoenix', state: 'AZ' },
  '85006': { zipCode: '85006', averageHomePrice: 650000, city: 'Phoenix', state: 'AZ' },
  '85008': { zipCode: '85008', averageHomePrice: 750000, city: 'Phoenix', state: 'AZ' },
  // Boston, MA
  '02101': { zipCode: '02101', averageHomePrice: 850000, city: 'Boston', state: 'MA' },
  '02108': { zipCode: '02108', averageHomePrice: 1200000, city: 'Boston', state: 'MA' },
  '02109': { zipCode: '02109', averageHomePrice: 950000, city: 'Boston', state: 'MA' },
  '02110': { zipCode: '02110', averageHomePrice: 1100000, city: 'Boston', state: 'MA' },
  '02111': { zipCode: '02111', averageHomePrice: 750000, city: 'Boston', state: 'MA' },
};

/**
 * Get average home price by zip code
 * In production, this would fetch from Zillow/Redfin APIs or metro-zip-data system
 */
export function getAverageHomePriceByZip(zipCode: string): number | null {
  // Check if zip code is in our data
  if (ZIP_CODE_DATA[zipCode]) {
    return ZIP_CODE_DATA[zipCode].averageHomePrice;
  }
  
  // If not found, try to infer from city data
  // Extract first 3 digits to get approximate region
  const zipPrefix = zipCode.substring(0, 3);
  
  // Fallback: return null to indicate data not available
  // In production, would make API call here
  // Note: Metro/zip data system can be integrated when data source is available
  return null;
}

/**
 * Get zip code data (city, state, average price)
 * Uses legacy data as fallback
 */
export function getZipCodeData(zipCode: string): ZipCodeData | null {
  // Check legacy ZIP_CODE_DATA
  return ZIP_CODE_DATA[zipCode] || null;
}

/**
 * Get zip code data with Zillow ZHVI integration (async)
 * Fetches latest home price data from Zillow Research Data
 */
export async function getZipCodeDataWithZillow(zipCode: string): Promise<ZipCodeData | null> {
  // First try legacy data for city/state info
  const legacyData = getZipCodeData(zipCode)
  
  try {
    // Import Zillow utilities
    const { getAverageHomePrice } = await import('./zillow-data')
    const zillowPrice = await getAverageHomePrice(zipCode, 'zip')
    
    if (zillowPrice && zillowPrice > 0) {
      // Return data with Zillow price
      return {
        zipCode,
        averageHomePrice: Math.round(zillowPrice),
        city: legacyData?.city || '',
        state: legacyData?.state || '',
      }
    }
  } catch (error) {
    console.error(`Error fetching Zillow data for zip ${zipCode}:`, error)
  }
  
  // Fallback to legacy data if Zillow fetch fails
  return legacyData
}

// ============================================================================
// ZIP CODE INSURANCE DATA (Policygenius/Insurance API-style data)
// ============================================================================

/**
 * Zip code to home insurance cost mapping
 * In production, this would be fetched from Policygenius API or similar insurance APIs
 * Insurance costs vary by:
 * - Natural disaster risk (hurricanes, earthquakes, floods, wildfires)
 * - Crime rates
 * - Local building costs
 * - State regulations
 * 
 * Data structure: Annual cost for $300k home baseline, with rate per $1000
 */
const ZIP_CODE_INSURANCE_DATA: Record<string, ZipCodeInsuranceData> = {
  // Austin, TX - Low risk, moderate costs
  '78701': { zipCode: '78701', annualInsuranceCost: 1800, insuranceRate: 0.60, riskLevel: 'low', city: 'Austin', state: 'TX' },
  '78702': { zipCode: '78702', annualInsuranceCost: 1650, insuranceRate: 0.55, riskLevel: 'low', city: 'Austin', state: 'TX' },
  '78703': { zipCode: '78703', annualInsuranceCost: 2100, insuranceRate: 0.70, riskLevel: 'low', city: 'Austin', state: 'TX' },
  '78704': { zipCode: '78704', annualInsuranceCost: 1950, insuranceRate: 0.65, riskLevel: 'low', city: 'Austin', state: 'TX' },
  '78705': { zipCode: '78705', annualInsuranceCost: 1800, insuranceRate: 0.60, riskLevel: 'low', city: 'Austin', state: 'TX' },
  
  // Los Angeles, CA - Earthquake risk, higher costs
  '90001': { zipCode: '90001', annualInsuranceCost: 2400, insuranceRate: 0.80, riskLevel: 'high', city: 'Los Angeles', state: 'CA' },
  '90002': { zipCode: '90002', annualInsuranceCost: 2250, insuranceRate: 0.75, riskLevel: 'high', city: 'Los Angeles', state: 'CA' },
  '90024': { zipCode: '90024', annualInsuranceCost: 3000, insuranceRate: 1.00, riskLevel: 'high', city: 'Los Angeles', state: 'CA' },
  '90025': { zipCode: '90025', annualInsuranceCost: 2700, insuranceRate: 0.90, riskLevel: 'high', city: 'Los Angeles', state: 'CA' },
  '90028': { zipCode: '90028', annualInsuranceCost: 2550, insuranceRate: 0.85, riskLevel: 'high', city: 'Los Angeles', state: 'CA' },
  
  // New York, NY - Moderate risk, higher costs due to building costs
  '10001': { zipCode: '10001', annualInsuranceCost: 2400, insuranceRate: 0.80, riskLevel: 'medium', city: 'New York', state: 'NY' },
  '10002': { zipCode: '10002', annualInsuranceCost: 2700, insuranceRate: 0.90, riskLevel: 'medium', city: 'New York', state: 'NY' },
  '10003': { zipCode: '10003', annualInsuranceCost: 3000, insuranceRate: 1.00, riskLevel: 'medium', city: 'New York', state: 'NY' },
  '10011': { zipCode: '10011', annualInsuranceCost: 3300, insuranceRate: 1.10, riskLevel: 'medium', city: 'New York', state: 'NY' },
  '10012': { zipCode: '10012', annualInsuranceCost: 3600, insuranceRate: 1.20, riskLevel: 'medium', city: 'New York', state: 'NY' },
  
  // Chicago, IL - Moderate risk, standard costs
  '60601': { zipCode: '60601', annualInsuranceCost: 1950, insuranceRate: 0.65, riskLevel: 'medium', city: 'Chicago', state: 'IL' },
  '60602': { zipCode: '60602', annualInsuranceCost: 1800, insuranceRate: 0.60, riskLevel: 'medium', city: 'Chicago', state: 'IL' },
  '60614': { zipCode: '60614', annualInsuranceCost: 2400, insuranceRate: 0.80, riskLevel: 'medium', city: 'Chicago', state: 'IL' },
  '60622': { zipCode: '60622', annualInsuranceCost: 2100, insuranceRate: 0.70, riskLevel: 'medium', city: 'Chicago', state: 'IL' },
  '60657': { zipCode: '60657', annualInsuranceCost: 2700, insuranceRate: 0.90, riskLevel: 'medium', city: 'Chicago', state: 'IL' },
  
  // Dallas, TX - Tornado/hail risk, moderate costs
  '75201': { zipCode: '75201', annualInsuranceCost: 2400, insuranceRate: 0.80, riskLevel: 'medium', city: 'Dallas', state: 'TX' },
  '75202': { zipCode: '75202', annualInsuranceCost: 2250, insuranceRate: 0.75, riskLevel: 'medium', city: 'Dallas', state: 'TX' },
  '75204': { zipCode: '75204', annualInsuranceCost: 2700, insuranceRate: 0.90, riskLevel: 'medium', city: 'Dallas', state: 'TX' },
  '75205': { zipCode: '75205', annualInsuranceCost: 3000, insuranceRate: 1.00, riskLevel: 'medium', city: 'Dallas', state: 'TX' },
  '75209': { zipCode: '75209', annualInsuranceCost: 2550, insuranceRate: 0.85, riskLevel: 'medium', city: 'Dallas', state: 'TX' },
  
  // Miami, FL - Hurricane risk, very high costs
  '33101': { zipCode: '33101', annualInsuranceCost: 4500, insuranceRate: 1.50, riskLevel: 'very-high', city: 'Miami', state: 'FL' },
  '33109': { zipCode: '33109', annualInsuranceCost: 6000, insuranceRate: 2.00, riskLevel: 'very-high', city: 'Miami', state: 'FL' },
  '33130': { zipCode: '33130', annualInsuranceCost: 4200, insuranceRate: 1.40, riskLevel: 'very-high', city: 'Miami', state: 'FL' },
  '33131': { zipCode: '33131', annualInsuranceCost: 4800, insuranceRate: 1.60, riskLevel: 'very-high', city: 'Miami', state: 'FL' },
  '33139': { zipCode: '33139', annualInsuranceCost: 5400, insuranceRate: 1.80, riskLevel: 'very-high', city: 'Miami', state: 'FL' },
  
  // Seattle, WA - Low earthquake risk, moderate costs
  '98101': { zipCode: '98101', annualInsuranceCost: 2100, insuranceRate: 0.70, riskLevel: 'low', city: 'Seattle', state: 'WA' },
  '98102': { zipCode: '98102', annualInsuranceCost: 2400, insuranceRate: 0.80, riskLevel: 'low', city: 'Seattle', state: 'WA' },
  '98103': { zipCode: '98103', annualInsuranceCost: 2250, insuranceRate: 0.75, riskLevel: 'low', city: 'Seattle', state: 'WA' },
  '98109': { zipCode: '98109', annualInsuranceCost: 2700, insuranceRate: 0.90, riskLevel: 'low', city: 'Seattle', state: 'WA' },
  '98112': { zipCode: '98112', annualInsuranceCost: 3000, insuranceRate: 1.00, riskLevel: 'low', city: 'Seattle', state: 'WA' },
  
  // San Francisco, CA - Earthquake risk, very high costs
  '94102': { zipCode: '94102', annualInsuranceCost: 3600, insuranceRate: 1.20, riskLevel: 'very-high', city: 'San Francisco', state: 'CA' },
  '94103': { zipCode: '94103', annualInsuranceCost: 3900, insuranceRate: 1.30, riskLevel: 'very-high', city: 'San Francisco', state: 'CA' },
  '94109': { zipCode: '94109', annualInsuranceCost: 3300, insuranceRate: 1.10, riskLevel: 'very-high', city: 'San Francisco', state: 'CA' },
  '94110': { zipCode: '94110', annualInsuranceCost: 3600, insuranceRate: 1.20, riskLevel: 'very-high', city: 'San Francisco', state: 'CA' },
  '94117': { zipCode: '94117', annualInsuranceCost: 4200, insuranceRate: 1.40, riskLevel: 'very-high', city: 'San Francisco', state: 'CA' },
  
  // Denver, CO - Hail risk, moderate costs
  '80202': { zipCode: '80202', annualInsuranceCost: 2400, insuranceRate: 0.80, riskLevel: 'medium', city: 'Denver', state: 'CO' },
  '80203': { zipCode: '80203', annualInsuranceCost: 2700, insuranceRate: 0.90, riskLevel: 'medium', city: 'Denver', state: 'CO' },
  '80205': { zipCode: '80205', annualInsuranceCost: 2250, insuranceRate: 0.75, riskLevel: 'medium', city: 'Denver', state: 'CO' },
  '80206': { zipCode: '80206', annualInsuranceCost: 3000, insuranceRate: 1.00, riskLevel: 'medium', city: 'Denver', state: 'CO' },
  '80211': { zipCode: '80211', annualInsuranceCost: 2550, insuranceRate: 0.85, riskLevel: 'medium', city: 'Denver', state: 'CO' },
  
  // Phoenix, AZ - Low risk, standard costs
  '85001': { zipCode: '85001', annualInsuranceCost: 1800, insuranceRate: 0.60, riskLevel: 'low', city: 'Phoenix', state: 'AZ' },
  '85003': { zipCode: '85003', annualInsuranceCost: 1650, insuranceRate: 0.55, riskLevel: 'low', city: 'Phoenix', state: 'AZ' },
  '85004': { zipCode: '85004', annualInsuranceCost: 1950, insuranceRate: 0.65, riskLevel: 'low', city: 'Phoenix', state: 'AZ' },
  '85006': { zipCode: '85006', annualInsuranceCost: 2100, insuranceRate: 0.70, riskLevel: 'low', city: 'Phoenix', state: 'AZ' },
  '85008': { zipCode: '85008', annualInsuranceCost: 2400, insuranceRate: 0.80, riskLevel: 'low', city: 'Phoenix', state: 'AZ' },
  
  // Boston, MA - Moderate risk, higher costs
  '02101': { zipCode: '02101', annualInsuranceCost: 2400, insuranceRate: 0.80, riskLevel: 'medium', city: 'Boston', state: 'MA' },
  '02108': { zipCode: '02108', annualInsuranceCost: 3000, insuranceRate: 1.00, riskLevel: 'medium', city: 'Boston', state: 'MA' },
  '02109': { zipCode: '02109', annualInsuranceCost: 2700, insuranceRate: 0.90, riskLevel: 'medium', city: 'Boston', state: 'MA' },
  '02110': { zipCode: '02110', annualInsuranceCost: 3000, insuranceRate: 1.00, riskLevel: 'medium', city: 'Boston', state: 'MA' },
  '02111': { zipCode: '02111', annualInsuranceCost: 2250, insuranceRate: 0.75, riskLevel: 'medium', city: 'Boston', state: 'MA' },
};

/**
 * Get home insurance cost by zip code
 * In production, this would fetch from Policygenius API or similar:
 * - Policygenius API: https://www.policygenius.com/api (if available)
 * - Insurance.com API
 * - QuoteWizard API
 * - Or scrape/aggregate from multiple sources
 * 
 * @param zipCode - 5-digit zip code
 * @param homeValue - Value of the home to insure
 * @returns Annual insurance cost, or null if data not available
 */
export function getHomeInsuranceByZip(zipCode: string, homeValue: number): number | null {
  const insuranceData = ZIP_CODE_INSURANCE_DATA[zipCode];
  
  if (!insuranceData) {
    // Fallback: use average rate if zip not found
    // In production, would make API call here
    return null;
  }
  
  // Calculate insurance based on home value
  // Baseline is $300k, so we scale proportionally
  const baselineValue = 300000;
  const baselineCost = insuranceData.annualInsuranceCost;
  
  // Insurance doesn't scale linearly - use rate per $1000
  // Formula: (homeValue / 1000) * insuranceRate
  const annualCost = (homeValue / 1000) * insuranceData.insuranceRate;
  
  return Math.round(annualCost);
}

/**
 * Get insurance data for a zip code
 */
export function getZipCodeInsuranceData(zipCode: string): ZipCodeInsuranceData | null {
  return ZIP_CODE_INSURANCE_DATA[zipCode] || null;
}

/**
 * Get monthly insurance cost by zip code
 */
export function getMonthlyInsuranceByZip(zipCode: string, homeValue: number): number {
  const annualCost = getHomeInsuranceByZip(zipCode, homeValue);
  if (annualCost === null) {
    // Fallback: use standard rate (0.3% annually)
    return (homeValue * 0.003) / 12;
  }
  return annualCost / 12;
}

// ============================================================================
// ZIP CODE CLOSING COSTS DATA (HMDA-based patterns and market data)
// ============================================================================

/**
 * Zip code to closing costs breakdown mapping
 * Data based on:
 * - HMDA (Home Mortgage Disclosure Act) loan patterns
 * - CFPB (Consumer Financial Protection Bureau) closing cost studies
 * - State and local government fee schedules
 * - Title insurance rate filings (state-regulated)
 * - Market competition analysis
 * 
 * In production, this would be:
 * - Fetched from HMDA API: https://ffiec.cfpb.gov/data-browser/
 * - Aggregated from CFPB closing cost database
 * - Integrated with state/county fee schedules
 * - Updated from title insurance rate filings
 */
const ZIP_CODE_CLOSING_COSTS_DATA: Record<string, ZipCodeClosingCostsData> = {
  // Austin, TX - Competitive market, moderate fees
  '78701': {
    zipCode: '78701',
    city: 'Austin',
    state: 'TX',
    county: 'Travis',
    lenderFees: {
      originationFeePercent: 0.008, // 0.8% (competitive market)
      applicationFee: 0, // Often waived
      creditReportFee: 50,
      pointsAverage: 0.5,
    },
    titleAndSettlement: {
      titleInsuranceRate: 5.75, // Per $1000 (TX regulated)
      settlementFee: 450,
      titleSearchFee: 200,
    },
    governmentFees: {
      recordingFee: 150, // Per document
      transferTaxRate: 0, // No state transfer tax in TX
    },
    otherServices: {
      appraisalFee: 500,
      inspectionFee: 450,
      surveyFee: 600,
    },
    averageClosingCostPercent: 2.8,
    averageTotalClosingCosts: 8400, // For $300k home
    marketCompetition: 'high',
  },
  '78702': {
    zipCode: '78702',
    city: 'Austin',
    state: 'TX',
    county: 'Travis',
    lenderFees: { originationFeePercent: 0.008, applicationFee: 0, creditReportFee: 50, pointsAverage: 0.5 },
    titleAndSettlement: { titleInsuranceRate: 5.75, settlementFee: 450, titleSearchFee: 200 },
    governmentFees: { recordingFee: 150, transferTaxRate: 0 },
    otherServices: { appraisalFee: 500, inspectionFee: 450, surveyFee: 600 },
    averageClosingCostPercent: 2.8,
    averageTotalClosingCosts: 8400,
    marketCompetition: 'high',
  },
  
  // Los Angeles, CA - Higher fees, state transfer tax
  '90001': {
    zipCode: '90001',
    city: 'Los Angeles',
    state: 'CA',
    county: 'Los Angeles',
    lenderFees: {
      originationFeePercent: 0.012, // 1.2% (less competitive)
      applicationFee: 300,
      creditReportFee: 50,
      pointsAverage: 0.8,
    },
    titleAndSettlement: {
      titleInsuranceRate: 5.75, // CA regulated
      settlementFee: 600,
      titleSearchFee: 250,
    },
    governmentFees: {
      recordingFee: 225,
      transferTaxRate: 0.0011, // CA state transfer tax
    },
    otherServices: {
      appraisalFee: 550,
      inspectionFee: 500,
      surveyFee: 700,
    },
    averageClosingCostPercent: 3.5,
    averageTotalClosingCosts: 10500,
    marketCompetition: 'medium',
  },
  '90024': {
    zipCode: '90024',
    city: 'Los Angeles',
    state: 'CA',
    county: 'Los Angeles',
    lenderFees: { originationFeePercent: 0.010, applicationFee: 200, creditReportFee: 50, pointsAverage: 0.6 },
    titleAndSettlement: { titleInsuranceRate: 5.75, settlementFee: 650, titleSearchFee: 250 },
    governmentFees: { recordingFee: 225, transferTaxRate: 0.0011 },
    otherServices: { appraisalFee: 600, inspectionFee: 550, surveyFee: 750 },
    averageClosingCostPercent: 3.8,
    averageTotalClosingCosts: 11400,
    marketCompetition: 'medium',
  },
  
  // New York, NY - Very high fees, high transfer tax
  '10001': {
    zipCode: '10001',
    city: 'New York',
    state: 'NY',
    county: 'New York',
    lenderFees: {
      originationFeePercent: 0.015, // 1.5% (high cost market)
      applicationFee: 500,
      creditReportFee: 75,
      pointsAverage: 1.0,
    },
    titleAndSettlement: {
      titleInsuranceRate: 5.75, // NY regulated
      settlementFee: 800,
      titleSearchFee: 300,
    },
    governmentFees: {
      recordingFee: 350,
      transferTaxRate: 0.004, // NY state + city transfer tax
    },
    otherServices: {
      appraisalFee: 650,
      inspectionFee: 600,
      surveyFee: 800,
    },
    averageClosingCostPercent: 4.2,
    averageTotalClosingCosts: 12600,
    marketCompetition: 'low',
  },
  '10012': {
    zipCode: '10012',
    city: 'New York',
    state: 'NY',
    county: 'New York',
    lenderFees: { originationFeePercent: 0.015, applicationFee: 500, creditReportFee: 75, pointsAverage: 1.2 },
    titleAndSettlement: { titleInsuranceRate: 5.75, settlementFee: 900, titleSearchFee: 350 },
    governmentFees: { recordingFee: 350, transferTaxRate: 0.004 },
    otherServices: { appraisalFee: 750, inspectionFee: 650, surveyFee: 900 },
    averageClosingCostPercent: 4.5,
    averageTotalClosingCosts: 13500,
    marketCompetition: 'low',
  },
  
  // Miami, FL - High transfer tax, competitive lender fees
  '33101': {
    zipCode: '33101',
    city: 'Miami',
    state: 'FL',
    county: 'Miami-Dade',
    lenderFees: {
      originationFeePercent: 0.009, // 0.9% (competitive)
      applicationFee: 0,
      creditReportFee: 50,
      pointsAverage: 0.5,
    },
    titleAndSettlement: {
      titleInsuranceRate: 5.75, // FL regulated
      settlementFee: 500,
      titleSearchFee: 200,
    },
    governmentFees: {
      recordingFee: 200,
      transferTaxRate: 0.007, // FL state transfer tax (high)
    },
    otherServices: {
      appraisalFee: 500,
      inspectionFee: 450,
      surveyFee: 600,
    },
    averageClosingCostPercent: 3.8,
    averageTotalClosingCosts: 11400,
    marketCompetition: 'high',
  },
  '33109': {
    zipCode: '33109',
    city: 'Miami',
    state: 'FL',
    county: 'Miami-Dade',
    lenderFees: { originationFeePercent: 0.008, applicationFee: 0, creditReportFee: 50, pointsAverage: 0.3 },
    titleAndSettlement: { titleInsuranceRate: 5.75, settlementFee: 550, titleSearchFee: 250 },
    governmentFees: { recordingFee: 200, transferTaxRate: 0.007 },
    otherServices: { appraisalFee: 600, inspectionFee: 500, surveyFee: 700 },
    averageClosingCostPercent: 4.0,
    averageTotalClosingCosts: 12000,
    marketCompetition: 'high',
  },
  
  // Chicago, IL - Moderate fees, state transfer tax
  '60601': {
    zipCode: '60601',
    city: 'Chicago',
    state: 'IL',
    county: 'Cook',
    lenderFees: {
      originationFeePercent: 0.010, // 1.0%
      applicationFee: 200,
      creditReportFee: 50,
      pointsAverage: 0.6,
    },
    titleAndSettlement: {
      titleInsuranceRate: 5.75, // IL regulated
      settlementFee: 500,
      titleSearchFee: 200,
    },
    governmentFees: {
      recordingFee: 150,
      transferTaxRate: 0.001, // IL state transfer tax
    },
    otherServices: {
      appraisalFee: 500,
      inspectionFee: 400,
      surveyFee: 600,
    },
    averageClosingCostPercent: 3.0,
    averageTotalClosingCosts: 9000,
    marketCompetition: 'medium',
  },
  
  // Dallas, TX - Competitive, no transfer tax
  '75201': {
    zipCode: '75201',
    city: 'Dallas',
    state: 'TX',
    county: 'Dallas',
    lenderFees: {
      originationFeePercent: 0.008,
      applicationFee: 0,
      creditReportFee: 50,
      pointsAverage: 0.5,
    },
    titleAndSettlement: {
      titleInsuranceRate: 5.75,
      settlementFee: 450,
      titleSearchFee: 200,
    },
    governmentFees: {
      recordingFee: 150,
      transferTaxRate: 0,
    },
    otherServices: {
      appraisalFee: 500,
      inspectionFee: 450,
      surveyFee: 600,
    },
    averageClosingCostPercent: 2.7,
    averageTotalClosingCosts: 8100,
    marketCompetition: 'high',
  },
  
  // Seattle, WA - Moderate fees, no transfer tax
  '98101': {
    zipCode: '98101',
    city: 'Seattle',
    state: 'WA',
    county: 'King',
    lenderFees: {
      originationFeePercent: 0.009,
      applicationFee: 0,
      creditReportFee: 50,
      pointsAverage: 0.5,
    },
    titleAndSettlement: {
      titleInsuranceRate: 5.75,
      settlementFee: 500,
      titleSearchFee: 200,
    },
    governmentFees: {
      recordingFee: 175,
      transferTaxRate: 0,
    },
    otherServices: {
      appraisalFee: 550,
      inspectionFee: 500,
      surveyFee: 650,
    },
    averageClosingCostPercent: 3.0,
    averageTotalClosingCosts: 9000,
    marketCompetition: 'high',
  },
  
  // San Francisco, CA - Very high fees
  '94102': {
    zipCode: '94102',
    city: 'San Francisco',
    state: 'CA',
    county: 'San Francisco',
    lenderFees: {
      originationFeePercent: 0.012,
      applicationFee: 400,
      creditReportFee: 75,
      pointsAverage: 0.8,
    },
    titleAndSettlement: {
      titleInsuranceRate: 5.75,
      settlementFee: 700,
      titleSearchFee: 300,
    },
    governmentFees: {
      recordingFee: 250,
      transferTaxRate: 0.0011,
    },
    otherServices: {
      appraisalFee: 650,
      inspectionFee: 600,
      surveyFee: 800,
    },
    averageClosingCostPercent: 3.8,
    averageTotalClosingCosts: 11400,
    marketCompetition: 'medium',
  },
  
  // Denver, CO - Competitive market
  '80202': {
    zipCode: '80202',
    city: 'Denver',
    state: 'CO',
    county: 'Denver',
    lenderFees: {
      originationFeePercent: 0.008,
      applicationFee: 0,
      creditReportFee: 50,
      pointsAverage: 0.5,
    },
    titleAndSettlement: {
      titleInsuranceRate: 5.75,
      settlementFee: 450,
      titleSearchFee: 200,
    },
    governmentFees: {
      recordingFee: 150,
      transferTaxRate: 0,
    },
    otherServices: {
      appraisalFee: 500,
      inspectionFee: 450,
      surveyFee: 600,
    },
    averageClosingCostPercent: 2.8,
    averageTotalClosingCosts: 8400,
    marketCompetition: 'high',
  },
  
  // Phoenix, AZ - Very competitive
  '85001': {
    zipCode: '85001',
    city: 'Phoenix',
    state: 'AZ',
    county: 'Maricopa',
    lenderFees: {
      originationFeePercent: 0.007, // 0.7% (very competitive)
      applicationFee: 0,
      creditReportFee: 50,
      pointsAverage: 0.3,
    },
    titleAndSettlement: {
      titleInsuranceRate: 5.75,
      settlementFee: 400,
      titleSearchFee: 200,
    },
    governmentFees: {
      recordingFee: 150,
      transferTaxRate: 0,
    },
    otherServices: {
      appraisalFee: 450,
      inspectionFee: 400,
      surveyFee: 550,
    },
    averageClosingCostPercent: 2.5,
    averageTotalClosingCosts: 7500,
    marketCompetition: 'high',
  },
  
  // Boston, MA - Higher fees
  '02101': {
    zipCode: '02101',
    city: 'Boston',
    state: 'MA',
    county: 'Suffolk',
    lenderFees: {
      originationFeePercent: 0.011,
      applicationFee: 300,
      creditReportFee: 50,
      pointsAverage: 0.7,
    },
    titleAndSettlement: {
      titleInsuranceRate: 5.75,
      settlementFee: 600,
      titleSearchFee: 250,
    },
    governmentFees: {
      recordingFee: 200,
      transferTaxRate: 0.002, // MA state transfer tax
    },
    otherServices: {
      appraisalFee: 550,
      inspectionFee: 500,
      surveyFee: 650,
    },
    averageClosingCostPercent: 3.4,
    averageTotalClosingCosts: 10200,
    marketCompetition: 'medium',
  },
};

/**
 * Get closing costs breakdown by zip code
 * Based on HMDA patterns, CFPB data, and local market conditions
 * 
 * @param zipCode - 5-digit zip code
 * @param purchasePrice - Purchase price of home
 * @param loanAmount - Loan amount
 * @returns Detailed closing costs breakdown, or null if data not available
 */
export function getClosingCostsByZip(
  zipCode: string,
  purchasePrice: number,
  loanAmount: number
): {
  lenderFees: {
    origination: number;
    applicationFee: number;
    creditReport: number;
    points: number;
    total: number;
  };
  titleAndSettlement: {
    titleInsurance: number;
    settlementFee: number;
    titleSearch: number;
    total: number;
  };
  governmentFees: {
    recordingFees: number;
    transferTaxes: number;
    total: number;
  };
  otherServices: {
    appraisal: number;
    inspection: number;
    survey: number;
    total: number;
  };
  total: number;
} | null {
  const closingData = ZIP_CODE_CLOSING_COSTS_DATA[zipCode];
  
  if (!closingData) {
    return null;
  }
  
  // Calculate lender fees
  const origination = loanAmount * closingData.lenderFees.originationFeePercent;
  const applicationFee = closingData.lenderFees.applicationFee;
  const creditReport = closingData.lenderFees.creditReportFee;
  const points = loanAmount * (closingData.lenderFees.pointsAverage / 100);
  const lenderTotal = origination + applicationFee + creditReport + points;
  
  // Calculate title & settlement
  const titleInsurance = (purchasePrice / 1000) * closingData.titleAndSettlement.titleInsuranceRate;
  const settlementFee = closingData.titleAndSettlement.settlementFee;
  const titleSearch = closingData.titleAndSettlement.titleSearchFee;
  const titleTotal = titleInsurance + settlementFee + titleSearch;
  
  // Calculate government fees
  const recordingFees = closingData.governmentFees.recordingFee * 2; // Typically 2 documents
  const transferTaxes = purchasePrice * closingData.governmentFees.transferTaxRate;
  const govTotal = recordingFees + transferTaxes;
  
  // Other services (flat fees, may scale slightly with home value)
  const appraisal = closingData.otherServices.appraisalFee;
  const inspection = closingData.otherServices.inspectionFee;
  const survey = closingData.otherServices.surveyFee;
  const otherTotal = appraisal + inspection + survey;
  
  const total = lenderTotal + titleTotal + govTotal + otherTotal;
  
  return {
    lenderFees: {
      origination,
      applicationFee,
      creditReport,
      points,
      total: lenderTotal,
    },
    titleAndSettlement: {
      titleInsurance,
      settlementFee,
      titleSearch,
      total: titleTotal,
    },
    governmentFees: {
      recordingFees,
      transferTaxes,
      total: govTotal,
    },
    otherServices: {
      appraisal,
      inspection,
      survey,
      total: otherTotal,
    },
    total,
  };
}

/**
 * Get closing costs data for a zip code
 */
export function getZipCodeClosingCostsData(zipCode: string): ZipCodeClosingCostsData | null {
  return ZIP_CODE_CLOSING_COSTS_DATA[zipCode] || null;
}

// ============================================================================
// MAIN CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculate affordability based on income, debt, and credit score
 * Uses 28/36 rule for realistic max and 43% DTI for lender max
 */
export function calculateAffordability(data: QuizData): AffordabilityResult {
  const monthlyIncome = data.income / 12;
  const interestRate = getInterestRate(data.creditScore);
  
  // Calculate DTI
  const frontEndDTI = 28; // Housing should be max 28% of income
  const backEndDTI = 36; // Total debt should be max 36% of income
  const lenderMaxDTI = 43; // What lenders will approve (risky)
  
  // Realistic max monthly payment (28/36 rule)
  // Use the lower of: 28% of income OR (36% of income - existing debt)
  const maxHousingPayment = monthlyIncome * (frontEndDTI / 100);
  const maxTotalDebt = monthlyIncome * (backEndDTI / 100);
  const maxRealisticPayment = Math.min(
    maxHousingPayment,
    maxTotalDebt - data.monthlyDebt
  );
  
  // Lender max (43% DTI - what they'll approve)
  // Ensure lender max payment is always higher than realistic payment
  const lenderMaxPaymentRaw = (monthlyIncome * (lenderMaxDTI / 100)) - data.monthlyDebt;
  const lenderMaxPayment = Math.max(
    lenderMaxPaymentRaw,
    maxRealisticPayment * 1.15 // At least 15% higher than realistic
  );
  
  // Estimate property taxes and insurance (1.5% of home value annually)
  // For calculation, we'll use 0.00125 monthly (1.5% / 12 = 0.015 / 12)
  const taxAndInsuranceRate = 0.00125;
  
  // Calculate max home price based on payment
  // Payment = P&I + Taxes + Insurance + PMI
  // We need to solve for home price
  // For realistic max, work backwards from payment
  const estimatedRealisticPrice = calculateMaxPriceFromPayment(
    maxRealisticPayment,
    interestRate,
    taxAndInsuranceRate,
    data.downPayment
  );
  
  const estimatedLenderMaxPrice = calculateMaxPriceFromPayment(
    lenderMaxPayment,
    interestRate,
    taxAndInsuranceRate,
    data.downPayment
  );
  
  // Use city median price as baseline, but don't cap affordability if calculated price is higher
  // Only use city data as a reference, not a hard limit
  const cityData = getCityData(data.city);
  // Don't cap by city priceMax - use calculated price if it's higher (user can afford more)
  // Only use city data as a floor if calculated price is unrealistically low
  const realisticMax = estimatedRealisticPrice > cityData.priceMin 
    ? estimatedRealisticPrice 
    : Math.max(estimatedRealisticPrice, cityData.priceMin * 0.9);
  const realisticMin = Math.max(realisticMax * 0.75, cityData.priceMin * 0.8);
  // Don't cap maxApproved by city limits - show what lender will actually approve
  // Ensure maxApproved is always higher than realisticMax (lenders approve more than what's comfortable)
  let maxApproved = estimatedLenderMaxPrice;
  if (maxApproved <= realisticMax) {
    // If calculation resulted in maxApproved being lower, ensure it's at least 20% higher
    maxApproved = realisticMax * 1.2;
  }
  
  // Calculate actual loan amounts
  const downPaymentPercent = (data.downPayment / realisticMax) * 100;
  const loanAmount = realisticMax - data.downPayment;
  
  // Calculate monthly payment components
  const principalAndInterest = calculateMonthlyPayment(loanAmount, interestRate, 30);
  const monthlyTaxes = (realisticMax * 0.015) / 12; // 1.5% annually
  const monthlyInsurance = (realisticMax * 0.003) / 12; // 0.3% annually (homeowners insurance)
  const pmiMonthly = calculatePMI(loanAmount, downPaymentPercent);
  
  const totalMonthlyPayment = principalAndInterest + monthlyTaxes + monthlyInsurance + pmiMonthly;

  // ── Target home price derived fields ─────────────────────────────
  let targetFields: Partial<AffordabilityResult> = {};
  if (data.targetHomePrice && data.targetHomePrice > 0) {
    const tPrice = data.targetHomePrice;
    const tLoan = Math.max(0, tPrice - data.downPayment);
    const tLTV = tPrice > 0 ? (tLoan / tPrice) * 100 : 0;
    const tDownPct = tPrice > 0 ? (data.downPayment / tPrice) * 100 : 0;
    const tPMI = calculatePMI(tLoan, tDownPct);
    const tPI = calculateMonthlyPayment(tLoan, interestRate, 30);
    const tTaxes = (tPrice * 0.015) / 12;
    const tInsurance = (tPrice * 0.003) / 12;
    targetFields = {
      targetHomePrice: tPrice,
      targetLoanAmount: tLoan,
      targetLTV: tLTV,
      targetPMIMonthly: tPMI,
      targetMonthlyPayment: tPI + tTaxes + tInsurance + tPMI,
      targetAffordable: tPrice <= maxApproved,
      targetComfortable: tPrice <= realisticMax,
    };
  }

  return {
    maxApproved,
    realisticMax,
    realisticMin,
    monthlyPayment: totalMonthlyPayment,
    interestRate,
    loanAmount,
    pmiMonthly,
    downPaymentPercent,
    ...targetFields,
  };
}

/**
 * Helper: Calculate max home price from monthly payment
 */
function calculateMaxPriceFromPayment(
  maxPayment: number,
  interestRate: number,
  taxAndInsuranceRate: number,
  downPayment: number
): number {
  // Iterative approach: try different prices until payment matches
  let price = 200000;
  let step = 100000;
  let bestPrice = price;
  
  for (let i = 0; i < 20; i++) {
    const loanAmount = price - downPayment;
    if (loanAmount <= 0) {
      price += step;
      continue;
    }
    
    const pAndI = calculateMonthlyPayment(loanAmount, interestRate, 30);
    const taxesAndInsurance = price * taxAndInsuranceRate;
    const pmi = calculatePMI(loanAmount, ((price - loanAmount) / price) * 100);
    const total = pAndI + taxesAndInsurance + pmi;
    
    if (Math.abs(total - maxPayment) < 50) {
      return price;
    }
    
    if (total < maxPayment) {
      bestPrice = price;
      price += step;
    } else {
      price -= step;
    }
    
    step = step / 2;
  }
  
  return bestPrice;
}

/**
 * Calculate readiness score (0-100) based on multiple factors
 */
export function calculateReadinessScore(
  data: QuizData,
  affordability: AffordabilityResult
): ReadinessScore {
  const monthlyIncome = data.income / 12;
  const dti = calculateDTI(data.monthlyDebt, monthlyIncome);
  const cityData = getCityData(data.city);
  // Use actual target price for down payment % when user told us their target
  const downPaymentPercent = data.targetHomePrice && data.targetHomePrice > 0
    ? (data.downPayment / data.targetHomePrice) * 100
    : affordability.downPaymentPercent;
  
  // Credit score points (max 30)
  const creditPoints: Record<CreditScoreRange, number> = {
    'under-600': 10,
    '600-650': 18,
    '650-700': 24,
    '700-750': 27,
    '750+': 30,
  };
  
  // DTI points (max 25)
  let dtiPoints = 0;
  if (dti < 20) dtiPoints = 25;
  else if (dti < 28) dtiPoints = 20;
  else if (dti < 36) dtiPoints = 15;
  else if (dti < 43) dtiPoints = 10;
  else dtiPoints = 5;
  
  // Down payment points (max 25)
  let downPoints = 0;
  if (downPaymentPercent >= 20) downPoints = 25;
  else if (downPaymentPercent >= 15) downPoints = 20;
  else if (downPaymentPercent >= 10) downPoints = 15;
  else if (downPaymentPercent >= 5) downPoints = 10;
  else downPoints = 5;
  
  // Timeline points (max 10)
  const timelinePoints: Record<Timeline, number> = {
    'exploring': 10,
    '1-year': 8,
    '6-months': 6,
    '3-months': 4,
  };
  
  // Savings buffer points (max 10)
  // Estimate monthly expenses as 70% of income
  const monthlyExpenses = monthlyIncome * 0.7;
  const monthsOfSavings = data.downPayment / monthlyExpenses;
  let bufferPoints = 0;
  if (monthsOfSavings >= 6) bufferPoints = 10;
  else if (monthsOfSavings >= 3) bufferPoints = 7;
  else if (monthsOfSavings >= 1) bufferPoints = 4;
  else bufferPoints = 0;
  
  const total = creditPoints[data.creditScore] + dtiPoints + downPoints + 
                 timelinePoints[data.timeline] + bufferPoints;
  
  let interpretation = '';
  if (total <= 40) {
    interpretation = "You're on your way! Let's build a strong foundation.";
  } else if (total <= 70) {
    interpretation = "You're making progress! A few improvements will get you there.";
  } else {
    interpretation = "You're ready! Time to start serious house hunting, while saving at each step.";
  }
  
  return {
    total,
    breakdown: {
      creditScore: creditPoints[data.creditScore],
      dtiRatio: dtiPoints,
      downPayment: downPoints,
      timeline: timelinePoints[data.timeline],
      savingsBuffer: bufferPoints,
    },
    interpretation,
  };
}

/**
 * Generate personalized action items based on readiness score
 */
export function generateActionItems(
  data: QuizData,
  affordability: AffordabilityResult,
  readiness: ReadinessScore
): ActionItem[] {
  const items: ActionItem[] = [];
  const monthlyIncome = data.income / 12;
  const dti = calculateDTI(data.monthlyDebt, monthlyIncome);
  
  // Credit score improvements
  if (readiness.breakdown.creditScore < 24) {
    const currentRate = affordability.interestRate;
    const improvedRate = getInterestRate('700-750');
    const savings = (currentRate - improvedRate) * affordability.loanAmount;
    
    items.push({
      priority: 'high',
      title: 'Improve Credit Score to 700+',
      description: `Your current score puts you at ${(currentRate * 100).toFixed(1)}% interest. Improving to 700+ could save you $${Math.round(savings / 30)} per year.`,
      impact: `Save $${Math.round(savings / 30)}/year in interest`,
      timeframe: '3-6 months',
      category: 'credit',
    });
  }
  
  // DTI improvements
  if (readiness.breakdown.dtiRatio < 20) {
    items.push({
      priority: 'high',
      title: 'Pay Down High-Interest Debt',
      description: `Your DTI is ${dti.toFixed(1)}%. Lowering it to under 20% will improve your rate and buying power.`,
      impact: 'Lower interest rate, better loan terms',
      timeframe: '3-12 months',
      category: 'debt',
    });
  }
  
  // Down payment improvements
  if (readiness.breakdown.downPayment < 20) {
    const needed = (affordability.realisticMax * 0.2) - data.downPayment;
    items.push({
      priority: 'medium',
      title: `Save $${formatCurrency(needed)} More for 20% Down`,
      description: `Avoiding PMI will save you $${Math.round(affordability.pmiMonthly * 12)} per year.`,
      impact: `Save $${Math.round(affordability.pmiMonthly * 12)}/year in PMI`,
      timeframe: '6-18 months',
      category: 'savings',
    });
  }
  
  // Emergency fund
  const monthlyExpenses = monthlyIncome * 0.7;
  const emergencyFundNeeded = monthlyExpenses * 3;
  if (data.downPayment < emergencyFundNeeded) {
    items.push({
      priority: 'high',
      title: 'Build 3-Month Emergency Fund First',
      description: 'Don\'t put all your savings into a down payment. Keep 3-6 months of expenses as a safety net.',
      impact: 'Financial security, avoid foreclosure risk',
      timeframe: '3-12 months',
      category: 'savings',
    });
  }
  
  // Timeline adjustments
  if (data.timeline === '3-months' && readiness.total < 70) {
    items.push({
      priority: 'medium',
      title: 'Consider Extending Timeline by 3-6 Months',
      description: 'Rushing increases mistakes. More time = better preparation and more savings.',
      impact: 'Better deals, fewer mistakes, more savings',
      timeframe: 'Immediate decision',
      category: 'education',
    });
  }
  
  return items.slice(0, 5); // Return top 5
}

/**
 * Calculate complete cost breakdown
 * Uses HMDA data by MSA for closing costs when available
 * Falls back to zip code data, then city-based estimates
 */
export async function calculateCostBreakdown(
  affordability: AffordabilityResult,
  city: string,
  downPaymentAmount?: number,
  zipCode?: string
): Promise<CostBreakdown> {
  const purchasePrice = affordability.realisticMax;
  // Calculate down payment from percent if not provided
  const downPayment = downPaymentAmount ?? (purchasePrice * (affordability.downPaymentPercent / 100));
  const loanAmount = affordability.loanAmount;
  const cityData = getCityData(city); // Use synchronous version for backward compatibility
  
  // Try to get HMDA-based closing costs by MSA (city)
  let closingCostsBreakdown;
  let hmdaClosingCosts: number | null = null;
  
  try {
    // Import HMDA utilities
    const { getClosingCostsByCity, getDetailedClosingCostsByCity } = await import('./hmda-data');
    hmdaClosingCosts = await getClosingCostsByCity(city, loanAmount);
    const hmdaDetails = await getDetailedClosingCostsByCity(city, loanAmount);
    
    if (hmdaDetails) {
      // Use HMDA data to inform closing cost breakdown
      // Scale HMDA origination charges and total loan costs proportionally
      const baseLoanAmount = 300000;
      const scaleFactor = loanAmount / baseLoanAmount;
      
      // HMDA provides origination charges and total loan costs
      // We'll use these to inform our breakdown
      const hmdaOrigination = hmdaDetails.originationCharges;
      const hmdaTotalLoanCosts = hmdaDetails.totalLoanCosts;
      
      // Estimate breakdown from HMDA totals
      // Origination charges typically represent lender fees
      const hmdaLenderTotal = hmdaOrigination;
      
      // Total loan costs minus origination = title, government, other
      const nonLenderCosts = hmdaTotalLoanCosts - hmdaOrigination;
      
      // Typical breakdown: 40% title, 40% government, 20% other
      const hmdaTitleTotal = nonLenderCosts * 0.4;
      const hmdaGovTotal = nonLenderCosts * 0.4;
      const hmdaOtherTotal = nonLenderCosts * 0.2;
      
      closingCostsBreakdown = {
        lenderFees: {
          origination: hmdaOrigination * 0.6,
          applicationFee: 0,
          creditReport: 50,
          points: hmdaOrigination * 0.4,
          total: hmdaLenderTotal,
        },
        titleAndSettlement: {
          titleInsurance: hmdaTitleTotal * 0.6,
          settlementFee: hmdaTitleTotal * 0.3,
          titleSearch: hmdaTitleTotal * 0.1,
          total: hmdaTitleTotal,
        },
        governmentFees: {
          recordingFees: 200,
          transferTaxes: hmdaGovTotal - 200,
          total: hmdaGovTotal,
        },
        otherServices: {
          appraisal: hmdaOtherTotal * 0.4,
          inspection: hmdaOtherTotal * 0.35,
          survey: hmdaOtherTotal * 0.25,
          total: hmdaOtherTotal,
        },
        total: hmdaTotalLoanCosts,
      };
    }
  } catch (error) {
    console.warn(`Error fetching HMDA data for ${city}:`, error);
  }
  
  // If HMDA data not available, try zip code-based closing costs
  if (!closingCostsBreakdown && zipCode && /^\d{5}$/.test(zipCode)) {
    closingCostsBreakdown = getClosingCostsByZip(zipCode, purchasePrice, loanAmount);
  }
  
  // Use zip code or HMDA data if available, otherwise use defaults
  let lenderTotal: number, titleTotal: number, govTotal: number, otherTotal: number;
  
  if (closingCostsBreakdown) {
    // Use zip code or HMDA-based closing costs
    lenderTotal = closingCostsBreakdown.lenderFees.total;
    titleTotal = closingCostsBreakdown.titleAndSettlement.total;
    govTotal = closingCostsBreakdown.governmentFees.total;
    otherTotal = closingCostsBreakdown.otherServices.total;
  } else {
    // Fallback to city-based calculation (use HMDA average if available, otherwise static)
    const baseClosingCost = hmdaClosingCosts || cityData.closingCostAvg || (purchasePrice * 0.03);
    
    // Lender fees (typically 40-50% of total closing costs)
    const lenderPercent = 0.45;
    const origination = baseClosingCost * lenderPercent * 0.6;
    const applicationFee = 500;
    const creditReport = 50;
    const points = baseClosingCost * lenderPercent * 0.4;
    lenderTotal = origination + applicationFee + creditReport + points;
    
    // Title & Settlement (typically 20-25% of total)
    const titlePercent = 0.225;
    const titleInsurance = baseClosingCost * titlePercent * 0.6;
    const settlementFee = baseClosingCost * titlePercent * 0.3;
    const titleSearch = baseClosingCost * titlePercent * 0.1;
    titleTotal = titleInsurance + settlementFee + titleSearch;
    
    // Government fees (typically 20-25% of total closing costs)
    const govPercent = 0.225;
    const recordingFees = baseClosingCost * govPercent * 0.3;
    const transferTaxes = baseClosingCost * govPercent * 0.7;
    govTotal = recordingFees + transferTaxes;
    
    // Other services (flat fees)
    const appraisal = 500;
    const inspection = 400;
    const survey = 600;
    otherTotal = appraisal + inspection + survey;
  }
  
  // Prepaid costs (0.5-1% of purchase price, use 0.75%)
  const prepaidPercent = 0.0075;
  const homeownersInsurance = (purchasePrice * 0.003) / 12; // Annual insurance / 12
  const propertyTaxes = (purchasePrice * 0.015) / 12; // Annual taxes / 12
  const prepaidInterest = (loanAmount * affordability.interestRate) / 365 * 15; // 15 days
  const prepaidTotal = homeownersInsurance + propertyTaxes + prepaidInterest;
  
  const totalClosingCosts = lenderTotal + titleTotal + govTotal + prepaidTotal + otherTotal;
  
  // Monthly payment breakdown
  const principalAndInterest = calculateMonthlyPayment(loanAmount, affordability.interestRate, 30);
  const monthlyTaxes = (purchasePrice * 0.015) / 12;
  const monthlyInsurance = (purchasePrice * 0.003) / 12;
  const pmi = affordability.pmiMonthly;
  const hoa = 0; // Varies, assume 0 for now
  const maintenanceReserve = (purchasePrice * 0.01) / 12; // 1% of home value annually
  
  const totalMonthly = principalAndInterest + monthlyTaxes + monthlyInsurance + pmi + hoa + maintenanceReserve;
  
  // Lifetime costs (30 years)
  const totalPayments = principalAndInterest * 12 * 30;
  const totalInterest = totalPayments - loanAmount;
  const totalPrincipal = loanAmount;
  const totalPaid = totalPayments + (monthlyTaxes * 12 * 30) + (monthlyInsurance * 12 * 30) + (pmi * 12 * (downPayment < purchasePrice * 0.2 ? 84 : 0)); // PMI for ~7 years if <20% down
  const vsOriginalPrice = totalPaid - purchasePrice;
  
  // Extract individual components for return
  let origination, applicationFee, creditReport, points;
  let titleInsurance, settlementFee, titleSearch;
  let recordingFees, transferTaxes;
  let appraisal, inspection, survey;
  
  if (closingCostsBreakdown) {
    origination = closingCostsBreakdown.lenderFees.origination;
    applicationFee = closingCostsBreakdown.lenderFees.applicationFee;
    creditReport = closingCostsBreakdown.lenderFees.creditReport;
    points = closingCostsBreakdown.lenderFees.points;
    titleInsurance = closingCostsBreakdown.titleAndSettlement.titleInsurance;
    settlementFee = closingCostsBreakdown.titleAndSettlement.settlementFee;
    titleSearch = closingCostsBreakdown.titleAndSettlement.titleSearch;
    recordingFees = closingCostsBreakdown.governmentFees.recordingFees;
    transferTaxes = closingCostsBreakdown.governmentFees.transferTaxes;
    appraisal = closingCostsBreakdown.otherServices.appraisal;
    inspection = closingCostsBreakdown.otherServices.inspection;
    survey = closingCostsBreakdown.otherServices.survey;
  } else {
    // Extract values from the calculations above (lines 1566-1595)
    // These were calculated in the else block, so we need to recalculate here
    // using the same baseClosingCost approach
    const baseClosingCost = hmdaClosingCosts || cityData.closingCostAvg || (purchasePrice * 0.03);
    const lenderPercent = 0.45;
    origination = baseClosingCost * lenderPercent * 0.6;
    applicationFee = 500;
    creditReport = 50;
    points = baseClosingCost * lenderPercent * 0.4;
    const titlePercent = 0.225;
    titleInsurance = baseClosingCost * titlePercent * 0.6;
    settlementFee = baseClosingCost * titlePercent * 0.3;
    titleSearch = baseClosingCost * titlePercent * 0.1;
    const govPercent = 0.225;
    recordingFees = baseClosingCost * govPercent * 0.3;
    transferTaxes = baseClosingCost * govPercent * 0.7;
    appraisal = 500;
    inspection = 400;
    survey = 600;
  }
  
  return {
    purchasePrice,
    downPayment,
    loanAmount,
    closingCosts: {
      total: totalClosingCosts,
      lenderFees: {
        origination,
        applicationFee,
        creditReport,
        points,
        total: lenderTotal,
      },
      titleAndSettlement: {
        titleInsurance,
        settlementFee,
        titleSearch,
        total: titleTotal,
      },
      governmentFees: {
        recordingFees,
        transferTaxes,
        total: govTotal,
      },
      prepaidCosts: {
        homeownersInsurance,
        propertyTaxes,
        prepaidInterest,
        total: prepaidTotal,
      },
      otherServices: {
        appraisal,
        inspection,
        survey,
        total: otherTotal,
      },
    },
    monthlyPayment: {
      total: totalMonthly,
      principalAndInterest,
      propertyTaxes: monthlyTaxes,
      homeownersInsurance: monthlyInsurance,
      pmi,
      hoa,
      maintenanceReserve,
    },
    lifetimeCosts: {
      totalInterest,
      totalPrincipal,
      totalPaid,
      vsOriginalPrice,
    },
  };
}

/**
 * Identify savings opportunities based on user's situation
 */
export function identifySavingsOpportunities(
  data: QuizData,
  costs: CostBreakdown,
  affordability: AffordabilityResult
): SavingsOpportunity[] {
  const opportunities: SavingsOpportunity[] = [];
  
  // Opportunity 1: Shop multiple lenders
  opportunities.push({
    id: 'shop-lenders',
    title: 'Shop Multiple Lenders',
    description: `Your estimated closing costs are ${formatCurrency(costs.closingCosts.total)}. Average in ${data.city}: ${formatCurrency(getCityData(data.city).closingCostAvg)}. Most buyers use their agent's "preferred lender" and never shop. Get 3+ quotes and compare line by line.`,
    savingsMin: 2000,
    savingsMax: 5000,
    difficulty: 'easy',
    priority: 1,
    actionSteps: [
      'Get Loan Estimates from 3+ lenders',
      'Compare origination fees line by line',
      'Negotiate based on best offer',
      'Ask lenders to match or beat competitors',
    ],
    category: 'negotiation',
  });
  
  // Opportunity 2: Improve credit score
  if (data.creditScore !== '750+') {
    const currentRate = affordability.interestRate;
    const improvedRate = getInterestRate('750+');
    const annualSavings = (currentRate - improvedRate) * affordability.loanAmount;
    
    opportunities.push({
      id: 'improve-credit',
      title: 'Improve Credit Score',
      description: `Your current rate is ${(currentRate * 100).toFixed(2)}%. Improving to 750+ could lower it to ${(improvedRate * 100).toFixed(2)}%, saving you thousands over the loan term.`,
      savingsMin: Math.round(annualSavings * 0.5),
      savingsMax: Math.round(annualSavings * 2),
      difficulty: 'medium',
      priority: 2,
      actionSteps: [
        'Pay all bills on time (most important)',
        'Keep credit card balances under 30%',
        'Don\'t open new accounts before buying',
        'Dispute any errors on credit report',
      ],
      category: 'credit',
    });
  }
  
  // Opportunity 3: Negotiate closing costs
  opportunities.push({
    id: 'negotiate-closing',
    title: 'Negotiate Closing Costs',
    description: `Many fees are negotiable. Origination fees, application fees, and settlement fees can often be reduced or waived.`,
    savingsMin: 1000,
    savingsMax: 3000,
    difficulty: 'easy',
    priority: 3,
    actionSteps: [
      'Ask lender to waive application fee',
      'Negotiate origination fee (aim for 0.5-1%)',
      'Shop title insurance (prices vary 50%+)',
      'Ask seller to cover some closing costs',
    ],
    category: 'negotiation',
  });
  
  // Opportunity 4: Use E-Closing (Electronic Closing)
  opportunities.push({
    id: 'e-closing',
    title: 'Request E-Closing (Electronic Closing)',
    description: `E-closings are becoming the new standard in the mortgage industry, offering significant savings through reduced printing and shipping fees, as well as faster closing times. Studies show individuals can save up to $500 per loan with e-closings. With Remote Online Notarization (RON), savings can increase to $212 per loan. This is a simple request that can save hundreds of dollars.`,
    savingsMin: 200,
    savingsMax: 500,
    difficulty: 'easy',
    priority: 2, // High priority - easy to do, good savings
    actionSteps: [
      'Ask your lender if they offer e-closing services',
      'Request Remote Online Notarization (RON) if available in your state',
      'Inquire about reduced fees for electronic document processing',
      'Compare e-closing vs traditional closing costs before deciding',
      'Ensure your state allows RON (most states now do)',
    ],
    category: 'negotiation',
  });
  
  // Opportunity 5: Shop title insurance
  opportunities.push({
    id: 'shop-title',
    title: 'Shop Title Insurance',
    description: `Title insurance prices vary 50%+ between providers. Most buyers use the agent's recommendation without shopping.`,
    savingsMin: 500,
    savingsMax: 1500,
    difficulty: 'easy',
    priority: 5,
    actionSteps: [
      'Get quotes from 3+ title companies',
      'Compare owner\'s and lender\'s policies',
      'Ask about discounts (if refinancing, etc.)',
      'Negotiate based on best quote',
    ],
    category: 'negotiation',
  });
  
  // Opportunity 6: Increase down payment to avoid PMI
  if (affordability.downPaymentPercent < 20) {
    const needed = (affordability.realisticMax * 0.2) - data.downPayment;
    const annualPMI = affordability.pmiMonthly * 12;
    
    opportunities.push({
      id: 'avoid-pmi',
      title: `Save $${formatCurrency(needed)} More to Avoid PMI`,
      description: `With ${affordability.downPaymentPercent.toFixed(1)}% down, you're paying $${Math.round(affordability.pmiMonthly)}/month in PMI. Getting to 20% eliminates this cost.`,
      savingsMin: Math.round(annualPMI),
      savingsMax: Math.round(annualPMI * 7), // 7 years of PMI
      difficulty: 'hard',
      priority: 6,
      actionSteps: [
        `Save an additional ${formatCurrency(needed)}`,
        'Consider waiting 6-12 months if possible',
        'Look into down payment assistance programs',
        'Consider a smaller home to reach 20%',
      ],
      category: 'savings',
    });
  }
  
  // Opportunity 7: Choose better loan term (if applicable)
  if (data.timeline !== '3-months') {
    opportunities.push({
      id: 'loan-term',
      title: 'Consider Loan Term Options',
      description: 'A 15-year loan saves tens of thousands in interest, but increases monthly payment. A 30-year gives flexibility.',
      savingsMin: 0, // Varies too much
      savingsMax: 50000,
      difficulty: 'medium',
      priority: 7,
      actionSteps: [
        'Calculate 15-year vs 30-year payments',
        'Consider your long-term plans',
        'Factor in investment opportunities',
        'Discuss with financial advisor',
      ],
      category: 'education',
    });
  }
  
  return opportunities.sort((a, b) => a.priority - b.priority).slice(0, 7);
}


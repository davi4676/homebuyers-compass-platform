# Metro and Zip Code Data Integration

This system replaces city-based data with comprehensive zip code and metro area data for more accurate price ranges and calculations.

## Usage

### 1. Initialize Data on App Startup

In your app initialization (e.g., `app/layout.tsx` or a data loading component):

```typescript
import { initializeMetroZipData } from '@/lib/metro-zip-data';

// Initialize with data source URLs
await initializeMetroZipData(
  'https://your-api.com/metro-data.json',  // Metro area data
  'https://your-api.com/zip-code-data.json' // Zip code price data
);
```

### 2. Supported Data Formats

#### JSON Format (Recommended)

**Metro Data:**
```json
{
  "metros": [
    {
      "metroCode": "NYC",
      "metroName": "New York-Newark-Jersey City, NY-NJ-PA",
      "state": "NY",
      "states": ["NY", "NJ", "PA"],
      "averageHomePrice": 750000,
      "medianHomePrice": 700000,
      "priceMin": 400000,
      "priceMax": 1200000,
      "priceRange25th": 550000,
      "priceRange75th": 950000,
      "closingCostAvg": 22500,
      "stateTransferTax": 0.004,
      "zipCodes": ["10001", "10002", "10003", ...]
    }
  ]
}
```

**Zip Code Data:**
```json
{
  "zipCodes": [
    {
      "zipCode": "10001",
      "metroCode": "NYC",
      "metroName": "New York-Newark-Jersey City, NY-NJ-PA",
      "city": "New York",
      "state": "NY",
      "county": "New York",
      "averageHomePrice": 850000,
      "medianHomePrice": 800000,
      "priceMin": 500000,
      "priceMax": 1500000,
      "priceRange25th": 650000,
      "priceRange75th": 1100000,
      "homeCount": 1250,
      "lastUpdated": "2024-01-15"
    }
  ]
}
```

#### CSV Format

**Metro Data CSV:**
```csv
metroCode,metroName,state,averageHomePrice,medianHomePrice,priceMin,priceMax,closingCostAvg,stateTransferTax
NYC,"New York-Newark-Jersey City, NY-NJ-PA",NY,750000,700000,400000,1200000,22500,0.004
LA,"Los Angeles-Long Beach-Anaheim, CA",CA,850000,800000,500000,1500000,25500,0.0011
```

**Zip Code Data CSV:**
```csv
zipCode,metroCode,city,state,county,averageHomePrice,medianHomePrice,priceMin,priceMax
10001,NYC,New York,NY,New York,850000,800000,500000,1500000
10002,NYC,New York,NY,New York,1200000,1100000,700000,1800000
```

### 3. Using the Data in Your Code

```typescript
import { 
  getMetroData, 
  getZipCodePriceData, 
  getMetroForZipCode,
  getPriceRangeByZip 
} from '@/lib/metro-zip-data';

// Get metro area data
const metroData = getMetroData('NYC');
if (metroData) {
  console.log(`Average price in ${metroData.metroName}: $${metroData.averageHomePrice}`);
}

// Get zip code price data
const zipData = getZipCodePriceData('10001');
if (zipData) {
  console.log(`Average price in ${zipData.city}: $${zipData.averageHomePrice}`);
}

// Get price range for a zip code
const priceRange = getPriceRangeByZip('10001');
if (priceRange) {
  console.log(`Price range: $${priceRange.min} - $${priceRange.max}`);
}

// Get metro area for a zip code
const metroMapping = getMetroForZipCode('10001');
if (metroMapping) {
  console.log(`Zip 10001 is in ${metroMapping.metroName}`);
}
```

### 4. Integration with Existing Code

The system is backward compatible with existing `getCityData()` calls. The `getAverageHomePriceByZip()` and `getZipCodeData()` functions in `calculations.ts` automatically use the new metro/zip data system when available, falling back to legacy city data if needed.

## Data Source Requirements

Your data source should provide:

1. **Metro Area Coverage**: All major metropolitan areas in the US
2. **Zip Code Coverage**: Comprehensive zip code coverage (ideally all US zip codes)
3. **Price Data**: Average and median home prices, price ranges (min, max, 25th, 75th percentile)
4. **Location Data**: City, state, county, metro area mapping
5. **Update Frequency**: Regular updates (monthly or quarterly recommended)

## API Endpoints

If using an API, the system expects:

- **GET** requests (no authentication required for public data)
- **JSON** or **CSV** response format
- **CORS enabled** if calling from browser
- **Rate limiting** considerations for large datasets

## Fallback Behavior

If external data sources fail to load:
- System falls back to default/legacy city-based data
- App continues to function with reduced accuracy
- Errors are logged to console for debugging

## Performance Considerations

- Data is cached in memory after initial load
- Consider implementing periodic refresh for up-to-date pricing
- For large datasets, consider pagination or chunked loading
- Use compression (gzip) for data transfer


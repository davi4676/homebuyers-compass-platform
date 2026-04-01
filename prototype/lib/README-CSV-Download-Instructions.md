# CSV Download Instructions for App Use

This guide explains how to download and use CSV files (particularly Zillow ZHVI data) in your application.

## Current Implementation

The app currently **automatically fetches** CSV files from Zillow's public data URLs. This is the recommended approach as it ensures you always get the latest data.

### How It Works Now

The app fetches CSV files directly from:
- **Metro Data**: `https://files.zillowstatic.com/research/public_csvs/zhvi/Metro_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv`
- **Zip Data**: `https://files.zillowstatic.com/research/public_csvs/zhvi/Zip_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv`

No manual download needed - the app handles everything automatically!

---

## Option 1: Keep Current Automatic Fetching (Recommended)

### Advantages:
- ✅ Always uses the latest data
- ✅ No manual maintenance required
- ✅ Automatic caching (30 days)
- ✅ Automatic refresh when cache expires

### How to Ensure It Works:

1. **Check API Routes** - Already configured in:
   - `app/api/zillow/metro/route.ts`
   - `app/api/zillow/zip/route.ts`

2. **Cache is Automatic** - Files are cached for 30 days in memory

3. **Test It**:
   ```bash
   # Test metro data fetch
   curl http://localhost:3002/api/zillow/metro?name=Austin
   
   # Test zip data fetch
   curl http://localhost:3002/api/zillow/zip?code=78701
   ```

---

## Option 2: Download CSV Files Manually (Local Storage)

If you prefer to download and store CSV files locally, follow these steps:

### Step 1: Download Zillow CSV Files

1. **Go to Zillow Research Data Page**:
   - Visit: https://www.zillow.com/research/data/
   - Look for "ZHVI (Zillow Home Value Index)" section

2. **Download These Files**:
   - `Metro_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv` (Metro areas)
   - `Zip_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv` (Zip codes)

3. **Direct Download Links** (if available):
   - Metro: https://files.zillowstatic.com/research/public_csvs/zhvi/Metro_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv
   - Zip: https://files.zillowstatic.com/research/public_csvs/zhvi/Zip_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv

### Step 2: Create Data Directory

Create a folder structure in your project:

```bash
# From project root (prototype/)
mkdir -p data/zillow
```

Or manually create:
```
prototype/
  data/
    zillow/
      Metro_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv
      Zip_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv
```

### Step 3: Download Files

**Windows PowerShell:**
```powershell
# Navigate to data directory
cd prototype\data\zillow

# Download Metro CSV
Invoke-WebRequest -Uri "https://files.zillowstatic.com/research/public_csvs/zhvi/Metro_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv" -OutFile "Metro_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv"

# Download Zip CSV
Invoke-WebRequest -Uri "https://files.zillowstatic.com/research/public_csvs/zhvi/Zip_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv" -OutFile "Zip_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv"
```

**macOS/Linux:**
```bash
# Navigate to data directory
cd prototype/data/zillow

# Download Metro CSV
curl -o Metro_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv "https://files.zillowstatic.com/research/public_csvs/zhvi/Metro_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv"

# Download Zip CSV
curl -o Zip_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv "https://files.zillowstatic.com/research/public_csvs/zhvi/Zip_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv"
```

**Or use your browser:**
1. Right-click each URL above
2. Select "Save Link As..."
3. Save to `prototype/data/zillow/`

### Step 4: Update App to Use Local Files

If you want to use local files instead of fetching from URLs, you would need to:

1. **Modify the API routes** to read from local files instead
2. **Add file system reading** (Node.js `fs` module)
3. **Update the cache logic** to use file modification dates

**Example modification for `app/api/zillow/metro/route.ts`:**
```typescript
import fs from 'fs'
import path from 'path'

// Instead of fetching from URL:
// const response = await fetch(zillowDataUrl)
// csvText = await response.text()

// Use local file:
const filePath = path.join(process.cwd(), 'data', 'zillow', 'Metro_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv')
csvText = fs.readFileSync(filePath, 'utf-8')
```

### Step 5: Keep Files Updated

If using local files, set up a monthly reminder to:
1. Download fresh CSV files from Zillow
2. Replace the old files in `data/zillow/`
3. Restart your app to clear cache

---

## Option 3: Hybrid Approach (Best of Both Worlds)

Keep automatic fetching as the primary method, but fall back to local files if the URL fetch fails:

```typescript
try {
  // Try to fetch from URL first
  const response = await fetch(zillowDataUrl)
  csvText = await response.text()
} catch (error) {
  // Fallback to local file if URL fetch fails
  const filePath = path.join(process.cwd(), 'data', 'zillow', 'Metro_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv')
  if (fs.existsSync(filePath)) {
    csvText = fs.readFileSync(filePath, 'utf-8')
    console.warn('Using local CSV file as fallback')
  } else {
    throw error
  }
}
```

---

## Recommended Approach

**For Production**: Keep the current automatic fetching method. It's:
- More reliable (always gets latest data)
- Less maintenance (no manual downloads)
- Already implemented and working
- Handles caching automatically

**For Development/Testing**: You can download files locally if:
- You want to work offline
- You want to test with specific data versions
- You need to modify the CSV data for testing

---

## Monthly Refresh Setup

To ensure data stays current, set up automatic refresh (see `README-zillow-refresh.md`):

1. **Vercel Cron** (if using Vercel)
2. **GitHub Actions** (for any hosting)
3. **External cron service** (cron-job.org, etc.)
4. **Manual reminder** - Download new files on the 1st of each month

---

## Other CSV Files You Might Need

If you need other CSV files for the app:

1. **HMDA Data** - Currently using API, but CSV available at:
   - https://ffiec.cfpb.gov/data-browser/data/2023
   
2. **Freddie Mac PMMS Rates** - Currently hardcoded, but could use:
   - https://www.freddiemac.com/pmms

3. **Custom Data** - Create your own CSV files:
   - Place in `prototype/data/custom/`
   - Create API routes to read them
   - Use Node.js `fs` module or CSV parsing libraries

---

## Troubleshooting

### CSV Files Not Loading?

1. **Check file paths** - Ensure files are in the correct location
2. **Check file permissions** - Make sure the app can read the files
3. **Verify CSV format** - Ensure files are valid CSV format
4. **Check cache** - Clear cache if using old data: `/api/zillow/refresh?refresh=true`

### Files Too Large?

Zillow CSV files can be large (several MB):
- Metro file: ~1-2 MB
- Zip file: ~5-10 MB

If this causes issues:
- Use streaming for large files
- Consider database storage instead of CSV
- Use chunked reading for processing

---

## Questions?

- Check existing documentation: `README-zillow-refresh.md`
- Test API endpoints: `http://localhost:3002/api/zillow/metro?name=Austin`
- Review code: `app/api/zillow/metro/route.ts` and `app/api/zillow/zip/route.ts`

# Zillow ZHVI Data Monthly Refresh

This system automatically caches Zillow ZHVI (Zillow Home Value Index) data for metro areas and zip codes, refreshing it monthly to ensure up-to-date home prices.

## How It Works

1. **Automatic Caching**: When data is fetched, it's cached for 30 days
2. **Monthly Refresh**: Data older than 30 days is automatically refreshed on the next request
3. **Manual Refresh**: You can manually trigger a refresh via the `/api/zillow/refresh` endpoint

## Cache Behavior

- **Cache Duration**: 30 days (1 month)
- **Storage**: In-memory cache (for production, consider Redis or a database)
- **Auto-Refresh**: Expired cache is automatically refreshed when accessed
- **Fallback**: If fresh data fetch fails, cached data is used as fallback

## API Endpoints

### Get Metro Data
```
GET /api/zillow/metro?name=Austin
GET /api/zillow/metro?name=Austin&refresh=true  # Force refresh
```

### Get Zip Data
```
GET /api/zillow/zip?code=78701
GET /api/zillow/zip?code=78701&refresh=true  # Force refresh
```

### Refresh Cache (Manual)
```
GET /api/zillow/refresh          # Refresh both metro and zip
GET /api/zillow/refresh?type=metro  # Refresh only metro
GET /api/zillow/refresh?type=zip   # Refresh only zip

POST /api/zillow/refresh          # Same as GET (for cron jobs)
```

## Setting Up Monthly Refresh

### Option 1: Vercel Cron (Recommended for Vercel deployments)

Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/zillow/refresh",
      "schedule": "0 0 1 * *"
    }
  ]
}
```
This runs on the 1st of every month at midnight UTC.

### Option 2: GitHub Actions

Create `.github/workflows/zillow-refresh.yml`:
```yaml
name: Refresh Zillow Data
on:
  schedule:
    - cron: '0 0 1 * *'  # 1st of every month at midnight UTC
  workflow_dispatch:  # Allow manual trigger

jobs:
  refresh:
    runs-on: ubuntu-latest
    steps:
      - name: Refresh Zillow Data
        run: |
          curl -X POST https://your-domain.com/api/zillow/refresh
```

### Option 3: External Cron Service

Use services like:
- **cron-job.org**: Set up a monthly cron job
- **EasyCron**: Schedule monthly HTTP requests
- **Zapier/Make**: Create a monthly automation

Configure to call:
```
POST https://your-domain.com/api/zillow/refresh
```

### Option 4: Server-Side Cron (Self-hosted)

If self-hosting, add to crontab:
```bash
0 0 1 * * curl -X POST http://localhost:3000/api/zillow/refresh
```

## Monitoring

Check cache status:
```typescript
import { getCacheStatus } from '@/lib/zillow-cache'

const status = getCacheStatus()
console.log(status)
// {
//   metro: { cached: true, age: 2592000000, lastDate: "2024-01-31" },
//   zip: { cached: true, age: 2592000000, lastDate: "2024-01-31" }
// }
```

## Production Considerations

For production, consider:

1. **Persistent Storage**: Replace in-memory cache with:
   - Redis
   - Database (PostgreSQL, MongoDB)
   - File system cache

2. **Error Handling**: Add retry logic and better error notifications

3. **Monitoring**: Set up alerts for failed refreshes

4. **Rate Limiting**: Protect the refresh endpoint with authentication

## Data Source

- **Metro Data**: `Metro_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv`
- **Zip Data**: `Zip_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv`
- **Source**: https://www.zillow.com/research/data/

Zillow updates these files monthly, typically around the first week of each month.

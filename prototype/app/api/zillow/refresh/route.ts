import { NextRequest, NextResponse } from 'next/server'
import { clearZillowCache, getCacheStatus } from '@/lib/zillow-cache'

/**
 * API Route to manually refresh Zillow ZHVI data
 * This endpoint can be called monthly via:
 * - Cron job (e.g., Vercel Cron, GitHub Actions, etc.)
 * - Scheduled task
 * - Manual trigger
 * 
 * Usage:
 * GET /api/zillow/refresh - Refresh both metro and zip data
 * GET /api/zillow/refresh?type=metro - Refresh only metro data
 * GET /api/zillow/refresh?type=zip - Refresh only zip data
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') // 'metro', 'zip', or null for both
    
    // Get cache status before refresh
    const statusBefore = getCacheStatus()
    
    // Clear cache to force refresh on next request
    if (type === 'metro') {
      // Only clear metro cache - zip will refresh naturally when accessed
      // For now, we clear both since they're in the same cache system
      clearZillowCache()
    } else if (type === 'zip') {
      // Only clear zip cache
      clearZillowCache()
    } else {
      // Clear both
      clearZillowCache()
    }
    
    // Trigger refresh by making requests with refresh=true
    const baseUrl = request.nextUrl.origin
    
    const refreshPromises: Promise<Response>[] = []
    
    if (!type || type === 'metro') {
      // Trigger metro refresh by fetching a common metro
      refreshPromises.push(
        fetch(`${baseUrl}/api/zillow/metro?name=Austin&refresh=true`)
      )
    }
    
    if (!type || type === 'zip') {
      // Trigger zip refresh by fetching a common zip
      refreshPromises.push(
        fetch(`${baseUrl}/api/zillow/zip?code=78701&refresh=true`)
      )
    }
    
    try {
      await Promise.all(refreshPromises)
    } catch (error) {
      console.error('Error during refresh:', error)
      // Continue even if refresh fails - cache is cleared, will refresh on next request
    }
    
    const statusAfter = getCacheStatus()
    
    return NextResponse.json({
      success: true,
      message: `Zillow ${type || 'metro and zip'} data refresh initiated`,
      cacheStatus: {
        before: statusBefore,
        after: statusAfter,
      },
      note: 'Data will be cached for 30 days. Call this endpoint monthly to refresh.',
    })
  } catch (error) {
    console.error('Error in Zillow refresh API:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * POST endpoint for scheduled jobs (cron, webhooks, etc.)
 */
export async function POST(request: NextRequest) {
  return GET(request)
}

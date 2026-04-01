import { NextRequest, NextResponse } from 'next/server'
import type { UserTier } from '@/lib/tiers'

const COOKIE_TIER = 'hbc_tier'
const VALID_TIERS: UserTier[] = ['foundations', 'momentum', 'navigator', 'navigator_plus']

function getTierFromCookie(request: NextRequest): UserTier {
  const cookie = request.cookies.get(COOKIE_TIER)?.value
  if (cookie && VALID_TIERS.includes(cookie as UserTier)) return cookie as UserTier
  return 'foundations'
}

/**
 * GET /api/plan — Return current plan (tier) from cookie so the app can track plan server-side.
 */
export async function GET(request: NextRequest) {
  const tier = getTierFromCookie(request)
  return NextResponse.json({ tier })
}

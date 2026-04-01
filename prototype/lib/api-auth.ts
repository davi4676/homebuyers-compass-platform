/**
 * Helper for API routes: get session or return 401 response.
 */

import { NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth-server'

export async function requireSession(): Promise<
  { userId: string; email: string } | NextResponse
> {
  const session = await getSessionFromRequest()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return session
}

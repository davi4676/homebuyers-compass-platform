import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SESSION_COOKIE = 'session'

/**
 * When true (or in development): skip the auth redirect so reviewers can open journey, upgrade,
 * dashboard, etc. without signing in. Tier is driven by localStorage + the Developer Tier Switcher.
 * Set NEXT_PUBLIC_TIER_REVIEW_PUBLIC=false on production when you want the session gate back.
 */
function isTierReviewBrowsing(): boolean {
  if (process.env.NEXT_PUBLIC_TIER_REVIEW_PUBLIC === 'true') return true
  if (process.env.NODE_ENV === 'development') return true
  return false
}

/** Routes that do not require authentication. */
const PUBLIC_PATHS = ['/', '/auth', '/quiz', '/results']

/** Path prefixes that are always allowed (api, static, etc.). */
const PUBLIC_PREFIXES = ['/api/', '/_next/', '/favicon', '/privacy']

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) return true
  return false
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = request.cookies.get(SESSION_COOKIE)?.value

  // Product analytics — require sign-in even when tier-review / dev bypass is on
  if (pathname === '/analytics-dashboard' || pathname.startsWith('/analytics-dashboard/')) {
    if (!session) {
      const redirectUrl = new URL('/auth', request.url)
      redirectUrl.searchParams.set('redirect', pathname + request.nextUrl.search)
      return NextResponse.redirect(redirectUrl)
    }
    return NextResponse.next()
  }

  if (isTierReviewBrowsing()) {
    return NextResponse.next()
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  if (session) {
    return NextResponse.next()
  }

  const redirectUrl = new URL('/auth', request.url)
  redirectUrl.searchParams.set('redirect', pathname + request.nextUrl.search)
  return NextResponse.redirect(redirectUrl)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap, etc.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:ico|png|jpg|jpeg|gif|webp|svg)$).*)',
  ],
}

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SESSION_COOKIE = 'session'

/** Routes that do not require authentication (home and auth only). */
const PUBLIC_PATHS = ['/', '/auth']

/** Path prefixes that are always allowed (api, static, etc.). */
const PUBLIC_PREFIXES = ['/api/', '/_next/', '/favicon', '/privacy']

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) return true
  /** Prototype / demo: journey must work without login; tab navigations use the same path. */
  if (pathname === '/customized-journey' || pathname.startsWith('/customized-journey/')) return true
  return false
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  const session = request.cookies.get(SESSION_COOKIE)?.value
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

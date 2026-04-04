/**
 * Guest-only routes where the sticky mobile marketing CTA may appear.
 * Hidden on quiz, journey hub, and authenticated app shells.
 */
export function shouldShowMobileMarketingSticky(
  pathname: string,
  isAuthenticated: boolean
): boolean {
  if (isAuthenticated) return false
  if (pathname === '/quiz') return false
  if (pathname === '/customized-journey' || pathname.startsWith('/customized-journey/')) {
    return false
  }

  const marketing = new Set([
    '/',
    '/find-my-plan',
    '/upgrade',
    '/dev-upgrade',
    '/marketplace',
    '/auth',
    '/register',
    '/login',
    '/privacy',
    '/action-plan',
    '/analytics-dashboard',
  ])
  if (marketing.has(pathname)) return true
  if (pathname.startsWith('/docs/')) return true
  return false
}

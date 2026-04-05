/**
 * Mobile fixed bottom CTA: landing `/` and `/quiz` only (guests).
 * Hidden from md breakpoint up via the component’s `md:hidden`.
 */
export function shouldShowLandingQuizMobileSticky(
  pathname: string,
  isAuthenticated: boolean
): boolean {
  if (isAuthenticated) return false
  if (pathname === '/') return true
  if (pathname === '/quiz' || pathname.startsWith('/quiz/')) return true
  return false
}

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSafeSearchParams } from '@/lib/use-safe-search-params'
import { Hamburger, MagnifyingGlass, X } from '@phosphor-icons/react'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { UserMenu } from '@/components/auth/UserMenu'
import { useAuth } from '@/lib/hooks/useAuth'
import { useJourneyNavChrome } from '@/components/JourneyNavChromeContext'
import { parseJourneyTabParam, JOURNEY_PAGE_PATH, isCustomizedJourneyPath } from '@/lib/journey-nav-tabs'
import JourneyNav from '@/components/journey/JourneyNav'
import VisitStreakBadge from '@/components/journey/VisitStreakBadge'
import { SIGNUP_DISABLED } from '@/lib/auth-flags'

export default function TopNav() {
  const pathname = usePathname()
  const searchParams = useSafeSearchParams()
  /** Landing → Guides should show “Back to Home” on `/resources`. */
  const resourcesNavHref = pathname === '/' ? '/resources?from=home' : '/resources'
  const { isAuthenticated } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { resetJourneyNavChrome } = useJourneyNavChrome()

  const isJourneyPage = isCustomizedJourneyPath(pathname)
  const activeJourneyTab = parseJourneyTabParam(searchParams.get('tab'))

  useEffect(() => {
    if (!isJourneyPage) {
      resetJourneyNavChrome()
    }
  }, [isJourneyPage, resetJourneyNavChrome])

  const menuTabClass = (active: boolean) =>
    `inline-flex shrink-0 cursor-pointer items-center whitespace-nowrap rounded-full border px-2.5 py-1.5 text-nav font-medium transition-all duration-200 lg:px-3 ${
      active
        ? 'border-[color-mix(in_srgb,var(--nq-ed-accent)_35%,transparent)] bg-[var(--nq-ed-accent-soft)] font-semibold text-[var(--nq-ed-accent)]'
        : 'border-transparent text-[var(--nq-ed-muted)] hover:border-[var(--nq-ed-line)] hover:bg-white/70 hover:text-[var(--nq-ed-accent)]'
    }`

  const mobileMenuTabClass = (active: boolean) =>
    `block cursor-pointer rounded-xl px-4 py-2.5 text-lg font-medium transition-colors ${
      active
        ? 'border border-[color-mix(in_srgb,var(--nq-ed-accent)_35%,transparent)] bg-[var(--nq-ed-accent-soft)] font-semibold text-[var(--nq-ed-accent)]'
        : 'text-[var(--nq-ed-text)] hover:bg-[var(--nq-ed-accent-soft)]/40'
    }`

  return (
    <>
    <header
      className={`sticky top-0 z-[100] w-full border-b border-[var(--nq-ed-line-soft)] bg-white/95 shadow-sm backdrop-blur${
        isJourneyPage ? ' nq-ed-chrome-header' : ' nq-glass-nav'
      }`}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-4 md:h-16 md:gap-8 lg:gap-10">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2.5 text-millennial-text transition-colors hover:text-millennial-cta-primary dark:text-cyan-400 dark:hover:text-cyan-300 md:min-w-[10.75rem] lg:min-w-[11.75rem]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-millennial-cta-primary text-white md:h-10 md:w-10 dark:bg-cyan-600">
              <svg
                className="h-5 w-5 md:h-6 md:w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
                <path d="M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                <path d="M12 8l-2 4 2 1 2-1-2-4z" />
              </svg>
            </span>
            <span className="hidden flex-col items-start sm:flex">
              <span className="text-base font-semibold tracking-tight text-millennial-text md:text-lg dark:text-cyan-400">
                NestQuest
              </span>
              <span className="hidden text-xs font-normal text-millennial-text-muted md:block dark:text-slate-400">
                Your Home Buying Advocate
              </span>
            </span>
          </Link>

          {isAuthenticated ? (
            // Canonical authenticated top nav — shown on every authenticated route,
            // including the customized-journey page. Journey sub-navigation continues
            // to live in the left sidebar (<JourneyNav />), not in the top bar.
            // `flex-nowrap` + `whitespace-nowrap` on each item keep every label on
            // a single line even on narrower desktop viewports.
            <div className="hidden min-w-0 md:flex md:flex-1 md:flex-nowrap md:items-center md:justify-center md:gap-3 md:pl-6 md:pr-4 lg:gap-5 lg:pl-10 lg:pr-6 xl:pl-14">
              <Link href="/dashboard" className={menuTabClass(pathname === '/dashboard')}>
                Dashboard
              </Link>
              <Link href="/customized-journey?tab=today" className={menuTabClass(isJourneyPage)}>
                My Journey
              </Link>
              <Link
                href={resourcesNavHref}
                className={menuTabClass(pathname === '/resources')}
              >
                Guides
              </Link>
              <Link
                href="/down-payment-optimizer"
                className={menuTabClass(pathname === '/down-payment-optimizer')}
              >
                Find Funds
              </Link>
              <Link
                href="/marketplace"
                className={menuTabClass(pathname === '/marketplace')}
              >
                Tools &amp; Partners
              </Link>
              <Link
                href="/inbox"
                className={menuTabClass(pathname === '/inbox')}
              >
                Inbox
              </Link>
              <Link
                href="/for-professionals"
                className={menuTabClass(pathname === '/for-professionals')}
              >
                For organizations
              </Link>
            </div>
          ) : (
            <div className="hidden min-w-0 md:flex md:flex-1 md:items-center md:justify-center md:gap-8 lg:gap-10">
              <Link
                href="/how-it-works"
                className={`text-nav font-medium transition-colors ${
                  pathname === '/how-it-works'
                    ? 'font-semibold text-millennial-cta-primary dark:text-white'
                    : 'text-millennial-text-muted hover:text-millennial-cta-primary dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                How It Works
              </Link>
              <Link
                href={resourcesNavHref}
                className={menuTabClass(pathname === '/resources')}
              >
                Guides
              </Link>
              <Link
                href="/for-professionals"
                className={menuTabClass(pathname === '/for-professionals')}
              >
                For organizations
              </Link>
              <Link
                href={SIGNUP_DISABLED ? '/quiz' : '/auth?mode=signup&redirect=%2Fquiz'}
                className="rounded-xl bg-millennial-cta-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-millennial-cta-hover dark:bg-cyan-600 dark:hover:bg-cyan-500"
              >
                Find My Savings
              </Link>
            </div>
          )}

          <div className="flex shrink-0 items-center gap-3 md:gap-4">
            <Link
              href="/search"
              className={`inline-flex rounded-lg p-2 text-millennial-text-muted transition-colors hover:bg-millennial-primary-light/30 hover:text-millennial-text dark:hover:bg-slate-800 ${
                pathname === '/search' ? 'text-millennial-cta-primary dark:text-cyan-400' : ''
              }`}
              aria-label="Search"
            >
              <MagnifyingGlass weight="duotone" size={20} aria-hidden />
            </Link>
            {isJourneyPage ? (
              <span className="text-xs font-semibold text-millennial-cta-primary md:hidden dark:text-cyan-400">Journey</span>
            ) : null}
            {isAuthenticated ? (
              <ErrorBoundary fallback={null}>
                <div className="flex items-center gap-3 md:gap-4">
                  {/* Streak badge hidden on md to keep the menu on one line; visible from lg up. */}
                  {isJourneyPage ? (
                    <div className="hidden lg:block ml-3 border-l border-[var(--nq-ed-line-soft)] pl-3">
                      <VisitStreakBadge />
                    </div>
                  ) : null}
                  <UserMenu className="hidden md:block" />
                </div>
              </ErrorBoundary>
            ) : (
              <>
                <Link
                  href="/auth?mode=signin"
                  className="hidden md:inline-flex items-center justify-center rounded-xl border-2 border-millennial-border bg-white px-4 py-2.5 text-sm font-medium text-millennial-cta-secondary transition-colors hover:border-millennial-primary hover:bg-millennial-primary-light/25 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  Sign In
                </Link>
              </>
            )}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-lg p-2 text-millennial-text-muted hover:bg-millennial-primary-light/30 hover:text-millennial-text md:hidden"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X weight="duotone" size={24} aria-hidden /> : <Hamburger weight="duotone" size={24} aria-hidden />}
            </button>
          </div>
        </div>

        <div
          className={`relative z-[120] overflow-hidden bg-white md:hidden transition-[max-height,opacity] duration-200 ease-out ${
            mobileOpen
              ? 'max-h-[min(80vh,720px)] border-t border-millennial-border opacity-100'
              : 'pointer-events-none max-h-0 border-t-0 opacity-0'
          }`}
          aria-hidden={!mobileOpen}
        >
          {mobileOpen ? (
              <div className="space-y-1 py-4">
                <Link
                  href="/search"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-lg font-medium hover:bg-millennial-primary-light/25 ${
                    pathname === '/search' ? 'font-semibold text-millennial-cta-primary' : 'text-millennial-text'
                  }`}
                >
                  <MagnifyingGlass weight="duotone" size={20} className="shrink-0 opacity-80" aria-hidden />
                  Search
                </Link>
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className={mobileMenuTabClass(pathname === '/dashboard')}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/customized-journey?tab=today"
                      onClick={() => setMobileOpen(false)}
                      className={mobileMenuTabClass(isJourneyPage)}
                    >
                      My Journey
                    </Link>
                    <Link
                      href={resourcesNavHref}
                      onClick={() => setMobileOpen(false)}
                      className={mobileMenuTabClass(pathname === '/resources')}
                    >
                      Guides
                    </Link>
                    <Link
                      href="/down-payment-optimizer"
                      onClick={() => setMobileOpen(false)}
                      className={mobileMenuTabClass(pathname === '/down-payment-optimizer')}
                    >
                      Find Funds
                    </Link>
                    <Link
                      href="/marketplace"
                      onClick={() => setMobileOpen(false)}
                      className={mobileMenuTabClass(pathname === '/marketplace')}
                    >
                      Tools &amp; Partners
                    </Link>
                    <Link
                      href="/inbox"
                      onClick={() => setMobileOpen(false)}
                      className={mobileMenuTabClass(pathname === '/inbox')}
                    >
                      Inbox
                    </Link>
                    <Link
                      href="/for-professionals"
                      onClick={() => setMobileOpen(false)}
                      className={mobileMenuTabClass(pathname === '/for-professionals')}
                    >
                      For organizations
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-lg px-4 py-2.5 text-lg font-medium text-millennial-text hover:bg-millennial-primary-light/25"
                    >
                      Profile
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/"
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-lg px-4 py-2.5 text-lg font-medium text-millennial-text hover:bg-millennial-primary-light/25"
                    >
                      Home
                    </Link>
                    <Link
                      href="/how-it-works"
                      onClick={() => setMobileOpen(false)}
                      className={`block rounded-lg px-4 py-2.5 text-lg font-medium hover:bg-millennial-primary-light/25 ${
                        pathname === '/how-it-works'
                          ? 'font-semibold text-millennial-cta-primary'
                          : 'text-millennial-text'
                      }`}
                    >
                      How It Works
                    </Link>
                    <Link
                      href={resourcesNavHref}
                      onClick={() => setMobileOpen(false)}
                      className={mobileMenuTabClass(pathname === '/resources')}
                    >
                      Guides
                    </Link>
                    <Link
                      href="/for-professionals"
                      onClick={() => setMobileOpen(false)}
                      className={mobileMenuTabClass(pathname === '/for-professionals')}
                    >
                      For organizations
                    </Link>
                    <Link
                      href={SIGNUP_DISABLED ? '/quiz' : '/auth?mode=signup&redirect=%2Fquiz'}
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-lg px-4 py-2.5 text-lg font-semibold text-millennial-cta-primary hover:bg-millennial-primary-light/30"
                    >
                      Find My Savings
                    </Link>
                  </>
                )}
                {isAuthenticated ? null : (
                  <div className="mt-3 space-y-2 border-t border-millennial-border px-4 pt-3">
                    <Link
                      href="/auth?mode=signin"
                      onClick={() => setMobileOpen(false)}
                      className="block w-full rounded-lg border-2 border-millennial-border py-2.5 text-center font-medium text-millennial-cta-secondary transition-colors hover:bg-millennial-primary-light/25"
                    >
                      Sign In
                    </Link>
                  </div>
                )}
              </div>
          ) : null}
        </div>
      </nav>
    </header>
    {isJourneyPage ? <JourneyNav activeTab={activeJourneyTab} /> : null}
    </>
  )
}

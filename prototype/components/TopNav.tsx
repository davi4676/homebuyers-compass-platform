'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'
import { motion, AnimatePresence } from 'framer-motion'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { UserMenu } from '@/components/auth/UserMenu'
import { useAuth } from '@/lib/hooks/useAuth'
import { useJourneyNavChrome } from '@/components/JourneyNavChromeContext'
import { parseJourneyTabParam, JOURNEY_PAGE_PATH } from '@/lib/journey-nav-tabs'
import JourneyTabBar from '@/components/journeys/JourneyTabBar'
import TierBadge from '@/components/TierBadge'
import MindsetTag from '@/components/journey/MindsetTag'
import MoneyTracker from '@/components/journey/MoneyTracker'
import { SIGNUP_DISABLED } from '@/lib/auth-flags'
import { getUserTier } from '@/lib/user-tracking'
import type { UserTier } from '@/lib/tiers'
import { TIER_DEFINITIONS } from '@/lib/tiers'

export default function TopNav() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { isAuthenticated } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [journeyHeaderTier, setJourneyHeaderTier] = useState<UserTier>('foundations')
  const { chrome, resetJourneyNavChrome } = useJourneyNavChrome()

  const isJourneyPage = pathname === JOURNEY_PAGE_PATH
  const journeySearchKey = searchParams.toString()
  const activeJourneyTab = parseJourneyTabParam(
    new URLSearchParams(journeySearchKey).get('tab')
  )

  useEffect(() => {
    if (!isJourneyPage) {
      resetJourneyNavChrome()
    }
  }, [isJourneyPage, resetJourneyNavChrome])

  useEffect(() => {
    if (!isJourneyPage || typeof window === 'undefined') return
    setJourneyHeaderTier(getUserTier())
    const onTier = (e: Event) => {
      const t = (e as CustomEvent<{ tier?: UserTier }>).detail?.tier
      if (t && t in TIER_DEFINITIONS) setJourneyHeaderTier(t)
    }
    window.addEventListener('tierChanged', onTier)
    return () => window.removeEventListener('tierChanged', onTier)
  }, [isJourneyPage])

  return (
    <header className="sticky top-0 z-[100] w-full border-b border-gray-200 bg-white">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-2 md:h-16">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 text-brand-forest transition-colors hover:text-brand-sage dark:text-cyan-400 dark:hover:text-cyan-300"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-forest text-white md:h-10 md:w-10 dark:bg-cyan-600">
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
              <span className="text-base font-semibold tracking-tight text-brand-forest md:text-lg dark:text-cyan-400">
                NestQuest
              </span>
              <span className="hidden text-xs font-normal text-gray-500 md:block dark:text-slate-400">
                Your Home Buying Advocate
              </span>
            </span>
          </Link>

          {isJourneyPage ? (
            <div className="hidden min-w-0 flex-1 items-center justify-center gap-2 px-2 md:flex md:flex-wrap">
              <p className="text-sm font-semibold tracking-tight text-slate-600">Customized Journey</p>
              <TierBadge tier={journeyHeaderTier} compact className="hidden max-w-[200px] scale-[0.92] lg:flex" />
              <MindsetTag
                compact
                className="hidden max-w-[min(100%,280px)] xl:flex"
                mindset={TIER_DEFINITIONS[journeyHeaderTier].mindset}
              />
            </div>
          ) : isAuthenticated ? (
            <div className="hidden md:flex md:flex-1 md:items-center md:justify-center md:gap-6 lg:gap-8">
              <Link
                href="/dashboard"
                className={`text-nav font-medium transition-colors ${
                  pathname === '/dashboard' ? 'text-brand-forest dark:text-white' : 'text-slate-600 hover:text-brand-forest dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/customized-journey"
                className={`text-nav font-medium transition-colors ${
                  pathname === '/customized-journey'
                    ? 'text-brand-forest dark:text-white'
                    : 'text-slate-600 hover:text-brand-forest dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                My Journey
              </Link>
              <Link
                href="/down-payment-optimizer"
                className={`text-nav font-medium transition-colors ${
                  pathname === '/down-payment-optimizer'
                    ? 'text-brand-forest dark:text-white'
                    : 'text-slate-600 hover:text-brand-forest dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                Find Funds
              </Link>
              <Link
                href="/marketplace"
                className={`text-nav font-medium transition-colors ${
                  pathname === '/marketplace'
                    ? 'text-brand-forest dark:text-white'
                    : 'text-slate-600 hover:text-brand-forest dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                Marketplace
              </Link>
              <Link
                href="/inbox"
                className={`text-nav font-medium transition-colors ${
                  pathname === '/inbox'
                    ? 'text-brand-forest dark:text-white'
                    : 'text-slate-600 hover:text-brand-forest dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                Inbox
              </Link>
            </div>
          ) : (
            <div className="hidden md:flex md:flex-1 md:items-center md:justify-center md:gap-8">
              <Link
                href="/#how-it-works"
                className="text-nav font-medium text-slate-600 transition-colors hover:text-brand-forest dark:text-slate-300 dark:hover:text-white"
              >
                How It Works
              </Link>
              <Link
                href={SIGNUP_DISABLED ? '/quiz' : '/auth?mode=signup&redirect=%2Fquiz'}
                className="rounded-lg bg-brand-forest px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-sage dark:bg-cyan-600 dark:hover:bg-cyan-500"
              >
                Find My Savings
              </Link>
            </div>
          )}

          <div className="flex shrink-0 items-center gap-2 md:gap-3">
            {isJourneyPage ? (
              <span className="text-xs font-semibold text-brand-forest md:hidden dark:text-cyan-400">Journey</span>
            ) : null}
            <ThemeToggle className="hidden sm:inline-flex" />
            {isAuthenticated ? (
              <ErrorBoundary fallback={null}>
                <UserMenu className="hidden md:block" />
              </ErrorBoundary>
            ) : (
              <>
                <Link
                  href="/auth?mode=signin"
                  className="hidden md:inline-flex items-center justify-center rounded-lg border border-brand-sage/40 bg-white px-4 py-2.5 text-sm font-medium text-brand-forest transition-colors hover:bg-brand-mist dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  Sign In
                </Link>
              </>
            )}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 md:hidden"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isJourneyPage ? (
          <>
            <div className="border-t border-slate-100 bg-gradient-to-b from-slate-50/90 to-white">
              <div className="px-1 py-0.5 sm:px-2">
                <JourneyTabBar activeTab={activeJourneyTab} />
              </div>
            </div>
            <div className="h-1 w-full overflow-hidden bg-slate-100" aria-hidden>
              <motion.div
                className="h-full bg-gradient-to-r from-sky-500 via-indigo-500 to-teal-500"
                initial={false}
                animate={{ width: `${Math.max(0, Math.min(100, chrome.phaseProgressPct))}%` }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            {chrome.moneyTotals ? (
              <div className="border-t border-slate-100 bg-white px-3 py-2 sm:px-4">
                <MoneyTracker compact totals={chrome.moneyTotals} />
              </div>
            ) : null}
          </>
        ) : null}

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-gray-200 md:hidden"
            >
              <div className="space-y-1 py-4">
                {isJourneyPage ? (
                  <>
                    <p className="px-4 text-xs font-bold uppercase tracking-wide text-slate-500">Also on NestQuest</p>
                    <Link
                      href="/"
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-lg px-4 py-2.5 text-lg font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Home
                    </Link>
                    <Link
                      href="/customized-journey?tab=overview"
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-lg px-4 py-2.5 text-lg font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Overview &amp; snapshot
                    </Link>
                    <Link
                      href="/results"
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-lg px-4 py-2.5 text-base font-medium italic text-gray-600 hover:bg-gray-50"
                    >
                      Edit full snapshot (results)
                    </Link>
                    <Link
                      href="/customized-journey?tab=inbox"
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-lg px-4 py-2.5 text-lg font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Inbox
                    </Link>
                    <Link
                      href="/customized-journey?tab=learn"
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-lg px-4 py-2.5 text-lg font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Learn
                    </Link>
                    <Link
                      href="/customized-journey?tab=library"
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-lg px-4 py-2.5 text-lg font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Library
                    </Link>
                    <Link
                      href="/customized-journey?tab=upgrades"
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-lg px-4 py-2.5 text-lg font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Upgrades
                    </Link>
                    <Link
                      href="/resources"
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-lg px-4 py-2.5 text-lg font-medium text-gray-700 hover:bg-gray-50"
                    >
                      All resources (site)
                    </Link>
                  </>
                ) : isAuthenticated ? (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-lg px-4 py-2.5 text-lg font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/customized-journey"
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-lg px-4 py-2.5 text-lg font-medium text-gray-700 hover:bg-gray-50"
                    >
                      My Journey
                    </Link>
                    <Link
                      href="/down-payment-optimizer"
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-lg px-4 py-2.5 text-lg font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Find Funds
                    </Link>
                    <Link
                      href="/marketplace"
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-lg px-4 py-2.5 text-lg font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Marketplace
                    </Link>
                    <Link
                      href="/inbox"
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-lg px-4 py-2.5 text-lg font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Inbox
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-lg px-4 py-2.5 text-lg font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Profile
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/"
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-lg px-4 py-2.5 text-lg font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Home
                    </Link>
                    <Link
                      href="/#how-it-works"
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-lg px-4 py-2.5 text-lg font-medium text-gray-700 hover:bg-gray-50"
                    >
                      How It Works
                    </Link>
                    <Link
                      href={SIGNUP_DISABLED ? '/quiz' : '/auth?mode=signup&redirect=%2Fquiz'}
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-lg px-4 py-2.5 text-lg font-semibold text-brand-forest hover:bg-brand-mist"
                    >
                      Find My Savings
                    </Link>
                    <div className="px-4 py-2">
                      <ThemeToggle className="w-full" />
                    </div>
                  </>
                )}
                {!isJourneyPage && (
                <div className="mt-3 space-y-2 border-t border-gray-200 px-4 pt-3">
                  {isAuthenticated ? null : (
                    <Link
                      href="/auth?mode=signin"
                      onClick={() => setMobileOpen(false)}
                      className="block w-full rounded-lg border border-brand-sage/40 py-2.5 text-center font-medium text-brand-forest transition-colors hover:bg-brand-mist"
                    >
                      Sign In
                    </Link>
                  )}
                </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  )
}

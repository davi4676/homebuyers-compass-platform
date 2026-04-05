'use client'

import { ReactNode, Suspense } from 'react'
import clsx from 'clsx'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import DeveloperTierSwitcher from './DeveloperTierSwitcher'
import { ErrorBoundary } from './ErrorBoundary'
import { JourneyProvider } from './JourneyProvider'
import JourneyProfilePanel from './JourneyProfilePanel'
import { HomebuyerChatbotWidget } from './chatbot'
import BlinkProvider from './BlinkProvider'
import CookieConsent from './CookieConsent'
import OfflineIndicator from './OfflineIndicator'
import TopNav from './TopNav'
import StickyMobileCta from './StickyMobileCta'
import Link from 'next/link'
import { shouldShowLandingQuizMobileSticky } from '@/lib/mobile-marketing-cta'
import { JourneyNavChromeProvider } from './JourneyNavChromeContext'
import { TierMindsetProvider } from './tier-mindset/TierMindsetProvider'

const EmptyFallback = () => (
  <div className="app-page-shell flex flex-col items-center justify-center p-8 text-center">
    <h1 className="mb-2 font-display text-2xl font-bold text-[rgb(var(--navy))]">NestQuest</h1>
    <p className="mb-4 text-millennial-text-muted">Loading...</p>
    <Link href="/quiz" className="font-semibold text-millennial-cta-primary hover:underline">
      Start assessment →
    </Link>
  </div>
)

export default function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()
  const reserveMobileStickyCta = shouldShowLandingQuizMobileSticky(pathname, isAuthenticated)

  return (
    <div
      id="main-content"
      className={clsx('app-page-shell', reserveMobileStickyCta && 'pb-24 md:pb-0')}
      tabIndex={-1}
    >
      <ErrorBoundary
        fallback={
          <div className="app-page-shell flex flex-col items-center justify-center p-8 text-center">
            <p className="mb-2 text-xl font-semibold text-rose-600">Something went wrong loading this page.</p>
            <Link href="/" className="mt-4 font-semibold text-millennial-cta-primary hover:underline">
              ← Back to home
            </Link>
          </div>
        }
      >
        <BlinkProvider>
          <JourneyProvider>
            <TierMindsetProvider>
            <JourneyNavChromeProvider>
              <Suspense
                fallback={
                  <header className="sticky top-0 z-50 h-14 w-full border-b border-millennial-border bg-white/95 backdrop-blur" />
                }
              >
                <TopNav />
              </Suspense>
              {children ?? <EmptyFallback />}
              <JourneyProfilePanel />
            </JourneyNavChromeProvider>
            </TierMindsetProvider>
          </JourneyProvider>
        </BlinkProvider>
      </ErrorBoundary>
      <StickyMobileCta />
      <HomebuyerChatbotWidget />
      <CookieConsent />
      <OfflineIndicator />
      {process.env.NODE_ENV === 'development' ? <DeveloperTierSwitcher /> : null}
    </div>
  )
}

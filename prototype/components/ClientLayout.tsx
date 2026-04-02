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
import { JourneyNavChromeProvider } from './JourneyNavChromeContext'
import { TierMindsetProvider } from './tier-mindset/TierMindsetProvider'

const EmptyFallback = () => (
  <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-[rgb(var(--sky-light))]">
    <h1 className="text-2xl font-bold text-[rgb(var(--navy))] mb-2">NestQuest</h1>
    <p className="text-slate-600 mb-4">Loading...</p>
    <Link href="/quiz" className="text-[rgb(var(--coral))] hover:underline font-semibold">Start assessment →</Link>
  </div>
)

export default function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()
  const reserveMobileStickyCta = pathname === '/' && !isAuthenticated

  return (
    <div
      id="main-content"
      className={clsx(
        'min-h-screen bg-brand-cream text-brand-charcoal dark:bg-darkaccent-bg dark:text-slate-100',
        reserveMobileStickyCta && 'pb-16 md:pb-0'
      )}
      tabIndex={-1}
    >
      <ErrorBoundary
        fallback={
          <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-[rgb(var(--sky-light))]">
            <p className="text-xl font-semibold text-rose-600 mb-2">Something went wrong loading this page.</p>
            <Link href="/" className="text-[rgb(var(--coral))] hover:underline mt-4 font-semibold">← Back to home</Link>
          </div>
        }
      >
        <BlinkProvider>
          <JourneyProvider>
            <TierMindsetProvider>
            <JourneyNavChromeProvider>
              <Suspense
                fallback={<header className="sticky top-0 z-50 h-14 w-full border-b border-gray-200 bg-white" />}
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
      <DeveloperTierSwitcher />
    </div>
  )
}

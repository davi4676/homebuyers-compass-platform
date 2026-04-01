import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import ClientLayout from '@/components/ClientLayout'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
})

export const metadata: Metadata = {
  title: { default: "NestQuest Platform", template: "%s | NestQuest" },
  description: 'AI-Driven Ecosystem Connecting Ready Buyers with Vetted Professionals',
  keywords: ['homebuyer', 'mortgage', 'refinance', 'first-time buyer', 'real estate'],
  authors: [{ name: "NestQuest" }],
  openGraph: {
    title: "NestQuest Platform",
    description: 'AI-Driven Ecosystem Connecting Ready Buyers with Vetted Professionals',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: "NestQuest Platform" },
  robots: { index: true, follow: true },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="min-h-full" suppressHydrationWarning>
      <Script id="nq-theme-init" strategy="beforeInteractive">
        {`(function(){try{var k='nq-theme',v=localStorage.getItem(k);if(v==='dark')document.documentElement.classList.add('dark');else document.documentElement.classList.remove('dark');}catch(e){}})()`}
      </Script>
      <body
        className={`${dmSans.variable} ${dmSans.className} min-h-full antialiased font-sans bg-brand-cream text-brand-charcoal dark:bg-darkaccent-bg dark:text-slate-100`}
      >
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <ClientLayout>{children}</ClientLayout>
        <noscript>
          <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', padding: '2rem', background: '#f8fafc', color: '#0f172a', fontFamily: 'sans-serif', textAlign: 'center' }}>
            <p style={{ fontSize: '1.25rem' }}>JavaScript is required to run this app.</p>
            <a href="/quiz" style={{ color: '#06b6d4', textDecoration: 'underline' }}>Start assessment →</a>
          </div>
        </noscript>
      </body>
    </html>
  )
}


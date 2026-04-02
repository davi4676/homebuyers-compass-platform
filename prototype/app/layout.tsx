import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import './globals.css'
import ClientLayout from '@/components/ClientLayout'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
})

const siteTitle = 'NestQuest — Save $10,000–$15,000 on Your Home Purchase'
const siteDescription =
  "NestQuest is a free personalized homebuying guide that finds hidden funds, simplifies every step, and helps you save $10,000–$15,000 on your home purchase."

export const metadata: Metadata = {
  title: { default: siteTitle, template: '%s | NestQuest' },
  description: siteDescription,
  keywords: ['homebuyer', 'mortgage', 'refinance', 'first-time buyer', 'real estate'],
  authors: [{ name: 'NestQuest' }],
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: siteTitle, description: siteDescription },
  robots: { index: true, follow: true },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const themeInit = `(function(){try{var k='nq-theme',v=localStorage.getItem(k);if(v==='dark')document.documentElement.classList.add('dark');else document.documentElement.classList.remove('dark');}catch(e){}})()`

  return (
    <html lang="en" className="min-h-full" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Lora:wght@600;700&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
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


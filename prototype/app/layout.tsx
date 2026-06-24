import type { Metadata } from 'next'
import { Manrope } from 'next/font/google'
import './globals.css'
import './nq-editorial-theme.css'
import ClientLayout from '@/components/ClientLayout'

const nqBody = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-nq-body',
  display: 'swap',
})

const siteTitle = 'NestQuest — Typical savings opportunities of $8k–$15k'
const siteDescription =
  'NestQuest is your home buying advocate — finding grants, programs, and savings opportunities that first-time buyers typically surface in the $8k–$15k range. No affiliate kickbacks. No hidden agendas.'

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
  const themeInit = `(function(){try{document.documentElement.classList.remove('dark');}catch(e){}})()`

  return (
    <html lang="en" className={`min-h-full ${nqBody.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body
        className={`${nqBody.className} font-body min-h-full antialiased bg-millennial-bg text-millennial-text font-normal`}
      >
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <ClientLayout>{children}</ClientLayout>
        <noscript>
          <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', padding: '2rem', background: '#f8fafc', color: '#0f172a', fontFamily: 'Manrope, system-ui, sans-serif', textAlign: 'center' }}>
            <p style={{ fontSize: '1.25rem' }}>JavaScript is required to run this app.</p>
            <a href="/quiz" style={{ color: '#06b6d4', textDecoration: 'underline' }}>Start assessment →</a>
          </div>
        </noscript>
      </body>
    </html>
  )
}

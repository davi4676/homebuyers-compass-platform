import Link from 'next/link'
import BackToMyJourneyLink from '@/components/BackToMyJourneyLink'

export const metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy and cookie usage for NestQuest Platform.',
}

export default function PrivacyPage() {
  return (
    <div className="app-page-shell">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="mb-6">
          <BackToMyJourneyLink />
        </div>
        <h1 className="font-display text-3xl font-bold text-[#1c1917] mb-6">Privacy Policy</h1>
        <div className="space-y-4 text-[#57534e] text-sm leading-relaxed">
          <p>
            NestQuest collects information you provide (such as quiz inputs, account details, and messages you send)
            to personalize your experience and improve our tools. We use industry-standard practices to protect your
            data and do not sell your personal information.
          </p>
          <p>
            We use cookies and local storage to remember preferences, keep you signed in where applicable, and measure
            product usage in aggregate. You can control cookies through your browser settings.
          </p>
          <p>
            Third-party services (for example payment processing or analytics) may process data under their own
            policies when you use those features. Review their terms before connecting accounts or completing checkout.
          </p>
          <p>
            For questions about this policy or to request changes to your data, contact us through the support options
            in the app. We may update this page as the product evolves; the date at the top of your session reflects
            the current prototype.
          </p>
        </div>
        <Link
          href="/"
          className="mt-8 inline-block text-sm font-semibold text-[#0d9488] hover:underline"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  )
}

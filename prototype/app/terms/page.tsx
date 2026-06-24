import Link from 'next/link'
import BackToMyJourneyLink from '@/components/BackToMyJourneyLink'

export const metadata = {
  title: 'Terms of Service',
  description: 'Terms of service for NestQuest Platform.',
}

export default function TermsPage() {
  return (
    <div className="app-page-shell">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="mb-6">
          <BackToMyJourneyLink />
        </div>
        <h1 className="font-display text-3xl font-bold text-[#1c1917] mb-2">Terms of Service</h1>
        <p className="mb-6 text-xs text-[#78716c]">
          Last updated: prototype build — replace with counsel-reviewed terms before production launch.
        </p>
        <div className="space-y-6 text-[#57534e] text-sm leading-relaxed">
          <section>
            <h2 className="mb-2 font-semibold text-[#1c1917]">1. About NestQuest</h2>
            <p>
              NestQuest provides educational tools, calculators, and guidance to help homebuyers understand
              their options. NestQuest is not a lender, mortgage broker, real estate broker, or financial
              advisor. We do not originate loans, negotiate transactions on your behalf, or provide legal or
              tax advice.
            </p>
          </section>
          <section>
            <h2 className="mb-2 font-semibold text-[#1c1917]">2. Your account</h2>
            <p>
              You are responsible for keeping your login credentials secure and for activity under your
              account. You must provide accurate information when creating an account or completing
              assessments. We may suspend or terminate accounts that violate these terms or misuse the service.
            </p>
          </section>
          <section>
            <h2 className="mb-2 font-semibold text-[#1c1917]">3. Subscriptions and billing</h2>
            <p>
              Optional paid plans (such as Momentum or Navigator+) are described on the{' '}
              <Link href="/upgrade" className="font-semibold text-[#0d9488] hover:underline">
                upgrade page
              </Link>
              . Paid subscriptions renew according to the plan you select unless you cancel or pause through{' '}
              <Link href="/account/billing" className="font-semibold text-[#0d9488] hover:underline">
                billing settings
              </Link>
              . Refund policies, if any, are stated at checkout.
            </p>
          </section>
          <section>
            <h2 className="mb-2 font-semibold text-[#1c1917]">4. No referral fees</h2>
            <p>
              NestQuest does not accept referral fees, commissions, or kickbacks from lenders, real estate
              agents, or title companies based on your transaction. Recommendations are generated from your
              inputs and our methodology — not from paid placement. See our{' '}
              <Link href="/resources#phase-methodology" className="font-semibold text-[#0d9488] hover:underline">
                bias-free methodology
              </Link>{' '}
              in Guides for more detail.
            </p>
          </section>
          <section>
            <h2 className="mb-2 font-semibold text-[#1c1917]">5. Educational use only</h2>
            <p>
              Savings estimates, program matches, scripts, and checklists are for planning and education.
              Actual rates, fees, program eligibility, and closing costs depend on your lender, location, and
              deal. Always verify numbers with licensed professionals before making financial decisions.
            </p>
          </section>
          <section>
            <h2 className="mb-2 font-semibold text-[#1c1917]">6. Limitation of liability</h2>
            <p>
              NestQuest is provided &ldquo;as is&rdquo; without warranties of any kind. To the fullest extent
              permitted by law, NestQuest is not liable for indirect, incidental, or consequential damages
              arising from your use of the service, including decisions made based on estimates or guidance
              shown in the product.
            </p>
          </section>
          <section>
            <h2 className="mb-2 font-semibold text-[#1c1917]">7. Privacy</h2>
            <p>
              Our collection and use of personal information is described in the{' '}
              <Link href="/privacy" className="font-semibold text-[#0d9488] hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </section>
          <section>
            <h2 className="mb-2 font-semibold text-[#1c1917]">8. Changes and contact</h2>
            <p>
              We may update these terms as the product evolves. Continued use after changes constitutes
              acceptance of the updated terms. For questions, contact us through the support options in the
              app.
            </p>
          </section>
          <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
            <strong>Not legal advice.</strong> This page is prototype copy for demonstration. Have qualified
            counsel review and replace before a public production launch.
          </p>
        </div>
        <div className="mt-8 flex flex-wrap gap-4 text-sm">
          <Link href="/privacy" className="font-semibold text-[#0d9488] hover:underline">
            Privacy Policy
          </Link>
          <Link href="/" className="font-semibold text-[#0d9488] hover:underline">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}

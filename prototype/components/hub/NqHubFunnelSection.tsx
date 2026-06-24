'use client'

import NqFunnelSteps, { type FunnelStep } from '@/components/landing/NqFunnelSteps'
import NqOfferRail, { type OfferCard } from '@/components/landing/NqOfferRail'
import NqTrustPills from '@/components/landing/NqTrustPills'
import { HUB_TRUST_PILLS } from '@/lib/hub-trust-pills'

type Props = {
  funnelTitle?: string
  offerTitle?: string
  steps: FunnelStep[]
  funnelCta: { href: string; label: string; onClick?: () => void }
  offers: OfferCard[]
  trustPills?: string[]
}

export default function NqHubFunnelSection({
  funnelTitle = 'How this fits your journey',
  offerTitle = 'Keep moving forward',
  steps,
  funnelCta,
  offers,
  trustPills = [...HUB_TRUST_PILLS],
}: Props) {
  return (
    <>
      <section className="nq-sl-section">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="nq-sl-section-title">{offerTitle}</h2>
          <div className="mt-5">
            <NqOfferRail offers={offers} />
          </div>
          <div className="mt-6">
            <NqTrustPills items={trustPills} />
          </div>
        </div>
      </section>

      <section className="nq-sl-section bg-[color-mix(in_srgb,var(--nq-ed-surface)_60%,transparent)]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="nq-sl-section-title mb-6">{funnelTitle}</h2>
          <NqFunnelSteps
            steps={steps}
            ctaHref={funnelCta.href}
            ctaLabel={funnelCta.label}
            onCtaClick={funnelCta.onClick}
          />
        </div>
      </section>
    </>
  )
}

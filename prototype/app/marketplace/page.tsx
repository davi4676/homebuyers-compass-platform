'use client'

import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import BackToMyJourneyLink from '@/components/BackToMyJourneyLink'
import NqHubTabLayout from '@/components/hub/NqHubTabLayout'
import PartnerCard from '@/components/revenue/PartnerCard'
import {
  MARKETPLACE_CATEGORY_LABELS,
  MARKETPLACE_PARTNERS,
  type MarketplacePartner,
} from '@/lib/marketplace-partners'

function groupByCategory(partners: MarketplacePartner[]) {
  const groups = new Map<MarketplacePartner['category'], MarketplacePartner[]>()
  for (const p of partners) {
    const list = groups.get(p.category) ?? []
    list.push(p)
    groups.set(p.category, list)
  }
  return groups
}

export default function MarketplacePage() {
  const grouped = groupByCategory(MARKETPLACE_PARTNERS)

  return (
    <NqHubTabLayout
      tab="tools"
      backLink={<BackToMyJourneyLink className="font-semibold" />}
      maxWidth="5xl"
      glassCard={
        <div className="nq-glass nq-savings-glass text-center sm:text-left">
          <p className="nq-savings-glass-label">Trusted resources</p>
          <p className="nq-savings-glass-amount !text-2xl sm:!text-3xl">No referral fees</p>
          <p className="mt-2 text-sm text-[var(--nq-ed-muted)]">
            Official directories and NestQuest guides — transparent, educational links only. Rated service marketplace
            coming later.
          </p>
        </div>
      }
    >
      <p className="mb-6 text-sm leading-relaxed text-[var(--nq-ed-muted)]">
        NestQuest is not a lender, agent, or title company. These links help you compare and prepare — always verify
        quotes with licensed professionals.{' '}
        <Link href="/resources#phase-methodology" className="font-semibold text-[var(--nq-ed-accent)] hover:underline">
          Our methodology
        </Link>
      </p>

      <div className="space-y-10">
        {Array.from(grouped.entries()).map(([category, partners]) => (
          <section key={category}>
            <h2 className="font-display text-lg font-bold text-[var(--nq-ed-text)]">
              {MARKETPLACE_CATEGORY_LABELS[category]}
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {partners.map((p) => (
                <div key={p.id} className="relative">
                  <PartnerCard
                    partnerName={p.name}
                    tagline={p.tagline}
                    primaryStat={p.primaryStat}
                    primaryStatLabel={p.primaryStatLabel}
                    ctaText={p.ctaText}
                    ctaHref={p.ctaHref}
                    isSponsored={false}
                  />
                  {p.external ? (
                    <p className="mt-2 flex items-center gap-1 text-xs text-[var(--nq-ed-muted)]">
                      <ExternalLink className="h-3 w-3" aria-hidden />
                      Opens official site
                    </p>
                  ) : null}
                  {p.note ? <p className="mt-1 text-xs text-[var(--nq-ed-muted)]">{p.note}</p> : null}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-10 text-center text-sm text-[var(--nq-ed-muted)]">
        Want to share your experience?{' '}
        <Link href="/share-your-story" className="font-semibold text-[var(--nq-ed-accent)] hover:underline">
          Tell us your story
        </Link>
      </p>
    </NqHubTabLayout>
  )
}

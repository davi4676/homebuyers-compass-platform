'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export type OfferCard = {
  name: string
  amount: string
  amountNote: string
  tag: string
  desc: string
  href: string
  cta: string
  imageSrc?: string
  imageAlt?: string
  imagePosition?: string
}

type Props = {
  offers: OfferCard[]
  onCtaClick?: (id: string) => void
}

export default function NqOfferRail({ offers, onCtaClick }: Props) {
  return (
    <div className="nq-sl-offer-rail" role="list">
      {offers.map((offer) => (
        <Link
          key={offer.name}
          href={offer.href}
          onClick={() => onCtaClick?.(offer.name)}
          className="nq-sl-offer-card"
          role="listitem"
        >
          {offer.imageSrc ? (
            <div className="nq-sl-offer-card-image">
              <img
                src={offer.imageSrc}
                alt={offer.imageAlt ?? offer.name}
                loading="lazy"
                style={{ objectPosition: offer.imagePosition ?? 'center center' }}
              />
            </div>
          ) : null}
          <p className="nq-sl-offer-price">{offer.amount}</p>
          <p className="nq-sl-offer-price-note">{offer.amountNote}</p>
          <span className="nq-sl-offer-tag">{offer.tag}</span>
          <p className="font-display mt-2 text-base font-bold text-[var(--nq-ed-text)]">{offer.name}</p>
          <p className="nq-sl-offer-desc">{offer.desc}</p>
          <span className="nq-sl-offer-link">
            {offer.cta}
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>
      ))}
    </div>
  )
}

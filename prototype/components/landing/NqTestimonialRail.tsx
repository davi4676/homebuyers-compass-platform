'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Star } from 'lucide-react'

const FALLBACK = [
  {
    name: 'James & Priya T.',
    location: 'Austin, TX',
    quote: 'We knew which fees to question before we signed. Same-day clarity on closing costs.',
    rating: 5,
  },
  {
    name: 'Maria C.',
    location: 'Phoenix, AZ',
    quote: 'Found county grant options I never knew existed. The quiz took under two minutes.',
    rating: 5,
  },
  {
    name: 'Danielle R.',
    location: 'Atlanta, GA',
    quote: 'Scripts made lender calls less scary. I compared three offers with confidence.',
    rating: 5,
  },
]

type Testimonial = { name: string; location: string; quote: string; rating: number }

export default function NqTestimonialRail() {
  const [items, setItems] = useState<Testimonial[]>(FALLBACK)

  useEffect(() => {
    void fetch('/api/testimonials')
      .then((r) => r.json())
      .then((data: { testimonials?: Testimonial[] }) => {
        if (Array.isArray(data.testimonials) && data.testimonials.length > 0) {
          setItems(data.testimonials)
        }
      })
      .catch(() => {
        /* keep fallback */
      })
  }, [])

  const doubled = [...items, ...items]

  return (
    <div className="nq-sl-testimonial-wrap" aria-label="Buyer testimonials">
      <div className="nq-sl-testimonial-track">
        {doubled.map((t, i) => (
          <article key={`${t.name}-${i}`} className="nq-sl-testimonial-card">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[var(--nq-ed-muted)]">
              NestQuest user story
            </p>
            <p className="mt-2 text-sm font-bold text-[var(--nq-ed-text)]">
              {t.name}, {t.location}
            </p>
            <div className="mt-2 flex gap-0.5" aria-label={`${t.rating} out of 5 stars`}>
              {[...Array(t.rating)].map((_, j) => (
                <Star key={j} className="h-3 w-3 fill-[var(--nq-ed-gold)] text-[var(--nq-ed-gold)]" />
              ))}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[var(--nq-ed-muted)]">&ldquo;{t.quote}&rdquo;</p>
          </article>
        ))}
      </div>
      <p className="mt-4 text-center text-xs text-[var(--nq-ed-muted)]">
        <Link href="/share-your-story" className="font-semibold text-[var(--nq-ed-accent)] hover:underline">
          Share your story
        </Link>
        {' — '}reviewed before publishing
      </p>
    </div>
  )
}

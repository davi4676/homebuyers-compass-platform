'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export type FunnelStep = {
  num: string
  title: string
  desc: string
}

type Props = {
  steps: FunnelStep[]
  ctaHref: string
  ctaLabel: string
  onCtaClick?: () => void
}

export default function NqFunnelSteps({ steps, ctaHref, ctaLabel, onCtaClick }: Props) {
  return (
    <div>
      <div className="nq-sl-funnel">
        {steps.map((step) => (
          <div key={step.num} className="nq-sl-funnel-step">
            <p className="nq-sl-funnel-num">{step.num}</p>
            <h3 className="nq-sl-funnel-title">{step.title}</h3>
            <p className="nq-sl-funnel-desc">{step.desc}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 text-center">
        <Link href={ctaHref} onClick={onCtaClick} className="nq-sl-hero-cta">
          {ctaLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}

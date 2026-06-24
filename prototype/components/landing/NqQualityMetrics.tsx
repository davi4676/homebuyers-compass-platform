'use client'

import { useInView } from 'framer-motion'
import { useRef } from 'react'

const METRICS = [
  { label: 'Program coverage', value: 94 },
  { label: 'Fee transparency', value: 91 },
  { label: 'Negotiation readiness', value: 88 },
  { label: 'Buyer alignment', value: 100 },
]

export default function NqQualityMetrics() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <div ref={ref} className="nq-sl-metrics">
      <p className="mb-4 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[var(--nq-ed-muted)]">
        Internal content quality targets
      </p>
      {METRICS.map((m) => (
        <div key={m.label} className="nq-sl-metric-row">
          <span className="nq-sl-metric-label">{m.label}</span>
          <div className="nq-sl-metric-bar">
            {inView ? (
              <div
                className="nq-sl-metric-fill"
                style={{ width: `${m.value}%`, ['--nq-sl-fill' as string]: `${m.value}%` }}
              />
            ) : null}
          </div>
          <span className="nq-sl-metric-val">{m.value}%</span>
        </div>
      ))}
    </div>
  )
}

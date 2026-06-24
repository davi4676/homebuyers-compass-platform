'use client'

const ITEMS = [
  'Buyer guides available now',
  '2,000+ grant programs indexed',
  'No lender commissions',
  '90-second assessment',
  'Typical savings opportunities: $8k–$15k',
]

export default function NqMarqueeTicker() {
  const doubled = [...ITEMS, ...ITEMS]

  return (
    <div className="nq-sl-marquee" aria-hidden>
      <div className="nq-sl-marquee-track">
        {doubled.map((text, i) => (
          <span key={`${text}-${i}`} className="nq-sl-marquee-item">
            <span className="nq-sl-marquee-dot" />
            {text}
          </span>
        ))}
      </div>
    </div>
  )
}

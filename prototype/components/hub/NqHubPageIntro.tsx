import type { ReactNode } from 'react'
import NqTrustPills from '@/components/landing/NqTrustPills'
import { HUB_TRUST_PILLS } from '@/lib/hub-trust-pills'

type Props = {
  kicker?: string
  title: string
  description?: ReactNode
  showTrustPills?: boolean
  className?: string
}

export default function NqHubPageIntro({
  kicker,
  title,
  description,
  showTrustPills = true,
  className = '',
}: Props) {
  return (
    <div className={`nq-hub-panel p-5 sm:p-6 ${className}`.trim()}>
      {kicker ? <p className="nq-sl-brand-line">{kicker}</p> : null}
      <h2 className={`nq-sl-section-title ${kicker ? 'mt-2' : ''}`}>{title}</h2>
      {description ? (
        <div className="nq-sl-section-lede mt-2">{description}</div>
      ) : null}
      {showTrustPills ? (
        <div className="mt-4">
          <NqTrustPills items={[...HUB_TRUST_PILLS]} />
        </div>
      ) : null}
    </div>
  )
}

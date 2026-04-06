'use client'

import type { UserTier } from '@/lib/tiers'
import { TIER_DEFINITIONS } from '@/lib/tiers'
import UpgradeLockCallout from '@/components/monetization/UpgradeLockCallout'

type LockedFeatureCardProps = {
  title: string
  description: string
  /** Tier required to unlock; CTA uses next tier name from product ladder when omitted */
  nextTier?: UserTier
  upgradeHref?: string
  className?: string
  /** Show mindset line for the upgrade tier */
  showMindset?: boolean
  /** Custom mindset line (overrides structured MindsetTag block when set) */
  mindsetLine?: string
}

/**
 * Journey lock card — delegates to shared {@link UpgradeLockCallout} for visual consistency.
 */
export default function LockedFeatureCard({
  title,
  description,
  nextTier,
  upgradeHref,
  className = '',
  showMindset = true,
  mindsetLine,
}: LockedFeatureCardProps) {
  const tier = nextTier ?? 'momentum'
  const def = TIER_DEFINITIONS[tier]
  const href = upgradeHref ?? `/upgrade?source=journey-lock&tier=${tier}`

  let reason = description
  if (mindsetLine) {
    reason = `${description} “${mindsetLine}”`
  } else if (showMindset) {
    reason = `${description} ${def.name} mindset: “${def.mindset}”`
  }

  return (
    <UpgradeLockCallout
      className={className}
      lockedLabel={title}
      reason={reason}
      ctaLabel={`Unlock with ${def.name}`}
      ctaHref={href}
    />
  )
}

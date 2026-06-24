'use client'

import type { ReactNode } from 'react'
import NqHubPageShell from '@/components/hub/NqHubPageShell'
import NqHubModernHero from '@/components/hub/NqHubModernHero'
import NqHubTrustBar from '@/components/hub/NqHubTrustBar'
import NqHubFunnelSection from '@/components/hub/NqHubFunnelSection'
import { HUB_TAB_CONFIG, type HubTabId } from '@/lib/hub-tab-theme'

type Props = {
  tab: HubTabId
  backLink?: ReactNode
  glassCard?: ReactNode
  showHero?: boolean
  showTrustBar?: boolean
  showFunnel?: boolean
  compactHero?: boolean
  maxWidth?: '3xl' | '5xl' | '6xl'
  children: ReactNode
}

const MAX_W = {
  '3xl': 'max-w-3xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
} as const

export default function NqHubTabLayout({
  tab,
  backLink,
  glassCard,
  showHero = true,
  showTrustBar = true,
  showFunnel = true,
  compactHero = false,
  maxWidth = '5xl',
  children,
}: Props) {
  const config = HUB_TAB_CONFIG[tab]

  return (
    <NqHubPageShell backLink={backLink} maxWidth={maxWidth} showMarquee>
      {showHero ? (
        <NqHubModernHero
          brandLine={config.brandLine}
          title={config.title}
          titleAccent={config.titleAccent}
          subtitle={config.subtitle}
          imageSrc={config.imageSrc}
          imageAlt={config.imageAlt}
          imagePosition={config.imagePosition}
          cta={config.cta}
          glassCard={glassCard}
          compact={compactHero}
        />
      ) : null}
      {showTrustBar ? <NqHubTrustBar /> : null}
      <main className={`mx-auto ${MAX_W[maxWidth]} px-4 pb-16 sm:px-6`}>{children}</main>
      {showFunnel ? (
        <NqHubFunnelSection
          offerTitle={config.offerTitle}
          funnelTitle={config.funnelTitle}
          steps={config.funnel}
          funnelCta={config.funnelCta}
          offers={config.offers}
        />
      ) : null}
    </NqHubPageShell>
  )
}

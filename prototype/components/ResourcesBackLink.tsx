'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import BackToMyJourneyLink from '@/components/BackToMyJourneyLink'

function ResourcesBackLinkInner() {
  const searchParams = useSearchParams()
  const from = searchParams.get('from')
  if (from === 'home' || from === 'landing') {
    return (
      <BackToMyJourneyLink href="/">
        <span aria-hidden>←</span> Back to Home
      </BackToMyJourneyLink>
    )
  }
  return <BackToMyJourneyLink />
}

/** Playbooks: Back to Home when opened from landing (`?from=home` / `?from=landing`), else Back to My Journey. */
export default function ResourcesBackLink() {
  return (
    <Suspense
      fallback={
        <BackToMyJourneyLink />
      }
    >
      <ResourcesBackLinkInner />
    </Suspense>
  )
}

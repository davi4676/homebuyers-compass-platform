'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'

/** Small gray top-of-page back link — consistent across journey-adjacent inner pages. */
const BASE =
  'inline-flex items-center gap-0.5 text-left text-sm text-slate-500 transition-colors hover:text-slate-800'

type Props = {
  className?: string
  href?: string
  children?: ReactNode
}

export default function BackToMyJourneyLink({
  className = '',
  href = '/customized-journey',
  children,
}: Props) {
  return (
    <Link href={href} className={`${BASE} ${className}`.trim()}>
      {children ?? (
        <>
          <span aria-hidden>←</span> Back to My Journey
        </>
      )}
    </Link>
  )
}

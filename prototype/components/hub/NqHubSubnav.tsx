'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'

export type NqHubSubnavItem = {
  href?: string
  label: string
  active?: boolean
  icon?: ReactNode
}

type Props = {
  items: NqHubSubnavItem[]
  'aria-label'?: string
}

export default function NqHubSubnav({ items, 'aria-label': ariaLabel = 'Hub sections' }: Props) {
  return (
    <nav className="nq-hub-subnav" aria-label={ariaLabel}>
      {items.map((item) => {
        const content = (
          <>
            {item.icon}
            <span>{item.label}</span>
            {item.active ? <span className="nq-hub-subnav-dot" aria-hidden /> : null}
          </>
        )

        if (item.active || !item.href) {
          return (
            <span key={item.label} className="nq-hub-subnav-link is-active">
              {content}
            </span>
          )
        }

        return (
          <Link key={item.label} href={item.href} className="nq-hub-subnav-link">
            {content}
          </Link>
        )
      })}
    </nav>
  )
}

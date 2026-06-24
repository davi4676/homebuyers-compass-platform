'use client'

import Link from 'next/link'
import { House, MapTrifold, CurrencyDollar, BookOpen } from '@phosphor-icons/react'
import {
  type JourneyTab,
  journeyTabHrefPreservingSearch,
  JOURNEY_PAGE_PATH,
  JOURNEY_TAB_TOOLTIPS,
} from '@/lib/journey-nav-tabs'

const PRIMARY_TABS: {
  id: JourneyTab
  label: string
  Icon: typeof House
  benefit: string
}[] = [
  {
    id: 'today',
    label: 'Today',
    Icon: House,
    benefit: 'Your next move',
  },
  {
    id: 'plan',
    label: 'My Plan',
    Icon: MapTrifold,
    benefit: 'Phase checklist',
  },
  {
    id: 'money',
    label: 'Money',
    Icon: CurrencyDollar,
    benefit: 'Grants & savings',
  },
  {
    id: 'learn',
    label: 'Learn',
    Icon: BookOpen,
    benefit: 'Scripts & guides',
  },
]

type Props = {
  activeTab: JourneyTab
  searchKey: string
}

export default function JourneyQuickNav({ activeTab, searchKey }: Props) {
  return (
    <nav className="nq-journey-quick-nav" aria-label="Journey sections">
      {PRIMARY_TABS.map(({ id, label, Icon, benefit }) => {
        const active = activeTab === id
        const href = journeyTabHrefPreservingSearch(JOURNEY_PAGE_PATH, searchKey, id)
        return (
          <Link
            key={id}
            href={href}
            scroll={false}
            title={JOURNEY_TAB_TOOLTIPS[id]}
            className={`nq-journey-quick-nav-item ${active ? 'is-active' : ''}`}
            aria-current={active ? 'page' : undefined}
          >
            <span className="nq-journey-quick-nav-icon" aria-hidden>
              <Icon weight="duotone" size={22} />
            </span>
            <span className="nq-journey-quick-nav-label">{label}</span>
            <span className="nq-journey-quick-nav-benefit">{benefit}</span>
          </Link>
        )
      })}
    </nav>
  )
}

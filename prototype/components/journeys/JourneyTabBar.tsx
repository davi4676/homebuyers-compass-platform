'use client'

/**
 * Legacy journey strip (subset of tabs via `JOURNEY_TAB_IDS`). Not mounted on `/customized-journey`;
 * live navigation uses `JourneyNav` in TopNav with full `JOURNEY_URL_TAB_IDS`. Retained for experiments
 * or alternate shells — prefer extending `JourneyNav` before wiring this back in.
 */

import { useCallback, useEffect, useMemo, useRef, useState, startTransition } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSafeSearchParams } from '@/lib/use-safe-search-params'
import {
  Home,
  Map,
  DollarSign,
  BookOpen,
  Library,
  Bell,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import { useJourneyNavChrome } from '@/components/JourneyNavChromeContext'
import {
  type JourneyTab,
  JOURNEY_TAB_IDS,
  JOURNEY_TAB_TOOLTIPS,
  journeyTabHrefPreservingSearch,
  journeyTabLinkBasePath,
  JOURNEY_TAB_STORAGE_KEY,
} from '@/lib/journey-nav-tabs'
import type { JourneyNavChrome } from '@/components/JourneyNavChromeContext'
import { usePlainEnglish } from '@/lib/hooks/usePlainEnglish'
import { applyPlainEnglishCopy } from '@/lib/plain-english'
import { getStoredQuizTransactionMeta } from '@/lib/user-snapshot'

const TAB_ICONS: Record<JourneyTab, LucideIcon> = {
  today: Home,
  plan: Map,
  money: DollarSign,
  learn: BookOpen,
  library: Library,
  inbox: Bell,
  upgrades: Sparkles,
}

const TAB_LABELS: Record<JourneyTab, string> = {
  today: 'Today',
  plan: 'My Plan',
  money: 'Money',
  learn: 'Learn',
  library: 'Library',
  inbox: 'Inbox',
  upgrades: 'Upgrades',
}

const TAB_SHORT_LABELS: Record<JourneyTab, string> = {
  today: 'Today',
  plan: 'Plan',
  money: 'Money',
  learn: 'Learn',
  library: 'Library',
  inbox: 'Inbox',
  upgrades: 'Up',
}

function readinessDotClass(score: number | null): string {
  if (score == null) return 'bg-slate-300'
  if (score >= 60) return 'bg-[#52B788]'
  if (score >= 40) return 'bg-[#F4A261]'
  return 'bg-slate-400'
}

function TabBadges({ id, chrome }: { id: JourneyTab; chrome: JourneyNavChrome }) {
  if (id === 'today') {
    return (
      <span
        className={`h-2 w-2 shrink-0 rounded-full ${readinessDotClass(chrome.readinessScore)}`}
        title={
          chrome.readinessScore != null
            ? `Readiness about ${chrome.readinessScore}/100`
            : 'Complete your snapshot for readiness'
        }
        aria-hidden
      />
    )
  }
  if (id === 'plan') {
    return (
      <span className="shrink-0 rounded-md bg-[rgba(45,106,79,0.12)] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--primary)]">
        {chrome.phaseOrder}/{chrome.phaseTotal}
      </span>
    )
  }
  if (id === 'learn' && chrome.learnTipCount > 0) {
    return (
      <span className="shrink-0 rounded-md bg-violet-100 px-1.5 py-0.5 text-[10px] font-bold text-violet-800">
        {chrome.learnTipCount}
      </span>
    )
  }
  return null
}

export default function JourneyTabBar({ activeTab }: { activeTab: JourneyTab }) {
  const router = useRouter()
  const pathname = usePathname()
  const tabLinkBase = journeyTabLinkBasePath(pathname)
  const searchParams = useSafeSearchParams()
  const searchKey = searchParams.toString()
  const { chrome } = useJourneyNavChrome()
  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([])
  const plainEnglish = usePlainEnglish()
  const [showRefinanceJourneyLink, setShowRefinanceJourneyLink] = useState(false)

  useEffect(() => {
    const bump = () => {
      const m = getStoredQuizTransactionMeta()
      setShowRefinanceJourneyLink(
        m.transactionType === 'refinance' || m.icpType === 'refinance'
      )
    }
    bump()
    window.addEventListener('storage', bump)
    window.addEventListener('focus', bump)
    return () => {
      window.removeEventListener('storage', bump)
      window.removeEventListener('focus', bump)
    }
  }, [])

  const visibleTabIds = JOURNEY_TAB_IDS

  const persistTab = useCallback((t: JourneyTab) => {
    try {
      localStorage.setItem(JOURNEY_TAB_STORAGE_KEY, t)
    } catch {
      // ignore
    }
  }, [])

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      const len = visibleTabIds.length
      let next = index
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        next = (index + 1) % len
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        next = (index - 1 + len) % len
      } else if (e.key === 'Home') {
        e.preventDefault()
        next = 0
      } else if (e.key === 'End') {
        e.preventDefault()
        next = len - 1
      } else {
        return
      }
      const t = visibleTabIds[next]
      persistTab(t)
      const href = journeyTabHrefPreservingSearch(tabLinkBase, searchKey, t)
      startTransition(() => {
        router.push(href, { scroll: false })
      })
      requestAnimationFrame(() => tabRefs.current[next]?.focus())
    },
    [persistTab, router, searchKey, tabLinkBase, visibleTabIds]
  )

  return (
    <div className="relative z-10 flex w-full min-w-0 flex-col gap-1.5 md:flex-row md:items-center md:justify-center md:gap-2">
      <div
        className="flex w-full min-w-0 flex-nowrap gap-1 overflow-x-auto overflow-y-visible rounded-2xl border border-[rgba(45,106,79,0.1)] bg-gradient-to-r from-[#fbfaf8] via-white to-[#f9faf8] py-1.5 pl-1 pr-1 [scrollbar-width:thin] md:max-w-5xl md:flex-wrap md:justify-center md:overflow-visible md:px-2 md:py-2 md:[-ms-overflow-style:none] md:[scrollbar-width:none] md:[&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="Journey sections"
      >
      {visibleTabIds.map((id, index) => {
        const active = activeTab === id
        const Icon = TAB_ICONS[id]
        const indexLabel = String(index + 1).padStart(2, '0')
        const tooltip = applyPlainEnglishCopy(JOURNEY_TAB_TOOLTIPS[id], plainEnglish)
        return (
          <Link
            key={id}
            ref={(el) => {
              tabRefs.current[index] = el
            }}
            href={journeyTabHrefPreservingSearch(tabLinkBase, searchKey, id)}
            scroll={false}
            prefetch={false}
            role="tab"
            id={`journey-tab-${id}`}
            aria-selected={active}
            aria-controls={`journey-panel-${id}`}
            tabIndex={active ? 0 : -1}
            title={tooltip}
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
              e.preventDefault()
              persistTab(id)
              const href = journeyTabHrefPreservingSearch(tabLinkBase, searchKey, id)
              startTransition(() => {
                router.push(href, { scroll: false })
              })
            }}
            onKeyDown={(e) => onKeyDown(e, index)}
            className={`nq-ed-rail-tab flex min-w-[4rem] shrink-0 cursor-pointer touch-manipulation snap-start flex-col items-center gap-1 rounded-xl border px-2 py-2 no-underline md:min-w-0 md:flex-row md:items-center md:justify-between md:gap-3 md:px-3 md:py-2 ${
              active
                ? 'nq-ed-rail-tab-active border-[var(--nq-ed-line-soft)] font-semibold text-[var(--nq-ed-text)] shadow-[var(--nq-ed-shadow-sm)]'
                : 'border-transparent font-medium text-[var(--nq-ed-muted)] hover:text-[var(--nq-ed-text)]'
            }`}
          >
            <span className="flex items-center gap-2">
              <Icon className="h-5 w-5 shrink-0 opacity-90 md:h-4 md:w-4" aria-hidden />
              <span className="max-w-[5rem] text-center text-[10px] font-semibold leading-tight md:hidden">
                {TAB_SHORT_LABELS[id]}
              </span>
              <span className="hidden max-w-[9rem] truncate md:inline">{TAB_LABELS[id]}</span>
              <TabBadges id={id} chrome={chrome} />
            </span>
            <span className="nq-ed-rail-index hidden md:inline">{indexLabel}</span>
          </Link>
        )
      })}
      </div>
      {showRefinanceJourneyLink ? (
        <div className="flex shrink-0 flex-wrap items-center justify-center gap-2 self-center">
          <Link
            href="/refinance-optimizer"
            className="whitespace-nowrap rounded-xl border border-[rgba(45,106,79,0.22)] bg-[rgba(45,106,79,0.08)] px-3 py-2 text-xs font-semibold text-[var(--primary)] shadow-sm transition hover:border-[rgba(45,106,79,0.35)] hover:bg-[rgba(45,106,79,0.12)] md:text-sm"
          >
            Refinance Optimizer
          </Link>
          <Link
            href="/homebuyer/refinance-journey"
            className="whitespace-nowrap rounded-xl border border-[rgba(45,106,79,0.14)] bg-white px-3 py-2 text-xs font-semibold text-[var(--primary)] shadow-sm transition hover:border-[rgba(45,106,79,0.25)] hover:bg-[rgba(45,106,79,0.04)] md:text-sm"
          >
            Refinance roadmap
          </Link>
        </div>
      ) : null}
    </div>
  )
}

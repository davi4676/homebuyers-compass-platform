'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  LayoutGrid,
  MapPinned,
  Calculator,
  BookOpen,
  Library,
  Inbox,
  Crown,
  PiggyBank,
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
  overview: LayoutGrid,
  phase: MapPinned,
  budget: Calculator,
  learn: BookOpen,
  assistance: PiggyBank,
  library: Library,
  inbox: Inbox,
  upgrades: Crown,
}

const TAB_LABELS: Record<JourneyTab, string> = {
  overview: 'Overview',
  phase: 'Your Phase',
  budget: 'Budget Sketch',
  learn: 'Learn',
  assistance: 'Assistance',
  library: 'Library',
  inbox: 'Inbox',
  upgrades: 'Upgrades',
}

const TAB_SHORT_LABELS: Record<JourneyTab, string> = {
  overview: 'Home',
  phase: 'Phase',
  budget: 'Budget',
  learn: 'Learn',
  assistance: 'Funds',
  library: 'Library',
  inbox: 'Inbox',
  upgrades: 'Upgrades',
}

function readinessDotClass(score: number | null): string {
  if (score == null) return 'bg-slate-300'
  if (score >= 60) return 'bg-emerald-500'
  if (score >= 40) return 'bg-amber-400'
  return 'bg-slate-400'
}

function TabBadges({ id, chrome }: { id: JourneyTab; chrome: JourneyNavChrome }) {
  if (id === 'overview') {
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
  if (id === 'phase') {
    return (
      <span className="shrink-0 rounded-md bg-slate-200/90 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-700">
        {chrome.phaseOrder}/{chrome.phaseTotal}
      </span>
    )
  }
  if (id === 'budget' && chrome.budgetSketchEdited) {
    return (
      <span className="shrink-0 rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900">
        Updated
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
  if (id === 'library' && chrome.libraryHasNew) {
    return (
      <span className="shrink-0 rounded-md bg-teal-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-teal-900">
        New
      </span>
    )
  }
  if (id === 'inbox' && chrome.inboxPendingCount > 0) {
    return (
      <span className="shrink-0 rounded-md bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-900">
        {chrome.inboxPendingCount > 9 ? '9+' : chrome.inboxPendingCount}
      </span>
    )
  }
  return null
}

export default function JourneyTabBar({ activeTab }: { activeTab: JourneyTab }) {
  const router = useRouter()
  const pathname = usePathname()
  const tabLinkBase = journeyTabLinkBasePath(pathname)
  const searchParams = useSearchParams()
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

  const persistTab = useCallback((t: JourneyTab) => {
    try {
      localStorage.setItem(JOURNEY_TAB_STORAGE_KEY, t)
    } catch {
      // ignore
    }
  }, [])

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      const len = JOURNEY_TAB_IDS.length
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
      const t = JOURNEY_TAB_IDS[next]
      persistTab(t)
      router.push(journeyTabHrefPreservingSearch(tabLinkBase, searchKey, t), { scroll: false })
      requestAnimationFrame(() => tabRefs.current[next]?.focus())
    },
    [persistTab, router, searchKey, tabLinkBase]
  )

  return (
    <div className="relative z-10 flex w-full min-w-0 flex-col gap-1.5 md:flex-row md:items-center md:justify-center md:gap-2">
      <div
        className="flex w-full min-w-0 flex-nowrap gap-1 overflow-x-auto overflow-y-visible py-1 [scrollbar-width:thin] md:max-w-5xl md:flex-wrap md:justify-center md:overflow-visible md:[-ms-overflow-style:none] md:[scrollbar-width:none] md:[&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="Journey sections"
      >
      {JOURNEY_TAB_IDS.map((id, index) => {
        const active = activeTab === id
        const Icon = TAB_ICONS[id]
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
              router.push(journeyTabHrefPreservingSearch(tabLinkBase, searchKey, id), { scroll: false })
            }}
            onKeyDown={(e) => onKeyDown(e, index)}
            className={`flex min-w-[4rem] shrink-0 cursor-pointer touch-manipulation snap-start flex-col items-center gap-1 rounded-xl border px-2 py-2 no-underline md:min-w-0 md:flex-row md:gap-2 md:rounded-t-lg md:border-b-2 md:px-2.5 md:py-2 lg:px-3 ${
              active
                ? 'border-millennial-cta-primary bg-white font-bold text-millennial-text shadow-sm ring-2 ring-millennial-primary-light/90 md:border-slate-200 md:border-b-millennial-cta-primary md:bg-gradient-to-b md:from-millennial-primary-light/40 md:to-white md:ring-0'
                : 'border-slate-200/80 bg-white/70 font-medium text-millennial-text-muted md:border-transparent md:border-b-transparent md:bg-transparent md:shadow-none md:ring-0 md:hover:bg-millennial-primary-light/20 md:hover:text-millennial-text'
            }`}
          >
            <Icon className="h-5 w-5 shrink-0 opacity-90 md:h-4 md:w-4" aria-hidden />
            <span className="max-w-[5rem] text-center text-[10px] font-semibold leading-tight md:hidden">
              {TAB_SHORT_LABELS[id]}
            </span>
            <span className="hidden max-w-[9rem] truncate md:inline">{TAB_LABELS[id]}</span>
            <TabBadges id={id} chrome={chrome} />
          </Link>
        )
      })}
      </div>
      {showRefinanceJourneyLink ? (
        <Link
          href="/homebuyer/refinance-journey"
          className="shrink-0 self-center whitespace-nowrap rounded-xl border border-teal-200 bg-white px-3 py-2 text-xs font-semibold text-teal-800 shadow-sm transition hover:border-teal-300 hover:bg-teal-50 md:text-sm"
        >
          Refinance Journey
        </Link>
      ) : null}
    </div>
  )
}

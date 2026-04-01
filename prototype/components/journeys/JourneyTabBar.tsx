'use client'

import { useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
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
  journeyTabHref,
  JOURNEY_TAB_STORAGE_KEY,
} from '@/lib/journey-nav-tabs'
import type { JourneyNavChrome } from '@/components/JourneyNavChromeContext'
import { usePlainEnglish } from '@/lib/hooks/usePlainEnglish'
import { applyPlainEnglishCopy } from '@/lib/plain-english'

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
      <span className="shrink-0 rounded-md bg-sky-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-sky-900">
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
  const { chrome } = useJourneyNavChrome()
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const plainEnglish = usePlainEnglish()

  const navigate = useCallback(
    (t: JourneyTab) => {
      try {
        localStorage.setItem(JOURNEY_TAB_STORAGE_KEY, t)
      } catch {
        // ignore
      }
      router.push(journeyTabHref(t), { scroll: false })
    },
    [router]
  )

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
      navigate(t)
      requestAnimationFrame(() => tabRefs.current[next]?.focus())
    },
    [navigate]
  )

  return (
    <div
      className="relative z-[101] flex w-full min-w-0 flex-nowrap gap-1 overflow-x-auto overflow-y-visible py-1 [scrollbar-width:thin] md:max-w-5xl md:flex-wrap md:justify-center md:overflow-visible md:[-ms-overflow-style:none] md:[scrollbar-width:none] md:[&::-webkit-scrollbar]:hidden"
      role="tablist"
      aria-label="Journey sections"
    >
      {JOURNEY_TAB_IDS.map((id, index) => {
        const active = activeTab === id
        const Icon = TAB_ICONS[id]
        const tooltip = applyPlainEnglishCopy(JOURNEY_TAB_TOOLTIPS[id], plainEnglish)
        return (
          <button
            key={id}
            ref={(el) => {
              tabRefs.current[index] = el
            }}
            type="button"
            role="tab"
            id={`journey-tab-${id}`}
            aria-selected={active}
            aria-controls={`journey-panel-${id}`}
            tabIndex={active ? 0 : -1}
            title={tooltip}
            onClick={() => navigate(id)}
            onKeyDown={(e) => onKeyDown(e, index)}
            className={`flex min-w-[4rem] shrink-0 cursor-pointer touch-manipulation snap-start flex-col items-center gap-1 rounded-xl border px-2 py-2 md:min-w-0 md:flex-row md:gap-2 md:rounded-t-lg md:border-b-2 md:px-2.5 md:py-2 lg:px-3 ${
              active
                ? 'border-sky-400 bg-white font-bold text-slate-900 shadow-sm ring-2 ring-sky-200/80 md:border-slate-200 md:border-b-sky-600 md:bg-gradient-to-b md:from-sky-50 md:to-white md:ring-0'
                : 'border-slate-200/80 bg-white/70 font-medium text-slate-600 md:border-transparent md:border-b-transparent md:bg-transparent md:shadow-none md:ring-0 md:hover:bg-slate-50 md:hover:text-slate-900'
            }`}
          >
            <Icon className="h-5 w-5 shrink-0 opacity-90 md:h-4 md:w-4" aria-hidden />
            <span className="max-w-[5rem] text-center text-[10px] font-semibold leading-tight md:hidden">
              {TAB_SHORT_LABELS[id]}
            </span>
            <span className="hidden max-w-[9rem] truncate md:inline">{TAB_LABELS[id]}</span>
            <TabBadges id={id} chrome={chrome} />
          </button>
        )
      })}
    </div>
  )
}

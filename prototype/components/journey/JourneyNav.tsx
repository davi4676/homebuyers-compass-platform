"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSafeSearchParams } from "@/lib/use-safe-search-params";
import {
  House,
  MapTrifold,
  CurrencyDollar,
  BookOpen,
  Books,
  Bell,
  Sparkle,
} from "@phosphor-icons/react";
import {
  type JourneyTab,
  journeyTabHrefPreservingSearch,
  journeyTabLinkBasePath,
  JOURNEY_TAB_STORAGE_KEY,
  JOURNEY_URL_TAB_IDS,
} from "@/lib/journey-nav-tabs";
import {
  NQ_UNREAD_ALERTS_KEY,
  NQ_UNREAD_ALERTS_CHANGED,
} from "@/lib/nq-unread-alerts";

const TAB_MOBILE_ACTIVE_BAR = "var(--nq-ed-accent)";

const RAIL_TABS: {
  id: JourneyTab;
  label: string;
  shortLabel: string;
  icon: typeof House;
  hasNotification?: boolean;
}[] = JOURNEY_URL_TAB_IDS.map((id) => {
  switch (id) {
    case "today":
      return { id, label: "Today", shortLabel: "Today", icon: House, hasNotification: true };
    case "plan":
      return { id, label: "My Plan", shortLabel: "Plan", icon: MapTrifold };
    case "money":
      return { id, label: "Money", shortLabel: "Money", icon: CurrencyDollar };
    case "learn":
      return { id, label: "Learn", shortLabel: "Learn", icon: BookOpen };
    case "library":
      return { id, label: "Library", shortLabel: "Lib", icon: Books };
    case "inbox":
      return { id, label: "Inbox", shortLabel: "Inbox", icon: Bell };
    case "upgrades":
      // Route id stays `upgrades` (don't rename — would break query-string routing
      // and the LEGACY_TAB_MAP). Only the display label changes to `Options`.
      return { id, label: "Options", shortLabel: "Options", icon: Sparkle };
    default:
      return { id, label: id, shortLabel: id, icon: House };
  }
});

export default function JourneyNav({ activeTab }: { activeTab: JourneyTab }) {
  const pathname = usePathname();
  const tabLinkBase = journeyTabLinkBasePath(pathname);
  const searchParams = useSafeSearchParams();
  const searchKey = searchParams.toString();
  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [unreadAlerts, setUnreadAlerts] = useState(false);

  const refreshUnread = useCallback(() => {
    try {
      setUnreadAlerts(Boolean(localStorage.getItem(NQ_UNREAD_ALERTS_KEY)));
    } catch {
      setUnreadAlerts(false);
    }
  }, []);

  useEffect(() => {
    refreshUnread();
    const bump = () => refreshUnread();
    window.addEventListener("storage", bump);
    window.addEventListener("focus", bump);
    window.addEventListener(NQ_UNREAD_ALERTS_CHANGED, bump);
    return () => {
      window.removeEventListener("storage", bump);
      window.removeEventListener("focus", bump);
      window.removeEventListener(NQ_UNREAD_ALERTS_CHANGED, bump);
    };
  }, [refreshUnread, pathname, searchKey]);

  const persistTab = useCallback((t: JourneyTab) => {
    try {
      localStorage.setItem(JOURNEY_TAB_STORAGE_KEY, t);
    } catch {
      /* ignore */
    }
  }, []);

  const tabIndexList = useMemo(() => RAIL_TABS.map((t) => t.id), []);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      const len = tabIndexList.length;
      let next = index;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        next = (index + 1) % len;
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        next = (index - 1 + len) % len;
      } else if (e.key === "Home") {
        e.preventDefault();
        next = 0;
      } else if (e.key === "End") {
        e.preventDefault();
        next = len - 1;
      } else {
        return;
      }
      const t = tabIndexList[next];
      persistTab(t);
      tabRefs.current[next]?.click();
      requestAnimationFrame(() => tabRefs.current[next]?.focus());
    },
    [persistTab, tabIndexList]
  );

  return (
    <nav
      className="nq-ed-journey-nav fixed bottom-0 left-0 right-0 z-[90] flex max-h-[50vh] flex-col overflow-x-hidden border-t border-[var(--nq-ed-line-soft)] pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-4px_24px_rgba(29,23,17,0.06)] md:bottom-0 md:left-0 md:right-auto md:top-16 md:max-h-none md:w-[300px] md:overflow-x-visible md:border-r md:border-t-0 md:pb-0 md:shadow-[2px_0_24px_rgba(29,23,17,0.06)]"
      role="tablist"
      aria-label="Journey sections"
    >
      <div className="hidden border-b border-[var(--nq-ed-line-soft)] px-4 pb-3 pt-5 md:block">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--nq-ed-muted)]">
          Private index
        </p>
        <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--nq-ed-text)]">
          NestQuest journey
        </p>
      </div>
      <div className="flex min-h-0 w-full max-w-full flex-1 flex-row flex-nowrap items-stretch justify-start gap-0 overflow-x-auto overflow-y-hidden overscroll-x-contain px-1 pt-1 [-webkit-overflow-scrolling:touch] md:flex-col md:justify-start md:gap-1 md:overflow-x-visible md:overflow-y-auto md:overscroll-auto md:px-3 md:pb-4 md:pt-3">
        {RAIL_TABS.map((t, i) => {
          const active = activeTab === t.id;
          const showDot = Boolean(t.hasNotification && unreadAlerts);
          const Icon = t.icon;
          return (
            <Link
              key={t.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              href={journeyTabHrefPreservingSearch(tabLinkBase, searchKey, t.id)}
              scroll={false}
              prefetch={false}
              role="tab"
              id={`journey-tab-${t.id}`}
              aria-selected={active}
              aria-controls={`journey-panel-${t.id}`}
              tabIndex={active ? 0 : -1}
              onClick={() => persistTab(t.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={`nq-ed-rail-tab relative z-0 flex min-w-[3.25rem] shrink-0 touch-manipulation flex-col items-center gap-0.5 rounded-xl py-2 no-underline sm:min-w-[3.5rem] md:w-full md:min-w-0 md:shrink md:flex-row md:items-center md:justify-start md:gap-3 md:py-0 ${
                active
                  ? "font-semibold text-[var(--nq-ed-accent)] nq-ed-rail-tab-active md:font-semibold md:text-[var(--nq-ed-text)]"
                  : "text-[var(--nq-ed-muted)] md:text-[var(--nq-ed-muted)] md:hover:text-[var(--nq-ed-text)]"
              }`}
            >
              <span className="relative z-10 flex w-full flex-col items-center md:flex-row md:items-center md:gap-3">
                <span className="relative flex shrink-0 flex-col items-center md:flex-row md:gap-3">
                  <Icon
                    weight="duotone"
                    size={20}
                    className="md:h-[18px] md:w-[18px]"
                    color={active ? "var(--nq-ed-accent)" : "var(--nq-ed-muted)"}
                    aria-hidden
                  />
                  {showDot ? (
                    <span className="absolute -right-1 -top-0.5 h-2 w-2 rounded-full bg-[var(--nq-ed-accent)] ring-2 ring-[var(--nq-ed-surface)] md:left-[14px] md:top-[-2px]" />
                  ) : null}
                  <span className="max-w-full px-0.5 text-center text-[10px] font-semibold leading-tight sm:text-[11px] md:hidden">
                    {t.shortLabel}
                  </span>
                  <span className="hidden min-w-0 flex-1 truncate text-sm font-semibold leading-normal md:inline">
                    {t.label}
                  </span>
                </span>
              </span>
              {active ? (
                <span
                  className="relative z-10 mt-0.5 h-1 w-7 rounded-full md:hidden"
                  style={{ background: TAB_MOBILE_ACTIVE_BAR }}
                  aria-hidden
                />
              ) : (
                <span className="relative z-10 mt-0.5 h-1 w-6 opacity-0 md:hidden" aria-hidden />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

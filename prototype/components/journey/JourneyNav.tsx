"use client";

import { useCallback, useEffect, useMemo, useRef, useState, startTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSafeSearchParams } from "@/lib/use-safe-search-params";
import { House, MapTrifold, CurrencyDollar, BookOpen } from "@phosphor-icons/react";
import {
  type JourneyTab,
  journeyTabHrefPreservingSearch,
  journeyTabLinkBasePath,
  JOURNEY_TAB_STORAGE_KEY,
} from "@/lib/journey-nav-tabs";
import {
  NQ_UNREAD_ALERTS_KEY,
  NQ_UNREAD_ALERTS_CHANGED,
} from "@/lib/nq-unread-alerts";

/** Matches customized-journey hero / Phase 2 tokens — full tab rail, not a single card. */
const TAB_ACTIVE_SURFACE =
  "linear-gradient(135deg, rgba(45,106,79,0.14) 0%, rgba(82,183,136,0.1) 55%, rgba(244,162,97,0.07) 100%)";
const TAB_MOBILE_ACTIVE_BAR =
  "linear-gradient(90deg, #2D6A4F 0%, #52B788 60%, #F4A261 100%)";

const TABS: {
  id: JourneyTab;
  label: string;
  icon: typeof House;
  hasNotification?: boolean;
}[] = [
  { id: "today", label: "Today", icon: House, hasNotification: true },
  { id: "plan", label: "My Plan", icon: MapTrifold },
  { id: "money", label: "Money", icon: CurrencyDollar },
  { id: "learn", label: "Learn", icon: BookOpen },
];

export default function JourneyNav({ activeTab }: { activeTab: JourneyTab }) {
  const router = useRouter();
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

  const tabIndexList = useMemo(() => TABS.map((t) => t.id), []);

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
      const href = journeyTabHrefPreservingSearch(tabLinkBase, searchKey, t);
      startTransition(() => router.push(href, { scroll: false }));
      requestAnimationFrame(() => tabRefs.current[next]?.focus());
    },
    [persistTab, router, searchKey, tabLinkBase, tabIndexList]
  );

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[90] flex max-h-[50vh] flex-col overflow-x-hidden border-t border-[rgba(45,106,79,0.14)] bg-gradient-to-b from-[#fbfaf8] to-white pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-4px_24px_rgba(45,106,79,0.07)] md:bottom-0 md:left-0 md:right-auto md:top-16 md:max-h-none md:w-52 md:overflow-x-visible md:border-r md:border-t-0 md:border-[rgba(45,106,79,0.12)] md:bg-gradient-to-b md:from-white md:to-[#f9f7f4] md:pb-0 md:shadow-[2px_0_16px_rgba(45,106,79,0.06)]"
      role="tablist"
      aria-label="Journey sections"
    >
      <div className="flex min-h-0 w-full max-w-full flex-1 flex-row items-stretch justify-between gap-0 overflow-x-hidden overflow-y-auto md:flex-col md:gap-1 md:overflow-x-visible md:px-2 md:pt-4">
        {TABS.map((t, i) => {
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
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                e.preventDefault();
                persistTab(t.id);
                const href = journeyTabHrefPreservingSearch(tabLinkBase, searchKey, t.id);
                startTransition(() => router.push(href, { scroll: false }));
              }}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={`relative z-0 flex min-w-0 flex-1 basis-0 flex-col items-center gap-0.5 py-2 md:w-full md:min-w-0 md:flex-none md:basis-auto md:flex-row md:gap-3 md:rounded-xl md:px-3 md:py-2.5 md:text-left ${
                active
                  ? "font-semibold text-[var(--primary)] md:shadow-sm md:ring-1 md:ring-[rgba(45,106,79,0.14)]"
                  : "text-slate-500 md:text-slate-600 md:hover:bg-[rgba(45,106,79,0.06)] md:hover:text-[var(--primary)]"
              }`}
            >
              {active ? (
                <span
                  className="pointer-events-none absolute inset-0 z-0 hidden rounded-xl md:block"
                  style={{ background: TAB_ACTIVE_SURFACE }}
                  aria-hidden
                />
              ) : null}
              <span className="relative z-10 flex flex-col items-center md:w-full md:flex-row md:gap-3">
                <span className="relative shrink-0">
                  <Icon
                    weight="duotone"
                    size={20}
                    className="md:h-[18px] md:w-[18px]"
                    color={active ? "var(--primary)" : "var(--muted)"}
                    aria-hidden
                  />
                  {showDot ? (
                    <span className="absolute -right-1 -top-0.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-[#fbfaf8]" />
                  ) : null}
                </span>
                <span className="max-w-full px-0.5 text-center text-[11px] font-semibold leading-tight sm:text-xs md:max-w-none md:flex-1 md:truncate md:px-0 md:text-sm md:leading-normal">
                  {t.label}
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

"use client";

import { useCallback, useEffect, useMemo, useRef, useState, startTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Home,
  Map,
  Calculator,
  Gift,
  BookOpen,
  Wrench,
  Bell,
  Unlock,
  type LucideIcon,
} from "lucide-react";
import { useICP } from "@/lib/icp-context";
import {
  type JourneyTab,
  journeyTabHrefPreservingSearch,
  journeyTabLinkBasePath,
  JOURNEY_TAB_STORAGE_KEY,
} from "@/lib/journey-nav-tabs";
import { getStoredQuizTransactionMeta } from "@/lib/user-snapshot";
import {
  NQ_UNREAD_ALERTS_KEY,
  NQ_UNREAD_ALERTS_CHANGED,
} from "@/lib/nq-unread-alerts";

const TABS: {
  id: JourneyTab;
  label: string;
  icon: LucideIcon;
  hasNotification?: boolean;
}[] = [
  { id: "overview", label: "Home", icon: Home },
  { id: "phase", label: "Roadmap", icon: Map },
  { id: "budget", label: "Numbers", icon: Calculator },
  { id: "assistance", label: "Free Money", icon: Gift },
  { id: "learn", label: "Learn", icon: BookOpen },
  { id: "library", label: "Tools", icon: Wrench },
  { id: "inbox", label: "Alerts", icon: Bell, hasNotification: true },
  { id: "upgrades", label: "Unlock", icon: Unlock },
];

export default function JourneyNav({ activeTab }: { activeTab: JourneyTab }) {
  const router = useRouter();
  const pathname = usePathname();
  const tabLinkBase = journeyTabLinkBasePath(pathname);
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();
  const { content } = useICP();
  const accent = content.accentColor;
  const accentLight = content.accentColorLight;
  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [unreadAlerts, setUnreadAlerts] = useState(false);
  const [showRefinanceLinks, setShowRefinanceLinks] = useState(false);

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

  useEffect(() => {
    const bump = () => {
      const m = getStoredQuizTransactionMeta();
      setShowRefinanceLinks(m.transactionType === "refinance" || m.icpType === "refinance");
    };
    bump();
    window.addEventListener("storage", bump);
    window.addEventListener("focus", bump);
    return () => {
      window.removeEventListener("storage", bump);
      window.removeEventListener("focus", bump);
    };
  }, []);

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
      className="fixed bottom-0 left-0 right-0 z-[90] flex max-h-[50vh] flex-col overflow-x-hidden border-t border-slate-200 bg-white pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(15,23,42,0.08)] md:bottom-0 md:left-0 md:right-auto md:top-16 md:max-h-none md:w-52 md:overflow-x-visible md:border-r md:border-t-0 md:pb-0 md:shadow-sm"
      role="tablist"
      aria-label="Journey sections"
    >
      <div className="flex min-h-0 w-full max-w-full flex-1 flex-row items-stretch justify-between gap-0 overflow-x-hidden overflow-y-auto md:flex-col md:gap-0.5 md:overflow-x-visible md:px-2 md:pt-4">
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
              className={`relative z-0 flex min-w-0 flex-1 basis-0 flex-col items-center gap-0.5 py-1.5 min-[480px]:py-2 md:w-full md:min-w-0 md:flex-none md:basis-auto md:flex-row md:gap-3 md:rounded-xl md:px-3 md:py-2.5 md:text-left ${
                active ? "md:font-semibold" : "text-slate-500 md:text-slate-600 md:hover:bg-slate-50"
              }`}
              style={active ? { color: accent } : undefined}
            >
              {active ? (
                <span
                  className="pointer-events-none absolute inset-0 z-0 hidden rounded-xl md:block"
                  style={{ backgroundColor: accentLight }}
                  aria-hidden
                />
              ) : null}
              <span className="relative z-10 flex flex-col items-center md:w-full md:flex-row md:gap-3">
                <span className="relative shrink-0">
                  <Icon className="h-5 w-5 opacity-95 md:h-[18px] md:w-[18px]" aria-hidden />
                  {showDot ? (
                    <span className="absolute -right-1 -top-0.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                  ) : null}
                </span>
                <span className="max-w-full px-0.5 text-center text-[9px] font-semibold leading-[1.15] hyphens-auto sm:text-[10px] md:max-w-none md:flex-1 md:truncate md:px-0 md:text-sm md:leading-normal">
                  {t.label}
                </span>
              </span>
              {active ? (
                <span
                  className="relative z-10 mt-0.5 h-1 w-6 rounded-full md:hidden"
                  style={{ backgroundColor: accent }}
                  aria-hidden
                />
              ) : (
                <span className="relative z-10 mt-0.5 h-1 w-6 opacity-0 md:hidden" aria-hidden />
              )}
            </Link>
          );
        })}
      </div>

      {showRefinanceLinks ? (
        <div className="mt-auto hidden border-t border-slate-100 px-3 py-3 md:block">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">Refinance</p>
          <Link
            href="/refinance-optimizer"
            className="mb-1.5 block rounded-lg px-2 py-1.5 text-xs font-semibold text-[#14532d] hover:bg-slate-50"
          >
            Optimizer
          </Link>
          <Link
            href="/homebuyer/refinance-journey"
            className="block rounded-lg px-2 py-1.5 text-xs font-semibold text-teal-800 hover:bg-slate-50"
          >
            Roadmap
          </Link>
        </div>
      ) : null}
    </nav>
  );
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  markGateFired,
  shouldFireGate,
  NQ_MILESTONE_GATE_OPEN_EVENT,
  type GateType,
  type MilestoneGateOpenDetail,
} from "@/lib/milestone-gates";
import { useICP } from "@/lib/icp-context";
import { track } from "@/lib/analytics";
import { getStoredQuizTransactionMeta } from "@/lib/user-snapshot";

type GateCopy = {
  celebration: string;
  achievementLabel: string;
  headline: string;
  subtext: string;
  upgradeCta: string;
  dismissLabel: string;
  accent: string;
};

const GATE_COPY: Record<GateType, GateCopy> = {
  discovery: {
    celebration: "You just found your real number.",
    achievementLabel: "Monthly payment identified",
    headline: "Now let's make sure you can actually get it.",
    subtext:
      "Momentum members get matched with 3 vetted lenders who specialize in buyers at your exact income and credit level. No cold calls. No spam.",
    upgradeCta: "Get my lender matches — Start free 7-day trial",
    dismissLabel: "I'll find lenders on my own",
    accent: "#3B82F6",
  },
  money: {
    celebration: "You just found real money.",
    achievementLabel: "in down payment assistance identified",
    headline: "Here's how to actually get it.",
    subtext:
      "The full DPA Match Report shows you the exact application steps, income limits, and deadlines for every program you qualify for. One-time, $19.",
    upgradeCta: "Get my full DPA report — $19",
    dismissLabel: "I'll research the programs myself",
    accent: "#10B981",
  },
  progress: {
    celebration: "Phase 1 complete.",
    achievementLabel: "Readiness checklist finished",
    headline: "You're more prepared than 80% of buyers who walk into a lender.",
    subtext:
      "Phase 2 is where prepared buyers pull ahead. Lender selection, rate negotiation, and pre-approval strategy. Unlock it with Momentum.",
    upgradeCta: "Unlock Phase 2 — Start free 7-day trial",
    dismissLabel: "I'll come back to this later",
    accent: "#8B5CF6",
  },
  streak: {
    celebration: "7 days straight.",
    achievementLabel: "day streak achieved",
    headline: "You're not just curious. You're serious.",
    subtext:
      "Buyers who stay consistent close 40% faster. Momentum gives you the full roadmap, lender matches, and DPA reports to match your commitment.",
    upgradeCta: "Get the full plan — Start free 7-day trial",
    dismissLabel: "Keep going on the free plan",
    accent: "#F59E0B",
  },
  certificate: {
    celebration: "You finished the journey.",
    achievementLabel: "phases completed",
    headline: "Get your certificate. Make it official.",
    subtext:
      "Your NestQuest Completion Certificate documents your homebuyer education for lenders and DPA programs. One-time, $29.",
    upgradeCta: "Get my certificate — $29",
    dismissLabel: "I don't need a certificate",
    accent: "#10B981",
  },
};

function parseNumericFromDisplay(s: string): number | null {
  const digits = s.replace(/[^0-9]/g, "");
  if (!digits) return null;
  const n = parseInt(digits, 10);
  return Number.isFinite(n) ? n : null;
}

/** CSS-driven count feel: tabular-nums + transition; numeric core animates via style + @property optional — use short RAF for honesty */
function MilestoneAnimatedFigure({
  value,
  prefix = "",
  suffix = "",
  durationMs = 900,
  className = "",
}: {
  value: string;
  prefix?: string;
  suffix?: string;
  durationMs?: number;
  className?: string;
}) {
  const target = parseNumericFromDisplay(value);
  const [n, setN] = useState(0);

  useEffect(() => {
    if (target == null) return;
    setN(0);
    let cancelled = false;
    const start = performance.now();
    const tick = (now: number) => {
      if (cancelled) return;
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setN(Math.round(eased * target));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    return () => {
      cancelled = true;
    };
  }, [target, durationMs]);

  if (target == null) {
    return <span className={className}>{value}</span>;
  }

  return (
    <span className={`tabular-nums ${className}`}>
      {prefix}
      {n.toLocaleString()}
      {suffix}
    </span>
  );
}

function MilestoneGateModal({
  gateType,
  achievementValue,
  onUpgrade,
  onDismiss,
  checkoutLoading,
}: {
  gateType: GateType;
  achievementValue?: string;
  onUpgrade: () => void | Promise<void>;
  onDismiss: () => void;
  checkoutLoading: boolean;
}) {
  const copy = GATE_COPY[gateType];
  const { icpType } = useICP();
  const [entered, setEntered] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onDismiss]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      void import("canvas-confetti").then((mod) => {
        const confetti = mod.default;
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.35 },
          colors: [copy.accent, "#ffffff", "#94A3B8"],
        });
      });
    }, 300);
    return () => clearTimeout(t);
  }, [copy.accent]);

  const achievementBlock = useMemo(() => {
    if (gateType === "money" && achievementValue) {
      return (
        <p className="mt-3 text-2xl font-bold leading-tight text-white sm:text-3xl">
          <MilestoneAnimatedFigure value={achievementValue} prefix="$" className="text-white" />{" "}
          <span className="text-base font-semibold text-white/90 sm:text-lg">{copy.achievementLabel}</span>
        </p>
      );
    }
    if (gateType === "discovery" && achievementValue) {
      return (
        <>
          <p className="mt-3 text-2xl font-bold tabular-nums text-white sm:text-3xl">
            <MilestoneAnimatedFigure value={achievementValue} prefix="$" className="text-white" />
          </p>
          <p className="mt-2 text-sm font-medium text-white/80">{copy.achievementLabel}</p>
        </>
      );
    }
    if (gateType === "streak" && achievementValue) {
      return (
        <p className="mt-3 text-2xl font-bold text-white sm:text-3xl">
          <MilestoneAnimatedFigure
            value={achievementValue}
            suffix={` ${copy.achievementLabel}`}
            className="text-white"
          />
        </p>
      );
    }
    if (gateType === "progress" && achievementValue) {
      return (
        <>
          <p className="mt-3 text-2xl font-bold tabular-nums text-white sm:text-3xl">
            <MilestoneAnimatedFigure value={achievementValue} suffix="%" className="text-white" />
          </p>
          <p className="mt-2 text-sm font-medium text-white/80">{copy.achievementLabel}</p>
        </>
      );
    }
    if (gateType === "certificate" && achievementValue) {
      return (
        <p className="mt-3 text-2xl font-bold text-white sm:text-3xl">
          <MilestoneAnimatedFigure
            value={achievementValue}
            suffix={` ${copy.achievementLabel}`}
            className="text-white"
          />
        </p>
      );
    }
    return (
      <p className="mt-3 text-xl font-semibold text-white/95 sm:text-2xl">{copy.achievementLabel}</p>
    );
  }, [achievementValue, copy.achievementLabel, gateType]);

  if (!mounted || typeof document === "undefined") return null;

  const modal = (
    <div
      className="fixed inset-0 z-[200] flex flex-col justify-end bg-slate-900/80 backdrop-blur-sm sm:items-center sm:justify-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="milestone-gate-headline"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-transparent"
        aria-label="Dismiss milestone dialog"
        onClick={onDismiss}
      />
      <div
        className={`relative z-10 flex max-h-[min(92vh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl transition-all duration-300 ease-out sm:max-h-[85vh] sm:rounded-2xl ${
          entered
            ? "translate-y-0 opacity-100 sm:translate-y-0 sm:scale-100"
            : "translate-y-full opacity-100 sm:translate-y-0 sm:scale-95 sm:opacity-0"
        }`}
      >
        <div
          className="shrink-0 px-6 pb-6 pt-8 sm:px-8 sm:pt-10"
          style={{
            background: `linear-gradient(165deg, ${copy.accent}22 0%, ${copy.accent}44 45%, rgb(15 23 42) 100%)`,
          }}
        >
          <p className="text-sm font-semibold text-white/90">{copy.celebration}</p>
          {achievementBlock}
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 py-6 sm:px-8">
          <h2 id="milestone-gate-headline" className="text-xl font-bold text-slate-900 sm:text-2xl">
            {copy.headline}
          </h2>
          <p className="text-sm leading-relaxed text-slate-600 sm:text-base">{copy.subtext}</p>
          <div className="mt-auto flex flex-col gap-3 pt-2 sm:pt-4">
            <p className="text-xs text-slate-400 text-center mb-3">
              {icpType === "first-gen"
                ? "Join 1,203 first-gen buyers who completed their journey this month"
                : "Join 2,847 buyers who used NestQuest this month"}
            </p>
            <button
              type="button"
              disabled={checkoutLoading}
              onClick={() => void onUpgrade()}
              className="w-full rounded-xl px-4 py-3.5 text-center text-sm font-bold text-white shadow-md transition hover:opacity-95 disabled:opacity-60 sm:text-base"
              style={{ backgroundColor: copy.accent }}
            >
              {checkoutLoading ? "Redirecting to secure checkout…" : copy.upgradeCta}
            </button>
            <button
              type="button"
              disabled={checkoutLoading}
              onClick={onDismiss}
              className="w-full rounded-xl py-3 text-center text-sm font-semibold text-slate-600 underline decoration-slate-300 underline-offset-2 hover:text-slate-900 disabled:opacity-50"
            >
              {copy.dismissLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

type MilestoneGateContextValue = {
  tryOpenGate: (gateType: GateType, achievementValue?: string) => void;
};

const MilestoneGateContext = createContext<MilestoneGateContextValue | null>(null);

export function useMilestoneGate(): MilestoneGateContextValue {
  const ctx = useContext(MilestoneGateContext);
  if (!ctx) throw new Error("useMilestoneGate must be used within MilestoneGateProvider");
  return ctx;
}

export function MilestoneGateProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [active, setActive] = useState<{ type: GateType; achievementValue?: string } | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const tryOpenGate = useCallback((gateType: GateType, achievementValue?: string) => {
    if (!shouldFireGate(gateType)) return;
    markGateFired(gateType);
    setActive({ type: gateType, achievementValue });
  }, []);

  const dismiss = useCallback(() => {
    setCheckoutLoading(false);
    setActive(null);
  }, []);

  const handleUpgrade = useCallback(async () => {
    const t = active?.type;
    if (!t) return;

    setCheckoutLoading(true);
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

    const recordGateConversion = (gate: GateType) => {
      track.milestoneGateConverted(gate);
      if (gate === "discovery") {
        track.lenderLeadGenerated(getStoredQuizTransactionMeta().icpType ?? "first-time");
      }
    };

    const fallbackSubscription = () => {
      recordGateConversion(t);
      setCheckoutLoading(false);
      setActive(null);
      router.push("/payment?tier=momentum&cycle=monthly");
    };

    const fallbackMoney = () => {
      recordGateConversion(t);
      setCheckoutLoading(false);
      setActive(null);
      router.push("/customized-journey?tab=assistance");
    };

    try {
      if (t === "money") {
        const res = await fetch("/api/checkout/dpa-report", { method: "POST" });
        const data = (await res.json()) as { url?: string; error?: string };
        if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Checkout failed");
        if (data.url) {
          recordGateConversion(t);
          window.location.href = data.url;
          return;
        }
        throw new Error("No checkout URL");
      }

      if (t === "certificate") {
        const res = await fetch("/api/checkout/completion-certificate", { method: "POST" });
        const data = (await res.json()) as { url?: string; error?: string };
        if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Checkout failed");
        if (data.url) {
          recordGateConversion(t);
          window.location.href = data.url;
          return;
        }
        throw new Error("No checkout URL");
      }

      const successUrl = `${baseUrl}/payment?success=stripe&cycle=monthly&session_id={CHECKOUT_SESSION_ID}`;
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier: "momentum",
          billingCycle: "monthly",
          successUrl,
          cancelUrl: `${baseUrl}/customized-journey?tab=overview`,
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Checkout failed");
      if (data.url) {
        recordGateConversion(t);
        window.location.href = data.url;
        return;
      }
      throw new Error("No checkout URL");
    } catch {
      if (t === "money") fallbackMoney();
      else if (t === "certificate") {
        recordGateConversion(t);
        setCheckoutLoading(false);
        setActive(null);
        router.push("/upgrade?source=milestone-certificate&tier=momentum");
      } else fallbackSubscription();
    }
  }, [active?.type, router]);

  useEffect(() => {
    if (!active) return;
    track.milestoneGateSeen(active.type);
  }, [active]);

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<MilestoneGateOpenDetail>;
      const d = ce.detail;
      if (!d?.gateType) return;
      setActive({ type: d.gateType, achievementValue: d.achievementValue });
    };
    window.addEventListener(NQ_MILESTONE_GATE_OPEN_EVENT, handler);
    return () => window.removeEventListener(NQ_MILESTONE_GATE_OPEN_EVENT, handler);
  }, []);

  return (
    <MilestoneGateContext.Provider value={{ tryOpenGate }}>
      {children}
      {active ? (
        <MilestoneGateModal
          gateType={active.type}
          achievementValue={active.achievementValue}
          onDismiss={dismiss}
          onUpgrade={handleUpgrade}
          checkoutLoading={checkoutLoading}
        />
      ) : null}
    </MilestoneGateContext.Provider>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import { TrendingDown, DollarSign, Gift } from "lucide-react";
import { useICP } from "@/lib/icp-context";
import {
  NQ_DPA_IDENTIFIED_CHANGED_EVENT,
  NQ_DPA_IDENTIFIED_LS_KEY,
} from "@/lib/nq-dpa-identified";

function AnimatedCounter({
  target,
  prefix = "",
  suffix = "",
  duration = 1200,
}: {
  target: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target === 0) {
      setValue(0);
      return;
    }
    setValue(0);
    let cancelled = false;
    const start = Date.now();
    const tick = () => {
      if (cancelled) return;
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    return () => {
      cancelled = true;
    };
  }, [target, duration]);

  return (
    <span>
      {prefix}
      {value.toLocaleString()}
      {suffix}
    </span>
  );
}

export function SavingsLedger({
  className,
  compact = false,
}: { className?: string; compact?: boolean } = {}) {
  const { quizData, icpType } = useICP();

  const monthlyMortgage = Math.round(
    (quizData.targetHomePrice * 0.8 * (0.07 / 12)) /
      (1 - Math.pow(1 + 0.07 / 12, -360))
  );
  const estimatedRent = Math.round(quizData.targetHomePrice * 0.004);
  const monthlyDelta = estimatedRent - monthlyMortgage;

  const [dpaAmount, setDpaAmount] = useState(0);

  const readDpaFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(NQ_DPA_IDENTIFIED_LS_KEY);
      if (stored) {
        const n = parseInt(stored, 10);
        setDpaAmount(Number.isFinite(n) ? n : 0);
      } else {
        const estimate = quizData.annualIncome < 80000 ? 14200 : 8500;
        setDpaAmount(estimate);
      }
    } catch {
      setDpaAmount(quizData.annualIncome < 80000 ? 14200 : 8500);
    }
  }, [quizData.annualIncome]);

  useEffect(() => {
    readDpaFromStorage();
  }, [readDpaFromStorage]);

  useEffect(() => {
    const onExternal = () => readDpaFromStorage();
    window.addEventListener(NQ_DPA_IDENTIFIED_CHANGED_EVENT, onExternal);
    window.addEventListener("storage", onExternal);
    return () => {
      window.removeEventListener(NQ_DPA_IDENTIFIED_CHANGED_EVENT, onExternal);
      window.removeEventListener("storage", onExternal);
    };
  }, [readDpaFromStorage]);

  const totalIdentified = dpaAmount + (monthlyDelta > 0 ? monthlyDelta * 12 : 0);

  const frames: Record<string, { title: string; subtitle: string }> = {
    "first-time": {
      title: "Money we've identified for you",
      subtitle: "Based on your income, location, and home price",
    },
    "first-gen": {
      title: "Here's what we found for you",
      subtitle: "Real programs. Real money. Available in your area.",
    },
    "move-up": {
      title: "Your financial advantage",
      subtitle: "Equity position + available programs",
    },
    investor: {
      title: "Investment opportunity summary",
      subtitle: "Based on your target property and financing",
    },
  };

  const frame = frames[icpType] ?? frames["first-time"];

  /** Rent at or above mortgage payment → owning isn’t more expensive per month (honest “good” band). */
  const buyingNotWorseThanRent = monthlyDelta >= 0;

  return (
    <div
      className={clsx("mx-4 mt-4 overflow-hidden rounded-2xl", className)}
      style={{ background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)" }}
    >
      <div className={clsx(compact ? "px-4 pb-1 pt-3" : "px-5 pb-2 pt-5")}>
        <p className="mb-0.5 text-[10px] uppercase tracking-widest text-slate-400 sm:text-xs">{frame.title}</p>
        <p className={clsx("font-bold text-white", compact ? "text-2xl sm:text-3xl" : "text-3xl")}>
          <AnimatedCounter target={totalIdentified} prefix="$" />
        </p>
        <p className="mt-0.5 text-[10px] text-slate-500 sm:text-xs line-clamp-2">{frame.subtitle}</p>
      </div>

      <div className={clsx("grid grid-cols-3 gap-px bg-slate-700/30", compact ? "mt-2" : "mt-4")}>
        <div className={clsx("bg-slate-800/60", compact ? "px-2 py-2 sm:px-4 sm:py-3" : "px-4 py-3")}>
          <div className="mb-1 flex items-center gap-1.5">
            <Gift className="h-3 w-3 text-emerald-400" />
            <span className="text-[10px] uppercase tracking-wide text-slate-400">DPA Found</span>
          </div>
          <p className={clsx("font-bold text-emerald-400", compact ? "text-sm sm:text-base" : "text-base")}>
            <AnimatedCounter target={dpaAmount} prefix="$" duration={1000} />
          </p>
        </div>

        <div className={clsx("bg-slate-800/60", compact ? "px-2 py-2 sm:px-4 sm:py-3" : "px-4 py-3")}>
          <div className="mb-1 flex items-center gap-1.5">
            <TrendingDown
              className={clsx(
                "h-3 w-3",
                buyingNotWorseThanRent ? "text-emerald-400" : "text-amber-400"
              )}
            />
            <span className="text-[10px] uppercase tracking-wide text-slate-400">vs. Rent</span>
          </div>
          <p
            className={clsx(
              "font-bold",
              compact ? "text-sm sm:text-base" : "text-base",
              buyingNotWorseThanRent ? "text-emerald-400" : "text-amber-400"
            )}
          >
            {buyingNotWorseThanRent ? "-" : "+"}
            <AnimatedCounter target={Math.abs(monthlyDelta)} prefix="$" suffix="/mo" duration={1400} />
          </p>
        </div>

        <div className={clsx("bg-slate-800/60", compact ? "px-2 py-2 sm:px-4 sm:py-3" : "px-4 py-3")}>
          <div className="mb-1 flex items-center gap-1.5">
            <DollarSign className="h-3 w-3 text-violet-400" />
            <span className="text-[10px] uppercase tracking-wide text-slate-400">Year 1</span>
          </div>
          <p className={clsx("font-bold text-violet-400", compact ? "text-sm sm:text-base" : "text-base")}>
            <AnimatedCounter target={totalIdentified} prefix="$" duration={1600} />
          </p>
        </div>
      </div>

      <div className={clsx("flex items-center justify-between", compact ? "px-4 py-2 sm:px-5 sm:py-3" : "px-5 py-3")}>
        <p className="text-[10px] text-slate-500">Updates as you complete steps</p>
        <span className="flex items-center gap-1 text-[10px] text-slate-500">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Live
        </span>
      </div>
    </div>
  );
}

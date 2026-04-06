"use client";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Flame } from "lucide-react";
import { calculateMomentumScore, getMomentumLabel, getMomentumColor } from "@/lib/momentum-score";
import { useICP } from "@/lib/icp-context";
import { useMomentumFactors } from "@/hooks/use-momentum-factors";

const STREAK_GLOW =
  "0 0 0 1px rgba(245, 158, 11, 0.35), 0 0 12px rgba(245, 158, 11, 0.45), 0 0 24px rgba(251, 191, 36, 0.25)";

export function MomentumScoreHeader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams.toString()}`;
  const { icpType } = useICP();
  const factors = useMomentumFactors();
  const score = calculateMomentumScore(factors);
  const [displayScore, setDisplayScore] = useState(() => Math.max(0, score - 4));
  const color = getMomentumColor(score);
  const circumference = 2 * Math.PI * 20;

  // Replay ring + number animation on full load, client navigations, and tab changes (query).
  useEffect(() => {
    setDisplayScore(Math.max(0, score - 4));
    const timer = setTimeout(() => setDisplayScore(score), 500);
    return () => clearTimeout(timer);
  }, [score, routeKey]);

  const icpLabel: Record<string, string> = {
    "first-time": "toward your first home",
    "first-gen": "toward making history",
    "move-up": "toward your next chapter",
    "investor": "toward your portfolio goal",
  };

  const dashOffset = circumference * (1 - displayScore / 100);

  return (
    <div className="flex w-full items-center justify-between border-b border-slate-100 bg-white px-4 py-2.5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center">
          <svg className="h-11 w-11" style={{ transform: "rotate(-90deg)" }} viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="20" fill="none" stroke="#F1F5F9" strokeWidth="4" />
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              stroke={color}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{ transition: "stroke-dashoffset 0.8s ease-out, stroke 0.4s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold" style={{ color }}>
              {displayScore}
            </span>
          </div>
        </div>

        <div className="min-w-0">
          <p className="mb-0.5 text-[10px] uppercase leading-none tracking-wide text-slate-400">Momentum</p>
          <p className="truncate text-sm font-semibold leading-tight text-slate-800">
            {getMomentumLabel(score)}{" "}
            <span className="text-xs font-normal text-slate-400">
              {icpLabel[icpType] ?? "toward homeownership"}
            </span>
          </p>
        </div>
      </div>

      {factors.streakDays > 0 && (
        <div
          className="flex flex-shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1"
          style={{
            backgroundColor: factors.streakDays >= 7 ? "#FEF3C7" : "#F8FAFC",
            boxShadow: factors.streakDays >= 7 ? STREAK_GLOW : undefined,
            animation: factors.streakDays >= 7 ? "mq-momentum-pulse 2s infinite" : "none",
          }}
        >
          <Flame
            className="h-3.5 w-3.5"
            style={{ color: factors.streakDays >= 7 ? "#F59E0B" : "#94A3B8" }}
          />
          <span
            className="text-xs font-semibold"
            style={{ color: factors.streakDays >= 7 ? "#D97706" : "#64748B" }}
          >
            {factors.streakDays}d
          </span>
        </div>
      )}
    </div>
  );
}

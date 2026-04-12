"use client";
import { Flame } from "@phosphor-icons/react";
import { calculateMomentumScore, getMomentumColor } from "@/lib/momentum-score";
import { useICP } from "@/lib/icp-context";
import { useMomentumFactors } from "@/hooks/use-momentum-factors";
import JourneyPhaseProgressRing from "@/components/journey/JourneyPhaseProgressRing";
import { useJourneyPhaseRingProgress } from "@/hooks/use-journey-phase-ring";

const STREAK_GLOW =
  "0 0 0 1px rgba(245, 158, 11, 0.35), 0 0 12px rgba(245, 158, 11, 0.45), 0 0 24px rgba(251, 191, 36, 0.25)";

export function MomentumScoreHeader() {
  const factors = useMomentumFactors();
  const score = calculateMomentumScore(factors);
  const ringAccent = getMomentumColor(score);
  const phaseProgress = useJourneyPhaseRingProgress();
  const { icpType } = useICP();

  const icpLabel: Record<string, string> = {
    "first-time": "toward your first home",
    "first-gen": "toward making history",
    "move-up": "toward your next chapter",
    "investor": "toward your portfolio goal",
  };

  return (
    <div className="flex w-full items-center justify-between border-b border-slate-100 bg-white px-4 py-2.5 shadow-sm">
      <div className="flex min-w-0 items-center gap-3">
        <JourneyPhaseProgressRing pct={phaseProgress.pct} size="sm" accentColor={ringAccent} />
        <div className="min-w-0 hidden sm:block">
          <p className="mb-0.5 text-[10px] uppercase leading-none tracking-wide text-slate-400">
            Journey progress
          </p>
          <p className="truncate text-sm font-semibold leading-tight text-slate-800">
            <span className="tabular-nums">{phaseProgress.completed}</span>
            <span className="font-normal text-slate-400"> / </span>
            <span className="tabular-nums">{phaseProgress.total}</span>
            <span className="text-xs font-normal text-slate-400"> phases</span>
          </p>
          <p className="truncate text-xs text-slate-500">
            {icpLabel[icpType] ?? "toward homeownership"}
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
            weight="duotone"
            size={14}
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

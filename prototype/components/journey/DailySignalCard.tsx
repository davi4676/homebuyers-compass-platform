"use client";

import { useState, useEffect } from "react";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { Zap, X, ChevronRight } from "lucide-react";
import {
  getDailySignal,
  completeSignal,
  dismissSignalForSession,
  isSignalDismissedForSession,
  type DailySignal,
} from "@/lib/daily-signal";
import { useICP } from "@/lib/icp-context";

const URGENCY_STYLES = {
  high: { bg: "#FFF7ED", border: "#FED7AA", icon: "#F97316", dot: "#EF4444" },
  medium: { bg: "#EFF6FF", border: "#BFDBFE", icon: "#3B82F6", dot: "#3B82F6" },
  low: { bg: "#F0FDF4", border: "#BBF7D0", icon: "#10B981", dot: "#10B981" },
};

export function DailySignalCard({ className }: { className?: string } = {}) {
  const { icpType, quizData } = useICP();
  const router = useRouter();
  const [signal, setSignal] = useState<DailySignal | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      const s = getDailySignal(icpType, quizData);
      if (!s) {
        setSignal(null);
        return;
      }
      if (isSignalDismissedForSession(s.id)) {
        setSignal(null);
        return;
      }
      setSignal(s);
    } catch {
      /* ignore */
    }
  }, [icpType, quizData]);

  if (!signal || dismissed) return null;

  const styles = URGENCY_STYLES[signal.urgency];

  const handleAction = () => {
    completeSignal(signal.id, signal.actionKey);
    setDismissed(true);
    router.push(`/customized-journey?tab=${signal.actionTab}`);
  };

  return (
    <div
      className={clsx("relative mx-4 mt-4 rounded-2xl border p-4", className)}
      style={{ backgroundColor: styles.bg, borderColor: styles.border }}
    >
      {signal.urgency === "high" ? (
        <span
          className="absolute right-10 top-3.5 h-2 w-2 rounded-full"
          style={{ backgroundColor: styles.dot }}
        />
      ) : null}

      <button
        type="button"
        onClick={() => {
          dismissSignalForSession(signal.id);
          setDismissed(true);
        }}
        className="absolute right-3 top-3 rounded-full p-0.5 text-slate-400 hover:text-slate-600"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <div className="flex items-start gap-3 pr-6">
        <div
          className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${styles.icon}20` }}
        >
          <Zap className="h-4 w-4" style={{ color: styles.icon }} />
        </div>
        <div className="min-w-0">
          <p className="mb-1 text-sm font-semibold leading-snug text-slate-800">{signal.headline}</p>
          <p className="mb-3 text-xs leading-relaxed text-slate-500">{signal.subtext}</p>
          <button
            type="button"
            onClick={handleAction}
            className="flex items-center gap-1 text-xs font-semibold"
            style={{ color: styles.icon }}
          >
            {signal.actionLabel}
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

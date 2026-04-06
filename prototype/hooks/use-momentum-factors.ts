import { useEffect, useState } from "react";
import {
  markGateFired,
  shouldFireGate,
  NQ_MILESTONE_GATE_OPEN_EVENT,
} from "@/lib/milestone-gates";

export interface MomentumFactors {
  quizCompleted: boolean;
  budgetSketchCompleted: boolean;
  dpaEligibilityChecked: boolean;
  creditScoreEntered: boolean;
  phase1ChecklistItems: number;
  learnModulesCompleted: number;
  daysActive: number;
  streakDays: number;
  savingsIdentified: number;
  referralSent: boolean;
}

const DEFAULT_FACTORS: MomentumFactors = {
  quizCompleted: false,
  budgetSketchCompleted: false,
  dpaEligibilityChecked: false,
  creditScoreEntered: false,
  phase1ChecklistItems: 0,
  learnModulesCompleted: 0,
  daysActive: 1,
  streakDays: 0,
  savingsIdentified: 0,
  referralSent: false,
};

export function useMomentumFactors(): MomentumFactors {
  const [factors, setFactors] = useState<MomentumFactors>(DEFAULT_FACTORS);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("nq_momentum_factors");
      if (stored) {
        setFactors({ ...DEFAULT_FACTORS, ...JSON.parse(stored) });
      } else {
        // Bootstrap from existing quiz state
        const quizState =
          localStorage.getItem("nq_quiz_state") ||
          localStorage.getItem("quizData") ||
          localStorage.getItem("quizTransactionMeta");
        if (quizState) {
          const updated = { ...DEFAULT_FACTORS, quizCompleted: true };
          setFactors(updated);
          localStorage.setItem("nq_momentum_factors", JSON.stringify(updated));
        }
      }

      // Update streak logic
      const lastVisit = localStorage.getItem("nq_last_visit");
      const today = new Date().toDateString();
      const streak = parseInt(localStorage.getItem("nq_streak") || "0", 10);

      let streakToReport = streak;
      if (lastVisit !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const newStreak = lastVisit === yesterday.toDateString() ? streak + 1 : 1;
        localStorage.setItem("nq_last_visit", today);
        localStorage.setItem("nq_streak", String(newStreak));
        streakToReport = newStreak;
        setFactors(prev => ({ ...prev, streakDays: newStreak }));
      } else {
        streakToReport = streak;
        setFactors(prev => ({ ...prev, streakDays: streak }));
      }

      if (streakToReport >= 7 && shouldFireGate("streak")) {
        markGateFired("streak");
        queueMicrotask(() => {
          window.dispatchEvent(
            new CustomEvent(NQ_MILESTONE_GATE_OPEN_EVENT, {
              detail: { gateType: "streak", achievementValue: String(streakToReport) },
            })
          );
        });
      }
    } catch (e) {
      // Fail silently
    }
  }, []);

  return factors;
}

export function updateMomentumFactor(key: keyof MomentumFactors, value: number | boolean): void {
  try {
    const stored = localStorage.getItem("nq_momentum_factors");
    const current = stored ? JSON.parse(stored) : DEFAULT_FACTORS;
    const updated = { ...current, [key]: value };
    localStorage.setItem("nq_momentum_factors", JSON.stringify(updated));
  } catch (e) {
    // Fail silently
  }
}

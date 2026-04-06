import type { MomentumFactors } from "@/hooks/use-momentum-factors";

export function calculateMomentumScore(factors: MomentumFactors): number {
  let score = 0;
  if (factors.quizCompleted) score += 10;
  if (factors.budgetSketchCompleted) score += 10;
  if (factors.dpaEligibilityChecked) score += 8;
  if (factors.creditScoreEntered) score += 8;
  score += Math.min(factors.phase1ChecklistItems * 2, 15);
  score += Math.min(factors.learnModulesCompleted, 10);
  score += Math.min(factors.daysActive, 10);
  if (factors.streakDays >= 30) score += 10;
  else if (factors.streakDays >= 7) score += 5;
  score += Math.min(Math.floor(factors.savingsIdentified / 1000), 10);
  if (factors.referralSent) score += 5;
  return Math.min(score, 100);
}

export function getMomentumLabel(score: number): string {
  if (score < 20) return "Just Getting Started";
  if (score < 40) return "Building Momentum";
  if (score < 60) return "On Track";
  if (score < 80) return "Accelerating";
  if (score < 95) return "Almost Ready";
  return "Ready to Buy";
}

/** Amber below 40, blue 40–70 inclusive, emerald strictly above 70. */
export function getMomentumColor(score: number): string {
  if (score < 40) return "#F59E0B";
  if (score <= 70) return "#3B82F6";
  return "#10B981";
}

import type { ICPType, QuizData } from "@/lib/icp-context";

export interface DailySignal {
  id: string;
  headline: string;
  subtext: string;
  actionLabel: string;
  actionTab: string;
  actionKey: string;
  urgency: "low" | "medium" | "high";
  icpTypes: ICPType[];
}

// Signal pool — 14 signals, rotate by day-of-year within each ICP’s eligible subset
const SIGNAL_POOL: DailySignal[] = [
  {
    id: "check-dpa",
    headline: "You may qualify for free money today.",
    subtext:
      "Buyers in your area are getting an average of $11,400 in down payment assistance. Check yours.",
    actionLabel: "See what I qualify for →",
    actionTab: "assistance",
    actionKey: "nq_signal_dpa_checked",
    urgency: "high",
    icpTypes: ["first-time", "first-gen"],
  },
  {
    id: "run-budget",
    headline: "What would your monthly payment actually be?",
    subtext: "Enter your numbers. Get a real answer in 60 seconds.",
    actionLabel: "Run my numbers →",
    actionTab: "budget",
    actionKey: "nq_signal_budget_run",
    urgency: "high",
    icpTypes: ["first-time", "first-gen", "move-up"],
  },
  {
    id: "complete-checklist",
    headline: "3 things to do before you talk to a lender.",
    subtext: "Buyers who complete Phase 1 get better rates. Check off what you've done.",
    actionLabel: "See my checklist →",
    actionTab: "phase",
    actionKey: "nq_signal_checklist_viewed",
    urgency: "medium",
    icpTypes: ["first-time", "first-gen"],
  },
  {
    id: "learn-credit",
    headline: "Your credit score affects your rate more than anything else.",
    subtext: "A 40-point difference can cost $200/month. Here's what moves the needle.",
    actionLabel: "Learn how credit works →",
    actionTab: "learn",
    actionKey: "nq_signal_credit_learned",
    urgency: "medium",
    icpTypes: ["first-time", "first-gen", "move-up"],
  },
  {
    id: "equity-calc",
    headline: "How much equity do you have right now?",
    subtext: "Your current home's equity is your down payment. Let's calculate it.",
    actionLabel: "Calculate my equity →",
    actionTab: "budget",
    actionKey: "nq_signal_equity_calc",
    urgency: "high",
    icpTypes: ["move-up"],
  },
  {
    id: "cap-rate",
    headline: "What's the cap rate on your target property?",
    subtext: "Run the numbers before you make an offer. 5 minutes, real data.",
    actionLabel: "Run investment analysis →",
    actionTab: "budget",
    actionKey: "nq_signal_cap_rate",
    urgency: "high",
    icpTypes: ["investor"],
  },
  {
    id: "rate-alert",
    headline: "Mortgage rates moved this week.",
    subtext:
      "A 0.25% rate change affects your monthly payment by ~$50 on a $300K loan. See the current rate.",
    actionLabel: "See today's rates →",
    actionTab: "learn",
    actionKey: "nq_signal_rate_checked",
    urgency: "medium",
    icpTypes: ["first-time", "first-gen", "move-up", "investor"],
  },
  {
    id: "pre-approval",
    headline: "Pre-approval takes 20 minutes. It changes everything.",
    subtext: "Sellers take pre-approved buyers 3x more seriously. Here's what you need to get it.",
    actionLabel: "See pre-approval checklist →",
    actionTab: "phase",
    actionKey: "nq_signal_preapproval_viewed",
    urgency: "medium",
    icpTypes: ["first-time", "first-gen"],
  },
  {
    id: "dpa-deadline",
    headline: "Some DPA programs close when funds run out.",
    subtext: "Check your programs now — availability changes monthly.",
    actionLabel: "Check my programs →",
    actionTab: "assistance",
    actionKey: "nq_signal_dpa_deadline",
    urgency: "high",
    icpTypes: ["first-time", "first-gen"],
  },
  {
    id: "learn-module",
    headline: "One thing to learn today: what PMI actually costs.",
    subtext: "PMI adds $100–$300/month to your payment. Here's exactly when you can remove it.",
    actionLabel: "Learn about PMI →",
    actionTab: "learn",
    actionKey: "nq_signal_pmi_learned",
    urgency: "low",
    icpTypes: ["first-time", "first-gen"],
  },
  {
    id: "library-scripts",
    headline: "One script can save you $2,000 at the closing table.",
    subtext: "Negotiation phrases buyers use with sellers and lenders — copy-paste ready.",
    actionLabel: "Open my scripts →",
    actionTab: "library",
    actionKey: "nq_signal_scripts_opened",
    urgency: "low",
    icpTypes: ["first-time", "first-gen", "move-up"],
  },
  {
    id: "inbox-tasks",
    headline: "You have tasks waiting in your inbox.",
    subtext: "Complete today's to-dos to keep your momentum — most take under 5 minutes.",
    actionLabel: "Open inbox →",
    actionTab: "inbox",
    actionKey: "nq_signal_inbox_opened",
    urgency: "medium",
    icpTypes: ["first-time", "first-gen", "move-up", "investor"],
  },
  {
    id: "firstgen-resources",
    headline: "Resources built for first-gen buyers.",
    subtext: "Counselors, gift funds, and family conversation guides — in one place.",
    actionLabel: "See first-gen hub →",
    actionTab: "firstgen",
    actionKey: "nq_signal_firstgen_opened",
    urgency: "medium",
    icpTypes: ["first-gen"],
  },
  {
    id: "investor-dscr",
    headline: "DSCR loans: qualify on the property, not your W-2.",
    subtext:
      "If you're scaling rentals, this loan type is worth understanding before your next offer.",
    actionLabel: "Learn about DSCR →",
    actionTab: "learn",
    actionKey: "nq_signal_dscr_learned",
    urgency: "medium",
    icpTypes: ["investor"],
  },
];

export function getDailySignal(icpType: ICPType, _quizData: QuizData): DailySignal | null {
  if (typeof window === "undefined") return null;

  const eligible = SIGNAL_POOL.filter((s) => s.icpTypes.includes(icpType));
  if (eligible.length === 0) return null;

  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  const signal = eligible[dayOfYear % eligible.length];

  const completedKey = localStorage.getItem(signal.actionKey);
  const today = new Date().toDateString();
  if (completedKey === today) return null;

  return signal;
}

export function completeSignal(signalId: string, actionKey: string): void {
  if (typeof window === "undefined") return;
  const today = new Date().toDateString();
  localStorage.setItem(actionKey, today);
  localStorage.setItem(`nq_signal_completed_${signalId}`, today);
}

const SESSION_DISMISS_KEY = "nq_daily_signal_sess_dismiss";

/** True if the user dismissed today’s card via X — lasts until the tab/session ends or the calendar day changes. */
export function isSignalDismissedForSession(signalId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = sessionStorage.getItem(SESSION_DISMISS_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { d: string; id: string };
    return parsed.d === new Date().toDateString() && parsed.id === signalId;
  } catch {
    return false;
  }
}

export function dismissSignalForSession(signalId: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(
    SESSION_DISMISS_KEY,
    JSON.stringify({ d: new Date().toDateString(), id: signalId })
  );
}

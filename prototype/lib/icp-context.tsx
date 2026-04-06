"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { parseIcpTypeParam } from "@/lib/icp-types";

export type ICPType = "first-time" | "first-gen" | "move-up" | "investor";

export interface QuizData {
  icpType: ICPType;
  annualIncome: number;       // from quiz answer, default 75000
  targetHomePrice: number;    // from quiz answer, default 350000
  currentSavings: number;     // from quiz answer, default 20000
  creditScore: string;        // "excellent" | "good" | "fair" | "poor"
  timeline: string;           // "asap" | "6months" | "1year" | "2plus"
  zipCode?: string;
  firstName?: string;
}

export interface ICPContent {
  welcomeHeadline: string;
  welcomeSubtext: string;
  primaryCTALabel: string;
  phaseFraming: string;
  budgetHeadline: string;
  budgetSubtext: string;
  assistanceHeadline: string;
  assistanceSubtext: string;
  learnHeadline: string;
  priorityModuleIds: string[];
  accentColor: string;
  accentColorLight: string;
  toneAdjective: string;
  socialProofTemplate: string;
}

const ICP_CONTENT_MAP: Record<ICPType, ICPContent> = {
  "first-time": {
    welcomeHeadline: "Your path to your first home starts here.",
    welcomeSubtext: "We'll walk you through every step — from knowing your numbers to getting the keys.",
    primaryCTALabel: "See my numbers",
    phaseFraming: "Your 8-Step Path to Ownership",
    budgetHeadline: "What can you actually afford?",
    budgetSubtext: "Real numbers. Not estimates. Based on your income, savings, and local market.",
    assistanceHeadline: "Money you didn't know existed.",
    assistanceSubtext: "Most first-time buyers qualify for programs they never heard of. Here's what's available for you.",
    learnHeadline: "Everything you need to know, in the order you need to know it.",
    priorityModuleIds: ["credit-basics", "how-mortgages-work", "what-is-dpa", "pre-approval-process"],
    accentColor: "#3B82F6",
    accentColorLight: "#EFF6FF",
    toneAdjective: "confident",
    socialProofTemplate: "{n} first-time buyers in {city} used NestQuest this month",
  },
  "first-gen": {
    welcomeHeadline: "You're making history. We'll make sure you're ready.",
    welcomeSubtext: "No one in your family has done this before. That's exactly why we built this for you.",
    primaryCTALabel: "Show me where to start",
    phaseFraming: "Your Step-by-Step Guide to Homeownership",
    budgetHeadline: "Here's what homeownership actually costs.",
    budgetSubtext: "No jargon. No assumptions. Just your real numbers, explained in plain English.",
    assistanceHeadline: "Programs designed for buyers like you.",
    assistanceSubtext: "Many programs specifically help first-generation buyers. You likely qualify for more than you think.",
    learnHeadline: "Start here. We'll explain everything.",
    priorityModuleIds: ["what-is-a-mortgage", "credit-basics", "what-is-dpa", "how-to-avoid-scams"],
    accentColor: "#D97706",
    accentColorLight: "#FFFBEB",
    toneAdjective: "warm",
    socialProofTemplate: "{n} first-generation buyers completed their journey with NestQuest",
  },
  "move-up": {
    welcomeHeadline: "Your equity is your advantage. Let's use it.",
    welcomeSubtext: "You've done this before. This time, let's make sure you're maximizing every dollar.",
    primaryCTALabel: "Calculate my equity position",
    phaseFraming: "Your Move-Up Strategy",
    budgetHeadline: "Your equity + your next home.",
    budgetSubtext: "See how your current home's equity translates into buying power for your next one.",
    assistanceHeadline: "Programs for repeat buyers.",
    assistanceSubtext: "You may still qualify for assistance programs, especially in high-cost markets.",
    learnHeadline: "What's different the second time around.",
    priorityModuleIds: ["bridge-loans", "contingency-offers", "equity-calculation", "timing-the-market"],
    accentColor: "#7C3AED",
    accentColorLight: "#F5F3FF",
    toneAdjective: "strategic",
    socialProofTemplate: "{n} move-up buyers saved an average of $8,200 using NestQuest",
  },
  "investor": {
    welcomeHeadline: "Build your portfolio. We'll handle the numbers.",
    welcomeSubtext: "ROI analysis, rental yield projections, and financing strategy — all in one place.",
    primaryCTALabel: "Run my investment analysis",
    phaseFraming: "Your Investment Roadmap",
    budgetHeadline: "Investment property economics.",
    budgetSubtext: "Cap rate, cash-on-cash return, and DSCR — calculated for your target property.",
    assistanceHeadline: "Financing options for investors.",
    assistanceSubtext: "DSCR loans, portfolio lenders, and programs that work for investment properties.",
    learnHeadline: "Advanced strategies for serious investors.",
    priorityModuleIds: ["dscr-loans", "1031-exchange", "rental-yield-analysis", "portfolio-lending"],
    accentColor: "#059669",
    accentColorLight: "#ECFDF5",
    toneAdjective: "analytical",
    socialProofTemplate: "{n} investors analyzed properties with NestQuest this month",
  },
};

const VALID_CONTEXT_ICPS = new Set<ICPType>(["first-time", "first-gen", "move-up", "investor"]);

/**
 * Map legacy quiz / URL ICP slugs to a key that exists in {@link ICP_CONTENT_MAP}.
 */
export function normalizeContextIcpType(raw: string | null | undefined): ICPType {
  if (raw == null || typeof raw !== "string") return "first-time";
  const v = raw.trim().toLowerCase();
  if (v === "investor") return "investor";
  if (VALID_CONTEXT_ICPS.has(v as ICPType)) return v as ICPType;
  const parsed = parseIcpTypeParam(v);
  if (parsed === "first-gen" || parsed === "move-up" || parsed === "first-time") return parsed;
  if (parsed === "solo") return "first-time";
  if (parsed === "repeat-buyer" || parsed === "refinance") return "move-up";
  return "first-time";
}

function getIcpContent(icp: ICPType): ICPContent {
  return ICP_CONTENT_MAP[icp] ?? ICP_CONTENT_MAP["first-time"];
}

interface ICPContextValue {
  icpType: ICPType;
  quizData: QuizData;
  content: ICPContent;
  /** True when quiz fields were loaded from localStorage (not defaults-only). */
  hasPersistedQuizState: boolean;
  updateQuizData: (data: Partial<QuizData>) => void;
}

const ICPContext = createContext<ICPContextValue | null>(null);

const DEFAULT_QUIZ_DATA: QuizData = {
  icpType: "first-time",
  annualIncome: 75000,
  targetHomePrice: 350000,
  currentSavings: 20000,
  creditScore: "good",
  timeline: "1year",
};

export function ICPProvider({ children }: { children: ReactNode }) {
  const [quizData, setQuizData] = useState<QuizData>(DEFAULT_QUIZ_DATA);
  const [hasPersistedQuizState, setHasPersistedQuizState] = useState(false);

  useEffect(() => {
    // Read from all possible localStorage keys used in the existing codebase
    try {
      const stored =
        localStorage.getItem("nq_quiz_state") ||
        localStorage.getItem("quizData") ||
        localStorage.getItem("quizTransactionMeta") ||
        localStorage.getItem("nestquest_quiz_data");

      if (stored) {
        const parsed = JSON.parse(stored);
        // Normalize field names from existing quiz storage formats
        const rawIcp = parsed.icpType || parsed.buyerType || parsed.type || "first-time";
        setQuizData({
          icpType: normalizeContextIcpType(String(rawIcp)),
          annualIncome: parsed.annualIncome || parsed.income || 75000,
          targetHomePrice: parsed.targetHomePrice || parsed.homePrice || parsed.price || 350000,
          currentSavings: parsed.currentSavings || parsed.savings || 20000,
          creditScore: parsed.creditScore || parsed.credit || "good",
          timeline: parsed.timeline || "1year",
          zipCode: parsed.zipCode || parsed.zip,
          firstName: parsed.firstName || parsed.name,
        });
        setHasPersistedQuizState(true);
      } else {
        setHasPersistedQuizState(false);
      }

      // Also check URL params for icpType (quiz routes use ?type=first-gen)
      const urlParams = new URLSearchParams(window.location.search);
      const urlRaw = urlParams.get("type");
      if (urlRaw) {
        const urlIcp = normalizeContextIcpType(urlRaw);
        setQuizData(prev => ({ ...prev, icpType: urlIcp }));
      }
    } catch (e) {
      // Fail silently — default data is safe
    }
  }, []);

  const updateQuizData = (data: Partial<QuizData>) => {
    setHasPersistedQuizState(true);
    setQuizData(prev => {
      const merged = { ...prev, ...data };
      const updated =
        data.icpType !== undefined
          ? { ...merged, icpType: normalizeContextIcpType(String(data.icpType)) }
          : merged;
      localStorage.setItem("nq_quiz_state", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <ICPContext.Provider value={{
      icpType: quizData.icpType,
      quizData,
      content: getIcpContent(quizData.icpType),
      hasPersistedQuizState,
      updateQuizData,
    }}>
      {children}
    </ICPContext.Provider>
  );
}

export function useICP(): ICPContextValue {
  const ctx = useContext(ICPContext);
  if (!ctx) throw new Error("useICP must be used inside ICPProvider");
  return ctx;
}

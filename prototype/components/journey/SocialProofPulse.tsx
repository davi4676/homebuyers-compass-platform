"use client";
import { useState, useEffect } from "react";
import { Users } from "lucide-react";
import { useICP } from "@/lib/icp-context";
import type { ICPType } from "@/lib/icp-context";

const SIGNALS: Record<ICPType, string[]> = {
  "first-time": [
    "2,847 first-time buyers used NestQuest this month",
    "Maria C. found $17,500 in DPA she didn't know existed",
    "Average NestQuest buyer saves $11,200 in their first year",
    "89% of NestQuest users feel more confident after Phase 1",
    "James T. closed on his first home 3 months after starting",
  ],
  "first-gen": [
    "1,203 first-generation buyers completed their journey this month",
    "Priya S. was the first in her family to own a home — NestQuest walked her through every step",
    "Average first-gen buyer on NestQuest qualifies for $14,800 in assistance",
    "92% of first-gen users say NestQuest made the process feel manageable",
    "David R.: 'I didn't know what I didn't know. NestQuest changed that.'",
  ],
  "move-up": [
    "847 move-up buyers used NestQuest to maximize their equity this month",
    "Average move-up buyer on NestQuest saves $8,200 on their next purchase",
    "Sarah K. used her equity to buy a home $120K above her original budget",
    "NestQuest move-up users close 22% faster than the national average",
  ],
  "investor": [
    "412 investors analyzed properties with NestQuest this month",
    "Average NestQuest investor identifies 3 financing options they hadn't considered",
    "Michael T. found a DSCR loan that saved him $340/month vs. conventional",
    "NestQuest investors report 94% satisfaction with the analysis tools",
  ],
};

export function SocialProofPulse() {
  const { icpType } = useICP();
  const signals = SIGNALS[icpType] ?? SIGNALS["first-time"];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentIndex((i) => (i + 1) % signals.length);
        setVisible(true);
      }, 300);
    }, 4000);
    return () => clearInterval(interval);
  }, [signals.length]);

  return (
    <div className="mx-4 mt-3 flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-100">
      <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
        <Users className="w-3 h-3 text-slate-500" />
      </div>
      <p
        className="text-xs text-slate-600 leading-snug flex-1 min-w-0"
        style={{
          opacity: visible ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      >
        {signals[currentIndex]}
      </p>
    </div>
  );
}

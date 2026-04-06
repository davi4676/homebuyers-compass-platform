"use client";
import { useState, useEffect } from "react";
import { Award, Lock } from "lucide-react";
import { useICP } from "@/lib/icp-context";

interface CertificatePreviewProps {
  phasesCompleted: number; // 0–7, passed from parent phase tracking
  onPurchase: () => void; // triggers Stripe checkout for $29 certificate
  /** When quiz storage has no firstName yet, e.g. account display name from journey shell */
  firstNameFallback?: string | null;
}

export function CertificatePreview({
  phasesCompleted,
  onPurchase,
  firstNameFallback,
}: CertificatePreviewProps) {
  const { content, quizData } = useICP();
  const isComplete = phasesCompleted >= 7;
  const completionPercent = Math.round((phasesCompleted / 7) * 100);
  const [animatedPercent, setAnimatedPercent] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedPercent(completionPercent), 400);
    return () => clearTimeout(timer);
  }, [completionPercent]);

  const trimmedFallback = firstNameFallback?.trim();
  const userName = quizData.firstName?.trim() || trimmedFallback || "Your Name";

  return (
    <div className="mt-8 px-4 pb-8">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-700">Your Completion Certificate</h3>
        <span className="text-xs text-slate-400">{completionPercent}% complete</span>
      </div>

      <div
        className={`relative rounded-2xl overflow-hidden border-2 shadow-lg shadow-amber-950/10 ring-1 ring-amber-900/[0.06] transition-transform ${
          isComplete ? "cursor-pointer hover:scale-[1.01] hover:shadow-xl hover:shadow-amber-950/15" : "cursor-default"
        }`}
        style={{
          borderColor: isComplete ? content.accentColor : "#E2E8F0",
          background: "linear-gradient(135deg, #FEFCE8 0%, #FEF9C3 50%, #FEF3C7 100%)",
        }}
        onClick={isComplete ? onPurchase : undefined}
      >
        <div
          className="absolute inset-2 border border-dashed rounded-xl pointer-events-none"
          style={{ borderColor: `${content.accentColor}40` }}
        />

        <div className="p-6 text-center relative">
          <Award className="w-8 h-8 mx-auto mb-2" style={{ color: content.accentColor }} aria-hidden />
          <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">Certificate of Completion</p>
          <p className="text-lg font-bold text-slate-800 mb-1">NestQuest Homebuyer Education</p>

          <p className="text-base font-semibold mb-3" style={{ color: content.accentColor }}>
            {userName}
          </p>

          <div
            className="transition-all duration-500"
            style={{ filter: isComplete ? "none" : "blur(4px)", userSelect: isComplete ? "auto" : "none" }}
          >
            <p className="text-xs text-slate-500">
              {isComplete
                ? "Completed all 7 phases of the NestQuest Homebuyer Education Program"
                : `Completed ${phasesCompleted} of 7 phases`}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {isComplete
                ? new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                : "Date pending"}
            </p>
          </div>

          {!isComplete && (
            <div className="mt-3 flex items-center justify-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" aria-hidden />
              <span className="text-xs text-slate-500">Complete all 7 phases to unlock — $29</span>
            </div>
          )}

          {isComplete && (
            <button
              type="button"
              className="mt-4 px-6 py-2.5 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ backgroundColor: content.accentColor }}
              onClick={(e) => {
                e.stopPropagation();
                onPurchase();
              }}
            >
              Get My Certificate — $29
            </button>
          )}
        </div>
      </div>

      <div className="mt-3">
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${animatedPercent}%`,
              backgroundColor: content.accentColor,
              transition: "width 0.8s ease-out",
            }}
          />
        </div>
        <p className="text-xs text-slate-400 mt-1.5 text-center">
          {isComplete
            ? "Journey complete — get your certificate"
            : `${7 - phasesCompleted} phase${7 - phasesCompleted !== 1 ? "s" : ""} remaining`}
        </p>
      </div>
    </div>
  );
}

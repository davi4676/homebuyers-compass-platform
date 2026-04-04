'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, ChevronRight } from 'lucide-react'
import type { UserTier } from '@/lib/tiers'
import { TIER_DEFINITIONS, tierAtLeast } from '@/lib/tiers'
import type { UserSnapshot } from '@/lib/user-snapshot'
import TierBadge from '@/components/TierBadge'
import MindsetTag from './MindsetTag'
import DynamicRoadmap from './DynamicRoadmap'
import MoneyCard from './MoneyCard'
import LockedMoneyCard from './LockedMoneyCard'
import type { JourneyTab } from '@/lib/journey-nav-tabs'
import {
  NQ_GUIDED_PHASE_ORDERS,
  getNqGuidedFirstAccessibleIndexInPhase,
  isNqGuidedPhaseFullyComplete,
} from '@/lib/nq-guided-steps'
import {
  estimateMonthlySavingsFromSketchTuning,
  getPhaseMoneyBlueprint,
  getPhaseMoneyOpportunities,
  isMoneyOppLockedForTier,
} from '@/lib/money-engine'
import { formatCurrency } from '@/lib/calculations'

const STEPS = 6

export type JourneyOnboardingMoneyEst = {
  savingsFoundSoFar: number
  fundsFoundSoFar: number
  altSolutionsIdentified: number
}

type JourneyOnboardingWizardProps = {
  userTier: UserTier
  effectiveTier: UserTier
  snapshot: UserSnapshot | null
  moneyEst: JourneyOnboardingMoneyEst
  displayPhaseOrder: number
  progressPct: number
  completedStepIndices: Set<number>
  canAccessIndex: (stepIndex: number) => boolean
  onPhaseSelect: (phaseOrder: number) => void
  goTab: (t: JourneyTab) => void
  onComplete: () => void
  reduceMotion?: boolean
}

export default function JourneyOnboardingWizard({
  userTier,
  effectiveTier,
  snapshot,
  moneyEst,
  displayPhaseOrder,
  progressPct,
  completedStepIndices,
  canAccessIndex,
  onPhaseSelect,
  goTab,
  onComplete,
  reduceMotion = false,
}: JourneyOnboardingWizardProps) {
  const [step, setStep] = useState(1)
  const def = TIER_DEFINITIONS[effectiveTier]

  const phase1Triple = useMemo(() => getPhaseMoneyOpportunities(1, effectiveTier), [effectiveTier])
  const phase1Blueprint = useMemo(() => getPhaseMoneyBlueprint(1), [])
  const phase2Blueprint = useMemo(() => getPhaseMoneyBlueprint(2), [])
  const sketchMonthlySavings = useMemo(() => estimateMonthlySavingsFromSketchTuning(snapshot), [snapshot])

  const phase2PreviewLocks = useMemo(() => {
    const rows: Array<'funding' | 'alternative'> = []
    if (isMoneyOppLockedForTier(phase2Blueprint.funding, userTier) && phase2Blueprint.funding.minTier) {
      rows.push('funding')
    }
    if (isMoneyOppLockedForTier(phase2Blueprint.alternative, userTier) && phase2Blueprint.alternative.minTier) {
      rows.push('alternative')
    }
    return rows
  }, [phase2Blueprint.alternative, phase2Blueprint.funding, userTier])

  const welcomeCopy = (() => {
    const m = def.mindset
    if (effectiveTier === 'foundations') {
      return `${m.replace(/\.$/, '')} — we will help you build clarity step by step.`
    }
    if (effectiveTier === 'momentum') {
      return `${m.replace(/\.$/, '')} — your full roadmap and weekly rhythm are ready.`
    }
    if (effectiveTier === 'navigator') {
      return `${m.replace(/\.$/, '')} — we will pair tools with expert-backed reviews.`
    }
    return `${m.replace(/\.$/, '')} — concierge support meets you where you are.`
  })()

  const phase1MoneyCards = (
    <>
      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {(['savings', 'funding', 'alternative'] as const).map((key) => {
          const opp =
            key === 'savings'
              ? phase1Triple.savings
              : key === 'funding'
                ? phase1Triple.funding
                : phase1Triple.alternative
          const bp =
            key === 'savings'
              ? phase1Blueprint.savings
              : key === 'funding'
                ? phase1Blueprint.funding
                : phase1Blueprint.alternative
          const locked = isMoneyOppLockedForTier(bp, effectiveTier) && bp.minTier
          if (locked) {
            return (
              <LockedMoneyCard
                key={key}
                title={bp.title}
                description={bp.description}
                category={key === 'funding' ? 'funds' : key === 'alternative' ? 'alternative' : 'savings'}
                lockedValue={bp.estimatedValue}
                requiredTier={bp.minTier!}
                nextTier={bp.minTier!}
                fundsHighlightForCopy={moneyEst.fundsFoundSoFar}
              />
            )
          }
          return (
            <MoneyCard
              key={key}
              title={opp.title}
              description={opp.description}
              category={key === 'funding' ? 'funds' : key === 'alternative' ? 'alternative' : 'savings'}
              estimatedValue={opp.estimatedValue}
              ctaLabel={key === 'funding' ? 'Browse Money Finder' : key === 'alternative' ? 'See strategies' : 'Open Budget Sketch'}
              onCta={() =>
                key === 'funding'
                  ? goTab('library')
                  : key === 'alternative'
                    ? goTab('learn')
                    : goTab('budget')
              }
            />
          )
        })}
      </div>
      {phase2PreviewLocks.length > 0 ? (
        <div className="mt-5 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Unlocked as you advance</p>
          <div className="grid gap-3 lg:grid-cols-2">
            {phase2PreviewLocks.map((k) => {
              const bp = k === 'funding' ? phase2Blueprint.funding : phase2Blueprint.alternative
              if (!bp.minTier) return null
              return (
                <LockedMoneyCard
                  key={k}
                  title={bp.title}
                  description={bp.description}
                  category={k === 'funding' ? 'funds' : 'alternative'}
                  lockedValue={bp.estimatedValue}
                  requiredTier={bp.minTier}
                  nextTier={bp.minTier}
                  fundsHighlightForCopy={moneyEst.fundsFoundSoFar}
                />
              )
            })}
          </div>
        </div>
      ) : null}
    </>
  )

  return (
    <div className="mb-8 overflow-hidden rounded-3xl border-2 border-teal-200/70 bg-gradient-to-br from-white via-teal-50/40 to-teal-50/30 p-5 shadow-xl shadow-teal-900/10 sm:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-teal-800/90">
          Welcome · step {step} of {STEPS}
        </p>
        <MindsetTag mindset={def.mindset} className="border-teal-100 bg-white/90" />
      </div>

      {step === 1 ? (
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <TierBadge tier={effectiveTier} className="max-w-md border-teal-100 bg-white/95" />
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Welcome to your NestQuest journey</h2>
          <p className="text-slate-700 sm:text-lg">{welcomeCopy}</p>
          <div className="rounded-2xl border border-emerald-200/70 bg-white/95 p-4 shadow-sm sm:p-5">
            <p className="text-sm font-bold text-slate-900">Three money pillars</p>
            <p className="mt-1 text-sm text-slate-600">
              NestQuest helps you <span className="font-semibold text-emerald-800">save money</span>,{' '}
              <span className="font-semibold text-teal-800">find money</span>, and{' '}
              <span className="font-semibold text-violet-800">unlock creative solutions</span> — without the noise.
            </p>
            <ul className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
              <li className="rounded-xl border border-emerald-100 bg-emerald-50/50 px-3 py-2">
                <span className="font-bold text-emerald-900">Save</span> — lower payments, fees, and lifetime cost.
              </li>
              <li className="rounded-xl border border-teal-100 bg-teal-50/50 px-3 py-2">
                <span className="font-bold text-teal-900">Find</span> — grants, credits, and programs you may qualify for.
              </li>
              <li className="rounded-xl border border-violet-100 bg-violet-50/50 px-3 py-2">
                <span className="font-bold text-violet-900">Unlock</span> — loan structures and strategies that fit your life.
              </li>
            </ul>
          </div>
        </motion.div>
      ) : null}

      {step === 2 ? (
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Your snapshot</h2>
          {snapshot ? (
            <ul className="grid gap-3 sm:grid-cols-3">
              <li className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm">
                <p className="text-xs font-bold uppercase text-slate-500">Readiness</p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">
                  {Math.round(snapshot.readiness.total)}
                  <span className="text-lg font-semibold text-slate-500">/100</span>
                </p>
              </li>
              <li className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm">
                <p className="text-xs font-bold uppercase text-slate-500">Savings snapshot</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  Down payment {snapshot.tokens.downPayment}
                </p>
              </li>
              <li className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm">
                <p className="text-xs font-bold uppercase text-slate-500">Max / target price</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {snapshot.tokens.targetHome ?? snapshot.tokens.realisticMax}
                </p>
              </li>
            </ul>
          ) : (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-white/80 p-4 text-slate-600">
              Run your savings snapshot from Results to populate this panel — you can still continue the tour.
            </p>
          )}
          <div className="rounded-2xl border border-teal-200/80 bg-gradient-to-r from-teal-50/80 to-white p-4 text-sm text-slate-800 shadow-sm">
            <p className="font-semibold text-teal-950">What your journey may surface (illustrative)</p>
            <ul className="mt-2 space-y-1.5">
              <li>
                You may uncover <span className="font-bold tabular-nums text-emerald-900">{formatCurrency(moneyEst.savingsFoundSoFar)}</span> in
                savings as you work the roadmap.
              </li>
              <li>
                You may qualify for <span className="font-bold tabular-nums text-teal-900">{formatCurrency(moneyEst.fundsFoundSoFar)}</span> in funding
                and assistance programs.
              </li>
              <li>
                You may unlock <span className="font-bold tabular-nums text-violet-900">{moneyEst.altSolutionsIdentified}</span> alternative
                solutions worth exploring.
              </li>
            </ul>
          </div>
          {!tierAtLeast(userTier, 'momentum') ? (
            <div className="rounded-2xl border border-amber-200/80 bg-amber-50/80 p-4 text-sm text-amber-950">
              <p className="font-semibold">Want the full 7-phase roadmap?</p>
              <p className="mt-1 text-amber-900/90">
                Momentum is for buyers who want clarity — structure, scripts, and weekly plans.
              </p>
              <Link
                href="/upgrade?source=onboarding-snapshot&tier=momentum"
                className="mt-2 inline-flex items-center gap-1 font-bold text-amber-900 underline underline-offset-2"
              >
                Explore Momentum
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          ) : null}
        </motion.div>
      ) : null}

      {step === 3 ? (
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Your phase</h2>
          <p className="text-slate-600">
            Phase {displayPhaseOrder} — here&apos;s how your seven-phase roadmap fits together.
          </p>
          <div className="rounded-2xl border border-slate-200/90 bg-white/90 p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-600">Phase 1 — money opportunities</p>
            <p className="mt-1 text-sm text-slate-600">
              Credit and timing saves, first-time grants, and purchase timing strategies.
            </p>
            {phase1MoneyCards}
          </div>
          <div className="h-2 w-full max-w-xl overflow-hidden rounded-full bg-slate-200/90">
            <div className="h-full rounded-full bg-gradient-to-r from-millennial-cta-primary to-teal-600" style={{ width: `${progressPct}%` }} />
          </div>
          {!tierAtLeast(userTier, 'momentum') ? (
            <p className="text-sm text-slate-600">
              Momentum is for buyers who want structure and momentum beyond Phase 2.
            </p>
          ) : null}
          <DynamicRoadmap
            phaseOrders={NQ_GUIDED_PHASE_ORDERS}
            effectiveTier={effectiveTier}
            currentPhaseOrder={displayPhaseOrder}
            canAccessPhase={(phaseOrder) =>
              getNqGuidedFirstAccessibleIndexInPhase(phaseOrder, canAccessIndex) !== null
            }
            onSelectPhase={onPhaseSelect}
            isPhaseComplete={(phaseOrder) => isNqGuidedPhaseFullyComplete(phaseOrder, completedStepIndices)}
          />
        </motion.div>
      ) : null}

      {step === 4 ? (
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Budget sketch</h2>
          <p className="text-slate-600">
            Stress-test your monthly payment on the Budget tab — every line stays editable against your snapshot.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-4">
              <p className="text-xs font-bold uppercase text-emerald-900">Savings impact</p>
              <p className="mt-1 text-sm text-slate-700">
                Typical tuning on the sketch surfaces around{' '}
                <span className="font-bold tabular-nums text-emerald-950">{formatCurrency(sketchMonthlySavings)}/mo</span> in headroom once
                optimized.
              </p>
            </div>
            <div className="rounded-2xl border border-teal-200/80 bg-teal-50/50 p-4">
              <p className="text-xs font-bold uppercase text-teal-900">Funding matches</p>
              <p className="mt-1 text-sm text-slate-700">
                We map programs to your income and location — on track for about{' '}
                <span className="font-bold tabular-nums text-teal-950">{formatCurrency(moneyEst.fundsFoundSoFar)}</span> in illustrative funding
                pathways.
              </p>
            </div>
            <div className="rounded-2xl border border-violet-200/80 bg-violet-50/50 p-4">
              <p className="text-xs font-bold uppercase text-violet-900">Alternative loan structures</p>
              <p className="mt-1 text-sm text-slate-700">
                Buydowns, ARMs, and seller concessions appear here as you tier up —{' '}
                <span className="font-semibold text-violet-950">{moneyEst.altSolutionsIdentified} options</span> in your library today.
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-teal-200/80 bg-white/90 p-4 shadow-sm">
            <p className="text-sm font-bold text-teal-900">Navigator+ unlocks a personalized affordability review.</p>
            <p className="mt-1 text-sm text-slate-600">&ldquo;{TIER_DEFINITIONS.navigator.mindset}&rdquo;</p>
          </div>
          <button
            type="button"
            onClick={() => goTab('budget')}
            className="inline-flex items-center gap-2 rounded-xl bg-[rgb(var(--navy))] px-5 py-2.5 text-sm font-bold text-white shadow-md"
          >
            Open Budget Sketch
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </motion.div>
      ) : null}

      {step === 5 ? (
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Learning path</h2>
          <ul className="space-y-2 text-sm text-slate-700">
            <li className="flex gap-2 rounded-xl border border-teal-100 bg-white/90 p-3">
              <span className="font-bold text-teal-700">Foundations</span>
              <span>Basic money lessons: payment building blocks, myth cards, and “Saves Money” highlights on Learn.</span>
            </li>
            <li className="flex gap-2 rounded-xl border border-teal-100 bg-white/90 p-3">
              <span className="font-bold text-teal-700">Momentum</span>
              <span>Full money library — Money Finder, savings strategies, and alternative solution filters.</span>
            </li>
            <li className="flex gap-2 rounded-xl border border-teal-100 bg-white/90 p-3">
              <span className="font-bold text-teal-700">Navigator+</span>
              <span>Premium strategies and partner-led Q&amp;A so no savings lever or program goes unnoticed.</span>
            </li>
          </ul>
          <button
            type="button"
            onClick={() => goTab('learn')}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-800 shadow-sm"
          >
            Go to Learn
          </button>
        </motion.div>
      ) : null}

      {step === 6 ? (
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">You&apos;re set</h2>
          <p className="text-slate-600">Upgrade anytime — your mindset evolves as you do.</p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                onComplete()
                goTab('overview')
              }}
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-millennial-cta-primary to-millennial-cta-secondary px-6 py-3 text-sm font-bold text-white shadow-md"
            >
              Start your journey
            </button>
            <Link
              href="/upgrade?source=onboarding-complete&tier=momentum"
              className="inline-flex items-center justify-center rounded-xl border-2 border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-800"
            >
              View upgrades
            </Link>
          </div>
          <button
            type="button"
            onClick={() => setStep(5)}
            className="mt-4 text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            Back
          </button>
        </motion.div>
      ) : null}

      {step < STEPS ? (
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-teal-100/90 pt-6">
          <button
            type="button"
            disabled={step <= 1}
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            className="text-sm font-semibold text-slate-600 disabled:opacity-40"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => setStep((s) => Math.min(STEPS, s + 1))}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-md"
          >
            Continue
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      ) : null}
    </div>
  )
}

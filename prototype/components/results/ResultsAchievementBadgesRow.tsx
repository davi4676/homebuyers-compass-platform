'use client'

import { useEffect, useState } from 'react'
import { AchievementBadge } from '@/components/AchievementBadge'
import {
  DPA_OPTIMIZER_VISITED_EVENT,
  hasVisitedDpaOptimizer,
} from '@/lib/dpa-optimizer-visit'

function readQuizPayload(): Record<string, unknown> | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('quizData')
    if (!raw) return null
    return JSON.parse(raw) as Record<string, unknown>
  } catch {
    return null
  }
}

function readPhaseStatus(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem('phaseStatus') || '{}') as Record<string, string>
  } catch {
    return {}
  }
}

function budgetSketchEarned(q: Record<string, unknown>): boolean {
  const income = Number(q.income)
  if (!income || income <= 0) return false
  const tt = String(q.transactionType || '')
  if (tt === 'first-time') {
    return q.downPayment != null || q.targetHomePrice != null
  }
  if (tt === 'repeat-buyer') {
    return q.expectedSalePrice != null || q.currentHomeValue != null
  }
  if (tt === 'refinance') {
    return q.currentHomeValue != null && q.currentMortgageBalance != null
  }
  return false
}

function dpaEarnedFromProfile(q: Record<string, unknown> | null, phases: Record<string, string>): boolean {
  if (phases.preparation === 'complete') return true
  if (!q) return false
  const tt = String(q.transactionType || '')
  const icp = String(q.icpType || '')
  if (tt === 'first-time' && icp !== 'move-up') return true
  if (icp === 'first-gen' || icp === 'solo') return true
  return false
}

export default function ResultsAchievementBadgesRow() {
  const [q, setQ] = useState<Record<string, unknown> | null>(null)
  const [phases, setPhases] = useState<Record<string, string>>({})
  const [dpaOptimizerVisited, setDpaOptimizerVisited] = useState(false)

  useEffect(() => {
    const sync = () => {
      setQ(readQuizPayload())
      setPhases(readPhaseStatus())
      setDpaOptimizerVisited(hasVisitedDpaOptimizer())
    }
    sync()
    window.addEventListener('storage', sync)
    window.addEventListener('focus', sync)
    window.addEventListener(DPA_OPTIMIZER_VISITED_EVENT, sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('focus', sync)
      window.removeEventListener(DPA_OPTIMIZER_VISITED_EVENT, sync)
    }
  }, [])

  if (!q && Object.keys(phases).length === 0 && !dpaOptimizerVisited) return null

  const creditEarned = Boolean(q?.creditScore)
  const budgetEarned = q ? budgetSketchEarned(q) : false
  const dpaFromProfile = dpaEarnedFromProfile(q, phases)
  const dpaDone = dpaFromProfile || dpaOptimizerVisited
  const preapprovalEarned = phases['pre-approval'] === 'complete'

  return (
    <section className="mb-6 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/80 p-4 shadow-sm sm:p-5">
      <p className="mb-3 text-center text-xs font-bold uppercase tracking-wide text-slate-500">Your progress badges</p>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
        <AchievementBadge
          label="Credit profile"
          earned={creditEarned}
          description={creditEarned ? 'Quiz captured your credit band.' : 'Finish the quiz to lock this in.'}
        />
        <AchievementBadge
          label="Budget sketch"
          earned={budgetEarned}
          description={budgetEarned ? 'Income and numbers are on file.' : 'Add income and home-price targets in the quiz.'}
        />
        <AchievementBadge
          label="DPA & programs path"
          earned={dpaDone}
          description={
            dpaDone
              ? dpaFromProfile
                ? 'You are on a path that includes down-payment help.'
                : 'You opened the Down Payment Optimizer — that counts toward your assistance-program progress.'
              : 'Visit the Down Payment Optimizer, or continue on a first-time path / preparation phase.'
          }
        />
        <AchievementBadge
          label="Pre-approval phase"
          earned={preapprovalEarned}
          description={
            preapprovalEarned ? 'Pre-approval phase marked complete on your roadmap.' : 'Complete the pre-approval phase in your journey.'
          }
        />
      </div>
    </section>
  )
}

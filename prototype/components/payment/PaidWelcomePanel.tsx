'use client'

import Link from 'next/link'
import { CheckCircle, ArrowRight } from 'lucide-react'
import type { UserTier } from '@/lib/tiers'
import { TIER_DEFINITIONS } from '@/lib/tiers'
import { journeyTabHref } from '@/lib/journey-nav-tabs'

type Props = {
  tier: UserTier
}

/**
 * Post-checkout: confirm tier + three clear starter steps (strategy recommendation #4).
 */
export default function PaidWelcomePanel({ tier }: Props) {
  const def = TIER_DEFINITIONS[tier]
  const journeyPhase = journeyTabHref('phase')
  const journeyBudget = journeyTabHref('budget')
  const journeyAssistance = journeyTabHref('assistance')

  const steps =
    tier === 'foundations'
      ? [
          { label: 'Open your customized journey', href: '/customized-journey' },
          { label: 'Run or refine your savings snapshot', href: '/quiz' },
          { label: 'Review programs in your state', href: journeyAssistance },
        ]
      : [
          { label: 'Continue your phase checklist', href: journeyPhase },
          { label: 'Update your Budget Sketch', href: journeyBudget },
          { label: 'Scan assistance & next steps', href: journeyAssistance },
        ]

  return (
    <div className="w-full max-w-lg rounded-2xl border border-emerald-200 bg-white p-6 shadow-lg sm:p-8">
      <div className="mb-4 flex justify-center">
        <CheckCircle className="h-16 w-16 text-emerald-600" aria-hidden />
      </div>
      <h2 className="text-center font-display text-2xl font-bold text-slate-900 sm:text-3xl">
        You&apos;re on {def.name}
      </h2>
      <p className="mt-2 text-center text-slate-600">
        Your plan access is active. Here&apos;s how to get value in the next few minutes:
      </p>
      <ol className="mt-6 space-y-3">
        {steps.map((s, i) => (
          <li key={s.href}>
            <Link
              href={s.href}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-left text-sm font-semibold text-slate-900 transition hover:border-teal-300 hover:bg-teal-50/50"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-600 text-sm font-bold text-white">
                {i + 1}
              </span>
              <span className="flex-1">{s.label}</span>
              <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
            </Link>
          </li>
        ))}
      </ol>
      <Link
        href="/customized-journey"
        className="mt-6 flex w-full items-center justify-center rounded-xl bg-teal-700 py-3.5 text-center text-sm font-bold text-white shadow-md hover:bg-teal-800"
      >
        Go to My Journey
      </Link>
    </div>
  )
}

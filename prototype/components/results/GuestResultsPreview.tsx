'use client'

import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Lightbulb, Lock } from 'lucide-react'
import { AuthModal } from '@/components/auth/AuthModal'
import { formatCurrency } from '@/lib/calculations'
import { SavingsOpportunitiesHeadline } from '@/components/results/SavingsOpportunitiesHeadline'
import ResultsReferralCard from '@/components/results/ResultsReferralCard'
import { SIGNUP_DISABLED } from '@/lib/auth-flags'

type SavingsOppRow = {
  title?: string
  savingsMin?: number
  savingsMax?: number
  difficulty?: string
}

const DPA_TOP_TWO = [
  { n: 'HFA First-Time Buyer', a: 12000 },
  { n: 'Local Workforce Grant', a: 8500 },
] as const

export default function GuestResultsPreview({ results }: { results: Record<string, unknown> }) {
  const searchParams = useSearchParams()
  const [authOpen, setAuthOpen] = useState(false)

  const savingsOpportunities = results.savingsOpportunities as unknown[] | undefined
  const savingsList: SavingsOppRow[] = Array.isArray(savingsOpportunities)
    ? (savingsOpportunities as SavingsOppRow[])
    : []
  const totalSavings = useMemo(
    () => savingsList.reduce((sum, opp) => sum + Number(opp.savingsMax || opp.savingsMin || 0), 0),
    [savingsList]
  )

  const redirectAfterAuth = useMemo(() => {
    const q = searchParams.toString()
    return q ? `/results?${q}` : '/results'
  }, [searchParams])

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl shadow-xl border border-gray-100 bg-white p-6 md:p-8"
        >
          <div className="mb-4 flex w-full items-center gap-2 rounded-xl bg-gradient-to-r from-brand-forest via-millennial-cta-primary to-teal-400 px-4 py-3 shadow-sm sm:py-3.5">
            <Lightbulb className="h-5 w-5 shrink-0 text-white/90" aria-hidden />
            <p className="text-base font-bold uppercase tracking-wide text-white">Protect your buying power now</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
            <div className="mb-2">
              <SavingsOpportunitiesHeadline firstName={null} count={savingsList.length} totalDollars={totalSavings} />
            </div>
            <ResultsReferralCard referralSlug="yourname" />

            <div className="mt-6 rounded-xl border border-amber-200/80 bg-amber-50/50 p-4 sm:p-6">
              <h3 className="text-lg font-bold text-[#1e293b]">Down Payment &amp; Closing Cost Assistance You Qualify For</h3>
              <p className="mt-1 text-sm text-slate-600">
                Illustrative programs matched to your profile — always verify with the program administrator.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {DPA_TOP_TWO.map((prog) => (
                  <div key={prog.n} className="rounded-lg border border-slate-200 bg-white p-3">
                    <p className="font-semibold text-slate-900">{prog.n}</p>
                    <p className="mt-1 text-lg font-bold text-emerald-700">{formatCurrency(prog.a)}</p>
                    <p className="text-xs text-slate-500">Income &amp; occupancy rules apply</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 sm:p-6">
              <h3 className="text-lg font-bold text-[#1e293b]">Your Personalized Savings Estimate</h3>
              <p className="mt-2 text-sm text-slate-600">
                Based on your quiz answers, here is the upper range of potential savings we modeled for you.
              </p>
              <p className="mt-4 text-3xl font-black tabular-nums text-emerald-700 sm:text-4xl">
                {totalSavings > 0 ? formatCurrency(totalSavings) : '—'}
              </p>
              <p className="mt-2 text-xs text-slate-500">Illustrative, not a guarantee. Full breakdown requires a free account.</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
        <div className="pointer-events-none select-none blur-sm opacity-60 px-6 py-10" aria-hidden>
          <div className="h-4 w-2/3 rounded bg-slate-300" />
          <div className="mt-4 h-24 rounded-lg bg-slate-200" />
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="h-20 rounded bg-slate-200" />
            <div className="h-20 rounded bg-slate-200" />
            <div className="h-20 rounded bg-slate-200" />
          </div>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/70 px-4 text-center backdrop-blur-[2px]">
          <Lock className="h-10 w-10 text-slate-500" aria-hidden />
          <button
            type="button"
            onClick={() => setAuthOpen(true)}
            className="max-w-lg rounded-lg bg-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-teal-700 sm:px-6 sm:text-base"
          >
            {SIGNUP_DISABLED
              ? 'Sign in to unlock your full savings plan, action timeline, and all matching programs.'
              : 'Create a free account to unlock your full savings plan, action timeline, and all matching programs.'}
          </button>
        </div>
      </div>

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        initialView={SIGNUP_DISABLED ? 'login' : 'signup'}
        redirectTo={redirectAfterAuth}
        usePostLoginRedirect={false}
        trigger="save-results"
      />
    </div>
  )
}

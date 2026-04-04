'use client'

import Link from 'next/link'
import { Users, ExternalLink, Landmark, MessagesSquare } from 'lucide-react'

const HUD_COUNSELORS_URL = 'https://www.hud.gov/findhousingcounselors'

/** Section 9 — First-Generation Buyer hub on results (cards + social proof). */
export default function FirstGenHub() {
  return (
    <div className="mt-6 rounded-2xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/95 to-white p-5 sm:p-6 shadow-sm">
      <h3 className="text-lg font-bold text-brand-forest dark:text-white">
        Resources Built for First-Generation Buyers
      </h3>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        Start with trusted, free help — then layer in programs matched to your state and income.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <Link
          href={HUD_COUNSELORS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand-sage hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
        >
          <Landmark className="h-8 w-8 text-brand-sage" aria-hidden />
          <span className="mt-3 font-semibold text-brand-forest dark:text-white">HUD-Approved Housing Counselors</span>
          <span className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            Free, certified help with budgets, credit, and home buying steps (HUD.gov).
          </span>
          <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-brand-terracotta">
            Find a counselor <ExternalLink className="h-3.5 w-3.5" />
          </span>
        </Link>

        <Link
          href="/down-payment-optimizer"
          className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand-sage hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
        >
          <Users className="h-8 w-8 text-brand-sage" aria-hidden />
          <span className="mt-3 font-semibold text-brand-forest dark:text-white">State First-Gen Programs</span>
          <span className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            Down payment &amp; closing-cost assistance matched to your profile — verify rules with each agency.
          </span>
          <span className="mt-3 text-sm font-bold text-brand-terracotta">Search programs →</span>
        </Link>

        <Link
          href="/customized-journey?tab=learn"
          className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand-sage hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
        >
          <MessagesSquare className="h-8 w-8 text-brand-sage" aria-hidden />
          <span className="mt-3 font-semibold text-brand-forest dark:text-white">Guided Q&amp;A &amp; tips</span>
          <span className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            Short explainers and checklists in your journey — same trusted voice as your roadmap.
          </span>
          <span className="mt-3 text-sm font-bold text-brand-terracotta">Open Learn tab →</span>
        </Link>
      </div>

      <p className="mt-5 text-center text-sm font-medium text-brand-forest dark:text-emerald-200/90">
        Join 2,400 first-gen buyers who found hidden funds on this platform
      </p>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import BackToMyJourneyLink from '@/components/BackToMyJourneyLink'

export default function QuizStarterPage() {
  return (
    <div className="app-page-shell">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/98 backdrop-blur shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <BackToMyJourneyLink className="font-medium" />
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-slate-600 hover:text-[rgb(var(--navy))] transition-colors font-medium"
            >
              <ArrowLeft size={20} />
              Back to home
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-center mb-2 text-[rgb(var(--navy))]">
          Answer a few questions — get your free guide
        </h1>
        <p className="text-slate-600 text-center mb-10">
          We&apos;ll ask about your situation and show you exactly what you need. Takes about 2 minutes.
        </p>

        <div className="space-y-6 mb-10">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
            <p className="text-base font-medium text-[rgb(var(--navy))] mb-3">1. What type of transaction are you planning?</p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/quiz?transactionType=first-time"
                className="px-5 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-700 hover:border-[rgb(var(--coral))] hover:bg-rose-50 hover:text-[rgb(var(--coral))] transition text-sm font-medium"
              >
                First-time buyer
              </Link>
              <Link
                href="/quiz?transactionType=repeat-buyer"
                className="px-5 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-700 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 transition text-sm font-medium"
              >
                Moving to a new home
              </Link>
              <Link
                href="/quiz?transactionType=refinance"
                className="px-5 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-700 hover:border-violet-500 hover:bg-violet-50 hover:text-violet-700 transition text-sm font-medium"
              >
                Refinance
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
            <p className="text-base font-medium text-[rgb(var(--navy))] mb-2">2. When are you planning to buy or refinance?</p>
            <p className="text-sm text-slate-500 mb-4">We&apos;ll ask this and more in the full assessment.</p>
            <Link
              href="/quiz?transactionType=first-time"
              className="inline-flex items-center gap-2 text-[rgb(var(--coral))] hover:underline font-semibold"
            >
              Start full assessment <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/quiz?transactionType=first-time"
            className="inline-block bg-[rgb(var(--coral))] hover:bg-[rgb(var(--coral-hover))] text-white px-10 py-4 rounded-xl text-lg font-bold transition shadow-lg"
          >
            Start free assessment
          </Link>
        </div>
      </main>
    </div>
  )
}

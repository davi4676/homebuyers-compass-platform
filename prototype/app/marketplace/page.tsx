import Link from 'next/link'
import { Clock, Bell, ArrowLeft } from 'lucide-react'
import BackToMyJourneyLink from '@/components/BackToMyJourneyLink'

export default function MarketplacePage() {
  return (
    <div className="app-page-shell flex flex-col items-center justify-center px-4 py-10">
      <div className="mb-6 w-full max-w-lg">
        <BackToMyJourneyLink className="font-semibold" />
      </div>
      <div className="max-w-lg w-full text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-lg shadow-slate-200/60 ring-1 ring-slate-200/80">
          <Clock className="h-10 w-10 text-[rgb(var(--navy))]" strokeWidth={1.5} />
        </div>

        <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Coming Soon
        </h1>
        <p className="mt-4 text-lg text-slate-600 leading-relaxed">
          The Closing Cost Marketplace is under construction. We&apos;re vetting and onboarding
          providers so you get verified, transparent quotes — not commission-driven referrals.
        </p>

        <div className="mt-8 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm text-left space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">What&apos;s coming</p>
          <ul className="space-y-2 text-sm text-slate-700">
            {[
              'Compare title insurance, inspection, and closing attorney fees side-by-side',
              'Verified provider ratings from real NestQuest buyers',
              'One-click quote requests — no cold calls',
              'Transparent pricing with no hidden add-ons',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/resources"
            className="inline-flex items-center gap-2 rounded-xl bg-[rgb(var(--navy))] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
          >
            <Bell className="h-4 w-4" />
            Browse resources in the meantime
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}

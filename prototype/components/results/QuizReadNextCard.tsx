'use client'

import Link from 'next/link'
import { ArrowRight, BookOpen } from 'lucide-react'
import { getQuizReadNext } from '@/lib/quiz-read-next'
import PlainEnglishText from '@/components/PlainEnglishText'

type QuizReadNextCardProps = {
  readiness: number | null
  creditScoreBand?: string | null
  hasDownPaymentGap?: boolean
  dtiHigh?: boolean
}

export default function QuizReadNextCard({
  readiness,
  creditScoreBand,
  hasDownPaymentGap,
  dtiHigh,
}: QuizReadNextCardProps) {
  const items = getQuizReadNext({ readiness, creditScoreBand, hasDownPaymentGap, dtiHigh })

  return (
    <section
      className="rounded-2xl border border-[var(--nq-ed-line-soft)] bg-white p-5 shadow-sm"
      aria-labelledby="read-next-heading"
    >
      <div className="flex items-start gap-3">
        <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-teal-700" aria-hidden />
        <div className="min-w-0 flex-1">
          <h2 id="read-next-heading" className="font-display text-base font-bold text-slate-900">
            Read next — picked for you
          </h2>
          <p className="mt-1 text-sm text-slate-600">Three guides based on your readiness snapshot.</p>
          <ul className="mt-4 space-y-3">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group block rounded-xl border border-slate-200 px-4 py-3 transition hover:border-teal-300 hover:bg-teal-50/40"
                >
                  <p className="font-semibold text-slate-900 group-hover:text-teal-900">
                    <PlainEnglishText text={item.title} />
                  </p>
                  <p className="mt-0.5 text-xs text-slate-600">
                    <PlainEnglishText text={item.reason} />
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-teal-700">
                    Open guide
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

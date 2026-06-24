'use client'

import Link from 'next/link'
import { BookOpen, ArrowRight } from 'lucide-react'
import { getWeeklyLesson } from '@/lib/weekly-lessons'
import PlainEnglishText from '@/components/PlainEnglishText'

export default function WeeklyLessonCard() {
  const lesson = getWeeklyLesson()

  return (
    <section
      className="rounded-[var(--radius)] border border-teal-200/90 bg-gradient-to-br from-teal-50/70 to-white p-4 shadow-sm"
      aria-labelledby="weekly-lesson-title"
    >
      <div className="flex gap-3">
        <BookOpen className="mt-0.5 h-6 w-6 shrink-0 text-teal-700" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-800">Lesson of the week</p>
          <h2 id="weekly-lesson-title" className="mt-1 font-display text-base font-bold text-[color:var(--text)]">
            <PlainEnglishText text={lesson.title} />
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-[color:var(--muted)]">
            <PlainEnglishText text={lesson.summary} />
          </p>
          <p className="mt-2 rounded-lg bg-amber-50/80 px-3 py-2 text-xs leading-relaxed text-amber-950">
            <PlainEnglishText text={lesson.tip} />
          </p>
          <Link
            href={lesson.href}
            className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-teal-800 hover:underline"
          >
            Read guide
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  )
}

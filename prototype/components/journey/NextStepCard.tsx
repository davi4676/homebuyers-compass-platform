'use client'

import { ArrowRight } from 'lucide-react'

type NextStepCardProps = {
  title?: string
  action: string
  onAction: () => void
}

export default function NextStepCard({ title = 'A simple step that moves you forward', action, onAction }: NextStepCardProps) {
  return (
    <section className="rounded-2xl border border-emerald-200/80 bg-emerald-50/60 p-4 shadow-sm sm:p-5">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">{title}</p>
      <button
        type="button"
        onClick={onAction}
        className="mt-2 inline-flex items-center gap-1 text-left text-sm font-semibold text-emerald-950 underline decoration-emerald-300 underline-offset-2 hover:text-emerald-800"
      >
        {action}
        <ArrowRight className="h-4 w-4" aria-hidden />
      </button>
    </section>
  )
}


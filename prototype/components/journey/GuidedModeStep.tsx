'use client'

import type { ReactNode } from 'react'

type GuidedModeStepProps = {
  doThisNext: string
  whyItMatters: string
  savesText: string
  unlocksText: string
  action?: ReactNode
}

export default function GuidedModeStep({
  doThisNext,
  whyItMatters,
  savesText,
  unlocksText,
  action,
}: GuidedModeStepProps) {
  return (
    <section className="rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/70 via-white to-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-700">Guided mode</p>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Do this next</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{doThisNext}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Here is why it matters</p>
          <p className="mt-1 text-sm text-slate-800">{whyItMatters}</p>
        </div>
        <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/70 p-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-800">Here is how much it saves</p>
          <p className="mt-1 text-sm font-semibold text-emerald-950">{savesText}</p>
        </div>
        <div className="rounded-xl border border-sky-200/80 bg-sky-50/70 p-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-sky-800">Here is what you unlock</p>
          <p className="mt-1 text-sm font-semibold text-sky-950">{unlocksText}</p>
        </div>
      </div>
      {action ? <div className="mt-3">{action}</div> : null}
    </section>
  )
}


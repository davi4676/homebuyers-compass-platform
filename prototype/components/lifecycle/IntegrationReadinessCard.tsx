'use client'

import {
  INTEGRATION_READINESS_ITEMS,
  getIntegrationStageLabel,
  type IntegrationStage,
} from '@/lib/integration-readiness'

function badgeClass(stage: IntegrationStage): string {
  if (stage === 'production') return 'border-emerald-200 bg-emerald-50 text-emerald-800'
  if (stage === 'adapter-ready') return 'border-teal-200 bg-teal-50 text-teal-800'
  return 'border-amber-200 bg-amber-50 text-amber-800'
}

export default function IntegrationReadinessCard() {
  return (
    <section className="rounded-xl border border-[#e7e5e4] bg-white p-6 shadow-sm" aria-label="Integration readiness">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#57534e]">Integration readiness</p>
      <p className="mt-2 text-sm text-[#57534e]">
        Lifecycle modules are structured for safe adapter-based integrations. Status below is environment readiness, not
        a claim of live partner connectivity.
      </p>
      <ul className="mt-4 space-y-2">
        {INTEGRATION_READINESS_ITEMS.map((item) => (
          <li key={item.domain} className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-[#1c1917]">{item.label}</p>
              <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${badgeClass(item.stage)}`}>
                {getIntegrationStageLabel(item.stage)}
              </span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-[#57534e]">{item.notes}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

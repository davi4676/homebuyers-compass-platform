'use client'

import Link from 'next/link'

type LifecyclePath = 'primary' | 'move-up' | 'refinance' | 'lifecycle'

const ITEMS: Array<{ id: LifecyclePath; label: string; href: string; secondary?: boolean }> = [
  { id: 'primary', label: 'First-time Mission Control', href: '/customized-journey' },
  { id: 'move-up', label: 'Move-up path', href: '/homebuyer/buy-sell-journey', secondary: true },
  { id: 'refinance', label: 'Refinance path', href: '/homebuyer/refinance-journey', secondary: true },
  { id: 'lifecycle', label: 'Lifecycle dashboard', href: '/lifecycle-dashboard', secondary: true },
]

export default function LifecycleEcosystemNav({ current }: { current: LifecyclePath }) {
  return (
    <section
      className="rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/70 p-4 shadow-sm dark:border-[color-mix(in_srgb,var(--app-text)_12%,transparent)] dark:from-[var(--app-surface)] dark:to-[var(--app-surface2)]"
      aria-label="NestQuest ecosystem navigation"
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-[var(--app-muted)]">
        NestQuest ecosystem
      </p>
      <p className="mt-1 text-sm text-slate-600 dark:text-[color-mix(in_srgb,var(--app-text)_72%,var(--app-muted))]">
        First-time Mission Control remains primary. Other paths stay available when your situation changes.
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {ITEMS.map((item) => {
          const active = item.id === current
          return (
            <Link
              key={item.id}
              href={item.href}
              className={[
                'flex items-center justify-between rounded-xl border px-3 py-2 text-sm transition',
                active
                  ? 'border-teal-300/80 bg-teal-50/80 text-[#1a2e25] shadow-sm ring-1 ring-teal-200/60 dark:border-[color-mix(in_srgb,var(--app-primary)_35%,transparent)] dark:bg-[color-mix(in_srgb,var(--app-primary-soft)_95%,transparent)] dark:text-[var(--app-text)] dark:ring-[color-mix(in_srgb,var(--app-primary)_25%,transparent)]'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-[color-mix(in_srgb,var(--app-text)_12%,transparent)] dark:bg-[var(--app-surface2)] dark:text-[var(--app-muted)] dark:hover:bg-[var(--app-surface3)]',
              ].join(' ')}
            >
              <span className="font-medium">{item.label}</span>
              {item.secondary && !active ? (
                <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-[var(--app-faint)]">
                  Secondary
                </span>
              ) : null}
            </Link>
          )
        })}
      </div>
    </section>
  )
}

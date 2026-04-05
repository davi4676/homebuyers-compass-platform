'use client'

import { useId, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Sparkles,
  Zap,
  Crown,
  Check,
  ChevronRight,
  Minus,
  ChevronDown,
  Compass,
} from 'lucide-react'
import Link from 'next/link'
import { TIER_DEFINITIONS, type UserTier, TIER_ORDER, formatTierPrice, tierAtLeast } from '@/lib/tiers'
import { getMoneyPowerLabel, getTierMoneyUnlockCopy } from '@/lib/money-engine'

interface TierPreviewSwitcherProps {
  currentTier: UserTier
  previewTier: UserTier
  onPreviewChange: (tier: UserTier) => void
}

const tierPillStyles: Record<
  UserTier,
  { card: string; ringActive: string; iconWrap: string }
> = {
  foundations: {
    card: 'border-slate-200 bg-white/95 hover:border-slate-300',
    ringActive: 'ring-2 ring-slate-400 ring-offset-2 ring-offset-white',
    iconWrap: 'bg-slate-100 text-slate-600',
  },
  momentum: {
    card: 'border-cyan-200/80 bg-gradient-to-b from-cyan-50/90 to-white hover:border-cyan-300',
    ringActive: 'ring-2 ring-cyan-500 ring-offset-2 ring-offset-white',
    iconWrap: 'bg-cyan-100 text-cyan-700',
  },
  navigator: {
    card: 'border-orange-200/80 bg-gradient-to-b from-orange-50/90 to-white hover:border-orange-300',
    ringActive: 'ring-2 ring-orange-400 ring-offset-2 ring-offset-white',
    iconWrap: 'bg-orange-100 text-orange-700',
  },
  navigator_plus: {
    card: 'border-amber-200/80 bg-gradient-to-b from-amber-50/90 to-white hover:border-amber-300',
    ringActive: 'ring-2 ring-amber-500 ring-offset-2 ring-offset-white',
    iconWrap: 'bg-gradient-to-br from-amber-100 to-yellow-100 text-amber-800',
  },
}

function tierHighlights(tier: UserTier): string[] {
  const def = TIER_DEFINITIONS[tier]
  return def.journeyHighlights.slice(0, 5)
}

const COMPARISON_ROWS: {
  label: string
  cell: (tier: UserTier) => string
}[] = [
  {
    label: 'Mindset',
    cell: (t) => TIER_DEFINITIONS[t].mindset,
  },
  {
    label: 'Money Power',
    cell: (t) => getMoneyPowerLabel(t),
  },
  {
    label: 'Service level',
    cell: (t) => TIER_DEFINITIONS[t].differentiators.serviceLevel,
  },
  {
    label: '7-phase roadmap',
    cell: (t) => (tierAtLeast(t, 'momentum') ? 'Full unlock' : 'Phases 1–2'),
  },
  {
    label: 'Scripts & checklists',
    cell: (t) => (tierAtLeast(t, 'momentum') ? 'Full library' : 'Limited'),
  },
  {
    label: 'Weekly action plan & nudges',
    cell: (t) => (tierAtLeast(t, 'momentum') ? 'Yes' : '—'),
  },
  {
    label: '1:1 onboarding & human finance review',
    cell: (t) => (tierAtLeast(t, 'navigator') ? 'Yes' : '—'),
  },
  {
    label: 'Human-assisted Q&A',
    cell: (t) => (tierAtLeast(t, 'navigator') ? 'Priority' : '—'),
  },
  {
    label: 'Concierge + unlimited Q&A',
    cell: (t) => (tierAtLeast(t, 'navigator_plus') ? 'Yes' : '—'),
  },
  {
    label: 'NQ & AI',
    cell: (t) => {
      const a = TIER_DEFINITIONS[t].features.aiAssistant
      if (!a.enabled) return '—'
      if (a.dailyMessageLimit === Infinity) return 'Unlimited'
      return `${a.dailyMessageLimit}/day`
    },
  },
  {
    label: 'Expert / phone',
    cell: (t) => (TIER_DEFINITIONS[t].features.support.phone ? 'Yes' : '—'),
  },
]

const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: 'Can I change plans later?',
    a: 'Yes. Start on Foundations at no cost and move to Momentum, Navigator+, or Concierge+ whenever you want — your journey saves between visits.',
  },
  {
    q: 'What if I only need one feature?',
    a: 'Tiers bundle the support most buyers need at each stage. If you outgrow Foundations, Momentum unlocks the full roadmap and scripts in one step.',
  },
  {
    q: 'Is my data used to pressure me to upgrade?',
    a: 'No. Upsells only appear when a feature could genuinely help with what you are doing right now — for example, deeper scripts after Phase 2 or a human finance review when you edit your budget.',
  },
]

function getTierIcon(tier: UserTier) {
  switch (tier) {
    case 'foundations':
      return <Sparkles className="h-5 w-5" strokeWidth={2} />
    case 'momentum':
      return <Zap className="h-5 w-5" strokeWidth={2} />
    case 'navigator':
      return <Compass className="h-5 w-5" strokeWidth={2} />
    case 'navigator_plus':
      return <Crown className="h-5 w-5" strokeWidth={2} />
  }
}

function FaqAccordion() {
  const baseId = useId()
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div className="space-y-2">
      {FAQ_ITEMS.map((item, i) => {
        const isOpen = open === i
        const panelId = `${baseId}-faq-${i}`
        return (
          <div
            key={item.q}
            className="overflow-hidden rounded-xl border border-slate-200/90 bg-white/90 shadow-sm"
          >
            <button
              type="button"
              id={`${panelId}-btn`}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-sm font-semibold text-slate-900 transition hover:bg-slate-50/80"
            >
              {item.q}
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                aria-hidden
              />
            </button>
            {isOpen ? (
              <div
                id={panelId}
                role="region"
                aria-labelledby={`${panelId}-btn`}
                className="border-t border-slate-100 px-4 pb-4 pt-2 text-sm leading-relaxed text-slate-600"
              >
                {item.a}
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

export default function TierPreviewSwitcher({
  currentTier,
  previewTier,
  onPreviewChange,
}: TierPreviewSwitcherProps) {
  const tiers = TIER_ORDER

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-12"
      aria-labelledby="tier-support-heading"
    >
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-br from-slate-50 via-white to-teal-50/50 p-5 shadow-lg shadow-slate-200/50 ring-1 ring-white/90 sm:p-8">
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-teal-200/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-teal-200/15 blur-3xl"
          aria-hidden
        />

        <header className="relative mb-8 max-w-3xl text-center sm:text-left">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">Plans</p>
          <h2
            id="tier-support-heading"
            className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl md:text-4xl"
          >
            Choose your support level
          </h2>
          <p className="mt-3 text-base leading-relaxed text-slate-600 sm:text-lg">
            Start free. Upgrade anytime.
          </p>
        </header>

        <div className="relative -mx-1">
          <p className="mb-3 text-center text-xs font-medium text-slate-500 sm:text-left">
            Select a plan to preview — all tiers shown below.
          </p>
          <div className="grid grid-cols-2 gap-2.5 pt-1 pb-1 min-[1100px]:grid-cols-4 min-[1100px]:gap-4">
            {tiers.map((tier) => {
              const tierDef = TIER_DEFINITIONS[tier]
              const isCurrentTier = currentTier === tier
              const isPreviewing = previewTier === tier
              const styles = tierPillStyles[tier]
              const highlights = tierHighlights(tier)

              return (
                <motion.div
                  key={tier}
                  role="group"
                  whileHover={{ y: -2 }}
                  className={`relative flex min-h-0 min-w-0 flex-col rounded-2xl border-2 p-3 text-left shadow-sm transition-all duration-200 sm:p-4 md:p-5 ${styles.card} ${
                    isPreviewing ? styles.ringActive : ''
                  }`}
                >
                  {tierDef.badge === 'most_popular' ? (
                    <span className="absolute -top-2 right-1.5 z-10 max-w-[calc(100%-0.5rem)] truncate rounded-full bg-cyan-600 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white shadow-md sm:-top-2.5 sm:right-2 sm:px-2 sm:text-[9px]">
                      Most Popular
                    </span>
                  ) : null}
                  {tierDef.badge === 'premium' ? (
                    <span className="absolute -top-2 right-1.5 z-10 rounded-full bg-amber-600 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white shadow-md sm:-top-2.5 sm:right-2 sm:px-2 sm:text-[9px]">
                      Premium
                    </span>
                  ) : null}
                  {isCurrentTier ? (
                    <span className="absolute -top-2 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-emerald-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white shadow-md shadow-emerald-900/20 sm:px-3 sm:text-[10px]">
                      Your plan
                    </span>
                  ) : null}

                  <div className="mb-2 flex items-start justify-between gap-1.5 pt-1 sm:mb-3 sm:gap-2">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ring-black/5 sm:h-11 sm:w-11 ${styles.iconWrap}`}
                    >
                      {getTierIcon(tier)}
                    </span>
                    {isPreviewing ? (
                      <span className="rounded-full bg-slate-900/90 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white sm:px-2 sm:text-[10px]">
                        Preview
                      </span>
                    ) : null}
                  </div>

                  <span className="text-sm font-bold leading-tight text-slate-900 sm:text-lg md:text-xl">{tierDef.name}</span>
                  <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500 sm:mt-1 sm:text-xs">
                    {tierDef.positioning}
                  </p>
                  <p className="mt-1 line-clamp-3 text-[10px] font-medium italic leading-snug text-slate-600 sm:line-clamp-none sm:text-xs">
                    Mindset: &ldquo;{tierDef.mindset}&rdquo;
                  </p>
                  <span className="mt-1.5 text-xs font-semibold text-slate-800 sm:mt-2 sm:text-sm">{formatTierPrice(tierDef)}</span>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-slate-600 sm:line-clamp-none sm:text-sm">{tierDef.microcopy}</p>

                  <ul className="mt-2 flex flex-col gap-1.5 border-t border-slate-100/90 pt-2 sm:mt-4 sm:gap-2 sm:pt-4" role="list">
                    {highlights.map((line) => (
                      <li key={line} className="flex gap-1.5 text-left text-[11px] leading-snug text-slate-700 sm:gap-2 sm:text-sm">
                        <Check
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 sm:h-4 sm:w-4"
                          strokeWidth={2.5}
                          aria-hidden
                        />
                        <span className="min-w-0 break-words">{line}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto flex flex-col gap-1.5 pt-3 sm:mt-4 sm:gap-2">
                    <button
                      type="button"
                      onClick={() => onPreviewChange(tier)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-center text-[10px] font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 sm:px-3 sm:py-2 sm:text-xs"
                    >
                      {isPreviewing ? 'Previewing' : 'Preview'}
                    </button>
                    <Link
                      href={`/upgrade?source=journey-upgrades&tier=${tier}`}
                      className="inline-flex w-full items-center justify-center rounded-xl bg-[rgb(var(--navy))] px-2 py-2 text-[11px] font-bold text-white shadow-md transition hover:opacity-95 sm:px-4 sm:py-2.5 sm:text-sm"
                    >
                      <span className="truncate">Choose {tierDef.name}</span>
                    </Link>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        <div className="relative mt-6 rounded-2xl border border-slate-200/90 bg-white/90 p-4 shadow-sm sm:p-6">
          <p className="text-sm font-bold text-slate-900">What this tier unlocks</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TIER_ORDER.map((tier) => {
              const u = getTierMoneyUnlockCopy(tier)
              const active = tier === currentTier
              return (
                <div
                  key={tier}
                  className={`rounded-xl border p-3 text-left text-sm ${
                    active ? 'border-emerald-300 bg-emerald-50/50' : 'border-slate-200 bg-slate-50/40'
                  }`}
                >
                  <p className="font-bold text-slate-900">{TIER_DEFINITIONS[tier].name}</p>
                  <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-slate-600">
                    <li>
                      <span className="font-semibold text-emerald-800">Savings:</span> {u.savings}
                    </li>
                    <li>
                      <span className="font-semibold text-teal-800">Funds:</span> {u.funds}
                    </li>
                    <li>
                      <span className="font-semibold text-violet-800">Alternatives:</span> {u.alternative}
                    </li>
                    <li>
                      <span className="font-semibold text-amber-800">Service:</span>{' '}
                      {TIER_DEFINITIONS[tier].differentiators.serviceLevel}
                    </li>
                  </ul>
                </div>
              )
            })}
          </div>
        </div>

        <div className="relative mt-4 overflow-hidden rounded-xl border border-slate-200/80 bg-white/80 shadow-inner">
          <p className="border-b border-slate-100 bg-slate-50/80 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-slate-600">
            Compare plans
          </p>
          <div className="max-h-[min(70vh,520px)] overflow-y-auto overflow-x-hidden">
            <table className="w-full min-w-0 table-fixed border-collapse text-xs sm:text-sm">
              <colgroup>
                <col className="w-[28%] min-[1100px]:w-[22%]" />
                {tiers.map((t) => (
                  <col key={t} className="w-[18%] min-[1100px]:w-[19.5%]" />
                ))}
              </colgroup>
              <thead className="sticky top-0 z-[2] shadow-sm">
                <tr className="border-b border-slate-200 bg-slate-50/95 backdrop-blur-sm">
                  <th
                    scope="col"
                    className="sticky left-0 z-[3] bg-slate-50/95 px-2 py-2.5 text-left font-semibold text-slate-700 sm:px-4 sm:py-3"
                  >
                    Feature
                  </th>
                  {tiers.map((tier) => {
                    const def = TIER_DEFINITIONS[tier]
                    const isYours = currentTier === tier
                    return (
                      <th
                        key={tier}
                        scope="col"
                        className={`px-1 py-2.5 text-center align-top font-bold leading-tight sm:px-2 sm:py-3 ${
                          isYours
                            ? 'bg-emerald-50/90 text-emerald-900 ring-1 ring-emerald-200/80'
                            : 'bg-slate-50/50 text-slate-800'
                        }`}
                      >
                        <span className="flex flex-col items-center gap-0.5 sm:gap-1">
                          <span className="break-words text-[10px] sm:text-sm">{def.name}</span>
                          {isYours ? (
                            <span className="rounded-full bg-emerald-600 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white sm:px-2 sm:text-[9px]">
                              Yours
                            </span>
                          ) : null}
                        </span>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.label} className="border-b border-slate-100 last:border-0">
                    <th
                      scope="row"
                      className="sticky left-0 z-[1] bg-white px-2 py-2 text-left font-medium text-slate-600 sm:px-4 sm:py-2.5"
                    >
                      <span className="break-words leading-snug">{row.label}</span>
                    </th>
                    {tiers.map((tier) => {
                      const v = row.cell(tier)
                      const isYours = currentTier === tier
                      const empty = v === '—'
                      return (
                        <td
                          key={`${row.label}-${tier}`}
                          className={`px-1 py-2 text-center align-top text-[10px] font-semibold sm:px-2 sm:py-2.5 sm:text-xs md:text-sm ${
                            isYours ? 'bg-emerald-50/40 text-emerald-950' : 'text-slate-800'
                          }`}
                        >
                          {empty ? (
                            <Minus className="mx-auto h-3.5 w-3.5 text-slate-300 sm:h-4 sm:w-4" aria-label="Not included" />
                          ) : row.label === 'Mindset' ? (
                            <span className="block break-words text-left font-normal italic leading-snug text-slate-700">
                              &ldquo;{v}&rdquo;
                            </span>
                          ) : (
                            <span className="break-words tabular-nums">{v}</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="relative mt-8">
          <h3 className="text-lg font-bold text-slate-900">FAQ</h3>
          <p className="mt-1 text-sm text-slate-600">Straight answers about how plans work.</p>
          <div className="mt-4">
            <FaqAccordion />
          </div>
        </div>

        {previewTier !== currentTier && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mt-6 rounded-xl border border-dashed border-teal-300/80 bg-teal-50/60 px-4 py-3.5 text-center text-base text-slate-700"
          >
            You&apos;re previewing{' '}
            <span className="font-bold text-slate-900">{TIER_DEFINITIONS[previewTier].name}</span>
            {' — '}
            your account is still{' '}
            <span className="font-semibold text-emerald-800">{TIER_DEFINITIONS[currentTier].name}</span>.
            <span className="mt-1 block text-sm text-slate-600">{TIER_DEFINITIONS[previewTier].microcopy}</span>
          </motion.div>
        )}

        <footer className="relative mt-8 flex flex-col items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="font-bold text-slate-900">Start with Foundations</p>
            <p className="text-sm text-slate-600">Upgrade later with one click.</p>
          </div>
          <Link
            href="/upgrade?source=tier-preview&tier=momentum"
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-millennial-cta-primary to-millennial-cta-secondary px-6 py-3 text-sm font-bold text-white shadow-md transition hover:opacity-95"
          >
            Compare upgrades
            <ChevronRight className="ml-1 h-4 w-4" aria-hidden />
          </Link>
        </footer>
      </div>
    </motion.section>
  )
}

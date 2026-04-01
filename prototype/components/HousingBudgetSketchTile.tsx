'use client'

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Info, RotateCcw } from 'lucide-react'
import type { QuizData } from '@/lib/calculations'
import {
  calculateAffordability,
  formatCurrency,
  getComfortMonthlyBudgetLines,
  type ComfortMonthlyBudgetLines,
} from '@/lib/calculations'
import { NATIONAL_TYPICAL_HOA_MONTHLY } from '@/lib/hoa-fallback'
import { loadQuizDataFromLocalStorage } from '@/lib/user-snapshot'
import type { UserSnapshot } from '@/lib/user-snapshot'

const STORAGE_KEY = 'nq_budget_sketch_v1'

const FALLBACK_QUIZ: QuizData = {
  income: 60_000,
  monthlyDebt: 0,
  downPayment: 20_000,
  city: 'your area',
  timeline: '6-months',
  creditScore: '650-700',
  agentStatus: 'not-yet',
  concern: 'hidden-costs',
}

type LineState = {
  principalAndInterest: number
  propertyTaxMonthly: number
  homeownersInsuranceMonthly: number
  pmiMonthly: number
  hoaMonthly: number
  maintenanceReserveMonthly: number
}

type StoredSketch = {
  basisKey: string
} & LineState

function roundMoney(n: number): number {
  return Math.max(0, Math.round(n))
}

function linesFromDefaults(d: ComfortMonthlyBudgetLines): LineState {
  return {
    principalAndInterest: roundMoney(d.principalAndInterest),
    propertyTaxMonthly: roundMoney(d.propertyTaxMonthly),
    homeownersInsuranceMonthly: roundMoney(d.homeownersInsuranceMonthly),
    pmiMonthly: roundMoney(d.pmiMonthly),
    hoaMonthly: roundMoney(d.hoaMonthly),
    maintenanceReserveMonthly: roundMoney(d.maintenanceReserveMonthly),
  }
}

function sumLines(l: LineState): number {
  return (
    l.principalAndInterest +
    l.propertyTaxMonthly +
    l.homeownersInsuranceMonthly +
    l.pmiMonthly +
    l.hoaMonthly +
    l.maintenanceReserveMonthly
  )
}

function makeBasisKey(price: number, down: number, rate: number, hoaGeoKey: string): string {
  return `${Math.round(price)}|${Math.round(down)}|${rate.toFixed(5)}|hoa:${hoaGeoKey}`
}

const ASSUMPTION_COPY: Record<keyof LineState, { shortLabel: string; detail: string }> = {
  principalAndInterest: {
    shortLabel: 'principal and interest',
    detail:
      'P&I is the standard 30-year fixed payment on the loan balance (home price in your snapshot minus your down payment), using the projected mortgage rate from current market data adjusted for your credit band—same basis as affordability.',
  },
  propertyTaxMonthly: {
    shortLabel: 'property taxes',
    detail:
      'Illustrative monthly bill using about 1.5% of home value per year. Your county millage rate may differ.',
  },
  homeownersInsuranceMonthly: {
    shortLabel: 'homeowners insurance',
    detail: 'Illustrative monthly cost using roughly 0.3% of home value per year. Quote yours for a firm number.',
  },
  pmiMonthly: {
    shortLabel: 'PMI',
    detail:
      'Often $0 at 20%+ down. If your lender quotes PMI with less down, edit this line to match their figure.',
  },
  hoaMonthly: {
    shortLabel: 'HOA / condo fees',
    detail:
      'Zero if you are not buying in an HOA or condo. When we have your ZIP, we may prefill from Census ACS table B25143 at ZCTA level (5-digit tabulation area—often matches your ZIP; edit to match your listing).',
  },
  maintenanceReserveMonthly: {
    shortLabel: 'maintenance reserve',
    detail:
      'Rule-of-thumb buffer: about 1% of home price per year, divided by 12, for repairs and upkeep—not a lender line item.',
  },
}

function AssumptionHint({ fieldKey }: { fieldKey: keyof LineState }) {
  const { shortLabel, detail } = ASSUMPTION_COPY[fieldKey]
  const tipId = useId()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  return (
    <span ref={wrapRef} className="relative inline-flex align-middle">
      <button
        type="button"
        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-sky-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-1"
        aria-expanded={open}
        aria-controls={tipId}
        aria-label={`Assumption for ${shortLabel}`}
        onClick={() => setOpen((v) => !v)}
      >
        <Info className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
      </button>
      {open ? (
        <span
          id={tipId}
          role="tooltip"
          className="absolute left-1/2 top-[calc(100%+6px)] z-30 w-[min(17.5rem,calc(100vw-2.5rem))] -translate-x-1/2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left text-xs leading-snug text-slate-700 shadow-lg sm:left-0 sm:translate-x-0"
        >
          {detail}
        </span>
      ) : null}
    </span>
  )
}

export default function HousingBudgetSketchTile({
  snapshot,
  onSketchDirtyChange,
  onSketchMonthlyCompare,
}: {
  snapshot: UserSnapshot | null
  /** True when any line differs from snapshot defaults (drives “Updated” in journey header). */
  onSketchDirtyChange?: (dirty: boolean) => void
  /** Current sketch monthly total vs snapshot baseline (for savings impact UI). */
  onSketchMonthlyCompare?: (sketchMonthlyTotal: number, baselineMonthlyTotal: number) => void
}) {
  const [clientQuiz, setClientQuiz] = useState<QuizData | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    setClientQuiz(loadQuizDataFromLocalStorage())
  }, [])

  const quiz = snapshot?.quiz ?? clientQuiz ?? FALLBACK_QUIZ
  const affordability = snapshot?.affordability ?? calculateAffordability(quiz)

  const defaults = useMemo(
    () => getComfortMonthlyBudgetLines(quiz, affordability),
    [quiz, affordability]
  )

  const [acsHoaPrefill, setAcsHoaPrefill] = useState<{
    median: number
    geoKey: string
  } | null>(null)
  const [hoaAcsHint, setHoaAcsHint] = useState<string | null>(null)

  const zipForHoa =
    (quiz.zipCode && /^\d{5}$/.test(quiz.zipCode.trim()) ? quiz.zipCode.trim() : null) ??
    (/^\d{5}$/.test((quiz.city ?? '').trim()) ? quiz.city.trim() : null)

  const hasNamedCity = useMemo(() => {
    const c = (quiz.city ?? '').trim()
    if (c.length < 2) return false
    if (/^\d{5}$/.test(c)) return false
    if (/^your area$/i.test(c)) return false
    return true
  }, [quiz.city])

  useEffect(() => {
    if (!zipForHoa && hasNamedCity) {
      const citySlug = quiz.city
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '')
        .slice(0, 64)
      setAcsHoaPrefill({
        median: NATIONAL_TYPICAL_HOA_MONTHLY,
        geoKey: `fallback-national-metro:${citySlug || 'city'}`,
      })
      setHoaAcsHint(
        `You chose a metro (${quiz.city.trim()}) without a ZIP—HOA prefilled with the national typical median among payers (${formatCurrency(NATIONAL_TYPICAL_HOA_MONTHLY)}/mo). Adjust for your listing.`
      )
      return
    }

    if (!zipForHoa) {
      setAcsHoaPrefill(null)
      setHoaAcsHint(null)
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const r = await fetch(`/api/census/hoa-monthly?zip=${encodeURIComponent(zipForHoa)}`)
        const j = (await r.json()) as {
          success?: boolean
          fallback?: boolean
          geography?: { kind?: string; zcta5?: string; stateFips?: string; countyFips?: string }
          medians?: { total?: number | null }
          zipToCounty?: { countyName?: string | null; zip?: string }
        }
        if (cancelled) return
        const m = j.medians?.total
        const okMedian = m != null && Number.isFinite(m) && m >= 0
        if (!j.success || !okMedian) {
          setAcsHoaPrefill(null)
          setHoaAcsHint(null)
          return
        }
        const fb = j.fallback === true
        const g = j.geography
        if (g?.kind === 'zcta' && g.zcta5) {
          setAcsHoaPrefill({
            median: Math.round(m),
            geoKey: fb ? `fallback:zcta:${g.zcta5}` : `zcta:${g.zcta5}`,
          })
          setHoaAcsHint(
            fb
              ? `HOA prefilled with national typical median among payers (${formatCurrency(Math.round(m))}/mo) until ZCTA table B25143 is in the Census API. Adjust for your listing.`
              : `HOA line prefilled from ACS median for ZCTA ${g.zcta5} (ZIP tabulation area; may differ slightly from USPS ZIP boundaries). Adjust for your listing.`
          )
        } else if (g?.kind === 'county' && g.stateFips && g.countyFips) {
          setAcsHoaPrefill({
            median: Math.round(m),
            geoKey: fb ? `fallback:${g.stateFips}|${g.countyFips}` : `${g.stateFips}|${g.countyFips}`,
          })
          setHoaAcsHint(
            fb
              ? `HOA prefilled with national typical median (${formatCurrency(Math.round(m))}/mo) until county-level B25143 is available. Adjust for your listing.`
              : `HOA line uses your county’s ACS median (${j.zipToCounty?.countyName?.trim() || 'see Census'}). Adjust for your specific listing.`
          )
        } else {
          setAcsHoaPrefill({
            median: Math.round(m),
            geoKey: 'fallback-national',
          })
          setHoaAcsHint(
            `HOA prefilled with national typical median (${formatCurrency(Math.round(m))}/mo). Adjust for your listing.`
          )
        }
      } catch {
        if (!cancelled) {
          setAcsHoaPrefill(null)
          setHoaAcsHint(null)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [zipForHoa, hasNamedCity, quiz.city])

  const defaultsWithAcsHoa = useMemo((): ComfortMonthlyBudgetLines => {
    if (acsHoaPrefill == null) return defaults
    return {
      ...defaults,
      hoaMonthly: acsHoaPrefill.median,
    }
  }, [defaults, acsHoaPrefill])

  const basisKey = useMemo(
    () =>
      makeBasisKey(
        defaults.homePriceBasis,
        quiz.downPayment,
        defaults.mortgageRateAnnual,
        acsHoaPrefill?.geoKey ?? 'no-acs-hoa'
      ),
    [defaults.homePriceBasis, quiz.downPayment, defaults.mortgageRateAnnual, acsHoaPrefill?.geoKey]
  )

  const defaultLines = useMemo(() => linesFromDefaults(defaultsWithAcsHoa), [defaultsWithAcsHoa])

  const [lines, setLines] = useState<LineState>(defaultLines)

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as StoredSketch
        if (parsed?.basisKey === basisKey && typeof parsed.principalAndInterest === 'number') {
          setLines({
            principalAndInterest: roundMoney(parsed.principalAndInterest),
            propertyTaxMonthly: roundMoney(parsed.propertyTaxMonthly),
            homeownersInsuranceMonthly: roundMoney(parsed.homeownersInsuranceMonthly),
            pmiMonthly: roundMoney(parsed.pmiMonthly),
            hoaMonthly: roundMoney(parsed.hoaMonthly),
            maintenanceReserveMonthly: roundMoney(parsed.maintenanceReserveMonthly),
          })
          return
        }
      }
    } catch {
      // ignore
    }
    setLines(defaultLines)
  }, [basisKey, defaultLines])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const payload: StoredSketch = { basisKey, ...lines }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch {
      // ignore
    }
  }, [basisKey, lines])

  const reset = useCallback(() => {
    setLines(defaultLines)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
  }, [defaultLines])

  const total = sumLines(lines)
  const reduceMotion = useReducedMotion() ?? false
  const [displayTotal, setDisplayTotal] = useState(total)

  useEffect(() => {
    if (reduceMotion) {
      setDisplayTotal(total)
      return
    }
    setDisplayTotal(0)
    let raf = 0
    const started = performance.now()
    const durationMs = 900
    const tick = (now: number) => {
      const t = Math.min(1, (now - started) / durationMs)
      const eased = 1 - (1 - t) ** 3
      setDisplayTotal(Math.round(eased * total))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [total, reduceMotion])

  const isDirty = useMemo(() => {
    const keys: (keyof LineState)[] = [
      'principalAndInterest',
      'propertyTaxMonthly',
      'homeownersInsuranceMonthly',
      'pmiMonthly',
      'hoaMonthly',
      'maintenanceReserveMonthly',
    ]
    return keys.some((k) => lines[k] !== defaultLines[k])
  }, [lines, defaultLines])

  useEffect(() => {
    onSketchDirtyChange?.(isDirty)
  }, [isDirty, onSketchDirtyChange])

  const baselineTotal = sumLines(defaultLines)
  useEffect(() => {
    onSketchMonthlyCompare?.(total, baselineTotal)
  }, [total, baselineTotal, onSketchMonthlyCompare])

  const row = (id: keyof LineState, label: string) => {
    const edited = lines[id] !== defaultLines[id]
    return (
      <div className="space-y-1.5">
        <div className="flex items-center gap-1">
          <label htmlFor={`budget-${id}`} className="text-sm font-semibold text-slate-800">
            {label}
          </label>
          <AssumptionHint fieldKey={id} />
        </div>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
            $
          </span>
          <input
            id={`budget-${id}`}
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            value={lines[id]}
            onChange={(e) => {
              const v = Number(e.target.value)
              setLines((prev) => ({
                ...prev,
                [id]: Number.isFinite(v) ? Math.max(0, Math.round(v)) : 0,
              }))
            }}
            className={`w-full rounded-lg border py-2 pl-7 pr-2 text-right text-base font-semibold text-slate-900 shadow-inner outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-300/50 ${
              edited
                ? 'border-amber-300/90 bg-amber-50/50 ring-2 ring-amber-200/70'
                : 'border-slate-200 bg-white ring-sky-200'
            }`}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="relative mt-5 rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/90 via-white to-sky-50/40 p-4 shadow-md ring-1 ring-emerald-100/60 sm:p-5">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-emerald-900">Monthly budget sketch</h3>
          <p className="mt-1 text-sm leading-snug text-slate-600">
            {(quiz.targetHomePrice ?? 0) > 0 ? 'Target home (snapshot)' : 'Comfortable max (snapshot)'}{' '}
            <strong className="font-semibold text-slate-800">
              {formatCurrency(Math.round(defaults.homePriceBasis))}
            </strong>
            {' — '}
            <span className="text-slate-500">Info icons explain each line.</span>
          </p>
          {hoaAcsHint ? (
            <p className="mt-1 text-xs leading-snug text-slate-500">{hoaAcsHint}</p>
          ) : null}
        </div>
        <button
          id="nq-budget-sketch-reset"
          type="button"
          onClick={reset}
          className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          Reset to snapshot
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-100 bg-white/90 shadow-sm">
        <div className="max-h-[min(52vh,26rem)] overflow-y-auto overscroll-contain md:max-h-[min(60vh,30rem)]">
          <div className="grid grid-cols-1 gap-4 p-3 sm:p-4 md:grid-cols-2 md:gap-x-8 md:gap-y-4">
            {row('principalAndInterest', 'Principal & interest')}
            {row('propertyTaxMonthly', 'Property taxes')}
            {row('homeownersInsuranceMonthly', 'Homeowners insurance')}
            {row('pmiMonthly', 'PMI')}
            {row('hoaMonthly', 'HOA / condo fees')}
            {row('maintenanceReserveMonthly', 'Maintenance reserve')}
          </div>
          <div className="sticky bottom-0 z-10 border-t-2 border-emerald-300/50 bg-gradient-to-r from-emerald-800 via-[rgb(var(--navy))] to-teal-800 px-4 py-4 text-white shadow-[0_-6px_24px_rgba(15,23,42,0.18)] sm:flex sm:items-end sm:justify-between sm:gap-4 sm:px-5 sm:py-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-100/95 sm:text-sm">
                Total monthly housing
              </span>
            </div>
            <motion.span
              key={displayTotal}
              className="mt-2 block text-3xl font-black tabular-nums tracking-tight sm:mt-0 sm:text-4xl"
              initial={reduceMotion ? false : { scale: 1 }}
              animate={reduceMotion ? {} : { scale: [1, 1.06, 1] }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            >
              {formatCurrency(displayTotal)}
            </motion.span>
          </div>
        </div>
      </div>
    </div>
  )
}
